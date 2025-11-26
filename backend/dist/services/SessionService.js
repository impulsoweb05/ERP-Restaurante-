"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SESSION SERVICE
 * Servicio para gestión de sesiones y State Machine (16 niveles)
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class SessionService {
    /**
     * Crear o recuperar sesión
     */
    static async getOrCreateSession(sessionId, phone) {
        try {
            // Buscar sesión existente
            let result = await (0, database_1.query)('SELECT * FROM sessions WHERE session_id = $1', [sessionId]);
            if (result.rows.length > 0) {
                return result.rows[0];
            }
            // Crear nueva sesión
            result = await (0, database_1.query)(`INSERT INTO sessions
         (session_id, phone, current_level, is_open, is_registered, cart, expires_at)
         VALUES ($1, $2, 0, true, false, '[]'::jsonb, CURRENT_TIMESTAMP + INTERVAL '24 hours')
         RETURNING *`, [sessionId, phone || null]);
            logger_1.logger.info('Session created', { sessionId });
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error getting/creating session', error);
            throw new Error('Failed to get/create session');
        }
    }
    /**
     * Actualizar nivel del chat (State Machine)
     * Niveles 0-15 según documento
     */
    static async updateLevel(sessionId, newLevel, data) {
        try {
            if (newLevel < 0 || newLevel > 15) {
                throw new Error('Level must be between 0 and 15');
            }
            const updates = ['current_level = $2', 'updated_at = CURRENT_TIMESTAMP'];
            const values = [sessionId, newLevel];
            let paramIndex = 3;
            if (data?.selected_category !== undefined) {
                updates.push(`selected_category = $${paramIndex++}`);
                values.push(data.selected_category);
            }
            if (data?.selected_subcategory !== undefined) {
                updates.push(`selected_subcategory = $${paramIndex++}`);
                values.push(data.selected_subcategory);
            }
            if (data?.temp_menu_item !== undefined) {
                updates.push(`temp_menu_item = $${paramIndex++}`);
                values.push(data.temp_menu_item);
            }
            if (data?.checkout_data !== undefined) {
                updates.push(`checkout_data = $${paramIndex++}`);
                values.push(JSON.stringify(data.checkout_data));
            }
            if (data?.reservation_data !== undefined) {
                updates.push(`reservation_data = $${paramIndex++}`);
                values.push(JSON.stringify(data.reservation_data));
            }
            const result = await (0, database_1.query)(`UPDATE sessions
         SET ${updates.join(', ')}
         WHERE session_id = $1
         RETURNING *`, values);
            if (result.rows.length === 0) {
                throw new Error('Session not found');
            }
            logger_1.logger.info('Session level updated', { sessionId, newLevel });
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error updating session level', error);
            throw error;
        }
    }
    /**
     * Marcar sesión como registrada (cliente identificado)
     */
    static async markAsRegistered(sessionId, customerId, phone) {
        try {
            const result = await (0, database_1.query)(`UPDATE sessions
         SET is_registered = true, customer_id = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $1
         RETURNING *`, [sessionId, customerId, phone]);
            if (result.rows.length === 0) {
                throw new Error('Session not found');
            }
            logger_1.logger.info('Session marked as registered', { sessionId, customerId });
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error marking session as registered', error);
            throw error;
        }
    }
    /**
     * Cerrar sesión
     */
    static async closeSession(sessionId) {
        try {
            await (0, database_1.query)(`UPDATE sessions
         SET is_open = false, updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $1`, [sessionId]);
            logger_1.logger.info('Session closed', { sessionId });
        }
        catch (error) {
            logger_1.logger.error('Error closing session', error);
            throw new Error('Failed to close session');
        }
    }
    /**
     * Obtener sesión por ID
     */
    static async getById(sessionId) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM sessions WHERE session_id = $1', [sessionId]);
            return result.rows[0] || null;
        }
        catch (error) {
            logger_1.logger.error('Error getting session by id', error);
            throw error;
        }
    }
    /**
     * Limpiar sesiones expiradas (para Cron Job)
     */
    static async cleanExpiredSessions() {
        try {
            const result = await (0, database_1.query)(`DELETE FROM sessions
         WHERE expires_at < CURRENT_TIMESTAMP AND is_open = false
         RETURNING id`);
            logger_1.logger.info('Expired sessions cleaned', { count: result.rowCount });
            return result.rowCount || 0;
        }
        catch (error) {
            logger_1.logger.error('Error cleaning expired sessions', error);
            throw error;
        }
    }
    /**
     * Extender expiración de sesión
     */
    static async extendExpiration(sessionId, hours = 24) {
        try {
            await (0, database_1.query)(`UPDATE sessions
         SET expires_at = CURRENT_TIMESTAMP + INTERVAL '${hours} hours',
             updated_at = CURRENT_TIMESTAMP
         WHERE session_id = $1`, [sessionId]);
        }
        catch (error) {
            logger_1.logger.error('Error extending session expiration', error);
            throw error;
        }
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=SessionService.js.map