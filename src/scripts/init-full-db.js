/**
 * Script de Inicialización de Base de Datos - NicaQuizz
 * "Mestizaje Digital"
 * 
 * Este script inicializa todas las colecciones necesarias para las nuevas interfaces:
 * - departments (Mapa de Conquista)
 * - regionalLeaders (Mapa de Conquista)
 * - notifications (Centro de Avisos)
 * - shopItems (actualizado)
 * - categories (actualizado)
 * 
 * Uso: node src/scripts/init-full-db.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== DEPARTAMENTOS (Mapa de Conquista) ====================

const DEPARTAMENTOS = [
  {
    nombre: 'Boaco',
    capital: 'Boaco',
    poblacion: 171000,
    extension: 4177,
    region: 'Central',
    conquistado: false,
    preguntasDisponibles: 15,
    recompensa: { masa: 2, cerdo: 1 },
    coordenadas: { lat: 12.4733, lng: -85.6558 }
  },
  {
    nombre: 'Carazo',
    capital: 'Jinotepe',
    poblacion: 192000,
    extension: 1081,
    region: 'Pacífico',
    conquistado: false,
    preguntasDisponibles: 12,
    recompensa: { arroz: 2, chile: 1 },
    coordenadas: { lat: 11.8667, lng: -86.1833 }
  },
  {
    nombre: 'Chinandega',
    capital: 'Chinandega',
    poblacion: 442000,
    extension: 4822,
    region: 'Pacífico',
    conquistado: false,
    preguntasDisponibles: 20,
    recompensa: { masa: 3, papa: 1 },
    coordenadas: { lat: 12.6289, lng: -87.1311 }
  },
  {
    nombre: 'Chontales',
    capital: 'Juigalpa',
    poblacion: 182000,
    extension: 6378,
    region: 'Central',
    conquistado: false,
    preguntasDisponibles: 14,
    recompensa: { cerdo: 2, arroz: 1 },
    coordenadas: { lat: 12.0833, lng: -85.3667 }
  },
  {
    nombre: 'Estelí',
    capital: 'Estelí',
    poblacion: 232000,
    extension: 2233,
    region: 'Norte',
    conquistado: false,
    preguntasDisponibles: 18,
    recompensa: { masa: 2, papa: 2 },
    coordenadas: { lat: 13.0833, lng: -86.3500 }
  },
  {
    nombre: 'Granada',
    capital: 'Granada',
    poblacion: 224000,
    extension: 1040,
    region: 'Pacífico',
    conquistado: false,
    preguntasDisponibles: 25,
    recompensa: { masa: 3, cerdo: 2, chile: 2 },
    especial: 'Trivia de Conquista: Granada Colonial',
    coordenadas: { lat: 11.9333, lng: -85.9500 }
  },
  {
    nombre: 'León',
    capital: 'León',
    poblacion: 422000,
    extension: 5138,
    region: 'Pacífico',
    conquistado: true,
    preguntasDisponibles: 30,
    recompensa: { masa: 4, arroz: 2 },
    especial: 'Cuna de la Cultura Nicaragüense',
    coordenadas: { lat: 12.4333, lng: -86.8833 }
  },
  {
    nombre: 'Madriz',
    capital: 'Somoto',
    poblacion: 169000,
    extension: 1708,
    region: 'Norte',
    conquistado: false,
    preguntasDisponibles: 10,
    recompensa: { papa: 2, chile: 1 },
    coordenadas: { lat: 13.5333, lng: -86.6000 }
  },
  {
    nombre: 'Managua',
    capital: 'Managua',
    poblacion: 1500000,
    extension: 3465,
    region: 'Pacífico',
    conquistado: false,
    preguntasDisponibles: 35,
    recompensa: { masa: 5, cerdo: 3, arroz: 3, papa: 2, chile: 2 },
    especial: 'Capital de la República',
    coordenadas: { lat: 12.1333, lng: -86.2500 }
  },
  {
    nombre: 'Masaya',
    capital: 'Masaya',
    poblacion: 392000,
    extension: 590,
    region: 'Pacífico',
    conquistado: false,
    preguntasDisponibles: 22,
    recompensa: { masa: 3, chile: 3 },
    especial: 'Cuna del Folklore',
    coordenadas: { lat: 11.9667, lng: -86.1000 }
  },
  {
    nombre: 'Matagalpa',
    capital: 'Matagalpa',
    poblacion: 634000,
    extension: 6804,
    region: 'Norte',
    conquistado: false,
    preguntasDisponibles: 28,
    recompensa: { cerdo: 3, papa: 3, arroz: 2 },
    especial: 'Perla del Septentrión',
    coordenadas: { lat: 12.9167, lng: -85.9167 }
  },
  {
    nombre: 'Nueva Segovia',
    capital: 'Ocotal',
    poblacion: 271000,
    extension: 3491,
    region: 'Norte',
    conquistado: false,
    preguntasDisponibles: 16,
    recompensa: { masa: 2, papa: 2 },
    coordenadas: { lat: 13.6833, lng: -86.4833 }
  },
  {
    nombre: 'Rivas',
    capital: 'Rivas',
    poblacion: 231000,
    extension: 2162,
    region: 'Pacífico',
    conquistado: false,
    preguntasDisponibles: 19,
    recompensa: { arroz: 3, chile: 2 },
    especial: 'Tierra de Gigantes',
    coordenadas: { lat: 11.4333, lng: -85.8333 }
  },
  {
    nombre: 'Río San Juan',
    capital: 'San Carlos',
    poblacion: 131000,
    extension: 7473,
    region: 'Sur',
    conquistado: false,
    preguntasDisponibles: 13,
    recompensa: { papa: 3, chile: 2 },
    coordenadas: { lat: 11.1167, lng: -84.7667 }
  },
  {
    nombre: 'RAAN',
    capital: 'Bilwi',
    poblacion: 544000,
    extension: 32159,
    region: 'Caribe',
    conquistado: false,
    preguntasDisponibles: 17,
    recompensa: { cerdo: 2, arroz: 2, chile: 2 },
    especial: 'Región Autónoma',
    coordenadas: { lat: 14.0333, lng: -83.3833 }
  },
  {
    nombre: 'RAAS',
    capital: 'Bluefields',
    poblacion: 421000,
    extension: 27260,
    region: 'Caribe',
    conquistado: false,
    preguntasDisponibles: 15,
    recompensa: { cerdo: 2, papa: 2, chile: 2 },
    especial: 'Región Autónoma',
    coordenadas: { lat: 12.0167, lng: -83.7667 }
  }
];

// ==================== LÍDERES REGIONALES ====================

const LIDERES_REGIONALES = [
  {
    departamento: 'Granada',
    nombre: 'Elena "Vigorón" López',
    puntos: 9450,
    influencia: 88,
    avatar: 'https://i.pravatar.cc/100?img=20',
    titulo: 'Maestra del Vigorón',
    especialidad: 'Historia Colonial'
  },
  {
    departamento: 'León',
    nombre: 'Carlos "Poeta" Martínez',
    puntos: 11200,
    influencia: 95,
    avatar: 'https://i.pravatar.cc/100?img=11',
    titulo: 'Guardián de la Tradición',
    especialidad: 'Literatura y Arte'
  },
  {
    departamento: 'Masaya',
    nombre: 'María "Folklore" González',
    puntos: 8750,
    influencia: 82,
    avatar: 'https://i.pravatar.cc/100?img=5',
    titulo: 'Reina del Folklore',
    especialidad: 'Cultura Popular'
  },
  {
    departamento: 'Matagalpa',
    nombre: 'Juan "Cafetalero" Ramírez',
    puntos: 7890,
    influencia: 76,
    avatar: 'https://i.pravatar.cc/100?img=12',
    titulo: 'Maestro Cafetalero',
    especialidad: 'Agricultura y Gastronomía'
  },
  {
    departamento: 'Managua',
    nombre: 'Ana "Capitalina" Sánchez',
    puntos: 12500,
    influencia: 92,
    avatar: 'https://i.pravatar.cc/100?img=9',
    titulo: 'Guardiana de la Capital',
    especialidad: 'Historia Nacional'
  }
];

// ==================== NOTIFICACIONES SIMULADAS ====================

const NOTIFICACIONES_EJEMPLO = [
  {
    tipo: 'trueque',
    titulo: '¡Trueque completado!',
    mensaje: '@Juanito aceptó tu oferta de 2 Masas por 1 Cerdo.',
    leido: false,
    createdAt: Timestamp.now()
  },
  {
    tipo: 'reto',
    titulo: 'Nuevo Desafío',
    mensaje: '@Elena_Nica te ha desafiado a un duelo de Historia.',
    leido: false,
    acciones: ['Aceptar', 'Rechazar'],
    createdAt: Timestamp.now()
  },
  {
    tipo: 'logro',
    titulo: '¡Nuevo Logro!',
    mensaje: 'Has recolectado 10 Papas. Reclama tu recompensa.',
    leido: false,
    accion: 'Reclamar ahora',
    createdAt: Timestamp.now()
  },
  {
    tipo: 'sistema',
    titulo: 'Aviso del Sistema',
    mensaje: 'Tu inventario está casi lleno. Visita la Pulpería.',
    leido: true,
    createdAt: Timestamp.now()
  }
];

// ==================== FUNCIONES DE INICIALIZACIÓN ====================

async function inicializarDepartamentos() {
  console.log('\n📍 Inicializando Departamentos...');
  
  const existingQuery = query(collection(db, 'departments'));
  const existingSnapshot = await getDocs(existingQuery);
  
  if (!existingSnapshot.empty) {
    console.log('✓ Los departamentos ya existen. Saltando...');
    return;
  }
  
  for (const dept of DEPARTAMENTOS) {
    try {
      await addDoc(collection(db, 'departments'), {
        ...dept,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`  ✓ ${dept.nombre} agregado`);
    } catch (error) {
      console.error(`  ✗ Error al agregar ${dept.nombre}:`, error.message);
    }
  }
  
  console.log('✓ Departamentos inicializados correctamente');
}

async function inicializarLideresRegionales() {
  console.log('\n👑 Inicializando Líderes Regionales...');
  
  const existingQuery = query(collection(db, 'regionalLeaders'));
  const existingSnapshot = await getDocs(existingQuery);
  
  if (!existingSnapshot.empty) {
    console.log('✅ Los líderes regionales ya existen. Saltando...');
    return;
  }
  
  for (const lider of LIDERES_REGIONALES) {
    try {
      await addDoc(collection(db, 'regionalLeaders'), {
        ...lider,
        activo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`  ✓ ${lider.nombre} agregado`);
    } catch (error) {
      console.error(`  ✗ Error al agregar ${lider.nombre}:`, error.message);
    }
  }
  
  console.log('✓ Líderes regionales inicializados correctamente');
}

async function inicializarNotificacionesEjemplo() {
  console.log('\nℹ Inicializando Notificaciones de Ejemplo...');

  // Las notificaciones se crean por usuario, esto es solo para testing
  console.log('ℹ Las notificaciones se generan dinámicamente por usuario');
  console.log('✓ Sistema de notificaciones listo');
}

async function verificarShopItems() {
  console.log('\n🛒 Verificando Items de Tienda...');

  const existingQuery = query(collection(db, 'shopItems'));
  const existingSnapshot = await getDocs(existingQuery);

  if (existingSnapshot.empty) {
    console.log('⚠ No hay items en la tienda. Ejecuta init-db.js primero');
    return;
  }

  console.log(`✓ ${existingSnapshot.size} items en tienda verificados`);
}

async function verificarCategorias() {
  console.log('\n📚 Verificando Categorías...');
  
  const existingQuery = query(collection(db, 'categories'));
  const existingSnapshot = await getDocs(existingQuery);
  
  if (existingSnapshot.empty) {
    console.log('⚠ No hay categorías. Ejecuta init-db.js primero');
    return;
  }
  
  console.log(`✓ ${existingSnapshot.size} categorías verificadas`);
}

// ==================== FUNCIÓN PRINCIPAL ====================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🇳🇮  NicaQuizz - Inicialización de Base de Datos');
  console.log('   "Mestizaje Digital"');
  console.log('='.repeat(60));

  try {
    await inicializarDepartamentos();
    await inicializarLideresRegionales();
    await inicializarNotificacionesEjemplo();
    await verificarShopItems();
    await verificarCategorias();

    console.log('\n' + '='.repeat(60));
    console.log('✓ ¡Inicialización completada exitosamente!');
    console.log('='.repeat(60) + '\n');

    console.log('Resumen:');
    console.log(`   - ${DEPARTAMENTOS.length} departamentos disponibles`);
    console.log(`   - ${LIDERES_REGIONALES.length} líderes regionales`);
    console.log(`   - Sistema de notificaciones listo`);
    console.log('\n¡Listo para jugar!\n');
    
  } catch (error) {
    console.error('\n✗ Error durante la inicialización:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();
