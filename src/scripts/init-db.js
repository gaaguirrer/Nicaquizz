/**
 * Script para inicializar la base de datos con categorías e items de tienda
 * 
 * USO:
 * 1. Configura tus credenciales de Firebase en src/firebase.js
 * 2. Ejecuta: node src/scripts/init-db.js
 * 
 * Esto creará:
 * - 4 categorías (historia, matematicas, geografia, ciencias)
 * - Items de tienda con precios base
 * - Algunas preguntas de ejemplo
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

// Importar configuración
import { firebaseConfig } from '../shared/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== CATEGORÍAS ====================

const categories = [
  {
    id: 'historia',
    name: 'Historia',
    description: 'Historia de Nicaragua y Centroamérica',
    ingrediente: 'masa',
    icon: 'history_edu'
  },
  {
    id: 'matematicas',
    name: 'Matemáticas',
    description: 'Álgebra, geometría y cálculo',
    ingrediente: 'cerdo',
    icon: 'calculate'
  },
  {
    id: 'geografia',
    name: 'Geografía',
    description: 'Geografía de Nicaragua y el mundo',
    ingrediente: 'arroz',
    icon: 'public'
  },
  {
    id: 'ciencias',
    name: 'Ciencias Naturales',
    description: 'Biología, química y física',
    ingrediente: 'papa',
    icon: 'science'
  },
  {
    id: 'retos',
    name: 'Retos Diarios',
    description: 'Desafío diario con recompensa especial',
    ingrediente: 'achiote',
    icon: 'emoji_events'
  }
];

// ==================== ITEMS DE TIENDA ====================
// Solo mejoras (power-ups) y trabas - NO hay ropa ni accesorios

const shopItems = [
  // Mejoras (Power-ups)
  {
    id: 'pase',
    name: 'Pase',
    type: 'mejora',
    icon: 'skip_next',
    basePrice: 1,
    description: 'Salta la pregunta actual sin perder el turno',
    effect: 'skip_question'
  },
  {
    id: 'reloj_arena',
    name: 'Reloj de Arena',
    type: 'mejora',
    icon: 'hourglass_top',
    basePrice: 2,
    description: 'Duplica el tiempo disponible para responder',
    effect: 'double_time'
  },
  {
    id: 'comodin',
    name: 'Comodín',
    type: 'mejora',
    icon: 'filter_list',
    basePrice: 2,
    description: 'Elimina dos opciones incorrectas',
    effect: 'remove_wrong_answers'
  }
];

// ==================== PREGUNTAS DE EJEMPLO ====================

const questions = [
  // Historia
  {
    categoryId: 'historia',
    text: '¿En qué año Nicaragua obtuvo su independencia definitiva?',
    correctAnswer: '1838',
    difficulty: 'hard',
    options: ['1821', '1838', '1856', '1900']
  },
  {
    categoryId: 'historia',
    text: '¿Quién fue el presidente de Nicaragua durante la Guerra Nacional?',
    correctAnswer: 'Tomás Martínez',
    difficulty: 'hard',
    options: ['José Santos Zelaya', 'Tomás Martínez', 'Anastasio Somoza', 'Carlos Fonseca']
  },
  {
    categoryId: 'historia',
    text: '¿Qué batalla marcó el fin del filibusterismo en Nicaragua?',
    correctAnswer: 'Batalla de San Jacinto',
    difficulty: 'hard',
    options: ['Batalla de Ocotal', 'Batalla de San Jacinto', 'Batalla de Masaya', 'Batalla de León']
  },
  
  // Matemáticas
  {
    categoryId: 'matematicas',
    text: '¿Cuál es la derivada de x²?',
    correctAnswer: '2x',
    difficulty: 'hard',
    options: ['x', '2x', 'x²', '2x²']
  },
  {
    categoryId: 'matematicas',
    text: '¿Cuánto es la raíz cuadrada de 144?',
    correctAnswer: '12',
    difficulty: 'hard',
    options: ['10', '11', '12', '14']
  },
  {
    categoryId: 'matematicas',
    text: '¿Cuál es el valor de π (pi) con dos decimales?',
    correctAnswer: '3.14',
    difficulty: 'hard',
    options: ['3.12', '3.14', '3.16', '3.18']
  },
  
  // Geografía
  {
    categoryId: 'geografia',
    text: '¿Cuál es el lago más grande de Centroamérica?',
    correctAnswer: 'Lago de Nicaragua',
    difficulty: 'hard',
    options: ['Lago de Atitlán', 'Lago de Nicaragua', 'Lago de Chapala', 'Lago Gatún']
  },
  {
    categoryId: 'geografia',
    text: '¿Qué volcán es el más activo de Nicaragua?',
    correctAnswer: 'Masaya',
    difficulty: 'hard',
    options: ['Momotombo', 'Masaya', 'Telica', 'Cerro Negro']
  },
  {
    categoryId: 'geografia',
    text: '¿Cuál es la capital de Nicaragua?',
    correctAnswer: 'Managua',
    difficulty: 'hard',
    options: ['León', 'Granada', 'Managua', 'Masaya']
  },
  
  // Ciencias
  {
    categoryId: 'ciencias',
    text: '¿Cuál es el elemento químico con símbolo Au?',
    correctAnswer: 'Oro',
    difficulty: 'hard',
    options: ['Plata', 'Oro', 'Cobre', 'Bronce']
  },
  {
    categoryId: 'ciencias',
    text: '¿Qué órgano del cuerpo humano produce insulina?',
    correctAnswer: 'Páncreas',
    difficulty: 'hard',
    options: ['Hígado', 'Riñón', 'Páncreas', 'Bazo']
  },
  {
    categoryId: 'ciencias',
    text: '¿Cuál es la velocidad de la luz en el vacío?',
    correctAnswer: '299,792 km/s',
    difficulty: 'hard',
    options: ['150,000 km/s', '299,792 km/s', '500,000 km/s', '1,080,000 km/s']
  }
];

// ==================== EJECUCIÓN ====================

async function initializeDatabase() {
  console.log('Iniciando base de datos...\n');

  // Crear categorías
  console.log('Creando categorías...');
  for (const cat of categories) {
    const { id, ...data } = cat;
    await setDoc(doc(db, 'categories', id), {
      ...data,
      createdAt: Timestamp.now()
    });
    console.log(`  ✓ ${cat.name} (${cat.id})`);
  }

  // Crear items de tienda
  console.log('\nCreando items de tienda...');
  for (const item of shopItems) {
    const docRef = await addDoc(collection(db, 'shopItems'), {
      ...item,
      timesPurchased: 0,
      totalRevenue: 0,
      createdAt: Timestamp.now()
    });
    console.log(`  ✓ ${item.name}`);
  }

  // Crear preguntas
  console.log('\nCreando preguntas de ejemplo...');
  for (const q of questions) {
    await addDoc(collection(db, 'questions'), {
      ...q,
      status: 'approved',
      createdBy: 'system',
      createdAt: Timestamp.now()
    });
  }
  console.log(`  ✓ ${questions.length} preguntas creadas`);

  console.log('\n¡Base de datos inicializada con éxito!\n');
  console.log('Ahora puedes:');
  console.log('1. Ejecutar: npm run dev');
  console.log('2. Registrarte en la aplicación');
  console.log('3. Ir a Firestore y establecer isAdmin: true en tu usuario');
  console.log('4. ¡Comenzar a jugar!\n');
}

// Ejecutar
initializeDatabase().catch(console.error);

