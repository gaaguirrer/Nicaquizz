import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase/firebase.config';
import { convertToNacatamalManual } from '../../services/firestore';

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
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [liveCoins, setLiveCoins] = useState({});
  const [converting, setConverting] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Listener en tiempo real para monedas del usuario
  useEffect(() => {
    if (!currentUser) {
      setLiveCoins({});
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setLiveCoins(snapshot.data().coins || {});
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Cerrar menu al hacer clic fuera
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

  // Calcular nacatamales completos (usar liveCoins en tiempo real)
  const coins = liveCoins;
  const nacatamalesCount = coins.nacatamal || 0;

  // Ingredientes base
  const ingredientesBase = ['masa', 'cerdo', 'arroz', 'papa', 'chile'];
  const puedeConvertir = ingredientesBase.every(ing => (coins[ing] || 0) >= 1);

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

  // Canjear nacatamal directamente desde el monedero
  async function handleConvertirNacatamal(e) {
    e.stopPropagation();
    if (!currentUser) return;

    setConverting(true);
    try {
      const resultado = await convertToNacatamalManual(currentUser.uid);
      if (resultado.success) {
        toast.success('¡Canjeaste 5 ingredientes por 1 nacatamal!');
      }
    } catch (error) {
      toast.error(error.message || 'Error al canjear nacatamal');
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="relative" ref={menuRef} style={{ zIndex: 9999 }}>
      {/* Botón con avatar del usuario */}
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {/* Avatar del usuario - Círculo con primera letra */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center shadow-lg shadow-[#2D5A27]/30 border-2 border-[#F4C430]">
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
          className="absolute right-0 mt-2 w-72 bg-[#fefccf] rounded-xl shadow-2xl border-2 border-[#154212]/20 overflow-hidden animate-fade-in"
          style={{ zIndex: 10000 }}
        >
          {/* Header con info del usuario */}
          <div className="bg-gradient-to-r from-[#2D5A27] to-[#154212] p-4 border-b border-[#154212]/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center border-2 border-[#F4C430]">
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
                <p className="text-[#fefccf]/70 text-xs truncate">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Mostrar monedero o menú principal */}
          {showWallet ? (
            /* Vista del monedero */
            <div className="p-4 bg-[#fefccf]">
              <button
                onClick={toggleWallet}
                className="flex items-center gap-2 text-[#154212]/60 hover:text-[#154212] mb-3 transition-colors font-bold"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span className="text-sm">Volver al menú</span>
              </button>

              <h3 className="text-[#154212] font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2D5A27]">account_balance_wallet</span>
                Monedero
              </h3>

              {/* Nacatamales completos */}
              <div className="bg-gradient-to-br from-[#2D5A27]/10 to-[#154212]/10 rounded-lg p-3 mb-3 border-2 border-[#2D5A27]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[#2D5A27] text-sm font-bold">Nacatamales</span>
                  <span className="text-[#154212] font-bold text-lg">{nacatamalesCount}</span>
                </div>
              </div>

              {/* Ingredientes base */}
              <div className="mb-3">
                <p className="text-xs font-bold text-[#154212] mb-2">Ingredientes Base</p>
                <div className="space-y-1.5">
                  {ingredientesBase.map((key) => (
                    <div key={key} className="flex items-center justify-between bg-white/70 rounded-lg p-2 border border-[#154212]/10">
                      <div className="flex items-center gap-2">
                        <IngredientIcon type={key} className="w-5 h-5" />
                        <span className="text-[#154212] text-xs font-medium capitalize">{key}</span>
                      </div>
                      <span className="text-[#2D5A27] font-bold text-sm">{coins[key] || 0}</span>
                    </div>
                  ))}
                </div>
                {puedeConvertir && (
                  <button
                    onClick={handleConvertirNacatamal}
                    disabled={converting}
                    className="mt-2 block w-full bg-[#2D5A27] hover:bg-[#154212] text-white text-center py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {converting ? (
                      <>
                        <span className="material-symbols-outlined text-sm align-middle mr-1 animate-spin">progress_activity</span>
                        Canjeando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm align-middle mr-1">autorenew</span>
                        Canjear 1 Nacatamal
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Ingredientes especiales */}
              {(coins.achiote || 0) > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-[#154212] mb-2">Especiales</p>
                  <div className="flex items-center justify-between bg-white/70 rounded-lg p-2 border border-[#154212]/10">
                    <div className="flex items-center gap-2">
                      <IngredientIcon type="achiote" className="w-5 h-5" />
                      <span className="text-[#154212] text-xs font-medium capitalize">achiote</span>
                    </div>
                    <span className="text-[#D9531E] font-bold text-sm">{coins.achiote || 0}</span>
                  </div>
                </div>
              )}

              {/* Botón ir a tienda */}
              {nacatamalesCount > 0 && (
                <Link
                  to="/shop"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 block w-full bg-[#2D5A27] hover:bg-[#154212] text-white text-center py-2 rounded-lg font-bold text-xs transition-all"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">storefront</span>
                  Ir a la Tienda
                </Link>
              )}
            </div>
          ) : (
            /* Menú principal */
            <div className="p-2 bg-[#fefccf]">
              {/* Opción Inicio */}
              <Link
                to="/play"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#154212]/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-[#2D5A27] group-hover:text-[#154212]">home</span>
                <span className="text-[#154212] font-medium">Inicio</span>
              </Link>

              {/* Opción Monedero */}
              <button
                onClick={toggleWallet}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#154212]/5 transition-colors group text-left"
              >
                <span className="material-symbols-outlined text-[#2D5A27] group-hover:text-[#154212]">account_balance_wallet</span>
                <span className="text-[#154212] font-medium">Monedero</span>
                {nacatamalesCount > 0 && (
                  <span className="ml-auto bg-[#F4C430] text-[#1d1d03] text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">restaurant</span>
                    {nacatamalesCount}
                  </span>
                )}
              </button>

              {/* Opción Amigos */}
              <Link
                to="/friends"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#154212]/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-[#2D5A27] group-hover:text-[#154212]">group</span>
                <span className="text-[#154212] font-medium">Amigos</span>
              </Link>

              {/* Opción Tienda */}
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#154212]/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-[#2D5A27] group-hover:text-[#154212]">storefront</span>
                <span className="text-[#154212] font-medium">Tienda</span>
              </Link>

              {/* Separador */}
              <div className="border-t border-[#154212]/10 my-2"></div>

              {/* Opción Cuenta */}
              <Link
                to="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#154212]/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-[#2D5A27] group-hover:text-[#154212]">person</span>
                <span className="text-[#154212] font-medium">Cuenta</span>
              </Link>

              {/* Opción Perfil */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#154212]/5 transition-colors group"
              >
                <span className="material-symbols-outlined text-[#2D5A27] group-hover:text-[#154212]">badge</span>
                <span className="text-[#154212] font-medium">Perfil</span>
              </Link>

              {/* Separador */}
              <div className="border-t border-[#154212]/10 my-2"></div>

              {/* Opción Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#C41E3A]/10 transition-colors group text-left"
              >
                <span className="material-symbols-outlined text-[#C41E3A] group-hover:text-[#A31832]">logout</span>
                <span className="text-[#C41E3A] font-bold">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
