/**
 * Servicio de Autenticación
 * 
 * Maneja todas las operaciones relacionadas con autenticación de usuarios.
 * Usa inyección de dependencias para el repositorio de usuarios.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/firebase.config';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import { UserEntity } from '../../domain/entities/UserEntity';

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  uid: string;
  email: string;
  displayName: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: data.displayName
      });

      const newUser = await this.userRepository.createUser({
        id: user.uid,
        email: user.email,
        displayName: data.displayName,
        isAdmin: false,
        isPublicProfile: true,
        allowOpenChallenges: false,
        isOnline: false,
        friends: [],
        stats: new UserEntity().stats,
        coins: new UserEntity().coins,
        mejoras: new UserEntity().mejoras,
        trabas: new UserEntity().trabas,
        inventory: [],
        equipped: {}
      });

      return {
        uid: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || ''
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<AuthResult> {
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let userProfile = await this.userRepository.getUserProfile(user.uid);

      if (!userProfile) {
        const newUser = await this.userRepository.createUser({
          id: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL,
          isAdmin: false,
          isPublicProfile: true,
          allowOpenChallenges: false,
          isOnline: false,
          friends: [],
          stats: new UserEntity().stats,
          coins: new UserEntity().coins,
          mejoras: new UserEntity().mejoras,
          trabas: new UserEntity().trabas,
          inventory: [],
          equipped: {}
        });

        userProfile = newUser;
      }

      return {
        uid: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.displayName
      };
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
