/**
 * Tipos del Dominio del Juego
 */

import type { Ingrediente } from '../constants/ingredients';
import type { Categoria } from '../constants/categories';
import type { MejoraType, TrabaType } from '../constants/shop-items';
import type { BaseEntity, ChallengeStatus } from './common.types';

export interface User extends BaseEntity {
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  isPublicProfile: boolean;
  allowOpenChallenges: boolean;
  isOnline: boolean;
  lastSeen?: string;
  friends: string[];
  stats: UserStats;
  coins: Coins;
  mejoras: Mejoras;
  trabas: Trabas;
  inventory: string[];
  equipped?: Record<string, string>;
  createdAt: string;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  wins: number;
  losses: number;
  categoryStats: Record<string, CategoryStats>;
}

export interface CategoryStats {
  correct: number;
  total: number;
}

export interface Coins {
  masa: number;
  cerdo: number;
  arroz: number;
  papa: number;
  chile: number;
  achiote: number;
}

export interface Mejoras {
  pase: number;
  reloj_arena: number;
  comodin: number;
}

export interface Trabas {
  reloj_rapido: number;
  pregunta_dificil: number;
  sin_pistas: number;
  controles_invertidos: number;
}

export interface Challenge extends BaseEntity {
  challengerId: string;
  challengedId: string;
  categoryId: Categoria | null;
  isOpenChallenge: boolean;
  status: ChallengeStatus;
  winnerId: string | null;
  challengerScore: number;
  challengedScore: number;
  startedAt?: string;
  completedAt?: string;
}

export interface FriendRequest extends BaseEntity {
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
}

export interface Question extends BaseEntity {
  text: string;
  options: string[];
  correctAnswer: number;
  categoryId: string;
  createdBy: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface Answer extends BaseEntity {
  userId: string;
  questionId: string;
  categoryId: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ShopItem extends BaseEntity {
  name: string;
  description: string;
  type: 'mejora' | 'traba';
  basePrice: number;
  currentPrice: number;
  timesPurchased: number;
  totalRevenue: number;
  icon?: string;
  color?: string;
  active: boolean;
}

export interface Notification extends BaseEntity {
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  data?: Record<string, unknown>;
  readAt?: string;
}

export interface Trade extends BaseEntity {
  senderId: string;
  receiverId: string;
  offeredIngredient: Ingrediente;
  requestedIngredient: Ingrediente;
  offeredAmount: number;
  requestedAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

export interface Category extends BaseEntity {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  order?: number;
}
