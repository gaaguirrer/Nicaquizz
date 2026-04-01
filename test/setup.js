import '@testing-library/jest-dom';

// ==================== MOCKS DE FIREBASE ====================
// Mocks reutilizables para tests de integración

// Firestore functions
export const mockCollection = vi.fn();
export const mockDoc = vi.fn();
export const mockGetDocs = vi.fn();
export const mockGetDoc = vi.fn();
export const mockAddDoc = vi.fn();
export const mockUpdateDoc = vi.fn();
export const mockDeleteDoc = vi.fn();
export const mockQuery = vi.fn();
export const mockWhere = vi.fn();
export const mockOrderBy = vi.fn();
export const mockLimit = vi.fn();
export const mockIncrement = vi.fn(() => ({ type: 'increment' }));
export const mockArrayUnion = vi.fn(() => ({ type: 'arrayUnion' }));
export const mockArrayRemove = vi.fn(() => ({ type: 'arrayRemove' }));
export const mockServerTimestamp = vi.fn(() => ({ type: 'timestamp' }));
export const mockTimestamp = vi.fn();

// Auth functions
export const mockGetAuth = vi.fn();
export const mockGoogleAuthProvider = vi.fn().mockImplementation(() => ({}));
export const mockSignInWithPopup = vi.fn();
export const mockOnAuthStateChanged = vi.fn();
export const mockCreateUserWithEmailAndPassword = vi.fn();
export const mockSignInWithEmailAndPassword = vi.fn();
export const mockSignOut = vi.fn();
export const mockUpdateProfile = vi.fn();

// Mock de Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

// Mock de Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: () => mockGetAuth(),
  GoogleAuthProvider: mockGoogleAuthProvider,
  signInWithPopup: mockSignInWithPopup,
  onAuthStateChanged: mockOnAuthStateChanged,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  updateProfile: mockUpdateProfile,
}));

// Mock de Firebase Firestore
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    getFirestore: vi.fn(() => ({})),
    collection: mockCollection,
    doc: mockDoc,
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
    addDoc: mockAddDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    query: mockQuery,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    increment: mockIncrement,
    arrayUnion: mockArrayUnion,
    arrayRemove: mockArrayRemove,
    serverTimestamp: mockServerTimestamp,
    Timestamp: mockTimestamp,
  };
});

// Mock de la instancia db
vi.mock('../src/firebase', () => ({
  db: {},
  auth: {},
}));

// ==================== MOCKS DE CONTEXTOS ====================

// Mock de ToastContext
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('../src/context/ToastContext', () => ({
  useToast: () => mockToast,
  ToastProvider: ({ children }) => children,
}));

// Mock de AuthContext
const mockAuthContext = {
  currentUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  userData: {
    coins: { masa: 10, cerdo: 5, arroz: 8, papa: 3, chile: 2 },
    nivel: 10,
    experiencia: 500,
  },
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

// ==================== UTILIDADES PARA TESTS ====================

// Helper para resetear mocks
export function resetMocks() {
  mockCollection.mockClear();
  mockDoc.mockClear();
  mockGetDocs.mockClear();
  mockGetDoc.mockClear();
  mockAddDoc.mockClear();
  mockUpdateDoc.mockClear();
  mockDeleteDoc.mockClear();
  mockQuery.mockClear();
  mockWhere.mockClear();
  mockOrderBy.mockClear();
  mockLimit.mockClear();
  mockIncrement.mockClear();
  mockArrayUnion.mockClear();
  mockServerTimestamp.mockClear();
}

// Helper para configurar mocks comunes
export function setupCommonMocks(data = {}) {
  mockGetDocs.mockResolvedValue({
    docs: (data.docs || []).map(doc => ({
      id: doc.id,
      data: () => doc.data,
    })),
  });

  mockGetDoc.mockResolvedValue({
    exists: () => data.exists !== false,
    data: () => data.data || {},
    id: data.id || 'test-id',
  });
}
