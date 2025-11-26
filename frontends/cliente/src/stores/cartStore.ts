import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateInstructions: (id: string, instructions: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDeliveryCost: () => number;
  getTotal: () => number;
  loadFromStorage: () => void;
}

const saveToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

const loadCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item: CartItem) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      let newItems: CartItem[];

      if (existing) {
        newItems = state.items.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, item];
      }

      saveToStorage(newItems);
      return { items: newItems };
    }),

  removeItem: (id: string) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      saveToStorage(newItems);
      return { items: newItems };
    }),

  updateQuantity: (id: string, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.id !== id);
        saveToStorage(newItems);
        return { items: newItems };
      }

      const newItems = state.items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      );
      saveToStorage(newItems);
      return { items: newItems };
    }),

  updateInstructions: (id: string, instructions: string) =>
    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === id ? { ...i, special_instructions: instructions } : i
      );
      saveToStorage(newItems);
      return { items: newItems };
    }),

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getDeliveryCost: () => {
    const items = get().items;
    if (items.length === 0) return 0;
    return Math.max(...items.map((item) => item.delivery_cost || 0));
  },

  getTotal: () => {
    return get().getSubtotal() + get().getDeliveryCost();
  },

  loadFromStorage: () => {
    const items = loadCart();
    set({ items });
  },
}));
