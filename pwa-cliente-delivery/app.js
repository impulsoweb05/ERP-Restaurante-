// ═══════════════════════════════════════════════════════════════════════════
// PWA Cliente Delivery - Aplicación Principal
// ═══════════════════════════════════════════════════════════════════════════

import API from './api.js';
import Auth from './auth.js';
import Cart from './cart.js';

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

let currentView = 'home';
let menuData = { categories: [], products: [] };
let selectedCategory = null;

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[App] Iniciando PWA Delivery...');
  
  // Registrar Service Worker
  await registerServiceWorker();
  
  // Verificar autenticación
  await Auth.checkSession();
  
  // Configurar navegación
  setupNavigation();
  
  // Configurar búsqueda
  setupSearch();
  
  // Configurar offline
  setupOfflineDetection();
  
  // Cargar datos iniciales
  await loadInitialData();
  
  // Renderizar vista inicial
  renderCurrentView();
  
  // Actualizar UI del carrito
  updateCartUI();
  
  console.log('[App] PWA Delivery inicializada');
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE WORKER
// ═══════════════════════════════════════════════════════════════════════════

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[SW] Registrado:', reg.scope);
    } catch (error) {
      console.error('[SW] Error:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVEGACIÓN
// ═══════════════════════════════════════════════════════════════════════════

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      navigateTo(view);
    });
  });
  
  // Botón flotante del carrito
  document.getElementById('cart-floating')?.addEventListener('click', () => {
    navigateTo('cart');
  });
  
  // Botón de usuario
  document.getElementById('user-btn')?.addEventListener('click', () => {
    navigateTo('profile');
  });
}

function navigateTo(view) {
  currentView = view;
  
  // Actualizar navegación activa
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  
  // Renderizar vista
  renderCurrentView();
  
  // Scroll al inicio
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// BÚSQUEDA
// ═══════════════════════════════════════════════════════════════════════════

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  let debounceTimer;
  
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        searchProducts(query);
      } else if (currentView === 'search') {
        navigateTo('home');
      }
    }, 300);
  });
  
  searchInput?.addEventListener('focus', () => {
    if (currentView !== 'search') {
      navigateTo('search');
    }
  });
}

function searchProducts(query) {
  const filtered = menuData.products.filter(p => 
    p.name?.toLowerCase().includes(query.toLowerCase()) ||
    p.description?.toLowerCase().includes(query.toLowerCase())
  );
  
  currentView = 'search';
  renderSearchResults(filtered, query);
}

// ═══════════════════════════════════════════════════════════════════════════
// OFFLINE
// ═══════════════════════════════════════════════════════════════════════════

function setupOfflineDetection() {
  const banner = document.getElementById('offline-banner');
  
  const updateStatus = () => {
    if (navigator.onLine) {
      banner?.classList.add('hidden');
    } else {
      banner?.classList.remove('hidden');
    }
  };
  
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// ═══════════════════════════════════════════════════════════════════════════
// CARGAR DATOS
// ═══════════════════════════════════════════════════════════════════════════

async function loadInitialData() {
  try {
    const [categoriesRes, menuRes] = await Promise.all([
      API.getCategories(),
      API.getMenu()
    ]);
    
    if (categoriesRes.success) {
      menuData.categories = categoriesRes.data || [];
    }
    
    if (menuRes.success) {
      // Aplanar productos si vienen anidados
      let products = menuRes.data || [];
      if (products.length > 0 && Array.isArray(products[0]?.items)) {
        products = products.flatMap(cat => cat.items || []);
      }
      menuData.products = products;
    }
    
    console.log('[App] Datos cargados:', {
      categorías: menuData.categories.length,
      productos: menuData.products.length
    });
  } catch (error) {
    console.error('[App] Error cargando datos:', error);
    showToast('Error cargando el menú', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERIZADO
// ═══════════════════════════════════════════════════════════════════════════

function renderCurrentView() {
  const main = document.getElementById('main-content');
  if (!main) return;
  
  switch (currentView) {
    case 'home':
      renderHomeView(main);
      break;
    case 'search':
      renderSearchView(main);
      break;
    case 'cart':
      renderCartView(main);
      break;
    case 'orders':
      renderOrdersView(main);
      break;
    case 'profile':
      renderProfileView(main);
      break;
    default:
      renderHomeView(main);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════════════════

function renderHomeView(container) {
  const categoryIcons = {
    'Entradas': '🥗',
    'Platos Fuertes': '🍖',
    'Bebidas': '🥤',
    'Postres': '🍰',
    'Pizzas': '🍕',
    'Hamburguesas': '🍔',
    'Pastas': '🍝',
    'Ensaladas': '🥬',
    'Sopas': '🍲',
    'default': '🍽️'
  };
  
  container.innerHTML = `
    <!-- Categorías -->
    <section class="categories-section">
      <h2 class="section-title">Categorías</h2>
      <div class="categories-scroll">
        <button class="category-card ${!selectedCategory ? 'active' : ''}" data-category="">
          <span class="category-icon">🍽️</span>
          <span class="category-name">Todo</span>
        </button>
        ${menuData.categories.map(cat => `
          <button class="category-card ${selectedCategory === cat.category_id ? 'active' : ''}" data-category="${cat.category_id}">
            <span class="category-icon">${categoryIcons[cat.name] || categoryIcons.default}</span>
            <span class="category-name">${cat.name}</span>
          </button>
        `).join('')}
      </div>
    </section>
    
    <!-- Productos -->
    <section class="products-section">
      <h2 class="section-title">${selectedCategory ? 'Productos' : 'Menú del Día'}</h2>
      <div class="products-grid">
        ${renderProducts(getFilteredProducts())}
      </div>
    </section>
  `;
  
  // Event listeners para categorías
  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedCategory = card.dataset.category || null;
      renderHomeView(container);
    });
  });
  
  // Event listeners para productos
  setupProductListeners(container);
}

function getFilteredProducts() {
  if (!selectedCategory) {
    return menuData.products.slice(0, 20);
  }
  return menuData.products.filter(p => p.category_id === selectedCategory);
}

function renderProducts(products) {
  if (products.length === 0) {
    return '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay productos disponibles</p>';
  }
  
  return products.map(product => `
    <div class="product-card" data-product-id="${product.product_id}">
      <img class="product-image" src="${product.image_url || 'https://via.placeholder.com/200x120?text=Producto'}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <h3 class="product-name">${product.name || 'Producto'}</h3>
        <p class="product-description">${product.description || ''}</p>
        <div class="product-footer">
          <span class="product-price">$${parseFloat(product.price || 0).toFixed(2)}</span>
          <button class="add-btn" data-product-id="${product.product_id}">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupProductListeners(container) {
  // Click en tarjeta de producto
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-btn')) {
        const productId = card.dataset.productId;
        showProductDetail(productId);
      }
    });
  });
  
  // Click en botón agregar
  container.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      addToCart(productId);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH VIEW
// ═══════════════════════════════════════════════════════════════════════════

function renderSearchView(container) {
  container.innerHTML = `
    <div class="search-view">
      <h2 class="section-title">Buscar</h2>
      <p style="color: var(--text-secondary);">Escribe para buscar productos...</p>
    </div>
  `;
}

function renderSearchResults(products, query) {
  const container = document.getElementById('main-content');
  
  container.innerHTML = `
    <section class="products-section">
      <h2 class="section-title">Resultados para "${query}"</h2>
      <div class="products-grid">
        ${renderProducts(products)}
      </div>
    </section>
  `;
  
  setupProductListeners(container);
}

// ═══════════════════════════════════════════════════════════════════════════
// CART VIEW
// ═══════════════════════════════════════════════════════════════════════════

function renderCartView(container) {
  const items = Cart.getItems();
  const total = Cart.getTotal();
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-view">
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p class="cart-empty-text">Tu carrito está vacío</p>
          <button class="checkout-btn" onclick="navigateTo('home')">Ver Menú</button>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="cart-view">
      <h2 class="section-title">Tu Carrito</h2>
      
      ${items.map(item => `
        <div class="cart-item">
          <img class="cart-item-image" src="${item.image_url || 'https://via.placeholder.com/80'}" alt="${item.name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.unit_price.toFixed(2)}</div>
            <div class="quantity-controls">
              <button class="qty-btn" data-action="decrease" data-id="${item.product_id}">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" data-action="increase" data-id="${item.product_id}">+</button>
            </div>
          </div>
        </div>
      `).join('')}
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Envío</span>
          <span>$5.00</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>$${(total + 5).toFixed(2)}</span>
        </div>
      </div>
      
      <button class="checkout-btn" id="checkout-btn">
        Realizar Pedido - $${(total + 5).toFixed(2)}
      </button>
    </div>
  `;
  
  // Event listeners
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      
      if (action === 'increase') {
        Cart.incrementItem(id);
      } else {
        Cart.decrementItem(id);
      }
      
      updateCartUI();
      renderCartView(container);
    });
  });
  
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    processCheckout();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS VIEW
// ═══════════════════════════════════════════════════════════════════════════

async function renderOrdersView(container) {
  if (!Auth.isAuthenticated()) {
    container.innerHTML = `
      <div class="login-view">
        <div class="login-icon">📦</div>
        <h2 class="login-title">Mis Pedidos</h2>
        <p class="login-subtitle">Inicia sesión para ver tu historial</p>
        <button class="login-btn" onclick="navigateTo('profile')">Iniciar Sesión</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="orders-view">
      <h2 class="section-title">Mis Pedidos</h2>
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    </div>
  `;
  
  try {
    const response = await API.getCustomerOrders(Auth.getCustomerId());
    
    if (response.success && response.orders?.length > 0) {
      container.innerHTML = `
        <div class="orders-view">
          <h2 class="section-title">Mis Pedidos</h2>
          ${response.orders.map(order => `
            <div class="order-card">
              <div class="order-header">
                <span class="order-id">Pedido #${order.order_id?.slice(-6)}</span>
                <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span>
              </div>
              <div class="order-date">${formatDate(order.created_at)}</div>
              <div class="order-items">${order.items?.length || 0} productos</div>
              <div class="order-total">Total: $${parseFloat(order.total || 0).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="orders-view">
          <h2 class="section-title">Mis Pedidos</h2>
          <div class="cart-empty">
            <div class="cart-empty-icon">📦</div>
            <p class="cart-empty-text">Aún no tienes pedidos</p>
            <button class="checkout-btn" onclick="navigateTo('home')">Hacer mi primer pedido</button>
          </div>
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `
      <div class="orders-view">
        <h2 class="section-title">Mis Pedidos</h2>
        <p style="text-align: center; color: var(--error);">Error al cargar pedidos</p>
      </div>
    `;
  }
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE VIEW
// ═══════════════════════════════════════════════════════════════════════════

function renderProfileView(container) {
  if (!Auth.isAuthenticated()) {
    renderLoginView(container);
    return;
  }
  
  const customer = Auth.getCustomer();
  
  container.innerHTML = `
    <div class="profile-view">
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-name">${customer?.full_name || 'Usuario'}</div>
        <div class="profile-phone">${customer?.phone || ''}</div>
      </div>
      
      <div class="profile-menu">
        <button class="profile-menu-item">
          <span class="profile-menu-icon">📍</span>
          <span class="profile-menu-text">Mis Direcciones</span>
          <span class="profile-menu-arrow">›</span>
        </button>
        <button class="profile-menu-item">
          <span class="profile-menu-icon">💳</span>
          <span class="profile-menu-text">Métodos de Pago</span>
          <span class="profile-menu-arrow">›</span>
        </button>
        <button class="profile-menu-item">
          <span class="profile-menu-icon">🔔</span>
          <span class="profile-menu-text">Notificaciones</span>
          <span class="profile-menu-arrow">›</span>
        </button>
        <button class="profile-menu-item">
          <span class="profile-menu-icon">❓</span>
          <span class="profile-menu-text">Ayuda</span>
          <span class="profile-menu-arrow">›</span>
        </button>
      </div>
      
      <button class="logout-btn" id="logout-btn">Cerrar Sesión</button>
    </div>
  `;
  
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Auth.logout();
    showToast('Sesión cerrada', 'success');
    renderProfileView(container);
  });
}

function renderLoginView(container) {
  container.innerHTML = `
    <div class="login-view">
      <div class="login-icon">🍕</div>
      <h2 class="login-title">Bienvenido</h2>
      <p class="login-subtitle">Ingresa tu teléfono para continuar</p>
      
      <form class="login-form" id="login-form">
        <div class="form-group">
          <label class="form-label">Número de teléfono</label>
          <input type="tel" class="form-input" id="phone-input" placeholder="3001234567" required>
        </div>
        <button type="submit" class="login-btn">Continuar</button>
      </form>
      
      <p class="register-link">
        ¿Primera vez? <a href="#" id="register-link">Regístrate aquí</a>
      </p>
    </div>
  `;
  
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone-input').value;
    
    const result = await Auth.login(phone);
    if (result.success) {
      showToast('¡Bienvenido!', 'success');
      renderProfileView(container);
    } else {
      showToast(result.error || 'Error al iniciar sesión', 'error');
    }
  });
  
  document.getElementById('register-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderRegisterView(container);
  });
}

function renderRegisterView(container) {
  container.innerHTML = `
    <div class="login-view">
      <div class="login-icon">📝</div>
      <h2 class="login-title">Crear Cuenta</h2>
      <p class="login-subtitle">Completa tus datos para registrarte</p>
      
      <form class="login-form" id="register-form">
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input type="text" class="form-input" id="name-input" placeholder="Juan Pérez" required>
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input type="tel" class="form-input" id="phone-input" placeholder="3001234567" required>
        </div>
        <div class="form-group">
          <label class="form-label">Dirección</label>
          <input type="text" class="form-input" id="address-input" placeholder="Calle 123 #45-67" required>
        </div>
        <button type="submit" class="login-btn">Registrarme</button>
      </form>
      
      <p class="register-link">
        ¿Ya tienes cuenta? <a href="#" id="login-link">Inicia sesión</a>
      </p>
    </div>
  `;
  
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      full_name: document.getElementById('name-input').value,
      phone: document.getElementById('phone-input').value,
      address_1: document.getElementById('address-input').value
    };
    
    const result = await Auth.register(data);
    if (result.success) {
      showToast('¡Cuenta creada!', 'success');
      renderProfileView(container);
    } else {
      showToast(result.error || 'Error al registrar', 'error');
    }
  });
  
  document.getElementById('login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderLoginView(container);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL
// ═══════════════════════════════════════════════════════════════════════════

function showProductDetail(productId) {
  const product = menuData.products.find(p => p.product_id === productId);
  if (!product) return;
  
  const modal = document.getElementById('modal-container');
  modal.classList.remove('hidden');
  
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Detalle del Producto</h3>
        <button class="modal-close" id="close-modal">×</button>
      </div>
      <div class="modal-body">
        <div class="product-detail">
          <img class="product-detail-image" src="${product.image_url || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
          <h2 class="product-detail-name">${product.name}</h2>
          <p class="product-detail-description">${product.description || 'Delicioso producto de nuestro menú'}</p>
          <div class="product-detail-price">$${parseFloat(product.price || 0).toFixed(2)}</div>
          
          <div class="add-to-cart-section">
            <div class="quantity-controls">
              <button class="qty-btn" id="qty-decrease">−</button>
              <span class="qty-value" id="qty-value">1</span>
              <button class="qty-btn" id="qty-increase">+</button>
            </div>
            <button class="add-to-cart-btn" id="add-to-cart-btn">
              Agregar - $${parseFloat(product.price || 0).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  let quantity = 1;
  const qtyValue = document.getElementById('qty-value');
  const addBtn = document.getElementById('add-to-cart-btn');
  
  const updatePrice = () => {
    qtyValue.textContent = quantity;
    addBtn.textContent = `Agregar - $${(parseFloat(product.price || 0) * quantity).toFixed(2)}`;
  };
  
  document.getElementById('qty-decrease')?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      updatePrice();
    }
  });
  
  document.getElementById('qty-increase')?.addEventListener('click', () => {
    quantity++;
    updatePrice();
  });
  
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    Cart.addItem(product, quantity);
    updateCartUI();
    closeModal();
    showToast(`${quantity}x ${product.name} agregado`, 'success');
  });
  
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('modal-container');
  modal.classList.add('hidden');
  modal.innerHTML = '';
}

// ═══════════════════════════════════════════════════════════════════════════
// CARRITO
// ═══════════════════════════════════════════════════════════════════════════

function addToCart(productId) {
  const product = menuData.products.find(p => p.product_id === productId);
  if (product) {
    Cart.addItem(product);
    updateCartUI();
    showToast(`${product.name} agregado`, 'success');
  }
}

function updateCartUI() {
  const count = Cart.getTotalItems();
  const total = Cart.getTotal();
  
  // Badge en navegación
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
  
  // Botón flotante
  const floating = document.getElementById('cart-floating');
  const floatingCount = document.getElementById('floating-cart-count');
  const floatingTotal = document.getElementById('floating-cart-total');
  
  if (floating) {
    floating.classList.toggle('hidden', count === 0);
  }
  if (floatingCount) {
    floatingCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  }
  if (floatingTotal) {
    floatingTotal.textContent = `$${total.toFixed(2)}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT
// ═══════════════════════════════════════════════════════════════════════════

async function processCheckout() {
  if (!Auth.isAuthenticated()) {
    showToast('Inicia sesión para hacer tu pedido', 'warning');
    navigateTo('profile');
    return;
  }
  
  // Verificar si está abierto
  try {
    const scheduleRes = await API.isRestaurantOpen();
    if (!scheduleRes.success || !scheduleRes.data?.is_open) {
      showToast('El restaurante está cerrado', 'error');
      return;
    }
  } catch (error) {
    console.error('Error verificando horario:', error);
  }
  
  const customer = Auth.getCustomer();
  
  const orderData = {
    customer_id: Auth.getCustomerId(),
    order_type: 'delivery',
    items: Cart.transformForAPI(),
    delivery_address: customer?.address_1 || 'Dirección por confirmar',
    payment_method: 'cash',
    total: Cart.getTotal() + 5 // +envío
  };
  
  try {
    const result = await Cart.checkout(orderData);
    
    if (result.success) {
      showToast('¡Pedido realizado con éxito!', 'success');
      navigateTo('orders');
    } else {
      showToast(result.error || 'Error al procesar pedido', 'error');
    }
  } catch (error) {
    showToast('Error al procesar pedido', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

window.navigateTo = navigateTo;
window.showToast = showToast;
