/**
 * Utilidades para funciones serverless de Netlify
 */

import admin from 'firebase-admin';

// Inicializar Firebase Admin solo una vez
let adminApp = null;

function getAdminApp() {
  if (!adminApp) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      try {
        const serviceAccountData = JSON.parse(serviceAccount);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountData)
        });
      } catch (error) {
        console.error('Error al inicializar Firebase Admin:', error);
      }
    }
  }
  return adminApp;
}

// Headers CORS para permitir peticiones desde el frontend
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// Manejar preflight requests de CORS
export function handleCors(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }
  return null;
}

// Crear respuesta JSON estándar
export function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data),
  };
}

// Crear respuesta de error
export function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ error: message }),
  };
}

// Verificar token de autenticación de Firebase
export async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const adminApp = getAdminApp();
    
    // Si no hay Admin SDK, usar método básico (solo desarrollo)
    if (!adminApp) {
      console.warn('Firebase Admin no inicializado, usando verificación básica');
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return { uid: decoded.sub, email: decoded.email, ...decoded };
    }
    
    // Verificar token con Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...decodedToken
    };
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return null;
  }
}

// Parsear body JSON
export function parseBody(event) {
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return null;
  }
}

// Middleware para requerir autenticación
export async function requireAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = await verifyToken(authHeader);
  
  if (!user) {
    return { error: 'No autorizado', statusCode: 401 };
  }
  
  return { user };
}
