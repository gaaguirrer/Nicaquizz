/**
 * Script para actualizar las monedas en Firestore
 * Cambia: maiz → masa, aceituna → chile
 * 
 * USO:
 * node src/scripts/update-coins.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Importar configuracion
import { firebaseConfig } from '../shared/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUsersCoins() {
  console.log('Actualizando monedas de usuarios...');
  
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  let updated = 0;
  
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const coins = data.coins || {};
    
    // Verificar si necesita actualizacion
    const needsUpdate = coins.maiz || coins.aceituna;
    
    if (needsUpdate) {
      const updateData = {};
      
      // Convertir maiz a masa
      if (coins.maiz) {
        updateData['coins.masa'] = coins.maiz;
        updateData['coins.maiz'] = null;
      }
      
      // Convertir aceituna a chile
      if (coins.aceituna) {
        updateData['coins.chile'] = coins.aceituna;
        updateData['coins.aceituna'] = null;
      }
      
      // Agregar campo nacatamales si no existe
      if (!data.nacatamales) {
        updateData['nacatamales'] = 0;
      }
      
      try {
        await updateDoc(doc(db, 'users', userDoc.id), updateData);
        updated++;
        console.log(`  ✓ Usuario ${userDoc.id.slice(0, 8)}... actualizado`);
      } catch (error) {
        console.error(`  ✗ Error al actualizar usuario ${userDoc.id}:`, error.message);
      }
    }
  }
  
  console.log(`\nUsuarios actualizados: ${updated}`);
  return updated;
}

async function updateCategories() {
  console.log('\nActualizando categorias...');
  
  const categoriesRef = collection(db, 'categories');
  const snapshot = await getDocs(categoriesRef);
  
  let updated = 0;
  
  for (const catDoc of snapshot.docs) {
    const data = catDoc.data();
    
    // Actualizar categoria de maiz a masa
    if (data.ingrediente === 'maiz') {
      try {
        await updateDoc(doc(db, 'categories', catDoc.id), {
          ingrediente: 'masa',
          icon: 'grain'
        });
        updated++;
        console.log(`  ✓ Categoria ${catDoc.id} actualizada a masa`);
      } catch (error) {
        console.error(`  ✗ Error al actualizar categoria ${catDoc.id}:`, error.message);
      }
    }
  }
  
  console.log(`\nCategorias actualizadas: ${updated}`);
  return updated;
}

async function main() {
  console.log('==============================================');
  console.log('Actualizando monedas en Firestore');
  console.log('==============================================\n');
  
  try {
    const usersUpdated = await updateUsersCoins();
    const categoriesUpdated = await updateCategories();
    
    console.log('\n==============================================');
    console.log('¡Actualizacion completada!');
    console.log('==============================================');
    console.log(`\nResumen:`);
    console.log(`- Usuarios actualizados: ${usersUpdated}`);
    console.log(`- Categorias actualizadas: ${categoriesUpdated}`);
    console.log('\nCambios realizados:');
    console.log('  - maiz → masa');
    console.log('  - aceituna → chile');
    console.log('  - Agregado campo nacatamales: 0');
    console.log('==============================================\n');
    
  } catch (error) {
    console.error('\nError al actualizar:', error);
    process.exit(1);
  }
}

main();
