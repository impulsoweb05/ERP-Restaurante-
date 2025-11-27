// ═══════════════════════════════════════════════════════════════════════════
// CART MODULE - Carrito de Compras
// Gestión de carrito con localStorage y sincronización
// ═══════════════════════════════════════════════════════════════════════════

import { isRestaurantOpen, createOrder } from './api.js';
import { getCustomerId, getAuthToken } from './auth.js';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const CART_STORAGE_KEY = 'cart';

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO DEL CARRITO
// ═══════════════════════════════════════════════════════════════════════════

let cartItems = [];

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cargar carrito desde localStorage
 */
export function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      cartItems = JSON.parse(stored);
      console.log('[Cart] Loaded', cartItems.length, 'items from storage');
    }
  } catch (error) {
    console.error('[Cart] Error loading cart:', error);
    cartItems = [];
  }
  
  // Disparar evento de actualización
  dispatchCartUpdate();
  
  return cartItems;
}

/**
 * Guardar carrito en localStorage
 */
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    console.log('[Cart] Saved', cartItems.length, 'items to storage');
  } catch (error) {
    console.error('[Cart] Error saving cart:', error);
  }
  
  // Disparar evento de actualización
  dispatchCartUpdate();
}

/**
 * Disparar evento de actualización del carrito
 */
function dispatchCartUpdate() {
  window.dispatchEvent(new CustomEvent('cart:updated', {
    detail: {
      items: cartItems,
      total: getTotal(),
      count: getTotalItems()
    }
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// OPERACIONES DEL CARRITO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Agregar producto al carrito
 * @param {Object} product - Producto del backend
 * @param {number} quantity - Cantidad a agregar (default: 1)
 */
export function addItem(product, quantity = 1) {
  if (!product || !product.product_id) {
    console.error('[Cart] Invalid product:', product);
    return false;
  }
  
  // Estructura del item según especificación
  const cartItem = {
    product_id: product.product_id,
    name: product.name || product.product_name,
    unit_price: parseFloat(product.price || product.unit_price),
    quantity: quantity,
    image_url: product.image_url || ''
  };
  
  // Verificar si el producto ya existe en el carrito
  const existingIndex = cartItems.findIndex(item => item.product_id === cartItem.product_id);
  
  if (existingIndex > -1) {
    // Actualizar cantidad
    cartItems[existingIndex].quantity += quantity;
    console.log('[Cart] Updated quantity for:', cartItem.name);
  } else {
    // Agregar nuevo item
    cartItems.push(cartItem);
    console.log('[Cart] Added:', cartItem.name);
  }
  
  saveCart();
  return true;
}

/**
 * Remover producto del carrito
 * @param {string} productId - UUID del producto
 */
export function removeItem(productId) {
  const index = cartItems.findIndex(item => item.product_id === productId);
  
  if (index > -1) {
    const removed = cartItems.splice(index, 1)[0];
    console.log('[Cart] Removed:', removed.name);
    saveCart();
    return true;
  }
  
  return false;
}

/**
 * Actualizar cantidad de un producto
 * @param {string} productId - UUID del producto
 * @param {number} quantity - Nueva cantidad
 */
export function updateQuantity(productId, quantity) {
  const item = cartItems.find(item => item.product_id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeItem(productId);
    }
    
    item.quantity = quantity;
    console.log('[Cart] Updated quantity:', item.name, '=', quantity);
    saveCart();
    return true;
  }
  
  return false;
}

/**
 * Incrementar cantidad de un producto
 */
export function incrementItem(productId) {
  const item = cartItems.find(item => item.product_id === productId);
  if (item) {
    item.quantity += 1;
    saveCart();
    return true;
  }
  return false;
}

/**
 * Decrementar cantidad de un producto
 */
export function decrementItem(productId) {
  const item = cartItems.find(item => item.product_id === productId);
  if (item) {
    if (item.quantity <= 1) {
      return removeItem(productId);
    }
    item.quantity -= 1;
    saveCart();
    return true;
  }
  return false;
}

/**
 * Limpiar el carrito
 */
export function clearCart() {
  cartItems = [];
  saveCart();
  console.log('[Cart] Cleared');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtener todos los items del carrito
 */
export function getItems() {
  return [...cartItems];
}

/**
 * Obtener cantidad total de items
 */
export function getTotalItems() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calcular total del carrito
 * Suma quantity * unit_price localmente
 */
export function getTotal() {
  return cartItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);
}

/**
 * Verificar si el carrito está vacío
 */
export function isEmpty() {
  return cartItems.length === 0;
}

/**
 * Obtener item por product_id
 */
export function getItem(productId) {
  return cartItems.find(item => item.product_id === productId);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORMACIÓN PARA API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Transformar carrito al formato requerido por la API
 * @returns {Array} - Array de order_items: [{product_id, quantity, unit_price}]
 */
export function transformForAPI() {
  return cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// CREAR PEDIDO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validar y crear pedido
 * @param {Object} orderDetails - Detalles del pedido
 */
export async function checkout(orderDetails) {
  const { order_type, delivery_address, delivery_notes, payment_method } = orderDetails;
  
  // Validación pre-pedido: verificar si el restaurante está abierto
  console.log('[Cart] Checking if restaurant is open...');
  
  try {
    const scheduleResponse = await isRestaurantOpen();
    
    if (!scheduleResponse.success || !scheduleResponse.data?.is_open) {
      return {
        success: false,
        error: 'El restaurante está cerrado en este momento. Por favor intenta más tarde.'
      };
    }
  } catch (error) {
    console.error('[Cart] Failed to check schedule:', error);
    return {
      success: false,
      error: 'No se pudo verificar el horario. Por favor intenta de nuevo.'
    };
  }
  
  // Validar carrito
  if (isEmpty()) {
    return {
      success: false,
      error: 'El carrito está vacío'
    };
  }
  
  // Obtener customer_id
  const customerId = getCustomerId();
  if (!customerId) {
    return {
      success: false,
      error: 'Debes iniciar sesión para hacer un pedido'
    };
  }
  
  // Validar campos obligatorios
  if (!order_type || !['delivery', 'pickup'].includes(order_type)) {
    return {
      success: false,
      error: 'Tipo de pedido inválido. Debe ser "delivery" o "pickup"'
    };
  }
  
  if (order_type === 'delivery' && !delivery_address) {
    return {
      success: false,
      error: 'La dirección de entrega es requerida para delivery'
    };
  }
  
  if (!payment_method || !['cash', 'card', 'transfer'].includes(payment_method)) {
    return {
      success: false,
      error: 'Método de pago inválido. Debe ser "cash", "card" o "transfer"'
    };
  }
  
  // Preparar datos del pedido
  const orderData = {
    customer_id: customerId,
    order_type: order_type,
    items: transformForAPI(),
    payment_method: payment_method,
    total: getTotal(),
    delivery_address: order_type === 'delivery' ? delivery_address : null,
    delivery_notes: delivery_notes || null
  };
  
  console.log('[Cart] Creating order:', orderData);
  
  // Verificar conexión
  if (!navigator.onLine) {
    return await saveOrderForSync(orderData);
  }
  
  // Intentar crear pedido
  try {
    const response = await createOrder(orderData);
    
    if (response.success) {
      console.log('[Cart] Order created successfully:', response.order);
      clearCart();
      return {
        success: true,
        order: response.order,
        message: '¡Pedido realizado con éxito!'
      };
    }
    
    return {
      success: false,
      error: response.error || 'Error al crear el pedido'
    };
  } catch (error) {
    console.error('[Cart] Failed to create order:', error);
    
    // Si falla por conexión, guardar para sincronización
    if (!navigator.onLine) {
      return await saveOrderForSync(orderData);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Guardar pedido para sincronización offline
 */
async function saveOrderForSync(orderData) {
  console.log('[Cart] Saving order for offline sync...');
  
  const token = getAuthToken();
  
  // Registrar sync en Service Worker
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Enviar pedido al SW para guardarlo en IndexedDB
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            registration.sync.register('sync-orders').then(() => {
              clearCart();
              resolve({
                success: true,
                offline: true,
                message: 'Pedido guardado. Se enviará cuando tengas conexión.'
              });
            });
          } else {
            resolve({
              success: false,
              error: 'Error al guardar el pedido offline'
            });
          }
        };
        
        navigator.serviceWorker.controller.postMessage({
          type: 'SAVE_PENDING_ORDER',
          order: orderData,
          token: token
        }, [messageChannel.port2]);
      });
    } catch (error) {
      console.error('[Cart] Failed to save offline order:', error);
    }
  }
  
  return {
    success: false,
    error: 'No hay conexión y no se pudo guardar el pedido'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCUCHAR SINCRONIZACIÓN DEL SW
// ═══════════════════════════════════════════════════════════════════════════

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'ORDER_SYNCED') {
      console.log('[Cart] Order synced from SW:', event.data.orderId);
      
      // Notificar al usuario
      window.dispatchEvent(new CustomEvent('order:synced', {
        detail: event.data
      }));
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAR AL CARGAR
// ═══════════════════════════════════════════════════════════════════════════

loadCart();

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR OBJETO CART PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

const Cart = {
  loadCart,
  addItem,
  removeItem,
  updateQuantity,
  incrementItem,
  decrementItem,
  clearCart,
  getItems,
  getTotalItems,
  getTotal,
  isEmpty,
  getItem,
  transformForAPI,
  checkout
};

// Exponer globalmente
if (typeof window !== 'undefined') {
  window.Cart = Cart;
}

export default Cart;
