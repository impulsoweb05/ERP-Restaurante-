/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRON JOBS CONFIGURATION
 * Configuración de tareas programadas
 * ═══════════════════════════════════════════════════════════════════════════
 */

import cron from 'node-cron';
import { logger } from '../utils/logger';
import { ReservationService } from '../services/ReservationService';
import { query } from './database';

export class CronJobs {
  private static jobs: cron.ScheduledTask[] = [];

  /**
   * Inicializar todos los cron jobs
   */
  static initialize(): void {
    logger.info('🕒 Initializing cron jobs...');

    // Job 1: Auto-release de reservas expiradas (cada 5 minutos)
    this.scheduleReservationAutoRelease();

    // Job 2: Limpieza de sesiones expiradas (cada hora)
    this.scheduleSessionCleanup();

    // Job 3: Limpieza de notificaciones antiguas (diario a las 3 AM)
    this.scheduleNotificationCleanup();

    logger.info(`✅ ${this.jobs.length} cron jobs initialized`);
  }

  /**
   * Job 1: Auto-release de reservas expiradas
   * Ejecuta cada 5 minutos
   */
  private static scheduleReservationAutoRelease(): void {
    const job = cron.schedule('*/5 * * * *', async () => {
      try {
        logger.debug('Running reservation auto-release job...');
        const result = await ReservationService.autoReleaseExpiredReservations(15);

        if (result.released > 0) {
          logger.info('Reservations auto-released', {
            count: result.released,
            reservations: result.reservations?.map(r => r.reservation_number)
          });
        }
      } catch (error) {
        logger.error('Error in reservation auto-release job', error as Error);
      }
    });

    this.jobs.push(job);
    logger.info('✓ Reservation auto-release job scheduled (every 5 minutes)');
  }

  /**
   * Job 2: Limpieza de sesiones expiradas
   * Ejecuta cada hora
   */
  private static scheduleSessionCleanup(): void {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        logger.debug('Running session cleanup job...');

        // Eliminar sesiones expiradas hace más de 24 horas
        const result = await query(
          `DELETE FROM sessions
           WHERE expires_at < NOW() - INTERVAL '24 hours'
           RETURNING session_id`,
          []
        );

        if (result.rows.length > 0) {
          logger.info('Expired sessions cleaned', {
            count: result.rows.length
          });
        }
      } catch (error) {
        logger.error('Error in session cleanup job', error as Error);
      }
    });

    this.jobs.push(job);
    logger.info('✓ Session cleanup job scheduled (every hour)');
  }

  /**
   * Job 3: Limpieza de notificaciones antiguas
   * Ejecuta diariamente a las 3 AM
   */
  private static scheduleNotificationCleanup(): void {
    const job = cron.schedule('0 3 * * *', async () => {
      try {
        logger.debug('Running notification cleanup job...');

        // Eliminar notificaciones enviadas hace más de 30 días
        const result = await query(
          `DELETE FROM notifications
           WHERE status = 'sent'
           AND sent_at < NOW() - INTERVAL '30 days'
           RETURNING id`,
          []
        );

        if (result.rows.length > 0) {
          logger.info('Old notifications cleaned', {
            count: result.rows.length
          });
        }

        // Eliminar notificaciones fallidas hace más de 7 días
        const failedResult = await query(
          `DELETE FROM notifications
           WHERE status = 'failed'
           AND created_at < NOW() - INTERVAL '7 days'
           RETURNING id`,
          []
        );

        if (failedResult.rows.length > 0) {
          logger.info('Failed notifications cleaned', {
            count: failedResult.rows.length
          });
        }
      } catch (error) {
        logger.error('Error in notification cleanup job', error as Error);
      }
    });

    this.jobs.push(job);
    logger.info('✓ Notification cleanup job scheduled (daily at 3 AM)');
  }

  /**
   * Detener todos los cron jobs
   */
  static stopAll(): void {
    logger.info('🛑 Stopping all cron jobs...');

    this.jobs.forEach(job => {
      job.stop();
    });

    this.jobs = [];
    logger.info('✅ All cron jobs stopped');
  }

  /**
   * Obtener estado de los jobs
   */
  static getStatus(): {
    totalJobs: number;
    jobs: Array<{
      name: string;
      schedule: string;
      status: string;
    }>;
  } {
    return {
      totalJobs: this.jobs.length,
      jobs: [
        {
          name: 'Reservation Auto-Release',
          schedule: 'Every 5 minutes',
          status: 'active'
        },
        {
          name: 'Session Cleanup',
          schedule: 'Every hour',
          status: 'active'
        },
        {
          name: 'Notification Cleanup',
          schedule: 'Daily at 3 AM',
          status: 'active'
        }
      ]
    };
  }
}
