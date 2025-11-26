'use client';

import { useState, useEffect } from 'react';
import type { KitchenItem } from '@/types';
import toast from 'react-hot-toast';
import { getStatusLabel } from '@/lib/utils';
import {
  RefreshCcw,
  Clock,
  Play,
  Check,
  AlertTriangle,
  Volume2,
} from 'lucide-react';

// Mock data
const mockKitchenItems: KitchenItem[] = [
  {
    id: '1',
    order_id: '1',
    order_number: 'PED-0045',
    order_type: 'delivery',
    item_name: 'Hamburguesa Clásica',
    quantity: 2,
    station: 'grill',
    special_instructions: 'Sin cebolla',
    status: 'preparing',
    preparation_time: 15,
    started_at: new Date(Date.now() - 600000).toISOString(),
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: '2',
    order_id: '1',
    order_number: 'PED-0045',
    order_type: 'delivery',
    item_name: 'Pizza Margherita',
    quantity: 1,
    station: 'oven',
    status: 'pending',
    preparation_time: 20,
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: '3',
    order_id: '2',
    order_number: 'PED-0044',
    order_type: 'dine_in',
    table_number: '5',
    item_name: 'Hamburguesa Clásica',
    quantity: 4,
    station: 'grill',
    status: 'pending',
    preparation_time: 15,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '4',
    order_id: '2',
    order_number: 'PED-0044',
    order_type: 'dine_in',
    table_number: '5',
    item_name: 'Ensalada César',
    quantity: 1,
    station: 'salad',
    status: 'ready',
    preparation_time: 10,
    started_at: new Date(Date.now() - 600000).toISOString(),
    completed_at: new Date(Date.now() - 60000).toISOString(),
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '5',
    order_id: '3',
    order_number: 'PED-0043',
    order_type: 'takeout',
    item_name: 'Alitas BBQ',
    quantity: 2,
    station: 'fry',
    status: 'pending',
    preparation_time: 12,
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
];

const stations = [
  { value: '', label: 'Todas', icon: '🍽️' },
  { value: 'grill', label: 'Parrilla', icon: '🥩' },
  { value: 'fry', label: 'Fritos', icon: '🍟' },
  { value: 'oven', label: 'Horno', icon: '🍕' },
  { value: 'bar', label: 'Bar', icon: '🍺' },
  { value: 'salad', label: 'Ensaladas', icon: '🥗' },
];

export default function KitchenPage() {
  const [items, setItems] = useState<KitchenItem[]>(mockKitchenItems);
  const [stationFilter, setStationFilter] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredItems = items.filter(
    (item) => !stationFilter || item.station === stationFilter
  );

  const pendingItems = filteredItems.filter((item) => item.status === 'pending');
  const preparingItems = filteredItems.filter((item) => item.status === 'preparing');
  const readyItems = filteredItems.filter((item) => item.status === 'ready');
  const urgentItems = pendingItems.filter((item) => {
    const waitTime = (Date.now() - new Date(item.created_at).getTime()) / 60000;
    return waitTime > 30;
  });

  const handleStart = (item: KitchenItem) => {
    setItems(items.map(i =>
      i.id === item.id ? { ...i, status: 'preparing', started_at: new Date().toISOString() } : i
    ));
    toast.success(`Iniciando: ${item.item_name}`);
  };

  const handleComplete = (item: KitchenItem) => {
    setItems(items.map(i =>
      i.id === item.id ? { ...i, status: 'ready', completed_at: new Date().toISOString() } : i
    ));
    toast.success(`¡Listo! ${item.item_name}`);
    // Play sound
    if (soundEnabled) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    }
  };

  const getWaitTime = (createdAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return minutes;
  };

  const getElapsedTime = (startedAt: string) => {
    const seconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getOrderTypeLabel = (type: string, tableNumber?: string) => {
    switch (type) {
      case 'dine_in':
        return `🪑 Mesa ${tableNumber}`;
      case 'delivery':
        return '🚚 Domicilio';
      case 'takeout':
        return '🛍️ Para Llevar';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧑‍🍳</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">COCINA</h1>
              <p className="text-lg font-mono text-gray-600 dark:text-gray-300">
                {currentTime.toLocaleTimeString('es-CO')}
              </p>
            </div>
          </div>

          {/* Counters */}
          <div className="flex gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
              <span className="text-yellow-800 dark:text-yellow-400 font-medium">
                🟡 Cola: {pendingItems.length}
              </span>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg">
              <span className="text-orange-800 dark:text-orange-400 font-medium">
                🟠 Preparando: {preparingItems.length}
              </span>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
              <span className="text-green-800 dark:text-green-400 font-medium">
                🟢 Listos: {readyItems.length}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-lg transition-colors ${
                soundEnabled
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-400 dark:bg-secondary-700'
              }`}
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-secondary-600 transition-colors"
            >
              <RefreshCcw className="h-5 w-5" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Station Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stations.map((station) => (
          <button
            key={station.value}
            onClick={() => setStationFilter(station.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              stationFilter === station.value
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-700'
            }`}
          >
            <span className="text-lg">{station.icon}</span>
            {station.label}
          </button>
        ))}
      </div>

      {/* Urgent Section */}
      {urgentItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-300 dark:border-red-700 animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
              ⚠️ URGENTE - +30 min de espera ({urgentItems.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentItems.map((item) => (
              <KitchenCard
                key={item.id}
                item={item}
                isUrgent
                onStart={() => handleStart(item)}
                onComplete={() => handleComplete(item)}
                getWaitTime={getWaitTime}
                getElapsedTime={getElapsedTime}
                getOrderTypeLabel={getOrderTypeLabel}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              En Cola ({pendingItems.filter(i => !urgentItems.includes(i)).length})
            </h2>
          </div>
          <div className="space-y-4">
            {pendingItems
              .filter((item) => !urgentItems.includes(item))
              .map((item) => (
                <KitchenCard
                  key={item.id}
                  item={item}
                  onStart={() => handleStart(item)}
                  onComplete={() => handleComplete(item)}
                  getWaitTime={getWaitTime}
                  getElapsedTime={getElapsedTime}
                  getOrderTypeLabel={getOrderTypeLabel}
                />
              ))}
            {pendingItems.filter((i) => !urgentItems.includes(i)).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Sin pedidos en cola
              </div>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              En Preparación ({preparingItems.length})
            </h2>
          </div>
          <div className="space-y-4">
            {preparingItems.map((item) => (
              <KitchenCard
                key={item.id}
                item={item}
                onStart={() => handleStart(item)}
                onComplete={() => handleComplete(item)}
                getWaitTime={getWaitTime}
                getElapsedTime={getElapsedTime}
                getOrderTypeLabel={getOrderTypeLabel}
              />
            ))}
            {preparingItems.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nada en preparación
              </div>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Listos ({readyItems.length})
            </h2>
          </div>
          <div className="space-y-4">
            {readyItems.map((item) => (
              <KitchenCard
                key={item.id}
                item={item}
                onStart={() => handleStart(item)}
                onComplete={() => handleComplete(item)}
                getWaitTime={getWaitTime}
                getElapsedTime={getElapsedTime}
                getOrderTypeLabel={getOrderTypeLabel}
              />
            ))}
            {readyItems.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Sin pedidos listos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KitchenCard({
  item,
  isUrgent = false,
  onStart,
  onComplete,
  getWaitTime,
  getElapsedTime,
  getOrderTypeLabel,
}: {
  item: KitchenItem;
  isUrgent?: boolean;
  onStart: () => void;
  onComplete: () => void;
  getWaitTime: (date: string) => number;
  getElapsedTime: (date: string) => string;
  getOrderTypeLabel: (type: string, table?: string) => string;
}) {
  const station = stations.find((s) => s.value === item.station);

  return (
    <div
      className={`bg-white dark:bg-secondary-800 rounded-xl shadow-sm border-2 p-4 ${
        isUrgent
          ? 'border-red-400 dark:border-red-600'
          : item.status === 'preparing'
          ? 'border-orange-300 dark:border-orange-700'
          : item.status === 'ready'
          ? 'border-green-300 dark:border-green-700'
          : 'border-gray-200 dark:border-secondary-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800 dark:text-white">{item.order_number}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getOrderTypeLabel(item.order_type, item.table_number)}
          </p>
        </div>
        <span className="text-2xl">{station?.icon}</span>
      </div>

      {/* Item Info */}
      <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-3 mb-3">
        <p className="font-medium text-gray-800 dark:text-white">
          {item.item_name} <span className="text-primary-500">x{item.quantity}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {station?.label} • ⏱️ {item.preparation_time} min
        </p>
        {item.special_instructions && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            📝 {item.special_instructions}
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Clock className="h-4 w-4 text-gray-400" />
        {item.status === 'pending' && (
          <span className={`font-medium ${getWaitTime(item.created_at) > 30 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
            Esperando {getWaitTime(item.created_at)} min
          </span>
        )}
        {item.status === 'preparing' && item.started_at && (
          <span className="font-medium text-orange-600">
            En preparación: {getElapsedTime(item.started_at)}
          </span>
        )}
        {item.status === 'ready' && item.completed_at && (
          <span className="font-medium text-green-600">
            ✅ Listo hace {getWaitTime(item.completed_at)} min
          </span>
        )}
      </div>

      {/* Action Button */}
      {item.status === 'pending' && (
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          <Play className="h-5 w-5" />
          INICIAR PREPARACIÓN
        </button>
      )}
      {item.status === 'preparing' && (
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          <Check className="h-5 w-5" />
          MARCAR LISTO
        </button>
      )}
      {item.status === 'ready' && (
        <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
          📢 Mesero notificado
        </div>
      )}
    </div>
  );
}
