/**
 * authErrors.js - Centralized Firebase Auth Error Mapping
 *
 * Translates Firebase SDK error codes into user-friendly messages
 * following UX/UI best practices for educational applications.
 */

const AUTH_ERROR_MESSAGES = {
  // Credential errors
  'auth/invalid-credential': 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
  'auth/wrong-password': 'La contraseña es incorrecta. Verifica e intenta de nuevo.',
  'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
  'auth/invalid-email': 'El correo electrónico no tiene un formato válido.',
  'auth/email-already-in-use': 'Este correo ya esta registrado. Se ha recuperado tu cuenta automaticamente.',
  'auth/email-already-in-use-recovery': 'Este correo ya esta registrado con otra contrasena. Intenta iniciar sesion.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',

  // Session/Token errors
  'auth/requires-recent-login': 'Por seguridad, debes cerrar sesión y volver a iniciar para realizar esta acción.',
  'auth/user-token-expired': 'Tu sesión expiró. Por favor inicia sesión nuevamente.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta a soporte.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Espera un momento e intenta de nuevo.',

  // Operation errors
  'auth/operation-not-allowed': 'Esta función no está habilitada. Contacta a soporte.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet e intenta de nuevo.',
  'auth/popup-blocked': 'La ventana emergente fue bloqueada. Permite popups en tu navegador.',
  'auth/popup-closed-by-user': 'Ventana cerrada antes de completar el inicio de sesión.',
  'auth/cancelled-popup-request': 'La ventana emergente fue cancelada.',
  'auth/account-exists-with-different-credential': 'Este correo ya está registrado con otro método de inicio de sesión.',

  // Configuration errors
  'auth/invalid-api-key': 'Error de configuración del servicio. Contacta a soporte.',
  'auth/app-not-authorized': 'La aplicación no está autorizada para usar Firebase.',
  'auth/invalid-credential-type': 'Tipo de credencial no válido.',
  'auth/unsupported-first-factor': 'Método de autenticación no soportado.',

  // Generic fallback
  'auth/unknown': 'Ocurrió un error inesperado. Por favor intenta de nuevo más tarde.'
};

const DEFAULT_MESSAGE = 'Ocurrió un error. Por favor verifica tus datos e intenta de nuevo.';

/**
 * Translates a Firebase Auth error code to a user-friendly message
 * @param {Error|string} error - Firebase error object or error code string
 * @returns {string} User-friendly error message in Spanish
 */
export function getAuthErrorMessage(error) {
  if (!error) return DEFAULT_MESSAGE;

  const errorCode = typeof error === 'string' ? error : error.code;
  const errorMessage = typeof error === 'string' ? null : error.message;

  if (errorCode && AUTH_ERROR_MESSAGES[errorCode]) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }

  if (errorMessage && !errorMessage.startsWith('Firebase:')) {
    return errorMessage;
  }

  return DEFAULT_MESSAGE;
}

/**
 * Categorizes a Firebase error for UI styling purposes
 * @param {Error|string} error - Firebase error object or error code string
 * @returns {'credentials' | 'network' | 'session' | 'configuration' | 'unknown'} Error category
 */
export function getAuthErrorCategory(error) {
  if (!error) return 'unknown';

  const errorCode = typeof error === 'string' ? error : error.code;

  if (!errorCode) return 'unknown';

  const credentialErrors = [
    'auth/invalid-credential',
    'auth/wrong-password',
    'auth/user-not-found',
    'auth/invalid-email',
    'auth/email-already-in-use',
    'auth/weak-password',
    'auth/too-many-requests'
  ];

  const networkErrors = [
    'auth/network-request-failed'
  ];

  const sessionErrors = [
    'auth/requires-recent-login',
    'auth/user-token-expired',
    'auth/user-disabled'
  ];

  const configurationErrors = [
    'auth/operation-not-allowed',
    'auth/invalid-api-key',
    'auth/app-not-authorized',
    'auth/invalid-credential-type',
    'auth/unsupported-first-factor'
  ];

  if (credentialErrors.includes(errorCode)) return 'credentials';
  if (networkErrors.includes(errorCode)) return 'network';
  if (sessionErrors.includes(errorCode)) return 'session';
  if (configurationErrors.includes(errorCode)) return 'configuration';

  return 'unknown';
}

/**
 * Gets the appropriate Material Icon for an error category
 * @param {Error|string} error - Firebase error object or error code string
 * @returns {string} Material Icons icon name
 */
export function getAuthErrorIcon(error) {
  const category = getAuthErrorCategory(error);

  const iconMap = {
    credentials: 'lock_person',
    network: 'signal_wifi_connected_no_internet_4',
    session: 'manage_accounts',
    configuration: 'settings_alert',
    unknown: 'error_outline'
  };

  return iconMap[category] || iconMap.unknown;
}

/**
 * Gets severity level for UI display
 * @param {Error|string} error - Firebase error object or error code string
 * @returns {'low' | 'medium' | 'high'} Severity level
 */
export function getAuthErrorSeverity(error) {
  const category = getAuthErrorCategory(error);

  const severityMap = {
    credentials: 'medium',
    network: 'medium',
    session: 'high',
    configuration: 'high',
    unknown: 'low'
  };

  return severityMap[category] || 'low';
}

export default getAuthErrorMessage;
