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
    static getQueue(statusFilter?: string): Promise<void>;
}
//# sourceMappingURL=KitchenService.d.ts.map