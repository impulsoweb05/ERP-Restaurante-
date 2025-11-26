'use client';

import { useState } from 'react';
import type { Table } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

// Mock data
const mockTables: Table[] = [
  { id: '1', table_number: '1', zone: 'Salón', capacity: 4, status: 'available' },
  { id: '2', table_number: '2', zone: 'Salón', capacity: 4, status: 'occupied', current_order_id: '1' },
  { id: '3', table_number: '3', zone: 'Salón', capacity: 2, status: 'reserved', current_reservation_id: '1' },
  { id: '4', table_number: '4', zone: 'Salón', capacity: 6, status: 'cleaning' },
  { id: '5', table_number: '5', zone: 'Terraza', capacity: 4, status: 'available' },
  { id: '6', table_number: '6', zone: 'Terraza', capacity: 4, status: 'occupied', current_order_id: '2' },
  { id: '7', table_number: '7', zone: 'Terraza', capacity: 8, status: 'available' },
  { id: '8', table_number: 'VIP 1', zone: 'VIP', capacity: 6, status: 'reserved' },
  { id: '9', table_number: 'VIP 2', zone: 'VIP', capacity: 8, status: 'available' },
];

const zones = ['Todas', 'Salón', 'Terraza', 'VIP'];

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [zoneFilter, setZoneFilter] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const filteredTables = tables.filter(
    (table) => zoneFilter === 'Todas' || table.zone === zoneFilter
  );

  const getTableIcon = (status: string) => {
    switch (status) {
      case 'available': return '🟢';
      case 'occupied': return '🔴';
      case 'reserved': return '🟡';
      case 'cleaning': return '⚫';
      default: return '⚪';
    }
  };

  const handleReleaseTable = (table: Table) => {
    if (confirm(`¿Liberar ${table.table_number}?`)) {
      setTables(tables.map(t =>
        t.id === table.id ? { ...t, status: 'available', current_order_id: undefined, current_reservation_id: undefined } : t
      ));
      toast.success('Mesa liberada');
    }
  };

  const handleDeleteTable = (table: Table) => {
    if (confirm(`¿Eliminar ${table.table_number}?`)) {
      setTables(tables.filter(t => t.id !== table.id));
      toast.success('Mesa eliminada');
    }
  };

  const tablesByZone = filteredTables.reduce((acc, table) => {
    if (!acc[table.zone]) acc[table.zone] = [];
    acc[table.zone].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mesas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona las mesas del restaurante
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTable(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Mesa</span>
        </button>
      </div>

      {/* Legend & Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Zone Filter */}
          <div className="flex gap-2">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setZoneFilter(zone)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  zoneFilter === zone
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-secondary-600'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span>🟢</span> Disponible
            </span>
            <span className="flex items-center gap-1">
              <span>🔴</span> Ocupada
            </span>
            <span className="flex items-center gap-1">
              <span>🟡</span> Reservada
            </span>
            <span className="flex items-center gap-1">
              <span>⚫</span> Limpiando
            </span>
          </div>
        </div>
      </div>

      {/* Tables Grid by Zone */}
      {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
        <div key={zone}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {zone}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {zoneTables.map((table) => (
              <div
                key={table.id}
                className={`bg-white dark:bg-secondary-800 rounded-xl shadow-sm border-2 p-4 transition-all hover:shadow-md ${
                  table.status === 'available'
                    ? 'border-green-300 dark:border-green-700'
                    : table.status === 'occupied'
                    ? 'border-red-300 dark:border-red-700'
                    : table.status === 'reserved'
                    ? 'border-yellow-300 dark:border-yellow-700'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl">{getTableIcon(table.status)}</span>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                      Mesa {table.table_number}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(table.status)}`}>
                    {getStatusLabel(table.status)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Users className="h-4 w-4" />
                  {table.capacity} personas
                </div>

                <div className="flex gap-2">
                  {table.status === 'occupied' && (
                    <button
                      onClick={() => handleReleaseTable(table)}
                      className="flex-1 text-xs px-2 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      Liberar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingTable(table);
                      setShowModal(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table)}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Table Modal */}
      {showModal && (
        <TableModal
          table={editingTable}
          onClose={() => {
            setShowModal(false);
            setEditingTable(null);
          }}
          onSave={(table) => {
            if (editingTable) {
              setTables(tables.map(t => t.id === table.id ? table : t));
              toast.success('Mesa actualizada');
            } else {
              setTables([...tables, { ...table, id: Date.now().toString() }]);
              toast.success('Mesa creada');
            }
            setShowModal(false);
            setEditingTable(null);
          }}
        />
      )}
    </div>
  );
}

function TableModal({
  table,
  onClose,
  onSave,
}: {
  table: Table | null;
  onClose: () => void;
  onSave: (table: Table) => void;
}) {
  const [form, setForm] = useState<Partial<Table>>(
    table || {
      table_number: '',
      zone: 'Salón',
      capacity: 4,
      status: 'available',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Table);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {table ? 'Editar Mesa' : 'Nueva Mesa'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número/Nombre *
            </label>
            <input
              type="text"
              value={form.table_number}
              onChange={(e) => setForm({ ...form, table_number: e.target.value })}
              required
              placeholder="Ej: 1, VIP 1"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Zona *
            </label>
            <select
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="Salón">Salón</option>
              <option value="Terraza">Terraza</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capacidad *
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              required
              min="1"
              max="20"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              {table ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
