"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE - Verificación de JWT
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.isOwnerOrAdmin = exports.isWaiterOrAdmin = exports.isCustomer = exports.isWaiter = exports.isAdmin = exports.authenticate = void 0;
const AuthService_1 = require("@services/AuthService");
const logger_1 = require("../utils/logger");
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar autenticación (JWT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const authenticate = async (req, res, next) => {
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
        const decoded = await AuthService_1.AuthService.verifyToken(token);
        // 4. Agregar datos del usuario al request
        req.user = {
            id: decoded.id,
            role: decoded.role,
            phone: decoded.phone,
            waiter_code: decoded.waiter_code
        };
        // 5. Continuar
        next();
    }
    catch (error) {
        logger_1.logger.error('Error en middleware de autenticación', error);
        return res.status(401).json({
            success: false,
            error: 'Error de autenticación'
        });
    }
};
exports.authenticate = authenticate;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isAdmin = (req, res, next) => {
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
exports.isAdmin = isAdmin;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol WAITER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isWaiter = (req, res, next) => {
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
exports.isWaiter = isWaiter;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol CUSTOMER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isCustomer = (req, res, next) => {
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
exports.isCustomer = isCustomer;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar rol WAITER o ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isWaiterOrAdmin = (req, res, next) => {
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
exports.isWaiterOrAdmin = isWaiterOrAdmin;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Verificar que el usuario es propietario del recurso
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const isOwnerOrAdmin = (resourceIdParam = 'id') => {
    return (req, res, next) => {
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
exports.isOwnerOrAdmin = isOwnerOrAdmin;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Autenticación OPCIONAL (no bloquea si no hay token)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const optionalAuth = async (req, res, next) => {
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
                const decoded = await AuthService_1.AuthService.verifyToken(token);
                req.user = {
                    id: decoded.id,
                    role: decoded.role,
                    phone: decoded.phone,
                    waiter_code: decoded.waiter_code
                };
            }
            catch (error) {
                // Ignorar error, continuar sin autenticar
            }
        }
        next();
    }
    catch (error) {
        // Si hay error, continuamos sin autenticar
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map