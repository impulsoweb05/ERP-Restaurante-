/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION MIDDLEWARE
 * Middleware para validación de requests con express-validator
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware que ejecuta validaciones y retorna errores si existen
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? (err as any).path : 'unknown',
      message: err.msg
    }));

    logger.warn('Validation errors', {
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
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ejecutar todas las validaciones
    for (const validation of validations) {
      await validation.run(req);
    }

    // Verificar resultados
    return validateRequest(req, res, next);
  };
};
