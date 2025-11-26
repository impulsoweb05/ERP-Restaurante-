"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// ORDERS ROUTES - Gestión de Pedidos
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderService_1 = require("@services/OrderService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// POST /orders - Crear Pedido
router.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const result = await OrderService_1.OrderService.createOrder(req.body);
        res.status(201).json({ success: true, ...result });
    }
    catch (error) {
        logger_1.logger.error('Error al crear pedido', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /orders/:id - Obtener Pedido por ID
router.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const result = await OrderService_1.OrderService.getOrderById(req.params.id);
        if (!result)
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        res.json({ success: true, ...result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /orders/customer/:customerId - Pedidos del Cliente
router.get('/customer/:customerId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role === 'customer' && req.user.id !== req.params.customerId) {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }
        const result = await OrderService_1.OrderService.getOrdersByCustomer(req.params.customerId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /orders/:id/status - Actualizar Estado del Pedido
router.put('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status)
            return res.status(400).json({ success: false, error: 'Estado requerido' });
        const result = await OrderService_1.OrderService.updateOrderStatus(req.params.id, status);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /orders/:id/cancel - Cancelar Pedido
router.put('/:id/cancel', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const result = await OrderService_1.OrderService.cancelOrder(req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=orders.routes.js.map