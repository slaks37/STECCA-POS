import React, { useState } from 'react';
import { Users, Mail, Phone, CalendarRange, Plus, Edit2, Award, Clock, Upload, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './EmployeeManagement.css';

export default function EmployeeManagement() {
  const { employees, addEmployee, updateEmployee } = useApp();
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form State: New Employee
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState('Kasir');
  const [empSalary, setEmpSalary] = useState(4000000);
  const [empShift, setEmpShift] = useState('Pagi (08:00 - 16:00)');
  const [empImage, setEmpImage] = useState('');

  // Form State: Edit Employee
  const [editRole, setEditRole] = useState('');
  const [editSalary, setEditSalary] = useState(0);
  const [editShift, setEditShift] = useState('');
  const [editStatus, setEditStatus] = useState('Aktif');

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;

    addEmployee({
      name: empName,
      email: empEmail,
      phone: empPhone,
      role: empRole,
      salary: empSalary,
      shift: empShift,
      image: empImage || null
    });

    setIsAddModalOpen(false);
    setEmpImage('');

    // Reset fields
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpRole('Kasir');
    setEmpSalary(4000000);
    setEmpShift('Pagi (08:00 - 16:00)');
  };

  const handleOpenEditModal = (emp) => {
    setSelectedEmp(emp);
    setEditRole(emp.role);
    setEditSalary(emp.salary);
    setEditShift(emp.shift);
    setEditStatus(emp.status || 'Aktif');
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    updateEmployee(selectedEmp.id, {
      role: editRole,
      salary: Number(editSalary),
      shift: editShift,
      status: editStatus
    });

    setIsEditModalOpen(false);
    setSelectedEmp(null);
  };

  const roles = ['Branch Manager', 'Kasir Utama', 'Kasir Magang', 'Kitchen Staff', 'Supervisor'];
  const shifts = ['Pagi (08:00 - 16:00)', 'Sore (16:00 - 24:00)', 'Libur'];

  return (
    <div className="employees-container animate-fadeIn">
      {/* Mini Stats Banner */}
      <div className="employees-metrics-grid grid-3">
        <div className="card metric-mini-card">
          <div className="metric-icon-box" style={{ color: 'var(--brand-500)', backgroundColor: 'rgba(92, 62, 255, 0.08)' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="metric-label">Pegawai Aktif</div>
            <div className="metric-val">{employees.length} Karyawan</div>
          </div>
        </div>

        <div className="card metric-mini-card">
          <div className="metric-icon-box" style={{ color: 'var(--accent-500)', backgroundColor: 'rgba(0, 170, 19, 0.08)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="metric-label">Staf Shift Pagi Hari</div>
            <div className="metric-val">
              {employees.filter(e => e.shift.startsWith('Pagi')).length} Orang
            </div>
          </div>
        </div>

        <div className="card metric-mini-card">
          <div className="metric-icon-box" style={{ color: '#ff9800', backgroundColor: 'rgba(255, 152, 0, 0.08)' }}>
            <Award size={20} />
          </div>
          <div>
            <div className="metric-label">Total Anggaran Gaji</div>
            <div className="metric-val">
              {formatRupiah(employees.reduce((sum, e) => sum + e.salary, 0))}
            </div>
          </div>
        </div>
      </div>

      <div className="employees-header-actions mt-4 justify-between">
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Kepegawaian & Jadwal Shift</h3>
          <p className="text-muted text-xs">Kelola shift kerja pegawai, perizinan akses sistem, dan rekap nominal gaji staf</p>
        </div>
        <button className="btn btn-primary flex items-center gap-1 btn-sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Tambah Pegawai</span>
        </button>
      </div>

      {/* Grid of employees cards */}
      <div className="employees-grid mt-4">
        {employees.map((emp) => (
          <div key={emp.id} className="card employee-item-card">
            <div className="emp-card-header justify-between">
              <div className="emp-avatar-section">
                {emp.image ? (
                  <img 
                    src={emp.image} 
                    alt={emp.name} 
                    className="emp-avatar" 
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="emp-avatar">
                    {emp.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                )}
                <div>
                  <h4 className="emp-name-title">{emp.name}</h4>
                  <span className="emp-role-tag">{emp.role}</span>
                </div>
              </div>

              <button className="action-btn edit-btn" onClick={() => handleOpenEditModal(emp)} title="Sunting Pegawai">
                <Edit2 size={12} />
              </button>
            </div>

            <div className="emp-contact-details mt-4">
              <div className="detail-item-row">
                <Mail size={12} className="detail-icon" />
                <span>{emp.email}</span>
              </div>
              <div className="detail-item-row mt-1">
                <Phone size={12} className="detail-icon" />
                <span>{emp.phone}</span>
              </div>
              <div className="detail-item-row mt-1">
                <CalendarRange size={12} className="detail-icon" />
                <span>Shift: <strong>{emp.shift}</strong></span>
              </div>
            </div>

            <div className="emp-card-footer mt-4 pt-3 justify-between items-center" style={{ borderTop: '1px solid var(--border-default)' }}>
              <div>
                <span className="emp-salary-label">Gaji Bulanan</span>
                <div className="emp-salary-val">{formatRupiah(emp.salary)}</div>
              </div>
              <span className={`badge ${emp.status === 'Aktif' ? 'badge-success' : 'badge-neutral'} text-xs`}>
                {emp.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Add Employee */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            
            <div className="modal-header justify-between">
              <h3 className="modal-title">Tambah Pegawai Baru</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                
                {/* Profile Photo Uploader */}
                <div className="image-uploader-container">
                  <label className="form-label">Foto Profil Pegawai</label>
                  <div className="image-uploader-box" onClick={() => document.getElementById('emp-img-file').click()}>
                    <input
                      id="emp-img-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEmpImage(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    {empImage ? (
                      <>
                        <img src={empImage} alt="Preview" className="image-preview-circle" style={{ borderRadius: '50%' }} />
                        <div className="image-uploader-info">
                          <span className="image-uploader-title">Foto Pegawai Dimuat</span>
                          <span className="image-uploader-desc">Klik di sini untuk mengganti foto</span>
                        </div>
                        <button
                          type="button"
                          className="image-uploader-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmpImage('');
                          }}
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="image-uploader-placeholder">
                        <Upload size={20} className="image-uploader-icon" />
                        <span>Klik untuk unggah foto profil pegawai</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emp-name-input">Nama Lengkap</label>
                  <input
                    id="emp-name-input"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Andi Pratama"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emp-email-input">Email Staf</label>
                  <input
                    id="emp-email-input"
                    type="email"
                    className="form-control"
                    placeholder="staf@steccapos.id"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emp-phone-input">Nomor Telepon</label>
                  <input
                    id="emp-phone-input"
                    type="text"
                    className="form-control"
                    placeholder="081234567890"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="emp-role-select">Pilih Jabatan (Role)</label>
                    <select
                      id="emp-role-select"
                      className="form-control"
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-bg)' }}
                      required
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emp-shift-select">Jadwal Roster Shift</label>
                    <select
                      id="emp-shift-select"
                      className="form-control"
                      value={empShift}
                      onChange={(e) => setEmpShift(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-bg)' }}
                      required
                    >
                      {shifts.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emp-salary-input">Nominal Gaji Pokok (Rupiah)</label>
                  <div className="domain-input-wrapper">
                    <span className="domain-prefix">Rp</span>
                    <input
                      id="emp-salary-input"
                      type="number"
                      className="form-control"
                      placeholder="4000000"
                      value={empSalary}
                      onChange={(e) => setEmpSalary(Number(e.target.value))}
                      style={{ width: '100%', background: 'var(--surface-bg)' }}
                      required
                    />
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Simpan Pegawai</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Edit Employee */}
      {isEditModalOpen && selectedEmp && (
        <div className="modal-overlay">
          <div className="modal-card animate-scaleUp">
            
            <div className="modal-header justify-between">
              <div>
                <h3 className="modal-title">Sunting Jabatan & Shift Karyawan</h3>
                <p className="text-muted text-xs mt-1">Staf: {selectedEmp.name}</p>
              </div>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleUpdateEmployeeSubmit}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-role-select">Pilih Jabatan (Role)</label>
                  <select
                    id="edit-role-select"
                    className="form-control"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-bg)' }}
                    required
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-shift-select">Jadwal Roster Shift</label>
                  <select
                    id="edit-shift-select"
                    className="form-control"
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-bg)' }}
                    required
                  >
                    {shifts.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-salary-input">Nominal Gaji Pokok (Rupiah)</label>
                    <div className="domain-input-wrapper">
                      <span className="domain-prefix">Rp</span>
                      <input
                        id="edit-salary-input"
                        type="number"
                        className="form-control"
                        placeholder="4000000"
                        value={editSalary}
                        onChange={(e) => setEditSalary(Number(e.target.value))}
                        style={{ width: '100%', background: 'var(--surface-bg)' }}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-status-select">Status Kerja Karyawan</label>
                    <select
                      id="edit-status-select"
                      className="form-control"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-bg)' }}
                      required
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Shift Libur">Shift Libur</option>
                      <option value="Cuti Kerja">Cuti Kerja</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
