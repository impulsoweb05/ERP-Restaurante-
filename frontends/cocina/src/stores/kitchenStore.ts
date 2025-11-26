import { create } from 'zustand';
import type { KitchenQueueItem, KitchenStats, KitchenStation, GroupedOrder } from '@/types';

interface KitchenState {
  queue: KitchenQueueItem[];
  stats: KitchenStats | null;
  selectedStation: KitchenStation | 'all';
  isLoading: boolean;
  lastUpdate: Date | null;
  setQueue: (queue: KitchenQueueItem[]) => void;
  setStats: (stats: KitchenStats) => void;
  setSelectedStation: (station: KitchenStation | 'all') => void;
  setLoading: (loading: boolean) => void;
  updateItemStatus: (itemId: string, status: KitchenQueueItem['status'], timestamp?: string) => void;
  addItem: (item: KitchenQueueItem) => void;
  removeItem: (itemId: string) => void;
  getGroupedOrders: () => GroupedOrder[];
  getFilteredQueue: () => KitchenQueueItem[];
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  queue: [],
  stats: null,
  selectedStation: 'all',
  isLoading: true,
  lastUpdate: null,

  setQueue: (queue: KitchenQueueItem[]) => {
    set({ queue, lastUpdate: new Date(), isLoading: false });
  },

  setStats: (stats: KitchenStats) => {
    set({ stats });
  },

  setSelectedStation: (station: KitchenStation | 'all') => {
    set({ selectedStation: station });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  updateItemStatus: (itemId: string, status: KitchenQueueItem['status'], timestamp?: string) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
              ...(status === 'preparing' && { started_at: timestamp || new Date().toISOString() }),
              ...(status === 'ready' && { completed_at: timestamp || new Date().toISOString() }),
            }
          : item
      ),
      lastUpdate: new Date(),
    }));
  },

  addItem: (item: KitchenQueueItem) => {
    set((state) => ({
      queue: [...state.queue, item],
      lastUpdate: new Date(),
    }));
  },

  removeItem: (itemId: string) => {
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== itemId),
      lastUpdate: new Date(),
    }));
  },

  getFilteredQueue: () => {
    const { queue, selectedStation } = get();
    if (selectedStation === 'all') {
      return queue;
    }
    return queue.filter((item) => item.station === selectedStation);
  },

  getGroupedOrders: () => {
    const filteredQueue = get().getFilteredQueue();
    const now = new Date();
    const URGENT_THRESHOLD = 30 * 60 * 1000; // 30 minutes in ms

    // Group by order_id
    const ordersMap = new Map<string, GroupedOrder>();

    filteredQueue.forEach((item) => {
      if (!ordersMap.has(item.order_id)) {
        const createdAt = new Date(item.created_at);
        const elapsedTime = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
        ordersMap.set(item.order_id, {
          order_id: item.order_id,
          order_number: item.order_number,
          order_type: item.order_type,
          table_number: item.table_number,
          items: [],
          created_at: item.created_at,
          elapsed_time: elapsedTime,
          is_urgent: elapsedTime * 1000 >= URGENT_THRESHOLD && item.status !== 'ready',
        });
      }
      ordersMap.get(item.order_id)!.items.push(item);
    });

    // Sort by urgency and elapsed time
    return Array.from(ordersMap.values()).sort((a, b) => {
      // Urgent orders first
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      // Then by elapsed time (longest first)
      return b.elapsed_time - a.elapsed_time;
    });
  },
}));
