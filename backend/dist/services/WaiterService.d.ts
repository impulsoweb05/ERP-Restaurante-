export interface WaiterData {
    waiter_code: string;
    full_name: string;
    phone?: string;
    pin_code: string;
}
export interface UpdateWaiterData {
    waiter_code?: string;
    full_name?: string;
    phone?: string;
    is_active?: boolean;
}
export declare class WaiterService {
    static createWaiter(data: WaiterData): Promise<{
        success: boolean;
        waiter: any;
        message: string;
    }>;
    static getAllWaiters(includeInactive?: boolean): Promise<{
        success: boolean;
        waiters: any[];
        count: number;
    }>;
    static getWaiterById(waiterId: string): Promise<{
        success: boolean;
        message: string;
        waiter?: undefined;
    } | {
        success: boolean;
        waiter: any;
        message?: undefined;
    }>;
    static getWaiterByCode(waiterCode: string): Promise<{
        success: boolean;
        message: string;
        waiter?: undefined;
    } | {
        success: boolean;
        waiter: any;
        message?: undefined;
    }>;
    static getActiveWaiters(): Promise<{
        success: boolean;
        waiters: any[];
        count: number;
    }>;
    static updateWaiter(waiterId: string, data: UpdateWaiterData): Promise<{
        success: boolean;
        waiter: any;
        message: string;
    }>;
    static toggleWaiterStatus(waiterId: string, isActive: boolean): Promise<{
        success: boolean;
        waiter: any;
        message: string;
    }>;
    static changeWaiterPin(waiterId: string, newPin: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static incrementOrderCount(waiterId: string): Promise<{
        success: boolean;
        waiter: any;
    }>;
    static decrementOrderCount(waiterId: string): Promise<{
        success: boolean;
        waiter: any;
    }>;
    static getWaiterWithLeastOrders(): Promise<{
        success: boolean;
        message: string;
        waiter?: undefined;
    } | {
        success: boolean;
        waiter: any;
        message?: undefined;
    }>;
    static getWaiterStats(waiterId: string): Promise<{
        success: boolean;
        message: string;
        stats?: undefined;
    } | {
        success: boolean;
        stats: {
            waiterId: any;
            waiterCode: any;
            fullName: any;
            currentOrders: number;
            totalOrders: number;
            totalSales: string;
            completedOrders: number;
            cancelledOrders: number;
            avgCompletionTime: string | null;
        };
        message?: undefined;
    }>;
    static getWaiterCurrentOrders(waiterId: string): Promise<{
        success: boolean;
        orders: any[];
        count: number;
    }>;
    static deleteWaiter(waiterId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=WaiterService.d.ts.map