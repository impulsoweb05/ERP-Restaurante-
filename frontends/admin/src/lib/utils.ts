import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(`2000-01-01T${time}`));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    cleaning: 'bg-gray-100 text-gray-800',
    no_show: 'bg-red-100 text-red-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    active: 'Activo',
    inactive: 'Inactivo',
    available: 'Disponible',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    cleaning: 'Limpiando',
    no_show: 'No Presentó',
    sent: 'Enviado',
    failed: 'Fallido',
    dine_in: 'En Mesa',
    delivery: 'Domicilio',
    takeout: 'Para Llevar',
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    dataphone: 'Datáfono',
    grill: 'Parrilla',
    fry: 'Fritos',
    oven: 'Horno',
    bar: 'Bar',
    salad: 'Ensaladas',
    other: 'Otro',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
  };
  return labels[status] || status;
}

export function getOrderTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    dine_in: '🪑',
    delivery: '🚚',
    takeout: '🛍️',
  };
  return icons[type] || '📦';
}

export function generateCode(prefix: string, length: number = 4): string {
  const num = Math.floor(Math.random() * Math.pow(10, length));
  return `${prefix}-${String(num).padStart(length, '0')}`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
