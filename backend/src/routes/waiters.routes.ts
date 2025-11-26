// ═════════════════════════════════════════════════════════════════════════════
// WAITERS ROUTES - Gestión de Meseros
// ═════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { WaiterService } from '@services/WaiterService';
import { authenticate, isWaiterOrAdmin, isAdmin } from '@middleware/auth.middleware';

const router = Router();

// GET /waiters - Obtener Todos los Meseros
router.get('/', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const result = await WaiterService.getAllWaiters(includeInactive);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /waiters/active - Meseros Activos
router.get('/active', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await WaiterService.getActiveWaiters();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /waiters/:id - Obtener Mesero por ID
router.get('/:id', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await WaiterService.getWaiterById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /waiters/:id/stats - Estadísticas de Mesero
router.get('/:id/stats', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await WaiterService.getWaiterStats(req.params.id);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /waiters/:id/orders - Pedidos Actuales del Mesero
router.get('/:id/orders', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await WaiterService.getWaiterCurrentOrders(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /waiters/:id - Actualizar Mesero
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await WaiterService.updateWaiter(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /waiters/:id/status - Activar/Desactivar
router.put('/:id/status', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const result = await WaiterService.toggleWaiterStatus(req.params.id, isActive);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /waiters/:id - Eliminar Mesero
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await WaiterService.deleteWaiter(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
