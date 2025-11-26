'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/CartItem';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, deliveryCost, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🛒</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-gray-500 mb-6">
          Agrega productos del menú para comenzar
        </p>
        <Link
          href="/menu"
          className="inline-block bg-primary-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-600 transition-colors"
        >
          Ver menú
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mi Carrito</h1>
        <button
          onClick={() => clearCart()}
          className="text-red-500 text-sm font-medium hover:underline"
        >
          Vaciar carrito
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900">Resumen del pedido</h2>

        <div className="space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Domicilio</span>
            <span>{formatCurrency(deliveryCost)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-primary-500">{formatCurrency(total)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          * El costo de domicilio es el máximo entre los productos seleccionados
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push('/checkout')}
          className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors"
        >
          Finalizar pedido - {formatCurrency(total)}
        </button>

        <Link
          href="/menu"
          className="block w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl text-center hover:bg-gray-200 transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
