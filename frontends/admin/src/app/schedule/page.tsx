'use client';

import { useState } from 'react';
import type { Schedule } from '@/types';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Calendar } from 'lucide-react';

// Mock data
const daysOfWeek = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
];

const mockSchedules: Schedule[] = [
  { id: '1', day_of_week: 0, day_name: 'Domingo', open_time: '11:00', close_time: '21:00', is_open: true, note: '' },
  { id: '2', day_of_week: 1, day_name: 'Lunes', open_time: '11:00', close_time: '22:00', is_open: true, note: '' },
  { id: '3', day_of_week: 2, day_name: 'Martes', open_time: '11:00', close_time: '22:00', is_open: true, note: '' },
  { id: '4', day_of_week: 3, day_name: 'Miércoles', open_time: '11:00', close_time: '22:00', is_open: true, note: '' },
  { id: '5', day_of_week: 4, day_name: 'Jueves', open_time: '11:00', close_time: '22:00', is_open: true, note: '' },
  { id: '6', day_of_week: 5, day_name: 'Viernes', open_time: '11:00', close_time: '23:00', is_open: true, note: '' },
  { id: '7', day_of_week: 6, day_name: 'Sábado', open_time: '11:00', close_time: '23:00', is_open: true, note: '' },
];

interface SpecialDate {
  id: string;
  date: string;
  note: string;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
}

const mockSpecialDates: SpecialDate[] = [
  { id: '1', date: '2024-12-25', note: 'Navidad - Cerrado', is_open: false },
  { id: '2', date: '2024-12-31', note: 'Fin de Año', is_open: true, open_time: '11:00', close_time: '16:00' },
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(mockSpecialDates);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddSpecial, setShowAddSpecial] = useState(false);

  const handleScheduleChange = (dayId: number, field: string, value: string | boolean) => {
    setSchedules(schedules.map(s =>
      s.day_of_week === dayId ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: API call
    toast.success('Horarios guardados');
    setHasChanges(false);
  };

  const handleDeleteSpecialDate = (id: string) => {
    if (confirm('¿Eliminar esta fecha especial?')) {
      setSpecialDates(specialDates.filter(d => d.id !== id));
      toast.success('Fecha especial eliminada');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Horarios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configura los horarios de apertura del restaurante
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
            hasChanges
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-100 dark:bg-secondary-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="h-5 w-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Horario Semanal</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Día</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Abierto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Apertura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cierre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800 dark:text-white">{schedule.day_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleScheduleChange(schedule.day_of_week, 'is_open', !schedule.is_open)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        schedule.is_open ? 'bg-green-500' : 'bg-gray-300 dark:bg-secondary-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          schedule.is_open ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      value={schedule.open_time}
                      onChange={(e) => handleScheduleChange(schedule.day_of_week, 'open_time', e.target.value)}
                      disabled={!schedule.is_open}
                      className="px-3 py-2 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      value={schedule.close_time}
                      onChange={(e) => handleScheduleChange(schedule.day_of_week, 'close_time', e.target.value)}
                      disabled={!schedule.is_open}
                      className="px-3 py-2 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={schedule.note || ''}
                      onChange={(e) => handleScheduleChange(schedule.day_of_week, 'note', e.target.value)}
                      placeholder="Nota opcional..."
                      className="w-full px-3 py-2 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Special Dates */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Fechas Especiales</h2>
          <button
            onClick={() => setShowAddSpecial(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>
        <div className="p-6">
          {specialDates.length > 0 ? (
            <div className="space-y-3">
              {specialDates.map((special) => (
                <div
                  key={special.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    special.is_open
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Calendar className={`h-5 w-5 ${special.is_open ? 'text-yellow-600' : 'text-red-600'}`} />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {new Date(special.date + 'T12:00:00').toLocaleDateString('es-CO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className={`text-sm ${special.is_open ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'}`}>
                        {special.note}
                        {special.is_open && special.open_time && ` • ${special.open_time} - ${special.close_time}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSpecialDate(special.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No hay fechas especiales configuradas
            </div>
          )}
        </div>
      </div>

      {/* Add Special Date Modal */}
      {showAddSpecial && (
        <AddSpecialDateModal
          onClose={() => setShowAddSpecial(false)}
          onSave={(special) => {
            setSpecialDates([...specialDates, { ...special, id: Date.now().toString() }]);
            toast.success('Fecha especial agregada');
            setShowAddSpecial(false);
          }}
        />
      )}
    </div>
  );
}

function AddSpecialDateModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (special: Omit<SpecialDate, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    date: '',
    note: '',
    is_open: false,
    open_time: '11:00',
    close_time: '22:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nueva Fecha Especial</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nota/Motivo *
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              required
              placeholder="Ej: Navidad - Cerrado"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_open"
              checked={form.is_open}
              onChange={(e) => setForm({ ...form, is_open: e.target.checked })}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="is_open" className="text-sm text-gray-700 dark:text-gray-300">
              Abierto con horario especial
            </label>
          </div>
          {form.is_open && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apertura
                </label>
                <input
                  type="time"
                  value={form.open_time}
                  onChange={(e) => setForm({ ...form, open_time: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cierre
                </label>
                <input
                  type="time"
                  value={form.close_time}
                  onChange={(e) => setForm({ ...form, close_time: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
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
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
