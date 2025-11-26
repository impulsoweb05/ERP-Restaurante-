/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE DE VALIDACIÓN
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@types';
/**
 * Middleware: Procesar errores de validación
 */
export declare const handleValidationErrors: (req: RequestWithUser, res: Response, next: NextFunction) => void;
/**
 * Utilidades de validación
 */
export declare const ValidationUtils: {
    /**
     * Validar teléfono colombiano (10 dígitos)
     */
    isValidPhone: (phone: string) => boolean;
    /**
     * Normalizar teléfono a 10 dígitos
     */
    normalizePhone: (phone: string) => string;
    /**
     * Validar UUID v4
     */
    isValidUUID: (uuid: string) => boolean;
    /**
     * Validar email
     */
    isValidEmail: (email: string) => boolean;
    /**
     * Validar PIN (4 dígitos numéricos)
     */
    isValidPIN: (pin: string) => boolean;
    /**
     * Validar cantidad (número positivo entero)
     */
    isValidQuantity: (qty: number) => boolean;
    /**
     * Validar precio (número decimal positivo)
     */
    isValidPrice: (price: number) => boolean;
    /**
     * Validar fecha en formato YYYY-MM-DD
     */
    isValidDate: (date: string) => boolean;
    /**
     * Validar hora en formato HH:MM
     */
    isValidTime: (time: string) => boolean;
    /**
     * Validar que la fecha y hora no esté en el pasado
     */
    isNotInPast: (date: string, time: string) => boolean;
    /**
     * Validar horario de restaurante
     */
    isWithinBusinessHours: (date: string, time: string, openingTime: string, closingTime: string) => boolean;
};
//# sourceMappingURL=validation.d.ts.map