// ═════════════════════════════════════════════════════════════════════════════
// KITCHEN SERVICE - Gestión de Cola de Cocina
// ═════════════════════════════════════════════════════════════════════════════

import { getPool } from '@config/database';
import { ValidationService } from './ValidationService';
import { WebSocketService } from './WebSocketService';

const pool = getPool();

export interface KitchenQueueItem {
  order_item_id: string;
  priority?: number; // 1-5 (1 = urgente, 5 = baja)
  assigned_station?: string;
  estimated_time?: number; // minutos
}

export class KitchenService {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AGREGAR ITEM A LA COLA DE COCINA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async addToQueue(data: KitchenQueueItem) {
    try {
      ValidationService.validateUUID(data.order_item_id);

      // Validar prioridad
      const priority = data.priority || 3;
      if (priority < 1 || priority > 5) {
        throw new Error('Prioridad debe estar entre 1 (urgente) y 5 (baja)');
      }

      // Verificar que el order_item existe
      const itemCheck = await pool.query(
        `SELECT oi.id, mi.station, mi.preparation_time
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.id = $1`,
        [data.order_item_id]
      );

      if (itemCheck.rows.length === 0) {
        throw new Error('Item de pedido no encontrado');
      }

      const item = itemCheck.rows[0];

      // Insertar en cola
      const insertQuery = `
        INSERT INTO kitchen_queue (
          order_item_id,
          priority,
          assigned_station,
          estimated_time,
          status
        ) VALUES ($1, $2, $3, $4, 'queued')
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        data.order_item_id,
        priority,
        data.assigned_station || item.station || null,
        data.estimated_time || item.preparation_time || null
      ]);

      console.log(`✅ Item agregado a cola de cocina (prioridad: ${priority})`);
      return {
        success: true,
        queueItem: result.rows[0],
        message: 'Item agregado a la cola'
      };

    } catch (error: any) {
      console.error('❌ Error al agregar a cola:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER COLA COMPLETA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getQueue(statusFilter?: string) {
    try {
      let query = `
        SELECT
          kq.*,
          oi.quantity,
          oi.special_instructions,
          mi.name as item_name,
          mi.station as default_station,
          o.order_number,
          o.order_type,
          t.table_number
        FROM kitchen_queue kq
        JOIN order_items oi ON kq.order_item_id = oi.id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN tables t ON o.table_id = t.id
      `;

      const params: any[] = [];

      if (statusFilter) {
        const validStatuses = ['queued', 'preparing', 'ready'];
        if (!validStatuses.includes(statusFilter)) {
          throw new Error(`Estado inválido. Debe ser: ${validStatuses.join(', ')}`);
        }
        query += ' WHERE kq.status = $1';
        params.push(statusFilter);
      }

      // Ordenar por prioridad (1 = más urgente) y fecha de creación
      query += ' ORDER BY kq.priority ASC, kq.created_at ASC';

      const result = await pool.query(query, params);

      return {
        success: true,
        queue: result.rows,
        count: result.rows.length
      };

    } catch (error: any) {
      console.error('❌ Error al obtener cola:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER ITEMS POR ESTACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getQueueByStation(station: string) {
    try {
      const query = `
        SELECT
          kq.*,
          oi.quantity,
          oi.special_instructions,
          mi.name as item_name,
          o.order_number,
          o.order_type,
          t.table_number
        FROM kitchen_queue kq
        JOIN order_items oi ON kq.order_item_id = oi.id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN tables t ON o.table_id = t.id
        WHERE kq.assigned_station = $1
          AND kq.status IN ('queued', 'preparing')
        ORDER BY kq.priority ASC, kq.created_at ASC
      `;

      const result = await pool.query(query, [station]);

      return {
        success: true,
        queue: result.rows,
        count: result.rows.length,
        station
      };

    } catch (error: any) {
      console.error('❌ Error al obtener cola por estación:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INICIAR PREPARACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async startPreparation(queueId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(queueId);

      // 1. Actualizar estado en kitchen_queue
      const updateQueue = `
        UPDATE kitchen_queue
        SET status = 'preparing',
            started_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'queued'
        RETURNING order_item_id
      `;

      const result = await client.query(updateQueue, [queueId]);

      if (result.rows.length === 0) {
        throw new Error('Item no encontrado o ya en preparación');
      }

      // 2. Actualizar estado del order_item
      await client.query(
        `UPDATE order_items
         SET status = 'preparing'
         WHERE id = $1`,
        [result.rows[0].order_item_id]
      );

      await client.query('COMMIT');

      console.log(`✅ Preparación iniciada para item: ${queueId}`);
      return {
        success: true,
        message: 'Preparación iniciada'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('❌ Error al iniciar preparación:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLETAR ITEM (marcar como listo)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async completeItem(queueId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(queueId);

      // 1. Actualizar estado en kitchen_queue
      const updateQueue = `
        UPDATE kitchen_queue
        SET status = 'ready',
            completed_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'preparing'
        RETURNING order_item_id
      `;

      const result = await client.query(updateQueue, [queueId]);

      if (result.rows.length === 0) {
        throw new Error('Item no encontrado o no está en preparación');
      }

      // 2. Actualizar estado del order_item
      await client.query(
        `UPDATE order_items
         SET status = 'ready'
         WHERE id = $1`,
        [result.rows[0].order_item_id]
      );

      // 3. Obtener info del pedido y item para notificaciones
      const orderInfo = await client.query(
        `SELECT o.id as order_id, o.order_number, o.customer_id, o.waiter_id,
                mi.name as item_name
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.id = $1`,
        [result.rows[0].order_item_id]
      );

      await client.query('COMMIT');

      console.log(`✅ Item completado: ${queueId}`);

      // Notificar via WebSocket que el item está listo
      if (orderInfo.rows.length > 0) {
        const order = orderInfo.rows[0];
        WebSocketService.notifyOrderItemReady(
          order.order_id,
          order.order_number,
          result.rows[0].order_item_id,
          order.item_name,
          order.waiter_id
        );
      }

      return {
        success: true,
        message: 'Item marcado como listo'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('❌ Error al completar item:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTUALIZAR PRIORIDAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async updatePriority(queueId: string, priority: number) {
    try {
      ValidationService.validateUUID(queueId);

      if (priority < 1 || priority > 5) {
        throw new Error('Prioridad debe estar entre 1 (urgente) y 5 (baja)');
      }

      const query = `
        UPDATE kitchen_queue
        SET priority = $1
        WHERE id = $2 AND status IN ('queued', 'preparing')
        RETURNING *
      `;

      const result = await pool.query(query, [priority, queueId]);

      if (result.rows.length === 0) {
        throw new Error('Item no encontrado o ya completado');
      }

      console.log(`✅ Prioridad actualizada: ${priority}`);
      return {
        success: true,
        queueItem: result.rows[0],
        message: 'Prioridad actualizada'
      };

    } catch (error: any) {
      console.error('❌ Error al actualizar prioridad:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTUALIZAR ESTACIÓN ASIGNADA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async updateStation(queueId: string, station: string) {
    try {
      ValidationService.validateUUID(queueId);

      const query = `
        UPDATE kitchen_queue
        SET assigned_station = $1
        WHERE id = $2 AND status IN ('queued', 'preparing')
        RETURNING *
      `;

      const result = await pool.query(query, [station, queueId]);

      if (result.rows.length === 0) {
        throw new Error('Item no encontrado o ya completado');
      }

      console.log(`✅ Estación actualizada: ${station}`);
      return {
        success: true,
        queueItem: result.rows[0],
        message: `Estación actualizada a ${station}`
      };

    } catch (error: any) {
      console.error('❌ Error al actualizar estación:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER ESTADÍSTICAS DE COCINA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getKitchenStats() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_items,
          SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
          SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
          SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
          AVG(CASE
            WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (completed_at - started_at))/60
          END) as avg_preparation_time_minutes,
          AVG(CASE
            WHEN started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (started_at - created_at))/60
          END) as avg_wait_time_minutes
        FROM kitchen_queue
        WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `;

      const result = await pool.query(query);
      const stats = result.rows[0];

      return {
        success: true,
        stats: {
          totalItems: parseInt(stats.total_items),
          queued: parseInt(stats.queued),
          preparing: parseInt(stats.preparing),
          ready: parseInt(stats.ready),
          avgPreparationTime: stats.avg_preparation_time_minutes
            ? parseFloat(stats.avg_preparation_time_minutes).toFixed(1)
            : null,
          avgWaitTime: stats.avg_wait_time_minutes
            ? parseFloat(stats.avg_wait_time_minutes).toFixed(1)
            : null
        }
      };

    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER ESTADÍSTICAS POR ESTACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getStationStats(station: string) {
    try {
      const query = `
        SELECT
          assigned_station,
          COUNT(*) as total_items,
          SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
          SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
          SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
          AVG(CASE
            WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (completed_at - started_at))/60
          END) as avg_preparation_time_minutes
        FROM kitchen_queue
        WHERE assigned_station = $1
          AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        GROUP BY assigned_station
      `;

      const result = await pool.query(query, [station]);

      if (result.rows.length === 0) {
        return {
          success: true,
          stats: {
            station,
            totalItems: 0,
            queued: 0,
            preparing: 0,
            ready: 0,
            avgPreparationTime: null
          }
        };
      }

      const stats = result.rows[0];

      return {
        success: true,
        stats: {
          station: stats.assigned_station,
          totalItems: parseInt(stats.total_items),
          queued: parseInt(stats.queued),
          preparing: parseInt(stats.preparing),
          ready: parseInt(stats.ready),
          avgPreparationTime: stats.avg_preparation_time_minutes
            ? parseFloat(stats.avg_preparation_time_minutes).toFixed(1)
            : null
        }
      };

    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas por estación:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER ITEMS DE UN PEDIDO ESPECÍFICO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getQueueByOrder(orderId: string) {
    try {
      ValidationService.validateUUID(orderId);

      const query = `
        SELECT
          kq.*,
          oi.quantity,
          oi.special_instructions,
          mi.name as item_name,
          mi.station as default_station
        FROM kitchen_queue kq
        JOIN order_items oi ON kq.order_item_id = oi.id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = $1
        ORDER BY kq.priority ASC, kq.created_at ASC
      `;

      const result = await pool.query(query, [orderId]);

      return {
        success: true,
        queue: result.rows,
        count: result.rows.length
      };

    } catch (error: any) {
      console.error('❌ Error al obtener items del pedido:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFICAR SI TODOS LOS ITEMS DEL PEDIDO ESTÁN LISTOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async checkOrderReady(orderId: string) {
    try {
      ValidationService.validateUUID(orderId);

      const query = `
        SELECT
          COUNT(*) as total_items,
          SUM(CASE WHEN kq.status = 'ready' THEN 1 ELSE 0 END) as ready_items
        FROM order_items oi
        LEFT JOIN kitchen_queue kq ON oi.id = kq.order_item_id
        WHERE oi.order_id = $1
      `;

      const result = await pool.query(query, [orderId]);
      const data = result.rows[0];

      const totalItems = parseInt(data.total_items);
      const readyItems = parseInt(data.ready_items);
      const allReady = totalItems > 0 && totalItems === readyItems;

      return {
        success: true,
        orderId,
        totalItems,
        readyItems,
        allReady,
        message: allReady ? 'Pedido completo y listo' : `${readyItems}/${totalItems} items listos`
      };

    } catch (error: any) {
      console.error('❌ Error al verificar pedido:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER LISTA DE ESTACIONES ÚNICAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getStations() {
    try {
      const query = `
        SELECT DISTINCT assigned_station as station
        FROM kitchen_queue
        WHERE assigned_station IS NOT NULL
        ORDER BY assigned_station ASC
      `;

      const result = await pool.query(query);

      return {
        success: true,
        stations: result.rows.map(r => r.station),
        count: result.rows.length
      };

    } catch (error: any) {
      console.error('❌ Error al obtener estaciones:', error.message);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELIMINAR ITEM DE LA COLA (si pedido se cancela)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async removeFromQueue(queueId: string) {
    try {
      ValidationService.validateUUID(queueId);

      const deleteQuery = await pool.query(
        'DELETE FROM kitchen_queue WHERE id = $1 RETURNING order_item_id',
        [queueId]
      );

      if (deleteQuery.rows.length === 0) {
        throw new Error('Item no encontrado en la cola');
      }

      console.log(`✅ Item eliminado de la cola: ${queueId}`);
      return {
        success: true,
        message: 'Item eliminado de la cola'
      };

    } catch (error: any) {
      console.error('❌ Error al eliminar de cola:', error.message);
      throw error;
    }
  }
}
