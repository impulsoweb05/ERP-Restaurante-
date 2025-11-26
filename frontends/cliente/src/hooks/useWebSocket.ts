'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { getStatusText } from '@/lib/utils';
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!token) return null;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
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
                  body: `Tu pedido ${data.orderNumber} está ${getStatusText(data.status).toLowerCase()}`,
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

      // Attempt to reconnect with exponential backoff
      if (token && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        console.log(`🔄 Attempting to reconnect in ${delay / 1000}s (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          const newSocket = connect();
          if (newSocket) {
            setSocket(newSocket);
          }
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }, [token, updateOrderStatus]);

  useEffect(() => {
    const ws = connect();
    if (ws) {
      setSocket(ws);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

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
