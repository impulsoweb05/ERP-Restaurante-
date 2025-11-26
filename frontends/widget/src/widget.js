/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESTAURANT CHAT WIDGET
 * Embeddable chat widget for restaurant order taking
 * ═══════════════════════════════════════════════════════════════════════════
 */

import './styles.css';
import { ChatAPI } from './chat-api.js';
import { validateInput, getPlaceholder, isReadonly } from './state-machine.js';

// Storage keys
const STORAGE_KEYS = {
  SESSION_ID: 'widget_session_id',
  PHONE: 'widget_phone',
  CURRENT_LEVEL: 'widget_current_level',
  CONVERSATION_HISTORY: 'widget_conversation_history',
  LAST_ACTIVITY: 'widget_last_activity'
};

// Session timeout (24 hours in milliseconds)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

/**
 * Restaurant Chat Widget Class
 */
class RestauranteChatWidget {
  /**
   * @param {Object} config - Widget configuration
   * @param {string} config.apiUrl - Backend API URL
   * @param {string} [config.restaurantName] - Restaurant name for header
   * @param {string} [config.primaryColor] - Primary color (hex)
   * @param {string} [config.position] - Button position (bottom-right | bottom-left)
   * @param {string} [config.welcomeMessage] - Custom welcome message
   * @param {string} [config.buttonIcon] - Custom button icon URL
   * @param {string} [config.locale] - Language (es | en)
   */
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:4000/api',
      restaurantName: config.restaurantName || 'Restaurante',
      primaryColor: config.primaryColor || '#FF6B35',
      position: config.position || 'bottom-right',
      welcomeMessage: config.welcomeMessage || null,
      buttonIcon: config.buttonIcon || null,
      locale: config.locale || 'es'
    };

    this.sessionId = null;
    this.currentLevel = 0;
    this.isOpen = false;
    this.phone = null;
    this.isLoading = false;
    this.conversationHistory = [];
    this.unreadCount = 0;

    this.api = new ChatAPI(this.config.apiUrl);
    this.elements = {};

    this.init();
  }

  /**
   * Initialize the widget
   */
  init() {
    this.loadSession();
    this.createWidget();
    this.attachEventListeners();
    this.applyCustomColors();

    // Show welcome message if new session
    if (this.conversationHistory.length === 0) {
      this.showWelcomeMessage();
    } else {
      this.renderConversationHistory();
    }
  }

  /**
   * Load session from localStorage
   */
  loadSession() {
    try {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      
      // Check if session has expired
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceActivity > SESSION_TIMEOUT) {
          this.clearSession();
          return;
        }
      }

      this.sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID) || this.generateUUID();
      this.currentLevel = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL) || '0', 10);
      this.phone = localStorage.getItem(STORAGE_KEYS.PHONE) || null;

      const historyJson = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
      if (historyJson) {
        this.conversationHistory = JSON.parse(historyJson);
      }

      localStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId);
      this.updateLastActivity();
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
    }
  }

  /**
   * Save session to localStorage
   */
  saveSession() {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, String(this.currentLevel));
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(this.conversationHistory));
      
      if (this.phone) {
        localStorage.setItem(STORAGE_KEYS.PHONE, this.phone);
      }
      
      this.updateLastActivity();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity() {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, String(Date.now()));
  }

  /**
   * Clear session from localStorage
   */
  clearSession() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    this.sessionId = this.generateUUID();
    this.currentLevel = 0;
    this.phone = null;
    this.conversationHistory = [];
    
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId);
  }

  /**
   * Generate UUID v4
   * @returns {string}
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Create widget HTML and inject into DOM
   */
  createWidget() {
    // Create container
    const container = document.createElement('div');
    container.className = 'restaurant-chat-widget';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Chat de pedidos');

    const positionClass = this.config.position === 'bottom-left' ? 'bottom-left' : '';

    container.innerHTML = `
      <!-- Floating Button -->
      <button class="restaurant-chat-button ${positionClass}" 
              aria-label="Abrir chat" 
              aria-expanded="false"
              aria-controls="restaurant-chat-window">
        <span class="restaurant-chat-button-badge" aria-live="polite"></span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>

      <!-- Chat Window -->
      <div id="restaurant-chat-window" 
           class="restaurant-chat-window ${positionClass}" 
           role="dialog" 
           aria-labelledby="restaurant-chat-title"
           aria-modal="true">
        
        <!-- Header -->
        <div class="restaurant-chat-header">
          <div class="restaurant-chat-header-info">
            <div class="restaurant-chat-header-avatar">🍽️</div>
            <div class="restaurant-chat-header-text">
              <h3 id="restaurant-chat-title">${this.escapeHtml(this.config.restaurantName)}</h3>
              <div class="restaurant-chat-header-status">
                <span class="restaurant-chat-header-status-dot"></span>
                <span>En línea</span>
              </div>
            </div>
          </div>
          <button class="restaurant-chat-close-btn" aria-label="Cerrar chat">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div class="restaurant-chat-messages" 
             role="log" 
             aria-live="polite" 
             aria-label="Mensajes del chat">
          <!-- Typing indicator -->
          <div class="restaurant-chat-typing" aria-label="Escribiendo...">
            <div class="restaurant-chat-typing-dots">
              <span class="restaurant-chat-typing-dot"></span>
              <span class="restaurant-chat-typing-dot"></span>
              <span class="restaurant-chat-typing-dot"></span>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div class="restaurant-chat-error" role="alert"></div>

        <!-- Input Area -->
        <div class="restaurant-chat-input-area">
          <div class="restaurant-chat-input-wrapper">
            <textarea class="restaurant-chat-input" 
                      rows="1"
                      placeholder="${getPlaceholder(this.currentLevel)}"
                      aria-label="Escribe tu mensaje"></textarea>
          </div>
          <button class="restaurant-chat-send-btn" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Store element references
    this.elements = {
      container,
      button: container.querySelector('.restaurant-chat-button'),
      badge: container.querySelector('.restaurant-chat-button-badge'),
      window: container.querySelector('.restaurant-chat-window'),
      closeBtn: container.querySelector('.restaurant-chat-close-btn'),
      messages: container.querySelector('.restaurant-chat-messages'),
      typing: container.querySelector('.restaurant-chat-typing'),
      error: container.querySelector('.restaurant-chat-error'),
      input: container.querySelector('.restaurant-chat-input'),
      sendBtn: container.querySelector('.restaurant-chat-send-btn'),
      statusDot: container.querySelector('.restaurant-chat-header-status-dot')
    };
  }

  /**
   * Apply custom colors from config
   */
  applyCustomColors() {
    if (this.config.primaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--widget-primary', this.config.primaryColor);
      
      // Calculate darker shade for hover
      const darkerColor = this.adjustColor(this.config.primaryColor, -20);
      root.style.setProperty('--widget-primary-dark', darkerColor);
    }
  }

  /**
   * Adjust color brightness
   * @param {string} color - Hex color
   * @param {number} amount - Amount to adjust
   * @returns {string}
   */
  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle button
    this.elements.button.addEventListener('click', () => this.toggle());

    // Close button
    this.elements.closeBtn.addEventListener('click', () => this.close());

    // Send button
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

    // Input enter key
    this.elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.elements.input.addEventListener('input', () => {
      this.autoResizeInput();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Click outside to close (optional behavior)
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          !this.elements.window.contains(e.target) && 
          !this.elements.button.contains(e.target)) {
        // Optional: uncomment to close on outside click
        // this.close();
      }
    });
  }

  /**
   * Auto-resize textarea based on content
   */
  autoResizeInput() {
    const input = this.elements.input;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }

  /**
   * Toggle chat window
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open chat window
   */
  open() {
    this.isOpen = true;
    this.elements.window.classList.add('open');
    this.elements.button.classList.add('open');
    this.elements.button.setAttribute('aria-expanded', 'true');
    this.elements.input.focus();
    this.scrollToBottom();
    this.clearUnreadCount();
  }

  /**
   * Close chat window
   */
  close() {
    this.isOpen = false;
    this.elements.window.classList.remove('open');
    this.elements.button.classList.remove('open');
    this.elements.button.setAttribute('aria-expanded', 'false');
  }

  /**
   * Show welcome message
   */
  async showWelcomeMessage() {
    this.showTypingIndicator();
    
    // Send initial message to get welcome from backend
    const response = await this.api.sendMessage(this.sessionId, 'hola', this.phone);
    
    this.hideTypingIndicator();

    if (response.success && response.data) {
      this.currentLevel = response.data.current_level || 0;
      this.addMessageToUI('bot', response.data.message);
      this.saveSession();
    } else {
      // Fallback welcome message
      const welcomeMsg = this.config.welcomeMessage || 
        '👋 ¡Bienvenido! Estoy aquí para ayudarte con tu pedido. ¿En qué puedo ayudarte?';
      this.addMessageToUI('bot', welcomeMsg);
    }

    this.updatePlaceholder();
  }

  /**
   * Send user message
   */
  async sendMessage() {
    const message = this.elements.input.value.trim();
    
    if (!message || this.isLoading) {
      return;
    }

    // Check if readonly
    if (isReadonly(this.currentLevel)) {
      return;
    }

    // Client-side validation
    const validation = validateInput(this.currentLevel, message);
    if (!validation.valid) {
      this.showError(validation.errorMsg);
      return;
    }

    this.hideError();

    // Add user message to UI
    this.addMessageToUI('user', message);
    
    // Clear input
    this.elements.input.value = '';
    this.autoResizeInput();

    // Show loading state
    this.setLoading(true);
    this.showTypingIndicator();

    // Check if this is phone input (level 1)
    if (this.currentLevel === 1 && /^\d{10}$/.test(message)) {
      this.phone = message;
    }

    // Send to backend
    const response = await this.api.sendMessage(this.sessionId, message, this.phone);

    this.hideTypingIndicator();
    this.setLoading(false);

    if (response.success && response.data) {
      this.currentLevel = response.data.current_level || this.currentLevel;
      this.addMessageToUI('bot', response.data.message);
      this.saveSession();
      this.updatePlaceholder();

      // Check if order completed (level 13)
      if (this.currentLevel === 13) {
        // Clear session after order completion
        setTimeout(() => {
          this.clearSession();
        }, 60000); // Clear after 1 minute
      }
    } else {
      this.showError(response.error || 'Error al procesar tu mensaje');
    }
  }

  /**
   * Add message to UI
   * @param {string} role - 'bot' or 'user'
   * @param {string} message - Message text
   */
  addMessageToUI(role, message) {
    const timestamp = new Date().toISOString();
    
    // Add to history
    this.conversationHistory.push({ role, message, timestamp });
    
    // Create message element
    const messageEl = this.createMessageElement(role, message, timestamp);
    
    // Insert before typing indicator
    this.elements.messages.insertBefore(messageEl, this.elements.typing);
    
    this.scrollToBottom();

    // Update unread count if window is closed
    if (!this.isOpen && role === 'bot') {
      this.incrementUnreadCount();
    }
  }

  /**
   * Create message element
   * @param {string} role - 'bot' or 'user'
   * @param {string} message - Message text
   * @param {string} timestamp - ISO timestamp
   * @returns {HTMLElement}
   */
  createMessageElement(role, message, timestamp) {
    const div = document.createElement('div');
    div.className = `restaurant-chat-message ${role}`;
    
    const time = new Date(timestamp);
    const timeStr = time.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    div.innerHTML = `
      <div class="restaurant-chat-message-bubble">${this.formatMessage(message)}</div>
      <div class="restaurant-chat-message-timestamp">${timeStr}</div>
    `;

    return div;
  }

  /**
   * Format message (handle emojis, line breaks, etc.)
   * @param {string} message - Raw message
   * @returns {string}
   */
  formatMessage(message) {
    // Escape HTML first
    let formatted = this.escapeHtml(message);
    
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render conversation history
   */
  renderConversationHistory() {
    this.conversationHistory.forEach(({ role, message, timestamp }) => {
      const messageEl = this.createMessageElement(role, message, timestamp);
      this.elements.messages.insertBefore(messageEl, this.elements.typing);
    });
    
    this.scrollToBottom();
    this.updatePlaceholder();
  }

  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    requestAnimationFrame(() => {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    });
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    this.elements.typing.classList.add('visible');
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    this.elements.typing.classList.remove('visible');
  }

  /**
   * Set loading state
   * @param {boolean} loading
   */
  setLoading(loading) {
    this.isLoading = loading;
    this.elements.input.disabled = loading;
    this.elements.sendBtn.disabled = loading;
  }

  /**
   * Update input placeholder based on current level
   */
  updatePlaceholder() {
    this.elements.input.placeholder = getPlaceholder(this.currentLevel);
    
    if (isReadonly(this.currentLevel)) {
      this.elements.input.disabled = true;
      this.elements.sendBtn.disabled = true;
    } else {
      this.elements.input.disabled = this.isLoading;
      this.elements.sendBtn.disabled = this.isLoading;
    }
  }

  /**
   * Show error message
   * @param {string} message
   */
  showError(message) {
    this.elements.error.textContent = message;
    this.elements.error.classList.add('visible');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  /**
   * Hide error message
   */
  hideError() {
    this.elements.error.classList.remove('visible');
  }

  /**
   * Increment unread message count
   */
  incrementUnreadCount() {
    this.unreadCount++;
    this.updateBadge();
  }

  /**
   * Clear unread message count
   */
  clearUnreadCount() {
    this.unreadCount = 0;
    this.updateBadge();
  }

  /**
   * Update badge visibility and count
   */
  updateBadge() {
    if (this.unreadCount > 0) {
      this.elements.badge.textContent = this.unreadCount > 9 ? '9+' : String(this.unreadCount);
      this.elements.badge.classList.add('visible');
    } else {
      this.elements.badge.classList.remove('visible');
    }
  }

  /**
   * Set connection status
   * @param {boolean} online
   */
  setConnectionStatus(online) {
    if (online) {
      this.elements.statusDot.classList.remove('offline');
    } else {
      this.elements.statusDot.classList.add('offline');
    }
  }

  /**
   * Reset session and start fresh
   */
  async resetSession() {
    await this.api.resetSession(this.sessionId);
    this.clearSession();
    
    // Clear UI
    const messages = this.elements.messages.querySelectorAll('.restaurant-chat-message');
    messages.forEach(msg => msg.remove());
    
    this.showWelcomeMessage();
  }

  /**
   * Destroy widget and clean up
   */
  destroy() {
    if (this.elements.container) {
      this.elements.container.remove();
    }
  }
}

// Export for use
export default RestauranteChatWidget;

// Also attach to window for UMD usage
if (typeof window !== 'undefined') {
  window.RestauranteChatWidget = RestauranteChatWidget;
}
