/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Response, NextFunction } from 'express';
import { RequestWithUser, JWTPayload } from '@types';
/**
 * Verificar y decodificar JWT
 */
export declare const verifyToken: (token: string) => JWTPayload | null;
/**
 * Generar JWT
 */
export declare const generateToken: (payload: Omit<JWTPayload, "iat" | "exp">) => string;
/**
 * Middleware: Verificar JWT en headers
 */
export declare const authenticate: (req: RequestWithUser, res: Response, next: NextFunction) => void;
/**
 * Middleware: Verificar JWT opcional (para rutas públicas)
 */
export declare const authenticateOptional: (req: RequestWithUser, res: Response, next: NextFunction) => void;
/**
 * Middleware: Requerir rol específico
 */
export declare const requireRole: (allowedRoles: string[]) => (req: RequestWithUser, res: Response, next: NextFunction) => void;
/**
 * Middleware: Validar session ID (para clientes)
 */
export declare const validateSessionId: (req: RequestWithUser, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map