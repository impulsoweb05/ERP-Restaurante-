/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CUSTOMER SERVICE
 * Servicio para gestión de clientes (registro, validación teléfono)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Customer } from '../types';
export declare class CustomerService {
    /**
     * Normalizar teléfono: quitar +57, dejar solo 10 dígitos
     * VALIDACIÓN CRÍTICA del documento
     */
    static normalizePhone(phone: string): string;
    /**
     * Validar que el teléfono tenga exactamente 10 dígitos
     * VALIDACIÓN CRÍTICA del documento
     */
    static isValidPhone(phone: string): boolean;
    /**
     * Buscar cliente por teléfono
     */
    static findByPhone(phone: string): Promise<Customer | null>;
    /**
     * Crear nuevo cliente
     */
    static create(data: {
        full_name: string;
        phone: string;
        email?: string;
        address_1: string;
        address_2?: string;
        address_3?: string;
        notes?: string;
    }): Promise<Customer>;
    /**
     * Actualizar direcciones del cliente
     */
    static updateAddresses(customerId: string, addresses: {
        address_1?: string;
        address_2?: string;
        address_3?: string;
    }): Promise<Customer>;
    /**
     * Obtener cliente por ID
     */
    static findById(customerId: string): Promise<Customer | null>;
    static createCustomer(data: {
        full_name: string;
        phone: string;
        email?: string;
        address_1: string;
        address_2?: string;
        address_3?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        customer: Customer;
        message: string;
    }>;
    static getAllCustomers(): Promise<{
        success: boolean;
        customers: any[];
        count: number;
    }>;
    static getCustomerById(customerId: string): Promise<{
        success: boolean;
        message: string;
        customer?: undefined;
    } | {
        success: boolean;
        customer: Customer;
        message?: undefined;
    }>;
    static getCustomerByPhone(phone: string): Promise<{
        success: boolean;
        message: string;
        customer?: undefined;
    } | {
        success: boolean;
        customer: Customer;
        message?: undefined;
    }>;
    static updateCustomer(customerId: string, data: {
        full_name?: string;
        email?: string;
        address_1?: string;
        address_2?: string;
        address_3?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        customer: any;
        message: string;
    }>;
    static deleteCustomer(customerId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=CustomerService.d.ts.map