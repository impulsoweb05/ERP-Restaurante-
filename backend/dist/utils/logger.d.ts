/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA DE LOGGING
 * ═══════════════════════════════════════════════════════════════════════════
 */
import winston from 'winston';
/**
 * Configuración de Winston Logger
 */
declare const logger: winston.Logger;
export { logger };
/**
 * Logger shortcuts
 */
export declare const logInfo: (message: string, meta?: Record<string, any>) => void;
export declare const logError: (message: string, error?: Error | string, meta?: Record<string, any>) => void;
export declare const logDebug: (message: string, meta?: Record<string, any>) => void;
export declare const logWarn: (message: string, meta?: Record<string, any>) => void;
//# sourceMappingURL=logger.d.ts.map