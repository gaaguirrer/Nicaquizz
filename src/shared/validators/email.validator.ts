/**
 * Validador de Email
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'El email es requerido' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'El email no tiene un formato válido' };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, message: 'El email es demasiado largo' };
  }

  return { valid: true };
}
