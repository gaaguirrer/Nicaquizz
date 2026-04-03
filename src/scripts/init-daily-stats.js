/**
 * Script para inicializar estadísticas diarias
 *
 * Uso: node src/scripts/init-daily-stats.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../shared/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function initDailyStats() {
  const today = getTodayDateString();
  console.log(`\n📊 Inicializando estadísticas para: ${today}`);

  try {
    // Verificar si ya existe
    const docRef = doc(db, 'dailyStats', today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('✓ Ya existen estadísticas para hoy');
      console.log(`  Nacatamales: ${docSnap.data().nacatamalesCompleted || 0}`);
      console.log(`  Usuarios activos: ${docSnap.data().activeUsers?.length || 0}`);
      return;
    }

    // Crear documento inicial
    await setDoc(docRef, {
      date: today,
      nacatamalesCompleted: 0,
      activeUsers: [],
      createdAt: serverTimestamp()
    });

    console.log('✓ Estadísticas diarias inicializadas');
    console.log('  Documento: dailyStats/' + today);

  } catch (error) {
    console.error('✗ Error:', error);
    throw error;
  }
}

initDailyStats()
  .then(() => {
    console.log('\n✓ Script completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error fatal:', error);
    process.exit(1);
  });
