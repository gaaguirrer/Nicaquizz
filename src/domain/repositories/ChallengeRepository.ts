/**
 * Interfaz para el Repositorio de Retos (Challenges)
 */

import type { Challenge } from '../../shared/types/game.types';
import type { Categoria } from '../../shared/constants/categories';

export interface CreateChallengeData {
  challengerId: string;
  challengedId: string;
  categoryId: Categoria | null;
  isOpenChallenge: boolean;
}

export interface ChallengeResult {
  winnerId: string;
  challengerScore: number;
  challengedScore: number;
}

export interface ChallengeRepository {
  createChallenge(data: CreateChallengeData): Promise<string>;
  
  getChallenge(challengeId: string): Promise<Challenge | null>;
  
  getUserChallenges(uid: string, status?: string): Promise<Challenge[]>;
  
  getPendingChallenges(uid: string): Promise<Challenge[]>;
  
  acceptChallenge(challengeId: string): Promise<void>;
  
  rejectChallenge(challengeId: string): Promise<void>;
  
  completeChallenge(challengeId: string, result: ChallengeResult): Promise<void>;
  
  updateChallengeStatus(challengeId: string, status: string): Promise<void>;
  
  deleteChallenge(challengeId: string): Promise<void>;
}
