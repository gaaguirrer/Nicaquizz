/**
 * Configuracion de Firebase para el frontend
 * Usa variables de entorno para las credenciales
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "TU_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "TU_PROYECTO.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "TU_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "TU_PROYECTO.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "TU_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Proveedor de Google
const googleProvider = new GoogleAuthProvider();

// Funcion para iniciar sesion con Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Crear o actualizar documento del usuario en Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Crear nuevo documento si no existe
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isGoogleAccount: true,
        coins: {
          masa: 0,
          cerdo: 0,
          arroz: 0,
          papa: 0,
          chile: 0
        },
        stats: {
          totalQuestionsAnswered: 0,
          totalCorrect: 0,
          wins: 0,
          losses: 0,
          categoryStats: {}
        },
        inventory: [],
        equipped: {},
        mejoras: {
          pase: 3,
          reloj_arena: 2,
          comodin: 2
        },
        trabas: {},
        friends: [],
        nacatamales: 0,
        nacatamalesEarned: 0,
        isPublicProfile: true,
        allowOpenChallenges: true,
        isOnline: false,
        createdAt: new Date().toISOString()
      });
    }

    return user;
  } catch (error) {
    console.error('Error al iniciar con Google:', error);
    throw error;
  }
}

export default app;
