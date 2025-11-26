'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { fetchOrder, updateOrderStatus, markItemServed } from '@/services/api';
import type { Order, OrderItem } from '@/types';

function OrderDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const showSuccess = searchParams.get('success') === 'true';
  
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetchOrder(orderId);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleUpdateStatus = async (status: Order['status']) => {
    if (!order) return;
    setUpdating(true);
    try {
      const response = await updateOrderStatus(order.id, status);
      if (response.success) {
        setOrder({ ...order, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkItemServed = async (itemId: string) => {
    if (!order) return;
    try {
      await markItemServed(order.id, itemId);
      // Refresh order
      const response = await fetchOrder(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error marking item served:', error);
    }
  };

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

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <span className="text-4xl mb-4">❌</span>
        <p className="text-gray-600 mb-4">Pedido no encontrado</p>
        <button
          onClick={() => router.push('/my-orders')}
          className="px-6 py-2 bg-primary-500 text-white rounded-xl"
        >
          Volver
        </button>
      </div>
    );
  }

  const status = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/my-orders')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ←
              </button>
              <div>
                <h1 className="font-bold text-gray-900">{order.order_number}</h1>
                <p className="text-sm text-gray-500">
                  Mesa {order.table?.number || order.table_id}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              {status.icon} {status.label}
            </span>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-green-800">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium">¡Pedido enviado a cocina!</p>
              <p className="text-sm opacity-75">El equipo de cocina ha sido notificado</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Order Status Timeline */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Estado del Pedido</h2>
          <div className="flex items-center justify-between">
            {['pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((s, index) => {
              const statusInfo = getStatusInfo(s as Order['status']);
              const isActive = order.status === s;
              const isPast = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
                .indexOf(order.status) >= index;
              
              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isActive ? statusInfo.bg + ' ring-4 ring-offset-2 ring-primary-200' :
                    isPast ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {statusInfo.icon}
                  </div>
                  <span className={`text-xs mt-2 text-center ${isActive ? 'font-bold' : ''}`}>
                    {statusInfo.label}
                  </span>
                  {index < 4 && (
                    <div className={`h-0.5 w-full mt-5 absolute ${
                      isPast ? 'bg-green-300' : 'bg-gray-200'
                    }`} style={{ left: '50%' }} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Order Items */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Items del Pedido</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <OrderItemCard
                key={item.id || index}
                item={item}
                onMarkServed={item.status === 'ready' ? () => handleMarkItemServed(item.id!) : undefined}
              />
            ))}
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Resumen</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal?.toLocaleString('es-CO')}</span>
            </div>
            {order.delivery_cost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Domicilio</span>
                <span>${order.delivery_cost?.toLocaleString('es-CO')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-primary-600">${order.total?.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {order.customer_notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">📝 Notas:</p>
              <p className="text-gray-700">{order.customer_notes}</p>
            </div>
          )}
        </section>

        {/* Actions */}
        {order.status === 'ready' && (
          <button
            onClick={() => handleUpdateStatus('delivered')}
            disabled={updating}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
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

        {order.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              disabled={updating}
              className="flex-1 py-4 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={updating}
              className="flex-1 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderItemCard({ 
  item, 
  onMarkServed 
}: { 
  item: OrderItem; 
  onMarkServed?: () => void;
}) {
  const getItemStatusInfo = (status?: OrderItem['status']) => {
    const statuses: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente', icon: '⏳' },
      preparing: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Preparando', icon: '🍳' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Listo', icon: '✅' },
      served: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Servido', icon: '🍽️' },
    };
    return statuses[status || 'pending'] || statuses.pending;
  };

  const status = getItemStatusInfo(item.status);

  return (
    <div className={`p-4 rounded-xl border-2 ${
      item.status === 'ready' ? 'border-green-400 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {item.quantity}x {item.name}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              {status.icon} {status.label}
            </span>
          </div>
          {item.special_instructions && (
            <p className="text-sm text-gray-500 mt-1">
              📝 {item.special_instructions}
            </p>
          )}
        </div>
        <span className="font-medium text-gray-900">
          ${(item.quantity * item.unit_price).toLocaleString('es-CO')}
        </span>
      </div>
      
      {onMarkServed && (
        <button
          onClick={onMarkServed}
          className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600"
        >
          🍽️ Marcar como Servido
        </button>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  );
}
