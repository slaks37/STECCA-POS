import React, { useState } from 'react';
import { 
  Calendar, MapPin, Ticket, Plus, Search, Check, 
  UserPlus, ArrowRight, Clock, QrCode, 
  Printer, AlertCircle, TrendingUp, Upload, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './EventManagement.css';

export default function EventManagement() {
  const { 
    events, 
    addEvent, 
    registerEventTicket, 
    toggleTicketCheckin 
  } = useApp();

  // Local state
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || null);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  
  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTicketSuccessOpen, setIsTicketSuccessOpen] = useState(false);

  // Form State: New Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'Regular Seat', price: 25000, quota: 100 },
    { name: 'VIP Area', price: 75000, quota: 30 }
  ]);

  // Form State: Register Ticket
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTierId, setRegTierId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Registered Ticket details (Success Modal)
  const [newlyRegisteredTicket, setNewlyRegisteredTicket] = useState(null);

  // Active event object
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Sync selected event ID if it was cleared/empty
  React.useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleOpenRegisterModal = (evt) => {
    setSelectedEventId(evt.id);
    setRegName('');
    setRegEmail('');
    // Default to first tier in event
    if (evt.tiers && evt.tiers.length > 0) {
      setRegTierId(evt.tiers[0].id);
    }
    setIsRegisterModalOpen(true);
  };

  const handleRegisterTicket = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regTierId) return;

    setIsRegistering(true);
    const result = await registerEventTicket(regTierId, regName, regEmail);
    setIsRegistering(false);

    if (result && result.success) {
      // Find event tier
      const selectedTier = activeEvent?.tiers.find(t => t.id === regTierId);
      
      setNewlyRegisteredTicket({
        customerName: regName,
        customerEmail: regEmail,
        ticketCode: result.ticketCode,
        eventName: activeEvent?.title,
        eventDate: activeEvent?.start_time,
        eventLocation: activeEvent?.location,
        tierName: selectedTier?.name || 'Tiket Masuk',
        price: selectedTier?.price || 0,
        eventImage: activeEvent?.image || null
      });

      setIsRegisterModalOpen(false);
      setIsTicketSuccessOpen(true);
    } else {
      alert('Gagal meregistrasi tiket. Silakan periksa sisa kuota tier tiket Anda.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventStart || !eventEnd) return;

    const eventData = {
      title: eventTitle,
      description: eventDesc,
      start_time: eventStart.replace('T', ' '),
      end_time: eventEnd.replace('T', ' '),
      location: eventLocation,
      ticket_tiers: ticketTiers.filter(t => t.name.trim() !== ''),
      image: eventImage || null
    };

    await addEvent(eventData);
    setIsEventModalOpen(false);
    setEventImage('');
    
    // Reset form
    setEventTitle('');
    setEventDesc('');
    setEventStart('');
    setEventEnd('');
    setEventLocation('');
    setTicketTiers([
      { name: 'Regular Seat', price: 25000, quota: 100 },
      { name: 'VIP Area', price: 75000, quota: 30 }
    ]);
  };

  const handleAddTierRow = () => {
    setTicketTiers([...ticketTiers, { name: '', price: 0, quota: 10 }]);
  };

  const handleRemoveTierRow = (idx) => {
    setTicketTiers(ticketTiers.filter((_, i) => i !== idx));
  };

  const handleTierChange = (idx, field, value) => {
    const updated = [...ticketTiers];
    updated[idx][field] = value;
    setTicketTiers(updated);
  };

  // Filtered guest list
  const filteredGuests = activeEvent?.registrations?.filter(reg => {
    const query = guestSearchQuery.toLowerCase();
    return (
      reg.customer_name.toLowerCase().includes(query) ||
      reg.customer_email.toLowerCase().includes(query) ||
      reg.ticket_code.toLowerCase().includes(query)
    );
  }) || [];

  // Summary counts
  const totalTicketsRegistered = activeEvent?.registrations?.length || 0;
  const totalCheckedIn = activeEvent?.registrations?.filter(r => r.checked_in).length || 0;

  return (
    <div className="events-container animate-fadeIn">
      
      {/* Upper Grid Stats */}
      <div className="grid-3 stats-overview-grid">
        <div className="card stat-mini-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--brand-400)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-label">Total Jadwal Event</div>
            <div className="stat-val">{events.length} Terdaftar</div>
          </div>
        </div>
        <div className="card stat-mini-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--accent-400)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Ticket size={20} />
          </div>
          <div>
            <div className="stat-label">Total Tiket Terjual</div>
            <div className="stat-val">
              {events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0)} Tiket
            </div>
          </div>
        </div>
        <div className="card stat-mini-card">
          <div className="stat-icon-wrapper" style={{ color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-label">Rata-rata Tingkat Kehadiran</div>
            <div className="stat-val">
              {events.length > 0 ? (() => {
                const regs = events.flatMap(e => e.registrations || []);
                if (regs.length === 0) return '0%';
                const checked = regs.filter(r => r.checked_in).length;
                return `${Math.round((checked / regs.length) * 100)}%`;
              })() : '0%'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-layout">
        
        {/* Left Pane: Events List */}
        <div className="events-list-pane">
          <div className="pane-header justify-between">
            <h3 className="pane-title">Daftar Acara & Konser</h3>
            <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => setIsEventModalOpen(true)}>
              <Plus size={16} />
              <span>Event Baru</span>
            </button>
          </div>

          <div className="events-list-scroll">
            {events.length === 0 ? (
              <div className="empty-state card">
                <AlertCircle size={36} className="text-muted mb-2" />
                <p className="text-muted text-sm">Belum ada event terdaftar.</p>
              </div>
            ) : (
              events.map((evt) => {
                const isActive = activeEvent?.id === evt.id;
                const totalSold = evt.tiers?.reduce((sum, t) => sum + (t.sold || 0), 0) || 0;
                const totalQuota = evt.tiers?.reduce((sum, t) => sum + (t.quota || 0), 0) || 0;
                const pctSold = totalQuota > 0 ? Math.round((totalSold / totalQuota) * 100) : 0;

                return (
                  <div 
                    key={evt.id} 
                    className={`card event-item-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedEventId(evt.id)}
                  >
                    {isActive && <div className="active-glow-border"></div>}
                    
                    <div className="event-card-main">
                      {evt.image ? (
                        <img 
                          src={evt.image} 
                          alt={evt.title} 
                          className="event-meta-icon"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="event-meta-icon" style={{ backgroundColor: isActive ? 'var(--brand-500)' : 'var(--surface-elevated)' }}>
                          <Calendar size={18} style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }} />
                        </div>
                      )}
                      
                      <div className="event-main-info">
                        <h4 className="event-item-title">{evt.title}</h4>
                        <div className="event-meta-row mt-1">
                          <span className="meta-item"><Clock size={12} /> {evt.start_time.split(' ')[0]}</span>
                          <span className="meta-item"><MapPin size={12} /> {evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="event-card-progress mt-3">
                      <div className="progress-labels">
                        <span className="progress-label-text">Tiket Terjual ({totalSold}/{totalQuota})</span>
                        <span className="progress-percent">{pctSold}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pctSold}%` }}></div>
                      </div>
                    </div>

                    <div className="event-card-footer mt-3 justify-end gap-2">
                      <button 
                        className="btn btn-outline btn-xs flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRegisterModal(evt);
                        }}
                      >
                        <UserPlus size={12} />
                        <span>Beli Tiket</span>
                      </button>
                      <button className="btn btn-primary btn-xs flex items-center gap-1">
                        <span>Lihat Tamu</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Guest / Check-in List */}
        <div className="guest-checkin-pane">
          {activeEvent ? (
            <div className="card pane-details-card" style={{ padding: 0, overflow: 'hidden' }}>
              {activeEvent.image && (
                <div className="event-banner-wrap" style={{ width: '100%', height: '140px', overflow: 'hidden', borderBottom: '1px solid var(--border-default)' }}>
                  <img src={activeEvent.image} alt={activeEvent.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="pane-details-header" style={{ padding: 'var(--space-5) var(--space-5) var(--space-4) var(--space-5)' }}>
                <div>
                  <span className="badge badge-accent text-xs">JADWAL TERPILIH</span>
                  <h3 className="details-event-title mt-1">{activeEvent.title}</h3>
                  <p className="details-event-desc mt-1 text-muted text-xs">{activeEvent.description}</p>
                </div>
                
                <div className="attendance-radial-panel" style={{ marginRight: 'var(--space-5)' }}>
                  <div className="radial-content">
                    <span className="radial-val">{totalCheckedIn}/{totalTicketsRegistered}</span>
                    <span className="radial-label">Hadir</span>
                  </div>
                </div>
              </div>

              {/* Guest search and actions bar */}
              <div className="guest-search-bar mt-4" style={{ padding: '0 var(--space-5)' }}>
                <div className="search-wrapper flex-1">
                  <Search size={16} />
                  <input
                    type="text"
                    className="input-search"
                    placeholder="Cari tamu berdasarkan nama, email, kode..."
                    value={guestSearchQuery}
                    onChange={(e) => setGuestSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={() => handleOpenRegisterModal(activeEvent)}>
                  <Plus size={16} />
                  <span>Daftar Manual</span>
                </button>
              </div>

              {/* Registrants Table */}
              <div className="guest-table-wrapper mt-4" style={{ padding: '0 var(--space-5) var(--space-5) var(--space-5)' }}>
                {filteredGuests.length === 0 ? (
                  <div className="empty-state p-6">
                    <AlertCircle size={28} className="text-muted mb-1" />
                    <p className="text-muted text-xs">Tidak ada data tamu ditemukan.</p>
                  </div>
                ) : (
                  <table className="guest-table">
                    <thead>
                      <tr>
                        <th>Tamu / Email</th>
                        <th>Kategori Tiket</th>
                        <th>Kode Tiket</th>
                        <th>Check-In</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((reg) => (
                        <tr key={reg.id} className="guest-row">
                          <td>
                            <div className="guest-info-box">
                              <span className="guest-name">{reg.customer_name}</span>
                              <span className="guest-email text-xs text-muted">{reg.customer_email}</span>
                            </div>
                          </td>
                          <td>
                            <span className="tier-badge-label">{reg.tier_name || 'Tiket'}</span>
                          </td>
                          <td>
                            <code className="ticket-code-badge">{reg.ticket_code}</code>
                          </td>
                          <td>
                            <div className="checkin-toggle-box">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={reg.checked_in}
                                  onChange={(e) => toggleTicketCheckin(reg.id, e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                              </label>
                              <span className={`checkin-status-text ${reg.checked_in ? 'checked' : 'pending'}`}>
                                {reg.checked_in ? 'Hadir' : 'Belum'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          ) : (
            <div className="card pane-details-card empty flex-column items-center justify-center">
              <Calendar size={48} className="text-muted opacity-30 mb-2" />
              <p className="text-muted text-sm">Pilih event untuk menampilkan daftar tamu.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal 1: Create Event */}
      {isEventModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp modal-large">
            
            <div className="modal-header justify-between">
              <h3 className="modal-title">Buat Event Baru</h3>
              <button className="modal-close" onClick={() => setIsEventModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                
                {/* Event Banner Uploader */}
                <div className="image-uploader-container">
                  <label className="form-label">Banner / Poster Acara</label>
                  <div className="image-uploader-box" onClick={() => document.getElementById('evt-img-file').click()}>
                    <input
                      id="evt-img-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEventImage(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    {eventImage ? (
                      <>
                        <img src={eventImage} alt="Preview" className="image-preview-circle" style={{ width: '120px', height: '68px', borderRadius: 'var(--radius-md)' }} />
                        <div className="image-uploader-info">
                          <span className="image-uploader-title">Banner Acara Dimuat</span>
                          <span className="image-uploader-desc">Klik di sini untuk mengganti gambar</span>
                        </div>
                        <button
                          type="button"
                          className="image-uploader-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEventImage('');
                          }}
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="image-uploader-placeholder">
                        <Upload size={20} className="image-uploader-icon" />
                        <span>Klik untuk unggah banner/poster acara</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-title">Nama Event</label>
                    <input
                      id="evt-title"
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Accoustic Night Cafe"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-loc">Lokasi Event</label>
                    <input
                      id="evt-loc"
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Lantai Rooftop / Area Belakang"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="evt-desc">Deskripsi Acara</label>
                  <textarea
                    id="evt-desc"
                    className="form-control"
                    placeholder="Jelaskan detail jalannya acara..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-start">Waktu Mulai</label>
                    <input
                      id="evt-start"
                      type="datetime-local"
                      className="form-control"
                      value={eventStart}
                      onChange={(e) => setEventStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-end">Waktu Selesai</label>
                    <input
                      id="evt-end"
                      type="datetime-local"
                      className="form-control"
                      value={eventEnd}
                      onChange={(e) => setEventEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Ticket Tiers Creation */}
                <div className="ticket-tiers-creator-section mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="form-label mb-0">Tier Tiket & Kuota Kapasitas</label>
                    <button type="button" className="btn btn-outline btn-xs flex items-center gap-1" onClick={handleAddTierRow}>
                      <Plus size={12} /> Add Tier
                    </button>
                  </div>

                  {ticketTiers.map((tier, idx) => (
                    <div key={idx} className="tier-row-input grid-3 items-center gap-2 mb-2">
                      <div className="form-group mb-0">
                        <input
                          type="text"
                          className="form-control text-xs"
                          placeholder="Nama Tier (misal: VIP Seat)"
                          value={tier.name}
                          onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group mb-0">
                        <div className="domain-input-wrapper">
                          <span className="domain-prefix text-xs">Rp</span>
                          <input
                            type="number"
                            className="form-control text-xs"
                            placeholder="Harga Tiket"
                            value={tier.price}
                            onChange={(e) => handleTierChange(idx, 'price', Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group mb-0 flex-row gap-2 items-center">
                        <input
                          type="number"
                          className="form-control text-xs flex-1"
                          placeholder="Kuota"
                          value={tier.quota}
                          onChange={(e) => handleTierChange(idx, 'quota', Number(e.target.value))}
                          required
                        />
                        {ticketTiers.length > 1 && (
                          <button type="button" className="action-btn delete-btn btn-xs" onClick={() => handleRemoveTierRow(idx)}>
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsEventModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Jadwalkan Event</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Buy / Register Ticket Drawer */}
      {isRegisterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            
            <div className="modal-header justify-between">
              <div>
                <h3 className="modal-title">Beli Tiket Masuk</h3>
                <p className="text-muted text-xs mt-1">{activeEvent?.title}</p>
              </div>
              <button className="modal-close" onClick={() => setIsRegisterModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleRegisterTicket}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name-input">Nama Lengkap Tamu</label>
                  <input
                    id="reg-name-input"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Rian Pratama"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email-input">Alamat Email</label>
                  <input
                    id="reg-email-input"
                    type="email"
                    className="form-control"
                    placeholder="rian@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-tier-select">Pilih Kategori Tiket</label>
                  <select
                    id="reg-tier-select"
                    className="form-control"
                    value={regTierId}
                    onChange={(e) => setRegTierId(e.target.value)}
                    required
                  >
                    {activeEvent?.tiers?.map((tier) => {
                      const isFull = tier.sold >= tier.quota;
                      return (
                        <option key={tier.id} value={tier.id} disabled={isFull}>
                          {tier.name} — Rp {tier.price.toLocaleString('id-ID')} {isFull ? '(PENUH)' : `(Tersisa ${tier.quota - tier.sold})`}
                        </option>
                      );
                    })}
                  </select>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsRegisterModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isRegistering}>
                  <Ticket size={16} />
                  <span>{isRegistering ? 'Memproses...' : 'Daftarkan Tamu'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 3: Ticket success popup with visual styled physical ticket */}
      {isTicketSuccessOpen && newlyRegisteredTicket && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp modal-ticket">
            
            <div className="modal-header justify-between">
              <h3 className="modal-title text-brand">Registrasi Tiket Sukses!</h3>
              <button className="modal-close" onClick={() => setIsTicketSuccessOpen(false)}>×</button>
            </div>

            <div className="modal-body flex-column items-center">
              
              {/* Premium Designed E-Ticket Card */}
              <div className="ticket-visual-design mt-2">
                <div className="ticket-header-decor" style={{ 
                  background: newlyRegisteredTicket.eventImage 
                    ? `linear-gradient(rgba(92, 62, 255, 0.8), rgba(92, 62, 255, 0.95)), url(${newlyRegisteredTicket.eventImage}) center/cover`
                    : 'linear-gradient(90deg, var(--brand-600) 0%, var(--brand-400) 100%)' 
                }}>
                  <div className="ticket-brand-logo">STECCA EVENT PASS</div>
                  <span className="ticket-tier-badge">{newlyRegisteredTicket.tierName.toUpperCase()}</span>
                </div>
                
                <div className="ticket-body-decor">
                  <div className="ticket-details-left">
                    <div className="ticket-event-label">ACARA / EVENT</div>
                    <div className="ticket-event-title">{newlyRegisteredTicket.eventName}</div>
                    
                    <div className="ticket-meta-grid mt-4">
                      <div>
                        <span className="t-meta-label">WAKTU</span>
                        <span className="t-meta-val">{newlyRegisteredTicket.eventDate}</span>
                      </div>
                      <div>
                        <span className="t-meta-label">LOKASI</span>
                        <span className="t-meta-val">{newlyRegisteredTicket.eventLocation}</span>
                      </div>
                    </div>

                    <div className="ticket-holder-grid mt-4">
                      <div>
                        <span className="t-meta-label">NAMA TAMU</span>
                        <span className="t-meta-val font-semibold">{newlyRegisteredTicket.customerName}</span>
                      </div>
                      <div>
                        <span className="t-meta-label">EMAIL</span>
                        <span className="t-meta-val text-xs">{newlyRegisteredTicket.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforated divider decoration */}
                  <div className="ticket-perforated-divider">
                    <span className="circle top"></span>
                    <span className="line-dots"></span>
                    <span className="circle bottom"></span>
                  </div>

                  <div className="ticket-details-right">
                    <div className="ticket-qr-box">
                      <QrCode size={64} className="qr-image" />
                      <span className="ticket-qr-code-text">{newlyRegisteredTicket.ticketCode}</span>
                    </div>
                    <div className="ticket-price-box mt-3 text-center">
                      <span className="t-meta-label">HARGA TIKET</span>
                      <span className="ticket-price-val">Rp {newlyRegisteredTicket.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Printable buttons */}
              <div className="ticket-actions-bar mt-6 flex justify-center gap-3">
                <button type="button" className="btn btn-outline flex items-center gap-1" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Cetak Tiket</span>
                </button>
                <button type="button" className="btn btn-primary flex items-center gap-1" onClick={() => setIsTicketSuccessOpen(false)}>
                  <span>Selesai</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
