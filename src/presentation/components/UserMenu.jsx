import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icono de monedas (nacatamal) - SVG personalizado
const CoinIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className}>
    <circle cx="32" cy="32" r="28" fill="#FFD700" stroke="#DAA520" strokeWidth="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#FFA500" strokeWidth="2"/>
    <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#DAA520">$</text>
  </svg>
);

// Iconos SVG para ingredientes
const IngredientIcon = ({ type, className = '' }) => {
  const icons = {
    masa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="32" rx="12" ry="20" fill="#F4C430" stroke="#D4A017" strokeWidth="2"/>
        <circle cx="28" cy="28" r="3" fill="#E8B830"/>
        <circle cx="36" cy="28" r="3" fill="#E8B830"/>
        <circle cx="28" cy="36" r="3" fill="#E8B830"/>
        <circle cx="36" cy="36" r="3" fill="#E8B830"/>
        <circle cx="32" cy="32" r="3" fill="#E8B830"/>
      </svg>
    ),
    cerdo: (
      <svg viewBox="0 0 64 64" className={className}>
        <rect x="16" y="20" width="32" height="24" rx="4" fill="#FF6B6B" stroke="#CC5555" strokeWidth="2"/>
        <rect x="20" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
        <rect x="34" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
      </svg>
    ),
    arroz: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="40" rx="24" ry="12" fill="#F5F5F5" stroke="#DDD" strokeWidth="2"/>
        <ellipse cx="24" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(-30 24 38)"/>
        <ellipse cx="32" cy="36" rx="4" ry="8" fill="#FFF"/>
        <ellipse cx="40" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(30 40 38)"/>
      </svg>
    ),
    papa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="34" rx="20" ry="16" fill="#C9A959" stroke="#9A7B4A" strokeWidth="2"/>
        <circle cx="26" cy="30" r="3" fill="#8B6F47"/>
        <circle cx="38" cy="32" r="2" fill="#8B6F47"/>
        <circle cx="32" cy="40" r="2" fill="#8B6F47"/>
      </svg>
    ),
    chile: (
      <svg viewBox="0 0 64 64" className={className}>
        <path d="M32 12 Q36 8 40 12 L44 18 Q48 24 44 34 Q40 46 34 52 Q28 56 26 52 Q24 48 28 40 Q32 30 34 22 Q36 16 32 12Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
        <path d="M32 12 Q30 8 28 10 L26 14 Q28 16 32 12Z" fill="#27AE60"/>
      </svg>
    )
  };
  return icons[type] || null;
};

/**
 * Componente UserMenu - Menú desplegable con avatar del usuario
 * Se muestra en la esquina superior derecha cuando el usuario está logueado
 */
export default function UserMenu() {
  const { currentUser, userData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowWallet(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular nacatamales completos
  const coins = userData?.coins || {};
  const nacatamalesCount = Math.min(
    coins.masa || 0,
    coins.cerdo || 0,
    coins.arroz || 0,
    coins.papa || 0,
    coins.chile || 0
  );

  // Obtener datos del usuario
  const userPhoto = currentUser?.photoURL || null;
  const displayName = currentUser?.displayName || userData?.displayName || 'Usuario';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowWallet(false);
    }
  };

  const toggleWallet = (e) => {
    e.stopPropagation();
    setShowWallet(!showWallet);
  };

  return (
    <div className="relative" ref={menuRef} style={{ zIndex: 9999 }}>
      {/* Botón con avatar del usuario */}
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {/* Avatar del usuario - Círculo con primera letra */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border-2 border-indigo-400">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {firstLetter}
            </span>
          )}
        </div>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden animate-fade-in"
          style={{ zIndex: 10000 }}
        >
          {/* Header con info del usuario */}
          <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-indigo-400">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">{firstLetter}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{displayName}</p>
                <p className="text-gray-400 text-xs truncate">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Mostrar monedero o menú principal */}
          {showWallet ? (
            /* Vista del monedero */
            <div className="p-4">
              <button
                onClick={toggleWallet}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span className="text-sm">Volver al menú</span>
              </button>

              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">account_balance_wallet</span>
                Monedero
              </h3>

              {/* Nacatamales completos */}
              <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-3 mb-3 border border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-300 text-sm font-medium">Nacatamales</span>
                  <span className="text-green-400 font-bold text-lg">{nacatamalesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CoinIcon className="w-5 h-5" />
                  <span className="text-xs text-green-200">
                    {nacatamalesCount} nacatamal{nacatamalesCount !== 1 ? 'es' : ''} complet{nacatamalesCount !== 1 ? 'os' : 'o'}
                  </span>
                </div>
              </div>

              {/* Ingredientes individuales */}
              <div className="space-y-2">
                {Object.entries(coins).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <IngredientIcon type={key} className="w-6 h-6" />
                      <span className="text-gray-300 text-sm capitalize">{key}</span>
                    </div>
                    <span className="text-white font-bold">{value || 0}</span>
                  </div>
                ))}
              </div>

              {/* Botón ir a tienda */}
              {nacatamalesCount > 0 && (
                <Link
                  to="/shop"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-center py-2 rounded-lg font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">storefront</span>
                  Ir a la Tienda
                </Link>
              )}
            </div>
          ) : (
            /* Menú principal */
            <div className="p-2">
              {/* Opción Inicio */}
              <Link
                to="/play"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/70 transition-colors group"
              >
                <span className="material-symbols-outlined text-indigo-400 group-hover:text-indigo-300">home</span>
                <span className="text-gray-200 font-medium">Inicio</span>
              </Link>

              {/* Opción Monedero */}
              <button
                onClick={toggleWallet}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/70 transition-colors group text-left"
              >
                <span className="material-symbols-outlined text-green-400 group-hover:text-green-300">account_balance_wallet</span>
                <span className="text-gray-200 font-medium">Monedero</span>
                {nacatamalesCount > 0 && (
                  <span className="ml-auto bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {nacatamalesCount}
                  </span>
                )}
              </button>

              {/* Opción Amigos */}
              <Link
                to="/friends"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/70 transition-colors group"
              >
                <span className="material-symbols-outlined text-blue-400 group-hover:text-blue-300">group</span>
                <span className="text-gray-200 font-medium">Amigos</span>
              </Link>

              {/* Opción Tienda */}
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/70 transition-colors group"
              >
                <span className="material-symbols-outlined text-yellow-400 group-hover:text-yellow-300">storefront</span>
                <span className="text-gray-200 font-medium">Tienda</span>
              </Link>

              {/* Separador */}
              <div className="border-t border-gray-700 my-2"></div>

              {/* Opción Cuenta */}
              <Link
                to="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/70 transition-colors group"
              >
                <span className="material-symbols-outlined text-purple-400 group-hover:text-purple-300">person</span>
                <span className="text-gray-200 font-medium">Cuenta</span>
              </Link>

              {/* Opción Perfil */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700/70 transition-colors group"
              >
                <span className="material-symbols-outlined text-blue-400 group-hover:text-blue-300">badge</span>
                <span className="text-gray-200 font-medium">Perfil</span>
              </Link>

              {/* Separador */}
              <div className="border-t border-gray-700 my-2"></div>

              {/* Opción Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-900/50 transition-colors group text-left"
              >
                <span className="material-symbols-outlined text-red-400 group-hover:text-red-300">logout</span>
                <span className="text-red-400 font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
