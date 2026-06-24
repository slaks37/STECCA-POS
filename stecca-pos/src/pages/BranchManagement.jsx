import React, { useState } from 'react';
import { Store, MapPin, Phone, User, Plus, Check, TrendingUp, BarChart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './BranchManagement.css';

export default function BranchManagement() {
  const { branches, activeBranchId, switchBranch, addBranch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State: New Branch
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchManager, setBranchManager] = useState('');

  const handleCreateBranch = (e) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim()) return;

    addBranch({
      name: branchName,
      address: branchAddress,
      phone: branchPhone,
      manager: branchManager
    });

    setIsModalOpen(false);

    // Reset fields
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    setBranchManager('');
  };

  return (
    <div className="branches-container animate-fadeIn">
      {/* Top Banner metrics */}
      <div className="branches-metrics-grid grid-3">
        <div className="card metric-mini-card">
          <div className="metric-icon-box" style={{ color: 'var(--brand-500)', backgroundColor: 'rgba(92, 62, 255, 0.08)' }}>
            <Store size={20} />
          </div>
          <div>
            <div className="metric-label">Cabang Terdaftar</div>
            <div className="metric-val">{branches.length} Cabang</div>
          </div>
        </div>

        <div className="card metric-mini-card">
          <div className="metric-icon-box" style={{ color: 'var(--accent-500)', backgroundColor: 'rgba(0, 170, 19, 0.08)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="metric-label">Total Omzet Konsolidasi</div>
            <div className="metric-val">
              {formatRupiah(branches.reduce((sum, b) => sum + b.revenue, 0))}
            </div>
          </div>
        </div>

        <div className="card metric-mini-card">
          <div className="metric-icon-box" style={{ color: '#00b0ff', backgroundColor: 'rgba(0, 176, 255, 0.08)' }}>
            <BarChart size={20} />
          </div>
          <div>
            <div className="metric-label">Cabang Terbaik</div>
            <div className="metric-val">
              {branches.length > 0 ? [...branches].sort((a,b) => b.revenue - a.revenue)[0].name : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="branches-header-actions mt-4 justify-between">
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Struktur Multi-Cabang Perusahaan</h3>
          <p className="text-muted text-xs">Pilih cabang aktif untuk menyaring analitik laporan dan transaksi POS kasir</p>
        </div>
        <button className="btn btn-primary flex items-center gap-1 btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Tambah Cabang</span>
        </button>
      </div>

      {/* Grid of branches cards */}
      <div className="branches-grid mt-4">
        {branches.map((br) => {
          const isActive = br.id === activeBranchId;
          const revenueSharePct = Math.round((br.revenue / branches.reduce((sum, b) => sum + b.revenue, 0)) * 100);
          
          return (
            <div 
              key={br.id} 
              className={`card branch-item-card ${isActive ? 'active' : ''}`}
              onClick={() => switchBranch(br.id)}
            >
              {isActive && <div className="active-border-decor"></div>}

              <div className="branch-card-header justify-between">
                <div className="branch-title-box">
                  <h4 className="branch-name-title">{br.name}</h4>
                  <span className="branch-id-tag">{br.id}</span>
                </div>
                {isActive ? (
                  <span className="badge badge-success flex items-center gap-1">
                    <Check size={10} /> Cabang Aktif
                  </span>
                ) : (
                  <span className="badge badge-neutral text-xs">Pilih Cabang</span>
                )}
              </div>

              <div className="branch-details-body mt-4">
                <div className="detail-item-row">
                  <MapPin size={14} className="detail-icon" />
                  <span>{br.address}</span>
                </div>
                <div className="detail-item-row mt-2">
                  <Phone size={14} className="detail-icon" />
                  <span>{br.phone}</span>
                </div>
                <div className="detail-item-row mt-2">
                  <User size={14} className="detail-icon" />
                  <span>Manager: <strong>{br.manager}</strong></span>
                </div>
              </div>

              <div className="branch-card-footer-stats mt-4 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>Kontribusi Penjualan ({revenueSharePct}%)</span>
                  <strong>{formatRupiah(br.revenue)}</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${revenueSharePct}%`, 
                      background: isActive ? 'var(--brand-500)' : 'var(--gray-300)' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Branch */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            
            <div className="modal-header justify-between">
              <h3 className="modal-title">Tambah Cabang Baru</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateBranch}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label" htmlFor="br-name-input">Nama Cabang</label>
                  <input
                    id="br-name-input"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Cabang Kemang"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="br-address-input">Alamat Lengkap</label>
                  <textarea
                    id="br-address-input"
                    className="form-control"
                    placeholder="Jl. Kemang Raya No. 88, Jakarta Selatan"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="br-phone-input">Nomor Telepon</label>
                    <input
                      id="br-phone-input"
                      type="text"
                      className="form-control"
                      placeholder="021-7190777"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="br-manager-input">Manager Cabang</label>
                    <input
                      id="br-manager-input"
                      type="text"
                      className="form-control"
                      placeholder="Nama penanggung jawab"
                      value={branchManager}
                      onChange={(e) => setBranchManager(e.target.value)}
                      required
                    />
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Simpan Cabang</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
