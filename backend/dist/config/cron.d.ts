/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRON JOBS CONFIGURATION
 * Configuración de tareas programadas
 * ═══════════════════════════════════════════════════════════════════════════
 */
export declare class CronJobs {
    private static jobs;
    /**
     * Inicializar todos los cron jobs
     */
    static initialize(): void;
    /**
     * Job 1: Auto-release de reservas expiradas
     * Ejecuta cada 5 minutos
     */
    private static scheduleReservationAutoRelease;
    /**
     * Job 2: Limpieza de sesiones expiradas
     * Ejecuta cada hora
     */
    private static scheduleSessionCleanup;
    /**
     * Job 3: Limpieza de notificaciones antiguas
     * Ejecuta diariamente a las 3 AM
     */
    private static scheduleNotificationCleanup;
    /**
     * Detener todos los cron jobs
     */
    static stopAll(): void;
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
    };
}
//# sourceMappingURL=cron.d.ts.map