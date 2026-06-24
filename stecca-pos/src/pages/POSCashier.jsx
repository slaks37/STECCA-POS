import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  X,
  ShoppingCart,
  Printer,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories, formatRupiah } from '../data/mockData';
import './POSCashier.css';

export default function POSCashier() {
  const { 
    products, 
    customers, 
    processSale, 
    tables, 
    updateTable, 
    bookings, 
    activeIndustry,
    activeShift,
    openShift,
    closeShift,
    employees
  } = useApp();
  
  // Order Type & Active Table Session
  const [orderType, setOrderType] = useState('TAKEAWAY'); // 'TAKEAWAY', 'DINEIN'
  const [activeTableId, setActiveTableId] = useState(null);

  // Cashier Shifts Local States
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [closeShiftReport, setCloseShiftReport] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [openCashierName, setOpenCashierName] = useState('Andi Pratama');
  const [openStartingCash, setOpenStartingCash] = useState(200000);
  const [actualCashDrawer, setActualCashDrawer] = useState('');

  // Sync default cashier selection
  useEffect(() => {
    if (employees && employees.length > 0) {
      setOpenCashierName(employees[0].name);
    }
  }, [employees]);

  const handleOpenShiftSubmit = (e) => {
    e.preventDefault();
    openShift(openCashierName, openStartingCash);
  };

  const handleCloseShiftSubmit = (e) => {
    e.preventDefault();
    if (!actualCashDrawer || isNaN(actualCashDrawer)) {
      alert('Masukkan nominal uang laci kas yang valid!');
      return;
    }
    const report = closeShift(actualCashDrawer);
    setCloseShiftReport(report);
    setIsCloseShiftOpen(false);
    setIsReportOpen(true);
    setActualCashDrawer('');
  };

  // Force takeaway mode if industry has no tables
  useEffect(() => {
    if (activeIndustry === 'RETAIL' || activeIndustry === 'SERVICE') {
      setOrderType('TAKEAWAY');
      setActiveTableId(null);
    }
  }, [activeIndustry]);

  // Carts for Takeaway (local state)
  const [takeawayCart, setTakeawayCart] = useState([]);
  const [takeawayCustomerId, setTakeawayCustomerId] = useState('');

  // Resolve active cart and customer based on order type
  const activeTable = useMemo(() => {
    return tables.find((t) => t.id === activeTableId);
  }, [tables, activeTableId]);

  const cart = useMemo(() => {
    return orderType === 'TAKEAWAY' ? takeawayCart : (activeTable ? activeTable.cart : []);
  }, [orderType, takeawayCart, activeTable]);

  const selectedCustomerId = useMemo(() => {
    return orderType === 'TAKEAWAY' ? takeawayCustomerId : (activeTable ? activeTable.customerId : '');
  }, [orderType, takeawayCustomerId, activeTable]);

  // Unified Cart & Customer state wrappers
  const updateCart = (nextCartVal) => {
    if (orderType === 'TAKEAWAY') {
      setTakeawayCart(nextCartVal);
    } else if (activeTableId) {
      const currentCart = activeTable ? activeTable.cart : [];
      const nextCart = typeof nextCartVal === 'function' ? nextCartVal(currentCart) : nextCartVal;
      const nextStatus = nextCart.length > 0 ? 'ORDERING' : 'EMPTY';
      updateTable(activeTableId, { cart: nextCart, status: nextStatus });
    }
  };

  const updateCustomerId = (nextCustId) => {
    if (orderType === 'TAKEAWAY') {
      setTakeawayCustomerId(nextCustId);
    } else if (activeTableId) {
      updateTable(activeTableId, { customerId: nextCustId });
    }
  };

  // Handle booking redirect loading
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const bookingId = queryParams.get('bookingId');
    if (bookingId && bookings) {
      const bookingObj = bookings.find((b) => b.id === bookingId);
      if (bookingObj) {
        // 1. Set Order Type to TAKEAWAY
        setOrderType('TAKEAWAY');
        setActiveTableId(null);

        // 2. Load CRM Customer ID if exists
        const custObj = customers.find((c) => c.name.toLowerCase() === bookingObj.customerName.toLowerCase());
        if (custObj) {
          setTakeawayCustomerId(custObj.id);
        }

        // 3. Load booked service as cart item
        const serviceProduct = {
          id: `service-${bookingObj.id}`,
          sku: 'SRV-BOOK',
          name: bookingObj.serviceName,
          category: 'cat-06', // Umum
          price: bookingObj.price,
          cost: Math.round(bookingObj.price * 0.2), // mock cost
          stock: 999,
          type: 'SERVICE',
          active: true
        };
        setTakeawayCart([{ ...serviceProduct, qty: 1 }]);
      }
    }
  }, [queryParams, bookings, customers]);

  const [selectedCategory, setSelectedCategory] = useState('cat-06'); // Default 'Semua'
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'TUNAI', 'QRIS', 'DEBIT', 'EWALLET'
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'cat-06' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.active;
    });
  }, [selectedCategory, searchQuery]);

  // Cart Handlers
  const addToCart = (product) => {
    updateCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    updateCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    updateCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    updateCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.11); // 11% PPN
  const serviceCharge = subtotal > 0 ? 5000 : 0; // Rp 5.000 service fee if cart not empty
  const total = subtotal + tax + serviceCharge;

  const changeDue = useMemo(() => {
    if (!amountPaid || isNaN(amountPaid)) return 0;
    return Math.max(0, Number(amountPaid) - total);
  }, [amountPaid, total]);

  const handleProcessPayment = () => {
    if (cart.length === 0) return;
    setIsPaymentOpen(true);
    setPaymentMethod('QRIS'); // default
    setAmountPaid('');
    setPaymentSuccess(false);
  };

  const submitPayment = () => {
    if (paymentMethod === 'TUNAI' && (!amountPaid || Number(amountPaid) < total)) {
      alert('Jumlah uang tunai kurang dari total pembayaran!');
      return;
    }
    processSale(cart, paymentMethod, selectedCustomerId, orderType === 'DINEIN' ? activeTableId : null);
    setPaymentSuccess(true);
  };

  const resetAll = () => {
    updateCart([]);
    setIsPaymentOpen(false);
    setPaymentMethod(null);
    setAmountPaid('');
    setPaymentSuccess(false);
    updateCustomerId('');
    if (orderType === 'DINEIN') {
      setActiveTableId(null);
    }
  };

  return (
    <div className="pos-layout-wrapper">
      {/* Shift status banner at the top of POS cashier if shift is OPEN */}
      {activeShift.status === 'OPEN' && (
        <div className="pos-shift-status-banner animate-fadeIn" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-primary)',
          borderBottom: '1px solid var(--border-default)',
          padding: 'var(--space-3) var(--space-6)',
          gap: 'var(--space-4)',
          zIndex: 10
        }}>
          <div className="shift-banner-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span className="pulse-green-dot" style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-500)',
              boxShadow: '0 0 8px var(--accent-500)',
              display: 'inline-block'
            }}></span>
            <span>Kasir Aktif: <strong>{activeShift.cashierName}</strong> (Shift Aktif • Mulai jam {activeShift.openedAt})</span>
          </div>
          <button className="btn btn-danger btn-xs" style={{ 
            padding: '6px 14px', 
            fontSize: '11px', 
            borderRadius: 'var(--radius-full)', 
            background: 'var(--danger-500)', 
            color: '#fff',
            fontWeight: 700 
          }} onClick={() => setIsCloseShiftOpen(true)}>
            🔐 Tutup Shift & Rekonsiliasi
          </button>
        </div>
      )}

      {activeShift.status === 'CLOSED' ? (
        <div className="shift-blocker-overlay-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)',
          padding: 'var(--space-8)'
        }}>
          <div className="shift-blocker-card animate-scaleUp card" style={{
            maxWidth: '460px',
            width: '100%',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center'
          }}>
            <div className="blocker-header" style={{ marginBottom: 'var(--space-5)' }}>
              <span className="emoji-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>👋</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Halo! Shift Kasir Belum Dibuka</h3>
              <p className="text-muted text-sm mt-2">Mulai shift kasir Anda terlebih dahulu untuk mengaktifkan catalog POS dan rekap omzet harian secara otomatis.</p>
            </div>
            
            <form onSubmit={handleOpenShiftSubmit} className="blocker-form" style={{ textAlign: 'left' }}>
              <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label" htmlFor="cashier-select">Pilih Staff Kasir</label>
                <select
                  id="cashier-select"
                  className="form-control"
                  value={openCashierName}
                  onChange={(e) => setOpenCashierName(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-bg)' }}
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label" htmlFor="starting-cash-input">Modal Uang Laci Kas Awal (Cash Capital)</label>
                <div className="domain-input-wrapper">
                  <span className="domain-prefix">Rp</span>
                  <input
                    id="starting-cash-input"
                    type="number"
                    className="form-control"
                    placeholder="200000"
                    value={openStartingCash}
                    onChange={(e) => setOpenStartingCash(Number(e.target.value))}
                    style={{ width: '100%', background: 'var(--surface-bg)' }}
                    required
                  />
                </div>
                <p className="text-muted text-xs mt-1">Uang nominal kecil di laci kasir untuk kembalian awal.</p>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2" style={{ width: '100%' }}>
                <span>Buka Shift Sekarang 🚀</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="pos-layout animate-fadeIn" style={{ height: 'calc(100vh - 120px)' }}>
          {/* LEFT SIDE: Catalog */}
          <div className="pos-catalog">
            <div className="pos-search-bar">
              <div className="search-wrapper">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Cari produk berdasarkan nama atau SKU (Barcode)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-search"
                />
              </div>
            </div>
    
            {/* Order Type Toggle Selector */}
            {(activeIndustry === 'CAFE' || activeIndustry === 'HYBRID') && (
              <div className="pos-order-type-selector">
                <button
                  type="button"
                  className={`order-type-btn ${orderType === 'TAKEAWAY' ? 'active' : ''}`}
                  onClick={() => {
                    setOrderType('TAKEAWAY');
                    setActiveTableId(null);
                  }}
                >
                  🥡 Takeaway & Delivery
                </button>
                <button
                  type="button"
                  className={`order-type-btn ${orderType === 'DINEIN' ? 'active' : ''}`}
                  onClick={() => {
                    setOrderType('DINEIN');
                    setActiveTableId('T-1'); // default Meja 01
                  }}
                >
                  🍽️ Dine-in (Meja)
                </button>
              </div>
            )}
    
            {/* F&B Dine-in Table Grid */}
            {orderType === 'DINEIN' && (
              <div className="pos-tables-grid">
                {tables.map((t) => {
                  const tableCartCount = t.cart.reduce((a, c) => a + c.qty, 0);
                  const tableTotal = t.cart.reduce((a, c) => a + c.price * c.qty, 0);
                  const isOccupied = t.status !== 'EMPTY';
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`table-select-pill ${activeTableId === t.id ? 'active' : ''} ${isOccupied ? 'occupied' : 'empty'}`}
                      onClick={() => setActiveTableId(t.id)}
                    >
                      <span className="table-name-label">{t.name}</span>
                      {isOccupied && (
                        <span className="table-billing-badge">{tableCartCount} item ({formatRupiah(tableTotal)})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
    
            {/* Category Tabs */}
            <div className="pos-categories-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="category-tab-icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
    
            {/* Products Grid */}
            <div className="products-grid-scroll">
              <div className="pos-products-grid">
                {filteredProducts.map((p) => {
                  const categoryColor = categories.find((c) => c.id === p.category)?.color || 'var(--brand-500)';
                  return (
                    <div key={p.id} className="pos-product-card" onClick={() => addToCart(p)}>
                      <div className="product-category-indicator" style={{ backgroundColor: categoryColor }}></div>
                      <div className="product-info-wrap">
                        <span className="product-sku">{p.sku}</span>
                        <h4 className="product-name">{p.name}</h4>
                      </div>
                      <div className="product-footer">
                        <span className="product-price">{formatRupiah(p.price)}</span>
                        <div className="product-add-badge">
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
    
          {/* RIGHT SIDE: Cart */}
          <div className="pos-cart-panel">
            <div className="cart-header">
              <div className="cart-title">
                <ShoppingCart size={18} />
                <h3>Keranjang Belanja</h3>
                <span className="cart-count-badge">{cart.reduce((a, c) => a + c.qty, 0)} item</span>
              </div>
              {cart.length > 0 && (
                <button className="btn-clear-cart" onClick={clearCart}>
                  Bersihkan
                </button>
              )}
            </div>
    
            {/* Customer CRM Selector */}
            <div className="cart-customer-selector" style={{ padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--border-default)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <select
                value={selectedCustomerId}
                onChange={(e) => updateCustomerId(e.target.value)}
                className="select-field"
                style={{ width: '100%', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px' }}
              >
                <option value="">Walk-in Customer (Umum)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name} ({c.tier} - {c.points} pts)
                  </option>
                ))}
              </select>
            </div>
    
            {/* Cart List */}
            <div className="cart-items-scroll">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingCart size={48} className="empty-icon" />
                  <p>Keranjang belanja kosong.</p>
                  <span className="text-xs text-muted">Pilih produk di panel kiri untuk mulai transaksi.</span>
                </div>
              ) : (
                <div className="cart-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">{formatRupiah(item.price)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                          <Minus size={12} />
                        </button>
                        <span className="qty-value">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                          <Plus size={12} />
                        </button>
                        <span className="cart-item-total">{formatRupiah(item.price * item.qty)}</span>
                        <button className="cart-item-delete" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
    
            {/* Summary Footer */}
            <div className="cart-summary-section">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>PPN (11%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="summary-row">
                <span>Biaya Layanan</span>
                <span>{formatRupiah(serviceCharge)}</span>
              </div>
              <div className="summary-row grand-total">
                <span>Total Bayar</span>
                <span>{formatRupiah(total)}</span>
              </div>
              
              <button
                type="button"
                className="btn btn-primary btn-checkout"
                disabled={cart.length === 0}
                onClick={handleProcessPayment}
              >
                Bayar & Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Checkout Payment */}
      {isPaymentOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            <div className="modal-header justify-between">
              <h3>Pembayaran POS Kasir</h3>
              <button className="modal-close" onClick={() => setIsPaymentOpen(false)}>×</button>
            </div>

            {!paymentSuccess ? (
              <>
                <div className="modal-body">
                  <div className="payment-total-tag">
                    <span>Total Tagihan:</span>
                    <strong>{formatRupiah(total)}</strong>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Metode Pembayaran</label>
                    <div className="payment-methods-grid">
                      {[
                        { id: 'QRIS', icon: QrCode, label: 'QRIS' },
                        { id: 'TUNAI', icon: Banknote, label: 'Tunai' },
                        { id: 'DEBIT', icon: CreditCard, label: 'Debit' },
                        { id: 'EWALLET', icon: Wallet, label: 'E-Wallet' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          className={`payment-method-card ${paymentMethod === method.id ? 'active' : ''}`}
                          onClick={() => {
                            setPaymentMethod(method.id);
                            setAmountPaid(method.id === 'TUNAI' ? '' : total.toString());
                          }}
                        >
                          <method.icon size={24} />
                          <span>{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'TUNAI' && (
                    <div className="form-group mt-2">
                      <label className="form-label" htmlFor="pos-cash-input">Uang Tunai Diterima (Cash Tendered)</label>
                      <input
                        id="pos-cash-input"
                        type="number"
                        placeholder="Masukkan nominal uang..."
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="input-field cash-input"
                      />
                      <div className="quick-cash-buttons">
                        {[total, 20000, 50000, 100000].map((cashVal) => {
                          const val = cashVal === total ? Math.ceil(total / 1000) * 1000 : cashVal;
                          return (
                            <button
                              key={cashVal}
                              type="button"
                              className="quick-cash-btn"
                              onClick={() => setAmountPaid(val.toString())}
                            >
                              +{formatRupiah(val)}
                            </button>
                          );
                        })}
                      </div>
                      {amountPaid && (
                        <div className="change-due-box">
                          <span>Kembalian</span>
                          <span className={`change-due-value ${changeDue > 0 ? 'text-success' : ''}`}>
                            {formatRupiah(changeDue)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod && paymentMethod !== 'TUNAI' && (
                    <div className="digital-payment-placeholder">
                      <QrCode size={120} className="qris-barcode" />
                      <span className="text-muted text-xs text-center" style={{ display: 'block', width: '100%' }}>Pindai kode QRIS dinamis di atas untuk melakukan pembayaran</span>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsPaymentOpen(false)}>
                    Kembali
                  </button>
                  <button className="btn btn-primary" onClick={submitPayment}>
                    Selesaikan Transaksi
                  </button>
                </div>
              </>
            ) : (
              <div className="payment-success-view">
                <CheckCircle size={64} className="text-success success-icon" style={{ color: 'var(--accent-500)' }} />
                <h2>Transaksi Sukses!</h2>
                <p className="text-muted">Pembayaran telah diterima dan diverifikasi.</p>

                <div className="invoice-receipt card">
                  <div className="receipt-row">
                    <span>Grand Total:</span>
                    <strong className="text-primary">{formatRupiah(total)}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Metode:</span>
                    <span>{paymentMethod}</span>
                  </div>
                  {paymentMethod === 'TUNAI' && (
                    <>
                      <div className="receipt-row">
                        <span>Bayar Tunai:</span>
                        <span>{formatRupiah(Number(amountPaid))}</span>
                      </div>
                      <div className="receipt-row">
                        <span>Kembalian:</span>
                        <span>{formatRupiah(changeDue)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="success-actions">
                  <button className="btn btn-secondary" onClick={resetAll}>
                    <Printer size={16} /> Print Struk
                  </button>
                  <button className="btn btn-primary" onClick={resetAll}>
                    Transaksi Baru
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Tutup Shift Rekonsiliasi */}
      {isCloseShiftOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            
            <div className="modal-header justify-between">
              <div>
                <h3 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Tutup Shift & Rekonsiliasi Kas</h3>
                <p className="text-muted text-xs mt-1">Petugas: {activeShift.cashierName} • Buka jam {activeShift.openedAt}</p>
              </div>
              <button className="modal-close" onClick={() => setIsCloseShiftOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCloseShiftSubmit}>
              <div className="modal-body">
                
                <div className="shift-summary-grid card p-4 mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--surface-bg)' }}>
                  <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Modal Awal (Cash):</span>
                    <strong>{formatRupiah(activeShift.startingCash)}</strong>
                  </div>
                  <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Penjualan Tunai (Cash Sales):</span>
                    <strong>{formatRupiah(activeShift.cashSales)}</strong>
                  </div>
                  <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-2)', fontSize: '0.85rem' }}>
                    <span>Ekspektasi Uang di Laci:</span>
                    <strong style={{ color: 'var(--brand-500)' }}>{formatRupiah(activeShift.startingCash + activeShift.cashSales)}</strong>
                  </div>
                  <div className="receipt-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 'var(--space-2)' }}>
                    <span>Penjualan Non-Tunai (E-Payment):</span>
                    <span>{formatRupiah(activeShift.electronicSales)}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="actual-cash-input">Masukkan Uang Fisik Aktual di Laci (Actual Cash)</label>
                  <div className="domain-input-wrapper">
                    <span className="domain-prefix">Rp</span>
                    <input
                      id="actual-cash-input"
                      type="number"
                      className="form-control"
                      placeholder="Masukkan uang fisik di laci..."
                      value={actualCashDrawer}
                      onChange={(e) => setActualCashDrawer(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-bg)' }}
                      required
                    />
                  </div>
                  {actualCashDrawer && !isNaN(actualCashDrawer) && (() => {
                    const expectedCash = activeShift.startingCash + activeShift.cashSales;
                    const diff = Number(actualCashDrawer) - expectedCash;
                    return (
                      <div className="discrepancy-feedback mt-2 p-2 rounded" style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: 600,
                        backgroundColor: diff === 0 ? 'var(--success-50)' : 'var(--danger-50)',
                        color: diff === 0 ? 'var(--success-600)' : 'var(--danger-600)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>Selisih Uang Laci:</span>
                        <span>{diff === 0 ? 'Sesuai (Klop! 👍)' : `${diff > 0 ? 'Lebih +' : 'Kurang '}${formatRupiah(diff)}`}</span>
                      </div>
                    );
                  })()}
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCloseShiftOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-danger" style={{ background: 'var(--danger-600)', color: '#fff' }}>
                  Tutup Shift & Rekonsiliasi
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Ringkasan Laporan Shift Terkunci (Shift Report Receipt) */}
      {isReportOpen && closeShiftReport && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp modal-ticket">
            
            <div className="modal-header justify-between">
              <h3 className="modal-title" style={{ color: 'var(--brand-500)', fontSize: '1.1rem', fontWeight: 800 }}>Shift Kasir Berhasil Ditutup</h3>
              <button className="modal-close" onClick={() => setIsReportOpen(false)}>×</button>
            </div>

            <div className="modal-body flex-column items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Receipt Styling for Shift Report */}
              <div className="ticket-visual-design mt-2" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="ticket-header-decor" style={{ background: 'linear-gradient(90deg, var(--brand-600) 0%, var(--brand-400) 100%)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="ticket-brand-logo" style={{ fontSize: '11px', color: '#fff' }}>RINGKASAN REKAP SHIFT</div>
                  <span className="ticket-tier-badge" style={{ background: 'var(--danger-600)', color: '#fff', fontSize: '9px' }}>CLOSED</span>
                </div>
                
                <div className="ticket-body-decor flex-column p-4" style={{ background: '#fff', color: '#1f2937', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ borderBottom: '1px dashed #e5e7eb', paddingBottom: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <div>Petugas Kasir: <strong>{closeShiftReport.cashierName}</strong></div>
                    <div>Waktu Buka Shift: {closeShiftReport.openedAt}</div>
                    <div>Waktu Tutup Shift: {closeShiftReport.closedAt}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', paddingTop: '8px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Modal Awal Kas:</span>
                      <span>{formatRupiah(closeShiftReport.startingCash)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Penjualan Tunai (A):</span>
                      <span>{formatRupiah(closeShiftReport.cashSales)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '4px', fontWeight: 600 }}>
                      <span>Ekspektasi Kas Drawer (A awal + A):</span>
                      <span>{formatRupiah(closeShiftReport.expectedCash)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                      <span>Uang Fisik Aktual Laci (B):</span>
                      <span>{formatRupiah(closeShiftReport.actualCash)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      borderTop: '1.5px dashed #e5e7eb', 
                      paddingTop: '6px', 
                      fontWeight: 700,
                      color: closeShiftReport.discrepancy === 0 ? '#059669' : '#ef4444'
                    }}>
                      <span>Selisih (B - Ekspektasi):</span>
                      <span>{closeShiftReport.discrepancy === 0 ? 'Rp 0 (Klop!)' : (closeShiftReport.discrepancy > 0 ? `+${formatRupiah(closeShiftReport.discrepancy)}` : `-${formatRupiah(Math.abs(closeShiftReport.discrepancy))}`)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', borderTop: '1px solid #f3f4f6', paddingTop: '4px' }}>
                      <span>Total Penjualan QRIS/Kartu:</span>
                      <span>{formatRupiah(closeShiftReport.electronicSales)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px', color: 'var(--brand-600)', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
                      <span>TOTAL REVENUE SHIFT:</span>
                      <span>{formatRupiah(closeShiftReport.cashSales + closeShiftReport.electronicSales)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="ticket-actions-bar mt-6 flex justify-center gap-3" style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-outline flex items-center gap-1" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Cetak Rekap</span>
                </button>
                <button type="button" className="btn btn-primary flex items-center gap-1" onClick={() => setIsReportOpen(false)}>
                  <span>Selesai</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
