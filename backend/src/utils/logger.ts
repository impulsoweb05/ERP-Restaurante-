/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SISTEMA DE LOGGING
 * ═══════════════════════════════════════════════════════════════════════════
 */

import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Configuración de Winston Logger
 */
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    isDevelopment
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const baseLog = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(meta).length > 0) {
        return `${baseLog} ${JSON.stringify(meta, null, 2)}`;
      }
      return baseLog;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

export { logger };

/**
 * Logger shortcuts
 */
export const logInfo = (message: string, meta?: Record<string, any>) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | string, meta?: Record<string, any>) => {
  if (error instanceof Error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta });
  } else {
    logger.error(message, { error, ...meta });
  }
};

export const logDebug = (message: string, meta?: Record<string, any>) => {
  logger.debug(message, meta);
};

export const logWarn = (message: string, meta?: Record<string, any>) => {
  logger.warn(message, meta);
};
