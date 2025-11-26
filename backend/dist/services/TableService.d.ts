export interface TableData {
    table_number: string;
    capacity: number;
    zone?: string;
}
export interface UpdateTableData {
    table_number?: string;
    capacity?: number;
    zone?: string;
    status?: 'available' | 'occupied' | 'reserved' | 'cleaning';
}
export declare class TableService {
    static createTable(data: TableData): Promise<{
        success: boolean;
        table: any;
        message: string;
    }>;
    static getAllTables(): Promise<{
        success: boolean;
        tables: any[];
        count: number;
    }>;
    static getTableById(tableId: string): Promise<{
        success: boolean;
        message: string;
        table?: undefined;
    } | {
        success: boolean;
        table: any;
        message?: undefined;
    }>;
    static getTableByNumber(tableNumber: string): Promise<{
        success: boolean;
        message: string;
        table?: undefined;
    } | {
        success: boolean;
        table: any;
        message?: undefined;
    }>;
    static getTablesByStatus(status: string): Promise<{
        success: boolean;
        tables: any[];
        count: number;
        status: string;
    }>;
    static getTablesByZone(zone: string): Promise<{
        success: boolean;
        tables: any[];
        count: number;
        zone: string;
    }>;
    static getAvailableTables(minCapacity?: number): Promise<{
        success: boolean;
        tables: any[];
        count: number;
        minCapacity: number | null;
    }>;
    static updateTableStatus(tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning'): Promise<{
        success: boolean;
        table: any;
        message: string;
    }>;
    static assignOrderToTable(tableId: string, orderId: string): Promise<{
        success: boolean;
        table: any;
        message: string;
    }>;
    static assignReservationToTable(tableId: string, reservationId: string): Promise<{
        success: boolean;
        table: any;
        message: string;
    }>;
    static releaseTable(tableId: string, setToAvailable?: boolean): Promise<{
        success: boolean;
        table: any;
        message: string;
    }>;
    static updateTable(tableId: string, data: UpdateTableData): Promise<{
        success: boolean;
        table: any;
        message: string;
    }>;
    static deleteTable(tableId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static getTableStats(): Promise<{
        success: boolean;
        stats: {
            total: number;
            available: number;
            occupied: number;
            reserved: number;
            cleaning: number;
            totalCapacity: number;
            occupancyRate: string | number;
        };
    }>;
}
//# sourceMappingURL=TableService.d.ts.map