import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Upload,
  Edit,
  CheckCircle2,
  XCircle,
  X,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories, formatRupiah } from '../data/mockData';
import './ProductManagement.css';

export default function ProductManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua'); // 'Semua', 'Aktif', 'Nonaktif'

  // Modal states for adding/editing a product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [imgBase64, setImgBase64] = useState('');
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
  }, [searchQuery, categoryFilter, typeFilter, statusFilter, products]);

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
          <button className="btn btn-brand" onClick={() => {
            setModalMode('add');
            setSelectedProductId(null);
            setImgBase64('');
            setNewProduct({
              sku: '',
              name: '',
              category: 'cat-01',
              price: '',
              cost: '',
              stock: '',
              type: 'PHYSICAL'
            });
            setIsModalOpen(true);
          }}>
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
                      <div className="product-table-identity" style={{ gap: 'var(--space-3)' }}>
                        {p.image ? (
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: 'var(--radius-md)', 
                              objectFit: 'cover',
                              border: '1px solid var(--border-default)',
                              flexShrink: 0
                            }} 
                          />
                        ) : (
                          <div 
                            style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: 'var(--radius-md)', 
                              background: 'var(--surface-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              border: '1px solid var(--border-default)',
                              fontSize: '1rem',
                              flexShrink: 0
                            }}
                          >
                            {categoryObj?.icon || '📦'}
                          </div>
                        )}
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
                        <button 
                          className="action-icon-btn hover-brand" 
                          title="Edit"
                          onClick={() => {
                            setModalMode('edit');
                            setSelectedProductId(p.id);
                            setImgBase64(p.image || '');
                            setNewProduct({
                              sku: p.sku,
                              name: p.name,
                              category: p.category,
                              price: p.price,
                              cost: p.cost,
                              stock: p.stock,
                              type: p.type
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="action-icon-btn hover-danger" 
                          title="Hapus"
                          onClick={() => {
                            if (window.confirm('Hapus produk ini?')) {
                              deleteProduct(p.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
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

      {/* Modal Tambah/Edit Produk */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Tambah Produk Baru' : 'Sunting Produk'}</h3>
              <button className="modal-close" onClick={() => { setIsModalOpen(false); setImgBase64(''); }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* Image Uploader */}
              <div className="image-uploader-container">
                <label className="input-label">Foto Produk</label>
                <div className="image-uploader-box" onClick={() => document.getElementById('prod-img-file').click()}>
                  <input
                    id="prod-img-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImgBase64(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  {imgBase64 ? (
                    <>
                      <img src={imgBase64} alt="Preview" className="image-preview-circle" />
                      <div className="image-uploader-info">
                        <span className="image-uploader-title">Foto Produk Dimuat</span>
                        <span className="image-uploader-desc">Klik di sini untuk mengganti foto</span>
                      </div>
                      <button
                        type="button"
                        className="image-uploader-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgBase64('');
                        }}
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="image-uploader-placeholder">
                      <Upload size={20} className="image-uploader-icon" />
                      <span>Klik untuk unggah foto produk</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="prod-sku">SKU Produk</label>
                <input
                  id="prod-sku"
                  type="text"
                  placeholder="Contoh: KSP-016"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="prod-name">Nama Produk</label>
                <input
                  id="prod-name"
                  type="text"
                  placeholder="Contoh: Kopi Caramel Latte"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="input-label" htmlFor="prod-category">Kategori</label>
                  <select
                    id="prod-category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="input"
                    style={{ width: '100%', height: '42px', padding: '8px 12px' }}
                  >
                    {categories.filter(c => c.id !== 'cat-06').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="prod-type">Tipe Produk</label>
                  <select
                    id="prod-type"
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                    className="input"
                    style={{ width: '100%', height: '42px', padding: '8px 12px' }}
                  >
                    <option value="PHYSICAL">Fisik (Physical)</option>
                    <option value="SERVICE">Layanan (Service)</option>
                    <option value="BUNDLE">Bundel (BOM)</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="input-label" htmlFor="prod-price">Harga Jual</label>
                  <input
                    id="prod-price"
                    type="number"
                    placeholder="25000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="prod-cost">HPP (Beli)</label>
                  <input
                    id="prod-cost"
                    type="number"
                    placeholder="8000"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label" htmlFor="prod-stock">Stok Awal</label>
                  <input
                    id="prod-stock"
                    type="number"
                    placeholder="100"
                    disabled={newProduct.type !== 'PHYSICAL'}
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setImgBase64(''); }}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!newProduct.sku || !newProduct.name || !newProduct.price || !newProduct.cost) {
                    alert('Harap lengkapi semua field!');
                    return;
                  }
                  
                  if (modalMode === 'add') {
                    addProduct({ ...newProduct, image: imgBase64 || null });
                  } else {
                    updateProduct(selectedProductId, { ...newProduct, image: imgBase64 || null });
                  }
                  
                  setIsModalOpen(false);
                  setImgBase64('');
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
                {modalMode === 'add' ? 'Simpan Produk' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
