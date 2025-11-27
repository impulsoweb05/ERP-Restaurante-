// ═══════════════════════════════════════════════════════════════════════════
// API Client - PWA Cliente Delivery
// ═══════════════════════════════════════════════════════════════════════════

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  // Agregar token si existe
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Error en la solicitud' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('[API] Error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MENÚ
// ═══════════════════════════════════════════════════════════════════════════

export async function getMenu() {
  return request('/menu');
}

export async function getCategories() {
  return request('/menu/categories');
}

export async function getSubcategories(categoryId) {
  return request(`/menu/subcategories?category_id=${categoryId}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// HORARIO
// ═══════════════════════════════════════════════════════════════════════════

export async function isRestaurantOpen() {
  return request('/schedule/is-open');
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export async function loginCustomer(phone) {
  return request('/auth/login/customer', {
    method: 'POST',
    body: JSON.stringify({ phone })
  });
}

export async function registerCustomer(data) {
  return request('/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PEDIDOS
// ═══════════════════════════════════════════════════════════════════════════

export async function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

export async function getCustomerOrders(customerId) {
  const response = await request(`/orders?customer_id=${customerId}`);
  return {
    success: response.success,
    orders: response.data || []
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

const API = {
  getMenu,
  getCategories,
  getSubcategories,
  isRestaurantOpen,
  loginCustomer,
  registerCustomer,
  createOrder,
  getCustomerOrders
};

export default API;
