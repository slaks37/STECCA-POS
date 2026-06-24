import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const { setIsLoggedIn } = useApp();
  const [email, setEmail] = useState('andi@steccapos.id');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');

    // Simulate authentication check
    setTimeout(() => {
      if (email.toLowerCase() === 'andi@steccapos.id' && password === 'admin123') {
        setIsLoggedIn(true);
      } else {
        setErrorMsg('Email atau password salah! Coba andi@steccapos.id / admin123');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="login-bg-container">
      <div className="login-visual-circles">
        <span className="circle violet"></span>
        <span className="circle green"></span>
      </div>

      <div className="login-card animate-scaleUp card">
        <div className="login-header">
          <div className="login-logo-box">
            <span className="logo-dot">●</span>
            <span>STECCA BMS</span>
          </div>
          <h2>Masuk ke Dashboard 🚀</h2>
          <p className="text-muted text-xs">Semua aktivitas penjualan, stok, dan rekap shift dalam genggamanmu.</p>
        </div>

        {errorMsg && (
          <div className="login-error-alert animate-fadeIn">
            <ShieldCheck size={16} className="alert-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
            <label className="form-label" htmlFor="email-login">Email Bisnis</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="email-login"
                type="email"
                className="form-control"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
            <label className="form-label" htmlFor="password-login">Kata Sandi</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="password-login"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full login-submit-btn" disabled={loading}>
            <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-quick-demo card p-3 mt-5">
          <div className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: 'var(--brand-500)' }}>
            <Sparkles size={12} />
            <span>Mode Demo Aktif</span>
          </div>
          <p className="text-xs text-muted">Gunakan kredensial berikut untuk masuk:</p>
          <div className="demo-creds-grid mt-2">
            <code>andi@steccapos.id</code>
            <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
