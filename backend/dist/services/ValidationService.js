"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION SERVICE
 * Centraliza todas las validaciones críticas del sistema
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const ScheduleService_1 = require("./ScheduleService");
const CustomerService_1 = require("./CustomerService");
const logger_1 = require("../utils/logger");
class ValidationService {
    /**
     * VALIDACIÓN CRÍTICA 1: Horario (niveles 0, 5, 14)
     * Validar que el restaurante esté abierto
     */
    static async validateSchedule() {
        try {
            const result = await ScheduleService_1.ScheduleService.isOpenNow();
            if (!result.isOpen) {
                return {
                    isValid: false,
                    message: result.message || 'Restaurante cerrado en este momento'
                };
            }
            return { isValid: true };
        }
        catch (error) {
            logger_1.logger.error('Error validating schedule', error);
            return {
                isValid: false,
                message: 'Error al validar horario'
            };
        }
    }
    /**
     * VALIDACIÓN CRÍTICA 2: Teléfono normalizado
     * Exactamente 10 dígitos, sin +57
     */
    static validatePhone(phone) {
        try {
            const normalized = CustomerService_1.CustomerService.normalizePhone(phone);
            const isValid = CustomerService_1.CustomerService.isValidPhone(normalized);
            if (!isValid) {
                return {
                    isValid: false,
                    message: 'El teléfono debe tener exactamente 10 dígitos'
                };
            }
            return {
                isValid: true,
                normalized
            };
        }
        catch (error) {
            return {
                isValid: false,
                message: 'Teléfono inválido'
            };
        }
    }
    /**
     * VALIDACIÓN CRÍTICA 3: Email
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                isValid: false,
                message: 'Email inválido'
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN CRÍTICA 4: Precio (debe ser > 0)
     */
    static validatePrice(price) {
        if (price <= 0) {
            return {
                isValid: false,
                message: 'El precio debe ser mayor a 0'
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN CRÍTICA 5: Cantidad (debe ser > 0)
     */
    static validateQuantity(quantity) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return {
                isValid: false,
                message: 'La cantidad debe ser un número entero mayor a 0'
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN CRÍTICA 6: Máximo 3 direcciones por cliente
     */
    static validateAddresses(addresses) {
        const addressCount = [
            addresses.address_1,
            addresses.address_2,
            addresses.address_3
        ].filter(addr => addr && addr.trim() !== '').length;
        if (addressCount > 3) {
            return {
                isValid: false,
                message: 'Máximo 3 direcciones por cliente'
            };
        }
        if (!addresses.address_1 || addresses.address_1.trim() === '') {
            return {
                isValid: false,
                message: 'La dirección principal (address_1) es requerida'
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN CRÍTICA 7: Fecha de reserva
     * No puede ser en el pasado
     */
    static validateReservationDate(date) {
        const now = new Date();
        if (date < now) {
            return {
                isValid: false,
                message: 'La fecha de reserva no puede ser en el pasado'
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN CRÍTICA 8: Tamaño de grupo (party_size)
     * Debe ser entre 1 y capacidad máxima
     */
    static validatePartySize(size, maxCapacity = 20) {
        if (!Number.isInteger(size) || size <= 0) {
            return {
                isValid: false,
                message: 'El tamaño del grupo debe ser un número entero mayor a 0'
            };
        }
        if (size > maxCapacity) {
            return {
                isValid: false,
                message: `El tamaño máximo del grupo es ${maxCapacity} personas`
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN: UUID válido
     */
    static validateUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return {
                isValid: false,
                message: 'ID inválido'
            };
        }
        return { isValid: true };
    }
    /**
     * VALIDACIÓN: PIN de mesero (4-6 dígitos)
     */
    static validateWaiterPin(pin) {
        if (!/^\d{4,6}$/.test(pin)) {
            return {
                isValid: false,
                message: 'El PIN debe tener entre 4 y 6 dígitos'
            };
        }
        return { isValid: true };
    }
    /**
     * Validar múltiples campos a la vez
     */
    static validateAll(validations) {
        const errors = validations
            .filter(v => !v.isValid)
            .map(v => v.message || 'Error de validación')
            .filter((msg, index, arr) => arr.indexOf(msg) === index); // Únicos
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * NUEVA: Validar fecha futura (para reservas)
     */
    static validateFutureDate(date, time) {
        try {
            const reservationDateTime = new Date(`${date}T${time}`);
            const now = new Date();
            if (reservationDateTime <= now) {
                return 'La fecha y hora de reserva deben ser futuras';
            }
            return null;
        }
        catch (error) {
            return 'Fecha u hora inválida';
        }
    }
    /**
     * HELPER: Validar múltiples y retornar array de errores
     */
    static validateMultiple(validations) {
        return validations.filter(v => v !== null);
    }
}
exports.ValidationService = ValidationService;
//# sourceMappingURL=ValidationService.js.map