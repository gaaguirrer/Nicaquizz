import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '../../infrastructure/firebase/firebase.config';
import { getUserProfile, updateUserStatsApi } from '../../services/api';
import { updateUserOnlineStatus } from '../../services/firestore';

async function fetchUserDataFromFirestore(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (error) {
    console.error('Error al leer de Firestore directo:', error);
  }
  return null;
}

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

  async function signup(email, password, displayName, department) {
    try {
      console.log('Iniciando registro:', { email, displayName, department });

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(' Usuario Auth creado:', user.uid);

      await updateProfile(user, { displayName });
      console.log(' Perfil actualizado:', displayName);

      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        department: department || null,
        photoURL: null,
        isGoogleAccount: false,
        isAdmin: false,
        isPublicProfile: true,
        allowOpenChallenges: false,
        isOnline: false,
        friends: [],
        initialGiftClaimed: true,
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
          chile: 0,
          achiote: 0,
          nacatamal: 3
        },
        mejoras: {
          pase: 3,
          reloj_arena: 2,
          comodin: 2
        },
        trabas: {},
        inventory: [],
        equipped: {},
        createdAt: new Date().toISOString()
      };

      console.log(' Guardando en Firestore:', userRef.path);
      await setDoc(userRef, userData);
      console.log(' Usuario guardado en Firestore');

      return { uid: user.uid, email: user.email, displayName };
    } catch (error) {
      console.error(' Error en signup:', error);

      if (error.code === 'auth/email-already-in-use') {
        console.warn('Email ya registrado. Intentando recuperar cuenta...');

        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const existingUser = userCredential.user;
          const userRef = doc(db, 'users', existingUser.uid);
          const existingDoc = await getDoc(userRef);

          if (!existingDoc.exists()) {
            console.log('Usuario huerfano encontrado. Reparando perfil...');

            const repairedData = {
              uid: existingUser.uid,
              email: existingUser.email,
              displayName: existingUser.displayName || displayName,
              department: department || null,
              photoURL: existingUser.photoURL || null,
              isGoogleAccount: existingUser.providerData.some(p => p.providerId === 'google.com'),
              isAdmin: false,
              isPublicProfile: true,
              allowOpenChallenges: false,
              isOnline: false,
              friends: [],
              initialGiftClaimed: false,
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
                chile: 0,
                achiote: 0,
                nacatamal: 0
              },
              mejoras: {
                pase: 3,
                reloj_arena: 2,
                comodin: 2
              },
              trabas: {},
              inventory: [],
              equipped: {},
              createdAt: existingUser.metadata.creationTime || new Date().toISOString()
            };

            await setDoc(userRef, repairedData);
            console.log('Perfil reparado para usuario existente:', existingUser.uid);
          }

          return { uid: existingUser.uid, email: existingUser.email, displayName: existingUser.displayName || displayName };
        } catch (loginError) {
          console.error('No se pudo recuperar la cuenta:', loginError);

          if (loginError.code === 'auth/wrong-password' || loginError.code === 'auth/invalid-credential') {
            const recoveryError = new Error('Este correo ya esta registrado con otra contrasena. Intenta iniciar sesion.');
            recoveryError.code = 'auth/email-already-in-use-recovery';
            throw recoveryError;
          }

          throw error;
        }
      }

      throw error;
    }
  }

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

  async function googleLogin() {
    try {
      const result = await signInWithGoogle();
      return {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName,
        photoURL: result.photoURL,
        isGoogleAccount: true
      };
    } catch (error) {
      console.error('Error en googleLogin:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      if (currentUser) {
        await updateUserOnlineStatus(currentUser.uid, false).catch((error) => {
          console.warn('No se pudo actualizar estado offline:', error.message);
        });
      }
    } finally {
      return signOut(auth);
    }
  }

  async function fetchUserData(uid) {
    try {
      const data = await getUserProfile(uid);

      if (data) {
        setUserData(data);
        return data;
      } else {
        console.error('No se encontro documento para el usuario');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

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

      if (!newStats.categoryStats[categoryId]) {
        newStats.categoryStats[categoryId] = { correct: 0, total: 0 };
      }
      newStats.categoryStats[categoryId].total = (newStats.categoryStats[categoryId].total || 0) + 1;
      if (isCorrect) {
        newStats.categoryStats[categoryId].correct = (newStats.categoryStats[categoryId].correct || 0) + 1;
      }

      await updateUserStatsApi(currentUser.uid, newStats);

      setUserData(prev => ({
        ...prev,
        stats: newStats
      }));

    } catch (error) {
      console.error('Error al actualizar estadisticas:', error);
      throw error;
    }
  }

  async function updatePrivacy(isPublic, allowOpenChallenges) {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        isPublicProfile: isPublic,
        allowOpenChallenges: allowOpenChallenges
      }, { merge: true });

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
      try {
        setCurrentUser(user);

        if (user) {
          // Intentar API primero, fallback a Firestore directo
          let profileData = await fetchUserData(user.uid).catch((err) => {
            console.warn('API no disponible, usando Firestore directo:', err.message);
            return null;
          });

          if (!profileData) {
            profileData = await fetchUserDataFromFirestore(user.uid);
            if (profileData) {
              setUserData(profileData);
            }
          }

          if (!profileData) {
            console.warn('Usuario huerfano detectado. Reparando perfil...');

            const userRef = doc(db, 'users', user.uid);
            const repairedData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Usuario',
              department: null,
              photoURL: user.photoURL || null,
              isGoogleAccount: user.providerData.some(p => p.providerId === 'google.com'),
              isAdmin: false,
              isPublicProfile: true,
              allowOpenChallenges: false,
              isOnline: false,
              friends: [],
              initialGiftClaimed: false,
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
                chile: 0,
                achiote: 0,
                nacatamal: 0
              },
              mejoras: {
                pase: 3,
                reloj_arena: 2,
                comodin: 2
              },
              trabas: {},
              inventory: [],
              equipped: {},
              createdAt: user.metadata.creationTime || new Date().toISOString()
            };

            await setDoc(userRef, repairedData);
            console.log('Perfil reparado exitosamente para:', user.uid);

            // Usar los datos reparados directamente en lugar de volver a llamar a la API
            setUserData(repairedData);
          }

          await updateUserOnlineStatus(user.uid, true).catch((err) => {
            console.error('Error al actualizar estado online:', err);
          });

          const handleVisibilityChange = async () => {
            if (document.visibilityState === 'hidden') {
              const url = `/api/users/${user.uid}/offline`;
              navigator.sendBeacon?.(url);

              try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                  isOnline: false
                }, { merge: true });
              } catch (e) {
                // Ignorar error en background
              }
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);

          return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          };
        } else {
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    googleLogin,
    logout,
    fetchUserData,
    updateUserStats,
    updatePrivacy,
    isAdmin: userData?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#154212]/20 border-t-[#154212] rounded-full animate-spin"></div>
            <p className="text-[#154212] font-bold text-lg">Cargando NicaQuizz...</p>
            <p className="text-[#42493e]/60 text-sm mt-1">Verificando sesi&oacute;n</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
