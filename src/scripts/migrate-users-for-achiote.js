/**
 * Script de migración para agregar Achiote a usuarios existentes
 * 
 * Este script actualiza todos los documentos de usuarios para incluir
 * la moneda 'achiote' con valor inicial de 0.
 * 
 * Uso:
 *   node src/scripts/migrate-users-for-achiote.js
 */

import { initializeApp } from 'firebase/app';
import { 
  collection,
  getDocs,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Migra todos los usuarios para incluir la moneda achiote
 */
async function migrateUsersForAchiote() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  NicaQuizz - Migración Achiote                ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`ℹ Total de usuarios encontrados: ${snapshot.size}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let alreadyMigratedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data();
      const userRef = doc(db, 'users', docSnap.id);
      
      // Verificar si ya tiene achiote
      if (userData.coins?.achiote !== undefined) {
        alreadyMigratedCount++;
        console.log(`✓ ${userData.displayName || userData.email} - Ya tiene achiote`);
        continue;
      }
      
      try {
        // Agregar achiote con valor 0
        await updateDoc(userRef, {
          'coins.achiote': 0,
          'stats.dailyChallengesCompleted': 0,
          'stats.totalExchanges': 0
        });
        
        successCount++;
        console.log(`✓ ${userData.displayName || userData.email} - Achiote agregado`);
      } catch (error) {
        errorCount++;
        console.error(`✗ ${userData.displayName || userData.email} - Error: ${error.message}`);
      }
    }
    
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  Resumen de Migración                         ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  ✓ Migrados:        ${String(successCount).padEnd(20)} ║`);
    console.log(`║  ✓ Ya existentes:   ${String(alreadyMigratedCount).padEnd(20)} ║`);
    console.log(`║  ✗ Errores:        ${String(errorCount).padEnd(20)} ║`);
    console.log(`║  ───────────────────────────────────────────── ║`);
    console.log(`║  Total procesados:  ${String(snapshot.size).padEnd(20)} ║`);
    console.log('╚════════════════════════════════════════════════╝\n');
    
    return { successCount, errorCount, alreadyMigratedCount, total: snapshot.size };
  } catch (error) {
    console.error('✗ Error fatal en migración:', error);
    throw error;
  }
}

// Ejecutar el script
migrateUsersForAchiote()
  .then(() => {
    console.log('✓ Migración completada.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error fatal:', error);
    process.exit(1);
  });
