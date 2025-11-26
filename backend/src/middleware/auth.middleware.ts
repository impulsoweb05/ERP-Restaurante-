// ═════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE - Verificación de JWT
// ═════════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@services/AuthService';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'customer' | 'waiter' | 'admin';
        phone?: string;
        waiter_code?: string;
      };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar autenticación (JWT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    // 2. Verificar formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // 3. Verificar token
    const decoded = await AuthService.verifyToken(token);

    // 4. Agregar datos del usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role as 'customer' | 'waiter' | 'admin',
      phone: decoded.phone,
      waiter_code: decoded.waiter_code
    };

    // 5. Continuar
    next();

  } catch (error: any) {
    console.error('❌ Error en middleware de autenticación:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere rol de administrador'
    });
  }

  next();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol WAITER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isWaiter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'waiter' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere rol de mesero'
    });
  }

  next();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol CUSTOMER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'customer' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere rol de cliente'
    });
  }

  next();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol WAITER o ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isWaiterOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'waiter' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Se requiere rol de mesero o administrador'
    });
  }

  next();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar que el usuario es propietario del recurso
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isOwnerOrAdmin = (resourceIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    // Admin puede acceder a todo
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar que el recurso pertenece al usuario
    const resourceId = req.params[resourceIdParam];
    if (resourceId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado: No eres propietario de este recurso'
      });
    }

    next();
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Autenticación OPCIONAL (no bloquea si no hay token)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No hay token, pero continuamos sin error
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      try {
        const decoded = await AuthService.verifyToken(token);
        req.user = {
          id: decoded.id,
          role: decoded.role as 'customer' | 'waiter' | 'admin',
          phone: decoded.phone,
          waiter_code: decoded.waiter_code
        };
      } catch (error) {
        // Ignorar error, continuar sin autenticar
      }
    }

    next();

  } catch (error: any) {
    // Si hay error, continuamos sin autenticar
    next();
  }
};
