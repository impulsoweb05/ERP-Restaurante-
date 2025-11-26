/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH SERVICE
 * Servicio para autenticación (JWT, bcrypt)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Customer, Waiter, JWTPayload } from '../types';
export declare class AuthService {
    /**
     * Generar JWT token
     */
    static generateToken(payload: JWTPayload): string;
    /**
     * Verificar JWT token
     */
    static verifyToken(token: string): JWTPayload;
    /**
     * Hash password con bcrypt
     * VALIDACIÓN CRÍTICA: PIN meseros
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Comparar password con hash
     */
    static comparePassword(password: string, hash: string): Promise<boolean>;
    /**
     * Login de mesero con PIN
     */
    static loginWaiter(waiter_code: string, pin_code: string): Promise<{
        token: string;
        waiter: Waiter;
    }>;
    /**
     * Login de cliente con teléfono
     */
    static loginCustomer(phone: string): Promise<{
        token: string;
        customer: Customer;
    }>;
    /**
     * Registrar nuevo mesero
     */
    static registerWaiter(data: {
        waiter_code: string;
        full_name: string;
        phone?: string;
        pin_code: string;
    }): Promise<{
        token: string;
        waiter: any;
    }>;
    /**
     * Verificar si es admin (para futuro)
     */
    static isAdmin(payload: JWTPayload): boolean;
    /**
     * Verificar si es mesero
     */
    static isWaiter(payload: JWTPayload): boolean;
    /**
     * Verificar si es cliente
     */
    static isCustomer(payload: JWTPayload): boolean;
}
//# sourceMappingURL=AuthService.d.ts.map