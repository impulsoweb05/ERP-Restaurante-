'use client';

import { useState } from 'react';
import type { Reservation, Customer, Table } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, formatTime, getStatusColor, getStatusLabel, formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Phone,
  Check,
  X,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Mock data
const mockReservations: Reservation[] = [
  {
    id: '1',
    reservation_number: 'RES-0023',
    customer_id: '1',
    customer: { id: '1', customer_code: 'CLI-001', name: 'Juan Pérez', phone: '3001234567', addresses: [], total_orders: 5, total_spent: 250000, is_active: true, created_at: '', updated_at: '' },
    table_id: '3',
    table: { id: '3', table_number: '3', zone: 'Salón', capacity: 4, status: 'reserved' },
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '19:00',
    party_size: 4,
    status: 'confirmed',
    special_requests: 'Mesa cerca de la ventana',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    reservation_number: 'RES-0024',
    customer_id: '2',
    customer: { id: '2', customer_code: 'CLI-002', name: 'María García', phone: '3109876543', addresses: [], total_orders: 3, total_spent: 180000, is_active: true, created_at: '', updated_at: '' },
    table_id: '8',
    table: { id: '8', table_number: 'VIP 1', zone: 'VIP', capacity: 6, status: 'reserved' },
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '20:30',
    party_size: 5,
    status: 'pending',
    special_requests: 'Celebración de cumpleaños',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    reservation_number: 'RES-0022',
    customer_id: '3',
    customer: { id: '3', customer_code: 'CLI-003', name: 'Carlos López', phone: '3151234567', addresses: [], total_orders: 1, total_spent: 50000, is_active: true, created_at: '', updated_at: '' },
    table_id: '5',
    table: { id: '5', table_number: '5', zone: 'Terraza', capacity: 4, status: 'available' },
    reservation_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    reservation_time: '13:00',
    party_size: 2,
    status: 'completed',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockTables: Table[] = [
  { id: '1', table_number: '1', zone: 'Salón', capacity: 4, status: 'available' },
  { id: '5', table_number: '5', zone: 'Terraza', capacity: 4, status: 'available' },
  { id: '7', table_number: '7', zone: 'Terraza', capacity: 8, status: 'available' },
  { id: '9', table_number: 'VIP 2', zone: 'VIP', capacity: 8, status: 'available' },
];

const statusTabs = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'active', label: 'Activas' },
  { value: 'completed,cancelled,no_show', label: 'Historial' },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.reservation_number.toLowerCase().includes(search.toLowerCase()) ||
      res.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      res.customer?.phone?.includes(search);
    const matchesTab = !activeTab || activeTab.split(',').includes(res.status);
    return matchesSearch && matchesTab;
  });

  const handleConfirm = (reservation: Reservation) => {
    setReservations(reservations.map(r =>
      r.id === reservation.id ? { ...r, status: 'confirmed' } : r
    ));
    toast.success('Reserva confirmada');
  };

  const handleReject = (reservation: Reservation) => {
    const reason = prompt('Razón del rechazo:');
    if (reason) {
      setReservations(reservations.map(r =>
        r.id === reservation.id ? { ...r, status: 'cancelled' } : r
      ));
      toast.success('Reserva rechazada');
    }
  };

  const handleComplete = (reservation: Reservation) => {
    setReservations(reservations.map(r =>
      r.id === reservation.id ? { ...r, status: 'completed' } : r
    ));
    toast.success('Reserva completada');
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding days from next month
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(r => r.reservation_date === dateStr);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reservas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona las reservas del restaurante
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            <span>{viewMode === 'list' ? 'Calendario' : 'Lista'}</span>
          </button>
          <button
            onClick={() => {
              setSelectedReservation(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Tabs & Search */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por código, cliente o teléfono..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-secondary-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mesa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Personas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        {reservation.reservation_number}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-800 dark:text-white">
                            {formatDate(reservation.reservation_date)}
                          </span>
                          <Clock className="h-4 w-4 text-gray-400 ml-2" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {reservation.reservation_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {reservation.customer?.name}
                          </p>
                          <a
                            href={`tel:${reservation.customer?.phone}`}
                            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
                          >
                            <Phone className="h-3 w-3" />
                            {reservation.customer?.phone}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        Mesa {reservation.table?.table_number} ({reservation.table?.zone})
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Users className="h-4 w-4" />
                          {reservation.party_size}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirm(reservation)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Confirmar"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(reservation)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleComplete(reservation)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Completar"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReservations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron reservas</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {currentMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((date, i) => {
              const dayReservations = getReservationsForDate(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`min-h-[100px] p-2 border border-gray-100 dark:border-secondary-700 rounded-lg ${
                    isCurrentMonth ? 'bg-white dark:bg-secondary-800' : 'bg-gray-50 dark:bg-secondary-900'
                  } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayReservations.slice(0, 2).map((res) => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setSelectedReservation(res);
                          setShowDetailModal(true);
                        }}
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          res.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : res.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {res.reservation_time} - {res.customer?.name}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayReservations.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showModal && (
        <ReservationModal
          reservation={selectedReservation}
          tables={mockTables}
          onClose={() => {
            setShowModal(false);
            setSelectedReservation(null);
          }}
          onSave={(reservation) => {
            if (selectedReservation) {
              setReservations(reservations.map(r => r.id === reservation.id ? reservation : r));
              toast.success('Reserva actualizada');
            } else {
              setReservations([...reservations, { ...reservation, id: Date.now().toString() }]);
              toast.success('Reserva creada');
            }
            setShowModal(false);
            setSelectedReservation(null);
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}

function ReservationModal({
  reservation,
  tables,
  onClose,
  onSave,
}: {
  reservation: Reservation | null;
  tables: Table[];
  onClose: () => void;
  onSave: (reservation: Reservation) => void;
}) {
  const [form, setForm] = useState<Partial<Reservation>>(
    reservation || {
      reservation_number: `RES-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      reservation_date: new Date().toISOString().split('T')[0],
      reservation_time: '19:00',
      party_size: 2,
      status: 'confirmed',
      special_requests: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Reservation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {reservation ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={form.reservation_date}
                onChange={(e) => setForm({ ...form, reservation_date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora *
              </label>
              <input
                type="time"
                value={form.reservation_time}
                onChange={(e) => setForm({ ...form, reservation_time: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de Personas *
            </label>
            <input
              type="number"
              value={form.party_size}
              onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
              required
              min="1"
              max="20"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mesa *
            </label>
            <select
              value={form.table_id || ''}
              onChange={(e) => setForm({ ...form, table_id: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar mesa...</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Mesa {table.table_number} ({table.zone}) - {table.capacity} personas
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Solicitudes Especiales
            </label>
            <textarea
              value={form.special_requests}
              onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Mesa cerca de la ventana, celebración..."
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
              {reservation ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReservationDetailModal({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {reservation.reservation_number}
            </h2>
            <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
              {getStatusLabel(reservation.status)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(reservation.reservation_date)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hora</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {reservation.reservation_time}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{reservation.customer?.name}</p>
            <a href={`tel:${reservation.customer?.phone}`} className="text-sm text-primary-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {reservation.customer?.phone}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mesa</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Mesa {reservation.table?.table_number}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{reservation.table?.zone}</p>
            </div>
            <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Personas</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-1">
                <Users className="h-4 w-4" />
                {reservation.party_size}
              </p>
            </div>
          </div>

          {reservation.special_requests && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">Solicitudes Especiales</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{reservation.special_requests}</p>
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
