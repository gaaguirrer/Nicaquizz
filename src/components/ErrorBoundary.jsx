/**
 * ErrorBoundary.jsx - Captura Errores de React
 * 
 * Previene que la app colapse por un error.
 * Reporta errores a Sentry y muestra UI amigable.
 */

import { Component } from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log a Sentry
    Sentry.withScope((scope) => {
      scope.setTag('react_component', this.constructor.name);
      scope.setContext('react', {
        componentStack: errorInfo.componentStack
      });
      
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });

    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, eventId: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fefccf] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-[#C41E3A]">
            {/* Ícono de error */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#C41E3A]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-[#C41E3A]">error</span>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-black font-headline text-[#154212] mb-2">
              ¡Algo salió mal!
            </h1>

            {/* Mensaje */}
            <p className="text-[#42493e] mb-6">
              Hemos registrado el error y nuestro equipo lo revisará pronto.
            </p>

            {/* ID del error (para debugging) */}
            {this.state.eventId && (
              <div className="bg-[#154212]/5 rounded-xl p-4 mb-6">
                <p className="text-xs text-[#42493e]/60 mb-1">ID del Error</p>
                <code className="text-sm font-mono text-[#154212]">
                  {this.state.eventId}
                </code>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#154212] transition-colors"
              >
                Recargar Página
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-[#154212]/5 text-[#154212] px-6 py-3 rounded-xl font-bold hover:bg-[#154212]/10 transition-colors"
              >
                Volver Atrás
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-[#154212]/10">
              <p className="text-xs text-[#42493e]/60">
                ¿El problema persiste?{' '}
                <a
                  href="mailto:soporte@nicaquizz.com"
                  className="text-[#2D5A27] font-bold hover:underline"
                >
                  Contáctanos
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Inicializar Sentry
 */
export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      
      // Integraciones
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true
        })
      ],

      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% de las transacciones

      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Environment
      environment: 'production',

      // Breadcrumbs
      beforeBreadcrumb: (breadcrumb) => {
        // Filtrar breadcrumbs sensibles
        if (breadcrumb.category === 'console') {
          return null;
        }
        return breadcrumb;
      },

      // Filter sensitive data
      beforeSend: (event, hint) => {
        // Remover datos sensibles del event
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      }
    });
  }
}

export default ErrorBoundary;
