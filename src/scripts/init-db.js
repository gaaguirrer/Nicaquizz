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
import { firebaseConfig } from '../firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== CATEGORÍAS ====================

const categories = [
  {
    id: 'historia',
    name: 'Historia',
    description: 'Historia de Nicaragua y Centroamérica',
    ingrediente: 'maiz',
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
  }
];

// ==================== ITEMS DE TIENDA ====================

const shopItems = [
  // Sombreros
  {
    name: 'Sombrero de Copa',
    type: 'sombrero',
    icon: 'school',
    basePrice: 1,
    description: 'Elegante sombrero de copa negro'
  },
  {
    name: 'Gorra Deportiva',
    type: 'sombrero',
    icon: 'sports_baseball',
    basePrice: 1,
    description: 'Gorra deportiva colorida'
  },
  {
    name: 'Corona Real',
    type: 'sombrero',
    icon: 'royalty',
    basePrice: 3,
    description: 'Corona dorada de la realeza'
  },
  {
    name: 'Sombrero de Vaquero',
    type: 'sombrero',
    icon: 'yards',
    basePrice: 2,
    description: 'Sombrero de vaquero del oeste'
  },

  // Camisas
  {
    name: 'Camisa Elegante',
    type: 'camisa',
    icon: 'business_center',
    basePrice: 1,
    description: 'Camisa formal con corbata'
  },
  {
    name: 'Camiseta Casual',
    type: 'camisa',
    icon: 'checkroom',
    basePrice: 1,
    description: 'Camiseta casual cómoda'
  },
  {
    name: 'Vestido de Gala',
    type: 'camisa',
    icon: 'content_paste_go',
    basePrice: 2,
    description: 'Vestido elegante de gala'
  },
  {
    name: 'Chaqueta de Cuero',
    type: 'camisa',
    icon: 'apparel',
    basePrice: 2,
    description: 'Chaqueta de cuero estilo rocker'
  },

  // Pantalones
  {
    name: 'Jeans Clásicos',
    type: 'pantalon',
    icon: 'checkroom',
    basePrice: 1,
    description: 'Jeans azules clásicos'
  },
  {
    name: 'Shorts Deportivos',
    type: 'pantalon',
    icon: 'sports_soccer',
    basePrice: 1,
    description: 'Shorts cómodos para deporte'
  },
  {
    name: 'Pantalón de Vestir',
    type: 'pantalon',
    icon: 'business_center',
    basePrice: 2,
    description: 'Pantalón formal de vestir'
  },

  // Botas
  {
    name: 'Botas de Trabajo',
    type: 'botas',
    icon: 'hardware',
    basePrice: 1,
    description: 'Botas resistentes de trabajo'
  },
  {
    name: 'Zapatillas Deportivas',
    type: 'botas',
    icon: 'sports_martial_arts',
    basePrice: 1,
    description: 'Zapatillas cómodas para correr'
  },
  {
    name: 'Tacones Elegantes',
    type: 'botas',
    icon: 'footwear',
    basePrice: 2,
    description: 'Tacones elegantes de fiesta'
  },
  {
    name: 'Sandalias',
    type: 'botas',
    icon: 'beach_access',
    basePrice: 1,
    description: 'Sandalias frescas de verano'
  },

  // Accesorios
  {
    name: 'Gafas de Sol',
    type: 'accesorio',
    icon: 'sunglasses',
    basePrice: 1,
    description: 'Gafas de sol estilo aviador'
  },
  {
    name: 'Gafas de Vista',
    type: 'accesorio',
    icon: 'remove_red_eye',
    basePrice: 1,
    description: 'Gafas de vista intelectuales'
  },
  {
    name: 'Mochila',
    type: 'accesorio',
    icon: 'backpack',
    basePrice: 1,
    description: 'Mochila escolar práctica'
  },
  {
    name: 'Bolso de Mano',
    type: 'accesorio',
    icon: 'shopping_bag',
    basePrice: 2,
    description: 'Bolso de mano elegante'
  },
  {
    name: 'Corbata de Moño',
    type: 'accesorio',
    icon: 'school',
    basePrice: 1,
    description: 'Corbata de moño elegante'
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

