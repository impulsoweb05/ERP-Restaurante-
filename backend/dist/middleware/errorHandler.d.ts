/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE DE MANEJO DE ERRORES
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@types';
/**
 * Clase personalizada para errores de API
 */
export declare class AppError extends Error {
    code: string;
    statusCode: number;
    details?: Record<string, any> | undefined;
    constructor(code: string, statusCode: number, message: string, details?: Record<string, any> | undefined);
}
/**
 * Errores comunes
 */
export declare const Errors: {
    UNAUTHORIZED: AppError;
    FORBIDDEN: AppError;
    NOT_FOUND: (resource: string) => AppError;
    VALIDATION_ERROR: (message: string, details?: Record<string, any>) => AppError;
    DUPLICATE_ENTRY: (field: string) => AppError;
    BUSINESS_LOGIC_ERROR: (message: string, details?: Record<string, any>) => AppError;
    INTERNAL_SERVER_ERROR: AppError;
    EXTERNAL_SERVICE_ERROR: (service: string) => AppError;
};
/**
 * Middleware: Capturar errores y responder
 */
export declare const errorHandler: (error: Error | AppError, _req: RequestWithUser, res: Response, _next: NextFunction) => void;
/**
 * Wrapper para async routes (Express no captura Promise rejections automáticamente)
 */
export declare const asyncHandler: (fn: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>) => (req: RequestWithUser, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map