/**
 * Configuración de Firebase para scripts de Node.js
 *
 * Los scripts se ejecutan fuera de Vite, por lo que usan process.env
 * en lugar de import.meta.env.
 */

export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyA3tRr4nM3oQCMS8GF-XTf9IEEwRhI95z8',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'bd-nicaquizz.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'bd-nicaquizz',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'bd-nicaquizz.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '671319163494',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:671319163494:web:171e57b6ebdd08d2d8a3a7',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5VSGTZ7H9K'
};
