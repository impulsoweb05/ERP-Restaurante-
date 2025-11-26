/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SESSION SERVICE
 * Servicio para gestión de sesiones y State Machine (16 niveles)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Session } from '../types';
export declare class SessionService {
    /**
     * Crear o recuperar sesión
     */
    static getOrCreateSession(sessionId: string, phone?: string): Promise<Session>;
    /**
     * Actualizar nivel del chat (State Machine)
     * Niveles 0-15 según documento
     */
    static updateLevel(sessionId: string, newLevel: number, data?: {
        selected_category?: string;
        selected_subcategory?: string;
        temp_menu_item?: string;
        checkout_data?: any;
        reservation_data?: any;
    }): Promise<Session>;
    /**
     * Marcar sesión como registrada (cliente identificado)
     */
    static markAsRegistered(sessionId: string, customerId: string, phone: string): Promise<Session>;
    /**
     * Cerrar sesión
     */
    static closeSession(sessionId: string): Promise<void>;
    /**
     * Obtener sesión por ID
     */
    static getById(sessionId: string): Promise<Session | null>;
    /**
     * Limpiar sesiones expiradas (para Cron Job)
     */
    static cleanExpiredSessions(): Promise<number>;
    /**
     * Extender expiración de sesión
     */
    static extendExpiration(sessionId: string, hours?: number): Promise<void>;
}
//# sourceMappingURL=SessionService.d.ts.map