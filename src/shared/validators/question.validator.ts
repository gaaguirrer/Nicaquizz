/**
 * Validador de Preguntas
 */

import type { ValidationResult } from './email.validator';

const VALID_CATEGORIES = ['historia', 'matematicas', 'geografia', 'ciencias', 'retos'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const MIN_QUESTION_LENGTH = 10;
const MAX_QUESTION_LENGTH = 1000;
const OPTIONS_COUNT = 4;

export interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: number;
  categoryId: string;
  difficulty: string;
}

export function validateQuestion(questionData: Partial<QuestionData>): ValidationResult {
  const errors: string[] = [];

  if (!questionData.text) {
    errors.push('El texto de la pregunta es requerido');
  } else if (
    questionData.text.length < MIN_QUESTION_LENGTH ||
    questionData.text.length > MAX_QUESTION_LENGTH
  ) {
    errors.push(`La pregunta debe tener entre ${MIN_QUESTION_LENGTH} y ${MAX_QUESTION_LENGTH} caracteres`);
  }

  if (!Array.isArray(questionData.options) || questionData.options.length !== OPTIONS_COUNT) {
    errors.push(`Debe haber exactamente ${OPTIONS_COUNT} opciones`);
  }

  if (
    typeof questionData.correctAnswer !== 'number' ||
    questionData.correctAnswer < 0 ||
    questionData.correctAnswer > 3
  ) {
    errors.push('La respuesta correcta debe ser un índice entre 0 y 3');
  }

  if (!questionData.categoryId || !VALID_CATEGORIES.includes(questionData.categoryId)) {
    errors.push('Categoría no válida');
  }

  if (!questionData.difficulty || !VALID_DIFFICULTIES.includes(questionData.difficulty)) {
    errors.push('Dificultad no válida');
  }

  if (errors.length > 0) {
    return { valid: false, message: errors.join('; ') };
  }

  return { valid: true };
}
