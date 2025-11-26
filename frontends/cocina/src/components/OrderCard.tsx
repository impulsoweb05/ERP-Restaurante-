'use client';

import { useState, useEffect } from 'react';
import type { GroupedOrder } from '@/types';
import {
  formatElapsedTime,
  getOrderTypeInfo,
  getStationInfo,
  getStatusInfo,
  cn,
} from '@/lib/utils';

interface OrderCardProps {
  order: GroupedOrder;
  onStartItem: (itemId: string) => void;
  onCompleteItem: (itemId: string) => void;
}

export default function OrderCard({ order, onStartItem, onCompleteItem }: OrderCardProps) {
  const [elapsedTime, setElapsedTime] = useState(order.elapsed_time);
  const orderTypeInfo = getOrderTypeInfo(order.order_type);

  useEffect(() => {
    const interval = setInterval(() => {
      const created = new Date(order.created_at).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - created) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const pendingItems = order.items.filter((i) => i.status === 'pending');
  const preparingItems = order.items.filter((i) => i.status === 'preparing');
  const readyItems = order.items.filter((i) => i.status === 'ready');

  const allReady = order.items.every((i) => i.status === 'ready');
  const isUrgent = elapsedTime >= 30 * 60 && !allReady;

  return (
    <div
      className={cn(
        'bg-gray-800 rounded-xl overflow-hidden border-2 transition-all',
        isUrgent ? 'border-red-500 animate-pulse-urgent' : 'border-gray-700',
        allReady && 'border-green-500'
      )}
    >
      {/* Order Header */}
      <div
        className={cn(
          'p-4 flex items-center justify-between',
          isUrgent ? 'bg-red-500/20' : 'bg-gray-700/50'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Order Type Badge */}
          <span
            className="text-2xl"
            style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
          >
            {orderTypeInfo.icon}
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {order.order_number}
              </span>
              {order.table_number && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-sm rounded">
                  Mesa {order.table_number}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-400">{orderTypeInfo.label}</span>
          </div>
        </div>

        {/* Timer */}
        <div
          className={cn(
            'text-right',
            isUrgent ? 'text-red-400' : 'text-gray-300'
          )}
        >
          <div className="text-2xl font-mono font-bold">
            {formatElapsedTime(elapsedTime)}
          </div>
          <div className="text-xs text-gray-500">tiempo en cola</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 space-y-3">
        {order.items.map((item) => {
          const stationInfo = getStationInfo(item.station);
          const statusInfo = getStatusInfo(item.status);

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                item.status === 'pending' && 'bg-yellow-500/10 border-yellow-500/30',
                item.status === 'preparing' && 'bg-orange-500/10 border-orange-500/30',
                item.status === 'ready' && 'bg-green-500/10 border-green-500/30'
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{stationInfo.icon}</span>
                  <span className="text-white font-medium">
                    {item.menu_item_name}
                  </span>
                  <span className="text-xl font-bold text-gray-300">
                    x{item.quantity}
                  </span>
                </div>

                {item.special_instructions && (
                  <div className="flex items-center gap-1 text-sm text-yellow-400 mt-1">
                    <span>📝</span>
                    <span>{item.special_instructions}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      statusInfo.bgColor
                    )}
                    style={{ color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    ⏱️ {item.preparation_time} min
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="ml-4">
                {item.status === 'pending' && (
                  <button
                    onClick={() => onStartItem(item.id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <span>▶️</span>
                    <span>Iniciar</span>
                  </button>
                )}
                {item.status === 'preparing' && (
                  <button
                    onClick={() => onCompleteItem(item.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <span>✅</span>
                    <span>Listo</span>
                  </button>
                )}
                {item.status === 'ready' && (
                  <span className="px-4 py-2 text-green-400 font-medium flex items-center gap-2">
                    <span>✅</span>
                    <span>Completado</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Footer - Progress Summary */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Progreso del pedido</span>
          <span>
            {readyItems.length}/{order.items.length} listos
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
          {pendingItems.length > 0 && (
            <div
              className="h-full bg-yellow-500"
              style={{
                width: `${(pendingItems.length / order.items.length) * 100}%`,
              }}
            />
          )}
          {preparingItems.length > 0 && (
            <div
              className="h-full bg-orange-500"
              style={{
                width: `${(preparingItems.length / order.items.length) * 100}%`,
              }}
            />
          )}
          {readyItems.length > 0 && (
            <div
              className="h-full bg-green-500"
              style={{
                width: `${(readyItems.length / order.items.length) * 100}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
