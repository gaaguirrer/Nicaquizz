/**
 * Script para cargar preguntas adicionales (200 por categoria)
 * 
 * USO:
 * node src/scripts/load-more-questions.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Preguntas adicionales por categoria (150 mas por categoria para completar 200)
const additionalQuestions = {
  historia: [
    // ... agregar 150 preguntas mas de historia
  ],
  matematicas: [
    // ... agregar 150 preguntas mas de matematicas
  ],
  geografia: [
    // ... agregar 150 preguntas mas de geografia
  ],
  ciencias: [
    // ... agregar 150 preguntas mas de ciencias
  ]
};

async function createAdditionalQuestions() {
  console.log("Creando preguntas adicionales...");
  
  let totalQuestions = 0;
  
  for (const [categoryId, questions] of Object.entries(additionalQuestions)) {
    if (questions.length === 0) continue;
    
    console.log(`\nCreando preguntas adicionales de ${categoryId}...`);
    
    for (const question of questions) {
      try {
        await addDoc(collection(db, "questions"), {
          text: question.text,
          correctAnswer: question.correctAnswer,
          categoryId: categoryId,
          difficulty: "hard",
          options: question.options,
          status: "approved",
          createdBy: "system",
          createdAt: Timestamp.now()
        });
        totalQuestions++;
      } catch (error) {
        console.error(`Error al crear pregunta: ${question.text}`, error);
      }
    }
    
    console.log(`  ✓ ${questions.length} preguntas adicionales de ${categoryId} creadas`);
  }
  
  console.log(`\nTotal de preguntas adicionales creadas: ${totalQuestions}`);
  return totalQuestions;
}

async function main() {
  console.log("==============================================");
  console.log("Cargando preguntas adicionales en NicaQuizz");
  console.log("==============================================\n");
  
  try {
    const questionsCount = await createAdditionalQuestions();
    
    console.log("\n==============================================");
    console.log("¡Preguntas adicionales cargadas exitosamente!");
    console.log("==============================================");
    console.log(`\nResumen:`);
    console.log(`- Preguntas adicionales creadas: ${questionsCount}`);
    console.log("\n==============================================\n");
    
  } catch (error) {
    console.error("\nError al cargar datos:", error);
    process.exit(1);
  }
}

main();
