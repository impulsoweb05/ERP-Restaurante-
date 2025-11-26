'use client';

import type { CartItem as CartItemType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeItem, updateInstructions } = useCart();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🍽️
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              aria-label="Eliminar producto"
            >
              🗑️
            </button>
          </div>

          <p className="text-primary-500 font-semibold mt-1">
            {formatCurrency(item.price)}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2">
              <button
                onClick={() => decreaseQuantity(item.id)}
                className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-600 hover:text-primary-500 transition-colors"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="font-medium text-gray-900 min-w-[24px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => increaseQuantity(item.id)}
                className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-600 hover:text-primary-500 transition-colors"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <span className="font-bold text-gray-900">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          placeholder="Instrucciones especiales (opcional)"
          value={item.special_instructions || ''}
          onChange={(e) => updateInstructions(item.id, e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
