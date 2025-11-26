"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE DE MANEJO DE ERRORES
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.Errors = exports.AppError = void 0;
const logger_1 = require("@utils/logger");
/**
 * Clase personalizada para errores de API
 */
class AppError extends Error {
    constructor(code, statusCode, message, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/**
 * Errores comunes
 */
exports.Errors = {
    UNAUTHORIZED: new AppError('UNAUTHORIZED', 401, 'Unauthorized access'),
    FORBIDDEN: new AppError('FORBIDDEN', 403, 'Forbidden resource'),
    NOT_FOUND: (resource) => new AppError('NOT_FOUND', 404, `${resource} not found`),
    VALIDATION_ERROR: (message, details) => new AppError('VALIDATION_ERROR', 400, message, details),
    DUPLICATE_ENTRY: (field) => new AppError('DUPLICATE_ENTRY', 409, `${field} already exists`),
    BUSINESS_LOGIC_ERROR: (message, details) => new AppError('BUSINESS_LOGIC_ERROR', 400, message, details),
    INTERNAL_SERVER_ERROR: new AppError('INTERNAL_SERVER_ERROR', 500, 'Internal server error'),
    EXTERNAL_SERVICE_ERROR: (service) => new AppError('EXTERNAL_SERVICE_ERROR', 503, `${service} service unavailable`),
};
/**
 * Middleware: Capturar errores y responder
 */
const errorHandler = (error, _req, res, _next) => {
    logger_1.logger.error('Error caught by error handler', error);
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            code: error.code,
            message: error.message,
            ...(error.details && { details: error.details }),
        });
        return;
    }
    // Errores no controlados
    res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
    });
};
exports.errorHandler = errorHandler;
/**
 * Wrapper para async routes (Express no captura Promise rejections automáticamente)
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map