/**
 * Script para inicializar estadísticas mensuales
 *
 * Uso: node src/scripts/init-monthly-stats.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getLastMonth() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  
  if (month === 0) {
    year--;
    month = 11;
  } else {
    month--;
  }
  
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

async function initMonthlyStats() {
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();
  
  console.log(`\n📊 Inicializando estadísticas mensuales`);
  console.log(`   Mes actual: ${currentMonth}`);
  console.log(`   Mes pasado: ${lastMonth}`);

  try {
    // Verificar mes actual
    const currentDocRef = doc(db, 'monthlyStats', currentMonth);
    const currentDocSnap = await getDoc(currentDocRef);

    if (!currentDocSnap.exists()) {
      await setDoc(currentDocRef, {
        month: currentMonth,
        nacatamalesCompleted: 0,
        topUsers: [],
        createdAt: serverTimestamp()
      });
      console.log(`✓ Creado documento para mes actual: monthlyStats/${currentMonth}`);
    } else {
      console.log(`✓ Ya existe documento para mes actual`);
    }

    // Verificar mes pasado
    const lastDocRef = doc(db, 'monthlyStats', lastMonth);
    const lastDocSnap = await getDoc(lastDocRef);

    if (!lastDocSnap.exists()) {
      await setDoc(lastDocRef, {
        month: lastMonth,
        nacatamalesCompleted: 0,
        topUsers: [],
        createdAt: serverTimestamp()
      });
      console.log(`✓ Creado documento para mes pasado: monthlyStats/${lastMonth}`);
    } else {
      console.log(`✓ Ya existe documento para mes pasado`);
      console.log(`  Nacatamales: ${lastDocSnap.data().nacatamalesCompleted || 0}`);
      console.log(`  Top users: ${lastDocSnap.data().topUsers?.length || 0}`);
    }

  } catch (error) {
    console.error('✗ Error:', error);
    throw error;
  }
}

initMonthlyStats()
  .then(() => {
    console.log('\n✓ Script completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error fatal:', error);
    process.exit(1);
  });
