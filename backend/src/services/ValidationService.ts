/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATION SERVICE
 * Centraliza todas las validaciones críticas del sistema
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ScheduleService } from './ScheduleService';
import { CustomerService } from './CustomerService';
import { logger } from '../utils/logger';

export class ValidationService {
  /**
   * VALIDACIÓN CRÍTICA 1: Horario (niveles 0, 5, 14)
   * Validar que el restaurante esté abierto
   */
  static async validateSchedule(): Promise<{ isValid: boolean; message?: string }> {
    try {
      const result = await ScheduleService.isOpenNow();

      if (!result.isOpen) {
        return {
          isValid: false,
          message: result.message || 'Restaurante cerrado en este momento'
        };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('Error validating schedule', error as Error);
      return {
        isValid: false,
        message: 'Error al validar horario'
      };
    }
  }

  /**
   * VALIDACIÓN CRÍTICA 2: Teléfono normalizado
   * Exactamente 10 dígitos, sin +57
   */
  static validatePhone(phone: string): { isValid: boolean; normalized?: string; message?: string } {
    try {
      const normalized = CustomerService.normalizePhone(phone);
      const isValid = CustomerService.isValidPhone(normalized);

      if (!isValid) {
        return {
          isValid: false,
          message: 'El teléfono debe tener exactamente 10 dígitos'
        };
      }

      return {
        isValid: true,
        normalized
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Teléfono inválido'
      };
    }
  }

  /**
   * VALIDACIÓN CRÍTICA 3: Email
   */
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Email inválido'
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN CRÍTICA 4: Precio (debe ser > 0)
   */
  static validatePrice(price: number): { isValid: boolean; message?: string } {
    if (price <= 0) {
      return {
        isValid: false,
        message: 'El precio debe ser mayor a 0'
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN CRÍTICA 5: Cantidad (debe ser > 0)
   */
  static validateQuantity(quantity: number): { isValid: boolean; message?: string } {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return {
        isValid: false,
        message: 'La cantidad debe ser un número entero mayor a 0'
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN CRÍTICA 6: Máximo 3 direcciones por cliente
   */
  static validateAddresses(addresses: {
    address_1?: string;
    address_2?: string;
    address_3?: string;
  }): { isValid: boolean; message?: string } {
    const addressCount = [
      addresses.address_1,
      addresses.address_2,
      addresses.address_3
    ].filter(addr => addr && addr.trim() !== '').length;

    if (addressCount > 3) {
      return {
        isValid: false,
        message: 'Máximo 3 direcciones por cliente'
      };
    }

    if (!addresses.address_1 || addresses.address_1.trim() === '') {
      return {
        isValid: false,
        message: 'La dirección principal (address_1) es requerida'
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN CRÍTICA 7: Fecha de reserva
   * No puede ser en el pasado
   */
  static validateReservationDate(date: Date): { isValid: boolean; message?: string } {
    const now = new Date();

    if (date < now) {
      return {
        isValid: false,
        message: 'La fecha de reserva no puede ser en el pasado'
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN CRÍTICA 8: Tamaño de grupo (party_size)
   * Debe ser entre 1 y capacidad máxima
   */
  static validatePartySize(size: number, maxCapacity: number = 20): { isValid: boolean; message?: string } {
    if (!Number.isInteger(size) || size <= 0) {
      return {
        isValid: false,
        message: 'El tamaño del grupo debe ser un número entero mayor a 0'
      };
    }

    if (size > maxCapacity) {
      return {
        isValid: false,
        message: `El tamaño máximo del grupo es ${maxCapacity} personas`
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN: UUID válido
   */
  static validateUUID(uuid: string): { isValid: boolean; message?: string } {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuid)) {
      return {
        isValid: false,
        message: 'ID inválido'
      };
    }

    return { isValid: true };
  }

  /**
   * VALIDACIÓN: PIN de mesero (4-6 dígitos)
   */
  static validateWaiterPin(pin: string): { isValid: boolean; message?: string } {
    if (!/^\d{4,6}$/.test(pin)) {
      return {
        isValid: false,
        message: 'El PIN debe tener entre 4 y 6 dígitos'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar múltiples campos a la vez
   */
  static validateAll(validations: Array<{ isValid: boolean; message?: string }>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = validations
      .filter(v => !v.isValid)
      .map(v => v.message || 'Error de validación')
      .filter((msg, index, arr) => arr.indexOf(msg) === index); // Únicos

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * NUEVA: Validar fecha futura (para reservas)
   */
  static validateFutureDate(date: string, time: string): string | null {
    try {
      const reservationDateTime = new Date(`${date}T${time}`);
      const now = new Date();

      if (reservationDateTime <= now) {
        return 'La fecha y hora de reserva deben ser futuras';
      }

      return null;
    } catch (error) {
      return 'Fecha u hora inválida';
    }
  }

  /**
   * HELPER: Validar múltiples y retornar array de errores
   */
  static validateMultiple(validations: Array<string | null>): string[] {
    return validations.filter(v => v !== null) as string[];
  }

}
