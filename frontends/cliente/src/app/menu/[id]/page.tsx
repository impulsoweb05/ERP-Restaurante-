'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchProduct, checkSchedule } from '@/services/api';
import type { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetchProduct(params.id as string);
        if (response.success) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);
    setError('');

    try {
      // Validate schedule
      const scheduleRes = await checkSchedule();
      if (!scheduleRes.success || !scheduleRes.data.isOpen) {
        setError('El restaurante está cerrado en este momento');
        setAdding(false);
        return;
      }

      // Validate product is still active
      const productRes = await fetchProduct(product.id);
      if (!productRes.success || productRes.data.status !== 'active') {
        setError('Este producto ya no está disponible');
        setAdding(false);
        return;
      }

      // Add to cart
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          delivery_cost: product.delivery_cost,
          special_instructions: instructions || undefined,
        },
        quantity
      );

      router.push('/cart');
    } catch {
      setError('Error al agregar al carrito');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">😕</span>
        <p className="text-gray-500">Producto no encontrado</p>
        <button
          onClick={() => router.push('/menu')}
          className="mt-4 text-primary-500 font-medium hover:underline"
        >
          Volver al menú
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Product Image */}
      <div className="relative h-64 sm:h-80 bg-gray-100 rounded-2xl overflow-hidden mb-6">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
        {product.status === 'inactive' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-medium">
              Producto no disponible
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

        {product.rating !== undefined && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-yellow-400">⭐</span>
            <span className="text-gray-600">{product.rating.toFixed(1)}</span>
          </div>
        )}

        {product.description && (
          <p className="text-gray-600 mb-4">{product.description}</p>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-primary-500">
            {formatCurrency(product.price)}
          </span>
          {product.delivery_cost > 0 && (
            <span className="text-sm text-gray-400">
              + {formatCurrency(product.delivery_cost)} domicilio
            </span>
          )}
        </div>

        {product.preparation_time > 0 && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <span>⏱️</span>
            <span>{product.preparation_time} min</span>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <span className="font-medium text-gray-700">Cantidad</span>
          <div className="flex items-center gap-4 bg-gray-100 rounded-full px-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-600 hover:text-primary-500"
            >
              -
            </button>
            <span className="font-medium text-gray-900 min-w-[24px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-600 hover:text-primary-500"
            >
              +
            </button>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="py-4 border-t border-gray-100">
          <label className="block font-medium text-gray-700 mb-2">
            Instrucciones especiales
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej: Sin cebolla, extra queso..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.status === 'inactive'}
          className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {adding ? (
            <>
              <span className="spinner !border-white/30 !border-t-white !w-5 !h-5"></span>
              Agregando...
            </>
          ) : (
            <>
              Agregar al carrito - {formatCurrency(product.price * quantity)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
