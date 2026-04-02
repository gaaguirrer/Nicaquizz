/**
 * Implementación de QuestionRepository usando Firebase Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { QuestionRepository, CreateQuestionData, QuestionFilters } from '../../domain/repositories/QuestionRepository';
import { QuestionEntity } from '../../domain/entities/QuestionEntity';

export class FirebaseQuestionRepository implements QuestionRepository {
  private questionsCollection = collection(db, 'questions');

  async getQuestion(questionId: string): Promise<QuestionEntity | null> {
    try {
      const docRef = doc(this.questionsCollection, questionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return QuestionEntity.fromObject({ id: docSnap.id, ...docSnap.data() });
      }

      return null;
    } catch (error) {
      console.error('Error al obtener pregunta:', error);
      throw error;
    }
  }

  async getQuestions(filters?: QuestionFilters): Promise<QuestionEntity[]> {
    try {
      let q = query(this.questionsCollection);

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.categoryId) {
        q = query(q, where('categoryId', '==', filters.categoryId));
      }

      if (filters?.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        QuestionEntity.fromObject({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      throw error;
    }
  }

  async getApprovedQuestions(categoryId?: string, difficulty?: string): Promise<QuestionEntity[]> {
    try {
      let q = query(
        this.questionsCollection,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );

      if (categoryId) {
        q = query(
          this.questionsCollection,
          where('status', '==', 'approved'),
          where('categoryId', '==', categoryId),
          orderBy('createdAt', 'desc')
        );
      }

      if (difficulty) {
        q = query(
          this.questionsCollection,
          where('status', '==', 'approved'),
          where('difficulty', '==', difficulty),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        QuestionEntity.fromObject({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error al obtener preguntas aprobadas:', error);
      throw error;
    }
  }

  async getPendingQuestions(): Promise<QuestionEntity[]> {
    try {
      const q = query(
        this.questionsCollection,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        QuestionEntity.fromObject({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error al obtener preguntas pendientes:', error);
      throw error;
    }
  }

  async createQuestion(data: CreateQuestionData): Promise<string> {
    try {
      const questionData = {
        text: data.text,
        options: data.options,
        correctAnswer: data.correctAnswer,
        categoryId: data.categoryId,
        createdBy: data.createdBy,
        difficulty: data.difficulty,
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(this.questionsCollection, questionData);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear pregunta:', error);
      throw error;
    }
  }

  async updateQuestion(questionId: string, data: Partial<QuestionEntity>): Promise<void> {
    try {
      const questionRef = doc(this.questionsCollection, questionId);
      await updateDoc(questionRef, data);
    } catch (error) {
      console.error('Error al actualizar pregunta:', error);
      throw error;
    }
  }

  async approveQuestion(questionId: string, approvedBy: string): Promise<void> {
    try {
      const questionRef = doc(this.questionsCollection, questionId);
      await updateDoc(questionRef, {
        status: 'approved',
        approvedBy,
        approvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al aprobar pregunta:', error);
      throw error;
    }
  }

  async rejectQuestion(questionId: string): Promise<void> {
    try {
      const questionRef = doc(this.questionsCollection, questionId);
      await updateDoc(questionRef, {
        status: 'rejected'
      });
    } catch (error) {
      console.error('Error al rechazar pregunta:', error);
      throw error;
    }
  }

  async deleteQuestion(questionId: string): Promise<void> {
    try {
      const questionRef = doc(this.questionsCollection, questionId);
      await deleteDoc(questionRef);
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
      throw error;
    }
  }

  async getRandomQuestions(categoryId?: string, limitCount: number = 10): Promise<QuestionEntity[]> {
    try {
      const questions = await this.getApprovedQuestions(categoryId);
      
      const shuffled = questions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limitCount);
    } catch (error) {
      console.error('Error al obtener preguntas aleatorias:', error);
      throw error;
    }
  }
}
