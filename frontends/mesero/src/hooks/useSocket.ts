'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface SocketMessage {
  type: string;
  data: Record<string, unknown>;
}

interface UseSocketReturn {
  isConnected: boolean;
  sendMessage: (message: SocketMessage) => void;
  lastMessage: SocketMessage | null;
}

export function useSocket(namespace: string = '/waiter'): UseSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('waiter_token');
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const fullUrl = `${wsUrl}${namespace}?token=${token}`;

    try {
      wsRef.current = new WebSocket(fullUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [namespace]);

  const sendMessage = useCallback((message: SocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, sendMessage, lastMessage };
}
