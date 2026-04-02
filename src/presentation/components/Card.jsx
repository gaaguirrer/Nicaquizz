/**
 * Card.jsx - Contenedor de Tarjeta
 * 
 * Variantes: default, elevated, outlined, filled
 * Incluye: CardHeader, CardBody, CardFooter
 */

export default function Card({ 
  children, 
  variant = 'default', // default, elevated, outlined, filled
  className = '',
  onClick,
  hover = false,
  padding = 'md' // sm, md, lg
}) {
  const variants = {
    default: 'bg-white border-2 border-[#154212]/5',
    elevated: 'bg-white shadow-[0_8px_32px_rgba(29,29,3,0.08)]',
    outlined: 'bg-transparent border-2 border-[#154212]/20',
    filled: 'bg-[#154212]/5 border-2 border-[#154212]/10'
  };

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`
        rounded-2xl 
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(29,29,3,0.12)] transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader - Subcomponente para el encabezado de Card
 */
export function CardHeader({ 
  title, 
  subtitle, 
  icon, 
  iconColor = 'text-[#2D5A27]',
  action 
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
          </div>
        )}
        <div>
          {title && <h3 className="text-xl font-bold font-headline text-[#154212]">{title}</h3>}
          {subtitle && <p className="text-sm text-[#42493e]/60">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * CardBody - Subcomponente para el cuerpo de Card
 */
export function CardBody({ children, className = '' }) {
  return (
    <div className={`text-[#42493e] ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardFooter - Subcomponente para el pie de Card
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-6 border-t border-[#154212]/10 ${className}`}>
      {children}
    </div>
  );
}
