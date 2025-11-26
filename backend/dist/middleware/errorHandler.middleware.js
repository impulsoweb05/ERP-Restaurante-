"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR HANDLER MIDDLEWARE
 * Middleware centralizado para manejo de errores
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.asyncHandler = exports.errorHandler = exports.notFoundHandler = exports.HttpError = void 0;
const logger_1 = require("../utils/logger");
/**
 * Clase personalizada para errores HTTP
 */
class HttpError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpError = HttpError;
/**
 * Middleware para manejar errores 404 (ruta no encontrada)
 */
const notFoundHandler = (req, res, next) => {
    const error = new HttpError(`Ruta no encontrada: ${req.method} ${req.path}`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Middleware principal de manejo de errores
 * Debe ser el ÚLTIMO middleware en la cadena
 */
const errorHandler = (err, req, res, next) => {
    // Log del error
    if (err instanceof HttpError && err.isOperational) {
        logger_1.logger.warn('Operational error', {
            message: err.message,
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
            ip: req.ip
        });
    }
    else {
        logger_1.logger.error('Unexpected error', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            body: req.body,
            ip: req.ip
        });
    }
    // Determinar código de estado
    const statusCode = err instanceof HttpError ? err.statusCode : 500;
    // Preparar respuesta
    const response = {
        success: false,
        message: err.message || 'Error interno del servidor'
    };
    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.type = err.constructor.name;
    }
    // Enviar respuesta
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
/**
 * Middleware para atrapar errores asíncronos
 * Wrapper para funciones async en routes
 *
 * @example
 * router.get('/api/orders', asyncHandler(async (req, res) => {
 *   const orders = await OrderService.getAll();
 *   res.json(orders);
 * }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Errores HTTP predefinidos
 */
class BadRequestError extends HttpError {
    constructor(message = 'Solicitud incorrecta') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message = 'Acceso prohibido') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends HttpError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends HttpError {
    constructor(message = 'Conflicto con el estado actual') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends HttpError {
    constructor(message = 'Error de validación', errors = []) {
        super(message, 422);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errorHandler.middleware.js.map