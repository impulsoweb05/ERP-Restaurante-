"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WEBSOCKET SERVICE
 * Servicio para comunicación en tiempo real
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
const logger_1 = require("../utils/logger");
const AuthService_1 = require("./AuthService");
class WebSocketService {
    /**
     * Inicializar WebSocket Server
     */
    static initialize(server) {
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws'
        });
        this.wss.on('connection', this.handleConnection.bind(this));
        logger_1.logger.info('WebSocket Server initialized on /ws');
    }
    /**
     * Manejar nueva conexión WebSocket
     */
    static handleConnection(ws, request) {
        logger_1.logger.info('New WebSocket connection');
        // Autenticación mediante query params o header
        const url = new URL(request.url, `http://${request.headers.host}`);
        const token = url.searchParams.get('token') || request.headers['sec-websocket-protocol'];
        if (token) {
            try {
                const decoded = AuthService_1.AuthService.verifyToken(token);
                ws.userId = decoded.id;
                ws.userRole = decoded.role;
                // Agregar a colección de clientes por usuario
                if (!this.clients.has(decoded.id)) {
                    this.clients.set(decoded.id, new Set());
                }
                this.clients.get(decoded.id).add(ws);
                // Si es cocina, agregar a colección especial
                if (decoded.role === 'admin') {
                    this.kitchenClients.add(ws);
                }
                logger_1.logger.info('WebSocket authenticated', {
                    userId: decoded.id,
                    role: decoded.role
                });
                // Enviar confirmación de autenticación
                this.sendToClient(ws, {
                    type: 'auth:success',
                    data: { userId: decoded.id, role: decoded.role },
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                logger_1.logger.error('WebSocket authentication failed', error);
                this.sendToClient(ws, {
                    type: 'auth:error',
                    data: { message: 'Autenticación fallida' },
                    timestamp: new Date().toISOString()
                });
                ws.close(1008, 'Authentication failed');
                return;
            }
        }
        else {
            // Conexión anónima permitida para demo
            ws.sessionId = this.generateSessionId();
            logger_1.logger.info('Anonymous WebSocket connection', { sessionId: ws.sessionId });
        }
        // Manejar mensajes del cliente
        ws.on('message', (message) => {
            this.handleMessage(ws, message);
        });
        // Manejar desconexión
        ws.on('close', () => {
            this.handleDisconnection(ws);
        });
        // Manejar errores
        ws.on('error', (error) => {
            logger_1.logger.error('WebSocket error', error);
        });
        // Ping/Pong para mantener conexión viva
        const interval = setInterval(() => {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.ping();
            }
            else {
                clearInterval(interval);
            }
        }, 30000); // 30 segundos
    }
    /**
     * Manejar mensajes del cliente
     */
    static handleMessage(ws, message) {
        try {
            const parsed = JSON.parse(message.toString());
            logger_1.logger.debug('WebSocket message received', { type: parsed.type });
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
                    logger_1.logger.warn('Unknown WebSocket message type', { type: parsed.type });
            }
        }
        catch (error) {
            logger_1.logger.error('Error handling WebSocket message', error);
        }
    }
    /**
     * Manejar desconexión
     */
    static handleDisconnection(ws) {
        logger_1.logger.info('WebSocket disconnected', {
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
    static sendToClient(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
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
    static sendToUser(userId, message) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            userClients.forEach(client => {
                this.sendToClient(client, {
                    ...message,
                    timestamp: new Date().toISOString()
                });
            });
            logger_1.logger.debug('Message sent to user', { userId, type: message.type });
        }
    }
    /**
     * Enviar mensaje a todos los clientes de cocina
     */
    static sendToKitchen(message) {
        this.kitchenClients.forEach(client => {
            this.sendToClient(client, {
                ...message,
                timestamp: new Date().toISOString()
            });
        });
        logger_1.logger.debug('Message sent to kitchen', { type: message.type });
    }
    /**
     * Broadcast a todos los clientes conectados
     */
    static broadcast(message) {
        if (!this.wss)
            return;
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString()
                }));
            }
        });
        logger_1.logger.debug('Message broadcasted', { type: message.type });
    }
    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * EVENTOS DE NEGOCIO
     * ═══════════════════════════════════════════════════════════════════════════
     */
    /**
     * Notificar nuevo pedido a cocina
     */
    static notifyNewOrder(orderId, orderNumber, customerId) {
        this.sendToKitchen({
            type: 'order:new',
            data: { orderId, orderNumber, customerId }
        });
    }
    /**
     * Notificar actualización de estado de pedido
     */
    static notifyOrderStatusUpdate(orderId, orderNumber, status, customerId, waiterId) {
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
    static notifyOrderItemReady(orderId, orderNumber, itemId, itemName, waiterId) {
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
    static notifyOrderReady(orderId, orderNumber, customerId, waiterId) {
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
    static notifyTableStatusUpdate(tableId, tableNumber, status) {
        this.broadcast({
            type: 'table:status_updated',
            data: { tableId, tableNumber, status }
        });
    }
    /**
     * Notificar nueva reserva
     */
    static notifyNewReservation(reservationId, reservationNumber, customerId, tableId) {
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
    static notifyReservationUpdate(reservationId, reservationNumber, status, customerId) {
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
    static generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Obtener estadísticas de conexiones
     */
    static getStats() {
        const stats = {
            totalClients: this.wss?.clients.size || 0,
            authenticatedClients: this.clients.size,
            kitchenClients: this.kitchenClients.size,
            clientsByRole: {}
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
    static closeAll() {
        if (!this.wss)
            return;
        this.wss.clients.forEach(client => {
            client.close(1000, 'Server shutting down');
        });
        this.clients.clear();
        this.kitchenClients.clear();
        logger_1.logger.info('All WebSocket connections closed');
    }
}
exports.WebSocketService = WebSocketService;
WebSocketService.wss = null;
WebSocketService.clients = new Map();
WebSocketService.kitchenClients = new Set();
//# sourceMappingURL=WebSocketService.js.map