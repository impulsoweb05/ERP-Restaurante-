'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { fetchOrders, updateOrderStatus } from '@/services/api';
import type { Order } from '@/types';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

type FilterType = 'all' | 'mine' | 'ready';

export default function MyOrdersPage() {
  const router = useRouter();
  const { waiter, isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const { orders, setOrders } = useOrderStore();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!waiter?.id) return;
      
      try {
        const response = await fetchOrders({ waiterId: waiter.id });
        if (response.success) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (waiter?.id) {
      loadOrders();
    }
  }, [waiter?.id, setOrders]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'ready') return order.status === 'ready';
    if (filter === 'mine') return order.waiter_id === waiter?.id;
    return true;
  });

  const activeOrders = filteredOrders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );
  const completedOrders = filteredOrders.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Todos', icon: '📋' },
            { id: 'mine', label: 'Solo míos', icon: '👤' },
            { id: 'ready', label: 'Listos', icon: '✅' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                filter === f.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Ready Orders Alert */}
        {activeOrders.filter(o => o.status === 'ready').length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-xl animate-pulse-slow">🔔</span>
              <span className="font-medium">
                {activeOrders.filter(o => o.status === 'ready').length} pedido(s) listo(s) para servir
              </span>
            </div>
          </div>
        )}

        {/* Active Orders */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Activos ({activeOrders.length})
          </h2>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500">No hay pedidos activos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} onStatusUpdate={async (status) => {
                  const response = await updateOrderStatus(order.id, status);
                  if (response.success) {
                    setOrders(orders.map(o => o.id === order.id ? { ...o, status } : o));
                  }
                }} />
              ))}
            </div>
          )}
        </section>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Historial ({completedOrders.length})
            </h2>
            <div className="space-y-3">
              {completedOrders.slice(0, 10).map((order) => (
                <OrderCard key={order.id} order={order} compact />
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav active="orders" />
    </div>
  );
}

function OrderCard({ 
  order, 
  compact = false,
  onStatusUpdate 
}: { 
  order: Order; 
  compact?: boolean;
  onStatusUpdate?: (status: Order['status']) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  const getStatusInfo = (status: Order['status']) => {
    const statuses: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente', icon: '⏳' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmado', icon: '✓' },
      preparing: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Preparando', icon: '🍳' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Listo', icon: '✅' },
      delivered: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Entregado', icon: '🚚' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado', icon: '❌' },
    };
    return statuses[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: '?' };
  };

  const status = getStatusInfo(order.status);

  const handleMarkDelivered = async () => {
    if (!onStatusUpdate) return;
    setUpdating(true);
    try {
      await onStatusUpdate('delivered');
    } finally {
      setUpdating(false);
    }
  };

  const timeSinceCreated = () => {
    const created = new Date(order.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  return (
    <Link
      href={`/my-orders/${order.id}`}
      className={`bg-white rounded-xl p-4 shadow-sm block ${
        order.status === 'ready' ? 'border-2 border-green-400' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{order.order_number}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              {status.icon} {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Mesa {order.table?.number || order.table_id} • {timeSinceCreated()}
          </p>
        </div>
        <span className="font-bold text-primary-600">
          ${order.total?.toLocaleString('es-CO')}
        </span>
      </div>

      {!compact && order.items && (
        <div className="border-t pt-3">
          <div className="space-y-1">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.status === 'ready' ? 'bg-green-100 text-green-700' :
                  item.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status === 'ready' ? '✅' : item.status === 'preparing' ? '🍳' : '⏳'}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-gray-400">
                +{order.items.length - 3} más...
              </p>
            )}
          </div>

          {order.status === 'ready' && onStatusUpdate && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleMarkDelivered();
              }}
              disabled={updating}
              className="w-full mt-3 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? (
                <div className="spinner border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>🍽️</span>
                  <span>Marcar como Servido</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </Link>
  );
}
