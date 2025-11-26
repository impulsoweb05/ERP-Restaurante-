"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// KITCHEN ROUTES - Gestión de Cola de Cocina
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KitchenService_1 = require("@services/KitchenService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET /kitchen/queue - Cola Completa
router.get('/queue', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const status = req.query.status;
        const result = await KitchenService_1.KitchenService.getQueue(status);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /kitchen/queue/station/:station - Por Estación
router.get('/queue/station/:station', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.getQueueByStation(req.params.station);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /kitchen/queue/order/:orderId - Items de un Pedido
router.get('/queue/order/:orderId', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.getQueueByOrder(req.params.orderId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /kitchen/stats - Estadísticas de Cocina
router.get('/stats', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.getKitchenStats();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /kitchen/stations - Lista de Estaciones
router.get('/stations', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.getStations();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /kitchen/check-ready/:orderId - Verificar Pedido Listo
router.get('/check-ready/:orderId', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.checkOrderReady(req.params.orderId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /kitchen/queue/:id/start - Iniciar Preparación
router.put('/queue/:id/start', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.startPreparation(req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /kitchen/queue/:id/complete - Completar Item
router.put('/queue/:id/complete', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await KitchenService_1.KitchenService.completeItem(req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /kitchen/queue/:id/priority - Actualizar Prioridad
router.put('/queue/:id/priority', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { priority } = req.body;
        if (!priority)
            return res.status(400).json({ success: false, error: 'Prioridad requerida' });
        const result = await KitchenService_1.KitchenService.updatePriority(req.params.id, priority);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=kitchen.routes.js.map