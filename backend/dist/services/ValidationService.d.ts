/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION SERVICE
 * Centraliza todas las validaciones críticas del sistema
 * ═══════════════════════════════════════════════════════════════════════════
 */
export declare class ValidationService {
    /**
     * VALIDACIÓN CRÍTICA 1: Horario (niveles 0, 5, 14)
     * Validar que el restaurante esté abierto
     */
    static validateSchedule(): Promise<{
        isValid: boolean;
        message?: string;
    }>;
    /**
     * VALIDACIÓN CRÍTICA 2: Teléfono normalizado
     * Exactamente 10 dígitos, sin +57
     */
    static validatePhone(phone: string): {
        isValid: boolean;
        normalized?: string;
        message?: string;
    };
    /**
     * VALIDACIÓN CRÍTICA 3: Email
     */
    static validateEmail(email: string): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN CRÍTICA 4: Precio (debe ser > 0)
     */
    static validatePrice(price: number): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN CRÍTICA 5: Cantidad (debe ser > 0)
     */
    static validateQuantity(quantity: number): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN CRÍTICA 6: Máximo 3 direcciones por cliente
     */
    static validateAddresses(addresses: {
        address_1?: string;
        address_2?: string;
        address_3?: string;
    }): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN CRÍTICA 7: Fecha de reserva
     * No puede ser en el pasado
     */
    static validateReservationDate(date: Date): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN CRÍTICA 8: Tamaño de grupo (party_size)
     * Debe ser entre 1 y capacidad máxima
     */
    static validatePartySize(size: number, maxCapacity?: number): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN: UUID válido
     */
    static validateUUID(uuid: string): {
        isValid: boolean;
        message?: string;
    };
    /**
     * VALIDACIÓN: PIN de mesero (4-6 dígitos)
     */
    static validateWaiterPin(pin: string): {
        isValid: boolean;
        message?: string;
    };
    /**
     * Validar múltiples campos a la vez
     */
    static validateAll(validations: Array<{
        isValid: boolean;
        message?: string;
    }>): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * NUEVA: Validar fecha futura (para reservas)
     */
    static validateFutureDate(date: string, time: string): string | null;
    /**
     * HELPER: Validar múltiples y retornar array de errores
     */
    static validateMultiple(validations: Array<string | null>): string[];
}
//# sourceMappingURL=ValidationService.d.ts.map