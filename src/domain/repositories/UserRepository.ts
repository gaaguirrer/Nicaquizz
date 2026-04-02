/**
 * Interfaz para el Repositorio de Usuarios
 */

import type { User, UserStats, Coins, Mejoras, Trabas } from '../../shared/types/game.types';

export interface UserRepository {
  getUserProfile(uid: string): Promise<User | null>;
  
  createUser(user: Partial<User>): Promise<User>;
  
  updateUserStats(uid: string, stats: UserStats): Promise<void>;
  
  updateUserCoins(uid: string, coins: Partial<Coins>): Promise<void>;
  
  updateUserMejoras(uid: string, mejoras: Partial<Mejoras>): Promise<void>;
  
  updateUserTrabas(uid: string, trabas: Partial<Trabas>): Promise<void>;
  
  updateUserOnlineStatus(uid: string, isOnline: boolean): Promise<void>;
  
  updateUserPrivacy(uid: string, isPublic: boolean, allowOpenChallenges: boolean): Promise<void>;
  
  addCoins(uid: string, categoria: string, isOpenChallenge: boolean): Promise<void>;
  
  hasNacatamalComplete(uid: string): Promise<boolean>;
  
  consumeNacatamal(uid: string): Promise<void>;
  
  getFriends(uid: string): Promise<User[]>;
  
  addFriend(uid: string, friendId: string): Promise<void>;
  
  removeFriend(uid: string, friendId: string): Promise<void>;
}
