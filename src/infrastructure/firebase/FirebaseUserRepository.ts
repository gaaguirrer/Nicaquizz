/**
 * Implementación de UserRepository usando Firebase Firestore
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import { UserEntity, Coins } from '../../domain/entities/UserEntity';
import type { Ingrediente } from '../../shared/constants/ingredients';
import { CATEGORIA_INGREDIENTE } from '../../shared/constants/categories';

export class FirebaseUserRepository implements UserRepository {
  private usersCollection = collection(db, 'users');

  async getUserProfile(uid: string): Promise<UserEntity | null> {
    try {
      const docRef = doc(this.usersCollection, uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return UserEntity.fromObject({ id: docSnap.id, ...docSnap.data() });
      }

      return null;
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      throw error;
    }
  }

  async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
    try {
      if (!user.id) {
        throw new Error('El ID de usuario es requerido');
      }

      const userRef = doc(this.usersCollection, user.id);
      const userData = new UserEntity(
        user.id,
        user.email || '',
        user.displayName || '',
        user.photoURL,
        user.isAdmin ?? false,
        user.isPublicProfile ?? true,
        user.allowOpenChallenges ?? false,
        user.isOnline ?? false,
        user.friends ?? [],
        user.stats,
        user.coins,
        user.mejoras,
        user.trabas,
        user.inventory ?? [],
        user.equipped ?? {},
        user.createdAt || new Date().toISOString()
      );

      await setDoc(userRef, userData.toObject());
      return userData;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async updateUserStats(uid: string, stats: UserEntity['stats']): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      await updateDoc(userRef, {
        stats: stats.toObject()
      });
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      throw error;
    }
  }

  async updateUserCoins(uid: string, coins: Partial<Coins>): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const updateData: Record<string, number> = {};

      if (coins.masa !== undefined) updateData['coins.masa'] = coins.masa;
      if (coins.cerdo !== undefined) updateData['coins.cerdo'] = coins.cerdo;
      if (coins.arroz !== undefined) updateData['coins.arroz'] = coins.arroz;
      if (coins.papa !== undefined) updateData['coins.papa'] = coins.papa;
      if (coins.chile !== undefined) updateData['coins.chile'] = coins.chile;
      if (coins.achiote !== undefined) updateData['coins.achiote'] = coins.achiote;

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error al actualizar monedas:', error);
      throw error;
    }
  }

  async updateUserMejoras(uid: string, mejoras: Partial<UserEntity['mejoras']>): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      await updateDoc(userRef, {
        mejoras: mejoras
      });
    } catch (error) {
      console.error('Error al actualizar mejoras:', error);
      throw error;
    }
  }

  async updateUserTrabas(uid: string, trabas: Partial<UserEntity['trabas']>): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      await updateDoc(userRef, {
        trabas: trabas
      });
    } catch (error) {
      console.error('Error al actualizar trabas:', error);
      throw error;
    }
  }

  async updateUserOnlineStatus(uid: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al actualizar estado en línea:', error);
      throw error;
    }
  }

  async updateUserPrivacy(uid: string, isPublic: boolean, allowOpenChallenges: boolean): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      await updateDoc(userRef, {
        isPublicProfile: isPublic,
        allowOpenChallenges: allowOpenChallenges
      });
    } catch (error) {
      console.error('Error al actualizar privacidad:', error);
      throw error;
    }
  }

  async addCoins(uid: string, categoria: string, isOpenChallenge: boolean): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const ingrediente = CATEGORIA_INGREDIENTE[categoria as keyof typeof CATEGORIA_INGREDIENTE];
      const cantidad = isOpenChallenge ? 2 : 1;

      if (!ingrediente) {
        return;
      }

      await updateDoc(userRef, {
        [`coins.${ingrediente}`]: increment(cantidad)
      });
    } catch (error) {
      console.error('Error al agregar monedas:', error);
      throw error;
    }
  }

  async hasNacatamalComplete(uid: string): Promise<boolean> {
    try {
      const user = await this.getUserProfile(uid);
      return user?.hasNacatamalComplete() ?? false;
    } catch (error) {
      console.error('Error al verificar nacatamal:', error);
      throw error;
    }
  }

  async consumeNacatamal(uid: string): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      await updateDoc(userRef, {
        'coins.masa': increment(-1),
        'coins.cerdo': increment(-1),
        'coins.arroz': increment(-1),
        'coins.papa': increment(-1),
        'coins.chile': increment(-1)
      });
    } catch (error) {
      console.error('Error al consumir nacatamal:', error);
      throw error;
    }
  }

  async getFriends(uid: string): Promise<UserEntity[]> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        return [];
      }

      const userData = docSnap.data();
      const friendIds = userData.friends || [];

      if (friendIds.length === 0) {
        return [];
      }

      const friends: UserEntity[] = [];
      for (const friendId of friendIds) {
        const friend = await this.getUserProfile(friendId);
        if (friend) {
          friends.push(friend);
        }
      }

      return friends;
    } catch (error) {
      console.error('Error al obtener amigos:', error);
      throw error;
    }
  }

  async addFriend(uid: string, friendId: string): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const friendRef = doc(this.usersCollection, friendId);

      await updateDoc(userRef, {
        friends: arrayUnion(friendId)
      });

      await updateDoc(friendRef, {
        friends: arrayUnion(uid)
      });
    } catch (error) {
      console.error('Error al agregar amigo:', error);
      throw error;
    }
  }

  async removeFriend(uid: string, friendId: string): Promise<void> {
    try {
      const userRef = doc(this.usersCollection, uid);
      const friendRef = doc(this.usersCollection, friendId);

      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });

      await updateDoc(friendRef, {
        friends: arrayRemove(uid)
      });
    } catch (error) {
      console.error('Error al eliminar amigo:', error);
      throw error;
    }
  }
}
