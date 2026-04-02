/**
 * Interfaz para el Repositorio de Preguntas
 */

import type { Question } from '../../shared/types/game.types';

export interface CreateQuestionData {
  text: string;
  options: string[];
  correctAnswer: number;
  categoryId: string;
  createdBy: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionFilters {
  categoryId?: string;
  difficulty?: string;
  status?: string;
  limit?: number;
}

export interface QuestionRepository {
  getQuestion(questionId: string): Promise<Question | null>;
  
  getQuestions(filters?: QuestionFilters): Promise<Question[]>;
  
  getApprovedQuestions(categoryId?: string, difficulty?: string): Promise<Question[]>;
  
  getPendingQuestions(): Promise<Question[]>;
  
  createQuestion(data: CreateQuestionData): Promise<string>;
  
  updateQuestion(questionId: string, data: Partial<Question>): Promise<void>;
  
  approveQuestion(questionId: string, approvedBy: string): Promise<void>;
  
  rejectQuestion(questionId: string): Promise<void>;
  
  deleteQuestion(questionId: string): Promise<void>;
  
  getRandomQuestions(categoryId?: string, limit?: number): Promise<Question[]>;
}
