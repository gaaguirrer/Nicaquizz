/**
 * Button - Componente de Botón estilo cómic para NicaQuizz
 * Con sombras pronunciadas y esquinas redondeadas
 */

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) {
  // Configuración de variantes
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    comic: 'btn-comic',
    success: 'bg-green-600 hover:bg-green-500 text-white shadow-comic',
    danger: 'bg-nica-rojo hover:bg-red-600 text-white shadow-comic',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 border border-gray-600'
  };

  // Configuración de tamaños
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const baseClasses = `
    font-display font-bold rounded-xl
    transition-all duration-300
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 hover:-translate-y-0.5
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...props}
    >
      {loading && (
        <span className="material-symbols-rounded animate-spin">progress_activity</span>
      )}
      {icon && !loading && (
        <span className="material-symbols-rounded">{icon}</span>
      )}
      {children}
    </button>
  );
}

/**
 * ButtonGroup - Grupo de botones relacionados
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
}
