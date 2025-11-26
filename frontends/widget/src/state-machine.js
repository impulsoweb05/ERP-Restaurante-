/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE MACHINE - Client-side validation and level configuration
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const LEVELS = {
  0: {
    validation: null,
    placeholder: 'Escribe cualquier cosa para comenzar...',
    errorMsg: null
  },
  1: {
    validation: (msg) => /^\d{10}$/.test(msg),
    placeholder: 'Ingresa tu teléfono (10 dígitos)...',
    errorMsg: '⚠️ Debe ser un teléfono de 10 dígitos'
  },
  2: {
    validation: (msg) => /^[1-9]\d*$/.test(msg),
    placeholder: 'Elige un número...',
    errorMsg: '⚠️ Elige una opción válida'
  },
  3: {
    validation: (msg) => /^[1-9]\d*$/.test(msg),
    placeholder: 'Elige un número...',
    errorMsg: '⚠️ Elige una opción válida'
  },
  4: {
    validation: (msg) => /^[1-9]\d*$/.test(msg),
    placeholder: 'Elige un número...',
    errorMsg: '⚠️ Elige una opción válida'
  },
  5: {
    validation: (msg) => /^[1-9]\d*$/.test(msg) && parseInt(msg, 10) <= 20,
    placeholder: 'Cantidad (1-20)...',
    errorMsg: '⚠️ Cantidad entre 1 y 20'
  },
  6: {
    validation: null,
    placeholder: "Instrucciones especiales o 'no'...",
    errorMsg: null
  },
  7: {
    validation: (msg) => ['si', 'sí', 'no'].includes(msg.toLowerCase().trim()),
    placeholder: "Escribe 'si' o 'no'...",
    errorMsg: "⚠️ Responde 'si' o 'no'"
  },
  8: {
    validation: (msg) => ['si', 'sí', 'no'].includes(msg.toLowerCase().trim()),
    placeholder: "Escribe 'si' o 'no'...",
    errorMsg: "⚠️ Responde 'si' o 'no'"
  },
  9: {
    validation: (msg) => msg.trim().length >= 10,
    placeholder: 'Escribe tu dirección completa...',
    errorMsg: '⚠️ Dirección muy corta (mínimo 10 caracteres)'
  },
  10: {
    validation: null,
    placeholder: 'Referencias de ubicación...',
    errorMsg: null
  },
  11: {
    validation: (msg) => ['1', '2', '3', '4'].includes(msg.trim()),
    placeholder: 'Elige 1, 2, 3 o 4...',
    errorMsg: '⚠️ Opción inválida'
  },
  12: {
    validation: (msg) => ['si', 'sí', 'no'].includes(msg.toLowerCase().trim()),
    placeholder: "Escribe 'si' o 'no'...",
    errorMsg: "⚠️ Responde 'si' o 'no'"
  },
  13: {
    validation: null,
    placeholder: '',
    readonly: true,
    errorMsg: null
  },
  14: {
    validation: null,
    placeholder: 'Escribe tu mensaje...',
    errorMsg: null
  },
  15: {
    validation: null,
    placeholder: 'Escribe tu mensaje...',
    errorMsg: null
  }
};

/**
 * Validate user input based on current level
 * @param {number} level - Current conversation level
 * @param {string} message - User message to validate
 * @returns {{valid: boolean, errorMsg: string|null}}
 */
export function validateInput(level, message) {
  const levelConfig = LEVELS[level];
  
  if (!levelConfig) {
    return { valid: true, errorMsg: null };
  }
  
  if (!levelConfig.validation) {
    return { valid: true, errorMsg: null };
  }
  
  const isValid = levelConfig.validation(message);
  return {
    valid: isValid,
    errorMsg: isValid ? null : levelConfig.errorMsg
  };
}

/**
 * Get placeholder text for current level
 * @param {number} level - Current conversation level
 * @returns {string}
 */
export function getPlaceholder(level) {
  const levelConfig = LEVELS[level];
  return levelConfig ? levelConfig.placeholder : 'Escribe tu mensaje...';
}

/**
 * Check if current level is readonly
 * @param {number} level - Current conversation level
 * @returns {boolean}
 */
export function isReadonly(level) {
  const levelConfig = LEVELS[level];
  return levelConfig ? !!levelConfig.readonly : false;
}

export default {
  LEVELS,
  validateInput,
  getPlaceholder,
  isReadonly
};
