/**
 * Script de inicialización para Daily Stats y Daily Challenges
 * 
 * Este script crea documentos iniciales en las colecciones:
 * - dailyStats: Para estadísticas diarias de nacatamales
 * - dailyChallenges: Para retos diarios
 * 
 * Uso:
 *   node src/scripts/init-daily-collections.js
 */

import { initializeApp } from 'firebase/app';
import { 
  collection, 
  doc, 
  setDoc,
  getDoc,
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
 * Inicializa la colección dailyStats con el documento de hoy
 */
async function initDailyStats() {
  const today = getTodayDateString();
  console.log(`\n📊 Inicializando dailyStats para: ${today}`);
  
  try {
    const statsRef = doc(db, 'dailyStats', today);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      console.log('✓ El documento dailyStats ya existe para hoy.');
      const data = statsSnap.data();
      console.log(`  - Nacatamales completados: ${data.nacatamalesCompleted || 0}`);
      console.log(`  - Usuarios activos: ${(data.activeUsers || []).length}`);
    } else {
      await setDoc(statsRef, {
        date: today,
        nacatamalesCompleted: 0,
        activeUsers: [],
        createdAt: Timestamp.now()
      });
      console.log('✓ Documento dailyStats creado exitosamente.');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Error al inicializar dailyStats:', error);
    return false;
  }
}

/**
 * Inicializa la colección dailyChallenges con el documento de hoy
 */
async function initDailyChallenges() {
  const today = getTodayDateString();
  console.log(`\n🎯 Inicializando dailyChallenges para: ${today}`);
  
  try {
    const challengeRef = doc(db, 'dailyChallenges', today);
    const challengeSnap = await getDoc(challengeRef);
    
    if (challengeSnap.exists()) {
      console.log('✓ El documento dailyChallenges ya existe para hoy.');
      const data = challengeSnap.data();
      console.log(`  - Preguntas: ${data.totalQuestions || data.questionIds?.length || 0}`);
      console.log(`  - Completados: ${(data.completedBy || []).length}`);
    } else {
      // Crear documento vacío que será llenado por generate-daily-challenge.js
      await setDoc(challengeRef, {
        date: today,
        questionIds: [],
        totalQuestions: 0,
        completedBy: [],
        category: 'retos',
        reward: 'achiote',
        rewardAmount: 1,
        createdAt: Timestamp.now(),
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
        status: 'pending' // Pendiente de generación
      });
      console.log('✓ Documento dailyChallenges creado (pendiente de generar preguntas).');
      console.log('  → Ejecuta: node src/scripts/generate-daily-challenge.js');
    }
    
    return true;
  } catch (error) {
    console.error('✗ Error al inicializar dailyChallenges:', error);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  NicaQuizz - Init Daily Collections           ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  const statsResult = await initDailyStats();
  const challengesResult = await initDailyChallenges();
  
  console.log('\n╔════════════════════════════════════════════════╗');
  if (statsResult && challengesResult) {
    console.log('✓ Inicialización completada exitosamente');
  } else {
    console.log('⚠ Inicialización completada con errores');
  }
  console.log('╚════════════════════════════════════════════════╝\n');
}

// Ejecutar el script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error fatal:', error);
    process.exit(1);
  });
