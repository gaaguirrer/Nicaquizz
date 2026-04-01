/**
 * Button.jsx - Botón Reutilizable
 * 
 * Variantes: primary, secondary, outline, ghost, danger
 * Tamaños: sm, md, lg, xl
 */

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg, xl
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  fullWidth = false,
  className = ''
}) {
  const variants = {
    primary: 'bg-[#2D5A27] text-white hover:bg-[#154212] focus:ring-[#2D5A27]',
    secondary: 'bg-[#F4C430] text-[#1d1d03] hover:bg-[#ffdf90] focus:ring-[#F4C430]',
    outline: 'border-2 border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/10 focus:ring-[#2D5A27]',
    ghost: 'text-[#2D5A27] hover:bg-[#2D5A27]/10 focus:ring-[#2D5A27]',
    danger: 'bg-[#C41E3A] text-white hover:bg-[#a40029] focus:ring-[#C41E3A]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
    xl: 'px-10 py-5 text-xl gap-3'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-xl font-bold font-headline
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2
        active:scale-[0.98]
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
      ) : (
        <>
          {leftIcon && (
            <span className="material-symbols-outlined">{leftIcon}</span>
          )}
          {children}
          {rightIcon && (
            <span className="material-symbols-outlined">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
}
