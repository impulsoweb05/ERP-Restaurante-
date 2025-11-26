"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA DE LOGGING
 * ═══════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWarn = exports.logDebug = exports.logError = exports.logInfo = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const isDevelopment = process.env.NODE_ENV === 'development';
/**
 * Configuración de Winston Logger
 */
const logger = winston_1.default.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), isDevelopment
        ? winston_1.default.format.colorize()
        : winston_1.default.format.uncolorize(), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
        const baseLog = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            return `${baseLog} ${JSON.stringify(meta, null, 2)}`;
        }
        return baseLog;
    })),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
    ],
});
exports.logger = logger;
/**
 * Logger shortcuts
 */
const logInfo = (message, meta) => {
    logger.info(message, meta);
};
exports.logInfo = logInfo;
const logError = (message, error, meta) => {
    if (error instanceof Error) {
        logger.error(message, { error: error.message, stack: error.stack, ...meta });
    }
    else {
        logger.error(message, { error, ...meta });
    }
};
exports.logError = logError;
const logDebug = (message, meta) => {
    logger.debug(message, meta);
};
exports.logDebug = logDebug;
const logWarn = (message, meta) => {
    logger.warn(message, meta);
};
exports.logWarn = logWarn;
//# sourceMappingURL=logger.js.map