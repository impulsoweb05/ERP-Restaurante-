/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESERVATION FLOW - Flujo de Reservas (7 sub-niveles)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Session } from '../../types';
import { SessionService } from '../../services/SessionService';
import { ReservationService } from '../../services/ReservationService';
import { TableService } from '../../services/TableService';
import { ValidationService } from '../../services/ValidationService';
import { ChatResponse } from '../dispatcher';
import { logger } from '../../utils/logger';

export async function handleReservationFlow(
  session: Session,
  message: string
): Promise<ChatResponse> {
  try {
    const resData = (session.reservation_data || {}) as any;
    const step = resData.step || 1;

    // Paso 1: Capturar fecha
    if (step === 1) {
      return {
        message: `📅 **Nueva Reserva**

Por favor ingresa la fecha de tu reserva:

Formato: DD/MM/YYYY
Ejemplo: 25/12/2025`,
        session
      };
    }

    // Paso 2: Capturar hora
    if (step === 2) {
      const date = resData.date;
      return {
        message: `🕐 **Hora de Reserva**

Fecha seleccionada: ${date}

Ingresa la hora (formato 24h):

Ejemplo: 19:30`,
        session
      };
    }

    // Paso 3: Capturar número de personas
    if (step === 3) {
      return {
        message: `👥 **Número de Personas**

¿Para cuántas personas?

Escribe un número:`,
        session
      };
    }

    // Paso 4: Mostrar mesas disponibles
    if (step === 4) {
      const date = resData.date;
      const time = resData.time;
      const partySize = resData.party_size;

      // Obtener mesas disponibles
      const result = await TableService.getAvailableTables();

      if (!result.tables || result.tables.length === 0) {
        return {
          message: `❌ No hay mesas disponibles para ${partySize} personas.

¿Deseas intentar con otra fecha?

1️⃣ Sí
2️⃣ No`,
          session
        };
      }

      let responseMessage = `✅ Mesas disponibles:\n\n`;
      result.tables.forEach((table: any, index: number) => {
        responseMessage += `${index + 1}️⃣ Mesa ${table.table_number} (Capacidad: ${table.capacity} personas)\n`;
      });

      responseMessage += `\nSelecciona el número de la mesa:`;

      return {
        message: responseMessage,
        session,
        data: { availableTables: result.tables }
      };
    }

    // Paso 5: Solicitudes especiales
    if (step === 5) {
      return {
        message: `📝 **Solicitudes Especiales**

¿Alguna solicitud especial? (opcional)

Ejemplo: Mesa junto a ventana, silla de bebé, etc.

Escribe tus solicitudes o "ninguna":`,
        session
      };
    }

    // Paso 6: Resumen
    if (step === 6) {
      const {date, time, party_size, table_number, special_requests} = resData;

      let response = `📋 **RESUMEN DE TU RESERVA**\n\n`;
      response += `📅 Fecha: ${date}\n`;
      response += `🕐 Hora: ${time}\n`;
      response += `👥 Personas: ${party_size}\n`;
      response += `🪑 Mesa: ${table_number}\n`;
      if (special_requests && special_requests !== 'ninguna') {
        response += `📝 Solicitudes: ${special_requests}\n`;
      }
      response += `\n⚠️ **Importante:** Si no llegas 30 minutos después de tu hora reservada, tu reserva será cancelada automáticamente.\n\n`;
      response += `¿Confirmar reserva?\n\n`;
      response += `1️⃣ SÍ, Confirmar\n`;
      response += `2️⃣ NO, Cancelar`;

      return {
        message: response,
        session,
        options: ['Confirmar', 'Cancelar']
      };
    }

    // Paso 7: Crear reserva
    if (step === 7) {
      const choice = message.trim();

      if (choice === '2' || choice.toLowerCase().includes('no')) {
        return {
          message: 'Reserva cancelada.',
          session: await SessionService.updateLevel(session.session_id, 0, {
            reservation_data: null
          })
        };
      }

      if (!session.customer_id) {
        return {
          message: 'Error: Cliente no identificado.',
          session
        };
      }

      const { date, time, party_size, table_id, special_requests, customer_name, customer_phone } = resData;

      const result = await ReservationService.createReservation({
        customer_id: session.customer_id,
        table_id,
        reservation_date: date,
        reservation_time: time,
        party_size,
        customer_name: customer_name || 'Cliente',
        customer_phone: customer_phone || session.phone || '',
        special_requests: special_requests !== 'ninguna' ? special_requests : undefined
      });

      // Resetear sesión
      await SessionService.updateLevel(session.session_id, 0, {
        reservation_data: null
      });

      const confirmationMessage = `✅ **¡RESERVA CONFIRMADA!**

📦 Código: **${result.reservation.reservation_number}**

📅 ${date} a las ${time}
👥 ${party_size} personas

Recibirás una confirmación por WhatsApp.

⚠️ Por favor llega puntual o avisa si llegarás tarde.

¡Te esperamos!`;

      return {
        message: confirmationMessage,
        session: await SessionService.getOrCreateSession(session.session_id),
        data: { reservation: result.reservation }
      };
    }

    // Por defecto
    return {
      message: 'Error en el flujo de reservas.',
      session
    };
  } catch (error) {
    logger.error('Error in reservation flow', error as Error);
    return {
      message: 'Error al procesar reserva. Intenta de nuevo.',
      session
    };
  }
}
