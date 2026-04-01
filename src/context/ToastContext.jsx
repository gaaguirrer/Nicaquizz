/**
 * ToastContext.jsx - Notificaciones Globales
 * 
 * Métodos: success, error, info, warning, handleError
 * handleError muestra mensaje amigable y opcionalmente loguea en consola.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    // handleError: Maneja errores de forma amigable
    handleError: (error, userMessage = 'Ocurrió un error', shouldLog = true) => {
      // Opcionalmente loguear el error completo para debugging
      if (shouldLog) {
        console.error(`${userMessage}:`, error);
      }
      // Mostrar mensaje amigable al usuario
      addToast(userMessage, 'error', 6000);
    }
  };

  // Iconos para cada tipo de notificación
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  // Colores para cada tipo
  const colors = {
    success: 'from-green-600 to-green-700 border-green-500',
    error: 'from-nica-rojo to-red-700 border-nica-rojo',
    info: 'from-nica-azul to-blue-700 border-nica-azul',
    warning: 'from-orange-600 to-orange-700 border-orange-500'
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Notificaciones en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} flex items-center gap-3 p-4 rounded-xl shadow-comic border-2 animate-slide-in backdrop-blur-md ${colors[toast.type]}`}
          >
            <span className="material-symbols-rounded text-2xl flex-shrink-0">
              {icons[toast.type]}
            </span>
            <p className="flex-1 text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
