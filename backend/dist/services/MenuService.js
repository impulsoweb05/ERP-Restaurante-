"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU SERVICE
 * Servicio para gestionar menú (lee PostgreSQL directo)
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class MenuService {
    /**
     * Obtener todas las categorías activas
     */
    static async getCategories() {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM menu_categories
         WHERE is_active = true
         ORDER BY display_order ASC, name ASC`);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error fetching categories', error);
            throw new Error('Failed to fetch menu categories');
        }
    }
    /**
     * Obtener subcategorías de una categoría
     */
    static async getSubcategoriesByCategory(categoryId) {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM menu_subcategories
         WHERE category_id = $1 AND is_active = true
         ORDER BY display_order ASC, name ASC`, [categoryId]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error fetching subcategories', error);
            throw new Error('Failed to fetch subcategories');
        }
    }
    /**
     * Obtener items activos del menú
     */
    static async getActiveMenuItems() {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM menu_items
         WHERE status = 'active'
         ORDER BY name ASC`);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error fetching menu items', error);
            throw new Error('Failed to fetch menu items');
        }
    }
    /**
     * Obtener items por categoría
     */
    static async getItemsByCategory(categoryId) {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM menu_items
         WHERE category_id = $1 AND status = 'active'
         ORDER BY name ASC`, [categoryId]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error fetching items by category', error);
            throw new Error('Failed to fetch items by category');
        }
    }
    /**
     * Obtener items por subcategoría
     */
    static async getItemsBySubcategory(subcategoryId) {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM menu_items
         WHERE subcategory_id = $1 AND status = 'active'
         ORDER BY name ASC`, [subcategoryId]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error fetching items by subcategory', error);
            throw new Error('Failed to fetch items by subcategory');
        }
    }
    /**
     * Obtener un item por ID
     */
    static async getItemById(itemId) {
        try {
            const result = await (0, database_1.query)(`SELECT * FROM menu_items WHERE id = $1`, [itemId]);
            return result.rows[0] || null;
        }
        catch (error) {
            logger_1.logger.error('Error fetching item by id', error);
            throw new Error('Failed to fetch menu item');
        }
    }
    /**
     * Obtener menú completo estructurado
     */
    static async getFullMenu() {
        try {
            const categories = await this.getCategories();
            const menu = [];
            for (const category of categories) {
                const subcategories = await this.getSubcategoriesByCategory(category.id);
                const categoryData = {
                    ...category,
                    subcategories: []
                };
                for (const subcategory of subcategories) {
                    const items = await this.getItemsBySubcategory(subcategory.id);
                    categoryData.subcategories.push({
                        ...subcategory,
                        items
                    });
                }
                menu.push(categoryData);
            }
            return menu;
        }
        catch (error) {
            logger_1.logger.error('Error fetching full menu', error);
            throw new Error('Failed to fetch full menu');
        }
    }
}
exports.MenuService = MenuService;
//# sourceMappingURL=MenuService.js.map