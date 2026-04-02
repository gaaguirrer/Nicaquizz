export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA3tRr4nM3oQCMS8GF-XTf9IEEwRhI95z8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bd-nicaquizz.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bd-nicaquizz",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bd-nicaquizz.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "671319163494",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:671319163494:web:171e57b6ebdd08d2d8a3a7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5VSGTZ7H9K"
};
