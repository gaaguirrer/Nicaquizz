import { useEffect } from 'react';

/**
 * Componente Modal reutilizable para NicaQuizz
 * Muestra diálogos para feedback, resultados y confirmaciones
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'default',
  showCloseButton = true 
}) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tipos de modal con sus estilos
  const typeStyles = {
    default: 'border-nica-amarillo',
    success: 'border-green-500',
    error: 'border-nica-rojo',
    warning: 'border-orange-500',
    info: 'border-nica-azul',
  };

  const titleStyles = {
    default: 'text-nica-amarillo',
    success: 'text-green-400',
    error: 'text-nica-rojo',
    warning: 'text-orange-400',
    info: 'text-nica-azul',
  };

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`modal-content ${typeStyles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            id="modal-title"
            className={`text-3xl font-display ${titleStyles[type]}`}
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              aria-label="Cerrar"
            >
              <span className="material-symbols-rounded text-2xl">close</span>
            </button>
          )}
        </div>

        {/* Contenido del Modal */}
        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal de Feedback de Acierto
 * Muestra el ingrediente ganado con animación
 */
export function FeedbackModal({ isOpen, onClose, ingrediente, isCorrect }) {
  const icons = {
    masa: '🌽',
    cerdo: '🥩',
    arroz: '🍚',
    papa: '🥔',
    chile: '🌶️',
  };

  const colors = {
    masa: 'from-amber-500 to-yellow-600',
    cerdo: 'from-pink-500 to-red-600',
    arroz: 'from-gray-300 to-gray-400',
    papa: 'from-yellow-600 to-amber-700',
    chile: 'from-green-500 to-red-600',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCorrect ? '¡Correcto!' : '¡Incorrecto!'}
      type={isCorrect ? 'success' : 'error'}
      showCloseButton={false}
    >
      <div className="text-center">
        {isCorrect && ingrediente && (
          <>
            <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${colors[ingrediente]} flex items-center justify-center animate-glow`}>
              <span className="text-6xl">{icons[ingrediente]}</span>
            </div>
            <p className="text-xl mb-2">
              ¡Ganaste <strong className="text-nica-amarillo">{ingrediente}</strong>!
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Sigue así para completar tu nacatamal
            </p>
          </>
        )}
        
        {!isCorrect && (
          <>
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <span className="material-symbols-rounded text-6xl text-gray-400">cancel</span>
            </div>
            <p className="text-xl mb-2">¡Sigue intentando!</p>
            <p className="text-gray-400 text-sm mb-6">
              Cada error es una oportunidad de aprender
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          {isCorrect ? '¡Continuar!' : 'Siguiente Pregunta'}
        </button>
      </div>
    </Modal>
  );
}

/**
 * Modal de Fin de Partida
 * Muestra resumen de puntos e ingredientes ganados
 */
export function ResultModal({ 
  isOpen, 
  onClose, 
  onRetry, 
  score, 
  total, 
  ingrediente,
  nacatamales 
}) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  
  const getMessage = () => {
    if (percentage >= 90) return { text: '¡Excelente!', emoji: '🏆' };
    if (percentage >= 70) return { text: '¡Muy bien!', emoji: '🌟' };
    if (percentage >= 50) return { text: '¡Bien hecho!', emoji: '👍' };
    return { text: '¡Sigue practicando!', emoji: '💪' };
  };

  const message = getMessage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fin de la Partida"
      type={percentage >= 70 ? 'success' : 'info'}
    >
      <div className="text-center">
        {/* Emoji y mensaje */}
        <div className="text-6xl mb-2">{message.emoji}</div>
        <h3 className="text-2xl font-display text-white mb-4">
          {message.text}
        </h3>

        {/* Puntuación */}
        <div className="bg-gray-700/50 rounded-2xl p-6 mb-6">
          <div className="text-5xl font-display text-nica-amarillo mb-2">
            {score}/{total}
          </div>
          <div className="text-gray-400">
            {percentage}% de precisión
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4 bg-gray-600 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Ingrediente ganado */}
        {ingrediente && percentage > 0 && (
          <div className="bg-gradient-to-br from-nica-verde/20 to-nica-amarillo/20 rounded-2xl p-4 mb-6 border-2 border-nica-amarillo/50">
            <p className="text-gray-300 mb-2">Ingrediente obtenido:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">
                {ingrediente === 'masa' && '🌽'}
                {ingrediente === 'cerdo' && '🥩'}
                {ingrediente === 'arroz' && '🍚'}
                {ingrediente === 'papa' && '🥔'}
                {ingrediente === 'chile' && '🌶️'}
              </span>
              <span className="text-xl font-display text-nica-amarillo capitalize">
                {ingrediente}
              </span>
            </div>
          </div>
        )}

        {/* Nacatamales completados */}
        {nacatamales > 0 && (
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-4 mb-6 border-2 border-yellow-500/50">
            <p className="text-gray-300 mb-2">Nacatamales completados:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">💰</span>
              <span className="text-3xl font-display text-yellow-400">
                {nacatamales}
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRetry}
            className="btn-secondary"
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1">
              refresh
            </span>
            Reintentar
          </button>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1">
              home
            </span>
            Inicio
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Modal de Confirmación
 * Para acciones que requieren confirmación del usuario
 */
export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
    >
      <div className="text-center">
        <p className="text-lg mb-6">{message}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
