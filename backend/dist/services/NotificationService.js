"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE - Email, WhatsApp, Telegram
// ═════════════════════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("@config/database");
const ValidationService_1 = require("./ValidationService");
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const pool = (0, database_1.getPool)();
class NotificationService {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREAR NOTIFICACIÓN EN BASE DE DATOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async createNotificationRecord(data) {
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
        }
        catch (error) {
            logger_1.logger.error('Error al crear registro de notificación', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARCAR NOTIFICACIÓN COMO ENVIADA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async markAsSent(notificationId) {
        try {
            await pool.query(`UPDATE notifications
         SET status = 'sent',
             sent_at = CURRENT_TIMESTAMP
         WHERE id = $1`, [notificationId]);
        }
        catch (error) {
            logger_1.logger.error('Error al marcar como enviada', error);
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MARCAR NOTIFICACIÓN COMO FALLIDA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async markAsFailed(notificationId, errorMessage) {
        try {
            await pool.query(`UPDATE notifications
         SET status = 'failed',
             error_message = $1
         WHERE id = $2`, [errorMessage, notificationId]);
        }
        catch (error) {
            logger_1.logger.error('Error al marcar como fallida', error);
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR EMAIL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async sendEmail(data) {
        let notificationRecord;
        try {
            // 1. Crear registro en DB
            notificationRecord = await this.createNotificationRecord(data);
            // 2. Validar email
            const emailValidation = ValidationService_1.ValidationService.validateEmail(data.recipient);
            if (!emailValidation.isValid) {
                throw new Error(emailValidation.message || 'Email inválido');
            }
            // 3. Configurar transporte (nodemailer)
            const transporter = nodemailer_1.default.createTransport({
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
            logger_1.logger.info('Email enviado a ${data.recipient}`););
            return {
                success: true,
                notificationId: notificationRecord.id,
                message: 'Email enviado exitosamente'
            };
        }
        catch (error) {
            logger_1.logger.error('Error al enviar email', error);
            if (notificationRecord) {
                await this.markAsFailed(notificationRecord.id, error.message);
            }
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR WHATSAPP (Evolution API)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async sendWhatsApp(data) {
        let notificationRecord;
        try {
            // 1. Crear registro en DB
            notificationRecord = await this.createNotificationRecord(data);
            // 2. Validar teléfono (debe ser 10 dígitos)
            const phoneValidation = ValidationService_1.ValidationService.validatePhone(data.recipient);
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
            const response = await axios_1.default.post(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
                number: formattedPhone,
                text: messageText
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': evolutionApiKey
                }
            });
            if (response.data && response.data.key) {
                // 6. Marcar como enviado
                await this.markAsSent(notificationRecord.id);
                logger_1.logger.info('WhatsApp enviado a ${data.recipient}`););
                return {
                    success: true,
                    notificationId: notificationRecord.id,
                    messageId: response.data.key.id,
                    message: 'WhatsApp enviado exitosamente'
                };
            }
            else {
                throw new Error('Respuesta inválida de Evolution API');
            }
        }
        catch (error) {
            logger_1.logger.error('Error al enviar WhatsApp', error);
            if (notificationRecord) {
                await this.markAsFailed(notificationRecord.id, error.message);
            }
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR TELEGRAM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async sendTelegram(data) {
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
            const response = await axios_1.default.post(telegramApiUrl, {
                chat_id: data.recipient,
                text: messageText,
                parse_mode: 'HTML'
            });
            if (response.data && response.data.ok) {
                // 5. Marcar como enviado
                await this.markAsSent(notificationRecord.id);
                logger_1.logger.info('Telegram enviado a chat ${data.recipient}`););
                return {
                    success: true,
                    notificationId: notificationRecord.id,
                    messageId: response.data.result.message_id,
                    message: 'Telegram enviado exitosamente'
                };
            }
            else {
                throw new Error('Respuesta inválida de Telegram API');
            }
        }
        catch (error) {
            logger_1.logger.error('Error al enviar Telegram', error);
            if (notificationRecord) {
                await this.markAsFailed(notificationRecord.id, error.message);
            }
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR NOTIFICACIÓN (auto-detecta tipo)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async sendNotification(data) {
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
        }
        catch (error) {
            logger_1.logger.error('Error al enviar notificación', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER NOTIFICACIONES POR PEDIDO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getNotificationsByOrder(orderId) {
        try {
            ValidationService_1.ValidationService.validateUUID(orderId);
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
        }
        catch (error) {
            logger_1.logger.error('Error al obtener notificaciones del pedido', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OBTENER NOTIFICACIONES POR RESERVA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async getNotificationsByReservation(reservationId) {
        try {
            ValidationService_1.ValidationService.validateUUID(reservationId);
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
        }
        catch (error) {
            logger_1.logger.error('Error al obtener notificaciones de la reserva', error);
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
        }
        catch (error) {
            logger_1.logger.error('Error al obtener notificaciones fallidas', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // REENVIAR NOTIFICACIÓN FALLIDA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async retryNotification(notificationId) {
        try {
            ValidationService_1.ValidationService.validateUUID(notificationId);
            // 1. Obtener notificación
            const query = await pool.query('SELECT * FROM notifications WHERE id = $1', [notificationId]);
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
            const data = {
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
        }
        catch (error) {
            logger_1.logger.error('Error al reenviar notificación', error);
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
        }
        catch (error) {
            logger_1.logger.error('Error al obtener estadísticas', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR NOTIFICACIÓN DE PEDIDO CREADO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async sendOrderCreatedNotification(orderId, customerPhone, orderNumber, total) {
        try {
            const data = {
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
        }
        catch (error) {
            logger_1.logger.error('Error en notificación de pedido', error);
            // No lanzar error para no bloquear la creación del pedido
            return { success: false, error: error.message };
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ENVIAR NOTIFICACIÓN DE RESERVA CONFIRMADA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async sendReservationConfirmedNotification(reservationId, customerPhone, reservationNumber, date, time) {
        try {
            const data = {
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
        }
        catch (error) {
            logger_1.logger.error('Error en notificación de reserva', error);
            return { success: false, error: error.message };
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map