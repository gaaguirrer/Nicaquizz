/**
 * Validador de Contraseñas
 */

import type { ValidationResult } from './email.validator';

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/;

export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'La contraseña es requerida' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, message: 'La contraseña es demasiado larga' };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra y un número'
    };
  }

  return { valid: true };
}
