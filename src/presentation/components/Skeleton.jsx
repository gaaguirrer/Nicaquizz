/**
 * Skeleton.jsx - Placeholder de Carga
 * 
 * Variantes: text, circular, rectangular, rounded
 * Incluye: CardSkeleton, ListSkeleton, GridSkeleton
 */

export default function Skeleton({
  variant = 'text', // text, circular, rectangular, rounded
  width = '100%',
  height = '1rem',
  className = ''
}) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl'
  };

  return (
    <div
      className={`bg-[#154212]/10 animate-pulse ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * CardSkeleton - Skeleton predefinido para Cards
 */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-[#154212]/5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height="20px" />
          <Skeleton variant="text" width="40%" height="16px" />
        </div>
      </div>
      
      {/* Body */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={`${100 - (i * 10)}%`} 
            height="16px" 
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[#154212]/10">
        <Skeleton variant="rounded" width="100%" height="44px" />
      </div>
    </div>
  );
}

/**
 * ListSkeleton - Skeleton predefinido para Listas
 */
export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" height="18px" />
            <Skeleton variant="text" width="50%" height="14px" />
          </div>
          <Skeleton variant="rounded" width="80px" height="36px" />
        </div>
      ))}
    </div>
  );
}

/**
 * GridSkeleton - Skeleton predefinido para Grids
 */
export function GridSkeleton({ columns = 3, items = 6 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} lines={2} />
      ))}
    </div>
  );
}
