"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// WAITERS ROUTES - Gestión de Meseros
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WaiterService_1 = require("@services/WaiterService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET /waiters - Obtener Todos los Meseros
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const result = await WaiterService_1.WaiterService.getAllWaiters(includeInactive);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /waiters/active - Meseros Activos
router.get('/active', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await WaiterService_1.WaiterService.getActiveWaiters();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /waiters/:id - Obtener Mesero por ID
router.get('/:id', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await WaiterService_1.WaiterService.getWaiterById(req.params.id);
        if (!result.success)
            return res.status(404).json(result);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /waiters/:id/stats - Estadísticas de Mesero
router.get('/:id/stats', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await WaiterService_1.WaiterService.getWaiterStats(req.params.id);
        if (!result.success)
            return res.status(404).json(result);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /waiters/:id/orders - Pedidos Actuales del Mesero
router.get('/:id/orders', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await WaiterService_1.WaiterService.getWaiterCurrentOrders(req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /waiters/:id - Actualizar Mesero
router.put('/:id', auth_middleware_1.authenticate, auth_middleware_1.isAdmin, async (req, res) => {
    try {
        const result = await WaiterService_1.WaiterService.updateWaiter(req.params.id, req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /waiters/:id/status - Activar/Desactivar
router.put('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.isAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;
        const result = await WaiterService_1.WaiterService.toggleWaiterStatus(req.params.id, isActive);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// DELETE /waiters/:id - Eliminar Mesero
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.isAdmin, async (req, res) => {
    try {
        const result = await WaiterService_1.WaiterService.deleteWaiter(req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=waiters.routes.js.map