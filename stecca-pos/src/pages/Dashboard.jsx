import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Percent
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const { 
    dashboardStats, 
    stockAlerts, 
    transactions: recentTransactions,
    revenueChartData,
    paymentMixData,
    topProducts
  } = useApp();

  const stats = [
    {
      title: 'Total Omzet Hari Ini',
      value: formatRupiah(dashboardStats.todayRevenue),
      change: `${dashboardStats.revenueChange}%`,
      isUp: dashboardStats.revenueChange >= 0,
      icon: DollarSign,
      color: 'var(--brand-500)'
    },
    {
      title: 'Jumlah Transaksi',
      value: dashboardStats.todayTransactions,
      change: `${dashboardStats.transactionChange}%`,
      isUp: dashboardStats.transactionChange >= 0,
      icon: ShoppingBag,
      color: 'var(--accent-500)'
    },
    {
      title: 'Rata-rata Nilai Pesanan',
      value: formatRupiah(dashboardStats.avgOrderValue),
      change: `${dashboardStats.aovChange}%`,
      isUp: dashboardStats.aovChange >= 0,
      icon: Percent,
      color: 'var(--warning-500)'
    },
    {
      title: 'Nilai Persediaan',
      value: formatRupiah(dashboardStats.inventoryValue),
      change: `${dashboardStats.inventoryChange}%`,
      isUp: dashboardStats.inventoryChange >= 0,
      icon: PackageCheck,
      color: 'var(--danger-400)'
    }
  ];

  return (
    <div className="dashboard-container animate-fadeIn stagger-children">
      {/* Stats Grid */}
      <div className="grid-4 stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">{stat.title}</span>
              <div className="stat-card-icon-container" style={{ background: `rgba(${stat.isUp ? '16, 185, 129' : '239, 68, 68'}, 0.1)`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-value">{stat.value}</span>
              <div className={`stat-card-badge ${stat.isUp ? 'badge-success' : 'badge-danger'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid-3 charts-grid">
        <div className="card chart-card col-span-2">
          <div className="chart-header">
            <h3>Tren Pendapatan & Biaya (7 Hari Terakhir)</h3>
          </div>
          <div className="chart-body" style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger-400)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--danger-400)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000000}jt`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)' }}
                  labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                  formatter={(value) => [formatRupiah(value), '']}
                />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="var(--brand-500)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="cost" name="HPP" stroke="var(--danger-400)" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Metode Pembayaran</h3>
          </div>
          <div className="chart-body flex-center" style={{ height: '300px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={paymentMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-default)', borderRadius: 'var(--radius-lg)' }}
                  formatter={(value) => [`${value}%`, 'Porsi']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {paymentMixData.map((entry, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: entry.fill }}></span>
                  <span className="legend-label">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Alerts Section */}
      <div className="grid-3 info-grid">
        {/* Top Products */}
        <div className="card table-card col-span-2">
          <div className="card-header">
            <h3>Produk Terlaris</h3>
            <span className="text-muted text-xs">Bulan ini</span>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Produk</th>
                  <th className="text-right">Unit Terjual</th>
                  <th className="text-right">Total Penjualan</th>
                  <th className="text-center">Tren</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td className="font-semibold">{prod.name}</td>
                    <td className="text-right">{prod.sold} unit</td>
                    <td className="text-right font-semibold">{formatRupiah(prod.revenue)}</td>
                    <td className="text-center">
                      <span className={`trend-icon ${prod.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                        {prod.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="card alerts-card">
          <div className="card-header">
            <h3>Peringatan Stok</h3>
            <span className="badge badge-danger">Kritis</span>
          </div>
          <div className="alerts-list">
            {stockAlerts.map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-icon-wrapper" style={{ color: alert.severity === 'critical' ? 'var(--danger-400)' : 'var(--warning-400)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div className="alert-content">
                  <span className="alert-product-name">{alert.product}</span>
                  <span className="alert-stock-status">
                    Tersisa <strong className={alert.severity === 'critical' ? 'text-danger' : 'text-warning'}>{alert.currentStock} {alert.unit}</strong> (Safety: {alert.safetyStock})
                  </span>
                </div>
                <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                  {alert.severity === 'critical' ? 'Kritis' : 'Warning'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card table-card">
        <div className="card-header">
          <h3>Transaksi Terakhir</h3>
          <button className="btn btn-secondary btn-sm">Lihat Semua</button>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th>Item</th>
                <th className="text-right">Total</th>
                <th>Pembayaran</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((trx) => (
                <tr key={trx.id}>
                  <td className="font-mono text-xs">{trx.id}</td>
                  <td>{trx.time}</td>
                  <td>{trx.customer}</td>
                  <td>{trx.items} item</td>
                  <td className="text-right font-semibold">{formatRupiah(trx.total)}</td>
                  <td>
                    <span className="badge badge-neutral">
                      <CreditCard size={12} style={{ marginRight: '4px' }} />
                      {trx.method}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${trx.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                      {trx.status === 'completed' ? 'Selesai' : 'Direfund'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
