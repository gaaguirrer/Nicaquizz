// ==================== MAPA DE CONQUISTA ====================

/**
 * Obtiene todos los departamentos
 */
export async function getDepartments() {
  try {
    const departmentsRef = collection(db, 'departments');
    const q = query(departmentsRef, orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    throw error;
  }
}

/**
 * Obtiene un departamento por ID
 */
export async function getDepartmentById(id) {
  try {
    const docRef = doc(db, 'departments', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    throw error;
  }
}

/**
 * Obtiene líderes regionales
 */
export async function getRegionalLeaders(departmentId = null) {
  try {
    const leadersRef = collection(db, 'regionalLeaders');
    let q = query(leadersRef, where('activo', '==', true));

    if (departmentId) {
      q = query(leadersRef, where('departamento', '==', departmentId), where('activo', '==', true));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener líderes regionales:', error);
    throw error;
  }
}

/**
 * Obtiene el progreso de conquista de un usuario
 */
export async function getUserConquestProgress(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { departamentosConquistados: [], progresoTotal: 0 };
    }

    const userData = userSnap.data();
    return {
      departamentosConquistados: userData.departamentosConquistados || [],
      progresoTotal: userData.conquestProgress || 0
    };
  } catch (error) {
    console.error('Error al obtener progreso de conquista:', error);
    throw error;
  }
}

/**
 * Actualiza el progreso de conquista de un usuario
 */
export async function updateUserConquestProgress(uid, departmentId) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`departamentosConquistados`]: arrayUnion(departmentId),
      [`conquestProgress`]: increment(1),
      [`lastConquestAt`]: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar progreso de conquista:', error);
    throw error;
  }
}

// ==================== NOTIFICACIONES ====================

/**
 * Obtiene notificaciones de un usuario
 */
export async function getUserNotifications(uid, limitCount = 50) {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
}

/**
 * Crea una notificación para un usuario
 */
export async function createNotification(userId, tipo, titulo, mensaje, data = {}) {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      tipo,
      titulo,
      mensaje,
      leido: false,
      data,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      leido: true,
      readAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('leido', '==', false)
    );

    const snapshot = await getDocs(q);
    const batchPromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { leido: true, readAt: serverTimestamp() })
    );

    await Promise.all(batchPromises);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    throw error;
  }
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(notificationId) {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
}
