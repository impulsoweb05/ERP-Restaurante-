/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WEBSOCKET SERVICE
 * Servicio para comunicación en tiempo real
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { AuthService } from './AuthService';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  userRole?: 'customer' | 'waiter' | 'admin' | 'kitchen';
  sessionId?: string;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export class WebSocketService {
  private static wss: WebSocketServer | null = null;
  private static clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private static kitchenClients: Set<AuthenticatedWebSocket> = new Set();

  /**
   * Inicializar WebSocket Server
   */
  static initialize(server: Server): void {
    this.wss = new WebSocketServer({
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));

    logger.info('WebSocket Server initialized on /ws');
  }

  /**
   * Manejar nueva conexión WebSocket
   */
  private static handleConnection(ws: AuthenticatedWebSocket, request: any): void {
    logger.info('New WebSocket connection');

    // Autenticación mediante query params o header
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token') || request.headers['sec-websocket-protocol'];

    if (token) {
      try {
        const decoded = AuthService.verifyToken(token);
        ws.userId = decoded.id;
        ws.userRole = decoded.role;

        // Agregar a colección de clientes por usuario
        if (!this.clients.has(decoded.id)) {
          this.clients.set(decoded.id, new Set());
        }
        this.clients.get(decoded.id)!.add(ws);

        // Si es cocina, agregar a colección especial
        if (decoded.role === 'admin') {
          this.kitchenClients.add(ws);
        }

        logger.info('WebSocket authenticated', {
          userId: decoded.id,
          role: decoded.role
        });

        // Enviar confirmación de autenticación
        this.sendToClient(ws, {
          type: 'auth:success',
          data: { userId: decoded.id, role: decoded.role },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('WebSocket authentication failed', error as Error);
        this.sendToClient(ws, {
          type: 'auth:error',
          data: { message: 'Autenticación fallida' },
          timestamp: new Date().toISOString()
        });
        ws.close(1008, 'Authentication failed');
        return;
      }
    } else {
      // Conexión anónima permitida para demo
      ws.sessionId = this.generateSessionId();
      logger.info('Anonymous WebSocket connection', { sessionId: ws.sessionId });
    }

    // Manejar mensajes del cliente
    ws.on('message', (message: string) => {
      this.handleMessage(ws, message);
    });

    // Manejar desconexión
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Manejar errores
    ws.on('error', (error) => {
      logger.error('WebSocket error', error);
    });

    // Ping/Pong para mantener conexión viva
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(interval);
      }
    }, 30000); // 30 segundos
  }

  /**
   * Manejar mensajes del cliente
   */
  private static handleMessage(ws: AuthenticatedWebSocket, message: string): void {
    try {
      const parsed: WebSocketMessage = JSON.parse(message.toString());
      logger.debug('WebSocket message received', { type: parsed.type });

      switch (parsed.type) {
        case 'ping':
          this.sendToClient(ws, {
            type: 'pong',
            timestamp: new Date().toISOString()
          });
          break;

        case 'subscribe:kitchen':
          if (ws.userRole === 'admin' || ws.userRole === 'waiter') {
            this.kitchenClients.add(ws);
            this.sendToClient(ws, {
              type: 'subscribed:kitchen',
              timestamp: new Date().toISOString()
            });
          }
          break;

        case 'unsubscribe:kitchen':
          this.kitchenClients.delete(ws);
          this.sendToClient(ws, {
            type: 'unsubscribed:kitchen',
            timestamp: new Date().toISOString()
          });
          break;

        default:
          logger.warn('Unknown WebSocket message type', { type: parsed.type });
      }
    } catch (error) {
      logger.error('Error handling WebSocket message', error as Error);
    }
  }

  /**
   * Manejar desconexión
   */
  private static handleDisconnection(ws: AuthenticatedWebSocket): void {
    logger.info('WebSocket disconnected', {
      userId: ws.userId,
      sessionId: ws.sessionId
    });

    // Remover de colecciones
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }

    this.kitchenClients.delete(ws);
  }

  /**
   * Enviar mensaje a un cliente específico
   */
  private static sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * MÉTODOS PÚBLICOS - BROADCASTING
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Enviar mensaje a un usuario específico (todas sus conexiones)
   */
  static sendToUser(userId: string, message: WebSocketMessage): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(client => {
        this.sendToClient(client, {
          ...message,
          timestamp: new Date().toISOString()
        });
      });
      logger.debug('Message sent to user', { userId, type: message.type });
    }
  }

  /**
   * Enviar mensaje a todos los clientes de cocina
   */
  static sendToKitchen(message: WebSocketMessage): void {
    this.kitchenClients.forEach(client => {
      this.sendToClient(client, {
        ...message,
        timestamp: new Date().toISOString()
      });
    });
    logger.debug('Message sent to kitchen', { type: message.type });
  }

  /**
   * Broadcast a todos los clientes conectados
   */
  static broadcast(message: WebSocketMessage): void {
    if (!this.wss) return;

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString()
        }));
      }
    });
    logger.debug('Message broadcasted', { type: message.type });
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * EVENTOS DE NEGOCIO
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Notificar nuevo pedido a cocina
   */
  static notifyNewOrder(orderId: string, orderNumber: string, customerId: string): void {
    this.sendToKitchen({
      type: 'order:new',
      data: { orderId, orderNumber, customerId }
    });
  }

  /**
   * Notificar actualización de estado de pedido
   */
  static notifyOrderStatusUpdate(
    orderId: string,
    orderNumber: string,
    status: string,
    customerId: string,
    waiterId?: string
  ): void {
    // Notificar al cliente
    this.sendToUser(customerId, {
      type: 'order:status_updated',
      data: { orderId, orderNumber, status }
    });

    // Notificar al mesero si existe
    if (waiterId) {
      this.sendToUser(waiterId, {
        type: 'order:status_updated',
        data: { orderId, orderNumber, status }
      });
    }

    // Notificar a cocina
    this.sendToKitchen({
      type: 'order:status_updated',
      data: { orderId, orderNumber, status }
    });
  }

  /**
   * Notificar item listo en cocina
   */
  static notifyOrderItemReady(
    orderId: string,
    orderNumber: string,
    itemId: string,
    itemName: string,
    waiterId?: string
  ): void {
    // Notificar al mesero
    if (waiterId) {
      this.sendToUser(waiterId, {
        type: 'order:item_ready',
        data: { orderId, orderNumber, itemId, itemName }
      });
    }

    // Notificar a cocina
    this.sendToKitchen({
      type: 'order:item_ready',
      data: { orderId, orderNumber, itemId, itemName }
    });
  }

  /**
   * Notificar pedido completamente listo
   */
  static notifyOrderReady(
    orderId: string,
    orderNumber: string,
    customerId: string,
    waiterId?: string
  ): void {
    // Notificar al cliente
    this.sendToUser(customerId, {
      type: 'order:ready',
      data: { orderId, orderNumber }
    });

    // Notificar al mesero
    if (waiterId) {
      this.sendToUser(waiterId, {
        type: 'order:ready',
        data: { orderId, orderNumber }
      });
    }
  }

  /**
   * Notificar actualización de mesa
   */
  static notifyTableStatusUpdate(
    tableId: string,
    tableNumber: string,
    status: string
  ): void {
    this.broadcast({
      type: 'table:status_updated',
      data: { tableId, tableNumber, status }
    });
  }

  /**
   * Notificar nueva reserva
   */
  static notifyNewReservation(
    reservationId: string,
    reservationNumber: string,
    customerId: string,
    tableId: string
  ): void {
    // Notificar al cliente
    this.sendToUser(customerId, {
      type: 'reservation:created',
      data: { reservationId, reservationNumber, tableId }
    });

    // Broadcast a cocina/admin
    this.sendToKitchen({
      type: 'reservation:created',
      data: { reservationId, reservationNumber, tableId }
    });
  }

  /**
   * Notificar actualización de reserva
   */
  static notifyReservationUpdate(
    reservationId: string,
    reservationNumber: string,
    status: string,
    customerId: string
  ): void {
    // Notificar al cliente
    this.sendToUser(customerId, {
      type: 'reservation:updated',
      data: { reservationId, reservationNumber, status }
    });

    // Broadcast a cocina/admin
    this.sendToKitchen({
      type: 'reservation:updated',
      data: { reservationId, reservationNumber, status }
    });
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * UTILIDADES
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Generar ID de sesión único
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener estadísticas de conexiones
   */
  static getStats(): {
    totalClients: number;
    authenticatedClients: number;
    kitchenClients: number;
    clientsByRole: Record<string, number>;
  } {
    const stats = {
      totalClients: this.wss?.clients.size || 0,
      authenticatedClients: this.clients.size,
      kitchenClients: this.kitchenClients.size,
      clientsByRole: {} as Record<string, number>
    };

    this.clients.forEach((clientSet) => {
      clientSet.forEach(client => {
        const role = client.userRole || 'anonymous';
        stats.clientsByRole[role] = (stats.clientsByRole[role] || 0) + 1;
      });
    });

    return stats;
  }

  /**
   * Cerrar todas las conexiones
   */
  static closeAll(): void {
    if (!this.wss) return;

    this.wss.clients.forEach(client => {
      client.close(1000, 'Server shutting down');
    });

    this.clients.clear();
    this.kitchenClients.clear();

    logger.info('All WebSocket connections closed');
  }
}
