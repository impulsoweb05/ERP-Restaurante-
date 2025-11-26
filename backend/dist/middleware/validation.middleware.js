"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION MIDDLEWARE
 * Middleware para validación de requests con express-validator
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
/**
 * Middleware que ejecuta validaciones y retorna errores si existen
 */
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.type === 'field' ? err.path : 'unknown',
            message: err.msg
        }));
        logger_1.logger.warn('Validation errors', {
            path: req.path,
            method: req.method,
            errors: errorMessages
        });
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errorMessages
        });
    }
    next();
};
exports.validateRequest = validateRequest;
/**
 * Helper para encadenar validaciones + middleware de validación
 *
 * @example
 * router.post('/api/orders',
 *   validate([
 *     body('customer_id').isUUID(),
 *     body('order_type').isIn(['delivery', 'dine_in', 'takeout'])
 *   ]),
 *   OrderController.create
 * );
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Ejecutar todas las validaciones
        for (const validation of validations) {
            await validation.run(req);
        }
        // Verificar resultados
        return (0, exports.validateRequest)(req, res, next);
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map