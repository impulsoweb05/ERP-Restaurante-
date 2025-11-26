export interface NotificationData {
    order_id?: string;
    reservation_id?: string;
    notification_type: 'email' | 'whatsapp' | 'telegram';
    recipient: string;
    content: {
        subject?: string;
        title: string;
        message: string;
        data?: any;
    };
}
export declare class NotificationService {
    private static createNotificationRecord;
    private static markAsSent;
    private static markAsFailed;
    static sendEmail(data: NotificationData): Promise<{
        success: boolean;
        notificationId: any;
        message: string;
    }>;
    static sendWhatsApp(data: NotificationData): Promise<{
        success: boolean;
        notificationId: any;
        messageId: any;
        message: string;
    }>;
    static sendTelegram(data: NotificationData): Promise<{
        success: boolean;
        notificationId: any;
        messageId: any;
        message: string;
    }>;
    static sendNotification(data: NotificationData): Promise<{
        success: boolean;
        notificationId: any;
        message: string;
    }>;
    static getNotificationsByOrder(orderId: string): Promise<{
        success: boolean;
        notifications: any[];
        count: number;
    }>;
    static getNotificationsByReservation(reservationId: string): Promise<{
        success: boolean;
        notifications: any[];
        count: number;
    }>;
    static getFailedNotifications(): Promise<{
        success: boolean;
        notifications: any[];
        count: number;
    }>;
    static retryNotification(notificationId: string): Promise<{
        success: boolean;
        notificationId: any;
        message: string;
    } | {
        success: boolean;
        message: string;
    }>;
    static getNotificationStats(): Promise<{
        success: boolean;
        stats: {
            total: number;
            sent: number;
            failed: number;
            pending: number;
            totalEmail: number;
            totalWhatsApp: number;
            totalTelegram: number;
            successRate: string | number;
        };
    }>;
    static sendOrderCreatedNotification(orderId: string, customerPhone: string, orderNumber: string, total: number): Promise<{
        success: boolean;
        notificationId: any;
        message: string;
    } | {
        success: boolean;
        error: any;
    }>;
    static sendReservationConfirmedNotification(reservationId: string, customerPhone: string, reservationNumber: string, date: string, time: string): Promise<{
        success: boolean;
        notificationId: any;
        message: string;
    } | {
        success: boolean;
        error: any;
    }>;
}
//# sourceMappingURL=NotificationService.d.ts.map