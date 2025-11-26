"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE MACHINE DISPATCHER
 * Router principal que distribuye mensajes a los niveles correspondientes
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMessage = processMessage;
const SessionService_1 = require("../services/SessionService");
const logger_1 = require("../utils/logger");
const level_0_1 = require("./levels/level-0");
const level_1_1 = require("./levels/level-1");
const level_2_3_4_1 = require("./levels/level-2-3-4");
const level_5_1 = require("./levels/level-5");
const level_6_1 = require("./levels/level-6");
const level_7_13_1 = require("./levels/level-7-13");
const level_14_15_1 = require("./levels/level-14-15");
const reservation_flow_1 = require("./levels/reservation-flow");
/**
 * Procesar mensaje del usuario según el nivel actual de su sesión
 */
async function processMessage(sessionId, message, phone) {
    try {
        // Obtener o crear sesión
        const session = await SessionService_1.SessionService.getOrCreateSession(sessionId, phone);
        logger_1.logger.info('Processing chat message', {
            sessionId,
            currentLevel: session.current_level,
            message: message.substring(0, 50)
        });
        // Si la sesión está en flujo de reservas
        if (session.reservation_data && typeof session.reservation_data === 'object') {
            const resData = session.reservation_data;
            if (resData.in_flow) {
                return await (0, reservation_flow_1.handleReservationFlow)(session, message);
            }
        }
        // Distribuir según nivel
        switch (session.current_level) {
            case 0:
                return await (0, level_0_1.handleLevel0)(session, message);
            case 1:
                return await (0, level_1_1.handleLevel1)(session, message);
            case 2:
                return await (0, level_2_3_4_1.handleLevel2)(session, message);
            case 3:
                return await (0, level_2_3_4_1.handleLevel3)(session, message);
            case 4:
                return await (0, level_2_3_4_1.handleLevel4)(session, message);
            case 5:
                return await (0, level_5_1.handleLevel5)(session, message);
            case 6:
                return await (0, level_6_1.handleLevel6)(session, message);
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                return await (0, level_7_13_1.handleLevel7to13)(session, message);
            case 14:
                return await (0, level_14_15_1.handleLevel14)(session, message);
            case 15:
                return await (0, level_14_15_1.handleLevel15)(session, message);
            default:
                logger_1.logger.warn('Unknown level', { level: session.current_level });
                return {
                    message: 'Error interno. Reiniciando conversación...',
                    session: await SessionService_1.SessionService.updateLevel(sessionId, 0),
                    options: ['Comenzar']
                };
        }
    }
    catch (error) {
        logger_1.logger.error('Error processing message', error);
        throw error;
    }
}
//# sourceMappingURL=dispatcher.js.map