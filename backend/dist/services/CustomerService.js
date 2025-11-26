"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CUSTOMER SERVICE
 * Servicio para gestión de clientes (registro, validación teléfono)
 * ═══════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class CustomerService {
    /**
     * Normalizar teléfono: quitar +57, dejar solo 10 dígitos
     * VALIDACIÓN CRÍTICA del documento
     */
    static normalizePhone(phone) {
        // Remover espacios, guiones, paréntesis
        let normalized = phone.replace(/[\s\-\(\)]/g, '');
        // Remover +57 si existe
        if (normalized.startsWith('+57')) {
            normalized = normalized.substring(3);
        }
        else if (normalized.startsWith('57') && normalized.length === 12) {
            normalized = normalized.substring(2);
        }
        return normalized;
    }
    /**
     * Validar que el teléfono tenga exactamente 10 dígitos
     * VALIDACIÓN CRÍTICA del documento
     */
    static isValidPhone(phone) {
        const normalized = this.normalizePhone(phone);
        return /^\d{10}$/.test(normalized);
    }
    /**
     * Buscar cliente por teléfono
     */
    static async findByPhone(phone) {
        try {
            const normalized = this.normalizePhone(phone);
            if (!this.isValidPhone(normalized)) {
                throw new Error('Teléfono debe tener 10 dígitos');
            }
            const result = await (0, database_1.query)('SELECT * FROM customers WHERE phone = $1', [normalized]);
            return result.rows[0] || null;
        }
        catch (error) {
            logger_1.logger.error('Error finding customer by phone', error);
            throw error;
        }
    }
    /**
     * Crear nuevo cliente
     */
    static async create(data) {
        try {
            const normalized_phone = this.normalizePhone(data.phone);
            if (!this.isValidPhone(normalized_phone)) {
                throw new Error('Teléfono debe tener 10 dígitos');
            }
            // Verificar si ya existe
            const existing = await this.findByPhone(normalized_phone);
            if (existing) {
                throw new Error('Cliente ya existe con este teléfono');
            }
            // Generar customer_code: CLI-timestamp-random
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const customer_code = `CLI-${timestamp}-${random}`;
            const result = await (0, database_1.query)(`INSERT INTO customers
         (customer_code, full_name, phone, email, address_1, address_2, address_3, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`, [
                customer_code,
                data.full_name,
                normalized_phone,
                data.email || null,
                data.address_1,
                data.address_2 || null,
                data.address_3 || null,
                data.notes || null
            ]);
            logger_1.logger.info('Customer created', { customer_code, phone: normalized_phone });
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error creating customer', error);
            throw error;
        }
    }
    /**
     * Actualizar direcciones del cliente
     */
    static async updateAddresses(customerId, addresses) {
        try {
            const updates = [];
            const values = [];
            let paramIndex = 1;
            if (addresses.address_1 !== undefined) {
                updates.push(`address_1 = $${paramIndex++}`);
                values.push(addresses.address_1);
            }
            if (addresses.address_2 !== undefined) {
                updates.push(`address_2 = $${paramIndex++}`);
                values.push(addresses.address_2);
            }
            if (addresses.address_3 !== undefined) {
                updates.push(`address_3 = $${paramIndex++}`);
                values.push(addresses.address_3);
            }
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(customerId);
            const result = await (0, database_1.query)(`UPDATE customers
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`, values);
            if (result.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            return result.rows[0];
        }
        catch (error) {
            logger_1.logger.error('Error updating customer addresses', error);
            throw error;
        }
    }
    /**
     * Obtener cliente por ID
     */
    static async findById(customerId) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM customers WHERE id = $1', [customerId]);
            return result.rows[0] || null;
        }
        catch (error) {
            logger_1.logger.error('Error finding customer by id', error);
            throw error;
        }
    }
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MÉTODOS ADICIONALES PARA ROUTES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    static async createCustomer(data) {
        const customer = await this.create(data);
        return { success: true, customer, message: 'Cliente creado exitosamente' };
    }
    static async getAllCustomers() {
        try {
            const result = await (0, database_1.query)('SELECT * FROM customers ORDER BY created_at DESC');
            return { success: true, customers: result.rows, count: result.rows.length };
        }
        catch (error) {
            logger_1.logger.error('Error getting all customers', error);
            throw error;
        }
    }
    static async getCustomerById(customerId) {
        const customer = await this.findById(customerId);
        if (!customer) {
            return { success: false, message: 'Cliente no encontrado' };
        }
        return { success: true, customer };
    }
    static async getCustomerByPhone(phone) {
        const customer = await this.findByPhone(phone);
        if (!customer) {
            return { success: false, message: 'Cliente no encontrado' };
        }
        return { success: true, customer };
    }
    static async updateCustomer(customerId, data) {
        try {
            const updates = [];
            const values = [];
            let paramIndex = 1;
            if (data.full_name !== undefined) {
                updates.push(`full_name = $${paramIndex++}`);
                values.push(data.full_name);
            }
            if (data.email !== undefined) {
                updates.push(`email = $${paramIndex++}`);
                values.push(data.email);
            }
            if (data.address_1 !== undefined) {
                updates.push(`address_1 = $${paramIndex++}`);
                values.push(data.address_1);
            }
            if (data.address_2 !== undefined) {
                updates.push(`address_2 = $${paramIndex++}`);
                values.push(data.address_2);
            }
            if (data.address_3 !== undefined) {
                updates.push(`address_3 = $${paramIndex++}`);
                values.push(data.address_3);
            }
            if (data.notes !== undefined) {
                updates.push(`notes = $${paramIndex++}`);
                values.push(data.notes);
            }
            if (updates.length === 0) {
                throw new Error('No hay campos para actualizar');
            }
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(customerId);
            const result = await (0, database_1.query)(`UPDATE customers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
            if (result.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            return { success: true, customer: result.rows[0], message: 'Cliente actualizado' };
        }
        catch (error) {
            logger_1.logger.error('Error updating customer', error);
            throw error;
        }
    }
    static async deleteCustomer(customerId) {
        try {
            const result = await (0, database_1.query)('DELETE FROM customers WHERE id = $1 RETURNING *', [customerId]);
            if (result.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            return { success: true, message: 'Cliente eliminado exitosamente' };
        }
        catch (error) {
            logger_1.logger.error('Error deleting customer', error);
            throw error;
        }
    }
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=CustomerService.js.map