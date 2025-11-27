// ═══════════════════════════════════════════════════════════════════════════
// Auth Module - PWA Cliente Delivery
// ═══════════════════════════════════════════════════════════════════════════

import API from './api.js';

const AUTH_TOKEN_KEY = 'auth_token';
const CUSTOMER_ID_KEY = 'customer_id';
const CUSTOMER_DATA_KEY = 'customer_data';

let isLoggedIn = false;
let currentCustomer = null;

// ═══════════════════════════════════════════════════════════════════════════
// SESIÓN
// ═══════════════════════════════════════════════════════════════════════════

export async function checkSession() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const customerId = localStorage.getItem(CUSTOMER_ID_KEY);
  const customerData = localStorage.getItem(CUSTOMER_DATA_KEY);
  
  if (token && customerId) {
    isLoggedIn = true;
    currentCustomer = customerData ? JSON.parse(customerData) : null;
    return true;
  }
  
  return false;
}

export function isAuthenticated() {
  return isLoggedIn;
}

export function getCustomerId() {
  return localStorage.getItem(CUSTOMER_ID_KEY);
}

export function getCustomer() {
  return currentCustomer;
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════

export async function login(phone) {
  try {
    const response = await API.loginCustomer(phone);
    
    if (response.success && response.data) {
      const { token, customer } = response.data;
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(CUSTOMER_ID_KEY, customer.customer_id);
      localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(customer));
      
      isLoggedIn = true;
      currentCustomer = customer;
      
      return { success: true, customer };
    }
    
    return { success: false, error: response.error || 'Error al iniciar sesión' };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRO
// ═══════════════════════════════════════════════════════════════════════════

export async function register(data) {
  try {
    const response = await API.registerCustomer(data);
    
    if (response.success && response.data) {
      // Auto-login después del registro
      return await login(data.phone);
    }
    
    return { success: false, error: response.error || 'Error al registrar' };
  } catch (error) {
    console.error('[Auth] Register error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════════════════

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_ID_KEY);
  localStorage.removeItem(CUSTOMER_DATA_KEY);
  
  isLoggedIn = false;
  currentCustomer = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

const Auth = {
  checkSession,
  isAuthenticated,
  getCustomerId,
  getCustomer,
  getToken,
  login,
  register,
  logout
};

export default Auth;
