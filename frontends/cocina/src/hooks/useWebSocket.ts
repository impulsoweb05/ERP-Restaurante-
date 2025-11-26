'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useKitchenStore } from '@/stores/kitchenStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { KitchenQueueItem } from '@/types';

interface WebSocketHook {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: Record<string, unknown>) => void;
}

export const useWebSocket = (token: string | null): WebSocketHook => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addItem, updateItemStatus } = useKitchenStore();
  const { sound } = useSettingsStore();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = sound.volume;
    }
  }, [sound.volume]);

  const playNotificationSound = useCallback(() => {
    if (sound.enabled && sound.newOrderSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, [sound.enabled, sound.newOrderSound]);

  const connect = useCallback(() => {
    if (!token) return null;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
    const ws = new WebSocket(`${wsUrl}/kitchen?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log('✅ Kitchen WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'kitchen:new_item':
            const newItem = data.data as KitchenQueueItem;
            addItem(newItem);
            playNotificationSound();
            break;

          case 'kitchen:item_started':
            updateItemStatus(data.itemId, 'preparing', data.timestamp);
            break;

          case 'kitchen:item_completed':
            updateItemStatus(data.itemId, 'ready', data.timestamp);
            break;

          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
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
      console.log('❌ Kitchen WebSocket disconnected');

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
  }, [token, addItem, updateItemStatus, playNotificationSound]);

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
