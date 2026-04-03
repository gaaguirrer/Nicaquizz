/**
 * Configuración de Firebase
 *
 * Punto centralizado para la inicialización de Firebase.
 * Exporta app, auth, db y signInWithGoogle como servicios.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA3tRr4nM3oQCMS8GF-XTf9IEEwRhI95z8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bd-nicaquizz.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bd-nicaquizz',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bd-nicaquizz.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '671319163494',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:671319163494:web:171e57b6ebdd08d2d8a3a7',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5VSGTZ7H9K'
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  throw error;
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        department: null,
        photoURL: user.photoURL,
        isGoogleAccount: true,
        isAdmin: false,
        isPublicProfile: true,
        allowOpenChallenges: true,
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
        createdAt: new Date().toISOString()
      });
    }

    return user;
  } catch (error) {
    console.error('Error al iniciar con Google:', error);
    throw error;
  }
}

export { app, auth, db };
