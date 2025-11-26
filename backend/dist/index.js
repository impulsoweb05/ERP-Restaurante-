"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BACKEND - SISTEMA ERP RESTAURANTE
 * Servidor Express + WebSocket
 * Puerto: 4000
 * ═══════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
const WebSocketService_1 = require("./services/WebSocketService");
const cron_1 = require("./config/cron");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
// Importar rutas
const menu_routes_1 = __importDefault(require("./routes/menu.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const reservations_routes_1 = __importDefault(require("./routes/reservations.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const customers_routes_1 = __importDefault(require("./routes/customers.routes"));
const tables_routes_1 = __importDefault(require("./routes/tables.routes"));
const waiters_routes_1 = __importDefault(require("./routes/waiters.routes"));
const kitchen_routes_1 = __importDefault(require("./routes/kitchen.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES DE SEGURIDAD
// ═══════════════════════════════════════════════════════════════════════════
app.use((0, helmet_1.default)());
const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
const limiter = (0, express_rate_limit_1.default)({
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
app.get('/health', (req, res) => {
    const wsStats = WebSocketService_1.WebSocketService.getStats();
    const cronStatus = cron_1.CronJobs.getStatus();
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
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// ═══════════════════════════════════════════════════════════════════════════
// RUTAS API
// ═══════════════════════════════════════════════════════════════════════════
// Rutas públicas y de autenticación
app.use('/api/menu', menu_routes_1.default);
app.use('/api/schedule', schedule_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/chat', chat_routes_1.default); // Widget Chat y State Machine
// Rutas protegidas (requieren autenticación)
app.use('/api/reservations', reservations_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/customers', customers_routes_1.default);
app.use('/api/tables', tables_routes_1.default);
app.use('/api/waiters', waiters_routes_1.default);
app.use('/api/kitchen', kitchen_routes_1.default);
// ═══════════════════════════════════════════════════════════════════════════
// MANEJO DE ERRORES (DEBE SER LO ÚLTIMO)
// ═══════════════════════════════════════════════════════════════════════════
// 404 - Ruta no encontrada
app.use(errorHandler_middleware_1.notFoundHandler);
// Error handler centralizado
app.use(errorHandler_middleware_1.errorHandler);
// ═══════════════════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════════════════
const startServer = async () => {
    try {
        logger_1.logger.info('🔍 Validating PostgreSQL connection...');
        const dbConnected = await (0, database_1.validateDatabaseConnection)();
        if (!dbConnected) {
            logger_1.logger.warn('⚠️  PostgreSQL not available yet. Will retry on first request.');
        }
        // Crear servidor HTTP
        const server = (0, http_1.createServer)(app);
        // Inicializar WebSocket
        WebSocketService_1.WebSocketService.initialize(server);
        logger_1.logger.info('✅ WebSocket Server initialized on ws://localhost:' + PORT + '/ws');
        // Inicializar Cron Jobs
        cron_1.CronJobs.initialize();
        // Iniciar servidor
        server.listen(PORT, () => {
            logger_1.logger.info(`✅ Backend running at http://localhost:${PORT}`, {
                environment: NODE_ENV,
                database: dbConnected ? '✅' : '⚠️ (retrying)',
                websocket: '✅ /ws'
            });
        });
        // Manejo de shutdown graceful
        const shutdown = async () => {
            logger_1.logger.info('🛑 Shutting down gracefully...');
            // Detener cron jobs
            cron_1.CronJobs.stopAll();
            // Cerrar conexiones WebSocket
            WebSocketService_1.WebSocketService.closeAll();
            // Cerrar pool de base de datos
            await (0, database_1.closePool)();
            // Cerrar servidor HTTP
            server.close(() => {
                logger_1.logger.info('✅ Server closed');
                process.exit(0);
            });
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server', error);
        process.exit(1);
    }
};
// Ejecutar si este es el archivo principal
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map