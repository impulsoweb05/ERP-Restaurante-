'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { createOrder, checkSchedule } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

type Step = 'address' | 'payment' | 'confirm';
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'dataphone';

export default function CheckoutPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, requireAuth } = useAuth();
  const { items, subtotal, deliveryCost, total, clearCart } = useCart();

  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (items.length === 0 && !processing) {
      router.push('/cart');
    }
  }, [items, processing, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (!customer) {
      setError('Debes iniciar sesión');
      return;
    }

    if (!address.trim()) {
      setError('Ingresa una dirección de entrega');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Validate schedule
      const scheduleRes = await checkSchedule();
      if (!scheduleRes.success || !scheduleRes.data.isOpen) {
        setError('El restaurante está cerrado en este momento');
        setProcessing(false);
        return;
      }

      // Create order
      const orderRes = await createOrder({
        customer_id: customer.id,
        order_type: 'delivery',
        delivery_address: address,
        payment_method: paymentMethod,
        items: items.map((item) => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          special_instructions: item.special_instructions,
        })),
        customer_notes: notes || undefined,
      });

      if (orderRes.success) {
        clearCart();
        router.push(`/orders?success=${orderRes.data.order_number}`);
      } else {
        setError(orderRes.error || 'Error al crear el pedido');
      }
    } catch {
      setError('Error al procesar el pedido');
    } finally {
      setProcessing(false);
    }
  };

  const paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'cash', label: 'Efectivo', icon: '💵' },
    { value: 'card', label: 'Tarjeta', icon: '💳' },
    { value: 'transfer', label: 'Transferencia', icon: '🏦' },
    { value: 'dataphone', label: 'Datáfono', icon: '📱' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-2">
        {(['address', 'payment', 'confirm'] as Step[]).map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s
                  ? 'bg-primary-500 text-white'
                  : ['address', 'payment', 'confirm'].indexOf(step) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-1 mx-1 ${
                  ['address', 'payment', 'confirm'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        {step === 'address' && '1. Dirección de entrega'}
        {step === 'payment' && '2. Método de pago'}
        {step === 'confirm' && '3. Confirmar pedido'}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {step === 'address' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              ¿Dónde entregamos tu pedido?
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Escribe tu dirección completa (calle, número, barrio, referencias...)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32"
            />
            <button
              onClick={() => setStep('payment')}
              disabled={!address.trim()}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              ¿Cómo deseas pagar?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPaymentMethod(option.value)}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    paymentMethod === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('address')}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Confirma tu pedido
            </h2>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Productos ({items.length})</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Domicilio</span>
                <span className="font-medium">{formatCurrency(deliveryCost)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary-500">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Dirección de entrega:</p>
              <p className="text-gray-900">{address}</p>
            </div>

            {/* Payment Info */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Método de pago:</p>
              <p className="text-gray-900">
                {paymentOptions.find((p) => p.value === paymentMethod)?.label}
              </p>
            </div>

            {/* Notes */}
            <div className="border-t pt-4">
              <label className="block text-sm text-gray-500 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales para el repartidor..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-20"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('payment')}
                disabled={processing}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Atrás
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={processing}
                className="flex-1 bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="spinner !border-white/30 !border-t-white !w-5 !h-5"></span>
                    Procesando...
                  </>
                ) : (
                  '✅ Confirmar pedido'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
