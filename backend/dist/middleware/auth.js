"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ═══════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSessionId = exports.requireRole = exports.authenticateOptional = exports.authenticate = exports.generateToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("@utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
/**
 * Verificar y decodificar JWT
 */
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        logger_1.logger.debug('Token verification failed', { error: String(error) });
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Generar JWT
 */
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
};
exports.generateToken = generateToken;
/**
 * Middleware: Verificar JWT en headers
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                code: 'UNAUTHORIZED',
                message: 'Missing or invalid authorization header',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        const payload = (0, exports.verifyToken)(token);
        if (!payload) {
            res.status(401).json({
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token',
            });
            return;
        }
        req.user = payload;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication middleware error', error);
        res.status(500).json({
            code: 'AUTH_ERROR',
            message: 'Authentication failed',
        });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware: Verificar JWT opcional (para rutas públicas)
 */
const authenticateOptional = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = (0, exports.verifyToken)(token);
            if (payload) {
                req.user = payload;
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Optional authentication middleware error', error);
        next(); // Continue even if authentication fails
    }
};
exports.authenticateOptional = authenticateOptional;
/**
 * Middleware: Requerir rol específico
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                code: 'UNAUTHORIZED',
                message: 'User not authenticated',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.type)) {
            res.status(403).json({
                code: 'FORBIDDEN',
                message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware: Validar session ID (para clientes)
 */
const validateSessionId = (req, res, next) => {
    try {
        const sessionId = req.headers['x-session-id'];
        if (!sessionId) {
            res.status(400).json({
                code: 'MISSING_SESSION_ID',
                message: 'x-session-id header is required',
            });
            return;
        }
        req.sessionId = sessionId;
        next();
    }
    catch (error) {
        logger_1.logger.error('Session validation middleware error', error);
        res.status(500).json({
            code: 'SESSION_ERROR',
            message: 'Session validation failed',
        });
    }
};
exports.validateSessionId = validateSessionId;
//# sourceMappingURL=auth.js.map