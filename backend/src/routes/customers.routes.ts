// ═════════════════════════════════════════════════════════════════════════════
// CUSTOMERS ROUTES - Gestión de Clientes
// ═════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { CustomerService } from '@services/CustomerService';
import { authenticate, isWaiterOrAdmin } from '@middleware/auth.middleware';

const router = Router();

// GET /customers - Obtener Todos los Clientes
router.get('/', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await CustomerService.getAllCustomers();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /customers/:id - Obtener Cliente por ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'customer' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }
    const result = await CustomerService.getCustomerById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /customers/phone/:phone - Buscar por Teléfono
router.get('/phone/:phone', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await CustomerService.getCustomerByPhone(req.params.phone);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /customers/:id - Actualizar Cliente
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'customer' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }
    const result = await CustomerService.updateCustomer(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /customers/:id - Eliminar Cliente
router.delete('/:id', authenticate, isWaiterOrAdmin, async (req: Request, res: Response) => {
  try {
    const result = await CustomerService.deleteCustomer(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
