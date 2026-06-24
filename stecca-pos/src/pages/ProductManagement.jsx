import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Upload,
  Package,
  Layers,
  Edit,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories, formatRupiah } from '../data/mockData';
import './ProductManagement.css';

export default function ProductManagement() {
  const { products, addProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua'); // 'Semua', 'Aktif', 'Nonaktif'

  // Modal states for adding a product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'cat-01',
    price: '',
    cost: '',
    stock: '',
    type: 'PHYSICAL'
  });

  // Filter products catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const categoryName = categories.find((c) => c.id === p.category)?.name || '';
      const matchesCategory = categoryFilter === 'Semua' || categoryName === categoryFilter || p.category === categoryFilter;

      const matchesType = typeFilter === 'Semua' || p.type === typeFilter;
      
      const matchesStatus = statusFilter === 'Semua' || 
                            (statusFilter === 'Aktif' && p.active) || 
                            (statusFilter === 'Nonaktif' && !p.active);

      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [searchQuery, categoryFilter, typeFilter, statusFilter]);

  // Margin styling calculator
  const getMarginClass = (margin) => {
    if (margin > 50) return 'text-success';
    if (margin >= 30) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="catalog-container animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Manajemen Produk</h2>
          <p className="page-description">Kelola katalog produk & layanan</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Upload size={16} />
            <span>Import CSV</span>
          </button>
          <button className="btn btn-brand" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter and Query Controls */}
      <div className="card catalog-filters">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari SKU atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
        </div>

        <div className="filters-group-row">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.filter((c) => c.id !== 'cat-06').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select-field"
          >
            <option value="Semua">Semua Tipe</option>
            <option value="PHYSICAL">Fisik (Physical)</option>
            <option value="SERVICE">Layanan (Service)</option>
            <option value="RAW">Bahan Baku (Raw)</option>
            <option value="BUNDLE">Bundel (BOM)</option>
          </select>

          {/* Status Toggle buttons */}
          <div className="status-toggle-pills">
            {['Semua', 'Aktif', 'Nonaktif'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`status-pill ${statusFilter === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Catalog Table */}
      <div className="card catalog-table-card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Tipe</th>
                <th className="text-right">Harga Jual</th>
                <th className="text-right">HPP</th>
                <th className="text-right">Margin %</th>
                <th className="text-right">Stok</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const categoryObj = categories.find((c) => c.id === p.category);
                const margin = (((p.price - p.cost) / p.price) * 100).toFixed(1);
                
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.sku}</td>
                    <td>
                      <div className="product-table-identity">
                        <span className="product-category-bullet" style={{ backgroundColor: categoryObj?.color || 'var(--brand-500)' }}></span>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td>{categoryObj?.name || 'Umum'}</td>
                    <td>
                      <span className={`badge ${
                        p.type === 'BUNDLE' ? 'badge-brand' : 
                        p.type === 'PHYSICAL' ? 'badge-success' : 
                        p.type === 'SERVICE' ? 'badge-info' : 
                        'badge-neutral'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="text-right font-semibold">{formatRupiah(p.price)}</td>
                    <td className="text-right text-muted">{formatRupiah(p.cost)}</td>
                    <td className={`text-right font-semibold ${getMarginClass(margin)}`}>
                      {margin}%
                    </td>
                    <td className="text-right font-semibold">{p.stock === 999 ? '∞' : p.stock}</td>
                    <td className="text-center">
                      {p.active ? (
                        <CheckCircle2 size={16} className="text-success inline-block" />
                      ) : (
                        <XCircle size={16} className="text-danger inline-block" />
                      )}
                    </td>
                    <td className="text-center">
                      <div className="action-buttons-wrapper">
                        <button className="action-icon-btn hover-brand" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="action-icon-btn hover-neutral">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer-summary">
          <span>Menampilkan {filteredProducts.length} dari {products.length} produk</span>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {isModalOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal card animate-scaleUp">
            <div className="modal-header">
              <h3>Tambah Produk Baru</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label">SKU Produk</label>
                <input
                  type="text"
                  placeholder="Contoh: KSP-016"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Contoh: Kopi Caramel Latte"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="input-label">Kategori</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="select-field"
                    style={{ width: '100%', height: 'var(--input-height)' }}
                  >
                    {categories.filter(c => c.id !== 'cat-06').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label">Tipe Produk</label>
                  <select
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                    className="select-field"
                    style={{ width: '100%', height: 'var(--input-height)' }}
                  >
                    <option value="PHYSICAL">Fisik (Physical)</option>
                    <option value="SERVICE">Layanan (Service)</option>
                    <option value="BUNDLE">Bundel (BOM)</option>
                  </select>
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="input-label">Harga Jual</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">HPP (Beli)</label>
                  <input
                    type="number"
                    placeholder="8000"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Stok Awal</label>
                  <input
                    type="number"
                    placeholder="100"
                    disabled={newProduct.type !== 'PHYSICAL'}
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button
                className="btn btn-brand"
                onClick={() => {
                  if (!newProduct.sku || !newProduct.name || !newProduct.price || !newProduct.cost) {
                    alert('Harap lengkapi semua field!');
                    return;
                  }
                  addProduct(newProduct);
                  setIsModalOpen(false);
                  setNewProduct({
                    sku: '',
                    name: '',
                    category: 'cat-01',
                    price: '',
                    cost: '',
                    stock: '',
                    type: 'PHYSICAL'
                  });
                }}
              >
                Simpan Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
