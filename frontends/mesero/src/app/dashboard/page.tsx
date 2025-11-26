'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { fetchOrders, fetchTables } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import type { Order, Table } from '@/types';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

export default function DashboardPage() {
  const router = useRouter();
  const { waiter, isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const { activeOrders, setOrders } = useOrderStore();
  const { lastMessage } = useSocket();
  
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [readyItems, setReadyItems] = useState<string[]>([]);

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
      if (!waiter?.id) return;
      
      try {
        const [ordersRes, tablesRes] = await Promise.all([
          fetchOrders({ waiterId: waiter.id }),
          fetchTables(waiter.id),
        ]);

        if (ordersRes.success) {
          setOrders(ordersRes.data);
        }
        if (tablesRes.success) {
          setTables(tablesRes.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (waiter?.id) {
      loadData();
    }
  }, [waiter?.id, setOrders]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'order-item-ready') {
        const itemId = lastMessage.data.itemId as string;
        setReadyItems(prev => [...prev, itemId]);
        // Play notification sound
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🍽️ Plato Listo', {
            body: `Un plato está listo para servir`,
            icon: '/icons/icon-192x192.png',
          });
        }
      }
      if (lastMessage.type === 'order-updated') {
        // Refresh orders
        if (waiter?.id) {
          fetchOrders({ waiterId: waiter.id }).then(res => {
            if (res.success) setOrders(res.data);
          });
        }
      }
    }
  }, [lastMessage, waiter?.id, setOrders]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const readyOrders = activeOrders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">¡Hola, {waiter?.name}! 👋</h1>
          <p className="text-primary-100">Código: {waiter?.code}</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{activeOrders.length}</div>
              <div className="text-xs text-primary-100">Pedidos Activos</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{occupiedTables.length}</div>
              <div className="text-xs text-primary-100">Mesas Ocupadas</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{readyOrders.length}</div>
              <div className="text-xs text-primary-100">Listos para Servir</div>
            </div>
          </div>
        </section>

        {/* Ready Orders Alert */}
        {readyOrders.length > 0 && (
          <section className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl animate-pulse-slow">🔔</span>
              <h2 className="text-lg font-bold text-green-800">
                ¡{readyOrders.length} pedido{readyOrders.length > 1 ? 's' : ''} listo{readyOrders.length > 1 ? 's' : ''}!
              </h2>
            </div>
            <div className="space-y-2">
              {readyOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/my-orders/${order.id}`}
                  className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm"
                >
                  <div>
                    <span className="font-semibold text-gray-900">
                      {order.order_number}
                    </span>
                    <span className="text-gray-500 ml-2">
                      Mesa {order.table?.number || order.table_id}
                    </span>
                  </div>
                  <span className="text-green-600 font-medium">Servir →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/tables"
              className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-4xl mb-2">🪑</span>
              <span className="font-semibold text-gray-900">Ver Mesas</span>
              <span className="text-sm text-gray-500">{tables.length} mesas</span>
            </Link>
            <Link
              href="/my-orders"
              className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-4xl mb-2">📋</span>
              <span className="font-semibold text-gray-900">Mis Pedidos</span>
              <span className="text-sm text-gray-500">{activeOrders.length} activos</span>
            </Link>
          </div>
        </section>

        {/* Active Orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Pedidos Activos</h2>
            <Link href="/my-orders" className="text-primary-500 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500">No tienes pedidos activos</p>
              <Link
                href="/tables"
                className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl font-medium"
              >
                Ver mesas
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.slice(0, 5).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        {/* Assigned Tables */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Mesas Asignadas</h2>
            <Link href="/tables" className="text-primary-500 text-sm font-medium">
              Ver todas →
            </Link>
          </div>
          
          {occupiedTables.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <span className="text-4xl mb-4 block">🪑</span>
              <p className="text-gray-500">No tienes mesas ocupadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {occupiedTables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav active="dashboard" />
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusBadge = (status: Order['status']) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pendiente' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✓ Confirmado' },
      preparing: { bg: 'bg-orange-100', text: 'text-orange-800', label: '🍳 Preparando' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Listo' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const badge = getStatusBadge(order.status);

  return (
    <Link
      href={`/my-orders/${order.id}`}
      className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{order.order_number}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Mesa {order.table?.number || order.table_id} • {order.items?.length || 0} items
        </p>
        <p className="text-sm font-medium text-primary-600">
          ${order.total?.toLocaleString('es-CO')}
        </p>
      </div>
      <span className="text-gray-400">→</span>
    </Link>
  );
}

function TableCard({ table }: { table: Table }) {
  const statusColors: Record<Table['status'], string> = {
    available: 'bg-green-100 border-green-400 text-green-800',
    occupied: 'bg-red-100 border-red-400 text-red-800',
    reserved: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    cleaning: 'bg-gray-100 border-gray-400 text-gray-800',
  };

  return (
    <Link
      href={table.current_order_id ? `/my-orders/${table.current_order_id}` : `/new-order?table=${table.id}`}
      className={`rounded-xl p-4 border-2 text-center ${statusColors[table.status]}`}
    >
      <div className="text-2xl mb-1">🪑</div>
      <div className="font-bold">Mesa {table.number}</div>
      <div className="text-xs opacity-75">{table.zone}</div>
    </Link>
  );
}
