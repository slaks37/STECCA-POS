import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  ClipboardCheck,
  Calendar,
  RotateCcw,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './StockManagement.css';

export default function StockManagement() {
  const { stockItems, stockMutations, adjustStock } = useApp();
  const [activeTab, setActiveTab] = useState('daftar'); // 'daftar', 'mutasi', 'opname'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Modal states for stock opname
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [actualStock, setActualStock] = useState('');

  // Automatically select first item in inventory when list is loaded
  useEffect(() => {
    if (stockItems && stockItems.length > 0 && !selectedItemId) {
      setSelectedItemId(stockItems[0].id);
    }
  }, [stockItems, selectedItemId]);

  // Find currently selected stock item object for details
  const selectedItemObj = useMemo(() => {
    return stockItems.find((s) => s.id === selectedItemId) || stockItems[0];
  }, [selectedItemId, stockItems]);

  // Dynamic Stats Card data based on actual stock levels
  const stats = [
    { label: 'Total SKU Aktif', value: `${stockItems.length} SKU`, icon: Package, color: 'var(--brand-400)' },
    { label: 'Nilai Persediaan', value: formatRupiah(stockItems.reduce((acc, s) => acc + s.cost * s.stock, 0)), icon: ClipboardCheck, color: 'var(--accent-500)' },
    { label: 'Item Kritis', value: `${stockItems.filter((s) => s.status === 'critical').length} Item`, sub: 'Segera restock', icon: AlertTriangle, color: 'var(--danger-400)', isAlert: true },
    { label: 'Segera Kadaluwarsa', value: '2 Item', sub: 'Pantau umur simpan', icon: Calendar, color: 'var(--warning-400)' }
  ];

  // Filtering for Tab 1: Daftar Stok
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, stockItems]);

  // Handle Opname Submission
  const handleOpnameSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || actualStock === '') return;

    await adjustStock(selectedItemId, Number(actualStock));
    setIsOpnameModalOpen(false);
    setActualStock('');
  };

  // Derive Opname Mutations for Riwayat Opname tab
  const opnameMutations = useMemo(() => {
    return stockMutations.filter((m) => m.type === 'ADJUSTMENT');
  }, [stockMutations]);

  return (
    <div className="stock-container animate-fadeIn">
      {/* Action Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Stok & Gudang</h2>
          <p className="page-description">Manajemen persediaan cabang Menteng</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setIsOpnameModalOpen(true)}>
            <ClipboardCheck size={16} />
            <span>Stock Opname</span>
          </button>
          <button className="btn btn-secondary">
            <ArrowRightLeft size={16} />
            <span>Transfer Stok</span>
          </button>
          <button className="btn btn-brand">
            <Plus size={16} />
            <span>Terima Barang</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stock-stat-card">
            <div className="stock-stat-info">
              <span className="stock-stat-label">{stat.label}</span>
              <span className="stock-stat-value" style={stat.isAlert ? { color: 'var(--danger-400)' } : {}}>{stat.value}</span>
              {stat.sub && <span className="stock-stat-sub">{stat.sub}</span>}
            </div>
            <div className="stock-stat-icon-wrapper" style={{ color: stat.color }}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="stock-tabs-nav card">
        <button 
          className={`stock-tab-btn ${activeTab === 'daftar' ? 'active' : ''}`}
          onClick={() => setActiveTab('daftar')}
        >
          <Package size={16} />
          <span>Daftar Stok</span>
        </button>
        <button 
          className={`stock-tab-btn ${activeTab === 'mutasi' ? 'active' : ''}`}
          onClick={() => setActiveTab('mutasi')}
        >
          <ArrowRightLeft size={16} />
          <span>Mutasi Stok</span>
        </button>
        <button 
          className={`stock-tab-btn ${activeTab === 'opname' ? 'active' : ''}`}
          onClick={() => setActiveTab('opname')}
        >
          <RotateCcw size={16} />
          <span>Riwayat Opname</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'daftar' && (
        <div className="card stock-tab-content">
          <div className="filter-bar">
            <div className="search-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari SKU atau nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-search"
                id="stock-search-input"
              />
            </div>
            <div className="filter-dropdown-wrapper">
              <Filter size={16} className="filter-icon" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select-field"
                id="stock-category-select"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Bahan Baku">Bahan Baku</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th className="text-right">Stok</th>
                  <th className="text-right">Safety Stock</th>
                  <th>Satuan</th>
                  <th className="text-right">HPP/Unit</th>
                  <th>Terakhir Opname</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs">{item.sku}</td>
                    <td className="font-semibold">{item.name}</td>
                    <td>{item.category}</td>
                    <td className="text-right font-semibold">{item.stock}</td>
                    <td className="text-right text-muted">{item.safetyStock}</td>
                    <td>{item.unit}</td>
                    <td className="text-right">{formatRupiah(item.cost)}</td>
                    <td>{item.lastOpname}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'critical' ? 'badge-danger' : 
                        item.status === 'warning' ? 'badge-warning' : 
                        'badge-success'
                      }`}>
                        {item.status === 'critical' ? 'Kritis' : 
                         item.status === 'warning' ? 'Peringatan' : 
                         'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mutasi' && (
        <div className="card stock-tab-content">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Tipe Mutasi</th>
                  <th>Dari</th>
                  <th>Ke</th>
                  <th className="text-right">Jumlah</th>
                  <th>Satuan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockMutations.map((mut) => (
                  <tr key={mut.id}>
                    <td>{mut.date}</td>
                    <td className="font-semibold">{mut.product}</td>
                    <td>
                      <span className={`badge ${
                        mut.type === 'PURCHASE' ? 'badge-success' :
                        mut.type === 'SALE' ? 'badge-info' :
                        mut.type === 'TRANSFER' ? 'badge-brand' :
                        'badge-warning'
                      }`}>
                        {mut.type}
                      </span>
                    </td>
                    <td>{mut.from}</td>
                    <td>{mut.to}</td>
                    <td className="text-right font-semibold" style={mut.qty < 0 ? { color: 'var(--danger-400)' } : { color: 'var(--success-400)' }}>
                      {mut.qty > 0 ? `+${mut.qty}` : mut.qty}
                    </td>
                    <td>{mut.unit}</td>
                    <td>
                      <span className={`badge ${mut.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                        {mut.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'opname' && (
        <div className="card stock-tab-content">
          {opnameMutations.length === 0 ? (
            <div className="empty-content-tab">
              <Calendar size={48} className="empty-icon" />
              <h3>Belum Ada Riwayat Opname</h3>
              <p className="text-muted text-xs">Jadwalkan atau mulai stock opname di tombol header atas untuk melakukan audit persediaan fisik.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Nama Produk</th>
                    <th>Penyesuaian (Selisih)</th>
                    <th>Satuan</th>
                    <th>Lokasi Audit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {opnameMutations.map((mut) => (
                    <tr key={mut.id}>
                      <td>{mut.date}</td>
                      <td className="font-semibold">{mut.product}</td>
                      <td className="text-right font-semibold" style={mut.qty < 0 ? { color: 'var(--danger-400)' } : { color: 'var(--success-400)' }}>
                        {mut.qty > 0 ? `+${mut.qty}` : mut.qty}
                      </td>
                      <td>{mut.unit}</td>
                      <td>{mut.to}</td>
                      <td>
                        <span className="badge badge-success">Selesai</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Opname Modal */}
      {isOpnameModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleIn">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ClipboardCheck className="text-brand" size={20} />
                <h3>Stock Opname / Audit Fisik</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsOpnameModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleOpnameSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Pilih Item Persediaan</label>
                <select 
                  value={selectedItemId} 
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setActualStock('');
                  }}
                  className="select-field"
                  required
                >
                  {stockItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.sku} - {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedItemObj && (
                <div className="opname-details-card">
                  <div className="opname-detail-row">
                    <span className="text-muted">Kategori:</span>
                    <span className="font-semibold">{selectedItemObj.category}</span>
                  </div>
                  <div className="opname-detail-row">
                    <span className="text-muted">Stok Sistem (Recorded):</span>
                    <span className="font-semibold">{selectedItemObj.stock} {selectedItemObj.unit}</span>
                  </div>
                  <div className="opname-detail-row">
                    <span className="text-muted">Safety Stock Threshold:</span>
                    <span className="text-warning font-semibold">{selectedItemObj.safetyStock} {selectedItemObj.unit}</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Jumlah Fisik Sebenarnya (Actual Qty)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Masukkan hitungan fisik aktual..."
                  value={actualStock}
                  onChange={(e) => setActualStock(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {selectedItemObj && actualStock !== '' && (
                <div className="opname-selisih-box">
                  <span>Selisih Penyesuaian:</span>
                  <span className={`font-bold ${Number(actualStock) - selectedItemObj.stock >= 0 ? 'text-success' : 'text-danger'}`}>
                    {(Number(actualStock) - selectedItemObj.stock) > 0 ? '+' : ''}
                    {(Number(actualStock) - selectedItemObj.stock).toFixed(2)} {selectedItemObj.unit}
                  </span>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsOpnameModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-brand">
                  Simpan Hasil Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
