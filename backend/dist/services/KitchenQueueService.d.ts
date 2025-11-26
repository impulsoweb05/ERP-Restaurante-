/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITCHEN QUEUE SERVICE
 * Gestiona la cola de cocina con prioridades
 * CRÍTICO: WebSocket notifica a cocina
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { KitchenQueue, KitchenQueueStatus, OrderType } from '@types';
export declare class KitchenQueueService {
    /**
     * Calcular prioridad basada en tipo de orden y tiempo espera
     * - delivery: 5
     * - takeout: 4
     * - dine_in: 3
     * - +1 si tiempo espera > 30 min
     * - +1 si tiempo espera > 60 min
     */
    static calculatePriority(orderType: OrderType, createdAt: Date): number;
    /**
     * Agregar item a la cola de cocina
     */
    static addToQueue(orderItemId: string, orderType: OrderType, createdAt: Date, estimatedTime?: number, station?: string): Promise<KitchenQueue>;
    /**
     * Obtener cola de cocina ordenada por prioridad
     */
    static getQueue(): Promise<KitchenQueue[]>;
    /**
     * Actualizar estado de item en la cola
     */
    static updateQueueItemStatus(queueItemId: string, status: KitchenQueueStatus): Promise<KitchenQueue>;
    /**
     * Obtener item de la cola
     */
    static getQueueItem(queueItemId: string): Promise<KitchenQueue>;
    /**
     * Asignar estación de trabajo
     */
    static assignStation(queueItemId: string, station: string): Promise<KitchenQueue>;
    /**
     * Obtener items completados en un rango de tiempo (para reportes)
     */
    static getCompletedItems(hours?: number): Promise<KitchenQueue[]>;
    /**
     * Obtener tiempo promedio de preparación
     */
    static getAveragePreparationTime(): Promise<number>;
}
//# sourceMappingURL=KitchenQueueService.d.ts.map