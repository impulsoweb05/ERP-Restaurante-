"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRON JOBS CONFIGURATION
 * Configuración de tareas programadas
 * ═══════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../utils/logger");
const ReservationService_1 = require("../services/ReservationService");
const database_1 = require("./database");
class CronJobs {
    /**
     * Inicializar todos los cron jobs
     */
    static initialize() {
        logger_1.logger.info('🕒 Initializing cron jobs...');
        // Job 1: Auto-release de reservas expiradas (cada 5 minutos)
        this.scheduleReservationAutoRelease();
        // Job 2: Limpieza de sesiones expiradas (cada hora)
        this.scheduleSessionCleanup();
        // Job 3: Limpieza de notificaciones antiguas (diario a las 3 AM)
        this.scheduleNotificationCleanup();
        logger_1.logger.info(`✅ ${this.jobs.length} cron jobs initialized`);
    }
    /**
     * Job 1: Auto-release de reservas expiradas
     * Ejecuta cada 5 minutos
     */
    static scheduleReservationAutoRelease() {
        const job = node_cron_1.default.schedule('*/5 * * * *', async () => {
            try {
                logger_1.logger.debug('Running reservation auto-release job...');
                const result = await ReservationService_1.ReservationService.autoReleaseExpiredReservations(15);
                if (result.released > 0) {
                    logger_1.logger.info('Reservations auto-released', {
                        count: result.released,
                        reservations: result.reservations?.map(r => r.reservation_number)
                    });
                }
            }
            catch (error) {
                logger_1.logger.error('Error in reservation auto-release job', error);
            }
        });
        this.jobs.push(job);
        logger_1.logger.info('✓ Reservation auto-release job scheduled (every 5 minutes)');
    }
    /**
     * Job 2: Limpieza de sesiones expiradas
     * Ejecuta cada hora
     */
    static scheduleSessionCleanup() {
        const job = node_cron_1.default.schedule('0 * * * *', async () => {
            try {
                logger_1.logger.debug('Running session cleanup job...');
                // Eliminar sesiones expiradas hace más de 24 horas
                const result = await (0, database_1.query)(`DELETE FROM sessions
           WHERE expires_at < NOW() - INTERVAL '24 hours'
           RETURNING session_id`, []);
                if (result.rows.length > 0) {
                    logger_1.logger.info('Expired sessions cleaned', {
                        count: result.rows.length
                    });
                }
            }
            catch (error) {
                logger_1.logger.error('Error in session cleanup job', error);
            }
        });
        this.jobs.push(job);
        logger_1.logger.info('✓ Session cleanup job scheduled (every hour)');
    }
    /**
     * Job 3: Limpieza de notificaciones antiguas
     * Ejecuta diariamente a las 3 AM
     */
    static scheduleNotificationCleanup() {
        const job = node_cron_1.default.schedule('0 3 * * *', async () => {
            try {
                logger_1.logger.debug('Running notification cleanup job...');
                // Eliminar notificaciones enviadas hace más de 30 días
                const result = await (0, database_1.query)(`DELETE FROM notifications
           WHERE status = 'sent'
           AND sent_at < NOW() - INTERVAL '30 days'
           RETURNING id`, []);
                if (result.rows.length > 0) {
                    logger_1.logger.info('Old notifications cleaned', {
                        count: result.rows.length
                    });
                }
                // Eliminar notificaciones fallidas hace más de 7 días
                const failedResult = await (0, database_1.query)(`DELETE FROM notifications
           WHERE status = 'failed'
           AND created_at < NOW() - INTERVAL '7 days'
           RETURNING id`, []);
                if (failedResult.rows.length > 0) {
                    logger_1.logger.info('Failed notifications cleaned', {
                        count: failedResult.rows.length
                    });
                }
            }
            catch (error) {
                logger_1.logger.error('Error in notification cleanup job', error);
            }
        });
        this.jobs.push(job);
        logger_1.logger.info('✓ Notification cleanup job scheduled (daily at 3 AM)');
    }
    /**
     * Detener todos los cron jobs
     */
    static stopAll() {
        logger_1.logger.info('🛑 Stopping all cron jobs...');
        this.jobs.forEach(job => {
            job.stop();
        });
        this.jobs = [];
        logger_1.logger.info('✅ All cron jobs stopped');
    }
    /**
     * Obtener estado de los jobs
     */
    static getStatus() {
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
exports.CronJobs = CronJobs;
CronJobs.jobs = [];
//# sourceMappingURL=cron.js.map