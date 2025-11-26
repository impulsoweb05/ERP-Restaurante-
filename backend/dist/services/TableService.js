"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// TABLE SERVICE - Gestión de Mesas
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableService = void 0;
const database_1 = require("@config/database");
const ValidationService_1 = require("./ValidationService");
const logger_1 = require("../utils/logger");
const pool = (0, database_1.getPool)();
class TableService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREAR MESA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async createTable(data) {
        try {
            // Validaciones
            if (!data.table_number || data.table_number.trim() === '') {
                throw new Error('Número de mesa requerido');
            }
            if (!data.capacity || data.capacity <= 0) {
                throw new Error('Capacidad debe ser mayor a 0');
            }
            // Verificar que no existe mesa con ese número
            const existsQuery = await pool.query('SELECT id FROM tables WHERE table_number = $1', [data.table_number]);
            if (existsQuery.rows.length > 0) {
                throw new Error(`Mesa ${data.table_number} ya existe`);
            }
            // Crear mesa
            const insertQuery = `
        INSERT INTO tables (table_number, capacity, zone, status)
        VALUES ($1, $2, $3, 'available')
        RETURNING *
      `;
            const result = await pool.query(insertQuery, [
                data.table_number,
                data.capacity,
                data.zone || null
            ]);
            logger_1.logger.info('Mesa creada', { table_number: data.table_number, capacity: data.capacity });
            return {
                success: true,
                table: result.rows[0],
                message: 'Mesa creada exitosamente'
            };
        }
        catch (error) {
            logger_1.logger.error('Error al crear mesa', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER TODAS LAS MESAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getAllTables() {
        try {
            const query = `
        SELECT
          t.*,
          o.order_number,
          r.reservation_number
        FROM tables t
        LEFT JOIN orders o ON t.current_order_id = o.id
        LEFT JOIN reservations r ON t.current_reservation_id = r.id
        ORDER BY t.zone ASC, t.table_number ASC
      `;
            const result = await pool.query(query);
            return {
                success: true,
                tables: result.rows,
                count: result.rows.length
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener mesas', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESA POR ID
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getTableById(tableId) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            const query = `
        SELECT
          t.*,
          o.order_number,
          o.status as order_status,
          r.reservation_number,
          r.customer_name,
          r.reservation_time
        FROM tables t
        LEFT JOIN orders o ON t.current_order_id = o.id
        LEFT JOIN reservations r ON t.current_reservation_id = r.id
        WHERE t.id = $1
      `;
            const result = await pool.query(query, [tableId]);
            if (result.rows.length === 0) {
                return { success: false, message: 'Mesa no encontrada' };
            }
            return {
                success: true,
                table: result.rows[0]
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener mesa', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESA POR NÚMERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getTableByNumber(tableNumber) {
        try {
            const query = `
        SELECT
          t.*,
          o.order_number,
          o.status as order_status,
          r.reservation_number
        FROM tables t
        LEFT JOIN orders o ON t.current_order_id = o.id
        LEFT JOIN reservations r ON t.current_reservation_id = r.id
        WHERE t.table_number = $1
      `;
            const result = await pool.query(query, [tableNumber]);
            if (result.rows.length === 0) {
                return { success: false, message: 'Mesa no encontrada' };
            }
            return {
                success: true,
                table: result.rows[0]
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener mesa por número', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESAS POR ESTADO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getTablesByStatus(status) {
        try {
            const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
            }
            const query = `
        SELECT
          t.*,
          o.order_number,
          r.reservation_number
        FROM tables t
        LEFT JOIN orders o ON t.current_order_id = o.id
        LEFT JOIN reservations r ON t.current_reservation_id = r.id
        WHERE t.status = $1
        ORDER BY t.zone ASC, t.table_number ASC
      `;
            const result = await pool.query(query, [status]);
            return {
                success: true,
                tables: result.rows,
                count: result.rows.length,
                status
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener mesas por estado', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESAS POR ZONA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getTablesByZone(zone) {
        try {
            const query = `
        SELECT
          t.*,
          o.order_number,
          r.reservation_number
        FROM tables t
        LEFT JOIN orders o ON t.current_order_id = o.id
        LEFT JOIN reservations r ON t.current_reservation_id = r.id
        WHERE t.zone = $1
        ORDER BY t.table_number ASC
      `;
            const result = await pool.query(query, [zone]);
            return {
                success: true,
                tables: result.rows,
                count: result.rows.length,
                zone
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener mesas por zona', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESAS DISPONIBLES (con capacidad mínima opcional)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getAvailableTables(minCapacity) {
        try {
            let query = `
        SELECT *
        FROM tables
        WHERE status = 'available'
      `;
            const params = [];
            if (minCapacity && minCapacity > 0) {
                query += ' AND capacity >= $1';
                params.push(minCapacity);
            }
            query += ' ORDER BY zone ASC, capacity ASC, table_number ASC';
            const result = await pool.query(query, params);
            return {
                success: true,
                tables: result.rows,
                count: result.rows.length,
                minCapacity: minCapacity || null
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener mesas disponibles', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ACTUALIZAR ESTADO DE MESA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async updateTableStatus(tableId, status) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
            }
            const query = `
        UPDATE tables
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
            const result = await pool.query(query, [status, tableId]);
            if (result.rows.length === 0) {
                throw new Error('Mesa no encontrada');
            }
            logger_1.logger.info('Estado de mesa actualizado', { table_number: result.rows[0].table_number, status });
            return {
                success: true,
                table: result.rows[0],
                message: `Mesa actualizada a ${status}`
            };
        }
        catch (error) {
            logger_1.logger.error('Error al actualizar estado de mesa', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ASIGNAR PEDIDO A MESA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async assignOrderToTable(tableId, orderId) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            ValidationService_1.ValidationService.validateUUID(orderId);
            const query = `
        UPDATE tables
        SET status = 'occupied',
            current_order_id = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
            const result = await pool.query(query, [orderId, tableId]);
            if (result.rows.length === 0) {
                throw new Error('Mesa no encontrada');
            }
            logger_1.logger.info('Pedido asignado a mesa', { table_number: result.rows[0].table_number, orderId });
            return {
                success: true,
                table: result.rows[0],
                message: 'Pedido asignado a mesa'
            };
        }
        catch (error) {
            logger_1.logger.error('Error al asignar pedido', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ASIGNAR RESERVA A MESA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async assignReservationToTable(tableId, reservationId) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            ValidationService_1.ValidationService.validateUUID(reservationId);
            const query = `
        UPDATE tables
        SET status = 'reserved',
            current_reservation_id = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
            const result = await pool.query(query, [reservationId, tableId]);
            if (result.rows.length === 0) {
                throw new Error('Mesa no encontrada');
            }
            logger_1.logger.info('Reserva asignada a mesa', { table_number: result.rows[0].table_number, reservationId });
            return {
                success: true,
                table: result.rows[0],
                message: 'Reserva asignada a mesa'
            };
        }
        catch (error) {
            logger_1.logger.error('Error al asignar reserva', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LIBERAR MESA (limpiar pedido/reserva)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async releaseTable(tableId, setToAvailable = false) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            const newStatus = setToAvailable ? 'available' : 'cleaning';
            const query = `
        UPDATE tables
        SET status = $1,
            current_order_id = NULL,
            current_reservation_id = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
            const result = await pool.query(query, [newStatus, tableId]);
            if (result.rows.length === 0) {
                throw new Error('Mesa no encontrada');
            }
            logger_1.logger.info('Mesa liberada', { table_number: result.rows[0].table_number, status: newStatus });
            return {
                success: true,
                table: result.rows[0],
                message: `Mesa liberada (${newStatus})`
            };
        }
        catch (error) {
            logger_1.logger.error('Error al liberar mesa', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ACTUALIZAR MESA (datos generales)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async updateTable(tableId, data) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            const updates = [];
            const values = [];
            let paramCount = 1;
            if (data.table_number) {
                updates.push(`table_number = $${paramCount++}`);
                values.push(data.table_number);
            }
            if (data.capacity) {
                if (data.capacity <= 0) {
                    throw new Error('Capacidad debe ser mayor a 0');
                }
                updates.push(`capacity = $${paramCount++}`);
                values.push(data.capacity);
            }
            if (data.zone !== undefined) {
                updates.push(`zone = $${paramCount++}`);
                values.push(data.zone);
            }
            if (data.status) {
                const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
                if (!validStatuses.includes(data.status)) {
                    throw new Error(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
                }
                updates.push(`status = $${paramCount++}`);
                values.push(data.status);
            }
            if (updates.length === 0) {
                throw new Error('No hay campos para actualizar');
            }
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(tableId);
            const query = `
        UPDATE tables
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Mesa no encontrada');
            }
            logger_1.logger.info('Mesa actualizada', { table_number: result.rows[0].table_number });
            return {
                success: true,
                table: result.rows[0],
                message: 'Mesa actualizada exitosamente'
            };
        }
        catch (error) {
            logger_1.logger.error('Error al actualizar mesa', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ELIMINAR MESA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async deleteTable(tableId) {
        try {
            ValidationService_1.ValidationService.validateUUID(tableId);
            // Verificar que no tenga pedidos/reservas activas
            const checkQuery = await pool.query(`SELECT current_order_id, current_reservation_id, table_number
         FROM tables
         WHERE id = $1`, [tableId]);
            if (checkQuery.rows.length === 0) {
                throw new Error('Mesa no encontrada');
            }
            const table = checkQuery.rows[0];
            if (table.current_order_id || table.current_reservation_id) {
                throw new Error('No se puede eliminar mesa con pedidos/reservas activas');
            }
            const deleteQuery = await pool.query('DELETE FROM tables WHERE id = $1 RETURNING table_number', [tableId]);
            logger_1.logger.info('Mesa eliminada', { table_number: table.table_number });
            return {
                success: true,
                message: `Mesa ${table.table_number} eliminada exitosamente`
            };
        }
        catch (error) {
            logger_1.logger.error('Error al eliminar mesa', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER ESTADÍSTICAS DE MESAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getTableStats() {
        try {
            const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
          SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved,
          SUM(CASE WHEN status = 'cleaning' THEN 1 ELSE 0 END) as cleaning,
          SUM(capacity) as total_capacity
        FROM tables
      `;
            const result = await pool.query(query);
            return {
                success: true,
                stats: {
                    total: parseInt(result.rows[0].total),
                    available: parseInt(result.rows[0].available),
                    occupied: parseInt(result.rows[0].occupied),
                    reserved: parseInt(result.rows[0].reserved),
                    cleaning: parseInt(result.rows[0].cleaning),
                    totalCapacity: parseInt(result.rows[0].total_capacity),
                    occupancyRate: result.rows[0].total > 0
                        ? ((parseInt(result.rows[0].occupied) + parseInt(result.rows[0].reserved)) / parseInt(result.rows[0].total) * 100).toFixed(1)
                        : 0
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error al obtener estadísticas', error);
            throw error;
        }
    }
}
exports.TableService = TableService;
//# sourceMappingURL=TableService.js.map