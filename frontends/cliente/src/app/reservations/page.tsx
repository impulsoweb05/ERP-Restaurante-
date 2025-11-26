'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchReservations, cancelReservation } from '@/services/api';
import type { Reservation } from '@/types';
import { formatDate, formatTime, getStatusColor, getStatusText } from '@/lib/utils';

export default function ReservationsPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/reservations');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadReservations = async () => {
      if (!customer) return;

      try {
        const response = await fetchReservations(customer.id);
        if (response.success) {
          setReservations(response.data);
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customer) {
      loadReservations();
    }
  }, [customer]);

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    setCancelling(id);
    try {
      const response = await cancelReservation(id);
      if (response.success) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
        );
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    } finally {
      setCancelling(null);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  const upcomingReservations = reservations.filter((r) =>
    ['pending', 'confirmed'].includes(r.status)
  );
  const historyReservations = reservations.filter((r) =>
    ['completed', 'cancelled', 'no_show', 'active'].includes(r.status)
  );

  const displayReservations =
    activeTab === 'upcoming' ? upcomingReservations : historyReservations;

  const canCancel = (reservation: Reservation) => {
    const reservationTime = new Date(
      `${reservation.reservation_date}T${reservation.reservation_time}`
    );
    const now = new Date();
    const hoursUntil = (reservationTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil > 2 && reservation.status !== 'cancelled';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mis Reservas</h1>
        <Link
          href="/reservations/new"
          className="bg-primary-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          + Nueva Reserva
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white text-primary-500 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Próximas ({upcomingReservations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-primary-500 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial ({historyReservations.length})
        </button>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : displayReservations.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🪑</span>
          <p className="text-gray-500">
            {activeTab === 'upcoming'
              ? 'No tienes reservas próximas'
              : 'No tienes reservas en el historial'}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/reservations/new"
              className="inline-block mt-4 text-primary-500 font-medium hover:underline"
            >
              Hacer una reserva
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-bold text-gray-900">
                    {reservation.reservation_number}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>📅 {formatDate(reservation.reservation_date)}</span>
                    <span className="mx-2">•</span>
                    <span>🕐 {formatTime(reservation.reservation_time)}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    reservation.status
                  )}`}
                >
                  {getStatusText(reservation.status)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>👥 {reservation.party_size} personas</span>
                {reservation.table && (
                  <span>🪑 Mesa {reservation.table.number}</span>
                )}
              </div>

              {reservation.special_requests && (
                <p className="text-sm text-gray-500 italic mb-3">
                  &quot;{reservation.special_requests}&quot;
                </p>
              )}

              {activeTab === 'upcoming' && canCancel(reservation) && (
                <button
                  onClick={() => handleCancel(reservation.id)}
                  disabled={cancelling === reservation.id}
                  className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {cancelling === reservation.id
                    ? 'Cancelando...'
                    : '❌ Cancelar reserva'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
