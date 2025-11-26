'use client';

import { useState } from 'react';
import type { Waiter } from '@/types';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';

// Mock data
const mockWaiters: Waiter[] = [
  {
    id: '1',
    waiter_code: 'MES-0001',
    name: 'Pedro Hernández',
    phone: '3001112233',
    is_active: true,
    orders_today: 12,
    sales_today: 480000,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: '2',
    waiter_code: 'MES-0002',
    name: 'Laura Gómez',
    phone: '3002223344',
    is_active: true,
    orders_today: 8,
    sales_today: 320000,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: '3',
    waiter_code: 'MES-0003',
    name: 'Diego Martínez',
    phone: '3003334455',
    is_active: false,
    orders_today: 0,
    sales_today: 0,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export default function StaffPage() {
  const [waiters, setWaiters] = useState<Waiter[]>(mockWaiters);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);

  const filteredWaiters = waiters.filter((waiter) =>
    waiter.name.toLowerCase().includes(search.toLowerCase()) ||
    waiter.waiter_code.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (waiter: Waiter) => {
    setWaiters(waiters.map(w =>
      w.id === waiter.id ? { ...w, is_active: !w.is_active } : w
    ));
    toast.success(`${waiter.name} ${waiter.is_active ? 'desactivado' : 'activado'}`);
  };

  const handleDelete = (waiter: Waiter) => {
    if (confirm(`¿Eliminar a "${waiter.name}"?`)) {
      setWaiters(waiters.filter(w => w.id !== waiter.id));
      toast.success('Mesero eliminado');
    }
  };

  const totalSalesToday = waiters.reduce((sum, w) => sum + w.sales_today, 0);
  const totalOrdersToday = waiters.reduce((sum, w) => sum + w.orders_today, 0);
  const activeWaiters = waiters.filter(w => w.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Personal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona meseros y personal de cocina
          </p>
        </div>
        <button
          onClick={() => {
            setEditingWaiter(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Mesero</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Personal</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{waiters.length}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeWaiters}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pedidos Hoy</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalOrdersToday}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ventas Hoy</p>
          <p className="text-2xl font-bold text-primary-500 mt-1">{formatCurrency(totalSalesToday)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Waiters Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pedidos Hoy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ventas Hoy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {filteredWaiters.map((waiter) => (
                <tr key={waiter.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="px-4 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                    {waiter.waiter_code}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800 dark:text-white">{waiter.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    {waiter.phone ? (
                      <a href={`tel:${waiter.phone}`} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600">
                        <Phone className="h-3 w-3" />
                        {waiter.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {waiter.orders_today}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                    {formatCurrency(waiter.sales_today)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleStatus(waiter)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        waiter.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-secondary-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          waiter.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingWaiter(waiter);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingWaiter(waiter);
                          setShowPinModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Cambiar PIN"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(waiter)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWaiters.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontró personal</p>
          </div>
        )}
      </div>

      {/* Waiter Modal */}
      {showModal && (
        <WaiterModal
          waiter={editingWaiter}
          onClose={() => {
            setShowModal(false);
            setEditingWaiter(null);
          }}
          onSave={(waiter) => {
            if (editingWaiter) {
              setWaiters(waiters.map(w => w.id === waiter.id ? waiter : w));
              toast.success('Mesero actualizado');
            } else {
              setWaiters([...waiters, { ...waiter, id: Date.now().toString() }]);
              toast.success('Mesero creado');
            }
            setShowModal(false);
            setEditingWaiter(null);
          }}
        />
      )}

      {/* PIN Modal */}
      {showPinModal && editingWaiter && (
        <PinModal
          waiter={editingWaiter}
          onClose={() => {
            setShowPinModal(false);
            setEditingWaiter(null);
          }}
          onSave={() => {
            toast.success('PIN actualizado');
            setShowPinModal(false);
            setEditingWaiter(null);
          }}
        />
      )}
    </div>
  );
}

function WaiterModal({
  waiter,
  onClose,
  onSave,
}: {
  waiter: Waiter | null;
  onClose: () => void;
  onSave: (waiter: Waiter) => void;
}) {
  const [form, setForm] = useState<Partial<Waiter>>(
    waiter || {
      waiter_code: `MES-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      name: '',
      phone: '',
      is_active: true,
      orders_today: 0,
      sales_today: 0,
    }
  );
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiter && pin.length !== 4) {
      toast.error('El PIN debe tener 4 dígitos');
      return;
    }
    onSave(form as Waiter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {waiter ? 'Editar Mesero' : 'Nuevo Mesero'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código
            </label>
            <input
              type="text"
              value={form.waiter_code}
              readOnly
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-gray-50 dark:bg-secondary-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {!waiter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PIN (4 dígitos) *
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                placeholder="****"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
              />
            </div>
          )}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-secondary-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {waiter ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PinModal({
  waiter,
  onClose,
  onSave,
}: {
  waiter: Waiter;
  onClose: () => void;
  onSave: () => void;
}) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error('El PIN debe tener 4 dígitos');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('Los PINs no coinciden');
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cambiar PIN</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{waiter.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nuevo PIN (4 dígitos)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                placeholder="****"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar PIN
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              maxLength={4}
              placeholder="****"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
            />
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-secondary-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Guardar PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
