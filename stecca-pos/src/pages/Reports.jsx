import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  RefreshCw,
  Users,
  Target,
  Landmark,
  FileText,
  Calendar,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './Reports.css';

export default function Reports() {
  const { revenueChartData } = useApp();
  const [selectedRange, setSelectedRange] = useState('Minggu Ini');

  // Weekly Revenue Summary Data
  const weeklyData = useMemo(() => {
    return revenueChartData.map((item) => ({
      day: item.name,
      revenue: item.revenue
    }));
  }, [revenueChartData]);

  // Clickable report tiles
  const reportsList = [
    {
      title: 'Laba Rugi (P&L)',
      description: 'Pendapatan, HPP, dan laba bersih',
      icon: BarChart3,
      color: '#818cf8', // brand blue-indigo
      bg: 'rgba(129, 140, 248, 0.1)'
    },
    {
      title: 'Perputaran Stok',
      description: 'Rasio turnover persediaan',
      icon: RefreshCw,
      color: '#34d399', // accent green
      bg: 'rgba(52, 211, 153, 0.1)'
    },
    {
      title: 'Performa Karyawan',
      description: 'Penjualan & komisi per staf',
      icon: Users,
      color: '#fbbf24', // warning gold
      bg: 'rgba(251, 191, 36, 0.1)'
    },
    {
      title: 'Analisis Pelanggan (RFM)',
      description: 'Segmentasi pelanggan cerdas',
      icon: Target,
      color: '#f87171', // danger red-coral
      bg: 'rgba(248, 113, 113, 0.1)'
    },
    {
      title: 'Rekonsiliasi Kas',
      description: 'Saldo kas vs pencatatan sistem',
      icon: Landmark,
      color: '#a78bfa', // purple
      bg: 'rgba(167, 139, 250, 0.1)'
    },
    {
      title: 'Kartu Stok Detil',
      description: 'Buku besar mutasi per SKU',
      icon: FileText,
      color: '#6b7280', // neutral gray
      bg: 'rgba(107, 114, 128, 0.1)'
    }
  ];

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  return (
    <div className="reports-container animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Laporan & Analitik</h2>
          <p className="page-description">Wawasan bisnis mendalam dan analitik performa</p>
        </div>
        <div className="page-actions">
          {/* Date range selector dropdown simulation */}
          <div className="range-selector-dropdown">
            <Calendar size={15} />
            <span>{selectedRange}</span>
            <ChevronDown size={14} />
            <div className="dropdown-options">
              {['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'].map((range) => (
                <div 
                  key={range} 
                  className={`dropdown-option ${selectedRange === range ? 'selected' : ''}`}
                  onClick={() => handleRangeChange(range)}
                >
                  {range}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Tiles Grid */}
      <div className="grid-3 reports-tiles-grid">
        {reportsList.map((rep, i) => (
          <div key={i} className="card report-tile-card">
            <div className="tile-icon-container" style={{ backgroundColor: rep.bg, color: rep.color }}>
              <rep.icon size={20} />
            </div>
            <div className="tile-content">
              <h4 className="tile-title">{rep.title}</h4>
              <p className="tile-desc">{rep.description}</p>
            </div>
            <div className="tile-arrow-hover">
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly summary bar chart */}
      <div className="card weekly-summary-card">
        <div className="card-header flex-between">
          <h3>Ringkasan Mingguan Pendapatan</h3>
          <span className="text-xs text-muted">Periode berjalan</span>
        </div>
        <div className="chart-body" style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-tertiary)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-tertiary)" tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000000}jt`} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)' }}
                labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                formatter={(val) => [formatRupiah(val), 'Pendapatan']}
              />
              <Bar dataKey="revenue" fill="var(--brand-500)" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <cell key={`cell-${index}`} fill={index === 5 ? 'var(--accent-500)' : 'var(--brand-500)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
