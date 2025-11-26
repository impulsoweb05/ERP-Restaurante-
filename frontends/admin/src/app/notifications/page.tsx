'use client';

import { useState } from 'react';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  Search,
  RefreshCcw,
  Eye,
  Mail,
  MessageCircle,
  Send,
  Filter,
} from 'lucide-react';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'whatsapp',
    recipient: '3001234567',
    content: '¡Hola Juan! Tu pedido PED-0045 está siendo preparado. Tiempo estimado: 25 min.',
    status: 'sent',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '2',
    type: 'email',
    recipient: 'juan@email.com',
    content: 'Confirmación de pedido PED-0045 - Total: $80.000',
    status: 'sent',
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '3',
    type: 'telegram',
    recipient: '8214284181',
    content: '🍽️ Nuevo pedido recibido: PED-0045 - Hamburguesa Clásica x2, Pizza Margherita x1',
    status: 'sent',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: '4',
    type: 'whatsapp',
    recipient: '3109876543',
    content: '¡Hola María! Tu reserva RES-0024 ha sido confirmada para mañana a las 20:30.',
    status: 'failed',
    error: 'Número no registrado en WhatsApp',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '5',
    type: 'email',
    recipient: 'maria@email.com',
    content: 'Tu reserva RES-0024 ha sido confirmada',
    status: 'sent',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const typeOptions = [
  { value: '', label: 'Todos los tipos', icon: null },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
];

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'sent', label: 'Enviados' },
  { value: 'failed', label: 'Fallidos' },
  { value: 'pending', label: 'Pendientes' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesType = !typeFilter || notif.type === typeFilter;
    const matchesStatus = !statusFilter || notif.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleResend = (notif: Notification) => {
    toast.loading('Reenviando...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Notificación reenviada');
      setNotifications(notifications.map(n =>
        n.id === notif.id ? { ...n, status: 'sent', error: undefined } : n
      ));
    }, 1500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'whatsapp': return '💬';
      case 'telegram': return '✈️';
      default: return '📨';
    }
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    pending: notifications.filter(n => n.status === 'pending').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notificaciones</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Log de notificaciones enviadas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enviados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.sent}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Fallidos</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-secondary-700">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha/Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Destinatario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contenido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-700">
              {filteredNotifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {formatDateTime(notif.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-lg">{getTypeIcon(notif.type)}</span>
                      {getStatusLabel(notif.type)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {notif.recipient}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <p className="truncate max-w-xs">{notif.content}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(notif.status)}`}>
                      {getStatusLabel(notif.status)}
                    </span>
                    {notif.error && (
                      <p className="text-xs text-red-500 mt-1">{notif.error}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedNotification(notif);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {notif.status === 'failed' && (
                        <button
                          onClick={() => handleResend(notif)}
                          className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                          title="Reenviar"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron notificaciones</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
          onResend={() => {
            handleResend(selectedNotification);
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
}

function NotificationDetailModal({
  notification,
  onClose,
  onResend,
}: {
  notification: Notification;
  onClose: () => void;
  onResend: () => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'whatsapp': return '💬';
      case 'telegram': return '✈️';
      default: return '📨';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getTypeIcon(notification.type)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {getStatusLabel(notification.type)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(notification.created_at)}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(notification.status)}`}>
            {getStatusLabel(notification.status)}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Destinatario</p>
            <p className="font-medium text-gray-800 dark:text-white">{notification.recipient}</p>
          </div>

          <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contenido</p>
            <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{notification.content}</p>
          </div>

          {notification.error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Error</p>
              <p className="text-red-700 dark:text-red-300">{notification.error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-secondary-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-secondary-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
          >
            Cerrar
          </button>
          {notification.status === 'failed' && (
            <button
              onClick={onResend}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Reenviar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
