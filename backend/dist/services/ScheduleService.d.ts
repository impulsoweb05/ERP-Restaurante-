/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULE SERVICE
 * Servicio para validación de horarios (VALIDACIÓN CRÍTICA del documento)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Schedule, DayOfWeek } from '../types';
export declare class ScheduleService {
    /**
     * Validar si el restaurante está abierto en el momento actual
     * CRÍTICO: Se usa en niveles 0, 5 y 14 del chat
     */
    static isOpenNow(): Promise<{
        isOpen: boolean;
        message?: string;
        schedule?: Schedule;
    }>;
    /**
     * Obtener todos los horarios de la semana
     */
    static getAllSchedules(): Promise<Schedule[]>;
    /**
     * Obtener horario de un día específico
     */
    static getScheduleByDay(dayOfWeek: DayOfWeek): Promise<Schedule | null>;
    /**
     * Validar si una fecha/hora específica está dentro del horario
     */
    static isOpenAt(date: Date): Promise<{
        isOpen: boolean;
        message?: string;
    }>;
}
//# sourceMappingURL=ScheduleService.d.ts.map