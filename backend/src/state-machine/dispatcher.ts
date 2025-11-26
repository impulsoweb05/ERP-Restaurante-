/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE MACHINE DISPATCHER
 * Router principal que distribuye mensajes a los niveles correspondientes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Session } from '../types';
import { SessionService } from '../services/SessionService';
import { logger } from '../utils/logger';
import { handleLevel0 } from './levels/level-0';
import { handleLevel1 } from './levels/level-1';
import { handleLevel2, handleLevel3, handleLevel4 } from './levels/level-2-3-4';
import { handleLevel5 } from './levels/level-5';
import { handleLevel6 } from './levels/level-6';
import { handleLevel7to13 } from './levels/level-7-13';
import { handleLevel14, handleLevel15 } from './levels/level-14-15';
import { handleReservationFlow } from './levels/reservation-flow';

export interface ChatResponse {
  message: string;
  session: Session;
  options?: string[];
  data?: any;
}

/**
 * Procesar mensaje del usuario según el nivel actual de su sesión
 */
export async function processMessage(
  sessionId: string,
  message: string,
  phone?: string
): Promise<ChatResponse> {
  try {
    // Obtener o crear sesión
    const session = await SessionService.getOrCreateSession(sessionId, phone);

    logger.info('Processing chat message', {
      sessionId,
      currentLevel: session.current_level,
      message: message.substring(0, 50)
    });

    // Si la sesión está en flujo de reservas
    if (session.reservation_data && typeof session.reservation_data === 'object') {
      const resData = session.reservation_data as any;
      if (resData.in_flow) {
        return await handleReservationFlow(session, message);
      }
    }

    // Distribuir según nivel
    switch (session.current_level) {
      case 0:
        return await handleLevel0(session, message);

      case 1:
        return await handleLevel1(session, message);

      case 2:
        return await handleLevel2(session, message);

      case 3:
        return await handleLevel3(session, message);

      case 4:
        return await handleLevel4(session, message);

      case 5:
        return await handleLevel5(session, message);

      case 6:
        return await handleLevel6(session, message);

      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        return await handleLevel7to13(session, message);

      case 14:
        return await handleLevel14(session, message);

      case 15:
        return await handleLevel15(session, message);

      default:
        logger.warn('Unknown level', { level: session.current_level });
        return {
          message: 'Error interno. Reiniciando conversación...',
          session: await SessionService.updateLevel(sessionId, 0),
          options: ['Comenzar']
        };
    }
  } catch (error) {
    logger.error('Error processing message', error as Error);
    throw error;
  }
}
