// ═══════════════════════════════════════════════════════════════════════════
// AUTH MODULE - Autenticación de Clientes
// Flujo de 4 pasos para autenticación JWT
// ═══════════════════════════════════════════════════════════════════════════

import { loginCustomer, registerCustomer, verifyToken, getCurrentUser } from './api.js';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const AUTH_TOKEN_KEY = 'auth_token';
const CUSTOMER_ID_KEY = 'customer_id';
const CUSTOMER_DATA_KEY = 'customer_data';

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

let isAuthenticated = false;
let currentCustomer = null;

// ═══════════════════════════════════════════════════════════════════════════
// PASO 1: Verificar si existe sesión guardada
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verificar sesión al iniciar la app
 * @returns {Promise<boolean>} - true si hay sesión válida
 */
export async function checkExistingSession() {
  console.log('[Auth] Verificando sesión existente...');
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const customerId = localStorage.getItem(CUSTOMER_ID_KEY);
  
  // Si no hay token o customer_id, no hay sesión
  if (!token || !customerId) {
    console.log('[Auth] No se encontró sesión guardada');
    return false;
  }
  
  console.log('[Auth] Token encontrado, validando con backend...');
  
  // Paso 2: Validar token con el backend
  try {
    const result = await validateTokenWithBackend(token);
    
    if (result.valid) {
      isAuthenticated = true;
      currentCustomer = result.customer;
      console.log('[Auth] Sesión válida para:', currentCustomer?.full_name);
      return true;
    } else {
      // Paso 3: Token inválido, limpiar localStorage
      console.log('[Auth] Token inválido, limpiando sesión...');
      clearSession();
      return false;
    }
  } catch (error) {
    console.error('[Auth] Error al validar token:', error);
    clearSession();
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 2: Validar token con el backend
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validar token haciendo request a endpoint protegido
 * @param {string} token - JWT token
 * @returns {Promise<{valid: boolean, customer?: Object}>}
 */
async function validateTokenWithBackend(token) {
  try {
    // Intentar obtener datos del usuario actual
    const response = await getCurrentUser();
    
    if (response.success && response.user) {
      return {
        valid: true,
        customer: response.user
      };
    }
    
    return { valid: false };
  } catch (error) {
    // Si hay error de autenticación, el token es inválido
    console.log('[Auth] Token validation failed:', error.message);
    return { valid: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 3: Limpiar sesión inválida
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Limpiar todos los datos de sesión del localStorage
 */
export function clearSession() {
  console.log('[Auth] Limpiando sesión...');
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_ID_KEY);
  localStorage.removeItem(CUSTOMER_DATA_KEY);
  
  isAuthenticated = false;
  currentCustomer = null;
  
  // Disparar evento para que la UI reaccione
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

// ═══════════════════════════════════════════════════════════════════════════
// PASO 4: Login exitoso - Guardar credenciales
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Realizar login con número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {Promise<{success: boolean, customer?: Object}>}
 */
export async function login(phone) {
  console.log('[Auth] Iniciando login para:', phone);
  
  try {
    const response = await loginCustomer(phone);
    
    if (response.success && response.token && response.customer) {
      // Guardar token y customer_id en localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(CUSTOMER_ID_KEY, response.customer.customer_id);
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(response.customer));
      
      isAuthenticated = true;
      currentCustomer = response.customer;
      
      console.log('[Auth] Login exitoso para:', currentCustomer.full_name);
      
      // Disparar evento para que la UI reaccione
      window.dispatchEvent(new CustomEvent('auth:login', { 
        detail: { customer: currentCustomer } 
      }));
      
      return {
        success: true,
        customer: currentCustomer
      };
    }
    
    return {
      success: false,
      error: response.error || 'Error de autenticación'
    };
  } catch (error) {
    console.error('[Auth] Error en login:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Registrar nuevo cliente y hacer login automático
 * @param {Object} customerData - { phone, full_name, email, address_1 }
 * @returns {Promise<{success: boolean, customer?: Object}>}
 */
export async function register(customerData) {
  console.log('[Auth] Registrando nuevo cliente:', customerData.phone);
  
  try {
    const response = await registerCustomer(customerData);
    
    if (response.success && response.token && response.customer) {
      // Guardar token y customer_id en localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(CUSTOMER_ID_KEY, response.customer.customer_id);
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(response.customer));
      
      isAuthenticated = true;
      currentCustomer = response.customer;
      
      console.log('[Auth] Registro exitoso para:', currentCustomer.full_name);
      
      // Disparar evento para que la UI reaccione
      window.dispatchEvent(new CustomEvent('auth:login', { 
        detail: { customer: currentCustomer } 
      }));
      
      return {
        success: true,
        customer: currentCustomer
      };
    }
    
    return {
      success: false,
      error: response.error || 'Error en registro'
    };
  } catch (error) {
    console.error('[Auth] Error en registro:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cerrar sesión
 */
export function logout() {
  clearSession();
  console.log('[Auth] Sesión cerrada');
}

// ═══════════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtener estado de autenticación
 */
export function getIsAuthenticated() {
  return isAuthenticated;
}

/**
 * Obtener datos del cliente actual
 */
export function getCurrentCustomer() {
  if (currentCustomer) {
    return currentCustomer;
  }
  
  // Intentar recuperar de localStorage
  const storedData = localStorage.getItem(CUSTOMER_DATA_KEY);
  if (storedData) {
    try {
      currentCustomer = JSON.parse(storedData);
      return currentCustomer;
    } catch (e) {
      return null;
    }
  }
  
  return null;
}

/**
 * Obtener token de autenticación
 */
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Obtener ID del cliente
 */
export function getCustomerId() {
  return localStorage.getItem(CUSTOMER_ID_KEY);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR OBJETO AUTH PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

const Auth = {
  checkExistingSession,
  login,
  register,
  logout,
  clearSession,
  getIsAuthenticated,
  getCurrentCustomer,
  getAuthToken,
  getCustomerId
};

// Exponer globalmente para uso sin módulos
if (typeof window !== 'undefined') {
  window.Auth = Auth;
}

export default Auth;
