'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchAvailableTables, createReservation, checkSchedule } from '@/services/api';
import type { Table } from '@/types';

type Step = 'date' | 'time' | 'party' | 'table' | 'confirm';

export default function NewReservationPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<Step>('date');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/reservations/new');
    }
  }, [isLoading, isAuthenticated, router]);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 11; hour <= 21; hour++) {
      for (let minute of [0, 30]) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const loadAvailableTables = async () => {
    if (!date || !time) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetchAvailableTables(date, time, partySize);
      if (response.success) {
        setAvailableTables(response.data);
      } else {
        setError('Error al cargar mesas disponibles');
      }
    } catch {
      setError('Error al cargar mesas disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleDateContinue = () => {
    if (!date) {
      setError('Selecciona una fecha');
      return;
    }
    setError('');
    setStep('time');
  };

  const handleTimeContinue = () => {
    if (!time) {
      setError('Selecciona una hora');
      return;
    }
    setError('');
    setStep('party');
  };

  const handlePartyContinue = async () => {
    setError('');
    await loadAvailableTables();
    setStep('table');
  };

  const handleTableContinue = () => {
    if (!selectedTable) {
      setError('Selecciona una mesa');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!customer || !selectedTable) return;

    setProcessing(true);
    setError('');

    try {
      // Validate schedule
      const scheduleRes = await checkSchedule();
      if (!scheduleRes.success) {
        setError('Error al verificar horario');
        setProcessing(false);
        return;
      }

      const response = await createReservation({
        customer_id: customer.id,
        table_id: selectedTable.id,
        reservation_date: date,
        reservation_time: time,
        party_size: partySize,
        special_requests: specialRequests || undefined,
      });

      if (response.success) {
        router.push('/reservations');
      } else {
        setError(response.error || 'Error al crear la reserva');
      }
    } catch {
      setError('Error al procesar la reserva');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Nueva Reserva</h1>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-1 text-sm">
        {(['date', 'time', 'party', 'table', 'confirm'] as Step[]).map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? 'bg-primary-500 text-white'
                  : ['date', 'time', 'party', 'table', 'confirm'].indexOf(step) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            {index < 4 && (
              <div
                className={`w-8 h-0.5 ${
                  ['date', 'time', 'party', 'table', 'confirm'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {step === 'date' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              ¿Para qué día deseas reservar?
            </h2>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleDateContinue}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'time' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              ¿A qué hora?
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {generateTimeSlots().map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    time === slot
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('date')}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleTimeContinue}
                className="flex-1 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'party' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              ¿Cuántas personas?
            </h2>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-12 h-12 bg-gray-100 rounded-full text-2xl font-bold text-gray-600 hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-4xl font-bold text-primary-500 w-20 text-center">
                {partySize}
              </span>
              <button
                onClick={() => setPartySize(Math.min(20, partySize + 1))}
                className="w-12 h-12 bg-gray-100 rounded-full text-2xl font-bold text-gray-600 hover:bg-gray-200"
              >
                +
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('time')}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handlePartyContinue}
                className="flex-1 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'table' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Selecciona una mesa
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : availableTables.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">😕</span>
                <p className="text-gray-500">
                  No hay mesas disponibles para esta fecha y hora
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 border-2 rounded-xl text-left transition-colors ${
                      selectedTable?.id === table.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">🪑</span>
                    <p className="font-bold text-gray-900">Mesa {table.number}</p>
                    <p className="text-sm text-gray-500">{table.zone}</p>
                    <p className="text-sm text-gray-500">{table.capacity} personas</p>
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('party')}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleTableContinue}
                disabled={!selectedTable}
                className="flex-1 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Confirma tu reserva
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">📅 Fecha</span>
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">🕐 Hora</span>
                <span className="font-medium">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">👥 Personas</span>
                <span className="font-medium">{partySize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">🪑 Mesa</span>
                <span className="font-medium">
                  Mesa {selectedTable?.number} ({selectedTable?.zone})
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Solicitudes especiales (opcional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej: Cumpleaños, silla para bebé, cerca de la ventana..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-20"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('table')}
                disabled={processing}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Atrás
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="flex-1 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="spinner !border-white/30 !border-t-white !w-5 !h-5"></span>
                    Procesando...
                  </>
                ) : (
                  '✅ Confirmar reserva'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
