'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { fetchTables, fetchReservations, occupyTable, releaseTable, activateReservation } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import type { Table, Reservation } from '@/types';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

type ZoneFilter = 'all' | 'salon' | 'terraza' | 'vip';

export default function TablesPage() {
  const router = useRouter();
  const { waiter, isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const { lastMessage } = useSocket();
  
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tablesRes, reservationsRes] = await Promise.all([
          fetchTables(),
          fetchReservations(),
        ]);

        if (tablesRes.success) {
          setTables(tablesRes.data);
        }
        if (reservationsRes.success) {
          setReservations(reservationsRes.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'table-updated') {
      const updatedTable = lastMessage.data as unknown as Table;
      setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    }
  }, [lastMessage]);

  const filteredTables = tables.filter(table => {
    if (zoneFilter === 'all') return true;
    return table.zone.toLowerCase() === zoneFilter;
  });

  const getTableReservation = (tableId: string): Reservation | undefined => {
    return reservations.find(r => 
      r.table_id === tableId && 
      ['confirmed', 'pending'].includes(r.status)
    );
  };

  const handleOccupyTable = async () => {
    if (!selectedTable || !waiter?.id) return;
    setActionLoading(true);
    try {
      const response = await occupyTable(selectedTable.id, waiter.id);
      if (response.success) {
        setTables(prev => prev.map(t => 
          t.id === selectedTable.id ? { ...t, status: 'occupied' } : t
        ));
        setSelectedTable(null);
        router.push(`/new-order?table=${selectedTable.id}`);
      }
    } catch (error) {
      console.error('Error occupying table:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseTable = async () => {
    if (!selectedTable) return;
    setActionLoading(true);
    try {
      const response = await releaseTable(selectedTable.id);
      if (response.success) {
        setTables(prev => prev.map(t => 
          t.id === selectedTable.id ? { ...t, status: 'available' } : t
        ));
        setSelectedTable(null);
      }
    } catch (error) {
      console.error('Error releasing table:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateReservation = async (reservation: Reservation) => {
    setActionLoading(true);
    try {
      const response = await activateReservation(reservation.id);
      if (response.success) {
        setReservations(prev => prev.map(r => 
          r.id === reservation.id ? { ...r, status: 'active' } : r
        ));
        setTables(prev => prev.map(t => 
          t.id === reservation.table_id ? { ...t, status: 'occupied' } : t
        ));
        setSelectedTable(null);
        router.push(`/new-order?table=${reservation.table_id}`);
      }
    } catch (error) {
      console.error('Error activating reservation:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const zones = ['all', 'salon', 'terraza', 'vip'] as const;
  const zoneLabels: Record<ZoneFilter, string> = {
    all: 'Todas',
    salon: 'Salón',
    terraza: 'Terraza',
    vip: 'VIP',
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              Libre
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              Ocupada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              Reservada
            </span>
          </div>
        </div>

        {/* Zone Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
                zoneFilter === zone
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              {zoneLabels[zone]}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const reservation = getTableReservation(table.id);
            return (
              <TableCard
                key={table.id}
                table={table}
                reservation={reservation}
                onClick={() => setSelectedTable(table)}
              />
            );
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay mesas en esta zona
          </div>
        )}

        {/* Today's Reservations */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Reservas de Hoy ({reservations.length})
          </h2>
          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <span className="text-3xl mb-2 block">📅</span>
              <p className="text-gray-500">No hay reservas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onActivate={() => handleActivateReservation(reservation)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav active="tables" />

      {/* Table Action Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🪑
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Mesa {selectedTable.number}
              </h3>
              <p className="text-gray-500">
                {selectedTable.zone} • {selectedTable.capacity} personas
              </p>
              <StatusBadge status={selectedTable.status} />
            </div>

            <div className="space-y-3">
              {selectedTable.status === 'available' && (
                <button
                  onClick={handleOccupyTable}
                  disabled={actionLoading}
                  className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="spinner border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Ocupar y Tomar Pedido</span>
                    </>
                  )}
                </button>
              )}

              {selectedTable.status === 'occupied' && (
                <>
                  {selectedTable.current_order_id && (
                    <Link
                      href={`/my-orders/${selectedTable.current_order_id}`}
                      className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 flex items-center justify-center gap-2"
                    >
                      <span>📋</span>
                      <span>Ver Pedido Actual</span>
                    </Link>
                  )}
                  <Link
                    href={`/new-order?table=${selectedTable.id}`}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <span>➕</span>
                    <span>Agregar Items</span>
                  </Link>
                  <button
                    onClick={handleReleaseTable}
                    disabled={actionLoading}
                    className="w-full py-3 border-2 border-red-500 text-red-500 font-semibold rounded-xl hover:bg-red-50 disabled:opacity-50"
                  >
                    Liberar Mesa
                  </button>
                </>
              )}

              {selectedTable.status === 'reserved' && (
                <div className="text-center text-gray-500 py-4">
                  <span className="text-2xl mb-2 block">📅</span>
                  <p>Esta mesa tiene una reserva.</p>
                  <p className="text-sm">Usa el botón &quot;Cliente Llegó&quot; cuando llegue.</p>
                </div>
              )}

              <button
                onClick={() => setSelectedTable(null)}
                className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableCard({ 
  table, 
  reservation,
  onClick 
}: { 
  table: Table; 
  reservation?: Reservation;
  onClick: () => void;
}) {
  const statusStyles: Record<Table['status'], string> = {
    available: 'bg-green-100 border-green-400',
    occupied: 'bg-red-100 border-red-400',
    reserved: 'bg-yellow-100 border-yellow-400',
    cleaning: 'bg-gray-200 border-gray-400',
  };

  const statusIcons: Record<Table['status'], string> = {
    available: '🟢',
    occupied: '🔴',
    reserved: '🟡',
    cleaning: '⚫',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-4 border-2 text-left transition-transform hover:scale-105 ${statusStyles[table.status]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">🪑</span>
        <span className="text-lg">{statusIcons[table.status]}</span>
      </div>
      <div className="font-bold text-gray-900">Mesa {table.number}</div>
      <div className="text-sm text-gray-600">{table.zone}</div>
      <div className="text-xs text-gray-500 mt-1">
        👥 {table.capacity} personas
      </div>
      {reservation && (
        <div className="mt-2 text-xs bg-white/50 rounded px-2 py-1">
          📅 {reservation.reservation_time} - {reservation.customer_name || 'Reservado'}
        </div>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: Table['status'] }) {
  const badges: Record<Table['status'], { bg: string; text: string; label: string }> = {
    available: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Disponible' },
    occupied: { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 Ocupada' },
    reserved: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🟡 Reservada' },
    cleaning: { bg: 'bg-gray-100', text: 'text-gray-800', label: '⚫ Limpiando' },
  };

  const badge = badges[status];

  return (
    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}

function ReservationCard({ 
  reservation, 
  onActivate 
}: { 
  reservation: Reservation;
  onActivate: () => void;
}) {
  const isConfirmed = reservation.status === 'confirmed';

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${
      isConfirmed ? 'border-2 border-green-400' : 'border border-yellow-400'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">{reservation.reservation_number}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isConfirmed ? '✓ Confirmada' : '⏳ Pendiente'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            🕐 {reservation.reservation_time} • Mesa {reservation.table?.number || reservation.table_id}
          </p>
          <p className="text-sm text-gray-600">
            👤 {reservation.customer_name || 'Cliente'} • 📞 {reservation.customer_phone}
          </p>
          <p className="text-sm text-gray-600">
            👥 {reservation.party_size} personas
          </p>
          {reservation.special_requests && (
            <p className="text-sm text-gray-500 mt-1">
              📝 {reservation.special_requests}
            </p>
          )}
        </div>
      </div>

      {isConfirmed && (
        <button
          onClick={onActivate}
          className="w-full mt-3 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <span>✅</span>
          <span>CLIENTE LLEGÓ</span>
        </button>
      )}
    </div>
  );
}
