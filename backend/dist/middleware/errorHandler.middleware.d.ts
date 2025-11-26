/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR HANDLER MIDDLEWARE
 * Middleware centralizado para manejo de errores
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Clase personalizada para errores HTTP
 */
export declare class HttpError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
/**
 * Middleware para manejar errores 404 (ruta no encontrada)
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware principal de manejo de errores
 * Debe ser el ÚLTIMO middleware en la cadena
 */
export declare const errorHandler: (err: Error | HttpError, req: Request, res: Response, next: NextFunction) => void;
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
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Errores HTTP predefinidos
 */
export declare class BadRequestError extends HttpError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends HttpError {
    constructor(message?: string);
}
export declare class ForbiddenError extends HttpError {
    constructor(message?: string);
}
export declare class NotFoundError extends HttpError {
    constructor(message?: string);
}
export declare class ConflictError extends HttpError {
    constructor(message?: string);
}
export declare class ValidationError extends HttpError {
    errors: any[];
    constructor(message?: string, errors?: any[]);
}
//# sourceMappingURL=errorHandler.middleware.d.ts.map