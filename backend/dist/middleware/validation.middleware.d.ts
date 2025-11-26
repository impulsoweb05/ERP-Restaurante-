/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION MIDDLEWARE
 * Middleware para validación de requests con express-validator
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Middleware que ejecuta validaciones y retorna errores si existen
 */
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
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
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=validation.middleware.d.ts.map