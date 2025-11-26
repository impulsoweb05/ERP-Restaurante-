"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// RESERVATIONS ROUTES - Gestión de Reservas
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReservationService_1 = require("@services/ReservationService");
const NotificationService_1 = require("@services/NotificationService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /reservations - Crear Reserva
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { customer_id, table_id, reservation_date, reservation_time, party_size, customer_name, customer_phone, customer_email, special_requests } = req.body;
        // Validaciones básicas
        if (!customer_id || !table_id || !reservation_date || !reservation_time || !party_size || !customer_name || !customer_phone) {
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos: customer_id, table_id, reservation_date, reservation_time, party_size, customer_name, customer_phone'
            });
        }
        // Crear reserva
        const result = await ReservationService_1.ReservationService.createReservation({
            customer_id,
            table_id,
            reservation_date,
            reservation_time,
            party_size,
            customer_name,
            customer_phone,
            customer_email,
            special_requests
        });
        // Enviar notificación (no bloqueante)
        NotificationService_1.NotificationService.sendReservationConfirmedNotification(result.reservation.id, customer_phone, result.reservation.reservation_number, reservation_date, reservation_time).catch(err => console.error('Error al enviar notificación:', err));
        res.status(201).json(result);
    }
    catch (error) {
        console.error('❌ Error al crear reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /reservations/:id - Obtener Reserva por ID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ReservationService_1.ReservationService.getReservationById(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al obtener reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /reservations/customer/:customerId - Obtener Reservas de un Cliente
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/customer/:customerId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { customerId } = req.params;
        // Verificar que el usuario es el propietario o admin/waiter
        if (req.user?.role === 'customer' && req.user.id !== customerId) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para ver reservas de otro cliente'
            });
        }
        const result = await ReservationService_1.ReservationService.getReservationsByCustomer(customerId);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al obtener reservas del cliente:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /reservations/date/:date - Obtener Reservas por Fecha
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/date/:date', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { date } = req.params;
        const { status } = req.query;
        const result = await ReservationService_1.ReservationService.getReservationsByDate(date, status);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al obtener reservas por fecha:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /reservations/:id - Actualizar Reserva
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { reservation_date, reservation_time, party_size, table_id, special_requests } = req.body;
        const result = await ReservationService_1.ReservationService.updateReservation(id, {
            reservation_date,
            reservation_time,
            party_size,
            table_id,
            special_requests
        });
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al actualizar reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /reservations/:id/confirm - Confirmar Reserva
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/:id/confirm', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ReservationService_1.ReservationService.confirmReservation(id);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al confirmar reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /reservations/:id/activate - Activar Reserva (Cliente Llegó)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/:id/activate', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ReservationService_1.ReservationService.activateReservation(id);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al activar reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /reservations/:id/complete - Completar Reserva
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/:id/complete', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ReservationService_1.ReservationService.completeReservation(id);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al completar reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /reservations/:id/cancel - Cancelar Reserva
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/:id/cancel', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await ReservationService_1.ReservationService.cancelReservation(id, reason);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al cancelar reserva:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /reservations/:id/no-show - Marcar como No-Show
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/:id/no-show', auth_middleware_1.authenticate, auth_middleware_1.isWaiterOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ReservationService_1.ReservationService.markAsNoShow(id);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Error al marcar no-show:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=reservations.routes.js.map