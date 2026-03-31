/**
 * Configuración de Firebase para funciones serverless de Netlify
 * Usa Firebase Admin SDK con variables de entorno
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin SDK
function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  return app;
}

// Intentar inicializar con service account, si falla usar config simple
let app;
try {
  app = initFirebaseAdmin();
} catch (error) {
  // Fallback a configuración simple (menos seguro, solo para desarrollo)
  app = initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });
}

// Exportar servicios
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export default app;
