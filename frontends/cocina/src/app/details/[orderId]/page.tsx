'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useKitchenStore } from '@/stores/kitchenStore';
import { startPreparation, completeItem, fetchKitchenQueue } from '@/services/api';
import type { KitchenQueueItem } from '@/types';
import {
  formatElapsedTime,
  getOrderTypeInfo,
  getStationInfo,
  getStatusInfo,
  cn,
} from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const { isAuthenticated, isLoading: authLoading, loadFromStorage } = useAuthStore();
  const { queue, setQueue, updateItemStatus } = useKitchenStore();
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load auth from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load order items
  const loadOrder = useCallback(async () => {
    try {
      const response = await fetchKitchenQueue();
      if (response.success) {
        setQueue(response.data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setQueue]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrder();
    }
  }, [isAuthenticated, loadOrder]);

  // Get order items
  const orderItems = queue.filter((item) => item.order_id === orderId);
  const firstItem = orderItems[0];

  // Update elapsed time
  useEffect(() => {
    if (!firstItem) return;

    const updateElapsed = () => {
      const created = new Date(firstItem.created_at).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - created) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [firstItem]);

  // Handle start preparation
  const handleStartItem = async (itemId: string) => {
    try {
      const response = await startPreparation(itemId);
      if (response.success) {
        updateItemStatus(itemId, 'preparing');
      }
    } catch (error) {
      console.error('Error starting preparation:', error);
    }
  };

  // Handle complete item
  const handleCompleteItem = async (itemId: string) => {
    try {
      const response = await completeItem(itemId);
      if (response.success) {
        updateItemStatus(itemId, 'ready');
      }
    } catch (error) {
      console.error('Error completing item:', error);
    }
  };

  // Start all pending items
  const handleStartAll = async () => {
    const pendingItems = orderItems.filter((i) => i.status === 'pending');
    for (const item of pendingItems) {
      await handleStartItem(item.id);
    }
  };

  // Complete all preparing items
  const handleCompleteAll = async () => {
    const preparingItems = orderItems.filter((i) => i.status === 'preparing');
    for (const item of preparingItems) {
      await handleCompleteItem(item.id);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando pedido..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!firstItem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <span className="text-6xl mb-4">🔍</span>
        <h1 className="text-2xl font-bold text-white mb-2">Pedido no encontrado</h1>
        <p className="text-gray-400 mb-6">El pedido que buscas no existe o ya fue completado</p>
        <Link
          href="/queue"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Volver a la cola
        </Link>
      </div>
    );
  }

  const orderTypeInfo = getOrderTypeInfo(firstItem.order_type);
  const pendingItems = orderItems.filter((i) => i.status === 'pending');
  const preparingItems = orderItems.filter((i) => i.status === 'preparing');
  const readyItems = orderItems.filter((i) => i.status === 'ready');
  const isUrgent = elapsedTime >= 30 * 60 && readyItems.length !== orderItems.length;
  const allReady = orderItems.every((i) => i.status === 'ready');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-kitchen-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/queue"
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Volver
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{orderTypeInfo.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-white">
                {firstItem.order_number}
              </h1>
              {firstItem.table_number && (
                <span className="text-sm text-gray-400">
                  Mesa {firstItem.table_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div
          className={cn(
            'text-right px-6 py-2 rounded-lg',
            isUrgent ? 'bg-red-500/20' : 'bg-gray-700'
          )}
        >
          <div
            className={cn(
              'text-3xl font-mono font-bold',
              isUrgent ? 'text-red-400' : 'text-white'
            )}
          >
            {formatElapsedTime(elapsedTime)}
          </div>
          <div className="text-xs text-gray-400">tiempo en cola</div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Progreso del pedido</span>
          <span>
            {readyItems.length}/{orderItems.length} listos
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
          {pendingItems.length > 0 && (
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{
                width: `${(pendingItems.length / orderItems.length) * 100}%`,
              }}
            />
          )}
          {preparingItems.length > 0 && (
            <div
              className="h-full bg-orange-500 transition-all"
              style={{
                width: `${(preparingItems.length / orderItems.length) * 100}%`,
              }}
            />
          )}
          {readyItems.length > 0 && (
            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width: `${(readyItems.length / orderItems.length) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-gray-800/50 p-4 flex items-center justify-center gap-4">
        {pendingItems.length > 0 && (
          <button
            onClick={handleStartAll}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <span>▶️</span>
            <span>Iniciar todos ({pendingItems.length})</span>
          </button>
        )}
        {preparingItems.length > 0 && (
          <button
            onClick={handleCompleteAll}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span>✅</span>
            <span>Completar todos ({preparingItems.length})</span>
          </button>
        )}
        {allReady && (
          <div className="px-6 py-3 bg-green-500/20 text-green-400 rounded-lg font-medium flex items-center gap-2">
            <span>🎉</span>
            <span>¡Pedido completado!</span>
          </div>
        )}
      </div>

      {/* Items List */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {orderItems.map((item) => {
            const stationInfo = getStationInfo(item.station);
            const statusInfo = getStatusInfo(item.status);

            return (
              <div
                key={item.id}
                className={cn(
                  'bg-gray-800 rounded-xl p-6 border-2 transition-all',
                  item.status === 'pending' && 'border-yellow-500/50',
                  item.status === 'preparing' && 'border-orange-500/50',
                  item.status === 'ready' && 'border-green-500/50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{stationInfo.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {item.menu_item_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-2 py-0.5 rounded text-sm font-medium"
                            style={{
                              backgroundColor: `${stationInfo.color}20`,
                              color: stationInfo.color,
                            }}
                          >
                            {stationInfo.name}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-sm font-medium',
                              statusInfo.bgColor
                            )}
                            style={{ color: statusInfo.color }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          x{item.quantity}
                        </span>
                        <span className="text-gray-500">unidades</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>⏱️</span>
                        <span>{item.preparation_time} min estimados</span>
                      </div>
                    </div>

                    {item.special_instructions && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <span>📝</span>
                          <span className="font-medium">Instrucciones especiales:</span>
                        </div>
                        <p className="text-yellow-300 mt-1">{item.special_instructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleStartItem(item.id)}
                        className="px-6 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                      >
                        <span>▶️</span>
                        <span>Iniciar</span>
                      </button>
                    )}
                    {item.status === 'preparing' && (
                      <button
                        onClick={() => handleCompleteItem(item.id)}
                        className="px-6 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <span>✅</span>
                        <span>Listo</span>
                      </button>
                    )}
                    {item.status === 'ready' && (
                      <div className="px-6 py-4 text-green-400 font-bold text-lg flex items-center gap-2">
                        <span>✅</span>
                        <span>Completado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
