/**
 * Implementación de ChallengeRepository usando Firebase Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { ChallengeRepository, CreateChallengeData, ChallengeResult } from '../../domain/repositories/ChallengeRepository';
import { ChallengeEntity } from '../../domain/entities/ChallengeEntity';

export class FirebaseChallengeRepository implements ChallengeRepository {
  private challengesCollection = collection(db, 'challenges');

  async createChallenge(data: CreateChallengeData): Promise<string> {
    try {
      const challengeData = {
        challengerId: data.challengerId,
        challengedId: data.challengedId,
        categoryId: data.categoryId,
        isOpenChallenge: data.isOpenChallenge,
        status: 'pending',
        winnerId: null,
        challengerScore: 0,
        challengedScore: 0,
        createdAt: serverTimestamp(),
        startedAt: null,
        completedAt: null
      };

      const docRef = await addDoc(this.challengesCollection, challengeData);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear reto:', error);
      throw error;
    }
  }

  async getChallenge(challengeId: string): Promise<ChallengeEntity | null> {
    try {
      const docRef = doc(this.challengesCollection, challengeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return ChallengeEntity.fromObject({ id: docSnap.id, ...docSnap.data() });
      }

      return null;
    } catch (error) {
      console.error('Error al obtener reto:', error);
      throw error;
    }
  }

  async getUserChallenges(uid: string, status?: string): Promise<ChallengeEntity[]> {
    try {
      let q = query(
        this.challengesCollection,
        where('challengedId', '==', uid),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(
          this.challengesCollection,
          where('challengedId', '==', uid),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        ChallengeEntity.fromObject({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error al obtener retos del usuario:', error);
      throw error;
    }
  }

  async getPendingChallenges(uid: string): Promise<ChallengeEntity[]> {
    return this.getUserChallenges(uid, 'pending');
  }

  async acceptChallenge(challengeId: string): Promise<void> {
    try {
      const challengeRef = doc(this.challengesCollection, challengeId);
      await updateDoc(challengeRef, {
        status: 'accepted',
        startedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al aceptar reto:', error);
      throw error;
    }
  }

  async rejectChallenge(challengeId: string): Promise<void> {
    try {
      const challengeRef = doc(this.challengesCollection, challengeId);
      await updateDoc(challengeRef, {
        status: 'rejected'
      });
    } catch (error) {
      console.error('Error al rechazar reto:', error);
      throw error;
    }
  }

  async completeChallenge(challengeId: string, result: ChallengeResult): Promise<void> {
    try {
      const challengeRef = doc(this.challengesCollection, challengeId);
      await updateDoc(challengeRef, {
        status: 'completed',
        winnerId: result.winnerId,
        challengerScore: result.challengerScore,
        challengedScore: result.challengedScore,
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al completar reto:', error);
      throw error;
    }
  }

  async updateChallengeStatus(challengeId: string, status: string): Promise<void> {
    try {
      const challengeRef = doc(this.challengesCollection, challengeId);
      await updateDoc(challengeRef, { status });
    } catch (error) {
      console.error('Error al actualizar estado del reto:', error);
      throw error;
    }
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const challengeRef = doc(this.challengesCollection, challengeId);
      await updateDoc(challengeRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al eliminar reto:', error);
      throw error;
    }
  }
}
