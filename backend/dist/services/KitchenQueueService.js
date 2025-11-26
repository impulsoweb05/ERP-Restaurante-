"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITCHEN QUEUE SERVICE
 * Gestiona la cola de cocina con prioridades
 * CRÍTICO: WebSocket notifica a cocina
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenQueueService = void 0;
const database_1 = require("@config/database");
const errorHandler_1 = require("@middleware/errorHandler");
const _types_1 = require("@types");
const logger_1 = require("@utils/logger");
class KitchenQueueService {
    /**
     * Calcular prioridad basada en tipo de orden y tiempo espera
     * - delivery: 5
     * - takeout: 4
     * - dine_in: 3
     * - +1 si tiempo espera > 30 min
     * - +1 si tiempo espera > 60 min
     */
    static calculatePriority(orderType, createdAt) {
        let priority = 3; // default dine_in
        if (orderType === _types_1.OrderType.DELIVERY) {
            priority = 5;
        }
        else if (orderType === _types_1.OrderType.TAKEOUT) {
            priority = 4;
        }
        // Calcular tiempo de espera
        const now = new Date();
        const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        if (minutesPassed > 60) {
            priority += 1;
        }
        else if (minutesPassed > 30) {
            priority += 1;
        }
        // Máximo 5
        return Math.min(priority, 5);
    }
    /**
     * Agregar item a la cola de cocina
     */
    static async addToQueue(orderItemId, orderType, createdAt, estimatedTime, station) {
        try {
            const priority = this.calculatePriority(orderType, createdAt);
            const directus = (0, database_1.getDirectusClient)();
            const newQueueItem = await directus.request({
                method: 'post',
                path: '/items/kitchen_queue',
                body: {
                    order_item_id: orderItemId,
                    priority,
                    status: 'queued',
                    assigned_station: station || null,
                    estimated_time: estimatedTime || null,
                },
            });
            logger_1.logger.info('Item added to kitchen queue', {
                queueItemId: newQueueItem.id,
                orderItemId,
                priority,
            });
            return newQueueItem;
        }
        catch (error) {
            logger_1.logger.error('Failed to add item to queue', error);
            throw errorHandler_1.Errors.EXTERNAL_SERVICE_ERROR('Directus');
        }
    }
    /**
     * Obtener cola de cocina ordenada por prioridad
     */
    static async getQueue() {
        try {
            const directus = (0, database_1.getDirectusClient)();
            const result = await directus.request({
                method: 'get',
                path: '/items/kitchen_queue',
                params: {
                    filter: { status: { _in: ['queued', 'preparing'] } },
                    sort: ['-priority', 'created_at'],
                },
            });
            return result.data || [];
        }
        catch (error) {
            logger_1.logger.error('Failed to get kitchen queue', error);
            throw errorHandler_1.Errors.EXTERNAL_SERVICE_ERROR('Directus');
        }
    }
    /**
     * Actualizar estado de item en la cola
     */
    static async updateQueueItemStatus(queueItemId, status) {
        try {
            const directus = (0, database_1.getDirectusClient)();
            const updates = { status };
            if (status === 'preparing') {
                updates.started_at = new Date().toISOString();
            }
            if (status === 'ready') {
                updates.completed_at = new Date().toISOString();
            }
            const updated = await directus.request({
                method: 'patch',
                path: `/items/kitchen_queue/${queueItemId}`,
                body: updates,
            });
            logger_1.logger.info('Kitchen queue item status updated', { queueItemId, status });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Failed to update queue item status', error);
            throw errorHandler_1.Errors.EXTERNAL_SERVICE_ERROR('Directus');
        }
    }
    /**
     * Obtener item de la cola
     */
    static async getQueueItem(queueItemId) {
        try {
            const directus = (0, database_1.getDirectusClient)();
            const result = await directus.request({
                method: 'get',
                path: `/items/kitchen_queue/${queueItemId}`,
            });
            if (!result) {
                throw errorHandler_1.Errors.NOT_FOUND('Queue item');
            }
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('NOT_FOUND')) {
                throw error;
            }
            logger_1.logger.error('Failed to get queue item', error);
            throw errorHandler_1.Errors.EXTERNAL_SERVICE_ERROR('Directus');
        }
    }
    /**
     * Asignar estación de trabajo
     */
    static async assignStation(queueItemId, station) {
        try {
            const directus = (0, database_1.getDirectusClient)();
            const updated = await directus.request({
                method: 'patch',
                path: `/items/kitchen_queue/${queueItemId}`,
                body: { assigned_station: station },
            });
            logger_1.logger.info('Station assigned to queue item', { queueItemId, station });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Failed to assign station', error);
            throw errorHandler_1.Errors.EXTERNAL_SERVICE_ERROR('Directus');
        }
    }
    /**
     * Obtener items completados en un rango de tiempo (para reportes)
     */
    static async getCompletedItems(hours = 24) {
        try {
            const directus = (0, database_1.getDirectusClient)();
            const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
            const result = await directus.request({
                method: 'get',
                path: '/items/kitchen_queue',
                params: {
                    filter: {
                        _and: [
                            { status: { _eq: 'ready' } },
                            { completed_at: { _gte: since } },
                        ],
                    },
                    sort: ['-completed_at'],
                },
            });
            return result.data || [];
        }
        catch (error) {
            logger_1.logger.error('Failed to get completed items', error);
            throw errorHandler_1.Errors.EXTERNAL_SERVICE_ERROR('Directus');
        }
    }
    /**
     * Obtener tiempo promedio de preparación
     */
    static async getAveragePreparationTime() {
        try {
            const completedItems = await this.getCompletedItems(24);
            if (completedItems.length === 0) {
                return 0;
            }
            const totalTime = completedItems.reduce((sum, item) => {
                if (item.started_at && item.completed_at) {
                    const start = new Date(item.started_at).getTime();
                    const end = new Date(item.completed_at).getTime();
                    return sum + (end - start) / 1000 / 60; // Convert to minutes
                }
                return sum;
            }, 0);
            return Math.round(totalTime / completedItems.length);
        }
        catch (error) {
            logger_1.logger.error('Failed to get average preparation time', error);
            return 0;
        }
    }
}
exports.KitchenQueueService = KitchenQueueService;
//# sourceMappingURL=KitchenQueueService.js.map