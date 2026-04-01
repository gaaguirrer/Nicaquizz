/**
 * Servicios de Firebase usando Netlify Functions serverless
 * 
 * Todas las peticiones a Firestore pasan por las funciones serverless
 * para mayor seguridad y control.
 */

// URL base para funciones serverless (en desarrollo y producción)
const API_BASE = '/.netlify/functions';

// ==================== AUTH ====================

/**
 * Registrar nuevo usuario
 */
export async function signupUser(email, password, displayName) {
  const response = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      email,
      password,
      displayName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar');
  }

  // Crear documento de usuario en Firestore
  await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
    }),
  });

  return data;
}

/**
 * Iniciar sesión
 */
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data;
}

// ==================== USUARIOS ====================

/**
 * Obtener perfil de usuario
 */
export async function getUserProfile(uid) {
  const response = await fetch(`${API_BASE}/users?uid=${uid}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener perfil');
  }

  return data.data;
}

/**
 * Actualizar estadísticas de usuario
 */
export async function updateUserStatsApi(uid, stats) {
  const response = await fetch(`${API_BASE}/users?uid=${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar estadísticas');
  }

  return data;
}

/**
 * Actualizar monedas de usuario
 */
export async function updateUserCoins(uid, coins) {
  const response = await fetch(`${API_BASE}/users?uid=${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coins }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar monedas');
  }

  return data;
}

/**
 * Actualizar mejoras de usuario
 */
export async function updateUserMejoras(uid, mejoras) {
  const response = await fetch(`${API_BASE}/users?uid=${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mejoras }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar mejoras');
  }

  return data;
}

/**
 * Actualizar trabas de usuario
 */
export async function updateUserTrabas(uid, trabas) {
  const response = await fetch(`${API_BASE}/users?uid=${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trabas }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al actualizar trabas');
  }

  return data;
}

// ==================== CATEGORÍAS ====================

/**
 * Obtener todas las categorías
 */
export async function fetchCategories() {
  const response = await fetch(`${API_BASE}/data?collection=categories`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener categorías');
  }

  return data;
}

/**
 * Crear categoría
 */
export async function createCategoryApi(name, description) {
  const response = await fetch(`${API_BASE}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: 'categories',
      name,
      description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear categoría');
  }

  return data.id;
}

// ==================== PREGUNTAS ====================

/**
 * Obtener preguntas aprobadas
 */
export async function fetchApprovedQuestions(categoryId = null) {
  let url = `${API_BASE}/data?collection=questions&status=approved`;
  if (categoryId) {
    url += `&categoryId=${categoryId}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener preguntas');
  }

  return data;
}

/**
 * Obtener preguntas pendientes (admin)
 */
export async function fetchPendingQuestions() {
  const response = await fetch(`${API_BASE}/data?collection=questions&status=pending`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener preguntas pendientes');
  }

  return data;
}

/**
 * Crear pregunta
 */
export async function createQuestionApi(text, correctAnswer, categoryId, createdBy, difficulty = 'hard', options = []) {
  const response = await fetch(`${API_BASE}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: 'questions',
      text,
      correctAnswer,
      categoryId,
      createdBy,
      difficulty,
      options,
      status: 'pending',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear pregunta');
  }

  return data.id;
}

/**
 * Aprobar pregunta
 */
export async function approveQuestionApi(questionId) {
  const response = await fetch(`${API_BASE}/data?collection=questions&id=${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al aprobar pregunta');
  }

  return data;
}

/**
 * Rechazar pregunta
 */
export async function rejectQuestionApi(questionId) {
  const response = await fetch(`${API_BASE}/data?collection=questions&id=${questionId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al rechazar pregunta');
  }

  return data;
}

// ==================== RESPUESTAS ====================

/**
 * Registrar respuesta
 */
export async function submitAnswerApi(userId, questionId, categoryId, isCorrect) {
  const response = await fetch(`${API_BASE}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: 'answers',
      userId,
      questionId,
      categoryId,
      isCorrect,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar respuesta');
  }

  return data.id;
}

// ==================== TIENDA ====================

/**
 * Obtener items de tienda
 */
export async function getShopItems() {
  const response = await fetch(`${API_BASE}/data?collection=shopItems`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener items');
  }

  // Calcular precios dinámicos
  return data.map(item => {
    const basePrice = item.basePrice || 0;
    const timesPurchased = item.timesPurchased || 0;
    const demandMultiplier = 1 + (timesPurchased * 0.1);
    const minPrice = basePrice * 0.75;
    const currentPrice = Math.max(minPrice, Math.round(basePrice * demandMultiplier));

    return {
      ...item,
      basePrice,
      currentPrice,
      timesPurchased,
    };
  });
}

/**
 * Comprar item
 */
export async function purchaseItemApi(uid, itemId, itemData) {
  // Transacción: verificar monedas, consumir nacatamal, agregar item
  const userResponse = await fetch(`${API_BASE}/users?uid=${uid}`);
  const userData = await userResponse.json();

  if (!userData.data) {
    throw new Error('Usuario no encontrado');
  }

  const coins = userData.data.coins || {};
  const hasNacatamal = [
    INGREDIENTES.MASA,
    INGREDIENTES.CERDO,
    INGREDIENTES.ARROZ,
    INGREDIENTES.PAPA,
    INGREDIENTES.CHILE
  ].every(ing => (coins[ing] || 0) >= 1);

  if (!hasNacatamal) {
    throw new Error('Necesitas un nacatamal completo para comprar');
  }

  // Consumir nacatamal
  const newCoins = {
    [INGREDIENTES.MASA]: (coins[INGREDIENTES.MASA] || 0) - 1,
    [INGREDIENTES.CERDO]: (coins[INGREDIENTES.CERDO] || 0) - 1,
    [INGREDIENTES.ARROZ]: (coins[INGREDIENTES.ARROZ] || 0) - 1,
    [INGREDIENTES.PAPA]: (coins[INGREDIENTES.PAPA] || 0) - 1,
    [INGREDIENTES.CHILE]: (coins[INGREDIENTES.CHILE] || 0) - 1,
  };

  await updateUserCoins(uid, newCoins);

  // Agregar item al inventario
  const currentInventory = userData.data.inventory || [];
  const response = await fetch(`${API_BASE}/users?uid=${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inventory: [...currentInventory, itemId],
    }),
  });

  // Actualizar estadísticas del item
  await fetch(`${API_BASE}/data?collection=shopItems&id=${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timesPurchased: (itemData.timesPurchased || 0) + 1,
    }),
  });

  return { success: true };
}

// ==================== RANKING ====================

/**
 * Obtener ranking global
 */
export async function fetchGlobalRanking(limitCount = 100) {
  // Obtener todos los usuarios y calcular ranking
  // Nota: En producción, esto debería hacerse con una Cloud Function
  const response = await fetch(`${API_BASE}/data?collection=users&limit=${limitCount}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener ranking');
  }

  // Procesar y ordenar usuarios
  const rankedUsers = data
    .filter(user => user.stats?.totalQuestionsAnswered > 0)
    .map(user => ({
      id: user.id,
      displayName: user.displayName || 'Usuario',
      email: user.email,
      totalQuestionsAnswered: user.stats?.totalQuestionsAnswered || 0,
      totalCorrect: user.stats?.totalCorrect || 0,
      accuracy: user.stats?.totalQuestionsAnswered > 0
        ? Math.round((user.stats?.totalCorrect || 0) / user.stats?.totalQuestionsAnswered * 100)
        : 0,
      wins: user.stats?.wins || 0,
      losses: user.stats?.losses || 0,
    }))
    .sort((a, b) => {
      if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
      return b.accuracy - a.accuracy;
    })
    .slice(0, limitCount);

  return rankedUsers;
}

/**
 * Obtener ranking por categoría
 */
export async function fetchCategoryRanking(categoryId, limitCount = 100) {
  const response = await fetch(`${API_BASE}/data?collection=users&limit=${limitCount}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener ranking');
  }

  const rankedUsers = data
    .filter(user => user.stats?.categoryStats?.[categoryId]?.total > 0)
    .map(user => {
      const catStats = user.stats.categoryStats[categoryId] || { correct: 0, total: 0 };
      return {
        id: user.id,
        displayName: user.displayName || 'Usuario',
        total: catStats.total,
        correct: catStats.correct,
        accuracy: catStats.total > 0
          ? Math.round((catStats.correct / catStats.total) * 100)
          : 0,
      };
    })
    .sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      return b.accuracy - a.accuracy;
    })
    .slice(0, limitCount);

  return rankedUsers;
}

// ==================== CONSTANTES ====================

// Unificadas con firestore.js - todos en mayúsculas, valores en minúsculas
export const INGREDIENTES = {
  MASA: 'masa',
  CERDO: 'cerdo',
  ARROZ: 'arroz',
  PAPA: 'papa',
  CHILE: 'chile'
};

export const INGREDIENTE_NAMES = {
  [INGREDIENTES.MASA]: 'Masa de Maíz',
  [INGREDIENTES.CERDO]: 'Carne de Cerdo',
  [INGREDIENTES.ARROZ]: 'Arroz',
  [INGREDIENTES.PAPA]: 'Papa',
  [INGREDIENTES.CHILE]: 'Chile'
};

export const CATEGORIA_INGREDIENTE = {
  historia: INGREDIENTES.MASA,
  matematicas: INGREDIENTES.CERDO,
  geografia: INGREDIENTES.ARROZ,
  ciencias: INGREDIENTES.PAPA
};

export const ITEM_TYPES = {
  SOMBRERO: 'sombrero',
  CAMISA: 'camisa',
  PANTALON: 'pantalon',
  BOTAS: 'botas',
  ACCESORIO: 'accesorio',
};

export const MEJORAS = {
  PASE: 'pase',
  RELOJ_ARENA: 'reloj_arena',
  COMODIN: 'comodin',
};

export const TRABAS = {
  RELOJ_RAPIDO: 'reloj_rapido',
  PREGUNTA_DIFICIL: 'pregunta_dificil',
  SIN_PISTAS: 'sin_pistas',
  CONTROLES_INVERTIDOS: 'controles_invertidos',
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Agregar monedas (ingredientes) al usuario
 */
export async function addCoins(uid, categoria, isOpenChallenge = false) {
  const ingrediente = CATEGORIA_INGREDIENTE[categoria];
  if (!ingrediente) return; // Ranking mundial no da monedas

  const userResponse = await fetch(`${API_BASE}/users?uid=${uid}`);
  const userData = await userResponse.json();

  if (!userData.data) return;

  const coins = userData.data.coins || {};
  const cantidad = isOpenChallenge ? 2 : 1;

  await updateUserCoins(uid, {
    ...coins,
    [ingrediente]: (coins[ingrediente] || 0) + cantidad,
  });
}

/**
 * Usar mejora
 */
export async function useMejora(uid, mejoraType) {
  const userResponse = await fetch(`${API_BASE}/users?uid=${uid}`);
  const userData = await userResponse.json();

  if (!userData.data) return;

  const mejoras = userData.data.mejoras || {};
  const currentCount = mejoras[mejoraType] || 0;

  if (currentCount <= 0) {
    throw new Error('No tienes mejoras disponibles');
  }

  await updateUserMejoras(uid, {
    ...mejoras,
    [mejoraType]: currentCount - 1,
  });
}

// ==================== MONEDAS (CURRENCIES) ====================

/**
 * Obtener todas las monedas
 */
export async function fetchCurrencies() {
  const response = await fetch(`${API_BASE}/data?collection=currencies`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener monedas');
  }

  return data;
}

/**
 * Crear moneda
 */
export async function createCurrencyApi(name, description, icon, defaultAmount = 0) {
  const response = await fetch(`${API_BASE}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: 'currencies',
      name,
      description,
      icon,
      defaultAmount,
      active: true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear moneda');
  }

  return data.id;
}

/**
 * Actualizar moneda
 */
export async function updateCurrencyApi(currencyId, data) {
  const response = await fetch(`${API_BASE}/data?collection=currencies&id=${currencyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error al actualizar moneda');
  }

  return result;
}

/**
 * Eliminar moneda
 */
export async function deleteCurrencyApi(currencyId) {
  const response = await fetch(`${API_BASE}/data?collection=currencies&id=${currencyId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al eliminar moneda');
  }

  return data;
}

/**
 * Activar/Desactivar moneda
 */
export async function toggleCurrencyActiveApi(currencyId, active) {
  const response = await fetch(`${API_BASE}/data?collection=currencies&id=${currencyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al cambiar estado de moneda');
  }

  return data;
}
