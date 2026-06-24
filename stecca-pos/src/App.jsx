import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Users, Warehouse, Settings, Bell, Search, ChevronDown,
  LogOut, Store, CalendarDays, Globe, Ticket, Check
} from 'lucide-react';
import { currentUser } from './data/mockData';
import { useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import POSCashier from './pages/POSCashier';
import StockManagement from './pages/StockManagement';
import ProductManagement from './pages/ProductManagement';
import CustomerManagement from './pages/CustomerManagement';
import Bookings from './pages/Bookings';
import Reports from './pages/Reports';
import SettingsPage from './pages/SettingsPage';
import CMSManager from './pages/CMSManager';
import EventManagement from './pages/EventManagement';
import BranchManagement from './pages/BranchManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import Login from './pages/Login';
import './App.css';

const navItems = [
  { section: 'UTAMA' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pos', icon: ShoppingCart, label: 'Kasir POS' },
  { path: '/bookings', icon: CalendarDays, label: 'Booking & Reservasi' },
  { section: 'MANAJEMEN' },
  { path: '/products', icon: Package, label: 'Produk' },
  { path: '/stock', icon: Warehouse, label: 'Stok & Gudang' },
  { path: '/customers', icon: Users, label: 'Pelanggan' },
  { path: '/employees', icon: Users, label: 'Kepegawaian & Shift' },
  { path: '/cms', icon: Globe, label: 'Website CMS' },
  { path: '/events', icon: Ticket, label: 'Manajemen Event' },
  { section: 'ANALITIK' },
  { path: '/reports', icon: BarChart3, label: 'Laporan' },
  { section: 'SISTEM' },
  { path: '/branches', icon: Store, label: 'Manajemen Cabang' },
  { path: '/settings', icon: Settings, label: 'Konfigurasi' },
];

function Sidebar() {
  const location = useLocation();
  const { activeIndustry, setIsLoggedIn } = useApp();

  const renderedItems = React.useMemo(() => {
    const filtered = navItems.filter((item) => {
      if (item.path === '/bookings') {
        return activeIndustry === 'SERVICE' || activeIndustry === 'HYBRID';
      }
      if (item.path === '/cms') {
        return activeIndustry === 'RETAIL' || activeIndustry === 'SERVICE' || activeIndustry === 'HYBRID' || activeIndustry === 'CAFE';
      }
      if (item.path === '/events') {
        return activeIndustry === 'EVENT' || activeIndustry === 'HYBRID';
      }
      return true;
    });

    const result = [];
    for (let i = 0; i < filtered.length; i++) {
      const current = filtered[i];
      const next = filtered[i + 1];
      if (current.section) {
        if (!next || next.section) {
          continue;
        }
      }
      result.push(current);
    }
    return result;
  }, [activeIndustry]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">S</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">STECCA POS</span>
          <span className="sidebar-brand-badge">Multi-Industry Engine</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {renderedItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-label">{item.section}</div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="sidebar-link-icon" />
              <span>{item.label}</span>
            </Link>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{currentUser.initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser.name}</div>
            <div className="sidebar-user-role">{currentUser.role}</div>
          </div>
          <LogOut 
            size={16} 
            style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }} 
            onClick={() => setIsLoggedIn(false)} 
            title="Keluar dari Sistem"
          />
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { branches, activeBranchId, switchBranch } = useApp();
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <div className="header-title">
            {getPageTitle(location.pathname)}
          </div>
          <div className="header-subtitle">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
      <div className="header-right">
        <div style={{ position: 'relative' }}>
          <div className="header-branch-pill" onClick={() => setIsBranchOpen(!isBranchOpen)}>
            <Store size={14} />
            <span>{activeBranch?.name || 'Cabang'}</span>
            <ChevronDown size={14} />
          </div>

          {isBranchOpen && (
            <div className="branch-dropdown-menu card animate-scaleUp" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '200px',
              zIndex: 100,
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: '4px'
            }}>
              {branches.map(br => (
                <button
                  key={br.id}
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    switchBranch(br.id);
                    setIsBranchOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    background: br.id === activeBranchId ? 'rgba(92, 62, 255, 0.08)' : 'transparent',
                    color: br.id === activeBranchId ? 'var(--brand-500)' : 'var(--text-secondary)',
                    fontWeight: br.id === activeBranchId ? 700 : 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{br.name}</span>
                  {br.id === activeBranchId && <Check size={12} />}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border-default)', margin: '4px 0' }}></div>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  navigate('/branches');
                  setIsBranchOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--brand-500)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⚙️ Kelola Semua Cabang
              </button>
            </div>
          )}
        </div>
        <div className="search-wrapper header-search">
          <Search />
          <input type="text" className="input-search" placeholder="Cari produk, transaksi..." />
        </div>
        <button className="header-icon-btn" id="btn-notifications">
          <Bell size={20} />
          <span className="header-badge"></span>
        </button>
        <button className="header-icon-btn" id="btn-settings" onClick={() => navigate('/settings')}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}

function getPageTitle(path) {
  const titles = {
    '/': 'Dashboard',
    '/pos': 'Kasir POS',
    '/bookings': 'Booking & Reservasi',
    '/products': 'Manajemen Produk',
    '/stock': 'Stok & Gudang',
    '/customers': 'Pelanggan',
    '/reports': 'Laporan & Analitik',
    '/settings': 'Konfigurasi Sistem',
    '/cms': 'Website CMS Builder',
    '/events': 'Manajemen Event & Tiket',
    '/branches': 'Manajemen Cabang',
    '/employees': 'Kepegawaian & Roster Shift',
  };
  return titles[path] || 'STECCA POS';
}

function App() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POSCashier />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/cms" element={<CMSManager />} />
            <Route path="/events" element={<EventManagement />} />
            <Route path="/branches" element={<BranchManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
