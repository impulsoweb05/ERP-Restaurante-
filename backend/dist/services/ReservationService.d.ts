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
    static createReservation(data: ReservationData): Promise<void>;
    if(updates: any, length: any): any;
}
//# sourceMappingURL=ReservationService.d.ts.map