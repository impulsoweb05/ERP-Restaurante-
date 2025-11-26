// ═════════════════════════════════════════════════════════════════════════════
// TABLE SERVICE - Gestión de Mesas
// ═════════════════════════════════════════════════════════════════════════════

import { getPool } from '@config/database';
import { ValidationService } from './ValidationService';

const pool = getPool();

export interface TableData {
  table_number: string;
  capacity: number;
  zone?: string;
}

export interface UpdateTableData {
  table_number?: string;
  capacity?: number;
  zone?: string;
  status?: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

export class TableService {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREAR MESA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async createTable(data: TableData) {
    try {
      // Validaciones
      if (!data.table_number || data.table_number.trim() === '') {
        throw new Error('Número de mesa requerido');
      }

      if (!data.capacity || data.capacity <= 0) {
        throw new Error('Capacidad debe ser mayor a 0');
      }

      // Verificar que no existe mesa con ese número
      const existsQuery = await pool.query(
        'SELECT id FROM tables WHERE table_number = $1',
        [data.table_number]
      );

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

      console.log(`✅ Mesa creada: ${data.table_number} (capacidad: ${data.capacity})`);
      return {
        success: true,
        table: result.rows[0],
        message: 'Mesa creada exitosamente'
      };

    } catch (error: any) {
      console.error('❌ Error al crear mesa:', error.message);
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

    } catch (error: any) {
      console.error('❌ Error al obtener mesas:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER MESA POR ID
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getTableById(tableId: string) {
    try {
      ValidationService.validateUUID(tableId);

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

    } catch (error: any) {
      console.error('❌ Error al obtener mesa:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER MESA POR NÚMERO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getTableByNumber(tableNumber: string) {
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

    } catch (error: any) {
      console.error('❌ Error al obtener mesa por número:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER MESAS POR ESTADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getTablesByStatus(status: string) {
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

    } catch (error: any) {
      console.error('❌ Error al obtener mesas por estado:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER MESAS POR ZONA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getTablesByZone(zone: string) {
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

    } catch (error: any) {
      console.error('❌ Error al obtener mesas por zona:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER MESAS DISPONIBLES (con capacidad mínima opcional)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getAvailableTables(minCapacity?: number) {
    try {
      let query = `
        SELECT *
        FROM tables
        WHERE status = 'available'
      `;

      const params: any[] = [];

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

    } catch (error: any) {
      console.error('❌ Error al obtener mesas disponibles:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTUALIZAR ESTADO DE MESA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async updateTableStatus(
    tableId: string,
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  ) {
    try {
      ValidationService.validateUUID(tableId);

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

      console.log(`✅ Mesa ${result.rows[0].table_number} → ${status}`);
      return {
        success: true,
        table: result.rows[0],
        message: `Mesa actualizada a ${status}`
      };

    } catch (error: any) {
      console.error('❌ Error al actualizar estado de mesa:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ASIGNAR PEDIDO A MESA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async assignOrderToTable(tableId: string, orderId: string) {
    try {
      ValidationService.validateUUID(tableId);
      ValidationService.validateUUID(orderId);

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

      console.log(`✅ Pedido asignado a mesa ${result.rows[0].table_number}`);
      return {
        success: true,
        table: result.rows[0],
        message: 'Pedido asignado a mesa'
      };

    } catch (error: any) {
      console.error('❌ Error al asignar pedido:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ASIGNAR RESERVA A MESA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async assignReservationToTable(tableId: string, reservationId: string) {
    try {
      ValidationService.validateUUID(tableId);
      ValidationService.validateUUID(reservationId);

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

      console.log(`✅ Reserva asignada a mesa ${result.rows[0].table_number}`);
      return {
        success: true,
        table: result.rows[0],
        message: 'Reserva asignada a mesa'
      };

    } catch (error: any) {
      console.error('❌ Error al asignar reserva:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIBERAR MESA (limpiar pedido/reserva)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async releaseTable(tableId: string, setToAvailable: boolean = false) {
    try {
      ValidationService.validateUUID(tableId);

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

      console.log(`✅ Mesa ${result.rows[0].table_number} liberada → ${newStatus}`);
      return {
        success: true,
        table: result.rows[0],
        message: `Mesa liberada (${newStatus})`
      };

    } catch (error: any) {
      console.error('❌ Error al liberar mesa:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTUALIZAR MESA (datos generales)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async updateTable(tableId: string, data: UpdateTableData) {
    try {
      ValidationService.validateUUID(tableId);

      const updates: string[] = [];
      const values: any[] = [];
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

      console.log(`✅ Mesa ${result.rows[0].table_number} actualizada`);
      return {
        success: true,
        table: result.rows[0],
        message: 'Mesa actualizada exitosamente'
      };

    } catch (error: any) {
      console.error('❌ Error al actualizar mesa:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELIMINAR MESA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async deleteTable(tableId: string) {
    try {
      ValidationService.validateUUID(tableId);

      // Verificar que no tenga pedidos/reservas activas
      const checkQuery = await pool.query(
        `SELECT current_order_id, current_reservation_id, table_number
         FROM tables
         WHERE id = $1`,
        [tableId]
      );

      if (checkQuery.rows.length === 0) {
        throw new Error('Mesa no encontrada');
      }

      const table = checkQuery.rows[0];

      if (table.current_order_id || table.current_reservation_id) {
        throw new Error('No se puede eliminar mesa con pedidos/reservas activas');
      }

      const deleteQuery = await pool.query(
        'DELETE FROM tables WHERE id = $1 RETURNING table_number',
        [tableId]
      );

      console.log(`✅ Mesa ${table.table_number} eliminada`);
      return {
        success: true,
        message: `Mesa ${table.table_number} eliminada exitosamente`
      };

    } catch (error: any) {
      console.error('❌ Error al eliminar mesa:', error.message);
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

    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas:', error.message);
      throw error;
    }
  }
}
