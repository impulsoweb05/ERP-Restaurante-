"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// WAITER SERVICE - Gestión de Meseros
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaiterService = void 0;
const database_1 = require("@config/database");
const ValidationService_1 = require("./ValidationService");
const AuthService_1 = require("./AuthService");
const pool = (0, database_1.getPool)();
class WaiterService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREAR MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async createWaiter(data) {
        try {
            // Validaciones
            if (!data.waiter_code || data.waiter_code.trim() === '') {
                throw new Error('Código de mesero requerido');
            }
            if (!data.full_name || data.full_name.trim() === '') {
                throw new Error('Nombre completo requerido');
            }
            // Validar PIN
            const pinValidation = ValidationService_1.ValidationService.validateWaiterPin(data.pin_code);
            if (!pinValidation.isValid) {
                throw new Error(pinValidation.message || 'PIN inválido');
            }
            // Verificar que no existe mesero con ese código
            const existsQuery = await pool.query('SELECT id FROM waiters WHERE waiter_code = $1', [data.waiter_code]);
            if (existsQuery.rows.length > 0) {
                throw new Error(`Mesero con código ${data.waiter_code} ya existe`);
            }
            // Hashear PIN
            const hashedPin = await AuthService_1.AuthService.hashPassword(data.pin_code);
            // Crear mesero
            const insertQuery = `
        INSERT INTO waiters (waiter_code, full_name, phone, pin_code, is_active, current_orders)
        VALUES ($1, $2, $3, $4, true, 0)
        RETURNING id, waiter_code, full_name, phone, is_active, current_orders, created_at
      `;
            const result = await pool.query(insertQuery, [
                data.waiter_code,
                data.full_name,
                data.phone || null,
                hashedPin
            ]);
            console.log(`✅ Mesero creado: ${data.waiter_code} - ${data.full_name}`);
            return {
                success: true,
                waiter: result.rows[0],
                message: 'Mesero creado exitosamente'
            };
        }
        catch (error) {
            console.error('❌ Error al crear mesero:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER TODOS LOS MESEROS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getAllWaiters(includeInactive = false) {
        try {
            let query = `
        SELECT
          id, waiter_code, full_name, phone, is_active, current_orders, created_at, updated_at
        FROM waiters
      `;
            if (!includeInactive) {
                query += ' WHERE is_active = true';
            }
            query += ' ORDER BY full_name ASC';
            const result = await pool.query(query);
            return {
                success: true,
                waiters: result.rows,
                count: result.rows.length
            };
        }
        catch (error) {
            console.error('❌ Error al obtener meseros:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESERO POR ID
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getWaiterById(waiterId) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const query = `
        SELECT
          id, waiter_code, full_name, phone, is_active, current_orders, created_at, updated_at
        FROM waiters
        WHERE id = $1
      `;
            const result = await pool.query(query, [waiterId]);
            if (result.rows.length === 0) {
                return { success: false, message: 'Mesero no encontrado' };
            }
            return {
                success: true,
                waiter: result.rows[0]
            };
        }
        catch (error) {
            console.error('❌ Error al obtener mesero:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESERO POR CÓDIGO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getWaiterByCode(waiterCode) {
        try {
            const query = `
        SELECT
          id, waiter_code, full_name, phone, is_active, current_orders, created_at, updated_at
        FROM waiters
        WHERE waiter_code = $1
      `;
            const result = await pool.query(query, [waiterCode]);
            if (result.rows.length === 0) {
                return { success: false, message: 'Mesero no encontrado' };
            }
            return {
                success: true,
                waiter: result.rows[0]
            };
        }
        catch (error) {
            console.error('❌ Error al obtener mesero por código:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESEROS ACTIVOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getActiveWaiters() {
        try {
            const query = `
        SELECT
          id, waiter_code, full_name, phone, current_orders, created_at
        FROM waiters
        WHERE is_active = true
        ORDER BY current_orders ASC, full_name ASC
      `;
            const result = await pool.query(query);
            return {
                success: true,
                waiters: result.rows,
                count: result.rows.length
            };
        }
        catch (error) {
            console.error('❌ Error al obtener meseros activos:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ACTUALIZAR MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async updateWaiter(waiterId, data) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const updates = [];
            const values = [];
            let paramCount = 1;
            if (data.waiter_code) {
                updates.push(`waiter_code = $${paramCount++}`);
                values.push(data.waiter_code);
            }
            if (data.full_name) {
                updates.push(`full_name = $${paramCount++}`);
                values.push(data.full_name);
            }
            if (data.phone !== undefined) {
                updates.push(`phone = $${paramCount++}`);
                values.push(data.phone);
            }
            if (data.is_active !== undefined) {
                updates.push(`is_active = $${paramCount++}`);
                values.push(data.is_active);
            }
            if (updates.length === 0) {
                throw new Error('No hay campos para actualizar');
            }
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(waiterId);
            const query = `
        UPDATE waiters
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, waiter_code, full_name, phone, is_active, current_orders, updated_at
      `;
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Mesero no encontrado');
            }
            console.log(`✅ Mesero ${result.rows[0].waiter_code} actualizado`);
            return {
                success: true,
                waiter: result.rows[0],
                message: 'Mesero actualizado exitosamente'
            };
        }
        catch (error) {
            console.error('❌ Error al actualizar mesero:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ACTIVAR/DESACTIVAR MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async toggleWaiterStatus(waiterId, isActive) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const query = `
        UPDATE waiters
        SET is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, waiter_code, full_name, is_active
      `;
            const result = await pool.query(query, [isActive, waiterId]);
            if (result.rows.length === 0) {
                throw new Error('Mesero no encontrado');
            }
            const status = isActive ? 'activado' : 'desactivado';
            console.log(`✅ Mesero ${result.rows[0].waiter_code} ${status}`);
            return {
                success: true,
                waiter: result.rows[0],
                message: `Mesero ${status} exitosamente`
            };
        }
        catch (error) {
            console.error('❌ Error al cambiar estado del mesero:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CAMBIAR PIN DE MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async changeWaiterPin(waiterId, newPin) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            // Validar PIN
            const pinValidation = ValidationService_1.ValidationService.validateWaiterPin(newPin);
            if (!pinValidation.isValid) {
                throw new Error(pinValidation.message || 'PIN inválido');
            }
            // Hashear nuevo PIN
            const hashedPin = await AuthService_1.AuthService.hashPassword(newPin);
            const query = `
        UPDATE waiters
        SET pin_code = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, waiter_code, full_name
      `;
            const result = await pool.query(query, [hashedPin, waiterId]);
            if (result.rows.length === 0) {
                throw new Error('Mesero no encontrado');
            }
            console.log(`✅ PIN actualizado para mesero ${result.rows[0].waiter_code}`);
            return {
                success: true,
                message: 'PIN actualizado exitosamente'
            };
        }
        catch (error) {
            console.error('❌ Error al cambiar PIN:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INCREMENTAR CONTADOR DE PEDIDOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async incrementOrderCount(waiterId) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const query = `
        UPDATE waiters
        SET current_orders = current_orders + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, waiter_code, current_orders
      `;
            const result = await pool.query(query, [waiterId]);
            if (result.rows.length === 0) {
                throw new Error('Mesero no encontrado');
            }
            console.log(`✅ Pedido asignado a ${result.rows[0].waiter_code} (total: ${result.rows[0].current_orders})`);
            return {
                success: true,
                waiter: result.rows[0]
            };
        }
        catch (error) {
            console.error('❌ Error al incrementar contador:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DECREMENTAR CONTADOR DE PEDIDOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async decrementOrderCount(waiterId) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const query = `
        UPDATE waiters
        SET current_orders = GREATEST(current_orders - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, waiter_code, current_orders
      `;
            const result = await pool.query(query, [waiterId]);
            if (result.rows.length === 0) {
                throw new Error('Mesero no encontrado');
            }
            console.log(`✅ Pedido completado por ${result.rows[0].waiter_code} (restantes: ${result.rows[0].current_orders})`);
            return {
                success: true,
                waiter: result.rows[0]
            };
        }
        catch (error) {
            console.error('❌ Error al decrementar contador:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER MESERO CON MENOS PEDIDOS (para auto-asignación)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getWaiterWithLeastOrders() {
        try {
            const query = `
        SELECT id, waiter_code, full_name, current_orders
        FROM waiters
        WHERE is_active = true
        ORDER BY current_orders ASC, created_at ASC
        LIMIT 1
      `;
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'No hay meseros activos disponibles'
                };
            }
            return {
                success: true,
                waiter: result.rows[0]
            };
        }
        catch (error) {
            console.error('❌ Error al obtener mesero con menos pedidos:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER ESTADÍSTICAS DE MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getWaiterStats(waiterId) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const query = `
        SELECT
          w.id,
          w.waiter_code,
          w.full_name,
          w.current_orders,
          COUNT(o.id) as total_orders,
          SUM(o.total) as total_sales,
          COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
          AVG(EXTRACT(EPOCH FROM (o.completed_at - o.created_at))/60) as avg_completion_time_minutes
        FROM waiters w
        LEFT JOIN orders o ON w.id = o.waiter_id
        WHERE w.id = $1
        GROUP BY w.id, w.waiter_code, w.full_name, w.current_orders
      `;
            const result = await pool.query(query, [waiterId]);
            if (result.rows.length === 0) {
                return { success: false, message: 'Mesero no encontrado' };
            }
            const stats = result.rows[0];
            return {
                success: true,
                stats: {
                    waiterId: stats.id,
                    waiterCode: stats.waiter_code,
                    fullName: stats.full_name,
                    currentOrders: parseInt(stats.current_orders),
                    totalOrders: parseInt(stats.total_orders),
                    totalSales: parseFloat(stats.total_sales || 0).toFixed(2),
                    completedOrders: parseInt(stats.completed_orders),
                    cancelledOrders: parseInt(stats.cancelled_orders),
                    avgCompletionTime: stats.avg_completion_time_minutes
                        ? parseFloat(stats.avg_completion_time_minutes).toFixed(1)
                        : null
                }
            };
        }
        catch (error) {
            console.error('❌ Error al obtener estadísticas del mesero:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER PEDIDOS ACTUALES DEL MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getWaiterCurrentOrders(waiterId) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            const query = `
        SELECT
          o.id,
          o.order_number,
          o.order_type,
          o.status,
          o.total,
          o.created_at,
          t.table_number,
          c.full_name as customer_name
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.waiter_id = $1
          AND o.status NOT IN ('delivered', 'cancelled')
        ORDER BY o.created_at ASC
      `;
            const result = await pool.query(query, [waiterId]);
            return {
                success: true,
                orders: result.rows,
                count: result.rows.length
            };
        }
        catch (error) {
            console.error('❌ Error al obtener pedidos del mesero:', error.message);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ELIMINAR MESERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async deleteWaiter(waiterId) {
        try {
            ValidationService_1.ValidationService.validateUUID(waiterId);
            // Verificar que no tenga pedidos activos
            const ordersCheck = await pool.query(`SELECT COUNT(*) as count
         FROM orders
         WHERE waiter_id = $1
           AND status NOT IN ('delivered', 'cancelled')`, [waiterId]);
            if (parseInt(ordersCheck.rows[0].count) > 0) {
                throw new Error('No se puede eliminar mesero con pedidos activos');
            }
            const deleteQuery = await pool.query('DELETE FROM waiters WHERE id = $1 RETURNING waiter_code, full_name', [waiterId]);
            if (deleteQuery.rows.length === 0) {
                throw new Error('Mesero no encontrado');
            }
            const waiter = deleteQuery.rows[0];
            console.log(`✅ Mesero ${waiter.waiter_code} - ${waiter.full_name} eliminado`);
            return {
                success: true,
                message: `Mesero ${waiter.waiter_code} eliminado exitosamente`
            };
        }
        catch (error) {
            console.error('❌ Error al eliminar mesero:', error.message);
            throw error;
        }
    }
}
exports.WaiterService = WaiterService;
//# sourceMappingURL=WaiterService.js.map