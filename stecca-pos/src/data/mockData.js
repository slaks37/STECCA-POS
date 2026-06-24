/* ═══════════════════════════════════════════════════════════════
   STECCA POS — Mock Data Store
   Realistic Indonesian business data for all modules
   ═══════════════════════════════════════════════════════════════ */

export const formatRupiah = (num) => {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
};

export const currentBranch = {
  id: 'br-001',
  name: 'Cabang Menteng',
  address: 'Jl. Menteng Raya No. 15, Jakarta Pusat',
  timezone: 'Asia/Jakarta',
};

export const currentUser = {
  id: 'usr-001',
  name: 'Andi Pratama',
  email: 'andi@steccapos.id',
  role: 'Branch Manager',
  initials: 'AP',
};

export const dashboardStats = {
  todayRevenue: 12450000,
  todayTransactions: 87,
  avgOrderValue: 143103,
  inventoryValue: 285600000,
  revenueChange: 12.4,
  transactionChange: 8.2,
  aovChange: -2.1,
  inventoryChange: 3.7,
};

export const revenueChartData = [
  { name: 'Sen', revenue: 9200000, cost: 5100000 },
  { name: 'Sel', revenue: 11500000, cost: 6200000 },
  { name: 'Rab', revenue: 10800000, cost: 5800000 },
  { name: 'Kam', revenue: 13200000, cost: 7100000 },
  { name: 'Jum', revenue: 15600000, cost: 8500000 },
  { name: 'Sab', revenue: 18400000, cost: 9800000 },
  { name: 'Min', revenue: 12450000, cost: 6700000 },
];

export const paymentMixData = [
  { name: 'QRIS', value: 38, fill: '#818cf8' },
  { name: 'Tunai', value: 28, fill: '#34d399' },
  { name: 'Debit', value: 20, fill: '#fbbf24' },
  { name: 'E-Wallet', value: 14, fill: '#f87171' },
];

export const topProducts = [
  { id: 1, name: 'Kopi Susu Gula Aren', sold: 145, revenue: 3625000, trend: 'up' },
  { id: 2, name: 'Nasi Goreng Spesial', sold: 98, revenue: 3430000, trend: 'up' },
  { id: 3, name: 'Es Teh Manis', sold: 210, revenue: 2100000, trend: 'down' },
  { id: 4, name: 'Ayam Geprek Sambal', sold: 87, revenue: 2610000, trend: 'up' },
  { id: 5, name: 'Mie Ayam Bakso', sold: 76, revenue: 1900000, trend: 'down' },
];

export const recentTransactions = [
  { id: 'TRX-2026-0087', time: '22:15', customer: 'Walk-in', items: 4, total: 185000, method: 'QRIS', status: 'completed' },
  { id: 'TRX-2026-0086', time: '22:02', customer: 'Budi Santoso', items: 2, total: 95000, method: 'Tunai', status: 'completed' },
  { id: 'TRX-2026-0085', time: '21:48', customer: 'Walk-in', items: 6, total: 312000, method: 'Debit', status: 'completed' },
  { id: 'TRX-2026-0084', time: '21:30', customer: 'Siti Rahayu', items: 3, total: 157500, method: 'GoPay', status: 'completed' },
  { id: 'TRX-2026-0083', time: '21:15', customer: 'Walk-in', items: 1, total: 45000, method: 'Tunai', status: 'refunded' },
];

export const stockAlerts = [
  { id: 1, product: 'Gula Pasir 1kg', currentStock: 3, safetyStock: 10, unit: 'Pak', severity: 'critical' },
  { id: 2, product: 'Kopi Arabica 250g', currentStock: 5, safetyStock: 15, unit: 'Bungkus', severity: 'critical' },
  { id: 3, product: 'Sirup Vanila 750ml', currentStock: 8, safetyStock: 12, unit: 'Botol', severity: 'warning' },
  { id: 4, product: 'Susu Full Cream 1L', currentStock: 12, safetyStock: 20, unit: 'Kotak', severity: 'warning' },
  { id: 5, product: 'Tissue Meja', currentStock: 15, safetyStock: 25, unit: 'Pak', severity: 'warning' },
];

/* ═══════════════════════════════════════════════════════════════
   PRODUCTS DATA (for POS & Product Management)
   ═══════════════════════════════════════════════════════════════ */

export const categories = [
  { id: 'cat-01', name: 'Minuman Kopi', icon: '☕', color: '#818cf8' },
  { id: 'cat-02', name: 'Minuman Non-Kopi', icon: '🧃', color: '#34d399' },
  { id: 'cat-03', name: 'Makanan Berat', icon: '🍛', color: '#fbbf24' },
  { id: 'cat-04', name: 'Makanan Ringan', icon: '🍟', color: '#f87171' },
  { id: 'cat-05', name: 'Dessert', icon: '🍰', color: '#a78bfa' },
  { id: 'cat-06', name: 'Semua', icon: '📦', color: '#6b7280' },
];

export const products = [
  { id: 'p-001', sku: 'KSG-001', name: 'Kopi Susu Gula Aren', category: 'cat-01', price: 25000, cost: 8500, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-002', sku: 'EAM-002', name: 'Espresso Americano', category: 'cat-01', price: 22000, cost: 7000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-003', sku: 'CPL-003', name: 'Cappuccino Latte', category: 'cat-01', price: 28000, cost: 9500, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-004', sku: 'MCM-004', name: 'Mocha Caramel', category: 'cat-01', price: 32000, cost: 11000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-005', sku: 'ETM-005', name: 'Es Teh Manis', category: 'cat-02', price: 10000, cost: 2500, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-006', sku: 'JJA-006', name: 'Jus Jeruk Asli', category: 'cat-02', price: 18000, cost: 6000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-007', sku: 'LMN-007', name: 'Lemon Soda', category: 'cat-02', price: 15000, cost: 4500, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-008', sku: 'CSM-008', name: 'Cokelat Susu Milo', category: 'cat-02', price: 20000, cost: 7500, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-009', sku: 'NGS-009', name: 'Nasi Goreng Spesial', category: 'cat-03', price: 35000, cost: 14000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-010', sku: 'AGP-010', name: 'Ayam Geprek Sambal', category: 'cat-03', price: 30000, cost: 12000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-011', sku: 'MAB-011', name: 'Mie Ayam Bakso', category: 'cat-03', price: 25000, cost: 10000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-012', sku: 'NKT-012', name: 'Nasi Kuning Telur', category: 'cat-03', price: 28000, cost: 11000, stock: 999, type: 'BUNDLE', active: true },
  { id: 'p-013', sku: 'KFG-013', name: 'Kentang Goreng', category: 'cat-04', price: 18000, cost: 6000, stock: 999, type: 'PHYSICAL', active: true },
  { id: 'p-014', sku: 'RCK-014', name: 'Roti Cokelat', category: 'cat-05', price: 15000, cost: 5000, stock: 45, type: 'PHYSICAL', active: true },
  { id: 'p-015', sku: 'PCJ-015', name: 'Pisang Cokelat Keju', category: 'cat-05', price: 20000, cost: 7500, stock: 38, type: 'PHYSICAL', active: true },
];

/* ═══════════════════════════════════════════════════════════════
   STOCK / INVENTORY DATA
   ═══════════════════════════════════════════════════════════════ */

export const stockItems = [
  { id: 's-001', sku: 'BB-GLP-01', name: 'Gula Pasir', category: 'Bahan Baku', stock: 3, safetyStock: 10, unit: 'Kg', cost: 14000, lastOpname: '2026-06-20', status: 'critical' },
  { id: 's-002', sku: 'BB-KPA-01', name: 'Kopi Arabica Toraja', category: 'Bahan Baku', stock: 5, safetyStock: 15, unit: 'Kg', cost: 185000, lastOpname: '2026-06-20', status: 'critical' },
  { id: 's-003', sku: 'BB-SSF-01', name: 'Susu Segar Full Cream', category: 'Bahan Baku', stock: 12, safetyStock: 20, unit: 'Liter', cost: 18000, lastOpname: '2026-06-22', status: 'warning' },
  { id: 's-004', sku: 'BB-SRV-01', name: 'Sirup Vanila Monin', category: 'Bahan Baku', stock: 8, safetyStock: 12, unit: 'Botol', cost: 125000, lastOpname: '2026-06-22', status: 'warning' },
  { id: 's-005', sku: 'BB-CKB-01', name: 'Cokelat Bubuk', category: 'Bahan Baku', stock: 18, safetyStock: 10, unit: 'Kg', cost: 95000, lastOpname: '2026-06-22', status: 'normal' },
  { id: 's-006', sku: 'BB-TPT-01', name: 'Tepung Terigu Protein Tinggi', category: 'Bahan Baku', stock: 25, safetyStock: 15, unit: 'Kg', cost: 12500, lastOpname: '2026-06-18', status: 'normal' },
  { id: 's-007', sku: 'BB-MNT-01', name: 'Mentega Wisman', category: 'Bahan Baku', stock: 10, safetyStock: 8, unit: 'Kg', cost: 78000, lastOpname: '2026-06-20', status: 'normal' },
  { id: 's-008', sku: 'PK-CUP-01', name: 'Cup Plastik 16oz', category: 'Packaging', stock: 150, safetyStock: 200, unit: 'Pcs', cost: 850, lastOpname: '2026-06-22', status: 'warning' },
  { id: 's-009', sku: 'PK-SED-01', name: 'Sedotan Kertas', category: 'Packaging', stock: 500, safetyStock: 300, unit: 'Pcs', cost: 350, lastOpname: '2026-06-22', status: 'normal' },
  { id: 's-010', sku: 'PK-TSM-01', name: 'Tissue Meja', category: 'Packaging', stock: 15, safetyStock: 25, unit: 'Pak', cost: 22000, lastOpname: '2026-06-21', status: 'warning' },
];

export const stockMutations = [
  { id: 'mut-001', date: '2026-06-24', product: 'Kopi Arabica Toraja', type: 'PURCHASE', from: 'PT Kopi Nusantara', to: 'Cabang Menteng', qty: 10, unit: 'Kg', status: 'COMPLETED' },
  { id: 'mut-002', date: '2026-06-24', product: 'Susu Segar Full Cream', type: 'SALE', from: 'Cabang Menteng', to: 'Penjualan', qty: 8, unit: 'Liter', status: 'COMPLETED' },
  { id: 'mut-003', date: '2026-06-23', product: 'Gula Pasir', type: 'TRANSFER', from: 'Gudang Pusat', to: 'Cabang Menteng', qty: 20, unit: 'Kg', status: 'IN_TRANSIT' },
  { id: 'mut-004', date: '2026-06-23', product: 'Cup Plastik 16oz', type: 'PURCHASE', from: 'CV Plastindo', to: 'Cabang Menteng', qty: 500, unit: 'Pcs', status: 'COMPLETED' },
  { id: 'mut-005', date: '2026-06-23', product: 'Sirup Vanila Monin', type: 'ADJUSTMENT', from: '-', to: 'Cabang Menteng', qty: -2, unit: 'Botol', status: 'COMPLETED' },
];

export const customers = [
  { id: 'c-001', name: 'Budi Santoso', phone: '081234567890', email: 'budi@gmail.com', tier: 'GOLD', points: 12500, totalSpent: 15800000, visits: 47 },
  { id: 'c-002', name: 'Siti Rahayu', phone: '082345678901', email: 'siti.r@gmail.com', tier: 'SILVER', points: 6800, totalSpent: 8200000, visits: 28 },
  { id: 'c-003', name: 'Ahmad Ridwan', phone: '083456789012', email: 'ahmad.r@gmail.com', tier: 'GOLD', points: 15200, totalSpent: 22500000, visits: 63 },
  { id: 'c-004', name: 'Dewi Lestari', phone: '084567890123', email: 'dewi.l@gmail.com', tier: 'REGULAR', points: 2100, totalSpent: 3400000, visits: 12 },
  { id: 'c-005', name: 'Rudi Hermawan', phone: '085678901234', email: 'rudi.h@gmail.com', tier: 'SILVER', points: 5500, totalSpent: 7100000, visits: 22 },
  { id: 'c-006', name: 'Maya Kusuma', phone: '086789012345', email: 'maya.k@gmail.com', tier: 'REGULAR', points: 800, totalSpent: 1200000, visits: 5 },
];
