// ═════════════════════════════════════════════════════════════════════════════
// RESERVATION SERVICE - Gestión de Reservas
// ═════════════════════════════════════════════════════════════════════════════

import { getPool } from '@config/database';
import { ValidationService } from './ValidationService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const pool = getPool();

export interface ReservationData {
  customer_id: string;
  table_id: string;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  special_requests?: string;
}

export interface UpdateReservationData {
  reservation_date?: string;
  reservation_time?: string;
  party_size?: number;
  table_id?: string;
  special_requests?: string;
}

export class ReservationService {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREAR RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async createReservation(data: ReservationData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Validar datos de entrada
      const validations = [
        ValidationService.validateUUID(data.customer_id),
        ValidationService.validateUUID(data.table_id),
        ValidationService.validatePhone(data.customer_phone),
        ValidationService.validatePartySize(data.party_size)
      ];

      // Validar email si se proporciona
      if (data.customer_email) {
        validations.push(ValidationService.validateEmail(data.customer_email));
      }

      // Validar fecha futura
      const futureDateError = ValidationService.validateFutureDate(data.reservation_date, data.reservation_time);
      if (futureDateError) {
        validations.push({ isValid: false, message: futureDateError });
      }

      const validationResult = ValidationService.validateAll(validations);
      if (!validationResult.isValid) {
        throw new Error(`Errores de validación: ${validationResult.errors.join(', ')}');
      }

      // 2. Verificar que el cliente existe
      const customerCheck = await client.query(
        'SELECT id FROM customers WHERE id = $1 AND is_active = true',
        [data.customer_id]
      );

      if (customerCheck.rows.length === 0) {
        throw new Error('Cliente no encontrado o inactivo');
      }

      // 3. Verificar disponibilidad de mesa
      const availability = await this.checkTableAvailability(
        client,
        data.table_id,
        data.reservation_date,
        data.reservation_time,
        data.party_size
      );

      if (!availability.available) {
        throw new Error(availability.reason || 'Mesa no disponible');
      }

      // 4. Generar número de reserva único
      const reservationNumber = await this.generateReservationNumber(client);

      // 5. Crear reserva
      const insertQuery = `
        INSERT INTO reservations (
          reservation_number,
          customer_id,
          table_id,
          reservation_date,
          reservation_time,
          party_size,
          customer_name,
          customer_phone,
          customer_email,
          special_requests,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        reservationNumber,
        data.customer_id,
        data.table_id,
        data.reservation_date,
        data.reservation_time,
        data.party_size,
        data.customer_name,
        data.customer_phone,
        data.customer_email || null,
        data.special_requests || null
      ]);

      // 6. Actualizar estado de mesa
      await client.query(
        `UPDATE tables
         SET status = 'reserved',
             current_reservation_id = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [result.rows[0].id, data.table_id]
      );

      await client.query('COMMIT');

      logger.info('Reserva creada: ${reservationNumber}');
      return {
        success: true,
        reservation: result.rows[0],
        message: 'Reserva creada exitosamente'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al crear reserva', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERIFICAR DISPONIBILIDAD DE MESA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async checkTableAvailability(
    client: any,
    tableId: string,
    reservationDate: string,
    reservationTime: string,
    partySize: number
  ): Promise<{ available: boolean; reason?: string }> {

    // 1. Verificar que la mesa existe
    const tableQuery = await client.query(
      'SELECT capacity, status FROM tables WHERE id = $1',
      [tableId]
    );

    if (tableQuery.rows.length === 0) {
      return { available: false, reason: 'Mesa no encontrada' };
    }

    const table = tableQuery.rows[0];

    // 2. Verificar capacidad
    if (table.capacity < partySize) {
      return {
        available: false,
        reason: `Mesa con capacidad insuficiente (máx: ${table.capacity}, solicitado: ${partySize})`
      };
    }

    // 3. Verificar si hay reservas conflictivas (±2 horas)
    const conflictQuery = `
      SELECT id, reservation_time
      FROM reservations
      WHERE table_id = $1
        AND reservation_date = $2
        AND status IN ('pending', 'confirmed', 'active')
        AND reservation_time BETWEEN ($3::TIME - INTERVAL '2 hours')
                                 AND ($3::TIME + INTERVAL '2 hours')
    `;

    const conflicts = await client.query(conflictQuery, [
      tableId,
      reservationDate,
      reservationTime
    ]);

    if (conflicts.rows.length > 0) {
      return {
        available: false,
        reason: 'Mesa ya reservada en ese horario (±2 horas)'
      };
    }

    return { available: true };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GENERAR NÚMERO DE RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async generateReservationNumber(client: any): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countQuery = await client.query(
      `SELECT COUNT(*) as count
       FROM reservations
       WHERE reservation_number LIKE $1`,
      [`RES-${today}-%`]
    );

    const count = parseInt(countQuery.rows[0].count) + 1;
    return `RES-${today}-${String(count).padStart(4, '0')}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER RESERVA POR ID
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getReservationById(reservationId: string) {
    try {
      ValidationService.validateUUID(reservationId);

      const query = `
        SELECT
          r.*,
          t.table_number,
          t.capacity,
          t.zone,
          c.full_name as customer_full_name
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.id = $1
      `;

      const result = await pool.query(query, [reservationId]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Reserva no encontrada' };
      }

      return {
        success: true,
        reservation: result.rows[0]
      };

    } catch (error: any) {
      logger.error('Error al obtener reserva', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER RESERVAS POR CLIENTE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getReservationsByCustomer(customerId: string) {
    try {
      ValidationService.validateUUID(customerId);

      const query = `
        SELECT
          r.*,
          t.table_number,
          t.capacity,
          t.zone
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE r.customer_id = $1
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
      `;

      const result = await pool.query(query, [customerId]);

      return {
        success: true,
        reservations: result.rows,
        count: result.rows.length
      };

    } catch (error: any) {
      logger.error('Error al obtener reservas del cliente', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER RESERVAS POR FECHA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getReservationsByDate(date: string, status?: string) {
    try {
      let query = `
        SELECT
          r.*,
          t.table_number,
          t.capacity,
          t.zone,
          c.full_name as customer_full_name
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.reservation_date = $1
      `;

      const params: any[] = [date];

      if (status) {
        query += ' AND r.status = $2';
        params.push(status);
      }

      query += ' ORDER BY r.reservation_time ASC';

      const result = await pool.query(query, params);

      return {
        success: true,
        reservations: result.rows,
        count: result.rows.length,
        date
      };

    } catch (error: any) {
      logger.error('Error al obtener reservas por fecha', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIRMAR RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async confirmReservation(reservationId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(reservationId);

      const updateQuery = `
        UPDATE reservations
        SET status = 'confirmed',
            confirmed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'pending'
        RETURNING *
      `;

      const result = await client.query(updateQuery, [reservationId]);

      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o ya confirmada');
      }

      await client.query('COMMIT');

      logger.info('Reserva confirmada: ${result.rows[0].reservation_number}');
      return {
        success: true,
        reservation: result.rows[0],
        message: 'Reserva confirmada exitosamente'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al confirmar reserva', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTIVAR RESERVA (Cliente llegó al restaurante)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async activateReservation(reservationId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(reservationId);

      // 1. Actualizar reserva a 'active'
      const updateReservation = `
        UPDATE reservations
        SET status = 'active',
            activated_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status IN ('pending', 'confirmed')
        RETURNING table_id
      `;

      const result = await client.query(updateReservation, [reservationId]);

      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o en estado incorrecto');
      }

      // 2. Actualizar mesa a 'occupied'
      await client.query(
        `UPDATE tables
         SET status = 'occupied',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [result.rows[0].table_id]
      );

      await client.query('COMMIT');

      logger.info('Reserva activada: ${reservationId}');
      return {
        success: true,
        message: 'Reserva activada - Cliente sentado'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al activar reserva', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CANCELAR RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async cancelReservation(reservationId: string, reason?: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(reservationId);

      // 1. Obtener datos de la reserva
      const reservationQuery = await client.query(
        'SELECT table_id, status FROM reservations WHERE id = $1',
        [reservationId]
      );

      if (reservationQuery.rows.length === 0) {
        throw new Error('Reserva no encontrada');
      }

      const reservation = reservationQuery.rows[0];

      if (!['pending', 'confirmed'].includes(reservation.status)) {
        throw new Error('Solo se pueden cancelar reservas pendientes o confirmadas');
      }

      // 2. Actualizar reserva
      const updateQuery = `
        UPDATE reservations
        SET status = 'cancelled',
            cancelled_at = CURRENT_TIMESTAMP,
            special_requests = COALESCE(special_requests || ' | ', '') || $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        reservationId,
        reason ? `Motivo de cancelación: ${reason}` : 'Cancelado'
      ]);

      // 3. Liberar mesa
      await client.query(
        `UPDATE tables
         SET status = 'available',
             current_reservation_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [reservation.table_id]
      );

      await client.query('COMMIT');

      logger.info('Reserva cancelada: ${result.rows[0].reservation_number}');
      return {
        success: true,
        reservation: result.rows[0],
        message: 'Reserva cancelada exitosamente'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al cancelar reserva', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MARCAR COMO NO-SHOW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async markAsNoShow(reservationId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(reservationId);

      // 1. Actualizar reserva
      const updateQuery = `
        UPDATE reservations
        SET status = 'no_show',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status IN ('pending', 'confirmed')
        RETURNING table_id
      `;

      const result = await client.query(updateQuery, [reservationId]);

      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o en estado incorrecto');
      }

      // 2. Liberar mesa
      await client.query(
        `UPDATE tables
         SET status = 'available',
             current_reservation_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [result.rows[0].table_id]
      );

      await client.query('COMMIT');

      logger.info('Reserva marcada como no-show: ${reservationId}');
      return {
        success: true,
        message: 'Reserva marcada como no-show'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al marcar no-show', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLETAR RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async completeReservation(reservationId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(reservationId);

      // 1. Actualizar reserva
      const updateQuery = `
        UPDATE reservations
        SET status = 'completed',
            completed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'active'
        RETURNING table_id
      `;

      const result = await client.query(updateQuery, [reservationId]);

      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o no está activa');
      }

      // 2. Actualizar mesa a 'cleaning' (o 'available')
      await client.query(
        `UPDATE tables
         SET status = 'cleaning',
             current_reservation_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [result.rows[0].table_id]
      );

      await client.query('COMMIT');

      logger.info('Reserva completada: ${reservationId}');
      return {
        success: true,
        message: 'Reserva completada exitosamente'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al completar reserva', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AUTO-RELEASE: Cancelar reservas no confirmadas después de X minutos
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async autoReleaseExpiredReservations(minutesThreshold: number = 30) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Buscar reservas pendientes que llevan más de X minutos sin confirmar
      const query = `
        UPDATE reservations
        SET status = 'cancelled',
            auto_released_at = CURRENT_TIMESTAMP,
            special_requests = COALESCE(special_requests || ' | ', '') || 'Auto-cancelado por falta de confirmación',
            updated_at = CURRENT_TIMESTAMP
        WHERE status = 'pending'
          AND created_at < (CURRENT_TIMESTAMP - INTERVAL '${minutesThreshold} minutes')
        RETURNING id, table_id, reservation_number
      `;

      const result = await client.query(query);

      // Liberar mesas
      if (result.rows.length > 0) {
        const tableIds = result.rows.map(r => r.table_id);

        await client.query(
          `UPDATE tables
           SET status = 'available',
               current_reservation_id = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1::uuid[])`,
          [tableIds]
        );

        await client.query('COMMIT');

        logger.info('Auto-release completado', { count: result.rows.length });
        result.rows.forEach(r => {
          logger.debug('Reserva liberada', { reservation_number: r.reservation_number });
        });

        return {
          success: true,
          released: result.rows.length,
          reservations: result.rows
        };
      }

      await client.query('COMMIT');

      return {
        success: true,
        released: 0,
        reservations: []
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error en auto-release', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTUALIZAR RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async updateReservation(reservationId: string, data: UpdateReservationData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      ValidationService.validateUUID(reservationId);

      // Validar si se está actualizando fecha/hora futura
      if (data.reservation_date && data.reservation_time) {
        const futureDateError = ValidationService.validateFutureDate(data.reservation_date, data.reservation_time);
        if (futureDateError) {
          throw new Error(futureDateError);
        }
      }

      // Construir query dinámica
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.reservation_date) {
        updates.push(`reservation_date = $${paramCount++}');
        values.push(data.reservation_date);
      }

      if (data.reservation_time) {
        updates.push(`reservation_time = $${paramCount++}');
        values.push(data.reservation_time);
      }

      if (data.party_size) {
        ValidationService.validatePartySize(data.party_size);
        updates.push(`party_size = $${paramCount++}');
        values.push(data.party_size);
      }

      if (data.table_id) {
        ValidationService.validateUUID(data.table_id);
        updates.push(`table_id = $${paramCount++}');
        values.push(data.table_id);
      }

      if (data.special_requests !== undefined) {
        updates.push(`special_requests = $${paramCount++}');
        values.push(data.special_requests);
      }

      if (updates.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP');
      values.push(reservationId);

      const query = `
        UPDATE reservations
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
          AND status IN ('pending', 'confirmed')
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o no se puede modificar');
      }

      await client.query('COMMIT');

      logger.info('Reserva actualizada: ${result.rows[0].reservation_number}');
      return {
        success: true,
        reservation: result.rows[0],
        message: 'Reserva actualizada exitosamente'
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al actualizar reserva', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }
}
