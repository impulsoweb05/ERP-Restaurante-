/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WEBSOCKET SERVICE
 * Servicio para comunicación en tiempo real
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Server } from 'http';
interface WebSocketMessage {
    type: string;
    data?: any;
    timestamp?: string;
}
export declare class WebSocketService {
    private static wss;
    private static clients;
    private static kitchenClients;
    /**
     * Inicializar WebSocket Server
     */
    static initialize(server: Server): void;
    /**
     * Manejar nueva conexión WebSocket
     */
    private static handleConnection;
    /**
     * Manejar mensajes del cliente
     */
    private static handleMessage;
    /**
     * Manejar desconexión
     */
    private static handleDisconnection;
    /**
     * Enviar mensaje a un cliente específico
     */
    private static sendToClient;
    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * MÉTODOS PÚBLICOS - BROADCASTING
     * ═══════════════════════════════════════════════════════════════════════════
     */
    /**
     * Enviar mensaje a un usuario específico (todas sus conexiones)
     */
    static sendToUser(userId: string, message: WebSocketMessage): void;
    /**
     * Enviar mensaje a todos los clientes de cocina
     */
    static sendToKitchen(message: WebSocketMessage): void;
    /**
     * Broadcast a todos los clientes conectados
     */
    static broadcast(message: WebSocketMessage): void;
    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * EVENTOS DE NEGOCIO
     * ═══════════════════════════════════════════════════════════════════════════
     */
    /**
     * Notificar nuevo pedido a cocina
     */
    static notifyNewOrder(orderId: string, orderNumber: string, customerId: string): void;
    /**
     * Notificar actualización de estado de pedido
     */
    static notifyOrderStatusUpdate(orderId: string, orderNumber: string, status: string, customerId: string, waiterId?: string): void;
    /**
     * Notificar item listo en cocina
     */
    static notifyOrderItemReady(orderId: string, orderNumber: string, itemId: string, itemName: string, waiterId?: string): void;
    /**
     * Notificar pedido completamente listo
     */
    static notifyOrderReady(orderId: string, orderNumber: string, customerId: string, waiterId?: string): void;
    /**
     * Notificar actualización de mesa
     */
    static notifyTableStatusUpdate(tableId: string, tableNumber: string, status: string): void;
    /**
     * Notificar nueva reserva
     */
    static notifyNewReservation(reservationId: string, reservationNumber: string, customerId: string, tableId: string): void;
    /**
     * Notificar actualización de reserva
     */
    static notifyReservationUpdate(reservationId: string, reservationNumber: string, status: string, customerId: string): void;
    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * UTILIDADES
     * ═══════════════════════════════════════════════════════════════════════════
     */
    /**
     * Generar ID de sesión único
     */
    private static generateSessionId;
    /**
     * Obtener estadísticas de conexiones
     */
    static getStats(): {
        totalClients: number;
        authenticatedClients: number;
        kitchenClients: number;
        clientsByRole: Record<string, number>;
    };
    /**
     * Cerrar todas las conexiones
     */
    static closeAll(): void;
}
export {};
//# sourceMappingURL=WebSocketService.d.ts.map