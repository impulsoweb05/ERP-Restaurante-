/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORDER SERVICE
 * Servicio para crear y gestionar pedidos (con transacciones)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Pool } from 'pg';
import { query, getPool } from '../config/database';
import { Order, OrderItem, CreateOrderRequest, OrderType, PaymentMethod } from '../types';
import { logger } from '../utils/logger';
import { WebSocketService } from './WebSocketService';

const pool = getPool();

export class OrderService {
  /**
   * Crear pedido completo con items (TRANSACCIÓN)
   * CRÍTICO: Snapshot de precios, MAX delivery cost
   */
  static async createOrder(data: CreateOrderRequest): Promise<{ order: Order; items: OrderItem[] }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Generar order_number: PED-timestamp-random
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const order_number = `PED-${timestamp}-${random}`;

      // 2. Calcular totales
      let subtotal = 0;
      let maxDeliveryCost = 0;

      const itemsWithPrices = [];
      for (const item of data.order_items) {
        // Obtener precio actual del menú (SNAPSHOT)
        const menuItemResult = await client.query(
          'SELECT price, delivery_cost FROM menu_items WHERE id = $1 AND status = $2',
          [item.menu_item_id, 'active']
        );

        if (menuItemResult.rows.length === 0) {
          throw new Error(`Menu item ${item.menu_item_id} not found or inactive`);
        }

        const menuItem = menuItemResult.rows[0];
        const itemSubtotal = parseFloat(menuItem.price) * item.quantity;

        subtotal += itemSubtotal;

        // MAX delivery cost (VALIDACIÓN CRÍTICA)
        if (parseFloat(menuItem.delivery_cost) > maxDeliveryCost) {
          maxDeliveryCost = parseFloat(menuItem.delivery_cost);
        }

        itemsWithPrices.push({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: parseFloat(menuItem.price),
          item_delivery_cost: parseFloat(menuItem.delivery_cost),
          subtotal: itemSubtotal,
          special_instructions: item.special_instructions || null
        });
      }

      const total = subtotal + maxDeliveryCost;

      // 3. Crear orden
      const orderResult = await client.query(
        `INSERT INTO orders
         (order_number, customer_id, waiter_id, table_id, reservation_id,
          order_type, status, payment_method, subtotal, delivery_cost, total,
          delivery_address, customer_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          order_number,
          data.customer_id,
          data.waiter_id || null,
          data.table_id || null,
          data.reservation_id || null,
          data.order_type,
          'pending',
          data.payment_method,
          subtotal,
          maxDeliveryCost,
          total,
          data.delivery_address || null,
          data.customer_notes || null
        ]
      );

      const order = orderResult.rows[0];

      // 4. Crear order_items
      const orderItems: OrderItem[] = [];
      for (const itemData of itemsWithPrices) {
        const itemResult = await client.query(
          `INSERT INTO order_items
           (order_id, menu_item_id, quantity, unit_price, item_delivery_cost, subtotal, special_instructions, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            order.id,
            itemData.menu_item_id,
            itemData.quantity,
            itemData.unit_price,
            itemData.item_delivery_cost,
            itemData.subtotal,
            itemData.special_instructions,
            'pending'
          ]
        );
        orderItems.push(itemResult.rows[0]);

        // 5. Agregar a kitchen_queue
        await client.query(
          `INSERT INTO kitchen_queue
           (order_item_id, priority, status, estimated_time)
           VALUES ($1, 3, 'queued', $2)`,
          [itemResult.rows[0].id, 15] // 15 min default
        );
      }

      await client.query('COMMIT');

      logger.info('Order created', { order_number, order_id: order.id, items: orderItems.length });

      // Notificar nuevo pedido via WebSocket
      WebSocketService.notifyNewOrder(order.id, order.order_number, order.customer_id);

      return { order, items: orderItems };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating order', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener pedido por ID con items
   */
  static async getOrderById(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    try {
      const orderResult = await query('SELECT * FROM orders WHERE id = $1', [orderId]);

      if (orderResult.rows.length === 0) {
        return null;
      }

      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

      return {
        order: orderResult.rows[0],
        items: itemsResult.rows
      };
    } catch (error) {
      logger.error('Error getting order by id', error as Error);
      throw error;
    }
  }

  /**
   * Actualizar estado del pedido
   */
  static async updateStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  ): Promise<Order> {
    try {
      const timestampField =
        status === 'confirmed' ? 'confirmed_at' :
        status === 'delivered' ? 'completed_at' : null;

      let query_text = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP';
      const values: any[] = [status, orderId];

      if (timestampField) {
        query_text += `, ${timestampField} = CURRENT_TIMESTAMP`;
      }

      query_text += ' WHERE id = $2 RETURNING *';

      const result = await query(query_text, values);

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      const updatedOrder = result.rows[0];

      logger.info('Order status updated', { orderId, status });

      // Notificar actualización de estado via WebSocket
      WebSocketService.notifyOrderStatusUpdate(
        updatedOrder.id,
        updatedOrder.order_number,
        status,
        updatedOrder.customer_id,
        updatedOrder.waiter_id
      );

      return updatedOrder;
    } catch (error) {
      logger.error('Error updating order status', error as Error);
      throw error;
    }
  }

  /**
   * Obtener pedidos de un cliente
   */
  static async getOrdersByCustomer(customerId: string, limit: number = 10): Promise<Order[]> {
    try {
      const result = await query(
        `SELECT * FROM orders
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [customerId, limit]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting orders by customer', error as Error);
      throw error;
    }
  }

  // Alias para routes
  static async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  ) {
    return this.updateStatus(orderId, status);
  }

  static async cancelOrder(orderId: string) {
    return this.updateStatus(orderId, 'cancelled');
  }
}
