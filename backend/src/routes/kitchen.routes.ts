// ═════════════════════════════════════════════════════════════════════════════
// KITCHEN ROUTES - Gestión de Cola de Cocina
// ═════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { KitchenService } from '@services/KitchenService';
import { authenticate, isWaiterOrAdmin } from '@middleware/auth.middleware';

const router = Router();

// GET /kitchen/queue - Cola Completa
router.get('/queue', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const result = await KitchenService.getQueue(status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /kitchen/queue/station/:station - Por Estación
router.get('/queue/station/:station', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.getQueueByStation(req.params.station);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /kitchen/queue/order/:orderId - Items de un Pedido
router.get('/queue/order/:orderId', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.getQueueByOrder(req.params.orderId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /kitchen/stats - Estadísticas de Cocina
router.get('/stats', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.getKitchenStats();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /kitchen/stations - Lista de Estaciones
router.get('/stations', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.getStations();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /kitchen/check-ready/:orderId - Verificar Pedido Listo
router.get('/check-ready/:orderId', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.checkOrderReady(req.params.orderId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /kitchen/queue/:id/start - Iniciar Preparación
router.put('/queue/:id/start', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.startPreparation(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /kitchen/queue/:id/complete - Completar Item
router.put('/queue/:id/complete', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await KitchenService.completeItem(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /kitchen/queue/:id/priority - Actualizar Prioridad
router.put('/queue/:id/priority', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { priority } = req.body;
    if (!priority) return res.status(400).json({ success: false, error: 'Prioridad requerida' });
    const result = await KitchenService.updatePriority(req.params.id, priority);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
