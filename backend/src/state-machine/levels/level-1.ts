/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEVEL 1: Captura de Teléfono y Registro de Cliente
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Session } from '../../types';
import { ValidationService } from '../../services/ValidationService';
import { CustomerService } from '../../services/CustomerService';
import { SessionService } from '../../services/SessionService';
import { ChatResponse } from '../dispatcher';
import { logger } from '../../utils/logger';

export async function handleLevel1(session: Session, message: string): Promise<ChatResponse> {
  try {
    const choice = message.trim();

    // Opción 2: Hacer Reserva
    if (choice === '2' || choice.toLowerCase().includes('reserva')) {
      const updatedSession = await SessionService.updateLevel(session.session_id, 1, {
        reservation_data: { in_flow: true, step: 1 }
      });

      return {
        message: `📅 **Hacer una Reserva**

Por favor, ingresa tu número de teléfono (10 dígitos):`,
        session: updatedSession
      };
    }

    // Opción 1: Hacer Pedido
    if (choice === '1' || choice.toLowerCase().includes('pedido')) {
      return {
        message: `🛵 **Pedido a Domicilio**

Para continuar, necesito tu número de teléfono (10 dígitos):

Ejemplo: 3012345678`,
        session
      };
    }

    // Captura de teléfono
    const phone = message.replace(/\D/g, ''); // Solo números

    // Validar teléfono
    const validation = ValidationService.validatePhone(phone);
    if (!validation.isValid) {
      return {
        message: `❌ ${validation.message}

Por favor ingresa un número válido de 10 dígitos:`,
        session
      };
    }

    // Buscar o crear cliente
    let customer = await CustomerService.findByPhone(phone);

    if (!customer) {
      // Cliente nuevo - pedir nombre
      customer = await CustomerService.create({
        phone,
        full_name: 'Cliente Temporal', // Se actualizará después
        address_1: ''
      });

      logger.info('New customer created via chat', { phone, customerId: customer.id });
    }

    // Marcar sesión como registrada
    const updatedSession = await SessionService.markAsRegistered(
      session.session_id,
      customer.id,
      phone
    );

    const greeting = customer.full_name !== 'Cliente Temporal'
      ? `👋 ¡Hola ${customer.full_name}!`
      : '👋 ¡Hola!';

    // Avanzar a nivel 2 (menú de categorías)
    const nextSession = await SessionService.updateLevel(updatedSession.session_id, 2);

    return {
      message: `${greeting}

¿Qué te gustaría ordenar hoy?

Selecciona una categoría para ver nuestros productos:

(Cargando categorías...)`,
      session: nextSession,
      data: { customer }
    };
  } catch (error) {
    logger.error('Error in level 1', error as Error);
    return {
      message: 'Error al procesar tu teléfono. Intenta de nuevo.',
      session
    };
  }
}
