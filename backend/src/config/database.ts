/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE POSTGRESQL
 * Conexión directa a PostgreSQL sin intermediarios
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pgConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'restaurante_erp',
};

/**
 * Pool de conexiones PostgreSQL
 */
let pool: Pool | null = null;

/**
 * Obtener o crear pool de conexiones
 */
export const getPool = () => {
  if (!pool) {
    pool = new Pool(pgConfig);

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    logger.info('PostgreSQL pool initialized', {
      host: pgConfig.host,
      port: pgConfig.port,
      database: pgConfig.database,
    });
  }

  return pool;
};

/**
 * Ejecutar query en la base de datos
 */
export const query = async (text: string, params?: any[]) => {
  const client = getPool();
  try {
    return await client.query(text, params);
  } catch (error) {
    logger.error('Database query error', { query: text, error: String(error) });
    throw error;
  }
};

/**
 * Validar conexión con PostgreSQL
 */
export const validateDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getPool();
    const result = await client.query('SELECT NOW()');
    if (result.rows.length > 0) {
      logger.info('✅ PostgreSQL connection verified');
      return true;
    }
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL', { error: String(error) });
  }
  return false;
};

/**
 * Cerrar pool de conexiones
 */
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
};

export default getPool;
