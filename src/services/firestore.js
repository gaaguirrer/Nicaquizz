import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ==================== CACHE UTILITIES ====================
// Caché en localStorage para reducir peticiones a Firestore (3 horas)
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 horas en milisegundos

export function getCachedData(key) {
  try {
    const cached = localStorage.getItem(`nicaquizz_cache_${key}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar si el caché aún es válido (3 horas)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Caché expirado, eliminar
    localStorage.removeItem(`nicaquizz_cache_${key}`);
    return null;
  } catch (error) {
    console.error('Error al leer caché:', error);
    return null;
  }
}

export function setCachedData(key, data) {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`nicaquizz_cache_${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error al guardar caché:', error);
  }
}

export function clearCache(key) {
  try {
    if (key) {
      localStorage.removeItem(`nicaquizz_cache_${key}`);
    } else {
      // Limpiar todo el caché de NicaQuizz
      Object.keys(localStorage)
        .filter(k => k.startsWith('nicaquizz_cache_'))
        .forEach(k => localStorage.removeItem(k));
    }
  } catch (error) {
    console.error('Error al limpiar caché:', error);
  }
}

// ==================== CONSTANTES ====================

// Ingredientes del nacatamal (monedas) - todos en minúsculas
export const INGREDIENTES = {
  MASA: 'masa',           // Masa de maíz
  CERDO: 'cerdo',         // Carne de cerdo
  ARROZ: 'arroz',         // Arroz
  PAPA: 'papa',           // Papa
  CHILE: 'chile',         // Chile (antes aceituna)
  ACHIOTE: 'achiote'      // Achiote - moneda especial de retos diarios
};

export const INGREDIENTE_NAMES = {
  [INGREDIENTES.MASA]: 'Masa de Maíz',
  [INGREDIENTES.CERDO]: 'Carne de Cerdo',
  [INGREDIENTES.ARROZ]: 'Arroz',
  [INGREDIENTES.PAPA]: 'Papa',
  [INGREDIENTES.CHILE]: 'Chile',
  [INGREDIENTES.ACHIOTE]: 'Achiote'
};

// Categorías con sus ingredientes asignados
export const CATEGORIA_INGREDIENTE = {
  historia: INGREDIENTES.MASA,
  matematicas: INGREDIENTES.CERDO,
  geografia: INGREDIENTES.ARROZ,
  ciencias: INGREDIENTES.PAPA,
  retos: INGREDIENTES.ACHIOTE  // Categoría de retos diarios
};

// Tipos de items de la tienda (solo mejoras y trabas)
export const ITEM_TYPES = {
  MEJORA: 'mejora',      // Mejoras para el jugador
  TRABA: 'traba'         // Trabas para el oponente
};

// Tipos de mejoras
export const MEJORAS = {
  RELOJ_ARENA: 'reloj_arena',      // Duplicar tiempo
  COMODIN: 'comodin',              // Eliminar opciones incorrectas
  PASE: 'pase'                     // Pasar pregunta
};

// Tipos de trabas (para usar contra oponentes)
export const TRABAS = {
  RELOJ_RAPIDO: 'reloj_rapido',         // Reduce tiempo del oponente a la mitad
  PREGUNTA_DIFICIL: 'pregunta_dificil', // Agrega pregunta difícil al oponente
  SIN_PISTAS: 'sin_pistas',             // Elimina pistas del oponente
  CONTROLES_INVERTIDOS: 'controles_invertidos' // Invierte controles del oponente
};

// Tipos de transacciones
export const TRADE_TYPES = {
  EXCHANGE: 'exchange',  // Intercambio de monedas
  GIFT: 'gift'           // Regalo de monedas
};

// ==================== USUARIOS ====================

/**
 * Obtiene el documento de un usuario
 */
export async function getUserProfile(uid) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

/**
 * Actualiza el estado en línea del usuario
 */
export async function updateUserOnlineStatus(uid, isOnline) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar estado en línea:', error);
    throw error;
  }
}

/**
 * Actualiza la configuración de privacidad del usuario
 */
export async function updateUserPrivacy(uid, isPublic, allowOpenChallenges) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isPublicProfile: isPublic,
      allowOpenChallenges: allowOpenChallenges
    });
  } catch (error) {
    console.error('Error al actualizar privacidad:', error);
    throw error;
  }
}

// ==================== MONEDAS E INVENTARIO ====================

/**
 * Agrega monedas (ingredientes) al usuario
 * @param {string} uid - ID del usuario
 * @param {string} categoria - Categoría completada
 * @param {boolean} isOpenChallenge - Si es reto abierto (da 2 monedas)
 */
export async function addCoins(uid, categoria, isOpenChallenge = false) {
  try {
    const userRef = doc(db, 'users', uid);
    const ingrediente = CATEGORIA_INGREDIENTE[categoria];
    const cantidad = isOpenChallenge ? 2 : 1;
    
    if (!ingrediente) {
      // Ranking mundial no da monedas
      return;
    }
    
    await updateDoc(userRef, {
      [`coins.${ingrediente}`]: increment(cantidad)
    });
  } catch (error) {
    console.error('Error al agregar monedas:', error);
    throw error;
  }
}

/**
 * Verifica si el usuario tiene un nacatamal completo
 */
export async function checkNacatamalComplete(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return false;

    const coins = docSnap.data().coins || {};
    // Solo los 5 ingredientes base del nacatamal (no incluye achiote)
    const ingredientesBase = [
      INGREDIENTES.MASA,
      INGREDIENTES.CERDO,
      INGREDIENTES.ARROZ,
      INGREDIENTES.PAPA,
      INGREDIENTES.CHILE
    ];
    const isComplete = ingredientesBase.every(
      ing => (coins[ing] || 0) >= 1
    );

    return isComplete;
  } catch (error) {
    console.error('Error al verificar nacatamal:', error);
    throw error;
  }
}

/**
 * Consume un nacatamal completo (resta 1 de cada ingrediente)
 */
export async function consumeNacatamal(uid) {
  try {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      [`coins.${INGREDIENTES.MASA}`]: increment(-1),
      [`coins.${INGREDIENTES.CERDO}`]: increment(-1),
      [`coins.${INGREDIENTES.ARROZ}`]: increment(-1),
      [`coins.${INGREDIENTES.PAPA}`]: increment(-1),
      [`coins.${INGREDIENTES.CHILE}`]: increment(-1)
    });
  } catch (error) {
    console.error('Error al consumir nacatamal:', error);
    throw error;
  }
}

/**
 * Obtiene las monedas y power-ups de un usuario
 * Caché: 3 horas
 */
export async function getUserWallet(uid) {
  const cacheKey = `wallet_${uid}`;
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const wallet = {
        coins: data.coins || {},
        mejoras: data.mejoras || {},
        trabas: data.trabas || {}
      };
      // Guardar en caché
      setCachedData(cacheKey, wallet);
      return wallet;
    }
    return { coins: {}, mejoras: {}, trabas: {} };
  } catch (error) {
    console.error('Error al obtener monedero:', error);
    throw error;
  }
}

// ==================== TIENDA ====================

/**
 * Obtiene todos los items de la tienda con precios actualizados
 * Caché: 3 horas
 */
export async function getShopItems() {
  const cacheKey = 'shopItems';
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const itemsRef = collection(db, 'shopItems');
    const q = query(itemsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      const basePrice = data.basePrice || 0;
      const timesPurchased = data.timesPurchased || 0;

      // Calcular precio basado en demanda
      // Máximo 25% de descuento, sin límite de aumento
      const demandMultiplier = 1 + (timesPurchased * 0.1); // +10% por cada compra
      const minPrice = basePrice * 0.75; // 25% mínimo
      const currentPrice = Math.max(minPrice, Math.round(basePrice * demandMultiplier));

      return {
        id: doc.id,
        ...data,
        basePrice,
        currentPrice,
        timesPurchased
      };
    });
    
    // Guardar en caché
    setCachedData(cacheKey, items);
    
    return items;
  } catch (error) {
    console.error('Error al obtener items de tienda:', error);
    throw error;
  }
}

/**
 * Compra un item de la tienda (mejora o traba)
 */
export async function purchaseItem(uid, itemId, currentPrice, itemType) {
  try {
    const userRef = doc(db, 'users', uid);
    const itemRef = doc(db, 'shopItems', itemId);

    // Verificar si tiene un nacatamal completo
    const userSnap = await getDoc(userRef);
    const coins = userSnap.data().coins || {};
    // Solo los 5 ingredientes base del nacatamal (no incluye achiote)
    const ingredientesBase = [
      INGREDIENTES.MASA,
      INGREDIENTES.CERDO,
      INGREDIENTES.ARROZ,
      INGREDIENTES.PAPA,
      INGREDIENTES.CHILE
    ];
    const hasNacatamal = ingredientesBase.every(
      ing => (coins[ing] || 0) >= 1
    );

    if (!hasNacatamal) {
      throw new Error('Necesitas un nacatamal completo para comprar');
    }

    // Consumir nacatamal y agregar mejora o traba
    await consumeNacatamal(uid);

    // Agregar según el tipo de item
    if (itemType === ITEM_TYPES.TRABA) {
      await updateDoc(userRef, {
        'trabas.reloj_rapido': increment(1)
      });
    } else {
      // Mejoras por defecto
      await updateDoc(userRef, {
        'mejoras.reloj_arena': increment(1),
        'mejoras.comodin': increment(1),
        'mejoras.pase': increment(1)
      });
    }

    // Actualizar estadísticas de compra del item
    await updateDoc(itemRef, {
      timesPurchased: increment(1),
      totalRevenue: increment(currentPrice)
    });

    return true;
  } catch (error) {
    console.error('Error al comprar item:', error);
    throw error;
  }
}

/**
 * Obtiene los items más comprados (para analytics)
 */
export async function getTopPurchasedItems(limitCount = 10) {
  try {
    const itemsRef = collection(db, 'shopItems');
    const q = query(
      itemsRef,
      orderBy('timesPurchased', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener items más comprados:', error);
    throw error;
  }
}

// ==================== MEJORAS ====================

/**
 * Obtiene las mejoras de un usuario
 */
export async function getUserMejoras(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().mejoras || {
        [MEJORAS.PASE]: 0,
        [MEJORAS.RELOJ_ARENA]: 0,
        [MEJORAS.COMODIN]: 0
      };
    }
    return { [MEJORAS.PASE]: 0, [MEJORAS.RELOJ_ARENA]: 0, [MEJORAS.COMODIN]: 0 };
  } catch (error) {
    console.error('Error al obtener mejoras:', error);
    throw error;
  }
}

/**
 * Agrega una mejora al usuario
 */
export async function addMejora(uid, mejoraType, quantity = 1) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`mejoras.${mejoraType}`]: increment(quantity)
    });
  } catch (error) {
    console.error('Error al agregar mejora:', error);
    throw error;
  }
}

/**
 * Usa una mejora
 */
export async function useMejora(uid, mejoraType) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`mejoras.${mejoraType}`]: increment(-1)
    });
  } catch (error) {
    console.error('Error al usar mejora:', error);
    throw error;
  }
}

/**
 * Obtiene las trabas de un usuario
 */
export async function getUserTrabas(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().trabas || {
        [TRABAS.RELOJ_RAPIDO]: 0,
        [TRABAS.PREGUNTA_DIFICIL]: 0,
        [TRABAS.SIN_PISTAS]: 0,
        [TRABAS.CONTROLES_INVERTIDOS]: 0
      };
    }
    return { [TRABAS.RELOJ_RAPIDO]: 0, [TRABAS.PREGUNTA_DIFICIL]: 0, [TRABAS.SIN_PISTAS]: 0, [TRABAS.CONTROLES_INVERTIDOS]: 0 };
  } catch (error) {
    console.error('Error al obtener trabas:', error);
    throw error;
  }
}

/**
 * Usa una traba
 */
export async function useTraba(uid, trabaType) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`trabas.${trabaType}`]: increment(-1)
    });
  } catch (error) {
    console.error('Error al usar traba:', error);
    throw error;
  }
}

// ==================== AMIGOS ====================

/**
 * Envía solicitud de amistad
 */
export async function sendFriendRequest(senderId, receiverId) {
  try {
    const friendRequest = {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    const requestsRef = collection(db, 'friendRequests');
    await addDoc(requestsRef, friendRequest);
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    throw error;
  }
}

/**
 * Obtiene solicitudes de amistad recibidas
 * Optimizado: Usa batch queries en lugar de N+1
 */
export async function getFriendRequests(uid) {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('receiverId', '==', uid),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    // Obtener todos los sender IDs
    const senderIds = snapshot.docs.map(doc => doc.data().senderId);
    
    // Obtener todos los perfiles en batches de 10
    const sendersMap = {};
    const batchSize = 10;
    
    for (let i = 0; i < senderIds.length; i += batchSize) {
      const batchIds = senderIds.slice(i, i + batchSize);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', batchIds));
      const sendersSnapshot = await getDocs(q);
      
      sendersSnapshot.docs.forEach(doc => {
        sendersMap[doc.id] = { id: doc.id, ...doc.data() };
      });
    }

    // Construir resultado con senders ya cargados
    const requests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        sender: sendersMap[data.senderId] || null
      };
    });

    return requests;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
}

/**
 * Acepta solicitud de amistad
 */
export async function acceptFriendRequest(requestId, userId, friendId) {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);
    
    await updateDoc(requestRef, { status: 'accepted' });
    await updateDoc(userRef, { friends: arrayUnion(friendId) });
    await updateDoc(friendRef, { friends: arrayUnion(userId) });
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    throw error;
  }
}

/**
 * Rechaza solicitud de amistad
 */
export async function rejectFriendRequest(requestId) {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, { status: 'rejected' });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de amigos de un usuario
 * Optimizado: Usa un solo query con where('id', 'in', ...) en lugar de N+1
 */
export async function getFriends(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return [];

    const friendIds = docSnap.data().friends || [];
    if (friendIds.length === 0) return [];

    // Firestore permite máximo 10 elementos en 'in' query
    // Dividimos en batches de 10
    const friends = [];
    const batchSize = 10;
    
    for (let i = 0; i < friendIds.length; i += batchSize) {
      const batchIds = friendIds.slice(i, i + batchSize);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', batchIds));
      const snapshot = await getDocs(q);
      
      const batchFriends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      friends.push(...batchFriends);
    }

    return friends;
  } catch (error) {
    console.error('Error al obtener amigos:', error);
    throw error;
  }
}

/**
 * Obtiene usuarios con perfil público que permiten retos abiertos
 */
export async function getAvailableChallengers() {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('isPublicProfile', '==', true),
      where('allowOpenChallenges', '==', true)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.isOnline);
  } catch (error) {
    console.error('Error al obtener challengers:', error);
    throw error;
  }
}

// ==================== RETOS ====================

/**
 * Crea un nuevo reto
 */
export async function createChallenge(challengerId, challengedId, categoryId = null, isOpenChallenge = false) {
  try {
    const challenge = {
      challengerId,
      challengedId,
      categoryId,
      isOpenChallenge,
      status: 'pending', // pending, accepted, rejected, completed
      winnerId: null,
      challengerScore: 0,
      challengedScore: 0,
      createdAt: serverTimestamp(),
      startedAt: null,
      completedAt: null
    };
    
    const challengesRef = collection(db, 'challenges');
    const docRef = await addDoc(challengesRef, challenge);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear reto:', error);
    throw error;
  }
}

/**
 * Obtiene retos de un usuario
 * Optimizado: Usa batch queries en lugar de N+1
 */
export async function getUserChallenges(uid, status = 'pending') {
  try {
    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      where('challengedId', '==', uid),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    // Obtener todos los challenger IDs
    const challengerIds = snapshot.docs.map(doc => doc.data().challengerId);
    
    // Obtener todos los perfiles en batches de 10
    const challengersMap = {};
    const batchSize = 10;
    
    for (let i = 0; i < challengerIds.length; i += batchSize) {
      const batchIds = challengerIds.slice(i, i + batchSize);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', batchIds));
      const challengersSnapshot = await getDocs(q);
      
      challengersSnapshot.docs.forEach(doc => {
        challengersMap[doc.id] = { id: doc.id, ...doc.data() };
      });
    }

    // Construir resultado con challengers ya cargados
    const challenges = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        challenger: challengersMap[data.challengerId] || null
      };
    });

    return challenges;
  } catch (error) {
    console.error('Error al obtener retos:', error);
    throw error;
  }
}

/**
 * Acepta un reto
 */
export async function acceptChallenge(challengeId) {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      status: 'accepted',
      startedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al aceptar reto:', error);
    throw error;
  }
}

/**
 * Rechaza un reto
 */
export async function rejectChallenge(challengeId) {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, { status: 'rejected' });
  } catch (error) {
    console.error('Error al rechazar reto:', error);
    throw error;
  }
}

/**
 * Completa un reto con el resultado
 */
export async function completeChallenge(challengeId, winnerId, challengerScore, challengedScore) {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      status: 'completed',
      winnerId,
      challengerScore,
      challengedScore,
      completedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al completar reto:', error);
    throw error;
  }
}

/**
 * Obtiene los detalles de un reto específico
 */
export async function getChallenge(challengeId) {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    const docSnap = await getDoc(challengeRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener reto:', error);
    throw error;
  }
}

/**
 * Rechaza un reto (wrapper para rejectChallenge)
 */
export async function rejectChallengeWrapper(challengeId) {
  return rejectChallenge(challengeId);
}

/**
 * Busca usuarios por email (búsqueda parcial)
 */
export async function searchUsersByEmail(emailQuery) {
  try {
    // Nota: Firestore no tiene búsqueda de texto completo nativa
    // Esta es una implementación básica que busca coincidencias exactas
    // Para producción, se recomienda usar Algolia o similar
    
    const usersRef = collection(db, 'users');
    
    // Obtenemos todos los usuarios y filtramos manualmente
    // (en producción usar índices compuestos o servicio externo)
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.email?.toLowerCase().includes(emailQuery.toLowerCase()))
      .slice(0, 10); // Limitar a 10 resultados
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return [];
  }
}

/**
 * Envía solicitud de amistad a un usuario por email
 */
export async function sendFriendRequestByEmail(currentUserId, targetEmail) {
  try {
    // Buscar usuario por email
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('email', '==', targetEmail.toLowerCase()),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Usuario no encontrado');
    }
    
    const targetUser = snapshot.docs[0];
    const targetData = targetUser.data();
    
    // Verificar que no sea el mismo usuario
    if (targetUser.id === currentUserId) {
      throw new Error('No puedes agregarte a ti mismo');
    }
    
    // Verificar si ya son amigos
    if (targetData.friends?.includes(currentUserId)) {
      throw new Error('Ya son amigos');
    }
    
    // Verificar si ya existe una solicitud pendiente
    const requestsRef = collection(db, 'friendRequests');
    const existingRequest = query(
      requestsRef,
      where('senderId', '==', currentUserId),
      where('receiverId', '==', targetUser.id),
      where('status', '==', 'pending')
    );
    
    const existingSnapshot = await getDocs(existingRequest);
    if (!existingSnapshot.empty) {
      throw new Error('Ya enviaste una solicitud a este usuario');
    }
    
    // Crear solicitud
    await sendFriendRequest(currentUserId, targetUser.id);
    
    return { success: true, userId: targetUser.id };
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    throw error;
  }
}

// ==================== CATEGORÍAS ====================

/**
 * Obtiene todas las categorías
 * Caché: 72 horas (datos casi estáticos)
 */
export async function fetchCategories() {
  const cacheKey = 'categories';
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Guardar en caché por 72 horas
    setCachedData(cacheKey, categories);
    
    return categories;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
}

/**
 * Obtiene una categoría por ID
 * Caché: 72 horas (datos casi estáticos)
 */
export async function fetchCategoryById(categoryId) {
  const cacheKey = `category_${categoryId}`;
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const docRef = doc(db, 'categories', categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const category = { id: docSnap.id, ...docSnap.data() };
      // Guardar en caché
      setCachedData(cacheKey, category);
      return category;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    throw error;
  }
}

export async function createCategory(name, description) {
  try {
    const categoriesRef = collection(db, 'categories');
    const newCategory = {
      name,
      description,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(categoriesRef, newCategory);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
}

// ==================== PREGUNTAS ====================

/**
 * Obtiene preguntas aprobadas por categoría y dificultad
 * Caché: 3 horas por (categoryId, difficulty)
 */
export async function fetchApprovedQuestions(categoryId = null, difficulty = 'hard') {
  const cacheKey = `questions_${categoryId || 'all'}_${difficulty}`;
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const questionsRef = collection(db, 'questions');
    let q = query(
      questionsRef,
      where('status', '==', 'approved'),
      where('difficulty', '==', difficulty),
      orderBy('createdAt', 'desc')
    );

    if (categoryId) {
      q = query(
        questionsRef,
        where('status', '==', 'approved'),
        where('categoryId', '==', categoryId),
        where('difficulty', '==', difficulty),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);

    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Guardar en caché
    setCachedData(cacheKey, questions);
    
    return questions;
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    throw error;
  }
}

// ==================== RESPUESTAS ====================

export async function submitAnswer(userId, questionId, categoryId, isCorrect) {
  try {
    const answersRef = collection(db, 'answers');
    const newAnswer = {
      userId,
      questionId,
      isCorrect,
      categoryId,
      answeredAt: serverTimestamp()
    };
    
    const docRef = await addDoc(answersRef, newAnswer);
    return docRef.id;
  } catch (error) {
    console.error('Error al registrar respuesta:', error);
    throw error;
  }
}

// ==================== RANKING ====================

/**
 * Obtiene el ranking mundial (sin monedas, solo puntuación)
 * Caché: 1 hora (datos que cambian frecuentemente)
 */
export async function fetchGlobalRanking(limitCount = 100) {
  const cacheKey = `ranking_global_${limitCount}`;
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const rankedUsers = users
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
        losses: user.stats?.losses || 0
      }))
      .sort((a, b) => {
        // Ordenar por aciertos totales, luego por precisión
        if (b.totalCorrect !== a.totalCorrect) {
          return b.totalCorrect - a.totalCorrect;
        }
        return b.accuracy - a.accuracy;
      })
      .slice(0, limitCount);
    
    // Guardar en caché por 1 hora
    setCachedData(cacheKey, rankedUsers);
    
    return rankedUsers;
  } catch (error) {
    console.error('Error al obtener ranking:', error);
    throw error;
  }
}

/**
 * Obtiene el ranking por categoría
 * Caché: 1 hora (datos que cambian frecuentemente)
 */
export async function fetchCategoryRanking(categoryId, limitCount = 100) {
  const cacheKey = `ranking_${categoryId}_${limitCount}`;
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const rankedUsers = users
      .filter(user => user.stats?.categoryStats?.[categoryId]?.total > 0)
      .map(user => {
        const catStats = user.stats.categoryStats[categoryId] || { correct: 0, total: 0 };
        return {
          id: user.id,
          displayName: user.displayName || 'Usuario',
          email: user.email,
          total: catStats.total || 0,
          correct: catStats.correct || 0,
          accuracy: catStats.total > 0
            ? Math.round((catStats.correct || 0) / catStats.total * 100)
            : 0,
          wins: user.stats?.wins || 0,
          losses: user.stats?.losses || 0
        };
      })
      .sort((a, b) => {
        if (b.correct !== a.correct) {
          return b.correct - a.correct;
        }
        return b.accuracy - a.accuracy;
      })
      .slice(0, limitCount);
    
    // Guardar en caché por 1 hora
    setCachedData(cacheKey, rankedUsers);
    
    return rankedUsers;
  } catch (error) {
    console.error('Error al obtener ranking por categoría:', error);
    throw error;
  }
}

// ==================== FUNCIONES DE ADMINISTRADOR ====================

/**
 * Obtiene todas las preguntas pendientes de aprobación
 */
export async function fetchPendingQuestions() {
  try {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener preguntas pendientes:', error);
    throw error;
  }
}

/**
 * Aprueba una pregunta pendiente
 */
export async function approveQuestion(questionId) {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      status: 'approved',
      approvedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al aprobar pregunta:', error);
    throw error;
  }
}

/**
 * Rechaza una pregunta pendiente (la elimina)
 */
export async function rejectQuestion(questionId) {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Error al rechazar pregunta:', error);
    throw error;
  }
}

/**
 * Crea una nueva categoría (solo admin)
 */
export async function createCategoryAdmin(name, description, ingrediente, icon) {
  try {
    const categoriesRef = collection(db, 'categories');
    const newCategory = {
      name,
      description,
      ingrediente,
      icon,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(categoriesRef, newCategory);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
}

/**
 * Elimina una categoría (solo admin)
 */
export async function deleteCategory(categoryId) {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error;
  }
}

/**
 * Propone una nueva pregunta (usuarios normales)
 */
export async function proposeQuestion(text, correctAnswer, categoryId, createdBy, difficulty = 'hard', options = []) {
  try {
    const questionsRef = collection(db, 'questions');
    const newQuestion = {
      text,
      correctAnswer,
      categoryId,
      status: 'pending',
      createdBy,
      difficulty,
      options,
      proposedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(questionsRef, newQuestion);
    return docRef.id;
  } catch (error) {
    console.error('Error al proponer pregunta:', error);
    throw error;
  }
}

/**
 * Agrega monedas infinitas a un usuario administrador
 */
export async function addInfiniteCoins(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      coins: {
        [INGREDIENTES.MASA]: 9999,
        [INGREDIENTES.CERDO]: 9999,
        [INGREDIENTES.ARROZ]: 9999,
        [INGREDIENTES.PAPA]: 9999,
        [INGREDIENTES.CHILE]: 9999
      }
    });
  } catch (error) {
    console.error('Error al agregar monedas:', error);
    throw error;
  }
}

/**
 * Verifica si un usuario es administrador
 */
export async function checkIfUserIsAdmin(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data().isAdmin || false;
    }
    return false;
  } catch (error) {
    console.error('Error al verificar admin:', error);
    return false;
  }
}

// ==================== SISTEMA DE NACATAMAL AUTOMATICO ====================

/**
 * Verifica y convierte monedas a nacatamales automaticamente
 * Cuando un usuario tiene al menos 1 de cada ingrediente, se convierte en 1 nacatamal
 */
export async function checkAndConvertToNacatamal(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) return 0;

    const coins = docSnap.data().coins || {};
    
    // Verificar cuantos nacatamales puede formar
    const minCoins = Math.min(
      coins[INGREDIENTES.MASA] || 0,
      coins[INGREDIENTES.CERDO] || 0,
      coins[INGREDIENTES.ARROZ] || 0,
      coins[INGREDIENTES.PAPA] || 0,
      coins[INGREDIENTES.CHILE] || 0
    );

    if (minCoins >= 1) {
      // Convertir a nacatamales
      await updateDoc(userRef, {
        [`coins.${INGREDIENTES.MASA}`]: increment(-minCoins),
        [`coins.${INGREDIENTES.CERDO}`]: increment(-minCoins),
        [`coins.${INGREDIENTES.ARROZ}`]: increment(-minCoins),
        [`coins.${INGREDIENTES.PAPA}`]: increment(-minCoins),
        [`coins.${INGREDIENTES.CHILE}`]: increment(-minCoins),
        nacatamales: increment(minCoins),
        nacatamalesEarned: increment(minCoins)
      });

      return minCoins;
    }

    return 0;
  } catch (error) {
    console.error('Error al convertir a nacatamal:', error);
    return 0;
  }
}

// ==================== SISTEMA DE INTERCAMBIO ====================

/**
 * Crea una solicitud de intercambio de monedas
 * Un usuario puede intercambiar maximo 3 monedas por dia
 */
export async function createTradeRequest(senderId, receiverId, offeredIngredient, offeredAmount, requestedIngredient, requestedAmount) {
  try {
    // Verificar limite diario de intercambios
    const today = new Date().toISOString().split('T')[0];
    const tradesRef = collection(db, 'trades');
    const q = query(
      tradesRef,
      where('senderId', '==', senderId),
      where('date', '==', today),
      where('type', '==', TRADE_TYPES.EXCHANGE)
    );
    const snapshot = await getDocs(q);

    if (snapshot.size >= 3) {
      throw new Error('Has alcanzado el limite de 3 intercambios diarios');
    }

    // Verificar que el usuario tiene las monedas
    const userRef = doc(db, 'users', senderId);
    const docSnap = await getDoc(userRef);
    const coins = docSnap.data().coins || {};

    if ((coins[offeredIngredient] || 0) < offeredAmount) {
      throw new Error('No tienes suficientes monedas para intercambiar');
    }

    // Crear solicitud de intercambio
    const tradeData = {
      senderId,
      receiverId,
      offeredIngredient,
      offeredAmount,
      requestedIngredient,
      requestedAmount,
      type: TRADE_TYPES.EXCHANGE,
      status: 'pending', // pending, accepted, rejected, completed
      date: today,
      createdAt: serverTimestamp(),
      completedAt: null
    };

    const docRef = await addDoc(tradesRef, tradeData);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear intercambio:', error);
    throw error;
  }
}

/**
 * Obtiene las solicitudes de intercambio recibidas
 */
export async function getTradeRequests(uid) {
  try {
    const tradesRef = collection(db, 'trades');
    const q = query(
      tradesRef,
      where('receiverId', '==', uid),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    const trades = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data();
        const sender = await getUserProfile(data.senderId);
        return {
          id: doc.id,
          ...data,
          sender
        };
      })
    );

    return trades;
  } catch (error) {
    console.error('Error al obtener intercambios:', error);
    throw error;
  }
}

/**
 * Acepta un intercambio y transfiere las monedas
 */
export async function acceptTrade(tradeId, senderId, receiverId, offeredIngredient, offeredAmount, requestedIngredient, requestedAmount) {
  try {
    const tradeRef = doc(db, 'trades', tradeId);
    const senderRef = doc(db, 'users', senderId);
    const receiverRef = doc(db, 'users', receiverId);

    // Verificar que el receiver tiene las monedas solicitadas
    const receiverSnap = await getDoc(receiverRef);
    const receiverCoins = receiverSnap.data().coins || {};

    if ((receiverCoins[requestedIngredient] || 0) < requestedAmount) {
      throw new Error('No tienes suficientes monedas para completar el intercambio');
    }

    // Transferir monedas
    await updateDoc(senderRef, {
      [`coins.${offeredIngredient}`]: increment(-offeredAmount),
      [`coins.${requestedIngredient}`]: increment(requestedAmount)
    });

    await updateDoc(receiverRef, {
      [`coins.${requestedIngredient}`]: increment(-requestedAmount),
      [`coins.${offeredIngredient}`]: increment(offeredAmount)
    });

    // Actualizar estado del intercambio
    await updateDoc(tradeRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });

    // Verificar conversion a nacatamal para ambos usuarios
    await checkAndConvertToNacatamal(senderId);
    await checkAndConvertToNacatamal(receiverId);

  } catch (error) {
    console.error('Error al aceptar intercambio:', error);
    throw error;
  }
}

/**
 * Rechaza un intercambio
 */
export async function rejectTrade(tradeId) {
  try {
    const tradeRef = doc(db, 'trades', tradeId);
    await updateDoc(tradeRef, { status: 'rejected' });
  } catch (error) {
    console.error('Error al rechazar intercambio:', error);
    throw error;
  }
}

// ==================== SISTEMA DE REGALO ====================

/**
 * Crea un regalo de monedas
 * Un usuario puede regalar maximo 1 moneda por dia
 */
export async function createGift(senderId, receiverId, ingredient, amount) {
  try {
    // Verificar limite diario de regalos
    const today = new Date().toISOString().split('T')[0];
    const giftsRef = collection(db, 'gifts');
    const q = query(
      giftsRef,
      where('senderId', '==', senderId),
      where('date', '==', today)
    );
    const snapshot = await getDocs(q);

    if (snapshot.size >= 1) {
      throw new Error('Solo puedes regalar 1 moneda por dia');
    }

    // Verificar que el usuario tiene las monedas
    const userRef = doc(db, 'users', senderId);
    const docSnap = await getDoc(userRef);
    const coins = docSnap.data().coins || {};

    if ((coins[ingredient] || 0) < amount) {
      throw new Error('No tienes suficientes monedas para regalar');
    }

    // Transferir monedas inmediatamente
    const receiverRef = doc(db, 'users', receiverId);
    await updateDoc(userRef, {
      [`coins.${ingredient}`]: increment(-amount)
    });

    await updateDoc(receiverRef, {
      [`coins.${ingredient}`]: increment(amount)
    });

    // Registrar el regalo
    const giftData = {
      senderId,
      receiverId,
      ingredient,
      amount,
      date: today,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(giftsRef, giftData);

    // Verificar conversion a nacatamal para el receiver
    await checkAndConvertToNacatamal(receiverId);

    return docRef.id;
  } catch (error) {
    console.error('Error al crear regalo:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de regalos de un usuario
 */
export async function getGiftHistory(uid) {
  try {
    const giftsRef = collection(db, 'gifts');
    const q = query(
      giftsRef,
      where('senderId', '==', uid)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener historial de regalos:', error);
    throw error;
  }
}

/**
 * Obtiene los intercambios pendientes de un usuario
 */
export async function getUserTrades(uid) {
  try {
    const tradesRef = collection(db, 'trades');
    const q = query(
      tradesRef,
      where('senderId', '==', uid)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener intercambios:', error);
    throw error;
  }
}

/**
 * Obtiene el limite de intercambios usados hoy
 */
export async function getDailyTradeLimit(uid) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tradesRef = collection(db, 'trades');
    const q = query(
      tradesRef,
      where('senderId', '==', uid),
      where('date', '==', today)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error al obtener limite diario:', error);
    return 0;
  }
}

/**
 * Verifica si el usuario puede regalar hoy
 */
export async function canGiftToday(uid) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const giftsRef = collection(db, 'gifts');
    const q = query(
      giftsRef,
      where('senderId', '==', uid),
      where('date', '==', today)
    );
    const snapshot = await getDocs(q);
    return snapshot.size < 1;
  } catch (error) {
    console.error('Error al verificar limite de regalo:', error);
    return false;
  }
}

// ==================== AMIGOS Y MONEDAS ====================

/**
 * Envía monedas a un amigo (regalo)
 */
export async function sendCoinsToFriend(senderId, receiverId, coins) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const senderRef = doc(db, 'users', senderId);
    const receiverRef = doc(db, 'users', receiverId);
    
    // Verificar si puede regalar hoy
    const canGift = await canGiftToday(senderId);
    if (!canGift) {
      throw new Error('Ya enviaste un regalo hoy. Máximo 1 por día.');
    }
    
    // Verificar si tiene suficientes monedas
    const senderSnap = await getDoc(senderRef);
    const senderCoins = senderSnap.data().coins || {};
    
    for (const [coinType, amount] of Object.entries(coins)) {
      if ((senderCoins[coinType] || 0) < amount) {
        throw new Error(`No tienes suficientes ${coinType}`);
      }
    }
    
    // Restar monedas del remitente
    const updateData = {};
    for (const [coinType, amount] of Object.entries(coins)) {
      updateData[`coins.${coinType}`] = increment(-amount);
    }
    await updateDoc(senderRef, updateData);
    
    // Agregar monedas al destinatario
    const receiverUpdateData = {};
    for (const [coinType, amount] of Object.entries(coins)) {
      receiverUpdateData[`coins.${coinType}`] = increment(amount);
    }
    await updateDoc(receiverRef, receiverUpdateData);
    
    // Registrar el regalo
    const giftsRef = collection(db, 'gifts');
    await addDoc(giftsRef, {
      senderId,
      receiverId,
      coins,
      date: today,
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al enviar monedas:', error);
    throw error;
  }
}

/**
 * Intercambia monedas con otro usuario
 */
export async function exchangeCoins(senderId, receiverId, offeredCoins, requestedCoins) {
  try {
    const senderRef = doc(db, 'users', senderId);
    const receiverRef = doc(db, 'users', receiverId);
    
    // Verificar si ambos tienen suficientes monedas
    const senderSnap = await getDoc(senderRef);
    const receiverSnap = await getDoc(receiverRef);
    const senderCoins = senderSnap.data().coins || {};
    const receiverCoins = receiverSnap.data().coins || {};
    
    // Verificar monedas ofrecidas
    for (const [coinType, amount] of Object.entries(offeredCoins)) {
      if ((senderCoins[coinType] || 0) < amount) {
        throw new Error(`No tienes suficientes ${coinType} para intercambiar`);
      }
    }
    
    // Verificar monedas solicitadas
    for (const [coinType, amount] of Object.entries(requestedCoins)) {
      if ((receiverCoins[coinType] || 0) < amount) {
        throw new Error(`El otro usuario no tiene suficientes ${coinType}`);
      }
    }
    
    // Restar monedas del remitente
    const senderUpdateData = {};
    for (const [coinType, amount] of Object.entries(offeredCoins)) {
      senderUpdateData[`coins.${coinType}`] = increment(-amount);
    }
    for (const [coinType, amount] of Object.entries(requestedCoins)) {
      senderUpdateData[`coins.${coinType}`] = increment(amount);
    }
    await updateDoc(senderRef, senderUpdateData);
    
    // Restar monedas del destinatario y agregar las recibidas
    const receiverUpdateData = {};
    for (const [coinType, amount] of Object.entries(requestedCoins)) {
      receiverUpdateData[`coins.${coinType}`] = increment(-amount);
    }
    for (const [coinType, amount] of Object.entries(offeredCoins)) {
      receiverUpdateData[`coins.${coinType}`] = increment(amount);
    }
    await updateDoc(receiverRef, receiverUpdateData);
    
    return { success: true };
  } catch (error) {
    console.error('Error al intercambiar monedas:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de regalos enviados
 */
export async function getSentGifts(uid) {
  try {
    const giftsRef = collection(db, 'gifts');
    const q = query(
      giftsRef,
      where('senderId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    
    const gifts = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data();
        const receiver = await getUserProfile(data.receiverId);
        return {
          id: doc.id,
          ...data,
          receiver
        };
      })
    );
    
    return gifts;
  } catch (error) {
    console.error('Error al obtener regalos enviados:', error);
    return [];
  }
}

// ==================== GESTIÓN DE MONEDAS (ADMIN) ====================

/**
 * Obtiene todas las monedas registradas
 */
export async function fetchCurrencies() {
  try {
    const currenciesRef = collection(db, 'currencies');
    const q = query(currenciesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener monedas:', error);
    throw error;
  }
}

/**
 * Crea una nueva moneda (solo admin)
 */
export async function createCurrency(name, description, icon, defaultAmount = 0) {
  try {
    const currenciesRef = collection(db, 'currencies');
    const newCurrency = {
      name,
      description,
      icon,
      defaultAmount,
      active: true,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(currenciesRef, newCurrency);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear moneda:', error);
    throw error;
  }
}

/**
 * Actualiza una moneda existente (solo admin)
 */
export async function updateCurrency(currencyId, data) {
  try {
    const currencyRef = doc(db, 'currencies', currencyId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };

    await updateDoc(currencyRef, updateData);
    return true;
  } catch (error) {
    console.error('Error al actualizar moneda:', error);
    throw error;
  }
}

/**
 * Elimina una moneda (solo admin)
 */
export async function deleteCurrency(currencyId) {
  try {
    const currencyRef = doc(db, 'currencies', currencyId);
    await deleteDoc(currencyRef);
  } catch (error) {
    console.error('Error al eliminar moneda:', error);
    throw error;
  }
}

/**
 * Activa o desactiva una moneda
 */
export async function toggleCurrencyActive(currencyId, active) {
  try {
    const currencyRef = doc(db, 'currencies', currencyId);
    await updateDoc(currencyRef, {
      active,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al cambiar estado de moneda:', error);
    throw error;
  }
}

/**
 * Recarga mejoras gratuitas (disponible una vez cada 24 horas)
 */
export async function rechargeMejoras(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userSnap.data();
    const lastRecharge = userData.lastMejoraRecharge;
    const now = new Date();

    // Verificar si ya pasó 24 horas desde la última recarga
    if (lastRecharge) {
      const lastRechargeDate = new Date(lastRecharge);
      const hoursSinceRecharge = (now - lastRechargeDate) / (1000 * 60 * 60);

      if (hoursSinceRecharge < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceRecharge);
        throw new Error(`Debes esperar ${hoursLeft} horas más para recargar`);
      }
    }

    // Recargar mejoras
    await updateDoc(userRef, {
      'mejoras.pase': increment(1),
      'mejoras.reloj_arena': increment(1),
      'mejoras.comodin': increment(1),
      lastMejoraRecharge: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error al recargar mejoras:', error);
    throw error;
  }
}

/**
 * Verifica si el usuario puede recargar mejoras
 */
export async function canRechargeMejoras(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return { canRecharge: false, hoursLeft: 0 };

    const userData = userSnap.data();
    const lastRecharge = userData.lastMejoraRecharge;

    if (!lastRecharge) return { canRecharge: true, hoursLeft: 0 };

    const lastRechargeDate = new Date(lastRecharge);
    const now = new Date();
    const hoursSinceRecharge = (now - lastRechargeDate) / (1000 * 60 * 60);

    if (hoursSinceRecharge >= 24) {
      return { canRecharge: true, hoursLeft: 0 };
    }

    return { canRecharge: false, hoursLeft: Math.ceil(24 - hoursSinceRecharge) };
  } catch (error) {
    console.error('Error al verificar recarga:', error);
    return { canRecharge: false, hoursLeft: 0 };
  }
}

/**
 * Compra power-ups con monedas especiales
 */
export async function purchasePowerUp(uid, powerUpType, cost) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userSnap.data();

    // Verificar si tiene suficientes monedas especiales (Token Dorado)
    const tokensDorados = userData.coins?.token_dorado || 0;

    if (tokensDorados < cost) {
      throw new Error('No tienes suficientes Tokens Dorados');
    }

    // Descontar monedas y agregar mejora
    await updateDoc(userRef, {
      [`coins.token_dorado`]: increment(-cost),
      [`mejoras.${mejoraType}`]: increment(1)
    });

    return { success: true };
  } catch (error) {
    console.error('Error al comprar mejora:', error);
    throw error;
  }
}

// ==================== ESTADÍSTICAS DIARIAS ====================

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria local)
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene las estadísticas de nacatamales completados hoy
 * Usa caché de 3 horas para reducir peticiones a Firestore
 */
export async function getTodayNacatamalesCount() {
  const cacheKey = 'nacatamales_count';
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyStats', today);
    const docSnap = await getDoc(docRef);

    const count = docSnap.exists() ? docSnap.data().nacatamalesCompleted || 0 : 0;
    
    // Guardar en caché
    setCachedData(cacheKey, count);
    
    return count;
  } catch (error) {
    console.error('Error al obtener estadísticas diarias:', error);
    return 0;
  }
}

/**
 * Incrementa el contador de nacatamales completados hoy
 */
export async function incrementDailyNacatamales() {
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyStats', today);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Crear documento si no existe
      await addDoc(collection(db, 'dailyStats'), {
        date: today,
        nacatamalesCompleted: 1,
        activeUsers: [],
        createdAt: serverTimestamp()
      });
    } else {
      await updateDoc(docRef, {
        nacatamalesCompleted: increment(1)
      });
    }
  } catch (error) {
    console.error('Error al incrementar nacatamales:', error);
    throw error;
  }
}

/**
 * Registra usuario activo hoy
 */
export async function registerActiveUserToday(uid) {
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyStats', today);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await addDoc(collection(db, 'dailyStats'), {
        date: today,
        nacatamalesCompleted: 0,
        activeUsers: [uid],
        createdAt: serverTimestamp()
      });
    } else {
      const activeUsers = docSnap.data().activeUsers || [];
      if (!activeUsers.includes(uid)) {
        await updateDoc(docRef, {
          activeUsers: arrayUnion(uid)
        });
      }
    }
  } catch (error) {
    console.error('Error al registrar usuario activo:', error);
  }
}

/**
 * Obtiene últimos jugadores que completaron nacatamales hoy (para mostrar avatares)
 * Usa caché de 3 horas para reducir peticiones a Firestore
 */
export async function getTodayActiveUsers(limitCount = 4) {
  const cacheKey = 'active_users';
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyStats', today);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return [];

    const activeUserIds = docSnap.data().activeUsers || [];
    if (activeUserIds.length === 0) return [];

    // Obtener perfiles de usuarios activos (tomar los últimos)
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const activeUsers = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => activeUserIds.includes(user.id))
      .slice(-limitCount); // Obtener los últimos N usuarios

    // Guardar en caché
    setCachedData(cacheKey, activeUsers);
    
    return activeUsers;
  } catch (error) {
    console.error('Error al obtener usuarios activos:', error);
    return [];
  }
}

// ==================== RETOS DIARIOS ====================

/**
 * Obtiene el reto diario actual
 * Caché: 1 hora (el reto cambia diariamente)
 */
export async function getTodayChallenge() {
  const cacheKey = 'daily_challenge';
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyChallenges', today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const challenge = { id: docSnap.id, ...docSnap.data() };
      // Guardar en caché por 1 hora
      setCachedData(cacheKey, challenge);
      return challenge;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener reto diario:', error);
    return null;
  }
}

/**
 * Verifica si un usuario ya completó el reto diario
 * Caché: 5 minutos (puede cambiar durante el día)
 */
export async function hasUserCompletedDailyChallenge(uid) {
  const cacheKey = `daily_challenge_completed_${uid}`;
  
  // Intentar obtener de caché primero
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyChallenges', today);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      setCachedData(cacheKey, false);
      return false;
    }

    const completedBy = docSnap.data().completedBy || [];
    const completed = completedBy.includes(uid);
    
    // Guardar en caché por 5 minutos
    setCachedData(cacheKey, completed);
    
    return completed;
  } catch (error) {
    console.error('Error al verificar reto completado:', error);
    return false;
  }
}

/**
 * Marca el reto diario como completado por un usuario
 */
export async function completeDailyChallenge(uid) {
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyChallenges', today);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('No hay reto diario disponible');
    }

    const completedBy = docSnap.data().completedBy || [];
    if (completedBy.includes(uid)) {
      throw new Error('Ya completaste el reto diario hoy');
    }

    await updateDoc(docRef, {
      completedBy: arrayUnion(uid)
    });

    // Recompensar con achiote
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`coins.${INGREDIENTES.ACHIOTE}`]: increment(1),
      'stats.dailyChallengesCompleted': increment(1)
    });
  } catch (error) {
    console.error('Error al completar reto diario:', error);
    throw error;
  }
}

/**
 * Obtiene el número de usuarios que completaron el reto diario hoy
 */
export async function getDailyChallengeCompletedCount() {
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'dailyChallenges', today);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return 0;

    const completedBy = docSnap.data().completedBy || [];
    return completedBy.length;
  } catch (error) {
    console.error('Error al obtener contador de retos:', error);
    return 0;
  }
}

// ==================== SISTEMA DE CANJE ====================

/**
 * Canjea achiote por otra moneda (excepto nacatamal)
 * 1 achiote = 1 moneda de tu elección
 */
export async function exchangeAchiote(uid, targetIngredient, amount = 1) {
  try {
    // Validar que el ingrediente objetivo no sea nacatamal completo
    const validIngredients = Object.values(INGREDIENTES).filter(
      ing => ing !== INGREDIENTES.ACHIOTE
    );

    if (!validIngredients.includes(targetIngredient)) {
      throw new Error('Ingrediente no válido para canje');
    }

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userSnap.data();
    const achioteCount = userData.coins?.[INGREDIENTES.ACHIOTE] || 0;

    if (achioteCount < amount) {
      throw new Error('No tienes suficientes achiotes para canjear');
    }

    // Realizar el canje
    await updateDoc(userRef, {
      [`coins.${INGREDIENTES.ACHIOTE}`]: increment(-amount),
      [`coins.${targetIngredient}`]: increment(amount),
      'stats.totalExchanges': increment(1)
    });

    // Registrar transacción
    await addDoc(collection(db, 'exchanges'), {
      userId: uid,
      type: TRADE_TYPES.EXCHANGE,
      from: INGREDIENTES.ACHIOTE,
      to: targetIngredient,
      amount,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error al canjear achiote:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de canjes de un usuario
 */
export async function getUserExchangeHistory(uid, limitCount = 10) {
  try {
    const exchangesRef = collection(db, 'exchanges');
    const q = query(
      exchangesRef,
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener historial de canjes:', error);
    return [];
  }
}

// ==================== HISTORIAL DE BATALLAS ====================

/**
 * Obtiene el historial de batallas de un usuario
 */
export async function getUserBattleHistory(uid, limitCount = 20) {
  try {
    const historyRef = collection(db, 'battleHistory');
    const q = query(
      historyRef,
      where('userId', '==', uid),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener historial de batallas:', error);
    return [];
  }
}

/**
 * Registra una batalla completada
 */
export async function recordBattle(data) {
  try {
    const historyRef = collection(db, 'battleHistory');
    await addDoc(historyRef, {
      userId: data.userId,
      opponentId: data.opponentId || 'ia',
      opponentName: data.opponentName || 'IA',
      categoryId: data.categoryId,
      categoryName: data.categoryName || data.categoryId,
      userScore: data.userScore,
      opponentScore: data.opponentScore,
      userCorrect: data.userCorrect,
      opponentCorrect: data.opponentCorrect,
      totalQuestions: data.totalQuestions,
      won: data.won,
      earnedCoins: data.earnedCoins || {},
      completedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al registrar batalla:', error);
  }
}

/**
 * Obtiene estadísticas de batallas de un usuario
 */
export async function getBattleStats(uid) {
  try {
    const history = await getUserBattleHistory(uid, 100);
    
    const stats = {
      totalBattles: history.length,
      wins: history.filter(h => h.won).length,
      losses: history.filter(h => !h.won).length,
      winRate: 0,
      averageScore: 0,
      favoriteCategory: null
    };

    if (history.length > 0) {
      stats.winRate = Math.round((stats.wins / history.length) * 100);
      stats.averageScore = Math.round(
        history.reduce((sum, h) => sum + (h.userScore || 0), 0) / history.length
      );

      // Categoría favorita
      const categoryCount = {};
      history.forEach(h => {
        const cat = h.categoryId || 'general';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      stats.favoriteCategory = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';
    }

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de batallas:', error);
    return null;
  }
}



