"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CART SERVICE
 * Servicio para gestión de carrito (almacenado en sessions.cart JSONB)
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class CartService {
    /**
     * Obtener carrito de una sesión
     */
    static async getCart(sessionId) {
        try {
            const result = await (0, database_1.query)('SELECT cart FROM sessions WHERE session_id = $1', [sessionId]);
            if (result.rows.length === 0) {
                return [];
            }
            return result.rows[0].cart || [];
        }
        catch (error) {
            logger_1.logger.error('Error getting cart', error);
            throw new Error('Failed to get cart');
        }
    }
    /**
     * Agregar item al carrito
     */
    static async addItem(sessionId, item) {
        try {
            const cart = await this.getCart(sessionId);
            // Buscar si el item ya existe en el carrito
            const existingIndex = cart.findIndex((cartItem) => cartItem.menu_item_id === item.menu_item_id);
            if (existingIndex >= 0) {
                // Actualizar cantidad
                cart[existingIndex].quantity += item.quantity;
                cart[existingIndex].subtotal =
                    cart[existingIndex].quantity * cart[existingIndex].unit_price;
            }
            else {
                // Agregar nuevo item
                const newItem = {
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
            await (0, database_1.query)(`UPDATE sessions
         SET cart = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`, [JSON.stringify(cart), sessionId]);
            logger_1.logger.info('Item added to cart', { sessionId, item: item.menu_item_id });
            return cart;
        }
        catch (error) {
            logger_1.logger.error('Error adding item to cart', error);
            throw new Error('Failed to add item to cart');
        }
    }
    /**
     * Actualizar cantidad de un item
     */
    static async updateQuantity(sessionId, menuItemId, quantity) {
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
            await (0, database_1.query)(`UPDATE sessions
         SET cart = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`, [JSON.stringify(cart), sessionId]);
            return cart;
        }
        catch (error) {
            logger_1.logger.error('Error updating item quantity', error);
            throw error;
        }
    }
    /**
     * Remover item del carrito
     */
    static async removeItem(sessionId, menuItemId) {
        try {
            const cart = await this.getCart(sessionId);
            const updatedCart = cart.filter((item) => item.menu_item_id !== menuItemId);
            await (0, database_1.query)(`UPDATE sessions
         SET cart = $1, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $2`, [JSON.stringify(updatedCart), sessionId]);
            logger_1.logger.info('Item removed from cart', { sessionId, menuItemId });
            return updatedCart;
        }
        catch (error) {
            logger_1.logger.error('Error removing item from cart', error);
            throw new Error('Failed to remove item from cart');
        }
    }
    /**
     * Vaciar carrito
     */
    static async clearCart(sessionId) {
        try {
            await (0, database_1.query)(`UPDATE sessions
         SET cart = '[]'::jsonb, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $1`, [sessionId]);
            logger_1.logger.info('Cart cleared', { sessionId });
        }
        catch (error) {
            logger_1.logger.error('Error clearing cart', error);
            throw new Error('Failed to clear cart');
        }
    }
    /**
     * Calcular totales del carrito
     */
    static calculateTotals(cart) {
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
exports.CartService = CartService;
//# sourceMappingURL=CartService.js.map