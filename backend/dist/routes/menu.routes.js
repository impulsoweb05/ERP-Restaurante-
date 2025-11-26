"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU ROUTES
 * Rutas para endpoints de menú
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MenuService_1 = require("../services/MenuService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/**
 * GET /api/menu
 * Obtener menú completo estructurado
 */
router.get('/', async (req, res) => {
    try {
        const menu = await MenuService_1.MenuService.getFullMenu();
        res.json({
            success: true,
            data: menu
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu'
        });
    }
});
/**
 * GET /api/menu/categories
 * Obtener todas las categorías
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await MenuService_1.MenuService.getCategories();
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu/categories', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});
/**
 * GET /api/menu/categories/:categoryId/subcategories
 * Obtener subcategorías de una categoría
 */
router.get('/categories/:categoryId/subcategories', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await MenuService_1.MenuService.getSubcategoriesByCategory(categoryId);
        res.json({
            success: true,
            data: subcategories
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu/categories/:categoryId/subcategories', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subcategories'
        });
    }
});
/**
 * GET /api/menu/items
 * Obtener todos los items activos
 */
router.get('/items', async (req, res) => {
    try {
        const items = await MenuService_1.MenuService.getActiveMenuItems();
        res.json({
            success: true,
            data: items
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu/items', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu items'
        });
    }
});
/**
 * GET /api/menu/items/:itemId
 * Obtener un item específico
 */
router.get('/items/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await MenuService_1.MenuService.getItemById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }
        res.json({
            success: true,
            data: item
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu/items/:itemId', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu item'
        });
    }
});
/**
 * GET /api/menu/categories/:categoryId/items
 * Obtener items de una categoría
 */
router.get('/categories/:categoryId/items', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const items = await MenuService_1.MenuService.getItemsByCategory(categoryId);
        res.json({
            success: true,
            data: items
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu/categories/:categoryId/items', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch items by category'
        });
    }
});
/**
 * GET /api/menu/subcategories/:subcategoryId/items
 * Obtener items de una subcategoría
 */
router.get('/subcategories/:subcategoryId/items', async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const items = await MenuService_1.MenuService.getItemsBySubcategory(subcategoryId);
        res.json({
            success: true,
            data: items
        });
    }
    catch (error) {
        logger_1.logger.error('Error in GET /api/menu/subcategories/:subcategoryId/items', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch items by subcategory'
        });
    }
});
exports.default = router;
//# sourceMappingURL=menu.routes.js.map