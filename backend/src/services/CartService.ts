/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CART SERVICE
 * Servicio para gestión de carrito (almacenado en sessions.cart JSONB)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { query } from '../config/database';
import { CartItem } from '../types';
import { logger } from '../utils/logger';

export class CartService {
  /**
   * Obtener carrito de una sesión
   */
  static async getCart(sessionId: string): Promise<CartItem[]> {
    try {
      const result = await query(
        'SELECT cart FROM sessions WHERE session_id = $1',
        [sessionId]
      );

      if (result.rows.length === 0) {
        return [];
      }

      return result.rows[0].cart || [];
    } catch (error) {
      logger.error('Error getting cart', error as Error);
      throw new Error('Failed to get cart');
    }
  }

  /**
   * Agregar item al carrito
   */
  static async addItem(
    sessionId: string,
    item: {
      menu_item_id: string;
      name: string;
      quantity: number;
      unit_price: number;
      item_delivery_cost: number;
    }
  ): Promise<CartItem[]> {
    try {
      const cart = await this.getCart(sessionId);

      // Buscar si el item ya existe en el carrito
      const existingIndex = cart.findIndex(
        (cartItem) => cartItem.menu_item_id === item.menu_item_id
      );

      if (existingIndex >= 0) {
        // Actualizar cantidad
        cart[existingIndex].quantity += item.quantity;
        cart[existingIndex].subtotal =
          cart[existingIndex].quantity * cart[existingIndex].unit_price;
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          menu_item_id: item.menu_item_id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_delivery_cost: item.item_delivery_cost,
          subtotal: item.quantity * item.unit_price,
        };
        cart.push(newItem);
      }

      // Guardar en sesión
      await query(
        `UPDATE sessions
         SET cart = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`,
        [JSON.stringify(cart), sessionId]
      );

      logger.info('Item added to cart', { sessionId, item: item.menu_item_id });
      return cart;
    } catch (error) {
      logger.error('Error adding item to cart', error as Error);
      throw new Error('Failed to add item to cart');
    }
  }

  /**
   * Actualizar cantidad de un item
   */
  static async updateQuantity(
    sessionId: string,
    menuItemId: string,
    quantity: number
  ): Promise<CartItem[]> {
    try {
      if (quantity <= 0) {
        return await this.removeItem(sessionId, menuItemId);
      }

      const cart = await this.getCart(sessionId);
      const itemIndex = cart.findIndex((item) => item.menu_item_id === menuItemId);

      if (itemIndex < 0) {
        throw new Error('Item not found in cart');
      }

      cart[itemIndex].quantity = quantity;
      cart[itemIndex].subtotal = quantity * cart[itemIndex].unit_price;

      await query(
        `UPDATE sessions
         SET cart = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`,
        [JSON.stringify(cart), sessionId]
      );

      return cart;
    } catch (error) {
      logger.error('Error updating item quantity', error as Error);
      throw error;
    }
  }

  /**
   * Remover item del carrito
   */
  static async removeItem(sessionId: string, menuItemId: string): Promise<CartItem[]> {
    try {
      const cart = await this.getCart(sessionId);
      const updatedCart = cart.filter((item) => item.menu_item_id !== menuItemId);

      await query(
        `UPDATE sessions
         SET cart = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`,
        [JSON.stringify(updatedCart), sessionId]
      );

      logger.info('Item removed from cart', { sessionId, menuItemId });
      return updatedCart;
    } catch (error) {
      logger.error('Error removing item from cart', error as Error);
      throw new Error('Failed to remove item from cart');
    }
  }

  /**
   * Vaciar carrito
   */
  static async clearCart(sessionId: string): Promise<void> {
    try {
      await query(
        `UPDATE sessions
         SET cart = '[]'::jsonb, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $1`,
        [sessionId]
      );

      logger.info('Cart cleared', { sessionId });
    } catch (error) {
      logger.error('Error clearing cart', error as Error);
      throw new Error('Failed to clear cart');
    }
  }

  /**
   * Calcular totales del carrito
   */
  static calculateTotals(cart: CartItem[]): {
    subtotal: number;
    delivery_cost: number;
    total: number;
  } {
    let subtotal = 0;
    let maxDeliveryCost = 0;

    for (const item of cart) {
      subtotal += item.subtotal;
      // CRÍTICO: Usar MAX de delivery_cost, NO sumar (documento línea 1234)
      if (item.item_delivery_cost > maxDeliveryCost) {
        maxDeliveryCost = item.item_delivery_cost;
      }
    }

    return {
      subtotal,
      delivery_cost: maxDeliveryCost,
      total: subtotal + maxDeliveryCost,
    };
  }
}
