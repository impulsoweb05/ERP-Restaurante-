'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useKitchenStore } from '@/stores/kitchenStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  fetchKitchenQueue,
  fetchKitchenStats,
  fetchStations,
  startPreparation,
  completeItem,
} from '@/services/api';
import type { StationInfo, KitchenStation } from '@/types';
import Header from '@/components/Header';
import StationFilters from '@/components/StationFilters';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function QueuePage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading, loadFromStorage } = useAuthStore();
  const {
    setQueue,
    setStats,
    stats,
    selectedStation,
    setSelectedStation,
    isLoading,
    setLoading,
    getGroupedOrders,
    updateItemStatus,
  } = useKitchenStore();
  const { loadFromStorage: loadSettings } = useSettingsStore();
  const { isConnected } = useWebSocket(token);
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load auth from storage on mount
  useEffect(() => {
    loadFromStorage();
    loadSettings();
  }, [loadFromStorage, loadSettings]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [queueRes, statsRes, stationsRes] = await Promise.all([
        fetchKitchenQueue(),
        fetchKitchenStats(),
        fetchStations(),
      ]);

      if (queueRes.success) {
        setQueue(queueRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (stationsRes.success) {
        setStations(stationsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [setQueue, setStats, setLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadData]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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

  // Handle station filter change
  const handleStationChange = (station: KitchenStation | 'all') => {
    setSelectedStation(station);
  };

  // Get grouped orders
  const groupedOrders = getGroupedOrders();

  // Separate orders by status
  const urgentOrders = groupedOrders.filter((o) => o.is_urgent);
  const pendingOrders = groupedOrders.filter(
    (o) => !o.is_urgent && o.items.some((i) => i.status === 'pending')
  );
  const preparingOrders = groupedOrders.filter(
    (o) =>
      !o.is_urgent &&
      !o.items.some((i) => i.status === 'pending') &&
      o.items.some((i) => i.status === 'preparing')
  );
  const readyOrders = groupedOrders.filter((o) =>
    o.items.every((i) => i.status === 'ready')
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        stats={stats}
        onRefresh={handleRefresh}
        isConnected={isConnected}
      />

      {/* Station Filters */}
      <StationFilters
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={handleStationChange}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto queue-scroll">
        {isLoading || refreshing ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Actualizando cola..." />
          </div>
        ) : groupedOrders.length === 0 ? (
          <EmptyState
            title="No hay pedidos en cola"
            description="Los nuevos pedidos aparecerán aquí automáticamente"
            icon="🍳"
          />
        ) : (
          <div className="space-y-8">
            {/* Urgent Orders Section */}
            {urgentOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🚨</span>
                  <h2 className="text-xl font-bold text-red-400">
                    URGENTE - Más de 30 min
                  </h2>
                  <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded animate-pulse">
                    {urgentOrders.length}
                  </span>
                </div>
                <div className="order-grid">
                  {urgentOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      onStartItem={handleStartItem}
                      onCompleteItem={handleCompleteItem}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⏳</span>
                  <h2 className="text-xl font-bold text-yellow-400">En Cola</h2>
                  <span className="px-2 py-1 bg-yellow-500 text-white text-sm font-bold rounded">
                    {pendingOrders.length}
                  </span>
                </div>
                <div className="order-grid">
                  {pendingOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      onStartItem={handleStartItem}
                      onCompleteItem={handleCompleteItem}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Preparing Orders Section */}
            {preparingOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🍳</span>
                  <h2 className="text-xl font-bold text-orange-400">
                    En Preparación
                  </h2>
                  <span className="px-2 py-1 bg-orange-500 text-white text-sm font-bold rounded">
                    {preparingOrders.length}
                  </span>
                </div>
                <div className="order-grid">
                  {preparingOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      onStartItem={handleStartItem}
                      onCompleteItem={handleCompleteItem}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Ready Orders Section */}
            {readyOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h2 className="text-xl font-bold text-green-400">Listos</h2>
                  <span className="px-2 py-1 bg-green-500 text-white text-sm font-bold rounded">
                    {readyOrders.length}
                  </span>
                </div>
                <div className="order-grid">
                  {readyOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      onStartItem={handleStartItem}
                      onCompleteItem={handleCompleteItem}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
