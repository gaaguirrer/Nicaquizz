/**
 * Función serverless para inicializar la base de datos
 * Crea categorías, items de tienda y preguntas de ejemplo
 * 
 * Uso: POST /.netlify/functions/init-db
 */

import { handleCors, jsonResponse, errorResponse } from './utils/helpers.js';

export const handler = async (event) => {
  // Manejar CORS
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'Method not allowed');
  }

  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

  try {
    console.log('Iniciando base de datos...');

    // ==================== CATEGORÍAS ====================
    const categories = [
      {
        id: 'historia',
        name: 'Historia',
        description: 'Historia de Nicaragua y Centroamérica',
        icon: 'history_edu'
      },
      {
        id: 'matematicas',
        name: 'Matemáticas',
        description: 'Álgebra, geometría y cálculo',
        icon: 'calculate'
      },
      {
        id: 'geografia',
        name: 'Geografía',
        description: 'Geografía de Nicaragua y el mundo',
        icon: 'public'
      },
      {
        id: 'ciencias',
        name: 'Ciencias Naturales',
        description: 'Biología, química y física',
        icon: 'science'
      }
    ];

    console.log('Creando categorías...');
    for (const cat of categories) {
      await fetch(`${BASE_URL}/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            name: { stringValue: cat.name },
            description: { stringValue: cat.description },
            icon: { stringValue: cat.icon },
            ingrediente: { stringValue: cat.ingrediente || '' },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      });
      console.log(`  ✓ ${cat.name}`);
    }

    // ==================== MONEDAS (CURRENCIES) ====================
    const currencies = [
      {
        name: 'Masa de Maíz',
        description: 'Ingrediente base del nacatamal. Se obtiene en preguntas de Historia.',
        icon: 'grain',
        defaultAmount: 0,
        active: true
      },
      {
        name: 'Carne de Cerdo',
        description: 'Ingrediente proteico del nacatamal. Se obtiene en preguntas de Matemáticas.',
        icon: 'lunch_dining',
        defaultAmount: 0,
        active: true
      },
      {
        name: 'Arroz',
        description: 'Ingrediente de relleno del nacatamal. Se obtiene en preguntas de Geografía.',
        icon: 'rice_bowl',
        defaultAmount: 0,
        active: true
      },
      {
        name: 'Papa',
        description: 'Ingrediente de relleno del nacatamal. Se obtiene en preguntas de Ciencias.',
        icon: 'potato',
        defaultAmount: 0,
        active: true
      },
      {
        name: 'Aceituna',
        description: 'Ingrediente especial. Se obtiene en retos abiertos y eventos especiales.',
        icon: 'olive',
        defaultAmount: 0,
        active: true
      },
      {
        name: 'Token Dorado',
        description: 'Moneda especial para compras premium en la tienda.',
        icon: 'payments',
        defaultAmount: 0,
        active: true
      },
      {
        name: 'Estrella de la Suerte',
        description: 'Moneda rara que se obtiene en eventos especiales y logros.',
        icon: 'star',
        defaultAmount: 0,
        active: true
      }
    ];

    console.log('Creando monedas...');
    for (const currency of currencies) {
      const currencyId = `curr_${currency.name.toLowerCase().replace(/\s+/g, '_')}`;
      await fetch(`${BASE_URL}/currencies/${currencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            name: { stringValue: currency.name },
            description: { stringValue: currency.description },
            icon: { stringValue: currency.icon },
            defaultAmount: { integerValue: currency.defaultAmount },
            active: { booleanValue: currency.active },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      });
      console.log(`  ✓ ${currency.name}`);
    }
    console.log(`  ✓ ${currencies.length} monedas creadas`);

    // ==================== ITEMS DE TIENDA ====================
    const shopItems = [
      // Sombreros
      { name: 'Sombrero de Copa', type: 'sombrero', icon: 'school', basePrice: 1, description: 'Elegante sombrero de copa negro' },
      { name: 'Gorra Deportiva', type: 'sombrero', icon: 'sports_baseball', basePrice: 1, description: 'Gorra deportiva colorida' },
      { name: 'Corona Real', type: 'sombrero', icon: 'royalty', basePrice: 3, description: 'Corona dorada de la realeza' },
      { name: 'Sombrero de Vaquero', type: 'sombrero', icon: 'yards', basePrice: 2, description: 'Sombrero de vaquero del oeste' },

      // Camisas
      { name: 'Camisa Elegante', type: 'camisa', icon: 'business_center', basePrice: 1, description: 'Camisa formal con corbata' },
      { name: 'Camiseta Casual', type: 'camisa', icon: 'checkroom', basePrice: 1, description: 'Camiseta casual cómoda' },
      { name: 'Vestido de Gala', type: 'camisa', icon: 'content_paste_go', basePrice: 2, description: 'Vestido elegante de gala' },
      { name: 'Chaqueta de Cuero', type: 'camisa', icon: 'apparel', basePrice: 2, description: 'Chaqueta de cuero estilo rocker' },

      // Pantalones
      { name: 'Jeans Clásicos', type: 'pantalon', icon: 'checkroom', basePrice: 1, description: 'Jeans azules clásicos' },
      { name: 'Shorts Deportivos', type: 'pantalon', icon: 'sports_soccer', basePrice: 1, description: 'Shorts cómodos para deporte' },
      { name: 'Pantalón de Vestir', type: 'pantalon', icon: 'business_center', basePrice: 2, description: 'Pantalón formal de vestir' },

      // Botas
      { name: 'Botas de Trabajo', type: 'botas', icon: 'hardware', basePrice: 1, description: 'Botas resistentes de trabajo' },
      { name: 'Zapatillas Deportivas', type: 'botas', icon: 'sports_martial_arts', basePrice: 1, description: 'Zapatillas cómodas para correr' },
      { name: 'Tacones Elegantes', type: 'botas', icon: 'footwear', basePrice: 2, description: 'Tacones elegantes de fiesta' },
      { name: 'Sandalias', type: 'botas', icon: 'beach_access', basePrice: 1, description: 'Sandalias frescas de verano' },

      // Accesorios
      { name: 'Gafas de Sol', type: 'accesorio', icon: 'sunglasses', basePrice: 1, description: 'Gafas de sol estilo aviador' },
      { name: 'Gafas de Vista', type: 'accesorio', icon: 'remove_red_eye', basePrice: 1, description: 'Gafas de vista intelectuales' },
      { name: 'Mochila', type: 'accesorio', icon: 'backpack', basePrice: 1, description: 'Mochila escolar práctica' },
      { name: 'Bolso de Mano', type: 'accesorio', icon: 'shopping_bag', basePrice: 2, description: 'Bolso de mano elegante' },
      { name: 'Corbata de Moño', type: 'accesorio', icon: 'school', basePrice: 1, description: 'Corbata de moño elegante' }
    ];

    console.log('Creando items de tienda...');
    for (const item of shopItems) {
      const itemId = `item_${item.type}_${item.name.toLowerCase().replace(/\s+/g, '_')}`;
      await fetch(`${BASE_URL}/shopItems/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            name: { stringValue: item.name },
            type: { stringValue: item.type },
            icon: { stringValue: item.icon },
            basePrice: { integerValue: item.basePrice },
            timesPurchased: { integerValue: 0 },
            totalRevenue: { integerValue: 0 },
            description: { stringValue: item.description },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      });
    }
    console.log(`  ✓ ${shopItems.length} items creados`);

    // ==================== PREGUNTAS ====================
    const questions = [
      // Historia
      { categoryId: 'historia', text: '¿En qué año Nicaragua obtuvo su independencia definitiva?', correctAnswer: '1838', difficulty: 'hard', options: ['1821', '1838', '1856', '1900'] },
      { categoryId: 'historia', text: '¿Quién fue el presidente de Nicaragua durante la Guerra Nacional?', correctAnswer: 'Tomás Martínez', difficulty: 'hard', options: ['José Santos Zelaya', 'Tomás Martínez', 'Anastasio Somoza', 'Carlos Fonseca'] },
      { categoryId: 'historia', text: '¿Qué batalla marcó el fin del filibusterismo en Nicaragua?', correctAnswer: 'Batalla de San Jacinto', difficulty: 'hard', options: ['Batalla de Ocotal', 'Batalla de San Jacinto', 'Batalla de Masaya', 'Batalla de León'] },
      
      // Matemáticas
      { categoryId: 'matematicas', text: '¿Cuál es la derivada de x²?', correctAnswer: '2x', difficulty: 'hard', options: ['x', '2x', 'x²', '2x²'] },
      { categoryId: 'matematicas', text: '¿Cuánto es la raíz cuadrada de 144?', correctAnswer: '12', difficulty: 'hard', options: ['10', '11', '12', '14'] },
      { categoryId: 'matematicas', text: '¿Cuál es el valor de π (pi) con dos decimales?', correctAnswer: '3.14', difficulty: 'hard', options: ['3.12', '3.14', '3.16', '3.18'] },
      
      // Geografía
      { categoryId: 'geografia', text: '¿Cuál es el lago más grande de Centroamérica?', correctAnswer: 'Lago de Nicaragua', difficulty: 'hard', options: ['Lago de Atitlán', 'Lago de Nicaragua', 'Lago de Chapala', 'Lago Gatún'] },
      { categoryId: 'geografia', text: '¿Qué volcán es el más activo de Nicaragua?', correctAnswer: 'Masaya', difficulty: 'hard', options: ['Momotombo', 'Masaya', 'Telica', 'Cerro Negro'] },
      { categoryId: 'geografia', text: '¿Cuál es la capital de Nicaragua?', correctAnswer: 'Managua', difficulty: 'hard', options: ['León', 'Granada', 'Managua', 'Masaya'] },
      
      // Ciencias
      { categoryId: 'ciencias', text: '¿Cuál es el elemento químico con símbolo Au?', correctAnswer: 'Oro', difficulty: 'hard', options: ['Plata', 'Oro', 'Cobre', 'Bronce'] },
      { categoryId: 'ciencias', text: '¿Qué órgano del cuerpo humano produce insulina?', correctAnswer: 'Páncreas', difficulty: 'hard', options: ['Hígado', 'Riñón', 'Páncreas', 'Bazo'] },
      { categoryId: 'ciencias', text: '¿Cuál es la velocidad de la luz en el vacío?', correctAnswer: '299,792 km/s', difficulty: 'hard', options: ['150,000 km/s', '299,792 km/s', '500,000 km/s', '1,080,000 km/s'] }
    ];

    console.log('Creando preguntas...');
    for (const q of questions) {
      const questionId = `q_${q.categoryId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await fetch(`${BASE_URL}/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            text: { stringValue: q.text },
            correctAnswer: { stringValue: q.correctAnswer },
            categoryId: { stringValue: q.categoryId },
            difficulty: { stringValue: q.difficulty },
            options: { arrayValue: { values: q.options.map(o => ({ stringValue: o })) } },
            status: { stringValue: 'approved' },
            createdBy: { stringValue: 'system' },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      });
    }
    console.log(`  ✓ ${questions.length} preguntas creadas`);

    return jsonResponse(200, {
      success: true,
      message: 'Base de datos inicializada correctamente',
      categories: categories.length,
      currencies: currencies.length,
      shopItems: shopItems.length,
      questions: questions.length,
    });
  } catch (error) {
    console.error('Error en init-db:', error);
    return errorResponse(500, `Error al inicializar: ${error.message}`);
  }
};
