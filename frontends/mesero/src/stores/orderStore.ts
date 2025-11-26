import { create } from 'zustand';
import type { Order } from '@/types';

interface OrderState {
  orders: Order[];
  activeOrders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  getOrdersByTable: (tableId: string) => Order[];
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrders: [],

  setOrders: (orders: Order[]) => {
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
    const activeOrders = orders.filter(order => activeStatuses.includes(order.status));
    set({ orders, activeOrders });
  },

  updateOrder: (orderId: string, updates: Partial<Order>) => {
    set((state) => {
      const orders = state.orders.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      );
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
      const activeOrders = orders.filter(order => activeStatuses.includes(order.status));
      return { orders, activeOrders };
    });
  },

  addOrder: (order: Order) => {
    set((state) => {
      const orders = [order, ...state.orders];
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
      const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
      return { orders, activeOrders };
    });
  },

  removeOrder: (orderId: string) => {
    set((state) => {
      const orders = state.orders.filter(order => order.id !== orderId);
      const activeOrders = state.activeOrders.filter(order => order.id !== orderId);
      return { orders, activeOrders };
    });
  },

  getOrdersByTable: (tableId: string) => {
    return get().orders.filter(order => order.table_id === tableId);
  },
}));
