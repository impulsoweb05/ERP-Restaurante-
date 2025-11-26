'use client';

import Link from 'next/link';
import type { MenuItem } from '@/types';
import { formatCurrency, truncate } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: MenuItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      delivery_cost: product.delivery_cost,
    });
  };

  return (
    <Link href={`/menu/${product.id}`}>
      <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="relative h-40 bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🍽️
            </div>
          )}
          {product.status === 'inactive' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-500 mb-2">
              {truncate(product.description, 60)}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-bold text-primary-500">
                {formatCurrency(product.price)}
              </span>
              {product.delivery_cost > 0 && (
                <span className="text-xs text-gray-400 block">
                  Domicilio: {formatCurrency(product.delivery_cost)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.status === 'inactive'}
              className="bg-primary-500 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">+</span>
            </button>
          </div>

          {product.rating !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
