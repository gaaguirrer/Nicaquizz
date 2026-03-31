/**
 * Función serverless para manejar usuarios en Firestore
 * 
 * Métodos:
 * - GET /:uid - Obtener perfil de usuario
 * - POST /:uid - Crear/Actualizar usuario
 * - PUT /:uid/stats - Actualizar estadísticas
 * - PUT /:uid/coins - Actualizar monedas
 * 
 * Uso:
 * GET /.netlify/functions/users?uid=xxx
 * POST /.netlify/functions/users
 * Body: { uid, email, displayName, ... }
 */

import { handleCors, jsonResponse, errorResponse, parseBody } from './utils/helpers.js';

export const handler = async (event) => {
  // Manejar CORS
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

  try {
    // GET - Obtener usuario
    if (event.httpMethod === 'GET') {
      const { uid } = event.queryStringParameters;
      if (!uid) {
        return errorResponse(400, 'UID requerido');
      }

      const response = await fetch(`${BASE_URL}/users/${uid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return jsonResponse(404, { exists: false });
        }
        return errorResponse(response.status, 'Error al obtener usuario');
      }

      const data = await response.json();
      const userData = data.fields ? convertFirestoreFields(data.fields) : null;

      return jsonResponse(200, { exists: true, data: { id: data.name?.split('/').pop(), ...userData } });
    }

    // POST - Crear/Actualizar usuario
    if (event.httpMethod === 'POST') {
      const body = parseBody(event);
      if (!body || !body.uid) {
        return errorResponse(400, 'Datos incompletos');
      }

      const { uid, email, displayName, isAdmin = false } = body;

      const userData = {
        email: { stringValue: email },
        displayName: { stringValue: displayName || '' },
        isAdmin: { booleanValue: isAdmin },
        isPublicProfile: { booleanValue: true },
        allowOpenChallenges: { booleanValue: false },
        isOnline: { booleanValue: false },
        friends: { arrayValue: { values: [] } },
        stats: {
          mapValue: {
            fields: {
              totalQuestionsAnswered: { integerValue: 0 },
              totalCorrect: { integerValue: 0 },
              wins: { integerValue: 0 },
              losses: { integerValue: 0 },
              categoryStats: { mapValue: { fields: {} } },
            },
          },
        },
        coins: {
          mapValue: {
            fields: {
              maiz: { integerValue: 0 },
              cerdo: { integerValue: 0 },
              arroz: { integerValue: 0 },
              papa: { integerValue: 0 },
              aceituna: { integerValue: 0 },
            },
          },
        },
        inventory: { arrayValue: { values: [] } },
        equipped: { mapValue: { fields: {} } },
        powerUps: {
          mapValue: {
            fields: {
              pass_question: { integerValue: 3 },
              double_time: { integerValue: 2 },
              reduce_options: { integerValue: 2 },
            },
          },
        },
        createdAt: { stringValue: new Date().toISOString() },
      };

      const response = await fetch(`${BASE_URL}/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: userData }),
      });

      if (!response.ok) {
        return errorResponse(response.status, 'Error al crear usuario');
      }

      return jsonResponse(201, { success: true, uid });
    }

    // PUT - Actualizar estadísticas o monedas
    if (event.httpMethod === 'PUT') {
      const { uid } = event.queryStringParameters;
      const body = parseBody(event);

      if (!uid || !body) {
        return errorResponse(400, 'Datos incompletos');
      }

      const updates = [];

      // Actualizar estadísticas
      if (body.stats) {
        updates.push({
          field: 'stats',
          value: {
            mapValue: {
              fields: {
                totalQuestionsAnswered: { integerValue: body.stats.totalQuestionsAnswered || 0 },
                totalCorrect: { integerValue: body.stats.totalCorrect || 0 },
                wins: { integerValue: body.stats.wins || 0 },
                losses: { integerValue: body.stats.losses || 0 },
                categoryStats: { 
                  mapValue: { 
                    fields: convertToFirestoreMap(body.stats.categoryStats || {}) 
                  } 
                },
              },
            },
          },
        });
      }

      // Actualizar monedas
      if (body.coins) {
        updates.push({
          field: 'coins',
          value: {
            mapValue: {
              fields: {
                maiz: { integerValue: body.coins.maiz || 0 },
                cerdo: { integerValue: body.coins.cerdo || 0 },
                arroz: { integerValue: body.coins.arroz || 0 },
                papa: { integerValue: body.coins.papa || 0 },
                aceituna: { integerValue: body.coins.aceituna || 0 },
              },
            },
          },
        });
      }

      // Actualizar power-ups
      if (body.powerUps) {
        updates.push({
          field: 'powerUps',
          value: {
            mapValue: {
              fields: {
                pass_question: { integerValue: body.powerUps.pass_question || 0 },
                double_time: { integerValue: body.powerUps.double_time || 0 },
                reduce_options: { integerValue: body.powerUps.reduce_options || 0 },
              },
            },
          },
        });
      }

      // Ejecutar actualizaciones
      for (const update of updates) {
        await fetch(`${BASE_URL}/users/${uid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: { [update.field]: update.value },
            updateMask: { fieldPaths: [update.field] },
          }),
        });
      }

      return jsonResponse(200, { success: true });
    }

    return errorResponse(405, 'Method not allowed');
  } catch (error) {
    console.error('Error en users:', error);
    return errorResponse(500, 'Error interno del servidor');
  }
};

// Convertir campos de Firestore a objeto normal
function convertFirestoreFields(fields) {
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) result[key] = value.stringValue;
    else if (value.integerValue !== undefined) result[key] = parseInt(value.integerValue);
    else if (value.booleanValue !== undefined) result[key] = value.booleanValue;
    else if (value.mapValue?.fields) result[key] = convertFirestoreFields(value.mapValue.fields);
    else if (value.arrayValue?.values) {
      result[key] = value.arrayValue.values.map(v => v.stringValue || v.integerValue || 0);
    }
  }
  return result;
}

// Convertir objeto normal a formato Firestore
function convertToFirestoreMap(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = { mapValue: { fields: convertToFirestoreMap(value) } };
    } else if (typeof value === 'number') {
      result[key] = { integerValue: value };
    } else if (typeof value === 'boolean') {
      result[key] = { booleanValue: value };
    } else {
      result[key] = { stringValue: String(value) };
    }
  }
  return result;
}
