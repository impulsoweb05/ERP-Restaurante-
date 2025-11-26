/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE POSTGRESQL
 * Conexión directa a PostgreSQL sin intermediarios
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Pool } from 'pg';
/**
 * Obtener o crear pool de conexiones
 */
export declare const getPool: () => Pool;
/**
 * Ejecutar query en la base de datos
 */
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
/**
 * Validar conexión con PostgreSQL
 */
export declare const validateDatabaseConnection: () => Promise<boolean>;
/**
 * Cerrar pool de conexiones
 */
export declare const closePool: () => Promise<void>;
export default getPool;
//# sourceMappingURL=database.d.ts.map