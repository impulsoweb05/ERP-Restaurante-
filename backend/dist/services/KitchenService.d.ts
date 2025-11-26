export interface KitchenQueueItem {
    order_item_id: string;
    priority?: number;
    assigned_station?: string;
    estimated_time?: number;
}
export declare class KitchenService {
    static addToQueue(data: KitchenQueueItem): Promise<{
        success: boolean;
        queueItem: any;
        message: string;
    }>;
    static getQueue(statusFilter?: string): Promise<{
        success: boolean;
        queue: any[];
        count: number;
    }>;
    static getQueueByStation(station: string): Promise<{
        success: boolean;
        queue: any[];
        count: number;
        station: string;
    }>;
    static startPreparation(queueId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static completeItem(queueId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static updatePriority(queueId: string, priority: number): Promise<{
        success: boolean;
        queueItem: any;
        message: string;
    }>;
    static updateStation(queueId: string, station: string): Promise<{
        success: boolean;
        queueItem: any;
        message: string;
    }>;
    static getKitchenStats(): Promise<{
        success: boolean;
        stats: {
            totalItems: number;
            queued: number;
            preparing: number;
            ready: number;
            avgPreparationTime: string | null;
            avgWaitTime: string | null;
        };
    }>;
    static getStationStats(station: string): Promise<{
        success: boolean;
        stats: {
            station: any;
            totalItems: number;
            queued: number;
            preparing: number;
            ready: number;
            avgPreparationTime: string | null;
        };
    }>;
    static getQueueByOrder(orderId: string): Promise<{
        success: boolean;
        queue: any[];
        count: number;
    }>;
    static checkOrderReady(orderId: string): Promise<{
        success: boolean;
        orderId: string;
        totalItems: number;
        readyItems: number;
        allReady: boolean;
        message: string;
    }>;
    static getStations(): Promise<{
        success: boolean;
        stations: any[];
        count: number;
    }>;
    static removeFromQueue(queueId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=KitchenService.d.ts.map