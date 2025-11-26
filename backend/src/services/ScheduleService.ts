/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULE SERVICE
 * Servicio para validación de horarios (VALIDACIÓN CRÍTICA del documento)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { query } from '../config/database';
import { Schedule, DayOfWeek } from '../types';
import { logger } from '../utils/logger';

export class ScheduleService {
  /**
   * Validar si el restaurante está abierto en el momento actual
   * CRÍTICO: Se usa en niveles 0, 5 y 14 del chat
   */
  static async isOpenNow(): Promise<{ isOpen: boolean; message?: string; schedule?: Schedule }> {
    try {
      const now = new Date();

      // Obtener día de la semana
      const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = daysOfWeek[now.getDay()] as DayOfWeek;

      // Buscar schedule del día
      const result = await query(
        `SELECT * FROM schedules WHERE day_of_week = $1`,
        [dayOfWeek]
      );

      if (result.rows.length === 0) {
        return {
          isOpen: false,
          message: `No hay horario configurado para ${dayOfWeek}`
        };
      }

      const schedule = result.rows[0];

      // Si el día está marcado como cerrado
      if (!schedule.is_open) {
        return {
          isOpen: false,
          message: schedule.special_note || `Cerrado los ${dayOfWeek.toLowerCase()}`,
          schedule
        };
      }

      // Obtener hora actual en formato HH:MM:SS
      const currentTime = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

      // Comparar con opening_time y closing_time
      const isWithinHours = currentTime >= schedule.opening_time && currentTime <= schedule.closing_time;

      if (!isWithinHours) {
        return {
          isOpen: false,
          message: `Abrimos de ${schedule.opening_time} a ${schedule.closing_time}`,
          schedule
        };
      }

      return {
        isOpen: true,
        schedule
      };
    } catch (error) {
      logger.error('Error validating schedule', error as Error);
      throw new Error('Failed to validate schedule');
    }
  }

  /**
   * Obtener todos los horarios de la semana
   */
  static async getAllSchedules(): Promise<Schedule[]> {
    try {
      const result = await query(
        `SELECT * FROM schedules ORDER BY
         CASE day_of_week
           WHEN 'MONDAY' THEN 1
           WHEN 'TUESDAY' THEN 2
           WHEN 'WEDNESDAY' THEN 3
           WHEN 'THURSDAY' THEN 4
           WHEN 'FRIDAY' THEN 5
           WHEN 'SATURDAY' THEN 6
           WHEN 'SUNDAY' THEN 7
         END`
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching schedules', error as Error);
      throw new Error('Failed to fetch schedules');
    }
  }

  /**
   * Obtener horario de un día específico
   */
  static async getScheduleByDay(dayOfWeek: DayOfWeek): Promise<Schedule | null> {
    try {
      const result = await query(
        `SELECT * FROM schedules WHERE day_of_week = $1`,
        [dayOfWeek]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching schedule by day', error as Error);
      throw new Error('Failed to fetch schedule');
    }
  }

  /**
   * Validar si una fecha/hora específica está dentro del horario
   */
  static async isOpenAt(date: Date): Promise<{ isOpen: boolean; message?: string }> {
    try {
      const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = daysOfWeek[date.getDay()] as DayOfWeek;

      const result = await query(
        `SELECT * FROM schedules WHERE day_of_week = $1`,
        [dayOfWeek]
      );

      if (result.rows.length === 0 || !result.rows[0].is_open) {
        return {
          isOpen: false,
          message: 'Cerrado en esta fecha'
        };
      }

      const schedule = result.rows[0];
      const time = date.toTimeString().split(' ')[0];
      const isWithinHours = time >= schedule.opening_time && time <= schedule.closing_time;

      return {
        isOpen: isWithinHours,
        message: isWithinHours ? undefined : `Abrimos de ${schedule.opening_time} a ${schedule.closing_time}`
      };
    } catch (error) {
      logger.error('Error validating schedule at specific time', error as Error);
      throw new Error('Failed to validate schedule');
    }
  }
}
