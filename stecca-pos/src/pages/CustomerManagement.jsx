import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Users,
  Crown,
  Eye,
  Award,
  X,
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './CustomerManagement.css';

export default function CustomerManagement() {
  const { customers, addCustomer } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for adding a customer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [custImage, setCustImage] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Stats Card Calculations (dynamic based on context customers list)
  const totalPoints = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.points, 0).toLocaleString('id-ID');
  }, [customers]);

  const goldCustomersCount = useMemo(() => {
    return customers.filter((c) => c.tier === 'GOLD').length;
  }, [customers]);

  const stats = [
    { label: 'Total Pelanggan Terdaftar', value: `${customers.length} Orang`, sub: 'CRM aktif', icon: Users, color: 'var(--brand-400)' },
    { label: 'Pelanggan VIP Gold', value: `${goldCustomersCount} VIP`, sub: 'Loyalty tier tertinggi', icon: Crown, color: '#fbbf24', isGold: true },
    { label: 'Total Poin Beredar', value: `${totalPoints} Pts`, sub: 'Dapat ditukar reward', icon: Award, color: 'var(--accent-500)' }
  ];

  // Search filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             c.phone.includes(searchQuery) ||
             c.email.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  // Initial avatar generator helper
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Avatar colors
  const avatarColors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

  return (
    <div className="crm-container animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Pelanggan & CRM</h2>
          <p className="page-description">Database pelanggan & program loyalitas</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            <span>Export Data</span>
          </button>
          <button className="btn btn-brand" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-3 stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`card crm-stat-card ${stat.isGold ? 'gold-glow' : ''}`}>
            <div className="crm-stat-info">
              <span className="crm-stat-label">{stat.label}</span>
              <span className="crm-stat-value" style={stat.isGold ? { color: '#fbbf24' } : {}}>{stat.value}</span>
              <span className="crm-stat-sub">{stat.sub}</span>
            </div>
            <div className="crm-stat-icon-wrapper" style={{ color: stat.color }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Actions Panel */}
      <div className="card crm-filter-bar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari nama, nomor telepon, atau email pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card crm-table-card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Telepon</th>
                <th>Email</th>
                <th>Tier</th>
                <th className="text-right">Poin Loyalitas</th>
                <th className="text-right">Total Transaksi</th>
                <th className="text-right">Kunjungan</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <div className="customer-avatar-identity">
                      {c.image ? (
                        <img 
                          src={c.image} 
                          alt={c.name} 
                          className="customer-avatar" 
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="customer-avatar" 
                          style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                        >
                          {getInitials(c.name)}
                        </div>
                      )}
                      <div className="customer-name-wrapper">
                        <span className="font-semibold">{c.name}</span>
                        <span className="customer-id">{c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs">{c.phone}</td>
                  <td>{c.email}</td>
                  <td>
                    <span className={`badge tier-badge-${c.tier.toLowerCase()}`}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="text-right font-semibold">{c.points.toLocaleString('id-ID')} pts</td>
                  <td className="text-right font-semibold text-primary">{formatRupiah(c.totalSpent)}</td>
                  <td className="text-right">{c.visits} x</td>
                  <td className="text-center">
                    <button className="crm-action-btn" title="Detail Profil">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pelanggan */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            <div className="modal-header">
              <h3>Tambah Pelanggan Baru</h3>
              <button className="modal-close" onClick={() => { setIsModalOpen(false); setCustImage(''); }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Profile Photo Uploader */}
              <div className="image-uploader-container">
                <label className="form-label">Foto Profil Pelanggan</label>
                <div className="image-uploader-box" onClick={() => document.getElementById('cust-img-file').click()}>
                  <input
                    id="cust-img-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCustImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  {custImage ? (
                    <>
                      <img src={custImage} alt="Preview" className="image-preview-circle" style={{ borderRadius: '50%' }} />
                      <div className="image-uploader-info">
                        <span className="image-uploader-title">Foto Pelanggan Dimuat</span>
                        <span className="image-uploader-desc">Klik di sini untuk mengganti foto</span>
                      </div>
                      <button
                        type="button"
                        className="image-uploader-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustImage('');
                        }}
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="image-uploader-placeholder">
                      <Upload size={20} className="image-uploader-icon" />
                      <span>Klik untuk unggah foto profil pelanggan</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="cust-name-input">Nama Lengkap</label>
                <input
                  id="cust-name-input"
                  type="text"
                  placeholder="Contoh: Rian Hidayat"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="cust-phone-input">Nomor Telepon</label>
                <input
                  id="cust-phone-input"
                  type="text"
                  placeholder="Contoh: 0812XXXXXXXX"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="cust-email-input">Email (Opsional)</label>
                <input
                  id="cust-email-input"
                  type="email"
                  placeholder="Contoh: rian@gmail.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setCustImage(''); }}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!newCustomer.name || !newCustomer.phone) {
                    alert('Nama dan Nomor Telepon wajib diisi!');
                    return;
                  }
                  addCustomer({ ...newCustomer, image: custImage || null });
                  setIsModalOpen(false);
                  setCustImage('');
                  setNewCustomer({
                    name: '',
                    phone: '',
                    email: ''
                  });
                }}
              >
                Simpan Pelanggan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
