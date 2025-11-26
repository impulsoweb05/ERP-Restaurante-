'use client';

import { useEffect, useState, useCallback } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import type { Order } from '@/types';

interface WebSocketHook {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: Record<string, unknown>) => void;
}

export const useWebSocket = (token: string | null): WebSocketHook => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { updateOrderStatus } = useOrderStore();

  useEffect(() => {
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'order:status_updated':
            updateOrderStatus(data.orderId, data.status as Order['status']);
            // Show notification
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Estado de pedido actualizado', {
                  body: `Tu pedido ${data.orderNumber} está ${getStatusText(data.status)}`,
                  icon: '/icons/icon-192x192.png',
                });
              }
            }
            break;

          case 'order:ready':
            // Show notification for ready order
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('¡Tu pedido está listo!', {
                  body: `Tu pedido ${data.orderNumber} está listo para entrega`,
                  icon: '/icons/icon-192x192.png',
                });
              }
            }
            break;

          default:
            console.log('WebSocket message:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('❌ WebSocket disconnected');

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (token) {
          console.log('🔄 Attempting to reconnect...');
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [token, updateOrderStatus]);

  const sendMessage = useCallback(
    (message: Record<string, unknown>) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket]
  );

  return { socket, isConnected, sendMessage };
};

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'pendiente',
    confirmed: 'confirmado',
    preparing: 'en preparación',
    ready: 'listo',
    delivered: 'entregado',
    cancelled: 'cancelado',
  };
  return statusMap[status] || status;
}
