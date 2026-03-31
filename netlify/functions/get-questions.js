import { db } from '../src/firebase.js';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';

/**
 * Función serverless para obtener preguntas aleatorias
 * Uso: /.netlify/functions/get-questions?categoryId=xxx&limit=10
 */
export const handler = async (event) => {
  const { categoryId, limit } = event.queryStringParameters;
  const questionsLimit = parseInt(limit) || 10;

  try {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('status', '==', 'approved'),
      categoryId ? where('categoryId', '==', categoryId) : undefined
    );

    const snapshot = await getDocs(q);
    let questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Aleatorizar y limitar
    questions = questions.sort(() => Math.random() - 0.5).slice(0, questionsLimit);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ questions }),
    };
  } catch (error) {
    console.error('Error en get-questions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Error al obtener preguntas' }),
    };
  }
};
