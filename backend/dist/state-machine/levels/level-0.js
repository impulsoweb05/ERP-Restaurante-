"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 0: Validación de Horario y Menú Inicial
 * Primer contacto con el bot - valida si el restaurante está abierto
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLevel0 = handleLevel0;
const ScheduleService_1 = require("../../services/ScheduleService");
const SessionService_1 = require("../../services/SessionService");
const logger_1 = require("../../utils/logger");
async function handleLevel0(session, message) {
    try {
        // Validar horario actual
        const schedule = await ScheduleService_1.ScheduleService.isOpenNow();
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
        const updatedSession = await SessionService_1.SessionService.updateLevel(session.session_id, 1);
        return {
            message: response,
            session: updatedSession,
            options: ['Hacer Pedido', 'Hacer Reserva', 'Ver Menú']
        };
    }
    catch (error) {
        logger_1.logger.error('Error in level 0', error);
        return {
            message: 'Error al validar horario. Por favor intenta de nuevo.',
            session
        };
    }
}
//# sourceMappingURL=level-0.js.map