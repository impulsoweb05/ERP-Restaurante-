export interface ReservationData {
    customer_id: string;
    table_id: string;
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    special_requests?: string;
}
export interface UpdateReservationData {
    reservation_date?: string;
    reservation_time?: string;
    party_size?: number;
    table_id?: string;
    special_requests?: string;
}
export declare class ReservationService {
    static createReservation(data: ReservationData): Promise<{
        success: boolean;
        reservation: any;
        message: string;
    }>;
    static checkTableAvailability(client: any, tableId: string, reservationDate: string, reservationTime: string, partySize: number): Promise<{
        available: boolean;
        reason?: string;
    }>;
    static generateReservationNumber(client: any): Promise<string>;
    static getReservationById(reservationId: string): Promise<{
        success: boolean;
        message: string;
        reservation?: undefined;
    } | {
        success: boolean;
        reservation: any;
        message?: undefined;
    }>;
    static getReservationsByCustomer(customerId: string): Promise<{
        success: boolean;
        reservations: any[];
        count: number;
    }>;
    static getReservationsByDate(date: string, status?: string): Promise<{
        success: boolean;
        reservations: any[];
        count: number;
        date: string;
    }>;
    static confirmReservation(reservationId: string): Promise<{
        success: boolean;
        reservation: any;
        message: string;
    }>;
    static activateReservation(reservationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static cancelReservation(reservationId: string, reason?: string): Promise<{
        success: boolean;
        reservation: any;
        message: string;
    }>;
    static markAsNoShow(reservationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static completeReservation(reservationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static autoReleaseExpiredReservations(minutesThreshold?: number): Promise<{
        success: boolean;
        released: number;
        reservations: any[];
    }>;
    static updateReservation(reservationId: string, data: UpdateReservationData): Promise<{
        success: boolean;
        reservation: any;
        message: string;
    }>;
}
//# sourceMappingURL=ReservationService.d.ts.map