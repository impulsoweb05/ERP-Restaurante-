// ═════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE - Email, WhatsApp, Telegram
// ═════════════════════════════════════════════════════════════════════════════

import { getPool } from '@config/database';
import { ValidationService } from './ValidationService';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { logger } from '../utils/logger';

const pool = getPool();

export interface NotificationData {
  order_id?: string;
  reservation_id?: string;
  notification_type: 'email' | 'whatsapp' | 'telegram';
  recipient: string; // email, phone, telegram_chat_id
  content: {
    subject?: string;
    title: string;
    message: string;
    data?: any;
  };
}

export class NotificationService {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREAR NOTIFICACIÓN EN BASE DE DATOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async createNotificationRecord(data: NotificationData) {
    try {
      const insertQuery = `
        INSERT INTO notifications (
          order_id,
          reservation_id,
          notification_type,
          recipient,
          content,
          status
        ) VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        data.order_id || null,
        data.reservation_id || null,
        data.notification_type,
        data.recipient,
        JSON.stringify(data.content)
      ]);

      return result.rows[0];

    } catch (error: any) {
      logger.error('Error al crear registro de notificación', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MARCAR NOTIFICACIÓN COMO ENVIADA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async markAsSent(notificationId: string) {
    try {
      await pool.query(
        `UPDATE notifications
         SET status = 'sent',
             sent_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [notificationId]
      );
    } catch (error: any) {
      logger.error('Error al marcar como enviada', error as Error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MARCAR NOTIFICACIÓN COMO FALLIDA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private static async markAsFailed(notificationId: string, errorMessage: string) {
    try {
      await pool.query(
        `UPDATE notifications
         SET status = 'failed',
             error_message = $1
         WHERE id = $2`,
        [errorMessage, notificationId]
      );
    } catch (error: any) {
      logger.error('Error al marcar como fallida', error as Error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENVIAR EMAIL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async sendEmail(data: NotificationData) {
    let notificationRecord;

    try {
      // 1. Crear registro en DB
      notificationRecord = await this.createNotificationRecord(data);

      // 2. Validar email
      const emailValidation = ValidationService.validateEmail(data.recipient);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message || 'Email inválido');
      }

      // 3. Configurar transporte (nodemailer)
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

      // 4. Preparar email
      const mailOptions = {
        from: process.env.MAIL_FROM || 'noreply@restaurante.com',
        to: data.recipient,
        subject: data.content.subject || data.content.title,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${data.content.title}</h2>
            <p style="color: #666; line-height: 1.6;">${data.content.message}</p>
            ${data.content.data ? `<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${JSON.stringify(data.content.data, null, 2)}</pre>` : ''}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">Este es un email automático del Sistema ERP Restaurante.</p>
          </div>
        `
      };

      // 5. Enviar email
      await transporter.sendMail(mailOptions);

      // 6. Marcar como enviado
      await this.markAsSent(notificationRecord.id);

      logger.info('Email enviado a ${data.recipient}`);
      return {
        success: true,
        notificationId: notificationRecord.id,
        message: 'Email enviado exitosamente'
      };

    } catch (error: any) {
      logger.error('Error al enviar email', error as Error);

      if (notificationRecord) {
        await this.markAsFailed(notificationRecord.id, error.message);
      }

      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENVIAR WHATSAPP (Evolution API)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async sendWhatsApp(data: NotificationData) {
    let notificationRecord;

    try {
      // 1. Crear registro en DB
      notificationRecord = await this.createNotificationRecord(data);

      // 2. Validar teléfono (debe ser 10 dígitos)
      const phoneValidation = ValidationService.validatePhone(data.recipient);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message || 'Teléfono inválido');
      }

      // 3. Formatear teléfono para WhatsApp (57 + 10 dígitos)
      const formattedPhone = `57${data.recipient}@s.whatsapp.net`;

      // 4. Preparar mensaje
      let messageText = `*${data.content.title}*\n\n${data.content.message}`;

      if (data.content.data) {
        messageText += `\n\n${JSON.stringify(data.content.data, null, 2)}`;
      }

      // 5. Enviar a Evolution API
      // Configuración según tu setup de Evolution API
      const evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
      const evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
      const evolutionInstance = process.env.EVOLUTION_INSTANCE || 'restaurante';

      const response = await axios.post(
        `${evolutionApiUrl}/message/sendText/${evolutionInstance}`,
        {
          number: formattedPhone,
          text: messageText
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          }
        }
      );

      if (response.data && response.data.key) {
        // 6. Marcar como enviado
        await this.markAsSent(notificationRecord.id);

        logger.info('WhatsApp enviado a ${data.recipient}`);
        return {
          success: true,
          notificationId: notificationRecord.id,
          messageId: response.data.key.id,
          message: 'WhatsApp enviado exitosamente'
        };
      } else {
        throw new Error('Respuesta inválida de Evolution API');
      }

    } catch (error: any) {
      logger.error('Error al enviar WhatsApp', error as Error);

      if (notificationRecord) {
        await this.markAsFailed(notificationRecord.id, error.message);
      }

      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENVIAR TELEGRAM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async sendTelegram(data: NotificationData) {
    let notificationRecord;

    try {
      // 1. Crear registro en DB
      notificationRecord = await this.createNotificationRecord(data);

      // 2. Validar que recipient es un chat_id válido
      if (!data.recipient || data.recipient.trim() === '') {
        throw new Error('Chat ID de Telegram requerido');
      }

      // 3. Preparar mensaje
      let messageText = `<b>${data.content.title}</b>\n\n${data.content.message}`;

      if (data.content.data) {
        messageText += `\n\n<pre>${JSON.stringify(data.content.data, null, 2)}</pre>`;
      }

      // 4. Enviar a Telegram Bot API
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
      const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

      const response = await axios.post(telegramApiUrl, {
        chat_id: data.recipient,
        text: messageText,
        parse_mode: 'HTML'
      });

      if (response.data && response.data.ok) {
        // 5. Marcar como enviado
        await this.markAsSent(notificationRecord.id);

        logger.info('Telegram enviado a chat ${data.recipient}`);
        return {
          success: true,
          notificationId: notificationRecord.id,
          messageId: response.data.result.message_id,
          message: 'Telegram enviado exitosamente'
        };
      } else {
        throw new Error('Respuesta inválida de Telegram API');
      }

    } catch (error: any) {
      logger.error('Error al enviar Telegram', error as Error);

      if (notificationRecord) {
        await this.markAsFailed(notificationRecord.id, error.message);
      }

      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENVIAR NOTIFICACIÓN (auto-detecta tipo)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async sendNotification(data: NotificationData) {
    try {
      switch (data.notification_type) {
        case 'email':
          return await this.sendEmail(data);
        case 'whatsapp':
          return await this.sendWhatsApp(data);
        case 'telegram':
          return await this.sendTelegram(data);
        default:
          throw new Error(`Tipo de notificación no soportado: ${data.notification_type}`);
      }
    } catch (error: any) {
      logger.error('Error al enviar notificación', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER NOTIFICACIONES POR PEDIDO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getNotificationsByOrder(orderId: string) {
    try {
      ValidationService.validateUUID(orderId);

      const query = `
        SELECT *
        FROM notifications
        WHERE order_id = $1
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [orderId]);

      return {
        success: true,
        notifications: result.rows,
        count: result.rows.length
      };

    } catch (error: any) {
      logger.error('Error al obtener notificaciones del pedido', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER NOTIFICACIONES POR RESERVA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getNotificationsByReservation(reservationId: string) {
    try {
      ValidationService.validateUUID(reservationId);

      const query = `
        SELECT *
        FROM notifications
        WHERE reservation_id = $1
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [reservationId]);

      return {
        success: true,
        notifications: result.rows,
        count: result.rows.length
      };

    } catch (error: any) {
      logger.error('Error al obtener notificaciones de la reserva', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER NOTIFICACIONES FALLIDAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getFailedNotifications() {
    try {
      const query = `
        SELECT *
        FROM notifications
        WHERE status = 'failed'
        ORDER BY created_at DESC
        LIMIT 100
      `;

      const result = await pool.query(query);

      return {
        success: true,
        notifications: result.rows,
        count: result.rows.length
      };

    } catch (error: any) {
      logger.error('Error al obtener notificaciones fallidas', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REENVIAR NOTIFICACIÓN FALLIDA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async retryNotification(notificationId: string) {
    try {
      ValidationService.validateUUID(notificationId);

      // 1. Obtener notificación
      const query = await pool.query(
        'SELECT * FROM notifications WHERE id = $1',
        [notificationId]
      );

      if (query.rows.length === 0) {
        throw new Error('Notificación no encontrada');
      }

      const notification = query.rows[0];

      if (notification.status === 'sent') {
        return {
          success: false,
          message: 'La notificación ya fue enviada exitosamente'
        };
      }

      // 2. Preparar datos para reenvío
      const data: NotificationData = {
        order_id: notification.order_id,
        reservation_id: notification.reservation_id,
        notification_type: notification.notification_type,
        recipient: notification.recipient,
        content: notification.content
      };

      // 3. Eliminar registro anterior
      await pool.query('DELETE FROM notifications WHERE id = $1', [notificationId]);

      // 4. Reenviar
      return await this.sendNotification(data);

    } catch (error: any) {
      logger.error('Error al reenviar notificación', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBTENER ESTADÍSTICAS DE NOTIFICACIONES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async getNotificationStats() {
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN notification_type = 'email' THEN 1 ELSE 0 END) as total_email,
          SUM(CASE WHEN notification_type = 'whatsapp' THEN 1 ELSE 0 END) as total_whatsapp,
          SUM(CASE WHEN notification_type = 'telegram' THEN 1 ELSE 0 END) as total_telegram
        FROM notifications
        WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `;

      const result = await pool.query(query);
      const stats = result.rows[0];

      return {
        success: true,
        stats: {
          total: parseInt(stats.total),
          sent: parseInt(stats.sent),
          failed: parseInt(stats.failed),
          pending: parseInt(stats.pending),
          totalEmail: parseInt(stats.total_email),
          totalWhatsApp: parseInt(stats.total_whatsapp),
          totalTelegram: parseInt(stats.total_telegram),
          successRate: stats.total > 0
            ? ((parseInt(stats.sent) / parseInt(stats.total)) * 100).toFixed(1)
            : 0
        }
      };

    } catch (error: any) {
      logger.error('Error al obtener estadísticas', error as Error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENVIAR NOTIFICACIÓN DE PEDIDO CREADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async sendOrderCreatedNotification(
    orderId: string,
    customerPhone: string,
    orderNumber: string,
    total: number
  ) {
    try {
      const data: NotificationData = {
        order_id: orderId,
        notification_type: 'whatsapp',
        recipient: customerPhone,
        content: {
          title: '✅ Pedido Recibido',
          message: `Tu pedido ${orderNumber} ha sido recibido.\nTotal: $${total.toFixed(2)}\n\nEstamos preparando tu orden.`,
          data: { orderNumber, total }
        }
      };

      return await this.sendNotification(data);

    } catch (error: any) {
      logger.error('Error en notificación de pedido', error as Error);
      // No lanzar error para no bloquear la creación del pedido
      return { success: false, error: error.message };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENVIAR NOTIFICACIÓN DE RESERVA CONFIRMADA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  static async sendReservationConfirmedNotification(
    reservationId: string,
    customerPhone: string,
    reservationNumber: string,
    date: string,
    time: string
  ) {
    try {
      const data: NotificationData = {
        reservation_id: reservationId,
        notification_type: 'whatsapp',
        recipient: customerPhone,
        content: {
          title: '✅ Reserva Confirmada',
          message: `Tu reserva ${reservationNumber} ha sido confirmada.\nFecha: ${date}\nHora: ${time}\n\n¡Te esperamos!`,
          data: { reservationNumber, date, time }
        }
      };

      return await this.sendNotification(data);

    } catch (error: any) {
      logger.error('Error en notificación de reserva', error as Error);
      return { success: false, error: error.message };
    }
  }
}
