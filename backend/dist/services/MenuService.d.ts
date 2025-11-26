/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU SERVICE
 * Servicio para gestionar menú (lee PostgreSQL directo)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { MenuItem, MenuCategory, MenuSubcategory } from '../types';
export declare class MenuService {
    /**
     * Obtener todas las categorías activas
     */
    static getCategories(): Promise<MenuCategory[]>;
    /**
     * Obtener subcategorías de una categoría
     */
    static getSubcategoriesByCategory(categoryId: string): Promise<MenuSubcategory[]>;
    /**
     * Obtener items activos del menú
     */
    static getActiveMenuItems(): Promise<MenuItem[]>;
    /**
     * Obtener items por categoría
     */
    static getItemsByCategory(categoryId: string): Promise<MenuItem[]>;
    /**
     * Obtener items por subcategoría
     */
    static getItemsBySubcategory(subcategoryId: string): Promise<MenuItem[]>;
    /**
     * Obtener un item por ID
     */
    static getItemById(itemId: string): Promise<MenuItem | null>;
    /**
     * Obtener menú completo estructurado
     */
    static getFullMenu(): Promise<any>;
}
//# sourceMappingURL=MenuService.d.ts.map