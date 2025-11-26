/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT API - Communication with backend
 * ═══════════════════════════════════════════════════════════════════════════
 */

export class ChatAPI {
  /**
   * @param {string} apiUrl - Base API URL
   */
  constructor(apiUrl) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  /**
   * Send a message to the chat backend
   * @param {string} sessionId - Session UUID
   * @param {string} message - User message
   * @param {string|null} phone - Optional phone number
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async sendMessage(sessionId, message, phone = null) {
    try {
      const body = {
        session_id: sessionId,
        message: message
      };

      if (phone) {
        body.phone = phone;
      }

      const response = await fetch(`${this.apiUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al enviar mensaje'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('ChatAPI.sendMessage error:', error);
      return {
        success: false,
        error: 'Error de conexión. Intenta de nuevo.'
      };
    }
  }

  /**
   * Get session information
   * @param {string} sessionId - Session UUID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getSession(sessionId) {
    try {
      const response = await fetch(`${this.apiUrl}/chat/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al obtener sesión'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('ChatAPI.getSession error:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Reset session to level 0
   * @param {string} sessionId - Session UUID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async resetSession(sessionId) {
    try {
      const response = await fetch(`${this.apiUrl}/chat/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Error al resetear sesión'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('ChatAPI.resetSession error:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }
}

export default ChatAPI;
