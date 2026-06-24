const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'stecca_pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper functions wrapping sqlite3 in Promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize tables and seed mock data
async function initDatabase() {
  try {
    // 1. Categories Table
    await run(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    )`);

    // 2. Products Table
    await run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      stock INTEGER DEFAULT 999,
      type TEXT NOT NULL,
      active INTEGER DEFAULT 1
    )`);

    // 3. Stock Items Table (Inventory Raw Materials)
    await run(`CREATE TABLE IF NOT EXISTS stock_items (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      stock REAL DEFAULT 0,
      safetyStock REAL DEFAULT 0,
      unit TEXT,
      cost REAL DEFAULT 0,
      lastOpname TEXT,
      status TEXT DEFAULT 'normal'
    )`);

    // 4. Stock Mutations Table
    await run(`CREATE TABLE IF NOT EXISTS stock_mutations (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      product TEXT NOT NULL,
      type TEXT NOT NULL,
      from_location TEXT,
      to_location TEXT,
      qty REAL NOT NULL,
      unit TEXT,
      status TEXT DEFAULT 'COMPLETED'
    )`);

    // 5. Customers Table (CRM Loyalty)
    await run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      tier TEXT DEFAULT 'REGULAR',
      points INTEGER DEFAULT 0,
      totalSpent REAL DEFAULT 0,
      visits INTEGER DEFAULT 0
    )`);

    // 6. Bookings Table (Reservations)
    await run(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      phone TEXT,
      serviceName TEXT NOT NULL,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'SCHEDULED',
      staff TEXT,
      price REAL DEFAULT 0,
      industry TEXT
    )`);

    // 7. Transactions Table
    await run(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      customer TEXT DEFAULT 'Walk-in',
      items INTEGER DEFAULT 0,
      total REAL DEFAULT 0,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'completed'
    )`);

    // 8. Transaction Items Table
    await run(`CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id)
    )`);

    // 9. Tables Table (F&B Table Session Cart)
    await run(`CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'EMPTY',
      customerId TEXT,
      cart TEXT DEFAULT '[]'
    )`);

    // 10. Settings Table
    await run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // 11. CMS Websites Table
    await run(`CREATE TABLE IF NOT EXISTS cms_websites (
      id TEXT PRIMARY KEY,
      domain TEXT UNIQUE,
      theme_config TEXT
    )`);

    // 12. CMS Pages Table
    await run(`CREATE TABLE IF NOT EXISTS cms_pages (
      id TEXT PRIMARY KEY,
      website_id TEXT,
      slug TEXT,
      title TEXT,
      content TEXT,
      published INTEGER DEFAULT 0,
      FOREIGN KEY(website_id) REFERENCES cms_websites(id) ON DELETE CASCADE
    )`);

    // 13. Event Details Table
    await run(`CREATE TABLE IF NOT EXISTS event_details (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT
    )`);

    // 14. Event Ticket Tiers Table
    await run(`CREATE TABLE IF NOT EXISTS event_ticket_tiers (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      quota INTEGER DEFAULT 0,
      sold INTEGER DEFAULT 0,
      FOREIGN KEY(event_id) REFERENCES event_details(id) ON DELETE CASCADE
    )`);

    // 15. Event Registrations Table
    await run(`CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      ticket_tier_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      ticket_code TEXT UNIQUE NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      checked_in INTEGER DEFAULT 0,
      checked_in_time TEXT,
      FOREIGN KEY(ticket_tier_id) REFERENCES event_ticket_tiers(id) ON DELETE CASCADE
    )`);

    console.log('SQLite tables initialized successfully.');

    // Seed data if tables are empty
    await seedDatabase();
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

async function seedDatabase() {
  // Seed Settings
  const settingsCount = await get('SELECT COUNT(*) as count FROM settings');
  if (settingsCount.count === 0) {
    console.log('Seeding default settings...');
    await run('INSERT INTO settings (key, value) VALUES (?, ?)', ['active_industry', 'HYBRID']);
  }

  // Check if categories table is empty
  const catCount = await get('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    console.log('Seeding initial categories...');
    const initialCategories = [
      { id: 'cat-01', name: 'Minuman Kopi', icon: '☕', color: '#818cf8' },
      { id: 'cat-02', name: 'Minuman Non-Kopi', icon: '🧃', color: '#34d399' },
      { id: 'cat-03', name: 'Makanan Berat', icon: '🍛', color: '#fbbf24' },
      { id: 'cat-04', name: 'Makanan Ringan', icon: '🍟', color: '#f87171' },
      { id: 'cat-05', name: 'Dessert', icon: '🍰', color: '#a78bfa' },
      { id: 'cat-06', name: 'Semua', icon: '📦', color: '#6b7280' },
    ];
    for (const cat of initialCategories) {
      await run('INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)', [cat.id, cat.name, cat.icon, cat.color]);
    }
  }

  // Seed Products
  const prodCount = await get('SELECT COUNT(*) as count FROM products');
  if (prodCount.count === 0) {
    console.log('Seeding initial products...');
    const initialProducts = [
      { id: 'p-001', sku: 'KSG-001', name: 'Kopi Susu Gula Aren', category: 'cat-01', price: 25000, cost: 8500, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-002', sku: 'EAM-002', name: 'Espresso Americano', category: 'cat-01', price: 22000, cost: 7000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-003', sku: 'CPL-003', name: 'Cappuccino Latte', category: 'cat-01', price: 28000, cost: 9500, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-004', sku: 'MCM-004', name: 'Mocha Caramel', category: 'cat-01', price: 32000, cost: 11000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-005', sku: 'ETM-005', name: 'Es Teh Manis', category: 'cat-02', price: 10000, cost: 2500, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-006', sku: 'JJA-006', name: 'Jus Jeruk Asli', category: 'cat-02', price: 18000, cost: 6000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-007', sku: 'LMN-007', name: 'Lemon Soda', category: 'cat-02', price: 15000, cost: 4500, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-008', sku: 'CSM-008', name: 'Cokelat Susu Milo', category: 'cat-02', price: 20000, cost: 7500, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-009', sku: 'NGS-009', name: 'Nasi Goreng Spesial', category: 'cat-03', price: 35000, cost: 14000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-010', sku: 'AGP-010', name: 'Ayam Geprek Sambal', category: 'cat-03', price: 30000, cost: 12000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-011', sku: 'MAB-011', name: 'Mie Ayam Bakso', category: 'cat-03', price: 25000, cost: 10000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-012', sku: 'NKT-012', name: 'Nasi Kuning Telur', category: 'cat-03', price: 28000, cost: 11000, stock: 999, type: 'BUNDLE', active: 1 },
      { id: 'p-013', sku: 'KFG-013', name: 'Kentang Goreng', category: 'cat-04', price: 18000, cost: 6000, stock: 999, type: 'PHYSICAL', active: 1 },
      { id: 'p-014', sku: 'RCK-014', name: 'Roti Cokelat', category: 'cat-05', price: 15000, cost: 5000, stock: 45, type: 'PHYSICAL', active: 1 },
      { id: 'p-015', sku: 'PCJ-015', name: 'Pisang Cokelat Keju', category: 'cat-05', price: 20000, cost: 7500, stock: 38, type: 'PHYSICAL', active: 1 },
    ];
    for (const p of initialProducts) {
      await run('INSERT INTO products (id, sku, name, category, price, cost, stock, type, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.sku, p.name, p.category, p.price, p.cost, p.stock, p.type, p.active ? 1 : 0]);
    }
  }

  // Seed Stock Items
  const stockCount = await get('SELECT COUNT(*) as count FROM stock_items');
  if (stockCount.count === 0) {
    console.log('Seeding initial stock items...');
    const initialStockItems = [
      { id: 's-001', sku: 'BB-GLP-01', name: 'Gula Pasir', category: 'Bahan Baku', stock: 3, safetyStock: 10, unit: 'Kg', cost: 14000, lastOpname: '2026-06-20', status: 'critical' },
      { id: 's-002', sku: 'BB-KPA-01', name: 'Kopi Arabica Toraja', category: 'Bahan Baku', stock: 5, safetyStock: 15, unit: 'Kg', cost: 185000, lastOpname: '2026-06-20', status: 'critical' },
      { id: 's-003', sku: 'BB-SSF-01', name: 'Susu Segar Full Cream', category: 'Bahan Baku', stock: 12, safetyStock: 20, unit: 'Liter', cost: 18000, lastOpname: '2026-06-22', status: 'warning' },
      { id: 's-004', sku: 'BB-SRV-01', name: 'Sirup Vanila Monin', category: 'Bahan Baku', stock: 8, safetyStock: 12, unit: 'Botol', cost: 125000, lastOpname: '2026-06-22', status: 'warning' },
      { id: 's-005', sku: 'BB-CKB-01', name: 'Cokelat Bubuk', category: 'Bahan Baku', stock: 18, safetyStock: 10, unit: 'Kg', cost: 95000, lastOpname: '2026-06-22', status: 'normal' },
      { id: 's-006', sku: 'BB-TPT-01', name: 'Tepung Terigu Protein Tinggi', category: 'Bahan Baku', stock: 25, safetyStock: 15, unit: 'Kg', cost: 12500, lastOpname: '2026-06-18', status: 'normal' },
      { id: 's-007', sku: 'BB-MNT-01', name: 'Mentega Wisman', category: 'Bahan Baku', stock: 10, safetyStock: 8, unit: 'Kg', cost: 78000, lastOpname: '2026-06-20', status: 'normal' },
      { id: 's-008', sku: 'PK-CUP-01', name: 'Cup Plastik 16oz', category: 'Packaging', stock: 150, safetyStock: 200, unit: 'Pcs', cost: 850, lastOpname: '2026-06-22', status: 'warning' },
      { id: 's-009', sku: 'PK-SED-01', name: 'Sedotan Kertas', category: 'Packaging', stock: 500, safetyStock: 300, unit: 'Pcs', cost: 350, lastOpname: '2026-06-22', status: 'normal' },
      { id: 's-010', sku: 'PK-TSM-01', name: 'Tissue Meja', category: 'Packaging', stock: 15, safetyStock: 25, unit: 'Pak', cost: 22000, lastOpname: '2026-06-21', status: 'warning' },
    ];
    for (const s of initialStockItems) {
      await run('INSERT INTO stock_items (id, sku, name, category, stock, safetyStock, unit, cost, lastOpname, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.sku, s.name, s.category, s.stock, s.safetyStock, s.unit, s.cost, s.lastOpname, s.status]);
    }
  }

  // Seed Stock Mutations
  const mutCount = await get('SELECT COUNT(*) as count FROM stock_mutations');
  if (mutCount.count === 0) {
    console.log('Seeding initial stock mutations...');
    const initialMutations = [
      { id: 'mut-001', date: '2026-06-24', product: 'Kopi Arabica Toraja', type: 'PURCHASE', from: 'PT Kopi Nusantara', to: 'Cabang Menteng', qty: 10, unit: 'Kg', status: 'COMPLETED' },
      { id: 'mut-002', date: '2026-06-24', product: 'Susu Segar Full Cream', type: 'SALE', from: 'Cabang Menteng', to: 'Penjualan', qty: -8, unit: 'Liter', status: 'COMPLETED' },
      { id: 'mut-003', date: '2026-06-23', product: 'Gula Pasir', type: 'TRANSFER', from: 'Gudang Pusat', to: 'Cabang Menteng', qty: 20, unit: 'Kg', status: 'IN_TRANSIT' },
      { id: 'mut-004', date: '2026-06-23', product: 'Cup Plastik 16oz', type: 'PURCHASE', from: 'CV Plastindo', to: 'Cabang Menteng', qty: 500, unit: 'Pcs', status: 'COMPLETED' },
      { id: 'mut-005', date: '2026-06-23', product: 'Sirup Vanila Monin', type: 'ADJUSTMENT', from: '-', to: 'Cabang Menteng', qty: -2, unit: 'Botol', status: 'COMPLETED' },
    ];
    for (const m of initialMutations) {
      await run('INSERT INTO stock_mutations (id, date, product, type, from_location, to_location, qty, unit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [m.id, m.date, m.product, m.type, m.from, m.to, m.qty, m.unit, m.status]);
    }
  }

  // Seed Customers
  const custCount = await get('SELECT COUNT(*) as count FROM customers');
  if (custCount.count === 0) {
    console.log('Seeding initial customers...');
    const initialCustomers = [
      { id: 'c-001', name: 'Budi Santoso', phone: '081234567890', email: 'budi@gmail.com', tier: 'GOLD', points: 12500, totalSpent: 15800000, visits: 47 },
      { id: 'c-002', name: 'Siti Rahayu', phone: '082345678901', email: 'siti.r@gmail.com', tier: 'SILVER', points: 6800, totalSpent: 8200000, visits: 28 },
      { id: 'c-003', name: 'Ahmad Ridwan', phone: '083456789012', email: 'ahmad.r@gmail.com', tier: 'GOLD', points: 15200, totalSpent: 22500000, visits: 63 },
      { id: 'c-004', name: 'Dewi Lestari', phone: '084567890123', email: 'dewi.l@gmail.com', tier: 'REGULAR', points: 2100, totalSpent: 3400000, visits: 12 },
      { id: 'c-005', name: 'Rudi Hermawan', phone: '085678901234', email: 'rudi.h@gmail.com', tier: 'SILVER', points: 5500, totalSpent: 7100000, visits: 22 },
      { id: 'c-006', name: 'Maya Kusuma', phone: '086789012345', email: 'maya.k@gmail.com', tier: 'REGULAR', points: 800, totalSpent: 1200000, visits: 5 },
    ];
    for (const c of initialCustomers) {
      await run('INSERT INTO customers (id, name, phone, email, tier, points, totalSpent, visits) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.name, c.phone, c.email, c.tier, c.points, c.totalSpent, c.visits]);
    }
  }

  // Seed Bookings
  const bookingCount = await get('SELECT COUNT(*) as count FROM bookings');
  if (bookingCount.count === 0) {
    console.log('Seeding initial bookings...');
    const initialBookings = [
      { id: 'b-001', customerName: 'Dewi Lestari', phone: '084567890123', serviceName: 'Barber Haircut & Styling', time: '10:00', date: '2026-06-25', status: 'SCHEDULED', staff: 'Rian (Stylist)', price: 75000, industry: 'Barbershop/Salon' },
      { id: 'b-002', customerName: 'Budi Santoso', phone: '081234567890', serviceName: 'Klinik Gigi - Scaling', time: '14:30', date: '2026-06-25', status: 'SCHEDULED', staff: 'Drg. Indah', price: 350000, industry: 'Klinik' },
      { id: 'b-003', customerName: 'Siti Rahayu', phone: '082345678901', serviceName: 'Service AC Mobil', time: '11:00', date: '2026-06-24', status: 'IN_PROGRESS', staff: 'Agus (Mekanik)', price: 150000, industry: 'Bengkel' },
    ];
    for (const b of initialBookings) {
      await run('INSERT INTO bookings (id, customerName, phone, serviceName, time, date, status, staff, price, industry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [b.id, b.customerName, b.phone, b.serviceName, b.time, b.date, b.status, b.staff, b.price, b.industry]);
    }
  }

  // Seed Transactions
  const txCount = await get('SELECT COUNT(*) as count FROM transactions');
  if (txCount.count === 0) {
    console.log('Seeding initial transactions...');
    const initialTransactions = [
      { id: 'TRX-2026-0087', time: '22:15', date: '2026-06-24', customer: 'Walk-in', items: 4, total: 185000, method: 'QRIS', status: 'completed' },
      { id: 'TRX-2026-0086', time: '22:02', date: '2026-06-24', customer: 'Budi Santoso', items: 2, total: 95000, method: 'Tunai', status: 'completed' },
      { id: 'TRX-2026-0085', time: '21:48', date: '2026-06-24', customer: 'Walk-in', items: 6, total: 312000, method: 'Debit', status: 'completed' },
      { id: 'TRX-2026-0084', time: '21:30', date: '2026-06-24', customer: 'Siti Rahayu', items: 3, total: 157500, method: 'GoPay', status: 'completed' },
      { id: 'TRX-2026-0083', time: '21:15', date: '2026-06-24', customer: 'Walk-in', items: 1, total: 45000, method: 'Tunai', status: 'refunded' },
    ];
    for (const tx of initialTransactions) {
      await run('INSERT INTO transactions (id, time, date, customer, items, total, method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [tx.id, tx.time, tx.date, tx.customer, tx.items, tx.total, tx.method, tx.status]);
    }
  }

  // Seed Tables
  const tableCount = await get('SELECT COUNT(*) as count FROM tables');
  if (tableCount.count === 0) {
    console.log('Seeding initial tables...');
    for (let i = 1; i <= 10; i++) {
      const tableId = `T-${i}`;
      const tableName = `Meja ${String(i).padStart(2, '0')}`;
      await run('INSERT INTO tables (id, name, status, customerId, cart) VALUES (?, ?, ?, ?, ?)',
        [tableId, tableName, 'EMPTY', '', '[]']);
    }
  }

  // Seed CMS Website & Pages
  const websiteCount = await get('SELECT COUNT(*) as count FROM cms_websites');
  if (websiteCount.count === 0) {
    console.log('Seeding initial CMS data...');
    const webId = 'web-001';
    await run('INSERT INTO cms_websites (id, domain, theme_config) VALUES (?, ?, ?)',
      [webId, 'menteng.steccapos.id', JSON.stringify({ color: '#818cf8', layout: 'modern' })]);
      
    await run('INSERT INTO cms_pages (id, website_id, slug, title, content, published) VALUES (?, ?, ?, ?, ?, ?)',
      ['page-home', webId, 'home', 'Selamat Datang di Menteng Cafe', 'Kami menyajikan kopi arabika Toraja terbaik dengan gula aren murni.', 1]);
      
    await run('INSERT INTO cms_pages (id, website_id, slug, title, content, published) VALUES (?, ?, ?, ?, ?, ?)',
      ['page-menu', webId, 'menu', 'Menu Unggulan Kami', '1. Kopi Susu Gula Aren\n2. Nasi Goreng Spesial\n3. Pisang Cokelat Keju', 1]);
  }

  // Seed Events & Ticket Tiers
  const eventCount = await get('SELECT COUNT(*) as count FROM event_details');
  if (eventCount.count === 0) {
    console.log('Seeding initial Event data...');
    const eventId = 'evt-001';
    await run('INSERT INTO event_details (id, title, description, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, 'Live Accoustic Weekend', 'Habiskan akhir pekan Anda dengan pertunjukan musik akustik langsung yang nyaman.', '2026-06-27 19:00', '2026-06-27 22:00', 'Menteng Cafe Terrace']);

    // Tiers
    const vipTierId = 'tier-vip-001';
    const regTierId = 'tier-reg-001';
    await run('INSERT INTO event_ticket_tiers (id, event_id, name, price, quota, sold) VALUES (?, ?, ?, ?, ?, ?)',
      [vipTierId, eventId, 'VIP Seat', 75000, 20, 2]);
    await run('INSERT INTO event_ticket_tiers (id, event_id, name, price, quota, sold) VALUES (?, ?, ?, ?, ?, ?)',
      [regTierId, eventId, 'Regular Area', 30000, 50, 6]);

    // Registrations
    await run('INSERT INTO event_registrations (id, ticket_tier_id, customer_name, customer_email, ticket_code, payment_status, checked_in, checked_in_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['reg-001', vipTierId, 'Budi Santoso', 'budi@gmail.com', 'TIX-BUDI-VIP', 'PAID', 0, '']);
    await run('INSERT INTO event_registrations (id, ticket_tier_id, customer_name, customer_email, ticket_code, payment_status, checked_in, checked_in_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['reg-002', regTierId, 'Dewi Lestari', 'dewi.l@gmail.com', 'TIX-DEWI-REG', 'PAID', 1, '2026-06-27 19:15']);
  }
}

// Export database functions
module.exports = {
  db,
  initDatabase,
  run,
  get,
  all
};
