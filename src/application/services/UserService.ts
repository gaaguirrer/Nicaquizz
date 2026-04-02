/**
 * Servicio de Usuario
 * 
 * Maneja todas las operaciones relacionadas con usuarios.
 * Usa inyección de dependencias para el repositorio de usuarios.
 */

import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { UserEntity } from '../../domain/entities/UserEntity';
import type { Ingrediente } from '../../shared/constants/ingredients';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserProfile(uid: string): Promise<UserEntity | null> {
    return this.userRepository.getUserProfile(uid);
  }

  async updateUserStats(
    uid: string,
    questionId: string,
    categoryId: string,
    isCorrect: boolean
  ): Promise<void> {
    const user = await this.getUserProfile(uid);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const newStats = user.stats.incrementAnswer(isCorrect, categoryId);
    await this.userRepository.updateUserStats(uid, newStats);
  }

  async addCoins(
    uid: string,
    categoria: string,
    isOpenChallenge: boolean = false
  ): Promise<void> {
    await this.userRepository.addCoins(uid, categoria, isOpenChallenge);
  }

  async addIngrediente(uid: string, ingrediente: Ingrediente, amount: number): Promise<void> {
    const user = await this.getUserProfile(uid);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const newCoins = user.coins.add(ingrediente, amount);
    await this.userRepository.updateUserCoins(uid, newCoins);
  }

  async hasNacatamalComplete(uid: string): Promise<boolean> {
    return this.userRepository.hasNacatamalComplete(uid);
  }

  async consumeNacatamal(uid: string): Promise<void> {
    await this.userRepository.consumeNacatamal(uid);
  }

  async purchaseItem(uid: string): Promise<void> {
    const hasNacatamal = await this.hasNacatamalComplete(uid);
    if (!hasNacatamal) {
      throw new Error('Necesitas un nacatamal completo para comprar');
    }

    await this.consumeNacatamal(uid);
    await this.userRepository.updateUserMejoras(uid, {
      pase: 1,
      reloj_arena: 1,
      comodin: 1
    });
  }

  async useMejora(uid: string, mejoraType: string): Promise<void> {
    const user = await this.getUserProfile(uid);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.mejoras.has(mejoraType)) {
      throw new Error(`No tiene ${mejoraType} disponibles`);
    }

    const newMejoras = user.mejoras.use(mejoraType);
    await this.userRepository.updateUserMejoras(uid, newMejoras);
  }

  async useTraba(uid: string, trabaType: string): Promise<void> {
    const user = await this.getUserProfile(uid);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.trabas.has(trabaType)) {
      throw new Error(`No tiene ${trabaType} disponibles`);
    }

    const newTrabas = user.trabas.use(trabaType);
    await this.userRepository.updateUserTrabas(uid, newTrabas);
  }

  async updateOnlineStatus(uid: string, isOnline: boolean): Promise<void> {
    await this.userRepository.updateUserOnlineStatus(uid, isOnline);
  }

  async updatePrivacy(
    uid: string,
    isPublic: boolean,
    allowOpenChallenges: boolean
  ): Promise<void> {
    await this.userRepository.updateUserPrivacy(uid, isPublic, allowOpenChallenges);
  }

  async addFriend(uid: string, friendId: string): Promise<void> {
    await this.userRepository.addFriend(uid, friendId);
  }

  async removeFriend(uid: string, friendId: string): Promise<void> {
    await this.userRepository.removeFriend(uid, friendId);
  }

  async getFriends(uid: string): Promise<UserEntity[]> {
    return this.userRepository.getFriends(uid);
  }
}
