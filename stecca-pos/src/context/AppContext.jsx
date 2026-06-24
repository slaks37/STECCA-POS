import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import {
  products as initialProducts,
  stockItems as initialStockItems,
  stockMutations as initialStockMutations,
  customers as initialCustomers,
  recentTransactions as initialTransactions,
  dashboardStats as initialDashboardStats,
  revenueChartData as initialRevenueChartData,
  paymentMixData as initialPaymentMixData,
  topProducts as initialTopProducts
} from '../data/mockData';

const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [stockItems, setStockItems] = useState(initialStockItems);
  const [stockMutations, setStockMutations] = useState(initialStockMutations);
  const [customers, setCustomers] = useState(initialCustomers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats);
  const [revenueChartData, setRevenueChartData] = useState(initialRevenueChartData);
  const [paymentMixData, setPaymentMixData] = useState(initialPaymentMixData);
  const [topProducts, setTopProducts] = useState(initialTopProducts);
  const [activeIndustry, setActiveIndustry] = useState('HYBRID');
  const [events, setEvents] = useState([]);
  const [cmsWebsite, setCmsWebsite] = useState(null);
  const [cmsPages, setCmsPages] = useState([]);

  // ═══════════════════════════════════════════════════════════════
  // GEN-Z BMS EXPANDED STATES (Auth, Shift, Branch, HRM)
  // ═══════════════════════════════════════════════════════════════
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeShift, setActiveShift] = useState({
    status: 'CLOSED',
    cashierName: 'Andi Pratama',
    startingCash: 200000,
    cashSales: 0,
    electronicSales: 0,
    openedAt: null
  });

  const [branches, setBranches] = useState([
    { id: 'br-001', name: 'Cabang Menteng', address: 'Jl. Menteng Raya No. 15, Jakarta Pusat', phone: '021-3190888', manager: 'Andi Pratama', revenue: 12450000 },
    { id: 'br-002', name: 'Cabang Sudirman', address: 'Sudirman Central Business District Lot 18, Jakarta Selatan', phone: '021-5150999', manager: 'Budi Santoso', revenue: 8430000 },
    { id: 'br-003', name: 'Cabang Kemang', address: 'Jl. Kemang Raya No. 88, Jakarta Selatan', phone: '021-7190777', manager: 'Dewi Lestari', revenue: 6120000 }
  ]);
  const [activeBranchId, setActiveBranchId] = useState('br-001');

  const [employees, setEmployees] = useState([
    { id: 'emp-001', name: 'Andi Pratama', email: 'andi@steccapos.id', phone: '081234567890', role: 'Branch Manager', salary: 8500000, status: 'Aktif', shift: 'Pagi (08:00 - 16:00)' },
    { id: 'emp-002', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '082345678901', role: 'Kasir Utama', salary: 4500000, status: 'Aktif', shift: 'Sore (16:00 - 24:00)' },
    { id: 'emp-003', name: 'Dewi Lestari', email: 'dewi@gmail.com', phone: '083456789012', role: 'Kitchen Staff', salary: 4200000, status: 'Aktif', shift: 'Pagi (08:00 - 16:00)' },
    { id: 'emp-004', name: 'Siti Rahayu', email: 'siti@gmail.com', phone: '084567890123', role: 'Kasir Magang', salary: 3500000, status: 'Shift Libur', shift: 'Libur' }
  ]);

  // Booking & Reservation State
  const [bookings, setBookings] = useState([
    { id: 'b-001', customerName: 'Dewi Lestari', phone: '084567890123', serviceName: 'Barber Haircut & Styling', time: '10:00', date: '2026-06-25', status: 'SCHEDULED', staff: 'Rian (Stylist)', price: 75000, industry: 'Barbershop/Salon' },
    { id: 'b-002', customerName: 'Budi Santoso', phone: '081234567890', serviceName: 'Klinik Gigi - Scaling', time: '14:30', date: '2026-06-25', status: 'SCHEDULED', staff: 'Drg. Indah', price: 350000, industry: 'Klinik' },
    { id: 'b-003', customerName: 'Siti Rahayu', phone: '082345678901', serviceName: 'Service AC Mobil', time: '11:00', date: '2026-06-24', status: 'IN_PROGRESS', staff: 'Agus (Mekanik)', price: 150000, industry: 'Bengkel' }
  ]);

  // F&B Dine-in Tables State
  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: `T-${i+1}`,
      name: `Meja ${String(i+1).padStart(2, '0')}`,
      status: 'EMPTY', // 'EMPTY', 'ORDERING', 'BILLING'
      cart: [],
      customerId: ''
    }))
  );

  // Fetch initial data from server if online
  const fetchInitialData = async () => {
    try {
      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setDashboardStats(data.stats);
        if (data.transactions) setTransactions(data.transactions);
        if (data.revenueChartData) setRevenueChartData(data.revenueChartData);
        if (data.paymentMixData) setPaymentMixData(data.paymentMixData);
        if (data.topProducts) setTopProducts(data.topProducts);
      }

      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.active_industry) setActiveIndustry(data.active_industry);
      }

      const cmsRes = await fetch('/api/cms/website');
      if (cmsRes.ok) {
        const data = await cmsRes.json();
        if (data.website) setCmsWebsite(data.website);
        if (data.pages) setCmsPages(data.pages);
      }

      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data);
      }

      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const data = await prodRes.json();
        if (data.products) setProducts(data.products);
      }

      const stockRes = await fetch('/api/stock');
      if (stockRes.ok) {
        const data = await stockRes.json();
        setStockItems(data);
      }

      const mutRes = await fetch('/api/stock/mutations');
      if (mutRes.ok) {
        const data = await mutRes.json();
        setStockMutations(data);
      }

      const custRes = await fetch('/api/customers');
      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(data);
      }

      const bookRes = await fetch('/api/bookings');
      if (bookRes.ok) {
        const data = await bookRes.json();
        setBookings(data);
      }

      const tableRes = await fetch('/api/tables');
      if (tableRes.ok) {
        const data = await tableRes.json();
        setTables(data);
      }
    } catch (err) {
      console.warn('Backend offline, using local mock data fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Add new product to catalog
  const addProduct = async (newProd) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        await fetchInitialData();
      } else {
        throw new Error('API return error');
      }
    } catch (err) {
      console.error('Error adding product, falling back to local state:', err.message);
      const formattedProd = {
        id: `p-${Date.now()}`,
        sku: newProd.sku,
        name: newProd.name,
        category: newProd.category,
        price: Number(newProd.price),
        cost: Number(newProd.cost),
        stock: newProd.type === 'PHYSICAL' ? Number(newProd.stock || 0) : 999,
        type: newProd.type,
        active: true
      };
      setProducts((prev) => [...prev, formattedProd]);

      if (newProd.type === 'PHYSICAL') {
        const newStockItem = {
          id: `s-${Date.now()}`,
          sku: `PK-${newProd.sku}`,
          name: newProd.name,
          category: 'Packaging',
          stock: Number(newProd.stock || 0),
          safetyStock: Math.round(Number(newProd.stock || 0) * 0.3),
          unit: 'Pcs',
          cost: Number(newProd.cost),
          lastOpname: new Date().toISOString().split('T')[0],
          status: 'normal'
        };
        setStockItems((prev) => [...prev, newStockItem]);
      }
    }
  };

  // Add new customer
  const addCustomer = async (newCust) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify(newCust)
      });
      if (res.ok) {
        await fetchInitialData();
      } else {
        throw new Error('API return error');
      }
    } catch (err) {
      console.error('Error adding customer, falling back to local state:', err.message);
      const formattedCust = {
        id: `c-00${customers.length + 1}`,
        name: newCust.name,
        phone: newCust.phone,
        email: newCust.email || '-',
        tier: 'REGULAR',
        points: 0,
        totalSpent: 0,
        visits: 0
      };
      setCustomers((prev) => [...prev, formattedCust]);
    }
  };

  // Add booking
  const addBooking = async (newBook) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        await fetchInitialData();
      } else {
        throw new Error('API return error');
      }
    } catch (err) {
      console.error('Error adding booking, falling back to local state:', err.message);
      const formattedBook = {
        id: `b-00${bookings.length + 1}`,
        customerName: newBook.customerName,
        phone: newBook.phone,
        serviceName: newBook.serviceName,
        time: newBook.time,
        date: newBook.date || new Date().toISOString().split('T')[0],
        status: 'SCHEDULED',
        staff: newBook.staff || 'Staff',
        price: Number(newBook.price || 0),
        industry: newBook.industry || 'Barbershop/Salon'
      };
      setBookings((prev) => [formattedBook, ...prev]);
    }
  };

  // Update booking status
  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchInitialData();
      } else {
        throw new Error('API return error');
      }
    } catch (err) {
      console.error('Error updating booking, falling back to local state:', err.message);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  };

  // Update F&B table cart session
  const updateTable = async (id, tableData) => {
    // Optimistic UI state update
    setTables((prev) => {
      const nextTables = prev.map((t) => (t.id === id ? { ...t, ...tableData } : t));
      const target = nextTables.find(t => t.id === id);
      
      // Background sync to backend
      fetch(`/api/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: target.status,
          customerId: target.customerId,
          cart: target.cart
        })
      }).catch(e => console.warn('Failed to sync table update to backend:', e.message));

      return nextTables;
    });
  };

  // Clear F&B table session
  const clearTable = async (id) => {
    // Optimistic UI update
    setTables((prev) => {
      const nextTables = prev.map((t) =>
        t.id === id
          ? { ...t, status: 'EMPTY', cart: [], customerId: '' }
          : t
      );

      // Background clear
      fetch(`/api/tables/${id}/clear`, {
        method: 'DELETE'
      }).catch(e => console.warn('Failed to clear table session on backend:', e.message));

      return nextTables;
    });
  };

  // Stock Opname adjustment helper
  const adjustStock = async (itemId, actualStock) => {
    try {
      const res = await fetch('/api/stock/opname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify({ itemId, actualStock })
      });
      if (res.ok) {
        await fetchInitialData();
      } else {
        throw new Error('Opname API failed');
      }
    } catch (err) {
      console.error('Error adjusting stock, falling back to local state:', err.message);
      setStockItems((prev) =>
        prev.map((s) => {
          if (s.id === itemId) {
            const nextStock = Number(actualStock);
            const status = nextStock <= s.safetyStock ? 'critical' : 'normal';
            return {
              ...s,
              stock: nextStock,
              status,
              lastOpname: new Date().toISOString().split('T')[0]
            };
          }
          return s;
        })
      );
    }
  };

  // Update active template settings
  const updateActiveIndustry = async (industry) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify({ active_industry: industry })
      });
      if (res.ok) {
        setActiveIndustry(industry);
        await fetchInitialData();
      } else {
        throw new Error('API return error');
      }
    } catch (err) {
      console.error('Error updating industry setting, falling back to local state:', err.message);
      setActiveIndustry(industry);
    }
  };

  // CMS & Web building actions
  const updateCmsWebsite = async (id, domain, theme_config) => {
    try {
      const res = await fetch(`/api/cms/website/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-business-name': 'Cabang Menteng' },
        body: JSON.stringify({ domain, theme_config })
      });
      if (res.ok) await fetchInitialData();
    } catch (err) {
      console.error('Error updating CMS website:', err.message);
    }
  };

  const addCmsPage = async (pageData) => {
    try {
      const res = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-name': 'Cabang Menteng' },
        body: JSON.stringify(pageData)
      });
      if (res.ok) await fetchInitialData();
    } catch (err) {
      console.error('Error adding CMS page:', err.message);
    }
  };

  const updateCmsPage = async (id, pageData) => {
    try {
      const res = await fetch(`/api/cms/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-business-name': 'Cabang Menteng' },
        body: JSON.stringify(pageData)
      });
      if (res.ok) await fetchInitialData();
    } catch (err) {
      console.error('Error updating CMS page:', err.message);
    }
  };

  const deleteCmsPage = async (id) => {
    try {
      const res = await fetch(`/api/cms/pages/${id}`, {
        method: 'DELETE',
        headers: { 'x-business-name': 'Cabang Menteng' }
      });
      if (res.ok) await fetchInitialData();
    } catch (err) {
      console.error('Error deleting CMS page:', err.message);
    }
  };

  // Event scheduling & registration actions
  const addEvent = async (eventData) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-name': 'Cabang Menteng' },
        body: JSON.stringify(eventData)
      });
      if (res.ok) await fetchInitialData();
    } catch (err) {
      console.error('Error adding event:', err.message);
    }
  };

  const registerEventTicket = async (ticket_tier_id, customer_name, customer_email) => {
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-business-name': 'Cabang Menteng' },
        body: JSON.stringify({ ticket_tier_id, customer_name, customer_email })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchInitialData();
        return data;
      }
    } catch (err) {
      console.error('Error registering event ticket:', err.message);
    }
    return null;
  };

  const toggleTicketCheckin = async (regId, checked_in) => {
    try {
      const res = await fetch(`/api/events/registrations/${regId}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-business-name': 'Cabang Menteng' },
        body: JSON.stringify({ checked_in })
      });
      if (res.ok) await fetchInitialData();
    } catch (err) {
      console.error('Error checking in event ticket:', err.message);
    }
  };

  // Shift Management Helpers
  const openShift = (cashierName, startingCash) => {
    setActiveShift({
      status: 'OPEN',
      cashierName: cashierName || 'Andi Pratama',
      startingCash: Number(startingCash || 0),
      cashSales: 0,
      electronicSales: 0,
      openedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const closeShift = (actualCash) => {
    const expectedCash = activeShift.startingCash + activeShift.cashSales;
    const closedRecord = {
      ...activeShift,
      expectedCash,
      actualCash: Number(actualCash),
      discrepancy: Number(actualCash) - expectedCash,
      closedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setActiveShift({
      status: 'CLOSED',
      cashierName: activeShift.cashierName,
      startingCash: 200000,
      cashSales: 0,
      electronicSales: 0,
      openedAt: null
    });
    return closedRecord;
  };

  // Branch Selection Helpers
  const switchBranch = (branchId) => {
    setActiveBranchId(branchId);
  };

  const addBranch = (branchData) => {
    const newBranch = {
      id: `br-00${branches.length + 1}`,
      name: branchData.name,
      address: branchData.address,
      phone: branchData.phone || '-',
      manager: branchData.manager || 'Staff',
      revenue: 0
    };
    setBranches(prev => [...prev, newBranch]);
  };

  // Employee HRM Helpers
  const addEmployee = (empData) => {
    const newEmp = {
      id: `emp-00${employees.length + 1}`,
      name: empData.name,
      email: empData.email,
      phone: empData.phone || '-',
      role: empData.role || 'Kasir',
      salary: Number(empData.salary || 0),
      status: 'Aktif',
      shift: empData.shift || 'Pagi (08:00 - 16:00)'
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (id, empData) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empData } : e));
  };

  // Process checkout/sales transaction
  const processSale = async (cart, paymentMethod, customerId, tableId) => {
    const totalSale = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(totalSale * 0.11);
    const grandTotal = totalSale + tax + (totalSale > 0 ? 5000 : 0);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-name': 'Cabang Menteng'
        },
        body: JSON.stringify({
          cart,
          paymentMethod,
          customerId,
          tableId
        })
      });
      if (res.ok) {
        await fetchInitialData();
        // Shift accumulation
        if (activeShift.status === 'OPEN') {
          setActiveShift(prev => {
            const isCash = paymentMethod.toUpperCase() === 'TUNAI' || paymentMethod.toUpperCase() === 'CASH';
            return {
              ...prev,
              cashSales: isCash ? prev.cashSales + grandTotal : prev.cashSales,
              electronicSales: !isCash ? prev.electronicSales + grandTotal : prev.electronicSales
            };
          });
        }
      } else {
        throw new Error('Checkout API return error');
      }
    } catch (err) {
      console.warn('Backend checkout failed. Executing offline fallback calculations:', err.message);
      localProcessSale(cart, paymentMethod, customerId, tableId);
    }
  };

  // Local calculation checkout logic in case of network disconnects
  const localProcessSale = (cart, paymentMethod, customerId, tableId) => {
    const totalSale = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalCost = cart.reduce((sum, item) => sum + item.cost * item.qty, 0);
    const tax = Math.round(totalSale * 0.11);
    const grandTotal = totalSale + tax + 5000; // Rp 5.000 service fee

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    // 1. Log transaction
    const newTrxId = `TRX-2026-0${transactions.length + 88}`;
    const customerObj = customers.find((c) => c.id === customerId);
    const customerName = customerObj ? customerObj.name : 'Walk-in';

    const newTransaction = {
      id: newTrxId,
      time: timeStr,
      customer: customerName,
      items: cart.reduce((acc, item) => acc + item.qty, 0),
      total: grandTotal,
      method: paymentMethod,
      status: 'completed'
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    // 2. Decrement menu catalog stock
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.id === p.id);
        if (cartItem && p.stock !== 999) {
          const nextStock = Math.max(0, p.stock - cartItem.qty);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    // 3. Decrement raw materials (Inventory)
    setStockItems((prevStock) => {
      let updatedStock = [...prevStock];
      let mutationsToAdd = [];

      cart.forEach((item) => {
        if (item.category === 'cat-01' || item.category === 'cat-02') {
          updatedStock = updatedStock.map((s) => {
            if (s.sku === 'PK-CUP-01') {
              const newQty = Math.max(0, s.stock - item.qty);
              return { ...s, stock: newQty, status: newQty <= s.safetyStock ? 'critical' : 'normal' };
            }
            return s;
          });

          if (item.category === 'cat-01') {
            updatedStock = updatedStock.map((s) => {
              if (s.sku === 'BB-KPA-01') {
                const newQty = Math.max(0, s.stock - 0.02 * item.qty);
                return { ...s, stock: Number(newQty.toFixed(2)), status: newQty <= s.safetyStock ? 'critical' : 'normal' };
              }
              return s;
            });
          }

          if (item.name.toLowerCase().includes('latte') || item.name.toLowerCase().includes('susu') || item.name.toLowerCase().includes('cappuccino')) {
            updatedStock = updatedStock.map((s) => {
              if (s.sku === 'BB-SSF-01') {
                const newQty = Math.max(0, s.stock - 0.15 * item.qty);
                return { ...s, stock: Number(newQty.toFixed(1)), status: newQty <= s.safetyStock ? 'critical' : 'normal' };
              }
              return s;
            });
          }
        }

        updatedStock = updatedStock.map((s) => {
          if (s.name.toLowerCase() === item.name.toLowerCase()) {
            const newQty = Math.max(0, s.stock - item.qty);
            return { ...s, stock: newQty, status: newQty <= s.safetyStock ? 'critical' : 'normal' };
          }
          return s;
        });

        mutationsToAdd.push({
          id: `mut-${Date.now()}-${item.id}`,
          date: dateStr,
          product: item.name,
          type: 'SALE',
          from: 'Cabang Menteng',
          to: 'Penjualan',
          qty: -item.qty,
          unit: item.category === 'cat-01' || item.category === 'cat-02' ? 'Cup' : 'Pcs',
          status: 'COMPLETED'
        });
      });

      setStockMutations((prevMuts) => [...mutationsToAdd, ...prevMuts]);
      return updatedStock;
    });

    // 4. Update Customer loyalty points
    if (customerId) {
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) => {
          if (c.id === customerId) {
            const addedPoints = Math.round(grandTotal / 500);
            const nextPoints = c.points + addedPoints;
            const nextSpent = c.totalSpent + grandTotal;
            const nextVisits = c.visits + 1;
            
            let nextTier = c.tier;
            if (nextSpent >= 15000000) nextTier = 'GOLD';
            else if (nextSpent >= 5000000) nextTier = 'SILVER';

            return {
              ...c,
              points: nextPoints,
              totalSpent: nextSpent,
              visits: nextVisits,
              tier: nextTier
            };
          }
          return c;
        })
      );
    }

    // 5. Update dashboard stats
    setDashboardStats((prevStats) => {
      const nextRevenue = prevStats.todayRevenue + grandTotal;
      const nextTransactions = prevStats.todayTransactions + 1;
      const nextAov = Math.round(nextRevenue / nextTransactions);
      const nextInventoryVal = Math.max(0, prevStats.inventoryValue - totalCost);

      return {
        ...prevStats,
        todayRevenue: nextRevenue,
        todayTransactions: nextTransactions,
        avgOrderValue: nextAov,
        inventoryValue: nextInventoryVal
      };
    });

    // 6. Clear table order session
    if (tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, status: 'EMPTY', cart: [], customerId: '' }
            : t
        )
      );
    }

    // 7. Accumulate in active shift (local/offline mode)
    if (activeShift.status === 'OPEN') {
      setActiveShift(prev => {
        const isCash = paymentMethod.toUpperCase() === 'TUNAI' || paymentMethod.toUpperCase() === 'CASH';
        return {
          ...prev,
          cashSales: isCash ? prev.cashSales + grandTotal : prev.cashSales,
          electronicSales: !isCash ? prev.electronicSales + grandTotal : prev.electronicSales
        };
      });
    }
  };

  // Derived stock warning list for dashboard panel
  const stockAlerts = useMemo(() => {
    return stockItems
      .filter((item) => item.status === 'critical' || item.status === 'warning')
      .map((item) => ({
        id: item.id,
        product: item.name,
        currentStock: item.stock,
        safetyStock: item.safetyStock,
        unit: item.unit,
        severity: item.status
      }))
      .slice(0, 5);
  }, [stockItems]);

  return (
    <AppContext.Provider
      value={{
        products,
        stockItems,
        stockMutations,
        customers,
        transactions,
        dashboardStats,
        stockAlerts,
        bookings,
        tables,
        revenueChartData,
        paymentMixData,
        topProducts,
        activeIndustry,
        updateActiveIndustry,
        addProduct,
        addCustomer,
        addBooking,
        updateBookingStatus,
        updateTable,
        clearTable,
        adjustStock,
        processSale,
        events,
        cmsWebsite,
        cmsPages,
        updateCmsWebsite,
        addCmsPage,
        updateCmsPage,
        deleteCmsPage,
        addEvent,
        registerEventTicket,
        toggleTicketCheckin,
        isLoggedIn,
        setIsLoggedIn,
        activeShift,
        openShift,
        closeShift,
        branches,
        activeBranchId,
        switchBranch,
        addBranch,
        employees,
        addEmployee,
        updateEmployee
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
}
