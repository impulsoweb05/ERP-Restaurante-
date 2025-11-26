// ═════════════════════════════════════════════════════════════════════════════
// TABLES ROUTES - Gestión de Mesas
// ═════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { TableService } from '@services/TableService';
import { authenticate, isWaiterOrAdmin, isAdmin } from '@middleware/auth.middleware';

const router = Router();

// GET /tables - Obtener Todas las Mesas
router.get('/', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await TableService.getAllTables();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /tables/available - Mesas Disponibles
router.get('/available', authenticate, async (req: Request, res: Response) => {
  try {
    const minCapacity = req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined;
    const result = await TableService.getAvailableTables(minCapacity);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /tables/status/:status - Mesas por Estado
router.get('/status/:status', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await TableService.getTablesByStatus(req.params.status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /tables/stats - Estadísticas de Mesas
router.get('/stats', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await TableService.getTableStats();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /tables - Crear Mesa
router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await TableService.createTable(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /tables/:id - Actualizar Mesa
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await TableService.updateTable(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /tables/:id/status - Actualizar Estado
router.put('/:id/status', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const result = await TableService.updateTableStatus(req.params.id, status);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /tables/:id/release - Liberar Mesa
router.put('/:id/release', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const setToAvailable = req.body.setToAvailable === true;
    const result = await TableService.releaseTable(req.params.id, setToAvailable);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
