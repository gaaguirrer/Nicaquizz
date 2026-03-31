/**
 * Función serverless para manejar categorías y preguntas en Firestore
 * 
 * Métodos:
 * - GET /categories - Obtener todas las categorías
 * - GET /questions?categoryId=xxx&status=approved - Obtener preguntas
 * - POST /questions - Crear pregunta
 * - PUT /questions/:id - Actualizar pregunta (aprobar/rechazar)
 * 
 * Uso:
 * GET /.netlify/functions/data?collection=categories
 * GET /.netlify/functions/data?collection=questions&categoryId=xxx
 */

import { handleCors, jsonResponse, errorResponse, parseBody } from './utils/helpers.js';

export const handler = async (event) => {
  // Manejar CORS
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

  const { collection, categoryId, status, limit } = event.queryStringParameters;

  try {
    // GET - Obtener documentos
    if (event.httpMethod === 'GET') {
      let url = `${BASE_URL}/${collection}`;
      const params = new URLSearchParams();

      // Ordenar por createdAt
      params.append('orderBy', 'createdAt');
      params.append('direction', 'ASCENDING');

      // Filtros
      if (categoryId) {
        // Para filtros complejos, necesitamos una consulta estructurada
        // Por ahora, obtenemos todos y filtramos en el cliente
      }

      if (limit) {
        params.append('limit', limit);
      }

      const queryString = params.toString();
      if (queryString) {
        url += '?' + queryString;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return errorResponse(response.status, 'Error al obtener datos');
      }

      const data = await response.json();
      const documents = data.documents || [];

      const items = documents.map(doc => ({
        id: doc.name?.split('/').pop(),
        ...convertFirestoreFields(doc.fields || {}),
      }));

      // Filtrar por categoryId si es necesario
      let filteredItems = items;
      if (categoryId && collection === 'questions') {
        filteredItems = items.filter(item => item.categoryId === categoryId);
      }

      // Filtrar por status si es necesario
      if (status && collection === 'questions') {
        filteredItems = filteredItems.filter(item => item.status === status);
      }

      return jsonResponse(200, filteredItems);
    }

    // POST - Crear documento
    if (event.httpMethod === 'POST') {
      const body = parseBody(event);
      if (!body || !collection) {
        return errorResponse(400, 'Datos incompletos');
      }

      const { id, ...data } = body;
      const docId = id || Date.now().toString();

      const firestoreData = convertToFirestoreMap(data);
      firestoreData.createdAt = { stringValue: new Date().toISOString() };

      const response = await fetch(`${BASE_URL}/${collection}/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: firestoreData }),
      });

      if (!response.ok) {
        return errorResponse(response.status, 'Error al crear documento');
      }

      return jsonResponse(201, { success: true, id: docId });
    }

    // PUT - Actualizar documento
    if (event.httpMethod === 'PUT') {
      const body = parseBody(event);
      const { id } = event.queryStringParameters;

      if (!body || !id) {
        return errorResponse(400, 'Datos incompletos');
      }

      const firestoreData = convertToFirestoreMap(body);

      const response = await fetch(`${BASE_URL}/${collection}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: firestoreData,
          updateMask: { fieldPaths: Object.keys(body) },
        }),
      });

      if (!response.ok) {
        return errorResponse(response.status, 'Error al actualizar documento');
      }

      return jsonResponse(200, { success: true });
    }

    // DELETE - Eliminar documento
    if (event.httpMethod === 'DELETE') {
      const { collection, id } = event.queryStringParameters;

      if (!collection || !id) {
        return errorResponse(400, 'Datos incompletos');
      }

      const response = await fetch(`${BASE_URL}/${collection}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return errorResponse(response.status, 'Error al eliminar documento');
      }

      return jsonResponse(200, { success: true });
    }

    return errorResponse(405, 'Method not allowed');
  } catch (error) {
    console.error('Error en data:', error);
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
      result[key] = value.arrayValue.values.map(v => 
        v.stringValue || (v.integerValue ? parseInt(v.integerValue) : 0)
      );
    } else if (value.timestampValue) {
      result[key] = new Date(value.timestampValue).toISOString();
    }
  }
  return result;
}

// Convertir objeto normal a formato Firestore
function convertToFirestoreMap(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = { mapValue: { fields: convertToFirestoreMap(value) } };
    } else if (Array.isArray(value)) {
      result[key] = {
        arrayValue: {
          values: value.map(v => {
            if (typeof v === 'number') return { integerValue: v };
            if (typeof v === 'boolean') return { booleanValue: v };
            return { stringValue: String(v) };
          }),
        },
      };
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
