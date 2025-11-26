/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU SERVICE
 * Servicio para gestionar menú (lee PostgreSQL directo)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { query } from '../config/database';
import { MenuItem, MenuCategory, MenuSubcategory } from '../types';
import { logger } from '../utils/logger';

export class MenuService {
  /**
   * Obtener todas las categorías activas
   */
  static async getCategories(): Promise<MenuCategory[]> {
    try {
      const result = await query(
        `SELECT * FROM menu_categories
         WHERE is_active = true
         ORDER BY display_order ASC, name ASC`
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching categories', error as Error);
      throw new Error('Failed to fetch menu categories');
    }
  }

  /**
   * Obtener subcategorías de una categoría
   */
  static async getSubcategoriesByCategory(categoryId: string): Promise<MenuSubcategory[]> {
    try {
      const result = await query(
        `SELECT * FROM menu_subcategories
         WHERE category_id = $1 AND is_active = true
         ORDER BY display_order ASC, name ASC`,
        [categoryId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching subcategories', error as Error);
      throw new Error('Failed to fetch subcategories');
    }
  }

  /**
   * Obtener items activos del menú
   */
  static async getActiveMenuItems(): Promise<MenuItem[]> {
    try {
      const result = await query(
        `SELECT * FROM menu_items
         WHERE status = 'active'
         ORDER BY name ASC`
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching menu items', error as Error);
      throw new Error('Failed to fetch menu items');
    }
  }

  /**
   * Obtener items por categoría
   */
  static async getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    try {
      const result = await query(
        `SELECT * FROM menu_items
         WHERE category_id = $1 AND status = 'active'
         ORDER BY name ASC`,
        [categoryId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching items by category', error as Error);
      throw new Error('Failed to fetch items by category');
    }
  }

  /**
   * Obtener items por subcategoría
   */
  static async getItemsBySubcategory(subcategoryId: string): Promise<MenuItem[]> {
    try {
      const result = await query(
        `SELECT * FROM menu_items
         WHERE subcategory_id = $1 AND status = 'active'
         ORDER BY name ASC`,
        [subcategoryId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching items by subcategory', error as Error);
      throw new Error('Failed to fetch items by subcategory');
    }
  }

  /**
   * Obtener un item por ID
   */
  static async getItemById(itemId: string): Promise<MenuItem | null> {
    try {
      const result = await query(
        `SELECT * FROM menu_items WHERE id = $1`,
        [itemId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching item by id', error as Error);
      throw new Error('Failed to fetch menu item');
    }
  }

  /**
   * Obtener menú completo estructurado
   */
  static async getFullMenu(): Promise<any> {
    try {
      const categories = await this.getCategories();
      const menu = [];

      for (const category of categories) {
        const subcategories = await this.getSubcategoriesByCategory(category.id);
        const categoryData: any = {
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
    } catch (error) {
      logger.error('Error fetching full menu', error as Error);
      throw new Error('Failed to fetch full menu');
    }
  }
}
