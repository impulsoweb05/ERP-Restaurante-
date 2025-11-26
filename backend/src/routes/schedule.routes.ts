/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULE ROUTES
 * Rutas para validación de horarios (CRÍTICA para chat niveles 0, 5, 14)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { ScheduleService } from '../services/ScheduleService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/schedule/check
 * Validar si el restaurante está abierto ahora
 * CRÍTICO: Usado en niveles 0, 5 y 14 del chat
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    const result = await ScheduleService.isOpenNow();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error in GET /api/schedule/check', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to check schedule'
    });
  }
});

/**
 * GET /api/schedule
 * Obtener todos los horarios de la semana
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await ScheduleService.getAllSchedules();
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    logger.error('Error in GET /api/schedule', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedules'
    });
  }
});

/**
 * GET /api/schedule/:dayOfWeek
 * Obtener horario de un día específico
 */
router.get('/:dayOfWeek', async (req: Request, res: Response) => {
  try {
    const { dayOfWeek } = req.params;
    const schedule = await ScheduleService.getScheduleByDay(dayOfWeek.toUpperCase() as any);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found for this day'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error in GET /api/schedule/:dayOfWeek', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule'
    });
  }
});

export default router;
