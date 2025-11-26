"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULE ROUTES
 * Rutas para validación de horarios (CRÍTICA para chat niveles 0, 5, 14)
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ScheduleService_1 = require("../services/ScheduleService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/**
 * GET /api/schedule/check
 * Validar si el restaurante está abierto ahora
 * CRÍTICO: Usado en niveles 0, 5 y 14 del chat
 */
router.get('/check', async (req, res) => {
    try {
        const result = await ScheduleService_1.ScheduleService.isOpenNow();
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/schedule/check', error);
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
router.get('/', async (req, res) => {
    try {
        const schedules = await ScheduleService_1.ScheduleService.getAllSchedules();
        res.json({
            success: true,
            data: schedules
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/schedule', error);
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
router.get('/:dayOfWeek', async (req, res) => {
    try {
        const { dayOfWeek } = req.params;
        const schedule = await ScheduleService_1.ScheduleService.getScheduleByDay(dayOfWeek.toUpperCase());
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
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/schedule/:dayOfWeek', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch schedule'
        });
    }
});
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map