const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDatabase, run, get, all } = require('./database');
const googleSync = require('./googleSync');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper to extract business name from headers
function getBusinessName(req) {
  return req.headers['x-business-name'] || 'Cabang Menteng';
}

// Background sync wrapper to prevent blocking API responses
function triggerBackgroundSync(businessName) {
  if (googleSync.isSyncEnabled()) {
    console.log(`Queuing background sync to Google Sheets for: "${businessName}"...`);
    triggerSheetsSync(businessName).catch(err => {
      console.error('Failed to sync to Google Sheets:', err.message);
    });
  }
}

// Full sync logic
async function triggerSheetsSync(businessName) {
  try {
    const spreadsheetId = await googleSync.getOrCreateSpreadsheet(businessName);
    if (!spreadsheetId) {
      console.log('Skipping sync: No spreadsheet found or created.');
      return;
    }

    // Fetch datasets from SQLite
    const productsData = await all('SELECT * FROM products');
    const stockItemsData = await all('SELECT * FROM stock_items');
    const stockMutationsData = await all('SELECT * FROM stock_mutations ORDER BY date DESC, id DESC');
    const customersData = await all('SELECT * FROM customers');
    const bookingsData = await all('SELECT * FROM bookings ORDER BY date DESC, time DESC');
    const transactionsData = await all('SELECT * FROM transactions ORDER BY date DESC, time DESC');

    // Aggregate Dashboard Metrics
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStats = await get(`
      SELECT 
        COALESCE(SUM(total), 0) as todayRevenue,
        COUNT(*) as todayTransactions
      FROM transactions 
      WHERE date = ? AND status = 'completed'
    `, [todayStr]);

    const totalVal = await get(`
      SELECT 
        (SELECT COALESCE(SUM(stock * cost), 0) FROM products WHERE type = 'PHYSICAL') +
        (SELECT COALESCE(SUM(stock * cost), 0) FROM stock_items WHERE category = 'Bahan Baku') as val
    `);

    const dashboardRows = [
      { metric: 'Today Revenue', value: todayStats.todayRevenue },
      { metric: 'Today Transactions', value: todayStats.todayTransactions },
      { metric: 'Average Order Value', value: todayStats.todayTransactions > 0 ? Math.round(todayStats.todayRevenue / todayStats.todayTransactions) : 0 },
      { metric: 'Inventory Value', value: totalVal.val },
    ];

    // Sync all tabs
    await googleSync.syncTableToSheet(spreadsheetId, 'Dashboard', dashboardRows, ['Metric', 'Value']);
    await googleSync.syncTableToSheet(spreadsheetId, 'Products', productsData, ['ID', 'SKU', 'Name', 'Category', 'Price', 'Cost', 'Stock', 'Type', 'Active']);
    await googleSync.syncTableToSheet(spreadsheetId, 'Inventory', stockItemsData, ['ID', 'SKU', 'Name', 'Category', 'Stock', 'Safety Stock', 'Unit', 'Cost', 'Last Opname', 'Status']);
    await googleSync.syncTableToSheet(spreadsheetId, 'Stock Mutations', stockMutationsData, ['ID', 'Date', 'Product', 'Type', 'From', 'To', 'Qty', 'Unit', 'Status']);
    await googleSync.syncTableToSheet(spreadsheetId, 'Customers', customersData, ['ID', 'Name', 'Phone', 'Email', 'Tier', 'Points', 'Total Spent', 'Visits']);
    await googleSync.syncTableToSheet(spreadsheetId, 'Bookings', bookingsData, ['ID', 'Customer Name', 'Phone', 'Service Name', 'Time', 'Date', 'Status', 'Staff', 'Price', 'Industry']);
    await googleSync.syncTableToSheet(spreadsheetId, 'Transactions', transactionsData, ['ID', 'Time', 'Date', 'Customer', 'Items Count', 'Total', 'Method', 'Status']);
    
    console.log(`SUCCESS: Google Sheets Sync completed for "${businessName}"`);
  } catch (error) {
    console.error('Error in triggerSheetsSync:', error.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   REST API ENDPOINTS
   ═══════════════════════════════════════════════════════════════ */

// 1. Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Core Metrics
    const todayStats = await get(`
      SELECT 
        COALESCE(SUM(total), 0) as todayRevenue,
        COUNT(*) as todayTransactions
      FROM transactions 
      WHERE date = ? AND status = 'completed'
    `, [todayStr]);

    const totalVal = await get(`
      SELECT 
        (SELECT COALESCE(SUM(stock * cost), 0) FROM products WHERE type = 'PHYSICAL') +
        (SELECT COALESCE(SUM(stock * cost), 0) FROM stock_items WHERE category = 'Bahan Baku') as val
    `);

    const todayRevenue = todayStats.todayRevenue;
    const todayTransactions = todayStats.todayTransactions;
    const avgOrderValue = todayTransactions > 0 ? Math.round(todayRevenue / todayTransactions) : 0;
    const inventoryValue = totalVal.val;

    // Last 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const revenueChartData = [];
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (const dateStr of last7Days) {
      const row = await get(`
        SELECT 
          COALESCE(SUM(total), 0) as revenue,
          (
            SELECT COALESCE(SUM(ti.qty * ti.cost), 0) 
            FROM transaction_items ti
            JOIN transactions t ON ti.transaction_id = t.id
            WHERE t.date = ? AND t.status = 'completed'
          ) as cost
        FROM transactions 
        WHERE date = ? AND status = 'completed'
      `, [dateStr, dateStr]);

      const dateObj = new Date(dateStr);
      revenueChartData.push({
        name: days[dateObj.getDay()],
        revenue: row.revenue || 0,
        cost: row.cost || Math.round((row.revenue || 0) * 0.4)
      });
    }

    // Payment splits
    const rawPayments = await all(`
      SELECT method as name, COUNT(*) as count
      FROM transactions
      WHERE status = 'completed'
      GROUP BY method
    `);
    const totalPaymentsCount = rawPayments.reduce((s, p) => s + p.count, 0);
    const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
    const paymentMixData = rawPayments.map((p, idx) => ({
      name: p.name,
      value: totalPaymentsCount > 0 ? Math.round((p.count / totalPaymentsCount) * 100) : 0,
      fill: colors[idx % colors.length]
    }));

    // If empty, add placeholder Mix data
    if (paymentMixData.length === 0) {
      paymentMixData.push(
        { name: 'QRIS', value: 40, fill: '#818cf8' },
        { name: 'Tunai', value: 30, fill: '#34d399' },
        { name: 'Debit', value: 20, fill: '#fbbf24' },
        { name: 'E-Wallet', value: 10, fill: '#f87171' }
      );
    }

    // Top products
    const topProducts = await all(`
      SELECT 
        ti.product_id as id,
        ti.name,
        SUM(ti.qty) as sold,
        SUM(ti.qty * ti.price) as revenue,
        'up' as trend
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'completed'
      GROUP BY ti.product_id, ti.name
      ORDER BY sold DESC
      LIMIT 5
    `);

    // Understock Alerts
    const stockAlerts = await all(`
      SELECT id, name as product, stock as currentStock, safetyStock, unit, status as severity
      FROM stock_items
      WHERE status = 'critical' OR status = 'warning'
      LIMIT 5
    `);

    res.json({
      stats: {
        todayRevenue,
        todayTransactions,
        avgOrderValue,
        inventoryValue,
        revenueChange: 14.5,
        transactionChange: 5.8,
        aovChange: 2.1,
        inventoryChange: -1.2
      },
      revenueChartData,
      paymentMixData,
      topProducts,
      stockAlerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Products Catalog & Categories
app.get('/api/products', async (req, res) => {
  try {
    const products = await all('SELECT * FROM products');
    const categories = await all('SELECT * FROM categories');
    
    // Map Active SQLite integer (1/0) back to Boolean
    const formattedProducts = products.map(p => ({
      ...p,
      active: p.active === 1
    }));

    res.json({ products: formattedProducts, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  const { sku, name, category, price, cost, stock, type } = req.body;
  const businessName = getBusinessName(req);

  try {
    const id = `p-${Date.now()}`;
    await run('INSERT INTO products (id, sku, name, category, price, cost, stock, type, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [id, sku, name, category, Number(price), Number(cost), type === 'PHYSICAL' ? Number(stock || 0) : 999, type]);

    // If it's a physical product, also register in inventory
    if (type === 'PHYSICAL') {
      const stockId = `s-${Date.now()}`;
      const safetyStock = Math.round(Number(stock || 0) * 0.3);
      await run('INSERT INTO stock_items (id, sku, name, category, stock, safetyStock, unit, cost, lastOpname, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [stockId, `PK-${sku}`, name, 'Packaging', Number(stock || 0), safetyStock, 'Pcs', Number(cost), new Date().toISOString().split('T')[0], 'normal']);
    }

    triggerBackgroundSync(businessName);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Stock & Inventory Items
app.get('/api/stock', async (req, res) => {
  try {
    const stockItems = await all('SELECT * FROM stock_items');
    res.json(stockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock opname adjustment
app.post('/api/stock/opname', async (req, res) => {
  const { itemId, actualStock } = req.body;
  const businessName = getBusinessName(req);

  try {
    const item = await get('SELECT * FROM stock_items WHERE id = ?', [itemId]);
    if (!item) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    const difference = Number(actualStock) - item.stock;
    const status = Number(actualStock) <= item.safetyStock ? 'critical' : 'normal';
    const dateStr = new Date().toISOString().split('T')[0];

    // Update stock item
    await run('UPDATE stock_items SET stock = ?, status = ?, lastOpname = ? WHERE id = ?',
      [Number(actualStock), status, dateStr, itemId]);

    // Log adjustment mutation
    const mutationId = `mut-${Date.now()}`;
    await run('INSERT INTO stock_mutations (id, date, product, type, from_location, to_location, qty, unit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [mutationId, dateStr, item.name, 'ADJUSTMENT', '-', 'Cabang Menteng', difference, item.unit, 'COMPLETED']);

    triggerBackgroundSync(businessName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Mutations Ledger
app.get('/api/stock/mutations', async (req, res) => {
  try {
    const mutations = await all(`
      SELECT 
        id, date, product, type, 
        from_location AS 'from', 
        to_location AS 'to', 
        qty, unit, status 
      FROM stock_mutations 
      ORDER BY date DESC, id DESC
    `);
    res.json(mutations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. CRM Customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await all('SELECT * FROM customers');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Customer
app.post('/api/customers', async (req, res) => {
  const { name, phone, email } = req.body;
  const businessName = getBusinessName(req);

  try {
    const id = `c-${Date.now()}`;
    await run('INSERT INTO customers (id, name, phone, email, tier, points, totalSpent, visits) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, phone, email || '-', 'REGULAR', 0, 0, 0]);

    triggerBackgroundSync(businessName);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await all('SELECT * FROM bookings ORDER BY date DESC, time DESC');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Booking
app.post('/api/bookings', async (req, res) => {
  const { customerName, phone, serviceName, time, date, staff, price, industry } = req.body;
  const businessName = getBusinessName(req);

  try {
    const id = `b-${Date.now()}`;
    await run('INSERT INTO bookings (id, customerName, phone, serviceName, time, date, status, staff, price, industry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, customerName, phone, serviceName, time, date || new Date().toISOString().split('T')[0], 'SCHEDULED', staff || 'Staff', Number(price || 0), industry || 'Barbershop/Salon']);

    triggerBackgroundSync(businessName);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Booking Status
app.put('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const businessName = getBusinessName(req);

  try {
    await run('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    triggerBackgroundSync(businessName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. F&B Tables
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await all('SELECT * FROM tables');
    const formattedTables = tables.map(t => ({
      ...t,
      cart: JSON.parse(t.cart)
    }));
    res.json(formattedTables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Table
app.put('/api/tables/:id', async (req, res) => {
  const { id } = req.params;
  const { status, customerId, cart } = req.body;

  try {
    await run('UPDATE tables SET status = ?, customerId = ?, cart = ? WHERE id = ?',
      [status, customerId || '', JSON.stringify(cart || []), id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear Table
app.delete('/api/tables/:id/clear', async (req, res) => {
  const { id } = req.params;

  try {
    await run('UPDATE tables SET status = ?, customerId = ?, cart = ? WHERE id = ?',
      ['EMPTY', '', '[]', id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Transactions Checkout & Recipe Decrement
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await all('SELECT * FROM transactions ORDER BY date DESC, time DESC');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process checkout / checkout sale transaction
app.post('/api/transactions', async (req, res) => {
  const { cart, paymentMethod, customerId, tableId } = req.body;
  const businessName = getBusinessName(req);

  const totalSale = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.cost * item.qty, 0);
  const tax = Math.round(totalSale * 0.11);
  const grandTotal = totalSale + tax + 5000; // Rp 5.000 service fee

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dateStr = now.toISOString().split('T')[0];

  const transactionId = `TRX-2026-0${Date.now().toString().slice(-4)}`;

  try {
    // Start atomic transaction
    await run('BEGIN TRANSACTION');

    // 1. Resolve Customer Name
    let customerName = 'Walk-in';
    if (customerId) {
      const customer = await get('SELECT name FROM customers WHERE id = ?', [customerId]);
      if (customer) customerName = customer.name;
    }

    // 2. Insert Transaction Record
    await run('INSERT INTO transactions (id, time, date, customer, items, total, method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, timeStr, dateStr, customerName, cart.reduce((acc, item) => acc + item.qty, 0), grandTotal, paymentMethod, 'completed']);

    // 3. Process Cart Items
    for (const item of cart) {
      // 3a. Insert Transaction Item details
      await run('INSERT INTO transaction_items (id, transaction_id, product_id, name, qty, price, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [`ti-${Date.now()}-${item.id}`, transactionId, item.id, item.name, item.qty, item.price, item.cost]);

      // 3b. Decrement Catalog Stock (if PHYSICAL and limited)
      const catalogProd = await get('SELECT stock FROM products WHERE id = ?', [item.id]);
      if (catalogProd && catalogProd.stock !== 999) {
        const nextStock = Math.max(0, catalogProd.stock - item.qty);
        await run('UPDATE products SET stock = ? WHERE id = ?', [nextStock, item.id]);
      }

      // 3c. Decrement Raw Materials in stockItems (Recipe Rules)
      // Category check
      if (item.category === 'cat-01' || item.category === 'cat-02') {
        // All drinks use a Cup
        const cup = await get('SELECT * FROM stock_items WHERE sku = "PK-CUP-01"');
        if (cup) {
          const nextStock = Math.max(0, cup.stock - item.qty);
          const status = nextStock <= cup.safetyStock ? 'critical' : 'normal';
          await run('UPDATE stock_items SET stock = ?, status = ? WHERE sku = "PK-CUP-01"', [nextStock, status]);
        }

        // Coffee drinks use Coffee beans (20g or 0.02kg per cup)
        if (item.category === 'cat-01') {
          const beans = await get('SELECT * FROM stock_items WHERE sku = "BB-KPA-01"');
          if (beans) {
            const nextStock = Number(Math.max(0, beans.stock - 0.02 * item.qty).toFixed(2));
            const status = nextStock <= beans.safetyStock ? 'critical' : 'normal';
            await run('UPDATE stock_items SET stock = ?, status = ? WHERE sku = "BB-KPA-01"', [nextStock, status]);
          }
        }

        // Milk check (Latte / Susu / Cappuccino) - 150ml or 0.15L per cup
        if (item.name.toLowerCase().includes('latte') || item.name.toLowerCase().includes('susu') || item.name.toLowerCase().includes('cappuccino')) {
          const milk = await get('SELECT * FROM stock_items WHERE sku = "BB-SSF-01"');
          if (milk) {
            const nextStock = Number(Math.max(0, milk.stock - 0.15 * item.qty).toFixed(1));
            const status = nextStock <= milk.safetyStock ? 'critical' : 'normal';
            await run('UPDATE stock_items SET stock = ?, status = ? WHERE sku = "BB-SSF-01"', [nextStock, status]);
          }
        }

        // Sugar check (Aren / Manis) - 50g or 0.05kg per cup
        if (item.name.toLowerCase().includes('aren') || item.name.toLowerCase().includes('manis')) {
          const sugar = await get('SELECT * FROM stock_items WHERE sku = "BB-GLP-01"');
          if (sugar) {
            const nextStock = Number(Math.max(0, sugar.stock - 0.05 * item.qty).toFixed(2));
            const status = nextStock <= sugar.safetyStock ? 'critical' : 'normal';
            await run('UPDATE stock_items SET stock = ?, status = ? WHERE sku = "BB-GLP-01"', [nextStock, status]);
          }
        }

        // Syrup check (Caramel / Vanila) - 50ml or 0.05L per cup
        if (item.name.toLowerCase().includes('caramel') || item.name.toLowerCase().includes('vanila')) {
          const syrup = await get('SELECT * FROM stock_items WHERE sku = "BB-SRV-01"');
          if (syrup) {
            const nextStock = Number(Math.max(0, syrup.stock - 0.05 * item.qty).toFixed(2));
            const status = nextStock <= syrup.safetyStock ? 'critical' : 'normal';
            await run('UPDATE stock_items SET stock = ?, status = ? WHERE sku = "BB-SRV-01"', [nextStock, status]);
          }
        }
      }

      // Direct material item check (e.g. Roti Cokelat, Tissue)
      const directItem = await get('SELECT * FROM stock_items WHERE LOWER(name) = ?', [item.name.toLowerCase()]);
      if (directItem) {
        const nextStock = Math.max(0, directItem.stock - item.qty);
        const status = nextStock <= directItem.safetyStock ? 'critical' : 'normal';
        await run('UPDATE stock_items SET stock = ?, status = ? WHERE id = ?', [nextStock, status, directItem.id]);
      }

      // Add Stock Mutation Record
      const mutationId = `mut-${Date.now()}-${item.id}`;
      const unit = item.category === 'cat-01' || item.category === 'cat-02' ? 'Cup' : 'Pcs';
      await run('INSERT INTO stock_mutations (id, date, product, type, from_location, to_location, qty, unit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mutationId, dateStr, item.name, 'SALE', 'Cabang Menteng', 'Penjualan', -item.qty, unit, 'COMPLETED']);
    }

    // 4. Update Customer loyalty points & statistics
    if (customerId) {
      const customer = await get('SELECT * FROM customers WHERE id = ?', [customerId]);
      if (customer) {
        const addedPoints = Math.round(grandTotal / 500); // 1 pt per Rp 500
        const nextPoints = customer.points + addedPoints;
        const nextSpent = customer.totalSpent + grandTotal;
        const nextVisits = customer.visits + 1;

        // Loyalty Tier promotion logic
        let nextTier = customer.tier;
        if (nextSpent >= 15000000) nextTier = 'GOLD';
        else if (nextSpent >= 5000000) nextTier = 'SILVER';

        await run('UPDATE customers SET points = ?, totalSpent = ?, visits = ?, tier = ? WHERE id = ?',
          [nextPoints, nextSpent, nextVisits, nextTier, customerId]);
      }
    }

    // 5. Clear table order session if this checkout is F&B dine-in
    if (tableId) {
      await run('UPDATE tables SET status = ?, customerId = ?, cart = ? WHERE id = ?',
        ['EMPTY', '', '[]', tableId]);
    }

    // Commit SQLite Transaction
    await run('COMMIT');

    // Trigger asynchronous Google Sheets sync
    triggerBackgroundSync(businessName);

    res.json({ success: true, transactionId });
  } catch (error) {
    // Rollback SQLite Transaction in case of errors
    await run('ROLLBACK');
    console.error('Checkout Transaction Error, rolled back:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get active industry setting
app.get('/api/settings', async (req, res) => {
  try {
    const row = await get('SELECT value FROM settings WHERE key = "active_industry"');
    res.json({ active_industry: row ? row.value : 'HYBRID' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update active industry setting
app.post('/api/settings', async (req, res) => {
  const { active_industry } = req.body;
  const businessName = getBusinessName(req);

  try {
    await run('INSERT OR REPLACE INTO settings (key, value) VALUES ("active_industry", ?)', [active_industry]);
    triggerBackgroundSync(businessName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// CMS API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Get CMS website & pages
app.get('/api/cms/website', async (req, res) => {
  try {
    let website = await get('SELECT * FROM cms_websites LIMIT 1');
    if (!website) {
      const id = 'web-' + Date.now();
      await run('INSERT INTO cms_websites (id, domain, theme_config) VALUES (?, ?, ?)',
        [id, 'menteng.steccapos.id', JSON.stringify({ color: '#818cf8', layout: 'modern' })]);
      website = await get('SELECT * FROM cms_websites LIMIT 1');
    }
    
    website.theme_config = JSON.parse(website.theme_config || '{}');

    const pages = await all('SELECT * FROM cms_pages WHERE website_id = ?', [website.id]);
    const formattedPages = pages.map(p => ({
      ...p,
      published: p.published === 1
    }));

    res.json({ website, pages: formattedPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update CMS website theme config
app.put('/api/cms/website/:id', async (req, res) => {
  const { id } = req.params;
  const { domain, theme_config } = req.body;
  const businessName = getBusinessName(req);

  try {
    await run('UPDATE cms_websites SET domain = ?, theme_config = ? WHERE id = ?',
      [domain, JSON.stringify(theme_config), id]);
    triggerBackgroundSync(businessName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create page
app.post('/api/cms/pages', async (req, res) => {
  const { website_id, slug, title, content, published } = req.body;
  const businessName = getBusinessName(req);

  try {
    const id = 'page-' + Date.now();
    await run('INSERT INTO cms_pages (id, website_id, slug, title, content, published) VALUES (?, ?, ?, ?, ?, ?)',
      [id, website_id, slug, title, content, published ? 1 : 0]);
    triggerBackgroundSync(businessName);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update page
app.put('/api/cms/pages/:id', async (req, res) => {
  const { id } = req.params;
  const { slug, title, content, published } = req.body;
  const businessName = getBusinessName(req);

  try {
    await run('UPDATE cms_pages SET slug = ?, title = ?, content = ?, published = ? WHERE id = ?',
      [slug, title, content, published ? 1 : 0, id]);
    triggerBackgroundSync(businessName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete page
app.delete('/api/cms/pages/:id', async (req, res) => {
  const { id } = req.params;
  const businessName = getBusinessName(req);

  try {
    await run('DELETE FROM cms_pages WHERE id = ?', [id]);
    triggerBackgroundSync(businessName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// EVENTS API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Get all events with tiers and registrations count
app.get('/api/events', async (req, res) => {
  try {
    const events = await all('SELECT * FROM event_details ORDER BY start_time ASC');
    const formattedEvents = [];

    for (const evt of events) {
      const tiers = await all('SELECT * FROM event_ticket_tiers WHERE event_id = ?', [evt.id]);
      
      const registrations = await all(`
        SELECT r.*, t.name as tier_name, t.price as ticket_price
        FROM event_registrations r
        JOIN event_ticket_tiers t ON r.ticket_tier_id = t.id
        WHERE t.event_id = ?
      `, [evt.id]);

      const formattedRegistrations = registrations.map(r => ({
        ...r,
        checked_in: r.checked_in === 1
      }));

      formattedEvents.push({
        ...evt,
        tiers,
        registrations: formattedRegistrations
      });
    }

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event
app.post('/api/events', async (req, res) => {
  const { title, description, start_time, end_time, location, ticket_tiers } = req.body;
  const businessName = getBusinessName(req);

  try {
    const eventId = 'evt-' + Date.now();
    
    await run('BEGIN TRANSACTION');
    
    await run('INSERT INTO event_details (id, title, description, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, title, description, start_time, end_time, location]);

    if (ticket_tiers && ticket_tiers.length > 0) {
      for (const tier of ticket_tiers) {
        const tierId = 'tier-' + Date.now() + '-' + Math.round(Math.random()*1000);
        await run('INSERT INTO event_ticket_tiers (id, event_id, name, price, quota, sold) VALUES (?, ?, ?, ?, ?, 0)',
          [tierId, eventId, tier.name, Number(tier.price || 0), Number(tier.quota || 0)]);
      }
    }

    await run('COMMIT');
    triggerBackgroundSync(businessName);
    res.json({ success: true, id: eventId });
  } catch (error) {
    await run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Book/Register tickets
app.post('/api/events/register', async (req, res) => {
  const { ticket_tier_id, customer_name, customer_email } = req.body;
  const businessName = getBusinessName(req);

  try {
    const tier = await get('SELECT * FROM event_ticket_tiers WHERE id = ?', [ticket_tier_id]);
    if (!tier) return res.status(404).json({ error: 'Ticket tier not found' });
    if (tier.sold >= tier.quota) return res.status(400).json({ error: 'Quota is full' });

    const registrationId = 'reg-' + Date.now();
    const ticketCode = 'TIX-' + Math.random().toString(36).substring(3, 9).toUpperCase();

    await run('BEGIN TRANSACTION');

    await run('INSERT INTO event_registrations (id, ticket_tier_id, customer_name, customer_email, ticket_code, payment_status, checked_in) VALUES (?, ?, ?, ?, ?, "PAID", 0)',
      [registrationId, ticket_tier_id, customer_name, customer_email, ticketCode]);

    await run('UPDATE event_ticket_tiers SET sold = sold + 1 WHERE id = ?', [ticket_tier_id]);

    await run('COMMIT');
    triggerBackgroundSync(businessName);
    res.json({ success: true, ticketCode, registrationId });
  } catch (error) {
    await run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Toggle ticket check-in status
app.put('/api/events/registrations/:id/checkin', async (req, res) => {
  const { id } = req.params;
  const { checked_in } = req.body;
  const businessName = getBusinessName(req);

  try {
    const checkinTime = checked_in ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null;
    await run('UPDATE event_registrations SET checked_in = ?, checked_in_time = ? WHERE id = ?',
      [checked_in ? 1 : 0, checkinTime, id]);
    
    triggerBackgroundSync(businessName);
    res.json({ success: true, checked_in_time: checkinTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Express server and initialize SQLite
app.listen(PORT, async () => {
  console.log(`STECCA POS backend server running on port ${PORT}`);
  await initDatabase();
});
