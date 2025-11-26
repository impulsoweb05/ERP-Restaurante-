"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// TABLES ROUTES - Gestión de Mesas
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TableService_1 = require("@services/TableService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET /tables - Obtener Todas las Mesas
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await TableService_1.TableService.getAllTables();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /tables/available - Mesas Disponibles
router.get('/available', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const minCapacity = req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined;
        const result = await TableService_1.TableService.getAvailableTables(minCapacity);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /tables/status/:status - Mesas por Estado
router.get('/status/:status', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await TableService_1.TableService.getTablesByStatus(req.params.status);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /tables/stats - Estadísticas de Mesas
router.get('/stats', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const result = await TableService_1.TableService.getTableStats();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /tables - Crear Mesa
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.isAdmin, async (req, res) => {
    try {
        const result = await TableService_1.TableService.createTable(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /tables/:id - Actualizar Mesa
router.put('/:id', auth_middleware_1.authenticate, auth_middleware_1.isAdmin, async (req, res) => {
    try {
        const result = await TableService_1.TableService.updateTable(req.params.id, req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /tables/:id/status - Actualizar Estado
router.put('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const result = await TableService_1.TableService.updateTableStatus(req.params.id, status);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /tables/:id/release - Liberar Mesa
router.put('/:id/release', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const setToAvailable = req.body.setToAvailable === true;
        const result = await TableService_1.TableService.releaseTable(req.params.id, setToAvailable);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tables.routes.js.map