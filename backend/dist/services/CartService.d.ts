/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CART SERVICE
 * Servicio para gestión de carrito (almacenado en sessions.cart JSONB)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { CartItem } from '../types';
export declare class CartService {
    /**
     * Obtener carrito de una sesión
     */
    static getCart(sessionId: string): Promise<CartItem[]>;
    /**
     * Agregar item al carrito
     */
    static addItem(sessionId: string, item: {
        menu_item_id: string;
        name: string;
        quantity: number;
        unit_price: number;
        item_delivery_cost: number;
    }): Promise<CartItem[]>;
    /**
     * Actualizar cantidad de un item
     */
    static updateQuantity(sessionId: string, menuItemId: string, quantity: number): Promise<CartItem[]>;
    /**
     * Remover item del carrito
     */
    static removeItem(sessionId: string, menuItemId: string): Promise<CartItem[]>;
    /**
     * Vaciar carrito
     */
    static clearCart(sessionId: string): Promise<void>;
    /**
     * Calcular totales del carrito
     */
    static calculateTotals(cart: CartItem[]): {
        subtotal: number;
        delivery_cost: number;
        total: number;
    };
}
//# sourceMappingURL=CartService.d.ts.map