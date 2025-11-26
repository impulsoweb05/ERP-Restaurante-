'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Customer } from '@/types';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  Search,
  Download,
  Eye,
  Edit,
  Phone,
  Mail,
  ShoppingBag,
  Calendar,
} from 'lucide-react';

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    customer_code: 'CLI-0001',
    name: 'Juan Pérez',
    phone: '3001234567',
    email: 'juan@email.com',
    addresses: ['Calle 123 #45-67, Apto 301'],
    total_orders: 15,
    total_spent: 750000,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    customer_code: 'CLI-0002',
    name: 'María García',
    phone: '3109876543',
    email: 'maria@email.com',
    addresses: ['Carrera 50 #30-20'],
    total_orders: 8,
    total_spent: 420000,
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '3',
    customer_code: 'CLI-0003',
    name: 'Carlos López',
    phone: '3151234567',
    addresses: ['Av. Principal #100'],
    total_orders: 3,
    total_spent: 150000,
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '4',
    customer_code: 'CLI-0004',
    name: 'Ana Martínez',
    phone: '3201112222',
    email: 'ana@email.com',
    addresses: [],
    total_orders: 1,
    total_spent: 45000,
    is_active: false,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

const segmentOptions = [
  { value: '', label: 'Todos los segmentos' },
  { value: 'vip', label: 'VIP (>10 pedidos)' },
  { value: 'frequent', label: 'Frecuentes (5-10 pedidos)' },
  { value: 'new', label: 'Nuevos (<5 pedidos)' },
  { value: 'inactive', label: 'Inactivos' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getSegment = (customer: Customer) => {
    if (!customer.is_active) return 'inactive';
    if (customer.total_orders > 10) return 'vip';
    if (customer.total_orders >= 5) return 'frequent';
    return 'new';
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      customer.customer_code.toLowerCase().includes(search.toLowerCase());
    const matchesSegment = !segmentFilter || getSegment(customer) === segmentFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && customer.is_active) ||
      (statusFilter === 'inactive' && !customer.is_active);
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const getSegmentBadge = (customer: Customer) => {
    const segment = getSegment(customer);
    switch (segment) {
      case 'vip':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">VIP</span>;
      case 'frequent':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Frecuente</span>;
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Nuevo</span>;
      case 'inactive':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">Inactivo</span>;
      default:
        return null;
    }
  };

  const getDaysSinceLastOrder = (updatedAt: string) => {
    const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Base de datos de clientes del restaurante
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors">
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Clientes VIP</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {customers.filter(c => getSegment(c) === 'vip').length}
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Nuevos (30 días)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {customers.filter(c => {
              const days = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000);
              return days <= 30;
            }).length}
          </p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
          <p className="text-2xl font-bold text-primary-500 mt-1">
            {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o código..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {segmentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pedidos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Gastado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Última Compra</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Segmento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{customer.customer_code}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </a>
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <ShoppingBag className="h-4 w-4" />
                      {customer.total_orders}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {formatCurrency(customer.total_spent)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {getDaysSinceLastOrder(customer.updated_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {getSegmentBadge(customer)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

function CustomerDetailModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const avgTicket = customer.total_orders > 0 ? customer.total_spent / customer.total_orders : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{customer.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{customer.customer_code}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {customer.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Teléfono</p>
              <a href={`tel:${customer.phone}`} className="text-primary-500 font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </a>
            </div>
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Email</p>
              {customer.email ? (
                <a href={`mailto:${customer.email}`} className="text-gray-800 dark:text-white font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </a>
              ) : (
                <span className="text-gray-400">No registrado</span>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Direcciones Guardadas</h3>
            {customer.addresses.length > 0 ? (
              <div className="space-y-2">
                {customer.addresses.map((address, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                    📍 {address}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Sin direcciones guardadas</p>
            )}
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Estadísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{customer.total_orders}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pedidos</p>
              </div>
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary-500">{formatCurrency(customer.total_spent)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Gastado</p>
              </div>
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(avgTicket)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ticket Promedio</p>
              </div>
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / 86400000)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Días como Cliente</p>
              </div>
            </div>
          </div>
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
