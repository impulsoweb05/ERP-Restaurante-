/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 0: Validación de Horario y Menú Inicial
 * Primer contacto con el bot - valida si el restaurante está abierto
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Session } from '../../types';
import { ScheduleService } from '../../services/ScheduleService';
import { SessionService } from '../../services/SessionService';
import { ChatResponse } from '../dispatcher';
import { logger } from '../../utils/logger';

export async function handleLevel0(session: Session, message: string): Promise<ChatResponse> {
  try {
    // Validar horario actual
    const schedule = await ScheduleService.isOpenNow();

    if (!schedule.isOpen) {
      return {
        message: `🕐 Lo sentimos, estamos cerrados.

📅 **Horarios:**
${schedule.message || 'Consulta nuestros horarios'}

Puedes hacer una reserva para cuando estemos abiertos. ¿Deseas reservar?

1️⃣ Hacer Reserva
2️⃣ Ver Horarios`,
        session,
        options: ['Hacer Reserva', 'Ver Horarios']
      };
    }

    // Restaurante abierto - mostrar menú principal
    const response = `👋 ¡Bienvenido a nuestro restaurante!

Estamos abiertos y listos para atenderte.

¿Qué deseas hacer?

1️⃣ Hacer un Pedido a Domicilio 🛵
2️⃣ Hacer una Reserva 📅
3️⃣ Ver Menú Completo 📖`;

    // Avanzar a nivel 1
    const updatedSession = await SessionService.updateLevel(session.session_id, 1);

    return {
      message: response,
      session: updatedSession,
      options: ['Hacer Pedido', 'Hacer Reserva', 'Ver Menú']
    };
  } catch (error) {
    logger.error('Error in level 0', error as Error);
    return {
      message: 'Error al validar horario. Por favor intenta de nuevo.',
      session
    };
  }
}
