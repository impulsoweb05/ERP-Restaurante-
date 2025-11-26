/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER SERVICE
 * Servicio para crear y gestionar pedidos (con transacciones)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Order, OrderItem, CreateOrderRequest } from '../types';
export declare class OrderService {
    /**
     * Crear pedido completo con items (TRANSACCIÓN)
     * CRÍTICO: Snapshot de precios, MAX delivery cost
     */
    static createOrder(data: CreateOrderRequest): Promise<{
        order: Order;
        items: OrderItem[];
    }>;
    /**
     * Obtener pedido por ID con items
     */
    static getOrderById(orderId: string): Promise<{
        order: Order;
        items: OrderItem[];
    } | null>;
    /**
     * Actualizar estado del pedido
     */
    static updateStatus(orderId: string, status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'): Promise<Order>;
    /**
     * Obtener pedidos de un cliente
     */
    static getOrdersByCustomer(customerId: string, limit?: number): Promise<Order[]>;
    static updateOrderStatus(orderId: string, status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'): Promise<Order>;
    static cancelOrder(orderId: string): Promise<Order>;
}
//# sourceMappingURL=OrderService.d.ts.map