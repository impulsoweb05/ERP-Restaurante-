"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE DE VALIDACIÓN
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("@utils/logger");
/**
 * Middleware: Procesar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        logger_1.logger.warn('Validation errors', {
            path: req.path,
            errors: errors.array(),
        });
        res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array().reduce((acc, err) => {
                acc[err.param] = err.msg;
                return acc;
            }, {}),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
/**
 * Utilidades de validación
 */
exports.ValidationUtils = {
    /**
     * Validar teléfono colombiano (10 dígitos)
     */
    isValidPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        // Remover prefijo +57 si existe
        const normalized = cleaned.startsWith('57') ? cleaned.slice(2) : cleaned;
        return /^\d{10}$/.test(normalized);
    },
    /**
     * Normalizar teléfono a 10 dígitos
     */
    normalizePhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const normalized = cleaned.startsWith('57') ? cleaned.slice(2) : cleaned;
        return normalized.slice(-10); // Últimos 10 dígitos
    },
    /**
     * Validar UUID v4
     */
    isValidUUID: (uuid) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    },
    /**
     * Validar email
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    /**
     * Validar PIN (4 dígitos numéricos)
     */
    isValidPIN: (pin) => {
        return /^\d{4}$/.test(pin);
    },
    /**
     * Validar cantidad (número positivo entero)
     */
    isValidQuantity: (qty) => {
        return Number.isInteger(qty) && qty > 0;
    },
    /**
     * Validar precio (número decimal positivo)
     */
    isValidPrice: (price) => {
        return typeof price === 'number' && price > 0 && Number.isFinite(price);
    },
    /**
     * Validar fecha en formato YYYY-MM-DD
     */
    isValidDate: (date) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date))
            return false;
        const parsed = new Date(date + 'T00:00:00Z');
        return parsed instanceof Date && !isNaN(parsed.getTime());
    },
    /**
     * Validar hora en formato HH:MM
     */
    isValidTime: (time) => {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return timeRegex.test(time);
    },
    /**
     * Validar que la fecha y hora no esté en el pasado
     */
    isNotInPast: (date, time) => {
        const now = new Date();
        const target = new Date(`${date}T${time}:00`);
        return target > now;
    },
    /**
     * Validar horario de restaurante
     */
    isWithinBusinessHours: (date, time, openingTime, closingTime) => {
        const [reqHour, reqMin] = time.split(':').map(Number);
        const [openHour, openMin] = openingTime.split(':').map(Number);
        const [closeHour, closeMin] = closingTime.split(':').map(Number);
        const reqTimeMinutes = reqHour * 60 + reqMin;
        const openTimeMinutes = openHour * 60 + openMin;
        const closeTimeMinutes = closeHour * 60 + closeMin;
        return reqTimeMinutes >= openTimeMinutes && reqTimeMinutes <= closeTimeMinutes;
    },
};
//# sourceMappingURL=validation.js.map