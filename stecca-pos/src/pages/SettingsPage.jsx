import React, { useState } from 'react';
import { 
  Coffee, 
  Wrench, 
  ShoppingBag, 
  Sparkles,
  Check,
  ShieldCheck,
  Building,
  Ticket
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const { activeIndustry, updateActiveIndustry } = useApp();
  const [successToast, setSuccessToast] = useState(false);

  const templates = [
    {
      id: 'CAFE',
      title: 'F&B (Coffee Shop / Restoran)',
      desc: 'Sempurna untuk Kafe, Restoran, Bakery, Warung Makan, dan Food Truck. Mengaktifkan manajemen meja dan resep bahan baku.',
      icon: Coffee,
      color: '#818cf8',
      features: [
        'Meja Dine-in Grid & Billing paralel',
        'Auto-deduksi stok berdasarkan resep (BOM)',
        'Cetak pesanan ke dapur (Kitchen Printer)'
      ]
    },
    {
      id: 'SERVICE',
      title: 'Service & Jasa (Salon / Bengkel / Klinik)',
      desc: 'Dirancang untuk Barbershop, Salon kecantikan, Bengkel otomotif, Klinik kesehatan, dan persewaan (Rental).',
      icon: Wrench,
      color: '#34d399',
      features: [
        'Kalender Reservasi & Janji Temu (Bookings)',
        'Checkout otomatis dari antrean booking',
        'Penugasan staf layanan & komisi mekanik/terapis'
      ]
    },
    {
      id: 'RETAIL',
      title: 'Retail & Minimarket (Toko Kelontong / Fashion)',
      desc: 'Optimasi untuk Toko Umum, Butik busana, Toko elektronik, Apotek, dan grosir distributor barang fisik.',
      icon: ShoppingBag,
      color: '#fbbf24',
      features: [
        'Transaksi kasir instan berorientasi volume',
        'Dukungan Barcode Scanner simulator',
        'Peringatan otomatis stok kritis dan restock reguler'
      ]
    },
    {
      id: 'EVENT',
      title: 'Event & Ticketing (Penyelenggara Acara / Promotor)',
      desc: 'Sempurna untuk Promotor, Penyelenggara Event, Seminar, dan Konser Musik. Mengaktifkan penjualan tiket dan registrasi check-in.',
      icon: Ticket,
      color: '#f43f5e',
      features: [
        'Manajemen Tiket & Tier Harga Quota',
        'Registrasi Mandiri & Pembayaran Tiket',
        'Validasi Kode Tiket & Check-in Sistem'
      ]
    },
    {
      id: 'HYBRID',
      title: 'Hybrid Mode (Multi-Bisnis Gabungan)',
      desc: 'Mengaktifkan seluruh modul sistem sekaligus. Cocok untuk bisnis hibrida (contoh: Kafe yang memiliki barbershop di dalamnya).',
      icon: Sparkles,
      color: '#a78bfa',
      features: [
        'Semua fitur F&B, Service, dan Retail aktif bersamaan',
        'Skalabilitas penuh untuk manajemen multi-branch',
        'Analitik performa gabungan terlengkap'
      ]
    }
  ];

  const handleApplyTemplate = async (templateId) => {
    await updateActiveIndustry(templateId);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
    }, 3000);
  };

  return (
    <div className="settings-container animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Konfigurasi Industri</h2>
          <p className="page-description">Pilih template industri bisnis untuk menyesuaikan fitur modular STECCA POS</p>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="settings-toast animate-slideIn">
          <ShieldCheck size={20} className="toast-icon" />
          <span>Template berhasil diubah! Sistem telah menyesuaikan alur kerja.</span>
        </div>
      )}

      {/* Grid of Templates */}
      <div className="grid-2 template-grid">
        {templates.map((tpl) => {
          const isSelected = activeIndustry === tpl.id;
          return (
            <div 
              key={tpl.id} 
              className={`card template-card-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleApplyTemplate(tpl.id)}
            >
              {isSelected && (
                <div className="selected-glow-border" style={{ borderColor: tpl.color }}></div>
              )}
              
              <div className="card-header tpl-header">
                <div className="tpl-icon-box" style={{ color: tpl.color, backgroundColor: `${tpl.color}15` }}>
                  <tpl.icon size={26} />
                </div>
                <div className="tpl-title-box">
                  <h3 className="tpl-title">{tpl.title}</h3>
                  {isSelected ? (
                    <span className="badge badge-success">Aktif</span>
                  ) : (
                    <span className="badge badge-neutral text-xs">Ganti Template</span>
                  )}
                </div>
              </div>

              <div className="card-body tpl-body">
                <p className="tpl-desc">{tpl.desc}</p>
                <div className="tpl-features-list">
                  <h4 className="features-header-title">Modul yang Diaktifkan:</h4>
                  <ul>
                    {tpl.features.map((feat, idx) => (
                      <li key={idx}>
                        <Check size={14} className="feature-check-icon" style={{ color: tpl.color }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloud & Branch Info */}
      <div className="card cloud-status-card">
        <Building size={28} className="cloud-icon" />
        <div className="cloud-info-content">
          <h4>Status Sinkronisasi Multi-Cabang & Spreadsheet Cloud</h4>
          <p className="text-muted text-xs">
            Data Anda saat ini terhubung ke database local SQLite. Setiap perubahan konfigurasi industri template akan secara otomatis meregenerasi struktur file spreadsheet Google Drive Anda agar sesuai dengan metadata modul industri terpilih.
          </p>
        </div>
      </div>
    </div>
  );
}
