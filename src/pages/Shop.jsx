import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getShopItems,
  purchaseItem,
  INGREDIENTES,
  INGREDIENTE_NAMES,
  ITEM_TYPES,
  getUserWallet
} from '../services/firestore';
import UserMenu from '../components/UserMenu';

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
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

// Mapeo de ingredientes a colores
const INGREDIENT_COLORS = {
  masa: { bg: 'from-amber-100 to-amber-200', border: 'border-amber-400', text: 'text-amber-600' },
  cerdo: { bg: 'from-pink-200 to-rose-300', border: 'border-pink-400', text: 'text-pink-600' },
  arroz: { bg: 'from-gray-50 to-gray-100', border: 'border-gray-300', text: 'text-gray-600' },
  papa: { bg: 'from-yellow-200 to-amber-300', border: 'border-yellow-500', text: 'text-yellow-700' },
  chile: { bg: 'from-green-200 to-emerald-300', border: 'border-green-500', text: 'text-green-600' }
};

// Configuración de tipos de items
const ITEM_TYPE_CONFIG = {
  [ITEM_TYPES.POWERUP]: { 
    icon: 'emoji_events', 
    color: 'from-yellow-500 to-orange-500', 
    label: 'Power-ups',
    description: 'Ventajas para ti'
  },
  [ITEM_TYPES.DEBUFF]: { 
    icon: 'do_not_disturb_on', 
    color: 'from-purple-500 to-pink-500', 
    label: 'Debuffs',
    description: 'Desventajas para el oponente'
  }
};

export default function Shop() {
  const { currentUser, userData } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [wallet, setWallet] = useState({ coins: {} });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all'); // all, powerup, debuff

  useEffect(() => {
    loadItems();
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const data = await getUserWallet(currentUser.uid);
      setWallet(data);
    } catch (error) {
      console.error('Error al cargar monedero:', error);
    }
  }

  async function loadItems() {
    try {
      const shopItems = await getShopItems();
      setItems(shopItems);
    } catch (error) {
      console.error('Error al cargar items:', error);
      setMessage({ type: 'error', text: 'Error al cargar la tienda' });
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(item) {
    if (!confirm(`¿Comprar ${item.name} por 1 nacatamal completo?`)) return;

    try {
      await purchaseItem(currentUser.uid, item.id, item.currentPrice, item.type);
      setMessage({ type: 'success', text: `¡${item.name} comprado! Revisa tus power-ups en Perfil.` });
      toast.success(`¡${item.name} adquirido con éxito!`);
      loadWallet();
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Error al comprar');
      setMessage({ type: 'error', text: error.message || 'Error al comprar' });
    }
  }

  // Calcular ingredientes del nacatamal
  const coins = wallet.coins || {};
  const totalIngredients = Object.values(INGREDIENTES).reduce(
    (sum, ing) => sum + (coins[ing] || 0),
    0
  );
  const maxIngredients = Object.values(INGREDIENTES).length;
  const hasNacatamal = Object.values(INGREDIENTES).every(ing => (coins[ing] || 0) >= 1);
  const nacatamalesCount = hasNacatamal
    ? Math.min(...Object.values(INGREDIENTES).map(ing => coins[ing] || 0))
    : 0;

  // Filtrar items
  let filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.type === filter);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🇳🇮</span>
              <h1 className="text-2xl font-bold gradient-text">NicaQuizz</h1>
            </Link>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 gradient-text">
            <MaterialIcon name="storefront" className="inline-block w-12 h-12 align-middle mr-2" />
            Tienda
          </h1>
          <p className="text-gray-400 text-lg">Power-ups y debuffs para mejorar tu juego</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-900/50 text-green-300 border border-green-700'
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            <MaterialIcon name={message.type === 'success' ? 'check_circle' : 'error'} className="w-6 h-6" />
            {message.text}
          </div>
        )}

        {/* Nacatamal Progress Card */}
        <div className="card mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-green-400 text-3xl">lunch_dining</span>
                Tu Nacatamal
              </h2>
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 64 64" className="w-10 h-10">
                  <circle cx="32" cy="32" r="28" fill="#FFD700" stroke="#DAA520" strokeWidth="3"/>
                  <circle cx="32" cy="32" r="22" fill="none" stroke="#FFA500" strokeWidth="2"/>
                  <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#DAA520">$</text>
                </svg>
                <span className="text-3xl font-bold text-green-400">{nacatamalesCount}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(totalIngredients / maxIngredients) * 100}%` }}
              ></div>
            </div>

            {/* Ingredients Grid */}
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(INGREDIENTES).map(([key, value]) => {
                const hasIngredient = (coins[value] || 0) >= 1;
                const colors = INGREDIENT_COLORS[key] || { bg: 'from-gray-200 to-gray-300', border: 'border-gray-400', text: 'text-gray-600' };

                return (
                  <div
                    key={value}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all hover:scale-105 ${
                      hasIngredient
                        ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-lg`
                        : 'bg-gray-800/50 border border-gray-600/50 opacity-50'
                    }`}
                  >
                    <div className="w-12 h-12 mb-1">
                      <IngredientIcon
                        type={key}
                        className={`w-full h-full ${!hasIngredient ? 'grayscale' : ''}`}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      hasIngredient ? colors.text : 'text-gray-500'
                    }`}>
                      {INGREDIENTE_NAMES[value]}
                    </span>
                    {hasIngredient && (
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(Math.min(coins[value], 5))].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`}></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!hasNacatamal && (
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  <MaterialIcon name="info" className="w-4 h-4 inline-block align-middle mr-1" />
                  Completa tu nacatamal respondiendo preguntas en cada categoría
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all hover-lift flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="apps" className="w-5 h-5" />
            <span>Todos</span>
          </button>
          {Object.entries(ITEM_TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full font-semibold transition-all hover-lift flex items-center gap-2 ${
                filter === type
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MaterialIcon name={config.icon} className="w-5 h-5" />
              <span>{config.label}</span>
            </button>
          ))}
        </div>

        {/* Items de la tienda */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Cargando tienda...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card text-center py-16">
            <MaterialIcon name="shopping_cart_off" className="w-24 h-24 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No hay items disponibles en esta categoría</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-4 btn-primary"
            >
              Ver todos los items
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const typeConfig = ITEM_TYPE_CONFIG[item.type] || { color: 'from-gray-500 to-gray-600', icon: 'help' };
              const isPopular = item.timesPurchased >= 10;

              return (
                <div key={item.id} className="card hover-lift overflow-hidden group">
                  {/* Icon Badge con Gradiente */}
                  <div className="relative mb-4">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${typeConfig.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <MaterialIcon name={item.icon || typeConfig.icon} className="text-5xl text-white" />
                    </div>
                    {isPopular && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        <MaterialIcon name="local_fire" className="w-3 h-3 inline-block align-middle mr-0.5" />
                        Popular
                      </div>
                    )}
                    {/* Tipo de item */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full border border-gray-700">
                      {typeConfig.label}
                    </div>
                  </div>

                  {/* Información del Item */}
                  <div className="text-center mb-4 mt-2">
                    <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>

                  {/* Precio y Stats */}
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 64 64" className="w-6 h-6">
                          <circle cx="32" cy="32" r="28" fill="#FFD700" stroke="#DAA520" strokeWidth="3"/>
                        </svg>
                        <span className="text-lg font-bold text-white">1 Nacatamal</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{item.timesPurchased} comprados</div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Compra */}
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!hasNacatamal}
                    className={`w-full py-3 rounded-lg font-semibold transition-all hover-lift flex items-center justify-center gap-2 ${
                      hasNacatamal
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {hasNacatamal ? (
                      <>
                        <MaterialIcon name="shopping_cart" className="w-5 h-5" />
                        Comprar
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="lock" className="w-5 h-5" />
                        Necesitas Nacatamal
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info adicional */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <MaterialIcon name="emoji_events" className="text-yellow-400" />
              Power-ups
            </h3>
            <p className="text-gray-400 text-sm">
              Los power-ups te dan ventajas durante el juego. Úsalos estratégicamente para mejorar tu rendimiento en las preguntas.
            </p>
          </div>
          <div className="card bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <MaterialIcon name="do_not_disturb_on" className="text-purple-400" />
              Debuffs
            </h3>
            <p className="text-gray-400 text-sm">
              Los debuffs afectan a tu oponente durante los retos. Úsalos para desequilibrar la balanza a tu favor.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
