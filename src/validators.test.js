/**
 * Tests para funciones de validación
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateTrade,
  validateQuestion,
  validateAchioteExchange,
  sanitizeString,
  validateRequired
} from '../validators';

describe('Validadores', () => {
  describe('validateEmail', () => {
    it('debe validar emails correctos', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
      expect(validateEmail('user.name@domain.org').valid).toBe(true);
    });

    it('debe rechazar emails incorrectos', () => {
      expect(validateEmail('invalid').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
    });

    it('debe rechazar emails vacíos', () => {
      expect(validateEmail('').valid).toBe(false);
      expect(validateEmail(null).valid).toBe(false);
      expect(validateEmail(undefined).valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('debe validar contraseñas seguras', () => {
      expect(validatePassword('password1').valid).toBe(true);
      expect(validatePassword('Secure123').valid).toBe(true);
    });

    it('debe rechazar contraseñas cortas', () => {
      expect(validatePassword('12345').valid).toBe(false);
      expect(validatePassword('abcde').valid).toBe(false);
    });

    it('debe rechazar contraseñas sin números', () => {
      expect(validatePassword('password').valid).toBe(false);
    });

    it('debe rechazar contraseñas sin letras', () => {
      expect(validatePassword('123456').valid).toBe(false);
    });
  });

  describe('validateTrade', () => {
    it('debe validar trueques correctos', () => {
      const trade = {
        offeredIngredient: 'masa',
        offeredAmount: 5,
        requestedIngredient: 'cerdo',
        requestedAmount: 3
      };
      expect(validateTrade(trade).valid).toBe(true);
    });

    it('debe rechazar trueques del mismo ingrediente', () => {
      const trade = {
        offeredIngredient: 'masa',
        offeredAmount: 5,
        requestedIngredient: 'masa',
        requestedAmount: 3
      };
      expect(validateTrade(trade).valid).toBe(false);
    });

    it('debe rechazar cantidades inválidas', () => {
      const trade1 = {
        offeredIngredient: 'masa',
        offeredAmount: 0,
        requestedIngredient: 'cerdo',
        requestedAmount: 3
      };
      expect(validateTrade(trade1).valid).toBe(false);

      const trade2 = {
        offeredIngredient: 'masa',
        offeredAmount: 5,
        requestedIngredient: 'cerdo',
        requestedAmount: 101
      };
      expect(validateTrade(trade2).valid).toBe(false);
    });
  });

  describe('validateQuestion', () => {
    it('debe validar preguntas correctas', () => {
      const question = {
        text: '¿Cuál es la capital de Nicaragua?',
        options: ['Managua', 'León', 'Granada', 'Masaya'],
        correctAnswer: 0,
        categoryId: 'geografia',
        difficulty: 'easy'
      };
      expect(validateQuestion(question).valid).toBe(true);
    });

    it('debe rechazar preguntas con menos de 4 opciones', () => {
      const question = {
        text: '¿Pregunta con pocas opciones?',
        options: ['Opción 1', 'Opción 2', 'Opción 3'],
        correctAnswer: 0,
        categoryId: 'historia',
        difficulty: 'medium'
      };
      expect(validateQuestion(question).valid).toBe(false);
    });

    it('debe rechazar categoría inválida', () => {
      const question = {
        text: '¿Pregunta?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        categoryId: 'invalida',
        difficulty: 'easy'
      };
      expect(validateQuestion(question).valid).toBe(false);
    });
  });

  describe('validateAchioteExchange', () => {
    it('debe validar canjes correctos', () => {
      expect(validateAchioteExchange(1, 'masa').valid).toBe(true);
      expect(validateAchioteExchange(5, 'cerdo').valid).toBe(true);
    });

    it('debe rechazar ingrediente inválido', () => {
      expect(validateAchioteExchange(1, 'achiote').valid).toBe(false);
      expect(validateAchioteExchange(1, 'invalido').valid).toBe(false);
    });

    it('debe rechazar cantidad inválida', () => {
      expect(validateAchioteExchange(0, 'masa').valid).toBe(false);
      expect(validateAchioteExchange(101, 'masa').valid).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('debe escapar caracteres peligrosos', () => {
      expect(sanitizeString('<script>')).toBe('&lt;script&gt;');
      expect(sanitizeString('test"quote"')).toBe('test&quot;quote&quot;');
    });

    it('debe manejar strings sin caracteres especiales', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
    });

    it('debe manejar null y undefined', () => {
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(undefined);
    });
  });

  describe('validateRequired', () => {
    it('debe validar campos requeridos', () => {
      expect(validateRequired('value', 'Campo').valid).toBe(true);
      expect(validateRequired(0, 'Campo').valid).toBe(true);
      expect(validateRequired(false, 'Campo').valid).toBe(true);
    });

    it('debe rechazar campos vacíos', () => {
      expect(validateRequired('', 'Campo').valid).toBe(false);
      expect(validateRequired('   ', 'Campo').valid).toBe(false);
      expect(validateRequired(null, 'Campo').valid).toBe(false);
      expect(validateRequired(undefined, 'Campo').valid).toBe(false);
    });
  });
});
