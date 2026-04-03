/**
 * analytics.js - Tracking de Eventos
 * 
 * Envía eventos a Google Analytics 4.
 * Eventos: question_answered, challenge_completed, item_purchased, trade_completed, achievement_unlocked
 */

import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { app } from './infrastructure/firebase/firebase.config';

// Inicializar Analytics (solo en cliente)
let analytics = null;

if (typeof window !== 'undefined' && app) {
  analytics = getAnalytics(app);
}

// ==================== EVENTOS PRINCIPALES ====================

/**
 * Evento: Pregunta respondida
 */
export function logQuestionAnswered(categoryId, difficulty, isCorrect, timeSpent, score) {
  if (!analytics) return;
  
  logEvent(analytics, 'question_answered', {
    category_id: categoryId,
    difficulty: difficulty, // 'easy', 'medium', 'hard'
    is_correct: isCorrect,
    time_spent_seconds: Math.round(timeSpent / 1000),
    score: score,
    content_type: 'quiz_question'
  });
}

/**
 * Evento: Reto completado
 */
export function logChallengeCompleted(challengeType, result, userScore, opponentScore, categoryId) {
  if (!analytics) return;
  
  logEvent(analytics, 'challenge_completed', {
    challenge_type: challengeType, // 'daily', 'friend', 'open'
    result: result, // 'win', 'loss', 'draw'
    user_score: userScore,
    opponent_score: opponentScore,
    category_id: categoryId,
    content_type: 'challenge'
  });
}

/**
 * Evento: Item comprado en tienda
 */
export function logItemPurchased(itemId, itemName, cost, currency, itemType) {
  if (!analytics) return;
  
  logEvent(analytics, 'item_purchased', {
    item_id: itemId,
    item_name: itemName,
    cost: cost,
    currency: currency, // 'nacatamal', 'coins'
    item_type: itemType, // 'mejora', 'traba'
    content_type: 'shop_item'
  });
}

/**
 * Evento: Trueque completado
 */
export function logTradeCompleted(offeredIngredient, offeredAmount, requestedIngredient, requestedAmount) {
  if (!analytics) return;
  
  logEvent(analytics, 'trade_completed', {
    offered_ingredient: offeredIngredient,
    offered_amount: offeredAmount,
    requested_ingredient: requestedIngredient,
    requested_amount: requestedAmount,
    content_type: 'trade'
  });
}

/**
 * Evento: Amigo agregado
 */
export function logFriendAdded(source) {
  if (!analytics) return;
  
  logEvent(analytics, 'friend_added', {
    source: source, // 'search', 'request', 'challenge'
    content_type: 'social'
  });
}

/**
 * Evento: Reto diario completado
 */
export function logDailyChallengeCompleted(score, totalQuestions, streak) {
  if (!analytics) return;
  
  logEvent(analytics, 'daily_challenge_completed', {
    score: score,
    total_questions: totalQuestions,
    streak: streak,
    reward: 'achiote',
    content_type: 'daily_challenge'
  });
}

/**
 * Evento: Logro desbloqueado
 */
export function logAchievementUnlocked(achievementId, achievementName, category) {
  if (!analytics) return;
  
  logEvent(analytics, 'achievement_unlocked', {
    achievement_id: achievementId,
    achievement_name: achievementName,
    category: category, // 'battle', 'category', 'special', 'social'
    content_type: 'achievement'
  });
}

/**
 * Evento: Nacatamal completado
 */
export function logNacatamalCompleted(totalIngredientes) {
  if (!analytics) return;
  
  logEvent(analytics, 'nacatamal_completed', {
    total_ingredientes: totalIngredientes,
    content_type: 'milestone'
  });
}

/**
 * Evento: Nivel alcanzado
 */
export function logLevelReached(level, title) {
  if (!analytics) return;
  
  logEvent(analytics, 'level_reached', {
    level: level,
    title: title, // 'Aprendiz', 'Chef Experto', etc.
    content_type: 'progress'
  });
}

/**
 * Evento: Canje de achiote
 */
export function logAchioteExchanged(amount, targetIngredient) {
  if (!analytics) return;
  
  logEvent(analytics, 'achiote_exchanged', {
    amount: amount,
    target_ingredient: targetIngredient,
    content_type: 'exchange'
  });
}

/**
 * Evento: Solicitud de amistad enviada
 */
export function logFriendRequestSent() {
  if (!analytics) return;
  
  logEvent(analytics, 'friend_request_sent', {
    content_type: 'social'
  });
}

/**
 * Evento: Pregunta propuesta
 */
export function logQuestionProposed(categoryId, difficulty) {
  if (!analytics) return;
  
  logEvent(analytics, 'question_proposed', {
    category_id: categoryId,
    difficulty: difficulty,
    content_type: 'ugc' // user-generated content
  });
}

// ==================== CONFIGURACIÓN DE USUARIO ====================

/**
 * Establecer ID de usuario para tracking
 */
export function setAnalyticsUserId(uid) {
  if (!analytics || !uid) return;
  
  setUserId(analytics, uid);
}

/**
 * Establecer propiedades del usuario
 */
export function setUserAnalyticsProperties(userData) {
  if (!analytics || !userData) return;
  
  const properties = {
    level: Math.floor((userData.stats?.totalQuestionsAnswered || 0) / 10) + 1,
    total_wins: userData.stats?.wins || 0,
    total_losses: userData.stats?.losses || 0,
    friends_count: (userData.friends || []).length,
    nacatamales_completed: Math.min(
      userData.coins?.masa || 0,
      userData.coins?.cerdo || 0,
      userData.coins?.arroz || 0,
      userData.coins?.papa || 0,
      userData.coins?.chile || 0
    ),
    is_admin: userData.isAdmin || false
  };
  
  setUserProperties(analytics, properties);
}

// ==================== EVENTOS DE NAVEGACIÓN ====================

/**
 * Evento: Vista de pantalla
 */
export function logScreenView(screenName, screenClass) {
  if (!analytics) return;
  
  logEvent(analytics, 'screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenClass
  });
}

/**
 * Evento: Click en botón
 */
export function logButtonClick(buttonName, location) {
  if (!analytics) return;
  
  logEvent(analytics, 'button_click', {
    button_name: buttonName,
    location: location // 'header', 'footer', 'sidebar', etc.
  });
}

/**
 * Evento: Tiempo en página
 */
export function logTimeOnPage(pageName, timeInSeconds) {
  if (!analytics) return;
  
  logEvent(analytics, 'time_on_page', {
    page_name: pageName,
    time_seconds: timeInSeconds
  });
}

// ==================== EVENTOS DE ERROR ====================

/**
 * Evento: Error en cliente
 */
export function logClientError(errorType, errorMessage, pageName) {
  if (!analytics) return;
  
  logEvent(analytics, 'client_error', {
    error_type: errorType,
    error_message: errorMessage,
    page_name: pageName
  });
}

/**
 * Evento: Error de validación
 */
export function logValidationError(field, reason) {
  if (!analytics) return;
  
  logEvent(analytics, 'validation_error', {
    field: field,
    reason: reason
  });
}

// ==================== EXPORT PARA REACT ====================

/**
 * Hook personalizado para usar analytics en componentes React
 * 
 * Uso:
 * const { logEvent } = useAnalytics();
 * logEvent('custom_event', { data: 'value' });
 */
export function useAnalytics() {
  const getAnalyticsInstance = () => analytics;
  
  const logCustomEvent = (eventName, eventData = {}) => {
    if (!analytics) return;
    logEvent(analytics, eventName, eventData);
  };
  
  return {
    analytics: getAnalyticsInstance(),
    logEvent: logCustomEvent,
    isAvailable: !!analytics
  };
}

export default analytics;
