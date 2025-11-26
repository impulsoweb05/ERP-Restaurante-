'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel, getOrderTypeIcon } from '@/lib/utils';
import type { Order } from '@/types';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Download,
  Calendar,
  Clock,
  Phone,
  MapPin,
  ChevronDown,
} from 'lucide-react';

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'PED-0045',
    customer_id: '1',
    customer: { id: '1', customer_code: 'CLI-001', name: 'Juan Pérez', phone: '3001234567', email: 'juan@email.com', addresses: ['Calle 123'], total_orders: 5, total_spent: 250000, is_active: true, created_at: '', updated_at: '' },
    order_type: 'delivery',
    status: 'preparing',
    delivery_address: 'Calle 123 #45-67, Apto 301',
    payment_method: 'transfer',
    subtotal: 75000,
    delivery_cost: 5000,
    total: 80000,
    items: [
      { id: '1', order_id: '1', menu_item_id: '1', product_name: 'Hamburguesa Clásica', quantity: 2, unit_price: 25000, subtotal: 50000, status: 'preparing' },
      { id: '2', order_id: '1', menu_item_id: '2', product_name: 'Pizza Margherita', quantity: 1, unit_price: 25000, subtotal: 25000, status: 'pending' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    order_number: 'PED-0044',
    table_id: '5',
    waiter_id: '1',
    order_type: 'dine_in',
    status: 'confirmed',
    payment_method: 'cash',
    subtotal: 120000,
    delivery_cost: 0,
    total: 120000,
    items: [
      { id: '3', order_id: '2', menu_item_id: '1', product_name: 'Hamburguesa Clásica', quantity: 4, unit_price: 25000, subtotal: 100000, status: 'pending' },
      { id: '4', order_id: '2', menu_item_id: '3', product_name: 'Ensalada César', quantity: 1, unit_price: 20000, subtotal: 20000, status: 'pending' },
    ],
    created_at: new Date(Date.now() - 600000).toISOString(),
    updated_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '3',
    order_number: 'PED-0043',
    customer_id: '2',
    customer: { id: '2', customer_code: 'CLI-002', name: 'María García', phone: '3109876543', addresses: [], total_orders: 3, total_spent: 180000, is_active: true, created_at: '', updated_at: '' },
    order_type: 'takeout',
    status: 'ready',
    payment_method: 'card',
    subtotal: 45000,
    delivery_cost: 0,
    total: 45000,
    items: [
      { id: '5', order_id: '3', menu_item_id: '2', product_name: 'Pizza Margherita', quantity: 1, unit_price: 35000, subtotal: 35000, status: 'ready' },
      { id: '6', order_id: '3', menu_item_id: '4', product_name: 'Limonada', quantity: 2, unit_price: 5000, subtotal: 10000, status: 'ready' },
    ],
    created_at: new Date(Date.now() - 1200000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
  },
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'En Preparación' },
  { value: 'ready', label: 'Listos' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' },
];

const typeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'delivery', label: 'Domicilio' },
  { value: 'dine_in', label: 'En Mesa' },
  { value: 'takeout', label: 'Para Llevar' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.phone?.includes(search);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesType = !typeFilter || order.order_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    ));
    toast.success('Estado actualizado');
    setShowStatusModal(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = (order: Order) => {
    const reason = prompt('Razón de la cancelación:');
    if (reason) {
      setOrders(orders.map(o => 
        o.id === order.id ? { ...o, status: 'cancelled' } : o
      ));
      toast.success('Pedido cancelado');
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const minutes = Math.round((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pedidos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona todos los pedidos del restaurante
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors">
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, cliente o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Fecha/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Cliente/Mesa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tiempo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-lg">{getOrderTypeIcon(order.order_type)}</span>
                      {getStatusLabel(order.order_type)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {order.customer ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.customer.phone}
                        </p>
                      </div>
                    ) : order.table_id ? (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Mesa {order.table_id}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowStatusModal(true);
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      {getStatusLabel(order.status)}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {getTimeElapsed(order.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Cambiar estado"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron pedidos</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedOrder && (
        <StatusModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// Order Detail Modal
function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {order.order_number}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDateTime(order.created_at)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Type & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tipo de Pedido</p>
              <p className="flex items-center gap-2 text-gray-800 dark:text-white font-medium">
                <span className="text-xl">{getOrderTypeIcon(order.order_type)}</span>
                {getStatusLabel(order.order_type)}
              </p>
            </div>

            {order.customer && (
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cliente</p>
                <p className="text-gray-800 dark:text-white font-medium">{order.customer.name}</p>
                <a 
                  href={`tel:${order.customer.phone}`}
                  className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 mt-1"
                >
                  <Phone className="h-4 w-4" />
                  {order.customer.phone}
                </a>
              </div>
            )}

            {order.table_id && (
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mesa</p>
                <p className="text-gray-800 dark:text-white font-medium">Mesa {order.table_id}</p>
              </div>
            )}

            {order.delivery_address && (
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4 md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Dirección de Entrega</p>
                <p className="flex items-start gap-2 text-gray-800 dark:text-white">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  {order.delivery_address}
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Items del Pedido</h3>
            <div className="border border-gray-200 dark:border-secondary-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-secondary-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cant.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-secondary-700">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{item.product_name}</p>
                        {item.special_instructions && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📝 {item.special_instructions}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-800 dark:text-white">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-800 dark:text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.delivery_cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Domicilio</span>
                  <span className="text-gray-800 dark:text-white">{formatCurrency(order.delivery_cost)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-secondary-700 pt-2 mt-2">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-primary-500">{formatCurrency(order.total)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-secondary-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Método de Pago</span>
                <span className="text-gray-800 dark:text-white font-medium">{getStatusLabel(order.payment_method)}</span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Notas del Cliente</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{order.customer_notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-secondary-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Status Change Modal
function StatusModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
}) {
  const [newStatus, setNewStatus] = useState(order.status);

  const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Cambiar Estado
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {order.order_number}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {statusFlow.map((status) => (
              <button
                key={status}
                onClick={() => setNewStatus(status as Order['status'])}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  newStatus === status
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-secondary-700 hover:border-gray-300 dark:hover:border-secondary-600'
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${
                  newStatus === status ? 'bg-primary-500' : 'bg-gray-200 dark:bg-secondary-600'
                }`} />
                <span className={`flex-1 text-left ${
                  newStatus === status ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {getStatusLabel(status)}
                </span>
                {order.status === status && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Actual</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-secondary-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-secondary-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onStatusChange(order.id, newStatus)}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
