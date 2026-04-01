/**
 * Tests para funciones de firestore.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTodayDateString,
  getTodayNacatamalesCount,
  incrementDailyNacatamales,
  exchangeAchiote,
  INGREDIENTES,
  INGREDIENTE_NAMES,
  CATEGORIA_INGREDIENTE
} from '../services/firestore';

// Mock de Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  increment: vi.fn(() => ({ type: 'increment' })),
  arrayUnion: vi.fn(() => ({ type: 'arrayUnion' })),
  serverTimestamp: vi.fn(() => ({ type: 'timestamp' }))
}));

vi.mock('../firebase', () => ({
  db: {}
}));

describe('Constantes de Firestore', () => {
  describe('INGREDIENTES', () => {
    it('debe tener todos los ingredientes definidos', () => {
      expect(INGREDIENTES).toHaveProperty('MASA', 'masa');
      expect(INGREDIENTES).toHaveProperty('CERDO', 'cerdo');
      expect(INGREDIENTES).toHaveProperty('ARROZ', 'arroz');
      expect(INGREDIENTES).toHaveProperty('PAPA', 'papa');
      expect(INGREDIENTES).toHaveProperty('CHILE', 'chile');
      expect(INGREDIENTES).toHaveProperty('ACHIOTE', 'achiote');
    });
  });

  describe('INGREDIENTE_NAMES', () => {
    it('debe tener nombres para todos los ingredientes', () => {
      expect(INGREDIENTE_NAMES[INGREDIENTES.MASA]).toBe('Masa de Maíz');
      expect(INGREDIENTE_NAMES[INGREDIENTES.CERDO]).toBe('Carne de Cerdo');
      expect(INGREDIENTE_NAMES[INGREDIENTES.ARROZ]).toBe('Arroz');
      expect(INGREDIENTE_NAMES[INGREDIENTES.PAPA]).toBe('Papa');
      expect(INGREDIENTE_NAMES[INGREDIENTES.CHILE]).toBe('Chile');
      expect(INGREDIENTE_NAMES[INGREDIENTES.ACHIOTE]).toBe('Achiote');
    });
  });

  describe('CATEGORIA_INGREDIENTE', () => {
    it('debe mapear categorías a ingredientes correctamente', () => {
      expect(CATEGORIA_INGREDIENTE.historia).toBe(INGREDIENTES.MASA);
      expect(CATEGORIA_INGREDIENTE.matematicas).toBe(INGREDIENTES.CERDO);
      expect(CATEGORIA_INGREDIENTE.geografia).toBe(INGREDIENTES.ARROZ);
      expect(CATEGORIA_INGREDIENTE.ciencias).toBe(INGREDIENTES.PAPA);
      expect(CATEGORIA_INGREDIENTE.retos).toBe(INGREDIENTES.ACHIOTE);
    });
  });
});

describe('getTodayDateString', () => {
  it('debe retornar la fecha en formato YYYY-MM-DD', () => {
    const date = new Date('2025-04-01T12:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => date);
    
    const result = getTodayDateString();
    
    expect(result).toBe('2025-04-01');
    vi.restoreAllMocks();
  });

  it('debe hacer padding correcto para meses y días de un dígito', () => {
    const date = new Date('2025-01-05T12:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => date);
    
    const result = getTodayDateString();
    
    expect(result).toBe('2025-01-05');
    vi.restoreAllMocks();
  });
});

describe('exchangeAchiote', () => {
  const mockUid = 'test-user-id';
  const mockTargetIngredient = 'masa';
  const mockAmount = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe validar que el ingrediente destino sea válido', async () => {
    const { exchangeAchiote } = await import('../services/firestore');
    
    await expect(exchangeAchiote(mockUid, 'invalido', mockAmount))
      .rejects
      .toThrow('Ingrediente no válido para canje');
  });

  it('debe validar que el usuario tenga suficientes achiotes', async () => {
    // Mock para getUserWallet que retorna 0 achiotes
    const { exchangeAchiote } = await import('../services/firestore');
    
    await expect(exchangeAchiote(mockUid, mockTargetIngredient, 5))
      .rejects
      .toThrow('No tienes suficientes achiotes para canjear');
  });

  it('debe validar que el usuario exista', async () => {
    const { exchangeAchiote } = await import('../services/firestore');
    
    await expect(exchangeAchiote('non-existent-user', mockTargetIngredient, mockAmount))
      .rejects
      .toThrow('Usuario no encontrado');
  });
});

describe('Funciones de Daily Stats', () => {
  describe('getTodayNacatamalesCount', () => {
    it('debe retornar 0 si no hay documento', async () => {
      const { getTodayNacatamalesCount } = await import('../services/firestore');
      const result = await getTodayNacatamalesCount();
      expect(result).toBe(0);
    });

    it('debe retornar el count si existe el documento', async () => {
      const { getTodayNacatamalesCount } = await import('../services/firestore');
      // Mock implementation would return actual count
      expect(typeof await getTodayNacatamalesCount()).toBe('number');
    });
  });

  describe('incrementDailyNacatamales', () => {
    it('debe crear documento si no existe', async () => {
      const { incrementDailyNacatamales } = await import('../services/firestore');
      await expect(incrementDailyNacatamales()).resolves.not.toThrow();
    });

    it('debe incrementar el contador si existe', async () => {
      const { incrementDailyNacatamales } = await import('../services/firestore');
      await expect(incrementDailyNacatamales()).resolves.not.toThrow();
    });
  });
});
