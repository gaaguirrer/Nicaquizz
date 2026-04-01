/**
 * Setup file para Vitest
 * Configura el entorno de testing para componentes React
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { forwardRef } from 'react';

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Mock de Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(),
  getApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn()
  },
  reauthenticateWithCredential: vi.fn(),
  updatePassword: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
  increment: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  Timestamp: {
    now: vi.fn()
  }
}));

// Mock de React Router DOM
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
    Link: forwardRef(function MockLink({ children, to, ...props }, ref) {
      return <a href={to} {...props} ref={ref}>{children}</a>;
    })
  };
});

// Mock de contexts
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Usuario Test'
    },
    userData: {
      displayName: 'Usuario Test',
      email: 'test@example.com',
      coins: {
        masa: 5,
        cerdo: 3,
        arroz: 4,
        papa: 2,
        chile: 3,
        achiote: 2
      },
      stats: {
        totalQuestionsAnswered: 100,
        totalCorrect: 75,
        wins: 10,
        losses: 5
      },
      isAdmin: false
    },
    loading: false,
    updatePrivacy: vi.fn()
  })),
  AuthProvider: vi.fn(({ children }) => <div>{children}</div>)
}));

vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn((message) => console.log('SUCCESS:', message)),
    error: vi.fn((message) => console.log('ERROR:', message)),
    info: vi.fn((message) => console.log('INFO:', message)),
    warning: vi.fn((message) => console.log('WARNING:', message))
  })),
  ToastProvider: vi.fn(({ children }) => <div>{children}</div>)
}));
