/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT ROUTES
 * Endpoints para el Widget Chat y State Machine
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { processMessage } from '../state-machine/dispatcher';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

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
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { session_id, message, phone } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El campo "message" es requerido'
      });
    }

    // Generar session_id si no existe
    const sessionId = session_id || uuidv4();

    logger.info('Chat message received', {
      sessionId,
      messageLength: message.length,
      hasPhone: !!phone
    });

    // Procesar mensaje en State Machine
    const response = await processMessage(sessionId, message, phone);

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
  } catch (error) {
    logger.error('Error processing chat message', error as Error);

    return res.status(500).json({
      success: false,
      message: 'Error al procesar mensaje',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/chat/session/:session_id
 * Obtener información de una sesión
 */
router.get('/session/:session_id', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;

    const { SessionService } = await import('../services/SessionService');
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
  } catch (error) {
    logger.error('Error getting session', error as Error);

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
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'session_id es requerido'
      });
    }

    const { SessionService } = await import('../services/SessionService');
    const session = await SessionService.updateLevel(session_id, 0);

    return res.status(200).json({
      success: true,
      message: 'Sesión reseteada',
      data: { session_id: session.session_id }
    });
  } catch (error) {
    logger.error('Error resetting session', error as Error);

    return res.status(500).json({
      success: false,
      message: 'Error al resetear sesión'
    });
  }
});

export default router;
