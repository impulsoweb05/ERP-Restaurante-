'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem } from '@/types';

export const useCart = () => {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateInstructions,
    clearCart,
    getSubtotal,
    getDeliveryCost,
    getTotal,
    loadFromStorage,
  } = useCartStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    addItem({ ...item, quantity });
  };

  const increaseQuantity = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const decreaseQuantity = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    } else {
      removeItem(id);
    }
  };

  return {
    items,
    itemCount,
    subtotal: getSubtotal(),
    deliveryCost: getDeliveryCost(),
    total: getTotal(),
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    updateInstructions,
    clearCart,
  };
};
