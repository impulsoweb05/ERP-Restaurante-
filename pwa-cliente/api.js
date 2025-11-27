// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT - Cliente API para Backend Restaurante
// Base URL: http://localhost:4000
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE_URL = '/api';

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES HTTP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Realizar petición HTTP con manejo de errores
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };
  
  // Agregar token de autorización si existe
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`[API] Error en ${endpoint}:`, error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS PÚBLICOS (Sin autenticación)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/menu
 * Obtener menú completo con 150 productos
 */
export async function getMenu() {
  return apiRequest('/menu');
}

/**
 * GET /api/menu/categories
 * Obtener las 10 categorías del menú
 */
export async function getCategories() {
  return apiRequest('/menu/categories');
}

/**
 * GET /api/menu/subcategories?category_id=UUID
 * Obtener subcategorías filtradas por categoría
 */
export async function getSubcategories(categoryId) {
  if (!categoryId) {
    throw new Error('category_id es requerido');
  }
  return apiRequest(`/menu/subcategories?category_id=${categoryId}`);
}

/**
 * GET /api/schedule/is-open
 * Verificar si el restaurante está abierto
 * CRÍTICO: Llamar ANTES de mostrar el menú
 */
export async function isRestaurantOpen() {
  return apiRequest('/schedule/is-open');
}

/**
 * POST /api/auth/register/customer
 * Registrar nuevo cliente
 * @param {Object} customerData - { phone, full_name, email, address_1 }
 */
export async function registerCustomer(customerData) {
  const { phone, full_name, email, address_1 } = customerData;
  
  if (!phone || !full_name || !address_1) {
    throw new Error('phone, full_name y address_1 son campos requeridos');
  }
  
  return apiRequest('/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify({ phone, full_name, email, address_1 })
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS PROTEGIDOS (Requieren autenticación)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login/customer
 * Login de cliente con teléfono
 * @param {string} phone - Número de teléfono (ej: "3101111111")
 */
export async function loginCustomer(phone) {
  if (!phone) {
    throw new Error('Teléfono es requerido');
  }
  
  return apiRequest('/auth/login/customer', {
    method: 'POST',
    body: JSON.stringify({ phone })
  });
}

/**
 * POST /api/orders
 * Crear nuevo pedido
 * @param {Object} orderData - Datos del pedido
 */
export async function createOrder(orderData) {
  const { customer_id, order_type, items, payment_method, total } = orderData;
  
  // Validaciones
  if (!customer_id) throw new Error('customer_id es requerido');
  if (!order_type) throw new Error('order_type es requerido');
  if (!items || items.length === 0) throw new Error('Se requiere al menos 1 item');
  if (!payment_method) throw new Error('payment_method es requerido');
  if (!total) throw new Error('total es requerido');
  
  // Validar delivery_address si es delivery
  if (order_type === 'delivery' && !orderData.delivery_address) {
    throw new Error('delivery_address es requerido para delivery');
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No hay sesión activa. Por favor inicia sesión.');
  }
  
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

/**
 * GET /api/orders/customer/:customerId
 * Obtener historial de pedidos del cliente
 * @param {string} customerId - UUID del cliente
 */
export async function getCustomerOrders(customerId) {
  if (!customerId) {
    throw new Error('customer_id es requerido');
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No hay sesión activa. Por favor inicia sesión.');
  }
  
  return apiRequest(`/orders/customer/${customerId}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINTS ADICIONALES ÚTILES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/menu/items/:itemId
 * Obtener detalles de un producto específico
 */
export async function getMenuItem(itemId) {
  if (!itemId) {
    throw new Error('itemId es requerido');
  }
  return apiRequest(`/menu/items/${itemId}`);
}

/**
 * GET /api/menu/categories/:categoryId/items
 * Obtener productos de una categoría
 */
export async function getItemsByCategory(categoryId) {
  if (!categoryId) {
    throw new Error('categoryId es requerido');
  }
  return apiRequest(`/menu/categories/${categoryId}/items`);
}

/**
 * POST /api/auth/verify
 * Verificar si un token es válido
 */
export async function verifyToken(token) {
  return apiRequest('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
}

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No hay sesión activa');
  }
  return apiRequest('/auth/me');
}

/**
 * GET /api/schedule
 * Obtener horarios de toda la semana
 */
export async function getSchedule() {
  return apiRequest('/schedule');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR OBJETO API PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

const API = {
  // Públicos
  getMenu,
  getCategories,
  getSubcategories,
  isRestaurantOpen,
  registerCustomer,
  getSchedule,
  
  // Protegidos
  loginCustomer,
  createOrder,
  getCustomerOrders,
  
  // Adicionales
  getMenuItem,
  getItemsByCategory,
  verifyToken,
  getCurrentUser
};

// Exponer globalmente para uso sin módulos
if (typeof window !== 'undefined') {
  window.API = API;
}

export default API;
