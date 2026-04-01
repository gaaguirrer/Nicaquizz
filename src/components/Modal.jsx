/**
 * Modal.jsx - Ventana Modal
 * 
 * Tamaños: sm, md, lg, xl, full
 * Se cierra con Escape, clic fuera, o botón X.
 * Incluye: ModalHeader, ModalBody, ModalFooter
 */

import { useEffect } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  size = 'md', // sm, md, lg, xl, full
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}) {
  // Cerrar con Escape
  useEffect(() => {
    function handleEscape(e) {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95vh]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
          closeOnBackdrop ? 'cursor-pointer' : ''
        }`}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} ${
          size === 'full' ? 'overflow-auto' : 'max-h-[90vh] overflow-y-auto'
        } animate-[slideIn_0.3s_ease-out]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-[#154212]/10">
            <div>
              {title && (
                <h2 id="modal-title" className="text-2xl font-black font-headline text-[#154212]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-[#42493e]/60 mt-1">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#154212]/10 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Animación */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ModalHeader - Subcomponente opcional para encabezado personalizado
 */
export function ModalHeader({ children, onClose }) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-[#154212]/10">
      {children}
      {onClose && (
        <button 
          onClick={onClose}
          className="p-2 hover:bg-[#154212]/10 rounded-full transition-colors"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * ModalBody - Subcomponente opcional para cuerpo personalizado
 */
export function ModalBody({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ModalFooter - Subcomponente opcional para pie personalizado
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`p-6 pt-0 border-t border-[#154212]/10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * FeedbackModal - Modal de feedback para respuestas correctas/incorrectas
 */
export function FeedbackModal({ isOpen, onClose, isCorrect, ingrediente }) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
    >
      <div className="text-center py-4">
        <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <span className={`material-symbols-outlined text-5xl ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect ? 'check_circle' : 'cancel'}
          </span>
        </div>
        <h3 className={`text-2xl font-black font-headline mb-2 ${
          isCorrect ? 'text-green-600' : 'text-red-600'
        }`}>
          {isCorrect ? '¡Correcto!' : 'Incorrecto'}
        </h3>
        <p className="text-[#42493e] mb-6">
          {isCorrect 
            ? `¡Has ganado un ${ingrediente}!` 
            : 'Sigue intentando, ¡tú puedes!'}
        </p>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-white ${
            isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Continuar
        </button>
      </div>
    </Modal>
  );
}

/**
 * ResultModal - Modal de resultados finales
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
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resultado Final"
      size="md"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Puntuación */}
        <div className="bg-[#154212]/5 rounded-2xl p-6 mb-6">
          <p className="text-sm text-[#42493e]/60 mb-2">Tu puntuación</p>
          <p className="text-5xl font-black font-headline text-[#154212] mb-1">
            {score}/{total}
          </p>
          <p className={`text-lg font-bold ${
            percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {percentage}% de precisión
          </p>
        </div>

        {/* Recompensa */}
        {ingrediente && (
          <div className="bg-[#F4C430]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#755b00] mb-2">Recompensa obtenida</p>
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#F4C430]">bakery_dining</span>
              <span className="font-bold text-[#154212]">1 {ingrediente}</span>
            </div>
          </div>
        )}

        {/* Nacatamales */}
        {nacatamales !== undefined && (
          <div className="bg-[#2D5A27]/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#154212]/60 mb-2">Nacatamales completados</p>
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#2D5A27]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <span className="font-bold text-[#154212]">{nacatamales}</span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-4">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl font-bold border-2 border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/10 transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold bg-[#2D5A27] text-white hover:bg-[#154212] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </Modal>
  );
}
