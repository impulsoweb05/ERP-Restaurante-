// ═══════════════════════════════════════════════════════════════════════════
// APP.JS - Aplicación Principal PWA Cliente Restaurante
// Gestión de PWA, instalación y lógica principal
// ═══════════════════════════════════════════════════════════════════════════

import API from './api.js';
import Auth from './auth.js';
import Cart from './cart.js';
import Menu3D from './menu3d.js';

// ═══════════════════════════════════════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

let deferredPrompt = null;
let menu3dInstance = null;
let currentView = 'menu';
let menuData = { categories: [], products: [] };

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[App] Initializing...');
  
  // Registrar Service Worker
  await registerServiceWorker();
  
  // Configurar PWA install
  setupPWAInstall();
  
  // Configurar indicador offline
  setupOfflineIndicator();
  
  // Verificar autenticación
  const isAuthenticated = await Auth.checkExistingSession();
  
  // Manejar acciones desde URL
  handleURLActions();
  
  // Cargar datos iniciales
  await loadInitialData();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Renderizar UI inicial
  renderApp(isAuthenticated);
  
  console.log('[App] Initialized successfully');
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE WORKER
// ═══════════════════════════════════════════════════════════════════════════

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[App] Service Worker registered:', registration.scope);
      
      // Manejar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
    }
  }
}

function showUpdateNotification() {
  showToast('Nueva versión disponible. Recarga para actualizar.', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// PWA INSTALL
// ═══════════════════════════════════════════════════════════════════════════

function setupPWAInstall() {
  // Capturar evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    console.log('[App] Install prompt captured');
    showInstallBanner();
  });
  
  // Detectar instalación completada
  window.addEventListener('appinstalled', () => {
    console.log('[App] App installed');
    hideInstallBanner();
    deferredPrompt = null;
    
    // Analytics (opcional)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'app_installed');
    }
  });
  
  // Detectar iOS Safari
  if (isIOSSafari()) {
    setupIOSInstallPrompt();
  }
}

function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.classList.add('show');
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.classList.remove('show');
  }
}

async function handleInstallClick() {
  if (!deferredPrompt) {
    console.log('[App] No install prompt available');
    return;
  }
  
  deferredPrompt.prompt();
  
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[App] Install prompt outcome:', outcome);
  
  deferredPrompt = null;
  hideInstallBanner();
}

function isIOSSafari() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|OPiOS|mercury/.test(ua);
  const isStandalone = window.navigator.standalone === true;
  
  return isIOS && isSafari && !isStandalone;
}

function setupIOSInstallPrompt() {
  // Mostrar modal con instrucciones para iOS
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', showIOSInstallModal);
  }
}

function showIOSInstallModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Instalar App</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <p>Para instalar esta aplicación en tu iPhone/iPad:</p>
        <ol style="margin: 16px 0; padding-left: 20px;">
          <li>Toca el botón <strong>Compartir</strong> (📤) en la barra inferior de Safari</li>
          <li>Desliza hacia abajo y toca <strong>"Agregar a Inicio"</strong></li>
          <li>Toca <strong>"Agregar"</strong> en la esquina superior derecha</li>
        </ol>
        <p>¡Listo! La app aparecerá en tu pantalla de inicio.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary btn-full" onclick="this.closest('.modal-overlay').remove()">Entendido</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ═══════════════════════════════════════════════════════════════════════════
// OFFLINE INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

function setupOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  
  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      indicator?.classList.remove('show');
    } else {
      indicator?.classList.add('show');
    }
  };
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Verificar estado inicial
  updateOnlineStatus();
}

// ═══════════════════════════════════════════════════════════════════════════
// URL ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

function handleURLActions() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');
  
  if (action === 'menu') {
    currentView = 'menu';
  } else if (action === 'orders') {
    currentView = 'orders';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CARGA DE DATOS
// ═══════════════════════════════════════════════════════════════════════════

async function loadInitialData() {
  try {
    // Verificar si el restaurante está abierto
    const scheduleResponse = await API.isRestaurantOpen();
    if (scheduleResponse.success && scheduleResponse.data) {
      const isOpen = scheduleResponse.data.is_open;
      updateRestaurantStatus(isOpen);
    }
    
    // Cargar categorías y menú
    const [categoriesResponse, menuResponse] = await Promise.all([
      API.getCategories(),
      API.getMenu()
    ]);
    
    if (categoriesResponse.success) {
      menuData.categories = categoriesResponse.data || [];
    }
    
    if (menuResponse.success) {
      menuData.products = menuResponse.data || [];
    }
    
    console.log('[App] Data loaded:', {
      categories: menuData.categories.length,
      products: menuData.products.length
    });
  } catch (error) {
    console.error('[App] Failed to load initial data:', error);
  }
}

function updateRestaurantStatus(isOpen) {
  const statusEl = document.getElementById('restaurant-status');
  if (statusEl) {
    statusEl.textContent = isOpen ? '🟢 Abierto' : '🔴 Cerrado';
    statusEl.className = isOpen ? 'status-open' : 'status-closed';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

function setupEventListeners() {
  // Install button
  document.getElementById('install-btn')?.addEventListener('click', handleInstallClick);
  document.getElementById('install-close')?.addEventListener('click', hideInstallBanner);
  
  // Auth events
  window.addEventListener('auth:login', (e) => {
    console.log('[App] User logged in:', e.detail.customer);
    renderApp(true);
  });
  
  window.addEventListener('auth:logout', () => {
    console.log('[App] User logged out');
    renderApp(false);
  });
  
  // Cart events
  window.addEventListener('cart:updated', (e) => {
    updateCartUI(e.detail);
  });
  
  // Order synced
  window.addEventListener('order:synced', (e) => {
    showToast('¡Tu pedido pendiente se ha enviado!', 'success');
  });
  
  // Navigation
  setupNavigation();
}

function setupNavigation() {
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const view = el.dataset.view;
      navigateTo(view);
    });
  });
}

function navigateTo(view) {
  currentView = view;
  
  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.set('action', view);
  window.history.pushState({}, '', url);
  
  // Render view
  renderMainContent();
  
  // Update active nav
  document.querySelectorAll('[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════════════════

function renderApp(isAuthenticated) {
  // Update header based on auth state
  updateHeaderUI(isAuthenticated);
  
  // Render main content
  renderMainContent();
  
  // Update cart UI
  updateCartUI({
    count: Cart.getTotalItems(),
    total: Cart.getTotal()
  });
}

function updateHeaderUI(isAuthenticated) {
  const userInfo = document.getElementById('user-info');
  const authButtons = document.getElementById('auth-buttons');
  
  if (isAuthenticated) {
    const customer = Auth.getCurrentCustomer();
    if (userInfo) {
      userInfo.textContent = customer?.full_name || 'Usuario';
      userInfo.style.display = 'block';
    }
    if (authButtons) authButtons.style.display = 'none';
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (authButtons) authButtons.style.display = 'flex';
  }
}

function renderMainContent() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;
  
  switch (currentView) {
    case 'menu':
      renderMenuView(mainContent);
      break;
    case 'cart':
      renderCartView(mainContent);
      break;
    case 'orders':
      renderOrdersView(mainContent);
      break;
    case 'tables':
      renderTablesView(mainContent);
      break;
    case 'login':
      renderLoginView(mainContent);
      break;
    case 'register':
      renderRegisterView(mainContent);
      break;
    default:
      renderMenuView(mainContent);
  }
}

function renderMenuView(container) {
  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Categorías</h2>
      <div class="categories" id="categories-container">
        ${renderCategories()}
      </div>
    </div>
    <div class="section">
      <h2 class="section-title">Menú</h2>
      <div class="products-grid" id="products-container">
        ${renderProducts()}
      </div>
    </div>
  `;
  
  // Setup category click handlers
  container.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => filterByCategory(chip.dataset.categoryId));
  });
  
  // Setup add to cart handlers
  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const product = menuData.products.find(p => p.product_id === productId);
      if (product) {
        Cart.addItem(product);
        showToast('Producto agregado al carrito', 'success');
      }
    });
  });
}

function renderCategories() {
  if (menuData.categories.length === 0) {
    return '<p class="text-secondary">Cargando categorías...</p>';
  }
  
  return `
    <button class="category-chip active" data-category-id="">Todos</button>
    ${menuData.categories.map(cat => `
      <button class="category-chip" data-category-id="${cat.category_id}">
        ${cat.name}
      </button>
    `).join('')}
  `;
}

function renderProducts(categoryFilter = null) {
  let products = menuData.products;
  
  // Si es un array anidado, aplanarlo
  if (products.length > 0 && Array.isArray(products[0]?.items)) {
    products = products.flatMap(cat => cat.items || []);
  }
  
  if (categoryFilter) {
    products = products.filter(p => p.category_id === categoryFilter);
  }
  
  if (products.length === 0) {
    return '<p class="text-secondary">No hay productos disponibles</p>';
  }
  
  return products.map(product => `
    <div class="card">
      <img 
        class="card-image" 
        src="${product.image_url || 'https://via.placeholder.com/300x200?text=Sin+imagen'}" 
        alt="${product.name || product.product_name}"
        loading="lazy"
      />
      <div class="card-content">
        <h3 class="card-title">${product.name || product.product_name}</h3>
        <p class="card-description">${product.description || ''}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="card-price">$${parseFloat(product.price || 0).toFixed(2)}</span>
          <button class="btn btn-primary btn-add-cart" data-product-id="${product.product_id}">
            Agregar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterByCategory(categoryId) {
  const container = document.getElementById('products-container');
  if (container) {
    container.innerHTML = renderProducts(categoryId || null);
    
    // Re-attach event listeners
    container.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.productId;
        const product = menuData.products.find(p => p.product_id === productId);
        if (product) {
          Cart.addItem(product);
          showToast('Producto agregado al carrito', 'success');
        }
      });
    });
  }
  
  // Update active category
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.categoryId === categoryId);
  });
}

function renderCartView(container) {
  const items = Cart.getItems();
  const total = Cart.getTotal();
  
  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Carrito de Compras</h2>
      ${items.length === 0 ? `
        <p class="text-secondary">Tu carrito está vacío</p>
        <button class="btn btn-primary" data-view="menu">Ver Menú</button>
      ` : `
        <div class="card">
          ${items.map(item => `
            <div class="cart-item">
              <img class="cart-item-image" src="${item.image_url || 'https://via.placeholder.com/80'}" alt="${item.name}">
              <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.unit_price.toFixed(2)}</div>
              </div>
              <div class="cart-item-quantity">
                <button class="btn btn-icon btn-secondary" data-action="decrement" data-product-id="${item.product_id}">-</button>
                <span>${item.quantity}</span>
                <button class="btn btn-icon btn-secondary" data-action="increment" data-product-id="${item.product_id}">+</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cart-summary">
          <div class="cart-total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <button class="btn btn-primary btn-full" id="checkout-btn" style="margin-top: 16px;">
            Realizar Pedido
          </button>
        </div>
      `}
    </div>
  `;
  
  // Event listeners
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const productId = btn.dataset.productId;
      
      if (action === 'increment') Cart.incrementItem(productId);
      if (action === 'decrement') Cart.decrementItem(productId);
      
      renderCartView(container);
    });
  });
  
  container.querySelector('#checkout-btn')?.addEventListener('click', showCheckoutModal);
  
  setupNavigation();
}

function renderOrdersView(container) {
  const isAuth = Auth.getIsAuthenticated();
  
  if (!isAuth) {
    container.innerHTML = `
      <div class="section auth-container">
        <p class="text-secondary" style="text-align: center;">Debes iniciar sesión para ver tus pedidos</p>
        <button class="btn btn-primary btn-full" data-view="login">Iniciar Sesión</button>
      </div>
    `;
    setupNavigation();
    return;
  }
  
  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Mis Pedidos</h2>
      <div class="loading" id="orders-loading">
        <div class="spinner"></div>
      </div>
      <div id="orders-list"></div>
    </div>
  `;
  
  loadOrders();
}

async function loadOrders() {
  const customerId = Auth.getCustomerId();
  const listContainer = document.getElementById('orders-list');
  const loadingEl = document.getElementById('orders-loading');
  
  try {
    const response = await API.getCustomerOrders(customerId);
    
    if (loadingEl) loadingEl.style.display = 'none';
    
    if (response.success && response.orders?.length > 0) {
      listContainer.innerHTML = response.orders.map(order => `
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-content">
            <div style="display: flex; justify-content: space-between;">
              <strong>Pedido #${order.order_id?.slice(-8)}</strong>
              <span>${order.status}</span>
            </div>
            <p class="text-secondary">${new Date(order.created_at).toLocaleDateString()}</p>
            <p class="card-price">Total: $${parseFloat(order.total).toFixed(2)}</p>
          </div>
        </div>
      `).join('');
    } else {
      listContainer.innerHTML = '<p class="text-secondary">No tienes pedidos aún</p>';
    }
  } catch (error) {
    if (loadingEl) loadingEl.style.display = 'none';
    listContainer.innerHTML = '<p class="text-secondary">Error al cargar pedidos</p>';
  }
}

function renderTablesView(container) {
  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Mesas del Restaurante</h2>
      <div id="scene-container"></div>
      <div style="margin-top: 16px; display: flex; gap: 16px; justify-content: center;">
        <span style="display: flex; align-items: center; gap: 4px;">
          <span style="width: 16px; height: 16px; background: #4caf50; border-radius: 4px;"></span>
          Disponible
        </span>
        <span style="display: flex; align-items: center; gap: 4px;">
          <span style="width: 16px; height: 16px; background: #f44336; border-radius: 4px;"></span>
          Ocupada
        </span>
        <span style="display: flex; align-items: center; gap: 4px;">
          <span style="width: 16px; height: 16px; background: #ffeb3b; border-radius: 4px;"></span>
          Reservada
        </span>
      </div>
    </div>
  `;
  
  // Initialize 3D view
  setTimeout(() => {
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer && !menu3dInstance) {
      menu3dInstance = new Menu3D(sceneContainer);
      menu3dInstance.createTables();
    }
  }, 100);
}

function renderLoginView(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-logo">
        <div class="auth-logo-icon">R</div>
        <h1 class="auth-title">Bienvenido</h1>
        <p class="auth-subtitle">Ingresa tu número de teléfono para continuar</p>
      </div>
      <form class="form" id="login-form">
        <div class="form-group">
          <label class="form-label" for="phone">Teléfono</label>
          <input class="form-input" type="tel" id="phone" placeholder="3101111111" required />
        </div>
        <button class="btn btn-primary btn-full" type="submit">Iniciar Sesión</button>
      </form>
      <p class="auth-switch">
        ¿No tienes cuenta? <a href="#" data-view="register">Regístrate</a>
      </p>
    </div>
  `;
  
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  setupNavigation();
}

function renderRegisterView(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-logo">
        <div class="auth-logo-icon">R</div>
        <h1 class="auth-title">Registro</h1>
        <p class="auth-subtitle">Crea tu cuenta para ordenar</p>
      </div>
      <form class="form" id="register-form">
        <div class="form-group">
          <label class="form-label" for="full_name">Nombre Completo *</label>
          <input class="form-input" type="text" id="full_name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="phone">Teléfono *</label>
          <input class="form-input" type="tel" id="phone" placeholder="3101111111" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input class="form-input" type="email" id="email" />
        </div>
        <div class="form-group">
          <label class="form-label" for="address_1">Dirección *</label>
          <input class="form-input" type="text" id="address_1" required />
        </div>
        <button class="btn btn-primary btn-full" type="submit">Registrarme</button>
      </form>
      <p class="auth-switch">
        ¿Ya tienes cuenta? <a href="#" data-view="login">Inicia Sesión</a>
      </p>
    </div>
  `;
  
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  setupNavigation();
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

async function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('phone').value;
  
  const result = await Auth.login(phone);
  
  if (result.success) {
    showToast('¡Bienvenido!', 'success');
    navigateTo('menu');
  } else {
    showToast(result.error || 'Error al iniciar sesión', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const customerData = {
    full_name: document.getElementById('full_name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    address_1: document.getElementById('address_1').value
  };
  
  const result = await Auth.register(customerData);
  
  if (result.success) {
    showToast('¡Registro exitoso!', 'success');
    navigateTo('menu');
  } else {
    showToast(result.error || 'Error en el registro', 'error');
  }
}

function showCheckoutModal() {
  if (!Auth.getIsAuthenticated()) {
    showToast('Debes iniciar sesión para hacer un pedido', 'warning');
    navigateTo('login');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Confirmar Pedido</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <form class="form" id="checkout-form">
          <div class="form-group">
            <label class="form-label">Tipo de Pedido *</label>
            <select class="form-select" id="order_type" required>
              <option value="delivery">Delivery</option>
              <option value="pickup">Recoger en Local</option>
            </select>
          </div>
          <div class="form-group" id="address-group">
            <label class="form-label">Dirección de Entrega *</label>
            <input class="form-input" type="text" id="delivery_address" />
          </div>
          <div class="form-group">
            <label class="form-label">Notas (opcional)</label>
            <textarea class="form-textarea" id="delivery_notes" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Método de Pago *</label>
            <select class="form-select" id="payment_method" required>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <div class="cart-summary">
            <div class="cart-total">
              <span>Total:</span>
              <span>$${Cart.getTotal().toFixed(2)}</span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" id="confirm-order-btn">Confirmar Pedido</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Toggle address field based on order type
  const orderTypeSelect = modal.querySelector('#order_type');
  const addressGroup = modal.querySelector('#address-group');
  const addressInput = modal.querySelector('#delivery_address');
  
  orderTypeSelect.addEventListener('change', () => {
    const isDelivery = orderTypeSelect.value === 'delivery';
    addressGroup.style.display = isDelivery ? 'block' : 'none';
    addressInput.required = isDelivery;
  });
  
  // Pre-fill address from customer data
  const customer = Auth.getCurrentCustomer();
  if (customer?.address_1) {
    addressInput.value = customer.address_1;
  }
  
  // Confirm order
  modal.querySelector('#confirm-order-btn').addEventListener('click', async () => {
    const orderDetails = {
      order_type: orderTypeSelect.value,
      delivery_address: addressInput.value,
      delivery_notes: modal.querySelector('#delivery_notes').value,
      payment_method: modal.querySelector('#payment_method').value
    };
    
    const result = await Cart.checkout(orderDetails);
    
    modal.remove();
    
    if (result.success) {
      showToast(result.message || '¡Pedido realizado!', 'success');
      navigateTo('orders');
    } else {
      showToast(result.error || 'Error al crear pedido', 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function updateCartUI({ count, total }) {
  const badge = document.getElementById('cart-badge');
  const cartTotal = document.getElementById('cart-total');
  
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  
  if (cartTotal) {
    cartTotal.textContent = `$${total.toFixed(2)}`;
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTAR PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════════════════════

window.App = {
  navigateTo,
  showToast,
  handleInstallClick,
  Auth,
  Cart,
  API
};

export { navigateTo, showToast, handleInstallClick };
