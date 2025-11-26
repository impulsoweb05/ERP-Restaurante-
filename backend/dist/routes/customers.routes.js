"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// CUSTOMERS ROUTES - Gestión de Clientes
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerService_1 = require("@services/CustomerService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET /customers - Obtener Todos los Clientes
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await CustomerService_1.CustomerService.getAllCustomers();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /customers/:id - Obtener Cliente por ID
router.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role === 'customer' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }
        const result = await CustomerService_1.CustomerService.getCustomerById(req.params.id);
        if (!result.success)
            return res.status(404).json(result);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /customers/phone/:phone - Buscar por Teléfono
router.get('/phone/:phone', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await CustomerService_1.CustomerService.getCustomerByPhone(req.params.phone);
        if (!result.success)
            return res.status(404).json(result);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /customers/:id - Actualizar Cliente
router.put('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role === 'customer' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, error: 'No autorizado' });
        }
        const result = await CustomerService_1.CustomerService.updateCustomer(req.params.id, req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// DELETE /customers/:id - Eliminar Cliente
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await CustomerService_1.CustomerService.deleteCustomer(req.params.id);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=customers.routes.js.map