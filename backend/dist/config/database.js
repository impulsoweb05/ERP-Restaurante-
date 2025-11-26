"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE POSTGRESQL
 * Conexión directa a PostgreSQL sin intermediarios
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.validateDatabaseConnection = exports.query = exports.getPool = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
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
let pool = null;
/**
 * Obtener o crear pool de conexiones
 */
const getPool = () => {
    if (!pool) {
        pool = new pg_1.Pool(pgConfig);
        pool.on('error', (err) => {
            logger_1.logger.error('Unexpected error on idle client', err);
        });
        logger_1.logger.info('PostgreSQL pool initialized', {
            host: pgConfig.host,
            port: pgConfig.port,
            database: pgConfig.database,
        });
    }
    return pool;
};
exports.getPool = getPool;
/**
 * Ejecutar query en la base de datos
 */
const query = async (text, params) => {
    const client = (0, exports.getPool)();
    try {
        return await client.query(text, params);
    }
    catch (error) {
        logger_1.logger.error('Database query error', { query: text, error: String(error) });
        throw error;
    }
};
exports.query = query;
/**
 * Validar conexión con PostgreSQL
 */
const validateDatabaseConnection = async () => {
    try {
        const client = (0, exports.getPool)();
        const result = await client.query('SELECT NOW()');
        if (result.rows.length > 0) {
            logger_1.logger.info('✅ PostgreSQL connection verified');
            return true;
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to connect to PostgreSQL', { error: String(error) });
    }
    return false;
};
exports.validateDatabaseConnection = validateDatabaseConnection;
/**
 * Cerrar pool de conexiones
 */
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        logger_1.logger.info('PostgreSQL pool closed');
    }
};
exports.closePool = closePool;
exports.default = exports.getPool;
//# sourceMappingURL=database.js.map