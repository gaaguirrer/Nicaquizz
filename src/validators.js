/**
 * validators.js - Validación de Datos
 * 
 * Valida datos antes de enviar a Firestore.
 * Funciones: validateEmail, validatePassword, validateTrade, validateQuestion, validateAchioteExchange
 */

// ==================== VALIDACIONES DE USUARIO ====================

/**
 * Valida que un email tenga formato correcto
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'El email es requerido' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'El email no tiene un formato válido' };
  }
  
  if (email.length > 255) {
    return { valid: false, message: 'El email es demasiado largo' };
  }
  
  return { valid: true };
}

/**
 * Valida que una contraseña sea segura
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'La contraseña es demasiado larga' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      valid: false, 
      message: 'La contraseña debe contener al menos una letra y un número' 
    };
  }
  
  return { valid: true };
}

// ==================== VALIDACIONES DE TRUEQUES ====================

/**
 * Valida una solicitud de trueque
 */
export function validateTrade(tradeData) {
  const errors = [];
  const validIngredients = ['masa', 'cerdo', 'arroz', 'papa', 'chile', 'achiote'];
  
  if (!tradeData.offeredIngredient || !validIngredients.includes(tradeData.offeredIngredient)) {
    errors.push('Ingrediente ofrecido no válido');
  }
  
  if (!tradeData.requestedIngredient || !validIngredients.includes(tradeData.requestedIngredient)) {
    errors.push('Ingrediente solicitado no válido');
  }
  
  if (tradeData.offeredIngredient === tradeData.requestedIngredient) {
    errors.push('No se puede intercambiar el mismo ingrediente');
  }
  
  if (!tradeData.offeredAmount || tradeData.offeredAmount < 1 || tradeData.offeredAmount > 100) {
    errors.push('Cantidad ofrecida debe estar entre 1 y 100');
  }
  
  if (!tradeData.requestedAmount || tradeData.requestedAmount < 1 || tradeData.requestedAmount > 100) {
    errors.push('Cantidad solicitada debe estar entre 1 y 100');
  }
  
  return { valid: errors.length === 0, errors };
}

// ==================== VALIDACIONES DE PREGUNTAS ====================

/**
 * Valida una pregunta propuesta
 */
export function validateQuestion(questionData) {
  const errors = [];
  const validCategories = ['historia', 'matematicas', 'geografia', 'ciencias', 'retos'];
  const validDifficulties = ['easy', 'medium', 'hard'];
  
  if (!questionData.text || questionData.text.length < 10 || questionData.text.length > 1000) {
    errors.push('La pregunta debe tener entre 10 y 1000 caracteres');
  }
  
  if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
    errors.push('Debe haber exactamente 4 opciones');
  }
  
  if (typeof questionData.correctAnswer !== 'number' || questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
    errors.push('La respuesta correcta debe ser un índice entre 0 y 3');
  }
  
  if (!questionData.categoryId || !validCategories.includes(questionData.categoryId)) {
    errors.push('Categoría no válida');
  }
  
  if (!questionData.difficulty || !validDifficulties.includes(questionData.difficulty)) {
    errors.push('Dificultad no válida');
  }
  
  return { valid: errors.length === 0, errors };
}

// ==================== VALIDACIONES DE CANJE ====================

/**
 * Valida un canje de achiote
 */
export function validateAchioteExchange(achioteAmount, targetIngredient) {
  const errors = [];
  const validIngredients = ['masa', 'cerdo', 'arroz', 'papa', 'chile'];
  
  if (!achioteAmount || achioteAmount < 1 || achioteAmount > 100) {
    errors.push('La cantidad debe estar entre 1 y 100');
  }
  
  if (!targetIngredient || !validIngredients.includes(targetIngredient)) {
    errors.push('Ingrediente destino no válido');
  }
  
  return { valid: errors.length === 0, errors };
}

// ==================== VALIDACIONES GENERALES ====================

/**
 * Sanitiza un string para prevenir XSS
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Valida que un campo no esté vacío
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} es requerido` };
  }
  return { valid: true };
}
