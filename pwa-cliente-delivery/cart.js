// ═══════════════════════════════════════════════════════════════════════════
// Cart Module - PWA Cliente Delivery
// ═══════════════════════════════════════════════════════════════════════════

import API from './api.js';
import Auth from './auth.js';

const CART_KEY = 'delivery_cart';

let cartItems = [];

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    cartItems = stored ? JSON.parse(stored) : [];
  } catch (error) {
    cartItems = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

// Cargar al inicio
loadCart();

// ═══════════════════════════════════════════════════════════════════════════
// OPERACIONES
// ═══════════════════════════════════════════════════════════════════════════

export function addItem(product, quantity = 1) {
  const existing = cartItems.find(item => item.product_id === product.product_id);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({
      product_id: product.product_id,
      name: product.name,
      unit_price: parseFloat(product.price || 0),
      quantity: quantity,
      image_url: product.image_url || ''
    });
  }
  
  saveCart();
  return true;
}

export function removeItem(productId) {
  cartItems = cartItems.filter(item => item.product_id !== productId);
  saveCart();
}

export function incrementItem(productId) {
  const item = cartItems.find(i => i.product_id === productId);
  if (item) {
    item.quantity++;
    saveCart();
  }
}

export function decrementItem(productId) {
  const item = cartItems.find(i => i.product_id === productId);
  if (item) {
    if (item.quantity <= 1) {
      removeItem(productId);
    } else {
      item.quantity--;
      saveCart();
    }
  }
}

export function clearCart() {
  cartItems = [];
  saveCart();
}

// ═══════════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════════

export function getItems() {
  return [...cartItems];
}

export function getTotalItems() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

export function getTotal() {
  return cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
}

export function isEmpty() {
  return cartItems.length === 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORMACIÓN PARA API
// ═══════════════════════════════════════════════════════════════════════════

export function transformForAPI() {
  return cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT
// ═══════════════════════════════════════════════════════════════════════════

export async function checkout(orderData) {
  if (isEmpty()) {
    return { success: false, error: 'El carrito está vacío' };
  }
  
  if (!Auth.isAuthenticated()) {
    return { success: false, error: 'Debes iniciar sesión' };
  }
  
  try {
    const response = await API.createOrder({
      ...orderData,
      items: transformForAPI()
    });
    
    if (response.success) {
      clearCart();
      return { success: true, order: response.data };
    }
    
    return { success: false, error: response.error || 'Error al crear pedido' };
  } catch (error) {
    console.error('[Cart] Checkout error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════

const Cart = {
  addItem,
  removeItem,
  incrementItem,
  decrementItem,
  clearCart,
  getItems,
  getTotalItems,
  getTotal,
  isEmpty,
  transformForAPI,
  checkout
};

export default Cart;
