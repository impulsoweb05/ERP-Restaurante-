/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU ROUTES
 * Rutas para endpoints de menú
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { MenuService } from '../services/MenuService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/menu
 * Obtener menú completo estructurado
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const menu = await MenuService.getFullMenu();
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error in GET /api/menu', error as Error);
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
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await MenuService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error in GET /api/menu/categories', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/menu/subcategories
 * Obtener subcategorías filtradas por category_id (query param)
 * CRÍTICO: Usado por frontends para navegación del menú
 */
router.get('/subcategories', async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category_id as string | undefined;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'category_id query parameter is required'
      });
    }

    const subcategories = await MenuService.getSubcategoriesByCategory(categoryId);
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    logger.error('Error in GET /api/menu/subcategories', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories'
    });
  }
});

/**
 * GET /api/menu/categories/:categoryId/subcategories
 * Obtener subcategorías de una categoría
 */
router.get('/categories/:categoryId/subcategories', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await MenuService.getSubcategoriesByCategory(categoryId);
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    logger.error('Error in GET /api/menu/categories/:categoryId/subcategories', error as Error);
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
router.get('/items', async (req: Request, res: Response) => {
  try {
    const items = await MenuService.getActiveMenuItems();
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('Error in GET /api/menu/items', error as Error);
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
router.get('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await MenuService.getItemById(itemId);

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
  } catch (error) {
    logger.error('Error in GET /api/menu/items/:itemId', error as Error);
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
router.get('/categories/:categoryId/items', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const items = await MenuService.getItemsByCategory(categoryId);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('Error in GET /api/menu/categories/:categoryId/items', error as Error);
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
router.get('/subcategories/:subcategoryId/items', async (req: Request, res: Response) => {
  try {
    const { subcategoryId } = req.params;
    const items = await MenuService.getItemsBySubcategory(subcategoryId);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error('Error in GET /api/menu/subcategories/:subcategoryId/items', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items by subcategory'
    });
  }
});

export default router;
