/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BACKEND - SISTEMA ERP RESTAURANTE
 * Servidor Express + WebSocket
 * Puerto: 4000
 * ═══════════════════════════════════════════════════════════════════════════
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { validateDatabaseConnection, closePool } from './config/database';
import { WebSocketService } from './services/WebSocketService';
import { CronJobs } from './config/cron';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

// Importar rutas
import menuRoutes from './routes/menu.routes';
import scheduleRoutes from './routes/schedule.routes';
import authRoutes from './routes/auth.routes';
import reservationsRoutes from './routes/reservations.routes';
import ordersRoutes from './routes/orders.routes';
import customersRoutes from './routes/customers.routes';
import tablesRoutes from './routes/tables.routes';
import waitersRoutes from './routes/waiters.routes';
import kitchenRoutes from './routes/kitchen.routes';
import chatRoutes from './routes/chat.routes';

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES DE SEGURIDAD
// ═══════════════════════════════════════════════════════════════════════════

app.use(helmet());

const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS DE SALUD
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', (req: Request, res: Response) => {
  const wsStats = WebSocketService.getStats();
  const cronStatus = CronJobs.getStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    websocket: {
      connected: wsStats.totalClients,
      authenticated: wsStats.authenticatedClients,
      kitchen: wsStats.kitchenClients,
      byRole: wsStats.clientsByRole
    },
    cron: {
      totalJobs: cronStatus.totalJobs,
      jobs: cronStatus.jobs
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RUTAS API
// ═══════════════════════════════════════════════════════════════════════════

// Rutas públicas y de autenticación
app.use('/api/menu', menuRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);  // Widget Chat y State Machine

// Rutas protegidas (requieren autenticación)
app.use('/api/reservations', reservationsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/waiters', waitersRoutes);
app.use('/api/kitchen', kitchenRoutes);

// ═══════════════════════════════════════════════════════════════════════════
// MANEJO DE ERRORES (DEBE SER LO ÚLTIMO)
// ═══════════════════════════════════════════════════════════════════════════

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Error handler centralizado
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════════════

const startServer = async () => {
  try {
    logger.info('🔍 Validating PostgreSQL connection...');
    const dbConnected = await validateDatabaseConnection();

    if (!dbConnected) {
      logger.warn('⚠️  PostgreSQL not available yet. Will retry on first request.');
    }

    // Crear servidor HTTP
    const server = createServer(app);

    // Inicializar WebSocket
    WebSocketService.initialize(server);
    logger.info('✅ WebSocket Server initialized on ws://localhost:' + PORT + '/ws');

    // Inicializar Cron Jobs
    CronJobs.initialize();

    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(
        `✅ Backend running at http://localhost:${PORT}`,
        {
          environment: NODE_ENV,
          database: dbConnected ? '✅' : '⚠️ (retrying)',
          websocket: '✅ /ws'
        }
      );
    });

    // Manejo de shutdown graceful
    const shutdown = async () => {
      logger.info('🛑 Shutting down gracefully...');

      // Detener cron jobs
      CronJobs.stopAll();

      // Cerrar conexiones WebSocket
      WebSocketService.closeAll();

      // Cerrar pool de base de datos
      await closePool();

      // Cerrar servidor HTTP
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('❌ Failed to start server', error as Error);
    process.exit(1);
  }
};

// Ejecutar si este es el archivo principal
if (require.main === module) {
  startServer();
}

export default app;
