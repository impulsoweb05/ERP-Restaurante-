import type { KitchenStation, OrderType, KitchenItemStatus } from '@/types';

/**
 * Format elapsed time in human-readable format
 */
export function formatElapsedTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Format time as MM:SS
 */
export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get station display info
 */
export function getStationInfo(station: KitchenStation): { name: string; icon: string; color: string } {
  const stations: Record<KitchenStation, { name: string; icon: string; color: string }> = {
    parrilla: { name: 'Parrilla', icon: '🥩', color: '#ef4444' },
    fritos: { name: 'Fritos', icon: '🍟', color: '#f97316' },
    horno: { name: 'Horno', icon: '🍕', color: '#eab308' },
    bar: { name: 'Bar', icon: '🍺', color: '#06b6d4' },
    ensaladas: { name: 'Ensaladas', icon: '🥗', color: '#22c55e' },
    postres: { name: 'Postres', icon: '🍰', color: '#ec4899' },
    general: { name: 'General', icon: '👨‍🍳', color: '#8b5cf6' },
  };
  return stations[station] || stations.general;
}

/**
 * Get order type display info
 */
export function getOrderTypeInfo(orderType: OrderType): { label: string; icon: string; color: string } {
  const types: Record<OrderType, { label: string; icon: string; color: string }> = {
    dine_in: { label: 'Mesa', icon: '🪑', color: '#3b82f6' },
    delivery: { label: 'Domicilio', icon: '🚚', color: '#10b981' },
    takeout: { label: 'Para llevar', icon: '📦', color: '#8b5cf6' },
  };
  return types[orderType] || types.dine_in;
}

/**
 * Get status display info
 */
export function getStatusInfo(status: KitchenItemStatus): { label: string; color: string; bgColor: string } {
  const statuses: Record<KitchenItemStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'En cola', color: '#fbbf24', bgColor: 'bg-yellow-500/20' },
    preparing: { label: 'Preparando', color: '#f97316', bgColor: 'bg-orange-500/20' },
    ready: { label: 'Listo', color: '#22c55e', bgColor: 'bg-green-500/20' },
  };
  return statuses[status] || statuses.pending;
}

/**
 * Check if an order is urgent (more than 30 minutes)
 */
export function isOrderUrgent(createdAt: string, status: KitchenItemStatus): boolean {
  if (status === 'ready') return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const THIRTY_MINUTES = 30 * 60 * 1000;
  return now - created >= THIRTY_MINUTES;
}

/**
 * Calculate progress percentage for preparation time
 */
export function calculateProgress(
  startedAt: string | undefined,
  preparationTime: number
): number {
  if (!startedAt) return 0;
  const started = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = now - started;
  const total = preparationTime * 60 * 1000; // Convert to ms
  const progress = Math.min(100, (elapsed / total) * 100);
  return Math.round(progress);
}

/**
 * Class names helper
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate current time display
 */
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
