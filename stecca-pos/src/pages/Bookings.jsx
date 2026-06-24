import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  Filter,
  CheckCircle,
  Play,
  XCircle,
  ChevronDown,
  Briefcase,
  AlertCircle,
  Tag,
  DollarSign,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './Bookings.css';

export default function Bookings() {
  const { bookings, addBooking, updateBookingStatus, customers } = useApp();
  const navigate = useNavigate();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Semua'); // 'Semua', 'Hari Ini', 'Besok'
  const [industryFilter, setIndustryFilter] = useState('Semua');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    phone: '',
    serviceName: '',
    time: '',
    date: '',
    staff: '',
    price: '',
    industry: 'Barbershop/Salon'
  });

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const total = bookings.length;
    const scheduled = bookings.filter((b) => b.status === 'SCHEDULED').length;
    const active = bookings.filter((b) => b.status === 'IN_PROGRESS').length;
    return [
      { label: 'Total Reservasi', value: `${total} Booking`, icon: Calendar, color: 'var(--brand-400)' },
      { label: 'Menunggu Jadwal', value: `${scheduled} Antrean`, icon: Clock, color: 'var(--warning-400)' },
      { label: 'Sedang Dilayani', value: `${active} Sesi`, icon: Play, color: 'var(--accent-500)' }
    ];
  }, [bookings]);

  // Industry tags selector options
  const industries = ['Barbershop/Salon', 'Klinik', 'Bengkel', 'Hotel/Penginapan', 'Gym/Fitness', 'Rental'];

  // Filter Bookings List
  const filteredBookings = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return bookings.filter((b) => {
      const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.phone.includes(searchQuery);
      
      const matchesIndustry = industryFilter === 'Semua' || b.industry === industryFilter;
      
      let matchesDate = true;
      if (dateFilter === 'Hari Ini') {
        matchesDate = b.date === todayStr;
      } else if (dateFilter === 'Besok') {
        matchesDate = b.date === tomorrowStr;
      }

      return matchesSearch && matchesIndustry && matchesDate;
    });
  }, [bookings, searchQuery, dateFilter, industryFilter]);

  // Handle status update click
  const handleStartWork = (id) => {
    updateBookingStatus(id, 'IN_PROGRESS');
  };

  const handleCancelBooking = (id) => {
    if (confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      updateBookingStatus(id, 'CANCELLED');
    }
  };

  const handleProcessCheckout = (id) => {
    // Navigate to POS cashier page with booking ID in query
    navigate(`/pos?bookingId=${id}`);
  };

  return (
    <div className="bookings-container animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Booking & Reservasi</h2>
          <p className="page-description">Jadwal janji temu pelanggan untuk bisnis jasa & rental</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-brand" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Tambah Booking</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-3 stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card booking-stat-card">
            <div className="booking-stat-info">
              <span className="booking-stat-label">{stat.label}</span>
              <span className="booking-stat-value">{stat.value}</span>
            </div>
            <div className="booking-stat-icon-wrapper" style={{ color: stat.color }}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="card booking-filters">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelanggan, nomor telepon, atau layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
        </div>

        <div className="filters-group-row">
          {/* Date Selector Pills */}
          <div className="status-toggle-pills">
            {['Semua', 'Hari Ini', 'Besok'].map((dateOpt) => (
              <button
                key={dateOpt}
                onClick={() => setDateFilter(dateOpt)}
                className={`status-pill ${dateFilter === dateOpt ? 'active' : ''}`}
              >
                {dateOpt}
              </button>
            ))}
          </div>

          {/* Industry Filter dropdown */}
          <div className="filter-dropdown-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="select-field"
            >
              <option value="Semua">Semua Industri</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Schedule List */}
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="card empty-bookings-state">
            <Calendar size={48} className="empty-icon" />
            <h3>Tidak Ada Jadwal Booking</h3>
            <p className="text-muted text-xs">Jadwalkan janji temu baru dengan mengeklik tombol 'Tambah Booking' di pojok kanan atas.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((b) => (
              <div key={b.id} className={`booking-card card ${b.status.toLowerCase()}`}>
                <div className="booking-card-header">
                  <span className="booking-time-badge">
                    <Clock size={12} />
                    <span>{b.time} &mdash; {b.date}</span>
                  </span>
                  <span className={`badge booking-status-${b.status.toLowerCase()}`}>
                    {b.status === 'SCHEDULED' ? 'Scheduled' : 
                     b.status === 'IN_PROGRESS' ? 'In Service' : 
                     b.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-service-title">
                    <Briefcase size={16} className="text-brand-icon" />
                    <h4>{b.serviceName}</h4>
                  </div>

                  <div className="booking-details-grid">
                    <div className="booking-detail-item">
                      <User size={13} />
                      <span>{b.customerName}</span>
                    </div>
                    <div className="booking-detail-item">
                      <Phone size={13} />
                      <span className="font-mono text-xs">{b.phone}</span>
                    </div>
                    <div className="booking-detail-item">
                      <Tag size={13} />
                      <span>Staf: {b.staff}</span>
                    </div>
                    <div className="booking-detail-item">
                      <DollarSign size={13} />
                      <span className="font-semibold text-primary">{formatRupiah(b.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-card-footer">
                  <span className="booking-industry-tag">{b.industry}</span>

                  <div className="booking-actions">
                    {b.status === 'SCHEDULED' && (
                      <>
                        <button className="btn btn-sm btn-secondary text-danger" onClick={() => handleCancelBooking(b.id)}>
                          <XCircle size={14} /> Batal
                        </button>
                        <button className="btn btn-sm btn-brand" onClick={() => handleStartWork(b.id)}>
                          <Play size={14} /> Mulai Kerja
                        </button>
                      </>
                    )}
                    {b.status === 'IN_PROGRESS' && (
                      <button className="btn btn-sm btn-success w-full" onClick={() => handleProcessCheckout(b.id)}>
                        <CheckCircle size={14} /> Proses Kasir / Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah Booking */}
      {isModalOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal card animate-scaleUp">
            <div className="modal-header">
              <h3>Tambah Reservasi Baru</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label">Nama Pelanggan</label>
                <input
                  type="text"
                  placeholder="Contoh: Andi Wijaya"
                  value={newBooking.customerName}
                  onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label">Nomor Telepon</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812XXXXXXXX"
                  value={newBooking.phone}
                  onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label">Layanan / Jasa / Kamar</label>
                <input
                  type="text"
                  placeholder="Contoh: Gunting Rambut Model Buzzcut"
                  value={newBooking.serviceName}
                  onChange={(e) => setNewBooking({ ...newBooking, serviceName: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="input-label">Jam Janji Temu</label>
                  <input
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Tanggal</label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="input-label">Staf / Teknisi / Kamar</label>
                  <input
                    type="text"
                    placeholder="Contoh: Barber Rian"
                    value={newBooking.staff}
                    onChange={(e) => setNewBooking({ ...newBooking, staff: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Biaya / Harga Jasa</label>
                  <input
                    type="number"
                    placeholder="Harga dalam Rupiah..."
                    value={newBooking.price}
                    onChange={(e) => setNewBooking({ ...newBooking, price: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label">Jenis Bisnis / Industri</label>
                <select
                  value={newBooking.industry}
                  onChange={(e) => setNewBooking({ ...newBooking, industry: e.target.value })}
                  className="select-field"
                  style={{ width: '100%', height: 'var(--input-height)' }}
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button
                className="btn btn-brand"
                onClick={() => {
                  if (!newBooking.customerName || !newBooking.phone || !newBooking.serviceName || !newBooking.time || !newBooking.price) {
                    alert('Harap lengkapi semua field!');
                    return;
                  }
                  addBooking(newBooking);
                  setIsModalOpen(false);
                  setNewBooking({
                    customerName: '',
                    phone: '',
                    serviceName: '',
                    time: '',
                    date: '',
                    staff: '',
                    price: '',
                    industry: 'Barbershop/Salon'
                  });
                }}
              >
                Simpan Reservasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
