"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT ROUTES
 * Endpoints para el Widget Chat y State Machine
 * ═══════════════════════════════════════════════════════════════════════════
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dispatcher_1 = require("../state-machine/dispatcher");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
/**
 * POST /api/chat/message
 * Procesar mensaje del usuario en la State Machine
 *
 * Body:
 * {
 *   session_id?: string,  // Opcional, se genera si no existe
 *   message: string,       // Mensaje del usuario
 *   phone?: string         // Opcional, para inicio de sesión
 * }
 */
router.post('/message', async (req, res) => {
    try {
        const { session_id, message, phone } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'El campo "message" es requerido'
            });
        }
        // Generar session_id si no existe
        const sessionId = session_id || (0, uuid_1.v4)();
        logger_1.logger.info('Chat message received', {
            sessionId,
            messageLength: message.length,
            hasPhone: !!phone
        });
        // Procesar mensaje en State Machine
        const response = await (0, dispatcher_1.processMessage)(sessionId, message, phone);
        return res.status(200).json({
            success: true,
            data: {
                session_id: sessionId,
                message: response.message,
                options: response.options,
                current_level: response.session.current_level,
                metadata: response.data
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error processing chat message', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar mensaje',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
/**
 * GET /api/chat/session/:session_id
 * Obtener información de una sesión
 */
router.get('/session/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        const { SessionService } = await Promise.resolve().then(() => __importStar(require('../services/SessionService')));
        const session = await SessionService.getOrCreateSession(session_id);
        return res.status(200).json({
            success: true,
            data: {
                session_id: session.session_id,
                current_level: session.current_level,
                is_registered: session.is_registered,
                customer_id: session.customer_id,
                phone: session.phone
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting session', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener sesión'
        });
    }
});
/**
 * POST /api/chat/reset
 * Resetear sesión a nivel 0
 */
router.post('/reset', async (req, res) => {
    try {
        const { session_id } = req.body;
        if (!session_id) {
            return res.status(400).json({
                success: false,
                message: 'session_id es requerido'
            });
        }
        const { SessionService } = await Promise.resolve().then(() => __importStar(require('../services/SessionService')));
        const session = await SessionService.updateLevel(session_id, 0);
        return res.status(200).json({
            success: true,
            message: 'Sesión reseteada',
            data: { session_id: session.session_id }
        });
    }
    catch (error) {
        logger_1.logger.error('Error resetting session', error);
        return res.status(500).json({
            success: false,
            message: 'Error al resetear sesión'
        });
    }
});
exports.default = router;
//# sourceMappingURL=chat.routes.js.map