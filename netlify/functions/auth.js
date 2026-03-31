/**
 * Función serverless para manejar autenticación de usuarios
 * 
 * Métodos:
 * - POST /signup: Registrar nuevo usuario
 * - POST /login: Iniciar sesión
 * - POST /verify: Verificar token
 * 
 * Uso:
 * POST /.netlify/functions/auth
 * Body: { action: 'signup' | 'login' | 'verify', email, password, displayName }
 */

import { handleCors, jsonResponse, errorResponse, parseBody } from './utils/helpers.js';

export const handler = async (event) => {
  // Manejar CORS
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'Method not allowed');
  }

  const body = parseBody(event);
  if (!body) {
    return errorResponse(400, 'Invalid JSON body');
  }

  const { action, email, password, displayName } = body;

  try {
    // Para autenticación real, necesitamos Firebase Admin SDK
    // Por ahora, usamos la API REST de Firebase
    
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    
    if (action === 'signup') {
      // Registrar usuario usando Firebase REST API
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return errorResponse(response.status, data.error?.message || 'Error al registrar');
      }

      // Actualizar perfil con displayName
      if (displayName) {
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken: data.idToken,
              displayName,
              returnSecureToken: true,
            }),
          }
        );
      }

      return jsonResponse(200, {
        uid: data.localId,
        email: data.email,
        displayName: displayName || data.displayName,
        token: data.idToken,
        refreshToken: data.refreshToken,
      });
    }

    if (action === 'login') {
      // Login usando Firebase REST API
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return errorResponse(response.status, data.error?.message || 'Error al iniciar sesión');
      }

      return jsonResponse(200, {
        uid: data.localId,
        email: data.email,
        displayName: data.displayName,
        token: data.idToken,
        refreshToken: data.refreshToken,
      });
    }

    if (action === 'verify') {
      // Verificar token (simplificado)
      const { token } = body;
      if (!token) {
        return errorResponse(400, 'Token requerido');
      }

      // En producción, verificar con Firebase Admin SDK
      return jsonResponse(200, { valid: true });
    }

    return errorResponse(400, 'Acción no válida');
  } catch (error) {
    console.error('Error en auth:', error);
    return errorResponse(500, 'Error interno del servidor');
  }
};
