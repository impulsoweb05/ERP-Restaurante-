// ═════════════════════════════════════════════════════════════════════════════
// RESERVATIONS ROUTES - Gestión de Reservas
// ═════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { ReservationService } from '@services/ReservationService';
import { NotificationService } from '@services/NotificationService';
import { authenticate, isWaiterOrAdmin, isCustomer } from '@middleware/auth.middleware';

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /reservations - Crear Reserva
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      customer_id,
      table_id,
      reservation_date,
      reservation_time,
      party_size,
      customer_name,
      customer_phone,
      customer_email,
      special_requests
    } = req.body;

    // Validaciones básicas
    if (!customer_id || !table_id || !reservation_date || !reservation_time || !party_size || !customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: customer_id, table_id, reservation_date, reservation_time, party_size, customer_name, customer_phone'
      });
    }

    // Crear reserva
    const result = await ReservationService.createReservation({
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
    NotificationService.sendReservationConfirmedNotification(
      result.reservation.id,
      customer_phone,
      result.reservation.reservation_number,
      reservation_date,
      reservation_time
    ).catch(err => console.error('Error al enviar notificación:', err));

    res.status(201).json(result);

  } catch (error: any) {
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
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReservationService.getReservationById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error: any) {
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
router.get('/customer/:customerId', authenticate, async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    // Verificar que el usuario es el propietario o admin/waiter
    if (req.user?.role === 'customer' && req.user.id !== customerId) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para ver reservas de otro cliente'
      });
    }

    const result = await ReservationService.getReservationsByCustomer(customerId);

    res.json(result);

  } catch (error: any) {
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
router.get('/date/:date', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const { status } = req.query;

    const result = await ReservationService.getReservationsByDate(
      date,
      status as string
    );

    res.json(result);

  } catch (error: any) {
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
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reservation_date, reservation_time, party_size, table_id, special_requests } = req.body;

    const result = await ReservationService.updateReservation(id, {
      reservation_date,
      reservation_time,
      party_size,
      table_id,
      special_requests
    });

    res.json(result);

  } catch (error: any) {
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
router.put('/:id/confirm', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReservationService.confirmReservation(id);

    res.json(result);

  } catch (error: any) {
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
router.put('/:id/activate', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReservationService.activateReservation(id);

    res.json(result);

  } catch (error: any) {
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
router.put('/:id/complete', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReservationService.completeReservation(id);

    res.json(result);

  } catch (error: any) {
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
router.put('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await ReservationService.cancelReservation(id, reason);

    res.json(result);

  } catch (error: any) {
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
router.put('/:id/no-show', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await ReservationService.markAsNoShow(id);

    res.json(result);

  } catch (error: any) {
    console.error('❌ Error al marcar no-show:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
