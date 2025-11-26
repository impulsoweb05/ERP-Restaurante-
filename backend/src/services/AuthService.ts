/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH SERVICE
 * Servicio para autenticación (JWT, bcrypt)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { Customer, Waiter, JWTPayload } from '../types';
import { logger } from '../utils/logger';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
  /**
   * Generar JWT token
   */
  static generateToken(payload: JWTPayload): string {
    // Remover iat y exp del payload si existen
    const { iat, exp, ...tokenPayload } = payload;
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign(tokenPayload, JWT_SECRET, options);
  }

  /**
   * Verificar JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Hash password con bcrypt
   * VALIDACIÓN CRÍTICA: PIN meseros
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Comparar password con hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Login de mesero con PIN
   */
  static async loginWaiter(waiter_code: string, pin_code: string): Promise<{ token: string; waiter: Waiter }> {
    try {
      const result = await query(
        'SELECT * FROM waiters WHERE waiter_code = $1 AND is_active = true',
        [waiter_code]
      );

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

      logger.info('Waiter logged in', { waiter_code });

      return { token, waiter };
    } catch (error) {
      logger.error('Error in waiter login', error as Error);
      throw error;
    }
  }

  /**
   * Login de cliente con teléfono
   */
  static async loginCustomer(phone: string): Promise<{ token: string; customer: Customer }> {
    try {
      const result = await query(
        'SELECT * FROM customers WHERE phone = $1 AND is_active = true',
        [phone]
      );

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

      logger.info('Customer logged in', { phone });

      return { token, customer };
    } catch (error) {
      logger.error('Error in customer login', error as Error);
      throw error;
    }
  }

  /**
   * Registrar nuevo mesero
   */
  static async registerWaiter(data: {
    waiter_code: string;
    full_name: string;
    phone?: string;
    pin_code: string;
  }): Promise<{ token: string; waiter: any }> {
    try {
      // Generar waiter_code: MES-timestamp-random
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const waiter_code = `MES-${timestamp}-${random}`;

      // Hash PIN
      const hashedPin = await this.hashPassword(data.pin_code);

      const result = await query(
        `INSERT INTO waiters
         (waiter_code, full_name, phone, pin_code, is_active, current_orders)
         VALUES ($1, $2, $3, $4, true, 0)
         RETURNING *`,
        [waiter_code, data.full_name, data.phone || null, hashedPin]
      );

      const waiter = result.rows[0];

      // Generar token
      const token = this.generateToken({
        id: waiter.id,
        type: 'waiter',
        role: 'waiter',
        waiter_code: waiter.waiter_code
      });

      logger.info('Waiter registered', { waiter_code });

      return { token, waiter };
    } catch (error) {
      logger.error('Error registering waiter', error as Error);
      throw error;
    }
  }

  /**
   * Verificar si es admin (para futuro)
   */
  static isAdmin(payload: JWTPayload): boolean {
    return payload.type === 'admin';
  }

  /**
   * Verificar si es mesero
   */
  static isWaiter(payload: JWTPayload): boolean {
    return payload.type === 'waiter';
  }

  /**
   * Verificar si es cliente
   */
  static isCustomer(payload: JWTPayload): boolean {
    return payload.type === 'customer';
  }
}
