/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR HANDLER MIDDLEWARE
 * Middleware centralizado para manejo de errores
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Clase personalizada para errores HTTP
 */
export class HttpError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar errores 404 (ruta no encontrada)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError(`Ruta no encontrada: ${req.method} ${req.path}`, 404);
  next(error);
};

/**
 * Middleware principal de manejo de errores
 * Debe ser el ÚLTIMO middleware en la cadena
 */
export const errorHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log del error
  if (err instanceof HttpError && err.isOperational) {
    logger.warn('Operational error', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  } else {
    logger.error('Unexpected error', {
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
  const response: any = {
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
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Errores HTTP predefinidos
 */
export class BadRequestError extends HttpError {
  constructor(message: string = 'Solicitud incorrecta') {
    super(message, 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = 'Conflicto con el estado actual') {
    super(message, 409);
  }
}

export class ValidationError extends HttpError {
  errors: any[];

  constructor(message: string = 'Error de validación', errors: any[] = []) {
    super(message, 422);
    this.errors = errors;
  }
}
