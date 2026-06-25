import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Globe, Save, Layout, 
  ExternalLink, Lock, Unlock, Check, Sparkles, AlertCircle,
  BarChart3, FileText, Ticket, Users, Settings, TrendingUp,
  MousePointerClick, UserPlus, Eye, Search
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

  const [activeTab, setActiveTab] = useState('dashboard');

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

  const currentPreviewPage = cmsPages.find(p => p.slug === activePreviewSlug) || cmsPages.find(p => p.slug === 'home') || cmsPages[0];

  return (
    <div className="cms-layout animate-fadeIn">
      {/* Internal Sidebar */}
      <div className="cms-sidebar">
        <div className="cms-sidebar-header">
          <h2 className="cms-sidebar-title">Growth System</h2>
          <p className="cms-sidebar-subtitle">Super Admin Control Panel</p>
        </div>
        <nav className="cms-nav">
          <div className="cms-nav-section">Overview</div>
          <button 
            className={`cms-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={18} /> Dashboard & Analitik
          </button>
          
          <div className="cms-nav-section">Modules</div>
          <button 
            className={`cms-nav-item ${activeTab === 'website' ? 'active' : ''}`}
            onClick={() => setActiveTab('website')}
          >
            <Globe size={18} /> Website Builder
          </button>
          <button 
            className={`cms-nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            <FileText size={18} /> Blog & Knowledge
          </button>
          <button 
            className={`cms-nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Ticket size={18} /> Events & Academy
          </button>
          <button 
            className={`cms-nav-item ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            <Users size={18} /> Community Hub
          </button>

          <div className="cms-nav-section">Configuration</div>
          <button 
            className={`cms-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Pengaturan Global
          </button>
        </nav>
      </div>

      {/* Workspace Area */}
      <div className="cms-workspace">
        
        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            <div className="workspace-header">
              <h1 className="workspace-title">Growth Dashboard</h1>
              <p className="workspace-subtitle">Ringkasan performa seluruh aset marketing dan website Anda hari ini.</p>
            </div>
            
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Total Visitors</span>
                  <Eye size={16} />
                </div>
                <div className="kpi-value">124.5K</div>
                <div className="kpi-trend positive"><TrendingUp size={14} /> +12.5% vs bulan lalu</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Conversion Rate</span>
                  <MousePointerClick size={16} />
                </div>
                <div className="kpi-value">4.2%</div>
                <div className="kpi-trend positive"><TrendingUp size={14} /> +0.8% vs bulan lalu</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">Trial Signups</span>
                  <UserPlus size={16} />
                </div>
                <div className="kpi-value">842</div>
                <div className="kpi-trend negative"><TrendingUp size={14} style={{transform: 'rotate(180deg)'}} /> -2.1% vs minggu lalu</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-title">SEO Score</span>
                  <Search size={16} />
                </div>
                <div className="kpi-value" style={{color: 'var(--success-600)'}}>98/100</div>
                <div className="kpi-trend neutral"><Check size={14} /> Sangat Sehat</div>
              </div>
            </div>

            <div className="chart-container flex items-center justify-center">
              <div className="text-center text-muted">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Modul Visualisasi Grafik Interaktif akan dimuat di sini</p>
                <p className="text-sm">Menampilkan data Timeseries dari Analytics API</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: WEBSITE BUILDER (Original Code) */}
        {activeTab === 'website' && (
          <div className="animate-fadeIn">
            <div className="workspace-header">
              <h1 className="workspace-title">Website Builder</h1>
              <p className="workspace-subtitle">Kelola *Landing Page* publik dan identitas digital bisnis Anda.</p>
            </div>

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
                                    title="Edit Halaman"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    className="action-btn delete-btn" 
                                    onClick={() => handleDeletePage(page.id)}
                                    title="Hapus Halaman"
                                  >
                                    <Trash2 size={16} />
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

              {/* Right Column: Live Preview */}
              <div className="preview-column">
                <div className="preview-browser">
                  <div className="browser-header">
                    <div className="browser-dots">
                      <div className="dot red"></div>
                      <div className="dot yellow"></div>
                      <div className="dot green"></div>
                    </div>
                    <div className="browser-url">
                      https://{domain || 'nama-usaha.steccapos.id'}/{activePreviewSlug}
                    </div>
                  </div>
                  
                  {/* Website Canvas */}
                  <div className="browser-content" style={{ backgroundColor: layoutStyle === 'classic' ? '#f3f4f6' : '#ffffff' }}>
                    {currentPreviewPage ? (
                      <>
                        <div 
                          className="preview-hero"
                          style={{ 
                            background: layoutStyle === 'minimalist' ? '#111827' : themeColor,
                            textAlign: layoutStyle === 'classic' ? 'left' : 'center'
                          }}
                        >
                          <h1>{currentPreviewPage.title}</h1>
                          <p style={{ opacity: 0.9, maxWidth: '600px', margin: layoutStyle === 'classic' ? '0' : '0 auto' }}>
                            Pratinjau langsung konten website Anda. Perubahan akan langsung terlihat oleh publik jika status Published.
                          </p>
                        </div>
                        <div className="preview-body" style={{ whiteSpace: 'pre-wrap' }}>
                          {currentPreviewPage.content || <span className="text-muted italic">Konten halaman kosong...</span>}
                        </div>
                      </>
                    ) : (
                      <div className="empty-state" style={{ height: '100%' }}>
                        <Sparkles size={48} className="text-muted mb-4 opacity-50" />
                        <p className="text-muted font-medium">Pilih atau buat halaman untuk melihat pratinjau</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: BLOG PLACEHOLDER */}
        {activeTab === 'blog' && (
          <div className="animate-fadeIn">
            <div className="workspace-header">
              <h1 className="workspace-title">Blog & Knowledge Ecosystem</h1>
              <p className="workspace-subtitle">Tingkatkan otoritas brand dan tarik prospek melalui content marketing dan SEO.</p>
            </div>
            <div className="premium-placeholder">
              <div className="premium-placeholder-icon"><FileText size={32} /></div>
              <h3>Modul Content Marketing Enterprise</h3>
              <p>Ekosistem Blog & SEO tingkat lanjut ini memerlukan lisensi <strong>Professional</strong> atau <strong>Enterprise</strong>. Dapatkan fitur AI Content Assistant, Article Scheduler, SEO Optimizer, dan Newsletter Automation.</p>
              <button className="btn btn-primary" onClick={() => alert('Mengarahkan ke halaman Upgrade Plan...')}>Upgrade Plan <ExternalLink size={16}/></button>
            </div>
          </div>
        )}

        {/* VIEW: EVENTS PLACEHOLDER */}
        {activeTab === 'events' && (
          <div className="animate-fadeIn">
            <div className="workspace-header">
              <h1 className="workspace-title">Events & Academy</h1>
              <p className="workspace-subtitle">Sistem manajemen siklus hidup webinar, kelas sertifikasi, dan acara offline.</p>
            </div>
            <div className="premium-placeholder">
              <div className="premium-placeholder-icon"><Ticket size={32} /></div>
              <h3>Learning Management System (LMS) & Event Hub</h3>
              <p>Ubah pelanggan menjadi advokat brand melalui edukasi. Fasilitasi pendaftaran tiket acara B2B dan akademi sertifikasi langsung dari ekosistem BMS Anda.</p>
              <button className="btn btn-primary" onClick={() => alert('Mengarahkan ke halaman Upgrade Plan...')}>Unlock Module <ExternalLink size={16}/></button>
            </div>
          </div>
        )}

        {/* VIEW: COMMUNITY PLACEHOLDER */}
        {activeTab === 'community' && (
          <div className="animate-fadeIn">
            <div className="workspace-header">
              <h1 className="workspace-title">Community Hub</h1>
              <p className="workspace-subtitle">Platform diskusi terpadu untuk menumbuhkan interaksi antar pengguna B2B Anda.</p>
            </div>
            <div className="premium-placeholder">
              <div className="premium-placeholder-icon"><Users size={32} /></div>
              <h3>Membangun Brand Advocacy</h3>
              <p>Kelola topik diskusi, berikan lencana apresiasi, dan jalankan program kemitraan/afiliasi (Partner Portal) untuk menciptakan siklus pertumbuhan organik.</p>
              <button className="btn btn-primary" onClick={() => alert('Mengarahkan ke halaman Upgrade Plan...')}>Hubungi Tim Sales <ExternalLink size={16}/></button>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS PLACEHOLDER */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <div className="workspace-header">
              <h1 className="workspace-title">Pengaturan Integrasi & Keamanan</h1>
              <p className="workspace-subtitle">Konfigurasi API, Webhooks, Privacy Policy, dan App Marketplace.</p>
            </div>
            <div className="premium-placeholder">
              <div className="premium-placeholder-icon"><Settings size={32} /></div>
              <h3>Pusat Keamanan & Kepatuhan</h3>
              <p>Kelola pengaturan GDPR, Cookie Consent, akses API Key ke aplikasi eksternal (Zapier/Make), dan peran akses (RBAC) bagi setiap manajer operasional Anda.</p>
            </div>
          </div>
        )}

      </div>

      {/* Page Editor Modal (Unchanged) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleUp" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'add' ? 'Tambah Halaman Baru' : 'Sunting Halaman'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSavePage} className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="page-title">Judul Halaman <span className="text-danger">*</span></label>
                <input
                  id="page-title"
                  type="text"
                  className="form-control"
                  placeholder="Misal: Tentang Kami"
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value);
                    if (modalMode === 'add') {
                      setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="page-slug">URL Slug / Path <span className="text-danger">*</span></label>
                <div className="domain-input-wrapper">
                  <span className="domain-prefix">/{domain ? domain.split('.')[0] : ''}</span>
                  <input
                    id="page-slug"
                    type="text"
                    className="form-control"
                    placeholder="tentang-kami"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="page-content">Konten (Text/HTML)</label>
                <textarea
                  id="page-content"
                  className="form-control"
                  rows="6"
                  placeholder="Tulis isi halaman di sini..."
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pagePublished}
                    onChange={(e) => setPagePublished(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span className="font-medium">Publish Halaman Ini</span>
                </label>
                <p className="text-sm text-muted mt-1 ml-6">Jika tidak dicentang, halaman akan disimpan sebagai draf.</p>
              </div>

              <div className="modal-footer mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Simpan Halaman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
