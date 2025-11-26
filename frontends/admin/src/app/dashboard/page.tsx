'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, getStatusColor, getStatusLabel, getOrderTypeIcon } from '@/lib/utils';
import type { DashboardStats, Order } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Package,
  SquareStack,
  Users,
  CalendarCheck,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data for demonstration
const mockStats: DashboardStats = {
  sales_today: 2450000,
  sales_yesterday: 2100000,
  sales_change_percent: 16.7,
  active_orders: 12,
  tables_occupied: 8,
  tables_total: 15,
  new_customers_today: 5,
  reservations_today: 8,
  pending_reservations: 2,
  top_products: [
    { id: '1', name: 'Hamburguesa Clásica', units_sold: 45, revenue: 855000 },
    { id: '2', name: 'Pizza Margherita', units_sold: 32, revenue: 768000 },
    { id: '3', name: 'Ensalada César', units_sold: 28, revenue: 420000 },
    { id: '4', name: 'Pasta Carbonara', units_sold: 25, revenue: 500000 },
    { id: '5', name: 'Alitas BBQ', units_sold: 22, revenue: 396000 },
  ],
  recent_orders: [
    {
      id: '1',
      order_number: 'PED-0045',
      order_type: 'delivery',
      status: 'preparing',
      total: 85000,
      created_at: new Date().toISOString(),
      customer: { id: '1', name: 'Juan Pérez', phone: '3001234567' },
    },
    {
      id: '2',
      order_number: 'PED-0044',
      order_type: 'dine_in',
      status: 'confirmed',
      total: 120000,
      table_id: '5',
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: '3',
      order_number: 'PED-0043',
      order_type: 'takeout',
      status: 'ready',
      total: 45000,
      created_at: new Date(Date.now() - 1200000).toISOString(),
    },
  ] as Order[],
  sales_by_hour: [
    { hour: '10:00', amount: 150000 },
    { hour: '11:00', amount: 280000 },
    { hour: '12:00', amount: 450000 },
    { hour: '13:00', amount: 520000 },
    { hour: '14:00', amount: 380000 },
    { hour: '15:00', amount: 220000 },
    { hour: '16:00', amount: 180000 },
    { hour: '17:00', amount: 280000 },
  ],
  alerts: [
    { type: 'urgent', message: 'Pedidos con más de 30 min', count: 3 },
    { type: 'warning', message: 'Reservas pendientes de confirmar', count: 2 },
  ],
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch real data from API
    // fetchDashboard().then(res => setStats(res.data));
  }, []);

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-secondary-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(change)}% vs ayer</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Vista general del restaurante
        </p>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                alert.type === 'urgent'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              {alert.type === 'urgent' ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className={alert.type === 'urgent' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}>
                {alert.count} {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Ventas Hoy"
          value={formatCurrency(stats.sales_today)}
          change={stats.sales_change_percent}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <MetricCard
          title="Pedidos Activos"
          value={stats.active_orders}
          icon={Package}
          color="bg-blue-500"
        />
        <MetricCard
          title="Mesas Ocupadas"
          value={`${stats.tables_occupied}/${stats.tables_total}`}
          icon={SquareStack}
          color="bg-purple-500"
        />
        <MetricCard
          title="Clientes Nuevos"
          value={stats.new_customers_today}
          icon={Users}
          color="bg-orange-500"
        />
        <MetricCard
          title="Reservas Hoy"
          value={`${stats.reservations_today} (${stats.pending_reservations} pend.)`}
          icon={CalendarCheck}
          color="bg-pink-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Hour Chart */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-secondary-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Ventas por Hora
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.sales_by_hour}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-secondary-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top 5 Productos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top_products} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Unidades']}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="units_sold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-secondary-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Pedidos Recientes
          </h3>
          <Link
            href="/orders"
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente/Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {stats.recent_orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-2">
                      <span>{getOrderTypeIcon(order.order_type)}</span>
                      {getStatusLabel(order.order_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {order.customer?.name || (order.table_id ? `Mesa ${order.table_id}` : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000)} min
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
