/**
 * Servicio de Juego
 * 
 * Maneja la lógica del juego: categorías, preguntas, retos.
 * Usa inyección de dependencias para los repositorios.
 */

import type { QuestionRepository } from '../../domain/repositories/QuestionRepository';
import type { ChallengeRepository } from '../../domain/repositories/ChallengeRepository';
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { QuestionEntity } from '../../domain/entities/QuestionEntity';
import type { ChallengeEntity } from '../../domain/entities/ChallengeEntity';
import type { CategoryEntity } from '../../domain/entities/CategoryEntity';

export interface GameSession {
  questions: QuestionEntity[];
  currentQuestionIndex: number;
  score: number;
  timeRemaining: number;
  lifelines: {
    fiftyFifty: boolean;
    skip: boolean;
    doubleTime: boolean;
  };
}

export class GameService {
  constructor(
    private questionRepository: QuestionRepository,
    private challengeRepository: ChallengeRepository,
    private categoryRepository: CategoryRepository,
    private userRepository: UserRepository
  ) {}

  async getCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.getCategories();
  }

  async getCategoryById(categoryId: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.getCategory(categoryId);
  }

  async getQuestionsForCategory(
    categoryId: string,
    difficulty: string = 'hard',
    limit: number = 10
  ): Promise<QuestionEntity[]> {
    return this.questionRepository.getRandomQuestions(categoryId, limit);
  }

  async startGameSession(
    userId: string,
    categoryId: string
  ): Promise<GameSession> {
    const questions = await this.getQuestionsForCategory(categoryId);
    
    return {
      questions,
      currentQuestionIndex: 0,
      score: 0,
      timeRemaining: 30,
      lifelines: {
        fiftyFifty: true,
        skip: true,
        doubleTime: true
      }
    };
  }

  async submitAnswer(
    userId: string,
    questionId: string,
    categoryId: string,
    selectedAnswer: number
  ): Promise<boolean> {
    const question = await this.questionRepository.getQuestion(questionId);
    
    if (!question) {
      throw new Error('Pregunta no encontrada');
    }

    const isCorrect = question.isCorrectAnswer(selectedAnswer);
    
    await this.userRepository.addCoins(userId, categoryId, false);
    
    return isCorrect;
  }

  async createChallenge(
    challengerId: string,
    challengedId: string,
    categoryId: string | null = null,
    isOpenChallenge: boolean = false
  ): Promise<string> {
    return this.challengeRepository.createChallenge({
      challengerId,
      challengedId,
      categoryId: categoryId as any,
      isOpenChallenge
    });
  }

  async getPendingChallenges(userId: string): Promise<ChallengeEntity[]> {
    return this.challengeRepository.getPendingChallenges(userId);
  }

  async acceptChallenge(challengeId: string): Promise<void> {
    await this.challengeRepository.acceptChallenge(challengeId);
  }

  async rejectChallenge(challengeId: string): Promise<void> {
    await this.challengeRepository.rejectChallenge(challengeId);
  }

  async completeChallenge(
    challengeId: string,
    winnerId: string | null,
    challengerScore: number,
    challengedScore: number
  ): Promise<void> {
    await this.challengeRepository.completeChallenge(challengeId, {
      winnerId,
      challengerScore,
      challengedScore
    });
  }

  async getDailyChallenge(): Promise<ChallengeEntity | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const challenges = await this.challengeRepository.getUserChallenges('daily');
    
    const todayChallenge = challenges.find(challenge => {
      const challengeDate = new Date(challenge.createdAt);
      return challengeDate >= today && challenge.isOpenChallenge;
    });

    return todayChallenge || null;
  }

  async hasCompletedDailyChallenge(userId: string): Promise<boolean> {
    const dailyChallenge = await this.getDailyChallenge();
    
    if (!dailyChallenge) {
      return false;
    }

    return dailyChallenge.isCompleted();
  }
}
