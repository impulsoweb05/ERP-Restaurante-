// ═════════════════════════════════════════════════════════════════════════════
// ORDERS ROUTES - Gestión de Pedidos
// ═════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { OrderService } from '@services/OrderService';
import { authenticate, isWaiterOrAdmin } from '@middleware/auth.middleware';

const router = Router();

// POST /orders - Crear Pedido
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await OrderService.createOrder(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    console.error('❌ Error al crear pedido:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /orders/:id - Obtener Pedido por ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await OrderService.getOrderById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /orders/customer/:customerId - Pedidos del Cliente
router.get('/customer/:customerId', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'customer' && req.user.id !== req.params.customerId) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }
    const result = await OrderService.getOrdersByCustomer(req.params.customerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /orders/:id/status - Actualizar Estado del Pedido
router.put('/:id/status', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Estado requerido' });
    const result = await OrderService.updateOrderStatus(req.params.id, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /orders/:id/cancel - Cancelar Pedido
router.put('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await OrderService.cancelOrder(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
