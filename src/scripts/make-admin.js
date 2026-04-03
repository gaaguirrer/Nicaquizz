/**
 * Script para hacer administrador a un usuario
 *
 * USO:
 * 1. Configura tus credenciales de Firebase en src/firebase.js
 * 2. Ejecuta: node src/scripts/make-admin.js <email-del-usuario>
 *
 * Ejemplo: node src/scripts/make-admin.js usuario@ejemplo.com
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// Importar configuracion
import { firebaseConfig } from '../shared/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeAdmin(email) {
  console.log('Buscando usuario con email:', email);

  try {
    // Buscar usuario por email en Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error('No se encontro ningun usuario con ese email');
      console.log('El usuario debe registrarse primero en la aplicacion');
      return;
    }

    // Hacer administrador al usuario
    const userDoc = snapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);

    await updateDoc(userRef, {
      isAdmin: true,
      adminGrantedAt: new Date().toISOString()
    });

    console.log('\nUsuario convertido a administrador exitosamente!\n');
    console.log('Email:', email);
    console.log('UID:', userDoc.id);
    console.log('Nombre:', userDoc.data().displayName || 'N/A');
    console.log('\nEl usuario ahora tiene acceso a:');
    console.log('   - Panel de Administrador (/admin)');
    console.log('   - Aprobar/rechazar preguntas');
    console.log('   - Crear nuevas categorias');
    console.log('   - Eliminar categorias');
    console.log('   - Monedas infinitas (9999 de cada ingrediente)');
    console.log('\nLas monedas infinitas se agregaran automaticamente la proxima vez que inicie sesion.\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Obtener email de los argumentos
const email = process.argv[2];

if (!email) {
  console.error('Error: Debes proporcionar el email del usuario');
  console.log('\nUso: node src/scripts/make-admin.js <email-del-usuario>');
  console.log('Ejemplo: node src/scripts/make-admin.js usuario@ejemplo.com\n');
  process.exit(1);
}

makeAdmin(email);
