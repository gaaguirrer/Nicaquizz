/**
 * Script para generar el reto diario de NicaQuizz
 * 
 * Este script selecciona 10 preguntas aleatorias de diversas categorías
 * y crea un documento en la colección 'dailyChallenges' para la fecha actual.
 * 
 * Uso:
 *   node src/scripts/generate-daily-challenge.js
 * 
 * Para producción, ejecutar diariamente vía cron o Cloud Function.
 */

import { initializeApp } from 'firebase/app';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../shared/firebase.config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene todas las preguntas aprobadas de una categoría específica
 */
async function getQuestionsByCategory(categoryId, limit = 20) {
  try {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('status', '==', 'approved'),
      where('categoryId', '==', categoryId)
    );
    
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return questions;
  } catch (error) {
    console.error(`Error al obtener preguntas de ${categoryId}:`, error);
    return [];
  }
}

/**
 * Obtiene todas las preguntas aprobadas (sin categoría específica)
 */
async function getAllApprovedQuestions() {
  try {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return questions;
  } catch (error) {
    console.error('Error al obtener todas las preguntas:', error);
    return [];
  }
}

/**
 * Selecciona N elementos aleatorios de un array
 */
function selectRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Genera el reto diario
 */
async function generateDailyChallenge() {
  const today = getTodayDateString();
  console.log(`\n🎯 Generando reto diario para: ${today}`);
  
  try {
    // Verificar si ya existe un reto para hoy
    const challengeRef = doc(db, 'dailyChallenges', today);
    const challengeSnap = await getDoc(challengeRef);
    
    if (challengeSnap.exists()) {
      console.log('⚠ Ya existe un reto diario para hoy.');
      console.log('¿Deseas reemplazarlo? (y/n)');
      
      // En entorno no interactivo, no reemplazar
      console.log('Ejecución no interactiva: no se reemplazará.');
      return;
    }
    
    // Obtener todas las preguntas aprobadas
    console.log('📚 Obteniendo preguntas aprobadas...');
    const allQuestions = await getAllApprovedQuestions();
    
    if (allQuestions.length === 0) {
      console.error('✗ No hay preguntas aprobadas en la base de datos.');
      return;
    }
    
    console.log(`✓ Se encontraron ${allQuestions.length} preguntas aprobadas.`);
    
    // Seleccionar 10 preguntas aleatorias
    const selectedQuestions = selectRandomItems(allQuestions, 10);
    const questionIds = selectedQuestions.map(q => q.id);
    
    // Obtener categorías únicas de las preguntas seleccionadas
    const categories = [...new Set(selectedQuestions.map(q => q.categoryId))];
    const primaryCategory = categories[0] || 'historia'; // Categoría principal

    console.log(`\n✓ Preguntas seleccionadas:`);
    selectedQuestions.forEach((q, i) => {
      console.log(`   ${i + 1}. [${q.categoryId}] ${q.text?.substring(0, 50) || 'Pregunta sin texto'}...`);
    });

    // Crear documento del reto diario
    const dailyChallenge = {
      date: today,
      questionIds,
      totalQuestions: 10,
      completedBy: [],
      category: 'daily',
      categoryId: primaryCategory, // Categoría principal para redireccionamiento
      reward: 'achiote',
      rewardAmount: 1,
      createdAt: Timestamp.now(),
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)) // Expira a medianoche
    };
    
    await setDoc(challengeRef, dailyChallenge);
    
    console.log(`\n✓ ¡Reto diario generado exitosamente!`);
    console.log(`ℹ Documento: dailyChallenges/${today}`);
    console.log(`ℹ Recompensa: 1 Achiote`);

  } catch (error) {
    console.error('✗ Error al generar reto diario:', error);
    throw error;
  }
}

// Ejecutar el script
generateDailyChallenge()
  .then(() => {
    console.log('\n✓ Script completado.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error fatal:', error);
    process.exit(1);
  });
