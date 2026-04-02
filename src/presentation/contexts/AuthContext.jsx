import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { getUserProfile, updateUserStatsApi } from '../../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para registrar un nuevo usuario (usa Firebase SDK directamente)
  async function signup(email, password, displayName) {
    try {
      console.log('Iniciando registro:', { email, displayName });
      
      // Paso 1: Registrar con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(' Usuario Auth creado:', user.uid);

      // Paso 2: Actualizar perfil con displayName
      await updateProfile(user, { displayName });
      console.log(' Perfil actualizado:', displayName);

      // Paso 3: Crear documento de usuario en Firestore
      // Usamos el UID del usuario como ID del documento
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        isAdmin: false,
        isPublicProfile: true,
        allowOpenChallenges: false,
        isOnline: false,
        friends: [],
        stats: {
          totalQuestionsAnswered: 0,
          totalCorrect: 0,
          wins: 0,
          losses: 0,
          categoryStats: {}
        },
        coins: {
          masa: 0,
          cerdo: 0,
          arroz: 0,
          papa: 0,
          chile: 0
        },
        mejoras: {
          pase: 3,
          reloj_arena: 2,
          comodin: 2
        },
        trabas: {},
        createdAt: new Date().toISOString() // Usar string en lugar de serverTimestamp para evitar problemas
      };
      
      console.log(' Guardando en Firestore:', userRef.path);
      console.log(' Datos:', userData);
      
      await setDoc(userRef, userData);
      console.log(' Usuario guardado en Firestore');

      return { uid: user.uid, email: user.email, displayName };
    } catch (error) {
      console.error(' Error completo en signup:', error);
      console.error(' Código de error:', error.code);
      console.error(' Mensaje de error:', error.message);
      console.error(' Stack:', error.stack);
      throw error;
    }
  }

  // Función para iniciar sesión (usa Firebase SDK directamente)
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email,
        displayName: userCredential.user.displayName 
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Función para cerrar sesión
  async function logout() {
    return signOut(auth);
  }

  // Función para obtener datos del usuario desde Firestore
  async function fetchUserData(uid) {
    try {
      const data = await getUserProfile(uid);
      
      if (data) {
        setUserData(data);
        return data;
      } else {
        console.error('No se encontró documento para el usuario');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  // Función para actualizar estadísticas del usuario
  async function updateUserStats(questionId, categoryId, isCorrect) {
    if (!currentUser || !userData) return;
    
    try {
      const newStats = {
        totalQuestionsAnswered: (userData.stats?.totalQuestionsAnswered || 0) + 1,
        totalCorrect: (userData.stats?.totalCorrect || 0) + (isCorrect ? 1 : 0),
        wins: userData.stats?.wins || 0,
        losses: userData.stats?.losses || 0,
        categoryStats: { ...userData.stats?.categoryStats }
      };
      
      // Actualizar estadísticas por categoría
      if (!newStats.categoryStats[categoryId]) {
        newStats.categoryStats[categoryId] = { correct: 0, total: 0 };
      }
      newStats.categoryStats[categoryId].total = (newStats.categoryStats[categoryId].total || 0) + 1;
      if (isCorrect) {
        newStats.categoryStats[categoryId].correct = (newStats.categoryStats[categoryId].correct || 0) + 1;
      }
      
      // Actualizar vía API serverless
      await updateUserStatsApi(currentUser.uid, newStats);
      
      // Actualizar estado local
      setUserData(prev => ({
        ...prev,
        stats: newStats
      }));
      
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  // Función para actualizar configuración de privacidad
  async function updatePrivacy(isPublic, allowOpenChallenges) {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isPublicProfile: isPublic,
        allowOpenChallenges: allowOpenChallenges
      });
      
      setUserData(prev => ({
        ...prev,
        isPublicProfile: isPublic,
        allowOpenChallenges: allowOpenChallenges
      }));
    } catch (error) {
      console.error('Error al actualizar privacidad:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    fetchUserData,
    updateUserStats,
    updatePrivacy,
    isAdmin: userData?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}



