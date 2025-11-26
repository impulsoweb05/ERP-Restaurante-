"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE DIRECTUS SDK
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectusConfig = exports.validateDirectusConnection = exports.getDirectusClient = void 0;
const sdk_1 = require("@directus/sdk");
const logger_1 = require("@utils/logger");
const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN || '';
/**
 * Cliente de Directus singleton
 * Se crea una sola instancia para toda la aplicación
 */
let directusClient = null;
/**
 * Obtener o crear cliente de Directus
 */
const getDirectusClient = () => {
    if (!directusClient) {
        directusClient = (0, sdk_1.createClient)({
            url: directusUrl,
            token: directusToken,
            auth: {
                staticToken: directusToken,
            },
        });
        logger_1.logger.info('Directus client initialized', { url: directusUrl });
    }
    return directusClient;
};
exports.getDirectusClient = getDirectusClient;
/**
 * Validar conexión con Directus
 */
const validateDirectusConnection = async () => {
    try {
        const client = (0, exports.getDirectusClient)();
        const response = await fetch(`${directusUrl}/server/health`);
        const isHealthy = response.ok;
        if (isHealthy) {
            logger_1.logger.info('✅ Directus connection verified');
        }
        else {
            logger_1.logger.error('❌ Directus health check failed', { status: response.status });
        }
        return isHealthy;
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to connect to Directus', { error: String(error) });
        return false;
    }
};
exports.validateDirectusConnection = validateDirectusConnection;
/**
 * Obtener configuración de Directus
 */
const getDirectusConfig = () => ({
    url: directusUrl,
    hasToken: !!directusToken,
});
exports.getDirectusConfig = getDirectusConfig;
exports.default = exports.getDirectusClient;
//# sourceMappingURL=directus.js.map