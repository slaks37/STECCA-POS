import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, LayoutDashboard, Database, Repeat, 
  Store, LineChart, Package, Users, CalendarClock,
  CreditCard, ChevronDown, Check, Globe
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="landing-page">
      {/* Public Header */}
      <header className="public-header">
        <Link to="/" className="public-header-brand">
          <div className="public-header-logo">S</div>
          STECCA POS
        </Link>
        <nav className="public-nav">
          <a href="#product">Product</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog & Academy</a>
        </nav>
        <div className="public-header-actions">
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/login" className="btn-primary">Mulai Gratis 14 Hari</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">✨ V2.0 Enterprise Edition Baru Saja Rilis</div>
          <h1 className="hero-title">Satu Ekosistem Digital untuk Skalakan Bisnis Anda.</h1>
          <p className="hero-subtitle">
            STECCA POS menyatukan POS, CRM, Inventori, Keuangan, dan HR dalam satu platform. 
            Tingkatkan efisiensi, otomatisasi operasional, dan ambil keputusan lebih cepat.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn-primary">
              Mulai Free Trial 14 Hari <ArrowRight size={18} />
            </Link>
            <a href="#demo" className="btn-secondary">
              Jadwalkan Live Demo
            </a>
          </div>
        </div>

        {/* Hero Dashboard Mockup */}
        <div className="hero-mockup">
          <div className="mockup-frame">
            <div className="mockup-inner">
              <div className="mockup-sidebar">
                <div style={{width: '60%', height: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '24px'}}></div>
                <div style={{width: '80%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px'}}></div>
                <div style={{width: '70%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px'}}></div>
                <div style={{width: '85%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px'}}></div>
              </div>
              <div className="mockup-main">
                <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                  <div style={{flex: 1, height: '80px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0'}}></div>
                  <div style={{flex: 1, height: '80px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0'}}></div>
                  <div style={{flex: 1, height: '80px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0'}}></div>
                </div>
                <div style={{height: '200px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof">
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <p className="section-subtitle">Telah dipercaya oleh 5.000+ bisnis berkembang di seluruh Indonesia</p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '24px', opacity: 0.5}}>
             {/* Logo placeholders */}
             <div style={{fontWeight: 800, fontSize: '1.2rem'}}>KOPI KENARI</div>
             <div style={{fontWeight: 800, fontSize: '1.2rem'}}>TECH RETAIL</div>
             <div style={{fontWeight: 800, fontSize: '1.2rem'}}>AESTHETIC CLINIC</div>
             <div style={{fontWeight: 800, fontSize: '1.2rem'}}>GROCERY MART</div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">20T+</div>
            <div className="stat-label">Transaksi Diproses (Rp)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">15K+</div>
            <div className="stat-label">Cabang Terhubung</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100K+</div>
            <div className="stat-label">Pengguna Aktif Harian</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime Server Terjamin</div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="section section-gray" id="challenges">
        <div className="section-header">
          <h2 className="section-title">Masih Terjebak Cara Lama?</h2>
          <p className="section-subtitle">Tinggalkan proses manual yang memperlambat laju pertumbuhan bisnis Anda.</p>
        </div>
        <div className="challenges-grid">
          <div className="challenge-card">
            <div className="challenge-icon"><Database size={24}/></div>
            <h3>Data Terpisah (Silos)</h3>
            <p>Menggunakan belasan aplikasi berbeda yang tidak bisa berkomunikasi, membuat keputusan jadi lambat.</p>
            <div className="challenge-solution"><Check size={16}/> Solusi: Ekosistem Terintegrasi</div>
          </div>
          <div className="challenge-card">
            <div className="challenge-icon"><Repeat size={24}/></div>
            <h3>Kesalahan Stok</h3>
            <p>Stok di sistem tidak pernah sama dengan fisik di gudang, berujung pada overstock atau stockout.</p>
            <div className="challenge-solution"><Check size={16}/> Solusi: Real-time Inventory</div>
          </div>
          <div className="challenge-card">
            <div className="challenge-icon"><Store size={24}/></div>
            <h3>Sulit Pantau Cabang</h3>
            <p>Harus datang langsung ke setiap lokasi untuk memastikan SOP berjalan dengan benar.</p>
            <div className="challenge-solution"><Check size={16}/> Solusi: Centralized Dashboard</div>
          </div>
          <div className="challenge-card">
            <div className="challenge-icon"><CalendarClock size={24}/></div>
            <h3>Laporan Lambat</h3>
            <p>Laporan laba rugi baru selesai minggu kedua di bulan berikutnya karena entri manual.</p>
            <div className="challenge-solution"><Check size={16}/> Solusi: Live Financial PnL</div>
          </div>
        </div>
      </section>

      {/* Unified Platform */}
      <section className="section section-light">
        <div className="section-header">
          <h2 className="section-title">Satu Data. Satu Sistem.</h2>
          <p className="section-subtitle">Saat transaksi terjadi di POS, stok gudang otomatis terpotong, jurnal akuntansi tercatat, dan laporan Anda diperbarui dalam hitungan milidetik.</p>
        </div>
        <div className="unified-visual">
          <div className="unified-lines"></div>
          <div className="unified-center">STECCA</div>
          <div className="unified-node node-1">POS Kasir</div>
          <div className="unified-node node-2">CRM</div>
          <div className="unified-node node-3">Inventory</div>
          <div className="unified-node node-4">Finance</div>
          <div className="unified-node node-5">HR & Payroll</div>
          <div className="unified-node node-6">Analytics</div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section className="section section-gray" id="product">
        <div className="section-header">
          <h2 className="section-title">Modul Bisnis Inti</h2>
          <p className="section-subtitle">Dari kasir hingga pembukuan, semuanya tersedia *out-of-the-box* tanpa perlu integrasi pihak ketiga yang merepotkan.</p>
        </div>
        <div className="modules-grid">
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon"><LayoutDashboard /></div>
              <div className="module-title">POS & Sales</div>
            </div>
            <p className="module-desc">Titik penjualan super cepat yang tetap berfungsi walau tanpa internet (Offline-first).</p>
            <ul className="module-features">
              <li><Check size={16} /> Multi-payment & Split Bill</li>
              <li><Check size={16} /> Offline Mode Synchronization</li>
            </ul>
          </div>
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon"><Package /></div>
              <div className="module-title">Inventory & Warehouse</div>
            </div>
            <p className="module-desc">Kendali mutlak atas aset terbesar Anda dengan notifikasi otomatis untuk stok menipis.</p>
            <ul className="module-features">
              <li><Check size={16} /> Multi-gudang & Transfer Cabang</li>
              <li><Check size={16} /> Recipe / BOM (Bill of Materials)</li>
            </ul>
          </div>
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon"><Users /></div>
              <div className="module-title">HR & Payroll</div>
            </div>
            <p className="module-desc">Absensi selfie geo-fencing, manajemen roster shift, hingga perhitungan komisi transparan.</p>
            <ul className="module-features">
              <li><Check size={16} /> Auto-Payroll & Hitung Lembur</li>
              <li><Check size={16} /> Verifikasi Kehadiran GPS</li>
            </ul>
          </div>
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon"><CreditCard /></div>
              <div className="module-title">Accounting & Finance</div>
            </div>
            <p className="module-desc">Laporan laba rugi instan dengan jurnal yang terbuat secara otomatis dari setiap transaksi.</p>
            <ul className="module-features">
              <li><Check size={16} /> Real-time PnL & Balance Sheet</li>
              <li><Check size={16} /> Automated Invoicing</li>
            </ul>
          </div>
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon"><Globe /></div>
              <div className="module-title">Website CMS Builder</div>
            </div>
            <p className="module-desc">Buat landing page dan toko online langsung dari sistem tanpa perlu hosting eksternal.</p>
            <ul className="module-features">
              <li><Check size={16} /> Drag-and-drop Page Builder</li>
              <li><Check size={16} /> Terintegrasi ke Katalog POS</li>
            </ul>
          </div>
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon"><LineChart /></div>
              <div className="module-title">Business Intelligence</div>
            </div>
            <p className="module-desc">Ubah data mentah menjadi wawasan bisnis dengan dashboard tingkat eksekutif.</p>
            <ul className="module-features">
              <li><Check size={16} /> Sales Forecasting</li>
              <li><Check size={16} /> Analisis Performa Cabang</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section section-light" id="pricing">
        <div className="section-header">
          <h2 className="section-title">Investasi untuk Pertumbuhan</h2>
          <p className="section-subtitle">Harga transparan, bayar sesuai skala pertumbuhan Anda. Tanpa komisi tersembunyi per transaksi.</p>
        </div>
        <div className="pricing-grid">
          {/* Starter */}
          <div className="pricing-card">
            <div className="pricing-name">Starter</div>
            <div className="pricing-target">Toko Tunggal & UMKM pemula.</div>
            <h3 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '24px'}}>Gratis</h3>
            <ul className="pricing-features">
              <li><Check size={16}/> 1 Cabang</li>
              <li><Check size={16}/> 3 Pengguna</li>
              <li><Check size={16}/> POS & Basic Inventory</li>
              <li><Check size={16}/> Laporan Standar</li>
            </ul>
            <Link to="/login" className="btn-secondary" style={{width: '100%', justifyContent: 'center'}}>Mulai Gratis</Link>
          </div>

          {/* Professional */}
          <div className="pricing-card popular">
            <div className="pricing-badge">PALING POPULER</div>
            <div className="pricing-name">Professional</div>
            <div className="pricing-target">Bisnis berkembang dengan 3-10 cabang.</div>
            <h3 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '24px'}}>Rp 299k<span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/bln</span></h3>
            <ul className="pricing-features">
              <li><Check size={16}/> Cabang Tak Terbatas</li>
              <li><Check size={16}/> 50 Pengguna</li>
              <li><Check size={16}/> Seluruh Modul Inti (HR, Finance, CMS)</li>
              <li><Check size={16}/> 24/7 Priority Support</li>
            </ul>
            <Link to="/login" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>Coba 14 Hari</Link>
          </div>

          {/* Enterprise */}
          <div className="pricing-card">
            <div className="pricing-name">Enterprise</div>
            <div className="pricing-target">Korporasi besar & franchise nasional.</div>
            <h3 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '24px'}}>Custom</h3>
            <ul className="pricing-features">
              <li><Check size={16}/> Pengguna Tak Terbatas</li>
              <li><Check size={16}/> Advanced BI & API Access</li>
              <li><Check size={16}/> Dedicated Account Manager</li>
              <li><Check size={16}/> On-Premise / VVIP SLA</li>
            </ul>
            <button className="btn-secondary" style={{width: '100%', justifyContent: 'center'}}>Hubungi Sales</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-gray">
        <div className="section-header">
          <h2 className="section-title">Kisah Sukses Pelanggan</h2>
          <p className="section-subtitle">Lihat bagaimana STECCA POS mengubah cara mereka beroperasi.</p>
        </div>
        <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <div style={{background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-default)', maxWidth: '400px'}}>
            <div style={{color: '#f59e0b', marginBottom: '16px'}}>★★★★★</div>
            <p style={{fontStyle: 'italic', marginBottom: '24px'}}>
              "Dulu saya butuh 2 minggu untuk rekap PnL dari 15 cabang cafe kami. Sekarang? PnL saya ter-update real-time setiap kali kasir mencetak struk. Luar biasa."
            </p>
            <div style={{fontWeight: 700}}>Siti A.</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Founder, Chain Cafe Kopi</div>
          </div>
          <div style={{background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-default)', maxWidth: '400px'}}>
            <div style={{color: '#f59e0b', marginBottom: '16px'}}>★★★★★</div>
            <p style={{fontStyle: 'italic', marginBottom: '24px'}}>
              "Sistem lama selalu crash saat Harbolnas. Beralih ke STECCA adalah keputusan terbaik. Menangani 10.000 transaksi sehari tanpa delay. Sinkronisasi gudangnya ajaib."
            </p>
            <div style={{fontWeight: 700}}>Budi S.</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>CEO, Retail Elektronik</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section section-light">
        <div className="section-header">
          <h2 className="section-title">Pertanyaan Sering Diajukan</h2>
        </div>
        <div className="faq-grid">
          {[
            {
              q: "Apakah STECCA POS bisa beroperasi saat internet mati?",
              a: "Ya, fitur Offline-First memastikan operasional kasir tetap berjalan walau tanpa internet. Sistem akan melakukan sinkronisasi otomatis ke cloud saat jaringan kembali online."
            },
            {
              q: "Apakah bisa mengakomodasi resep makanan (BOM) yang kompleks untuk restoran?",
              a: "Sangat bisa. Anda dapat mengatur komposisi bahan baku hingga satuan gram atau mililiter, dan stok akan terpotong secara otomatis secara presisi setiap ada penjualan menu."
            },
            {
              q: "Berapa lama waktu yang dibutuhkan untuk migrasi dari sistem lama?",
              a: "Rata-rata klien kami dapat beroperasi penuh dalam 3-7 hari. Kami menyediakan fitur Bulk Import via Excel dan dibantu langsung oleh tim onboarding kami."
            },
            {
              q: "Siapa yang memiliki data bisnis saya? Apakah aman?",
              a: "Anda memegang kendali 100% atas data bisnis Anda dan dapat diexport kapan saja. Data dienkripsi tingkat bank (AES-256) dan di-backup secara real-time di server cloud bersertifikasi."
            }
          ].map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-question" onClick={() => toggleFaq(i)}>
                {faq.q}
                <ChevronDown size={20} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}/>
              </div>
              {activeFaq === i && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2 className="section-title">Siap Menskalakan Bisnis Anda ke Level Berikutnya?</h2>
        <p className="section-subtitle">
          Berhenti berjuang melawan sistem yang rumit. Integrasikan, otomatisasi, dan dominasi pasar Anda hari ini.
        </p>
        <div className="final-cta-buttons">
          <Link to="/login" className="btn-white">Mulai Free Trial 14 Hari</Link>
          <button className="btn-outline-white">Jadwalkan Demo Gratis</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2>STECCA POS</h2>
            <p style={{lineHeight: 1.6, marginBottom: '24px'}}>
              Business Management System terpadu untuk menjalankan, mengembangkan, dan menskalakan bisnis Anda dari satu layar.
            </p>
            <div className="footer-social">
              <a href="#">LinkedIn</a>
              <a href="#">Instagram</a>
              <a href="#">YouTube</a>
            </div>
          </div>
          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Partners</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Blog & Insights</a></li>
              <li><a href="#">Upcoming Events</a></li>
              <li><a href="#">Academy & Certification</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Legal</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Security Center</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 STECCA POS. All rights reserved.</div>
          <div>Dibuat dengan ❤️ untuk UMKM Indonesia</div>
        </div>
      </footer>
    </div>
  );
}
