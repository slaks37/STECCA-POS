import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Globe, Save, Layout, 
  ExternalLink, Lock, Unlock, Check, Sparkles, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './CMSManager.css';

export default function CMSManager() {
  const { 
    cmsWebsite, 
    cmsPages, 
    updateCmsWebsite, 
    addCmsPage, 
    updateCmsPage, 
    deleteCmsPage 
  } = useApp();

  // Local state for Website Settings
  const [domain, setDomain] = useState('');
  const [themeColor, setThemeColor] = useState('#818cf8');
  const [layoutStyle, setLayoutStyle] = useState('modern');
  const [isSavingWeb, setIsSavingWeb] = useState(false);

  // Local state for Page Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pagePublished, setPagePublished] = useState(true);

  // Live preview interactive state
  const [activePreviewSlug, setActivePreviewSlug] = useState('home');

  // Load website settings when cmsWebsite is fetched
  useEffect(() => {
    if (cmsWebsite) {
      setDomain(cmsWebsite.domain || '');
      if (cmsWebsite.theme_config) {
        setThemeColor(cmsWebsite.theme_config.color || '#818cf8');
        setLayoutStyle(cmsWebsite.theme_config.layout || 'modern');
      }
    }
  }, [cmsWebsite]);

  const handleSaveWebsite = async (e) => {
    e.preventDefault();
    if (!cmsWebsite) return;
    setIsSavingWeb(true);
    await updateCmsWebsite(cmsWebsite.id, domain, { color: themeColor, layout: layoutStyle });
    setIsSavingWeb(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedPageId(null);
    setPageTitle('');
    setPageSlug('');
    setPageContent('');
    setPagePublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (page) => {
    setModalMode('edit');
    setSelectedPageId(page.id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageContent(page.content);
    setPagePublished(page.published);
    setIsModalOpen(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim()) return;

    const pageData = {
      website_id: cmsWebsite?.id || 'web-001',
      title: pageTitle,
      slug: pageSlug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      content: pageContent,
      published: pagePublished
    };

    if (modalMode === 'add') {
      await addCmsPage(pageData);
    } else {
      await updateCmsPage(selectedPageId, pageData);
    }

    setIsModalOpen(false);
  };

  const handleDeletePage = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus halaman ini?')) {
      await deleteCmsPage(id);
      if (activePreviewSlug === id) {
        setActivePreviewSlug('home');
      }
    }
  };

  const themeColors = [
    { name: 'Indigo Sleek', hex: '#818cf8' },
    { name: 'Emerald Forest', hex: '#10b981' },
    { name: 'Amber Gold', hex: '#fbbf24' },
    { name: 'Rose Petal', hex: '#f43f5e' },
    { name: 'Violet Velvet', hex: '#8b5cf6' },
  ];

  // Find page for live preview
  const currentPreviewPage = cmsPages.find(p => p.slug === activePreviewSlug) || cmsPages.find(p => p.slug === 'home') || cmsPages[0];

  return (
    <div className="cms-container animate-fadeIn">
      <div className="grid-layout">
        
        {/* Left Column: Editor Controls */}
        <div className="editor-column">
          
          {/* Website Config Card */}
          <div className="card config-card">
            <div className="card-header">
              <div className="header-icon-wrapper">
                <Globe size={18} className="text-brand" />
              </div>
              <div>
                <h3 className="card-title">Pengaturan Domain & Tema Website</h3>
                <p className="card-subtitle">Atur alamat domain publik dan gaya visual landing page Anda</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveWebsite} className="card-body">
              <div className="form-group">
                <label className="form-label" htmlFor="domain-input">Domain URL</label>
                <div className="domain-input-wrapper">
                  <span className="domain-prefix">https://</span>
                  <input
                    id="domain-input"
                    type="text"
                    className="form-control"
                    placeholder="nama-usaha.steccapos.id"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skema Warna Website</label>
                <div className="theme-selector-grid">
                  {themeColors.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      className={`theme-color-btn ${themeColor === color.hex ? 'active' : ''}`}
                      onClick={() => setThemeColor(color.hex)}
                      style={{ '--btn-theme-color': color.hex }}
                      title={color.name}
                    >
                      <span className="color-dot" style={{ backgroundColor: color.hex }}></span>
                      <span className="color-label">{color.name.split(' ')[0]}</span>
                      {themeColor === color.hex && <Check size={14} className="check-icon" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="layout-select">Layout Landing Page</label>
                <select
                  id="layout-select"
                  className="form-control"
                  value={layoutStyle}
                  onChange={(e) => setLayoutStyle(e.target.value)}
                >
                  <option value="modern">Modern & Dinamis (Full Width)</option>
                  <option value="minimalist">Minimalis & Bersih (Monokromatik)</option>
                  <option value="classic">Klasik & Profesional (Structured)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2" disabled={isSavingWeb}>
                <Save size={16} />
                <span>{isSavingWeb ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </form>
          </div>

          {/* Pages CRUD Card */}
          <div className="card pages-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <div className="header-icon-wrapper">
                  <Layout size={18} className="text-accent" />
                </div>
                <div>
                  <h3 className="card-title">Kelola Halaman Website</h3>
                  <p className="card-subtitle">Buat, sunting, dan publish halaman mandiri</p>
                </div>
              </div>
              <button className="btn btn-outline flex items-center gap-1 btn-sm" onClick={handleOpenAddModal}>
                <Plus size={16} />
                <span>Halaman Baru</span>
              </button>
            </div>

            <div className="card-body p-0">
              {cmsPages.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={32} className="text-muted mb-2" />
                  <p className="text-muted text-sm">Belum ada halaman website.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="pages-table">
                    <thead>
                      <tr>
                        <th>Judul Halaman</th>
                        <th>Slug / Path</th>
                        <th>Status</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cmsPages.map((page) => (
                        <tr key={page.id} className="page-row">
                          <td className="font-semibold">{page.title}</td>
                          <td>
                            <code className="slug-code">/{page.slug}</code>
                          </td>
                          <td>
                            {page.published ? (
                              <span className="badge badge-success flex items-center gap-1 inline-flex">
                                <Unlock size={10} /> Published
                              </span>
                            ) : (
                              <span className="badge badge-neutral flex items-center gap-1 inline-flex">
                                <Lock size={10} /> Draft
                              </span>
                            )}
                          </td>
                          <td className="text-right actions-cell">
                            <button 
                              className="action-btn edit-btn" 
                              onClick={() => handleOpenEditModal(page)}
                              title="Sunting Halaman"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="action-btn delete-btn" 
                              onClick={() => handleDeletePage(page.id)}
                              title="Hapus Halaman"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Browser Preview Mockup */}
        <div className="preview-column">
          <div className="preview-sticky-wrapper">
            <div className="preview-header-bar justify-between">
              <span className="preview-header-title">Live Website Mockup Preview</span>
              <span className="badge badge-accent text-xs flex items-center gap-1">
                <Sparkles size={10} /> Real-Time Sync
              </span>
            </div>

            {/* Mock Browser Frame */}
            <div className="mock-browser" style={{ '--website-theme-color': themeColor }}>
              
              {/* Browser Address Bar */}
              <div className="browser-address-bar">
                <div className="browser-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="browser-url-input">
                  <Globe size={12} className="url-icon" />
                  <span>https://{domain || 'your-business.steccapos.id'}</span>
                </div>
                <ExternalLink size={12} className="url-action-icon" />
              </div>

              {/* Live Rendered Canvas */}
              <div className={`browser-canvas layout-${layoutStyle}`}>
                
                {/* Website Header */}
                <header className="website-nav">
                  <div className="website-logo font-bold">
                    <span className="logo-accent" style={{ color: themeColor }}>●</span>
                    <span>{domain.split('.')[0]?.toUpperCase() || 'STECCA BRAND'}</span>
                  </div>
                  <nav className="website-links">
                    {cmsPages
                      .filter(p => p.published)
                      .map(p => (
                        <button
                          key={p.id}
                          type="button"
                          className={`nav-preview-link ${currentPreviewPage?.slug === p.slug ? 'active' : ''}`}
                          onClick={() => setActivePreviewSlug(p.slug)}
                          style={{
                            borderBottomColor: currentPreviewPage?.slug === p.slug ? themeColor : 'transparent',
                            color: currentPreviewPage?.slug === p.slug ? themeColor : 'inherit'
                          }}
                        >
                          {p.title}
                        </button>
                      ))}
                  </nav>
                  <button className="website-action-btn" style={{ backgroundColor: themeColor }}>
                    Hubungi Kami
                  </button>
                </header>

                {/* Website Content */}
                {currentPreviewPage ? (
                  <div className="website-content-body animate-fadeIn">
                    
                    {/* Hero Section if home */}
                    {currentPreviewPage.slug === 'home' && (
                      <div className="website-hero-banner" style={{ background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}05 100%)` }}>
                        <div className="hero-badge" style={{ color: themeColor, backgroundColor: `${themeColor}15` }}>
                          ✨ Kualitas & Pelayanan Terbaik
                        </div>
                        <h1 className="hero-title">{currentPreviewPage.title}</h1>
                        <p className="hero-desc">
                          Kami menyajikan yang terbaik untuk pelanggan setia kami. Temukan kenyamanan dan kelezatan di setiap pelayanan kami.
                        </p>
                        <div className="hero-actions">
                          <button className="hero-primary-btn" style={{ backgroundColor: themeColor }}>
                            Lihat Menu Kami
                          </button>
                          <button className="hero-secondary-btn" style={{ borderColor: themeColor, color: themeColor }}>
                            Reservasi Meja
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="website-page-inner">
                      {currentPreviewPage.slug !== 'home' && (
                        <h2 className="preview-page-title">{currentPreviewPage.title}</h2>
                      )}
                      
                      {/* Dynamic content rendering line breaks */}
                      <div className="preview-page-content">
                        {currentPreviewPage.content.split('\n').map((line, idx) => (
                          <p key={idx} className="content-paragraph">{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Standard Mock Footer */}
                    <footer className="website-footer">
                      <p>© {new Date().getFullYear()} {domain || 'steccapos.id'}. Powered by STECCA POS Engine.</p>
                    </footer>
                  </div>
                ) : (
                  <div className="canvas-empty">
                    <Globe size={40} className="text-muted opacity-30 mb-2" />
                    <p className="text-muted text-xs">Pilih atau buat halaman untuk preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Page Modal (Add / Edit Halaman) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            
            <div className="modal-header justify-between">
              <h3 className="modal-title">
                {modalMode === 'add' ? 'Tambah Halaman Baru' : 'Sunting Halaman'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSavePage}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="page-title-input">Judul Halaman</label>
                  <input
                    id="page-title-input"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Menu Kopi Spesial"
                    value={pageTitle}
                    onChange={(e) => {
                      setPageTitle(e.target.value);
                      if (modalMode === 'add') {
                        // Auto slug generator
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-'));
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="page-slug-input">Slug URL (Path)</label>
                  <div className="domain-input-wrapper">
                    <span className="domain-prefix">/</span>
                    <input
                      id="page-slug-input"
                      type="text"
                      className="form-control"
                      placeholder="contoh-halaman"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      required
                    />
                  </div>
                  <p className="form-help text-xs text-muted">Hanya huruf kecil, angka, dash (-), dan underscore (_)</p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="page-content-input">Konten Halaman (Plain Text/Markdown)</label>
                  <textarea
                    id="page-content-input"
                    className="form-control text-area-large"
                    placeholder="Tuliskan konten halaman di sini..."
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    rows={8}
                    required
                  />
                </div>

                <div className="form-group flex-row items-center gap-2 mt-2">
                  <input
                    id="page-publish-check"
                    type="checkbox"
                    className="checkbox-control"
                    checked={pagePublished}
                    onChange={(e) => setPagePublished(e.target.checked)}
                  />
                  <label className="form-label mb-0 cursor-pointer" htmlFor="page-publish-check">
                    Publish halaman ini langsung agar dapat diakses publik
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>{modalMode === 'add' ? 'Buat Halaman' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
