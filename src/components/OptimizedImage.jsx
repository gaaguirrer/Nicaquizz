/**
 * OptimizedImage.jsx - Componente de Imagen Optimizada para NicaQuizz
 * 
 * Características:
 * - Lazy loading nativo
 * - Placeholder mientras carga
 * - Manejo de errores con fallback
 * - Soporte para avatar con iniciales
 * 
 * Uso:
 * <OptimizedImage src="url.jpg" alt="Descripción" className="w-16 h-16 rounded-full" />
 * <OptimizedImage avatar="John Doe" className="w-16 h-16 rounded-full" />
 */

import { useState } from 'react';
import Skeleton from './Skeleton';

export default function OptimizedImage({
  src,
  alt = '',
  avatar,
  className = '',
  fallbackType = 'gray' // gray, initials, icon
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Si es avatar y no hay src, mostrar iniciales
  if (avatar && !src) {
    const initials = avatar
      .split(' ')
      .map(name => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div
        className={`bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white font-bold ${className}`}
        aria-label={avatar}
      >
        {initials}
      </div>
    );
  }

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {loading && (
        <Skeleton
          variant="rectangular"
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Imagen */}
      {!error ? (
        <img
          src={src}
          alt={alt || avatar || ''}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover ${
            loading ? 'invisible' : 'visible'
          }`}
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        /* Fallback */
        <div className={`w-full h-full flex items-center justify-center ${
          fallbackType === 'icon' 
            ? 'bg-[#154212]/10' 
            : 'bg-gradient-to-br from-gray-300 to-gray-400'
        }`}>
          {fallbackType === 'icon' ? (
            <span className="material-symbols-outlined text-[#154212]/40">
              {avatar ? 'person' : 'image'}
            </span>
          ) : (
            <span className="text-white font-bold text-lg">
              {avatar
                ?.split(' ')
                .map(name => name.charAt(0))
                .slice(0, 2)
                .join('')
                .toUpperCase() || '?'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Avatar - Componente especializado para avatares de usuario
 */
export function Avatar({
  user,
  size = 'md', // sm, md, lg, xl
  showOnline = false,
  className = ''
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const photoURL = user?.photoURL;
  const displayName = user?.displayName || user?.email || 'Usuario';

  return (
    <div className={`relative inline-block ${className}`}>
      <OptimizedImage
        src={photoURL}
        avatar={displayName}
        className={`${sizes[size]} rounded-full border-2 border-white shadow-md`}
        fallbackType="initials"
      />
      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
            user?.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
          aria-label={user?.isOnline ? 'En línea' : 'Sin línea'}
        />
      )}
    </div>
  );
}

/**
 * ImageGallery - Galería de imágenes con lazy loading
 */
export function ImageGallery({ images = [], columns = 3, className = '' }) {
  return (
    <div
      className={`grid grid-cols-${columns} gap-2 ${className}`}
      role="list"
    >
      {images.map((src, index) => (
        <OptimizedImage
          key={index}
          src={src}
          alt={`Imagen ${index + 1}`}
          className="aspect-square rounded-xl"
          fallbackType="icon"
        />
      ))}
    </div>
  );
}
