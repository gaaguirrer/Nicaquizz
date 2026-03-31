import { db } from '../src/firebase.js';
import { collection, addDoc, getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

/**
 * Función serverless para guardar respuesta y actualizar estadísticas
 * Uso: POST /.netlify/functions/submit-answer
 * Body: { userId, questionId, categoryId, isCorrect }
 */
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, questionId, categoryId, isCorrect } = JSON.parse(event.body);

    if (!userId || !questionId || !categoryId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Datos incompletos' }),
      };
    }

    // Guardar respuesta
    const answersRef = collection(db, 'answers');
    await addDoc(answersRef, {
      userId,
      questionId,
      isCorrect,
      categoryId,
      answeredAt: Timestamp.now(),
    });

    // Actualizar estadísticas del usuario
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const newStats = {
        totalQuestionsAnswered: (userData.stats?.totalQuestionsAnswered || 0) + 1,
        totalCorrect: (userData.stats?.totalCorrect || 0) + (isCorrect ? 1 : 0),
        categoryStats: { ...userData.stats?.categoryStats },
      };

      // Actualizar estadísticas por categoría
      if (!newStats.categoryStats[categoryId]) {
        newStats.categoryStats[categoryId] = { correct: 0, total: 0 };
      }
      newStats.categoryStats[categoryId].total = (newStats.categoryStats[categoryId].total || 0) + 1;
      if (isCorrect) {
        newStats.categoryStats[categoryId].correct = (newStats.categoryStats[categoryId].correct || 0) + 1;
      }

      await updateDoc(userRef, { stats: newStats });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error en submit-answer:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Error al guardar respuesta' }),
    };
  }
};
