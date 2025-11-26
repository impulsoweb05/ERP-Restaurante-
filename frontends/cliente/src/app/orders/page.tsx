'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { fetchOrders } from '@/services/api';
import type { Order } from '@/types';
import { formatCurrency, formatDateTime, getStatusColor, getStatusText } from '@/lib/utils';
import OrderStatus from '@/components/OrderStatus';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successOrder = searchParams.get('success');

  const { customer, token, isAuthenticated, isLoading } = useAuth();
  useWebSocket(token); // Connect for real-time updates

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/orders');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!customer) return;

      try {
        const response = await fetchOrders(customer.id);
        if (response.success) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customer) {
      loadOrders();
    }
  }, [customer]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );
  const historyOrders = orders.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  );

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Message */}
      {successOrder && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-800">¡Pedido confirmado!</p>
            <p className="text-green-700">
              Tu pedido <strong>{successOrder}</strong> ha sido recibido
            </p>
          </div>
        </div>
      )}

      <h1 className="text-xl font-bold text-gray-900">Mis Pedidos</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-primary-500 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Activos ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-primary-500 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial ({historyOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📦</span>
          <p className="text-gray-500">
            {activeTab === 'active'
              ? 'No tienes pedidos activos'
              : 'No tienes pedidos en el historial'}
          </p>
          {activeTab === 'active' && (
            <Link
              href="/menu"
              className="inline-block mt-4 text-primary-500 font-medium hover:underline"
            >
              Hacer un pedido
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-bold text-gray-900">
                    {order.order_number}
                  </span>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Order Timeline for active orders */}
              {activeTab === 'active' && (
                <OrderStatus status={order.status} showTimeline />
              )}

              <div className="flex items-center justify-between pt-3 border-t mt-3">
                <div>
                  <span className="text-sm text-gray-500">
                    {order.items?.length || 0} productos
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="font-bold text-primary-500">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-primary-500 font-medium text-sm hover:underline"
                >
                  Ver detalle →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
