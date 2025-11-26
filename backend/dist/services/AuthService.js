"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH SERVICE
 * Servicio para autenticación (JWT, bcrypt)
 * ═══════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
class AuthService {
    /**
     * Generar JWT token
     */
    static generateToken(payload) {
        // Remover iat y exp del payload si existen
        const { iat, exp, ...tokenPayload } = payload;
        const options = { expiresIn: JWT_EXPIRES_IN };
        return jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, options);
    }
    /**
     * Verificar JWT token
     */
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Hash password con bcrypt
     * VALIDACIÓN CRÍTICA: PIN meseros
     */
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    /**
     * Comparar password con hash
     */
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Login de mesero con PIN
     */
    static async loginWaiter(waiter_code, pin_code) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM waiters WHERE waiter_code = $1 AND is_active = true', [waiter_code]);
            if (result.rows.length === 0) {
                throw new Error('Mesero no encontrado o inactivo');
            }
            const waiter = result.rows[0];
            // Verificar PIN (bcrypt)
            const isValidPin = await this.comparePassword(pin_code, waiter.pin_code);
            if (!isValidPin) {
                throw new Error('PIN incorrecto');
            }
            // Generar token
            const token = this.generateToken({
                id: waiter.id,
                type: 'waiter',
                role: 'waiter',
                waiter_code: waiter.waiter_code
            });
            logger_1.logger.info('Waiter logged in', { waiter_code });
            return { token, waiter };
        }
        catch (error) {
            logger_1.logger.error('Error in waiter login', error);
            throw error;
        }
    }
    /**
     * Login de cliente con teléfono
     */
    static async loginCustomer(phone) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM customers WHERE phone = $1 AND is_active = true', [phone]);
            if (result.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            const customer = result.rows[0];
            // Generar token
            const token = this.generateToken({
                id: customer.id,
                type: 'customer',
                role: 'customer',
                phone: customer.phone
            });
            logger_1.logger.info('Customer logged in', { phone });
            return { token, customer };
        }
        catch (error) {
            logger_1.logger.error('Error in customer login', error);
            throw error;
        }
    }
    /**
     * Registrar nuevo mesero
     */
    static async registerWaiter(data) {
        try {
            // Generar waiter_code: MES-timestamp-random
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const waiter_code = `MES-${timestamp}-${random}`;
            // Hash PIN
            const hashedPin = await this.hashPassword(data.pin_code);
            const result = await (0, database_1.query)(`INSERT INTO waiters
         (waiter_code, full_name, phone, pin_code, is_active, current_orders)
         VALUES ($1, $2, $3, $4, true, 0)
         RETURNING *`, [waiter_code, data.full_name, data.phone || null, hashedPin]);
            const waiter = result.rows[0];
            // Generar token
            const token = this.generateToken({
                id: waiter.id,
                type: 'waiter',
                role: 'waiter',
                waiter_code: waiter.waiter_code
            });
            logger_1.logger.info('Waiter registered', { waiter_code });
            return { token, waiter };
        }
        catch (error) {
            logger_1.logger.error('Error registering waiter', error);
            throw error;
        }
    }
    /**
     * Verificar si es admin (para futuro)
     */
    static isAdmin(payload) {
        return payload.type === 'admin';
    }
    /**
     * Verificar si es mesero
     */
    static isWaiter(payload) {
        return payload.type === 'waiter';
    }
    /**
     * Verificar si es cliente
     */
    static isCustomer(payload) {
        return payload.type === 'customer';
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map