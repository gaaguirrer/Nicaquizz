/**
 * Shop.jsx - La Pulpería de NicaQuizz
 * "Mercado Artesanal del Saber"
 * 
 * Una interfaz de mercado artesanal donde se pueden canjear
 * los "Nacatamales" por power-ups estratégicos.
 */

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
import Button from '../components/Button';

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

// Configuración de tipos de items
const ITEM_TYPE_CONFIG = {
  [ITEM_TYPES.MEJORA]: {
    icon: 'emoji_events',
    color: 'from-yellow-500 to-orange-500',
    label: 'Mejoras',
    description: 'Ventajas estratégicas para tu juego',
    badge: 'bg-yellow-500'
  },
  [ITEM_TYPES.TRABA]: {
    icon: 'do_not_disturb_on',
    color: 'from-purple-500 to-pink-500',
    label: 'Trabas',
    description: 'Desventajas para tus oponentes',
    badge: 'bg-purple-500'
  }
};

// Mejoras disponibles con descripciones detalladas
const MEJORAS_INFO = {
  pase: {
    nombre: 'Pase',
    descripcion: 'Salta una pregunta difícil sin penalización',
    icono: 'skip_next',
    color: 'yellow'
  },
  reloj_arena: {
    nombre: 'Reloj de Arena',
    descripcion: 'Duplica tu tiempo disponible (30s → 60s)',
    icono: 'hourglass_top',
    color: 'blue'
  },
  comodin: {
    nombre: 'Comodín',
    descripcion: 'Elimina 2 opciones incorrectas',
    icono: 'filter_list',
    color: 'red'
  }
};

export default function Shop() {
  const { currentUser, userData } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [wallet, setWallet] = useState({ coins: {}, mejoras: {}, trabas: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
      toast.error('Error al cargar la pulpería');
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(item) {
    if (!confirm(`¿Canjear 1 Nacatamal completo por ${item.name}?`)) return;

    try {
      await purchaseItem(currentUser.uid, item.id, item.currentPrice, item.type);
      toast.success(`¡${item.name} adquirido! Revisa tus mejoras en Perfil.`);
      loadWallet();
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Error al comprar');
    }
  }

  // Calcular nacatamales completados
  const monedas = wallet.coins || {};
  const nacatamalesCount = Math.min(
    monedas.masa || 0,
    monedas.cerdo || 0,
    monedas.arroz || 0,
    monedas.papa || 0,
    monedas.chile || 0
  );

  // Filtrar items
  let filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.type === filter);

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-amber-900/20 via-gray-900 to-amber-900/20">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-amber-700/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🏪</span>
              <div>
                <h1 className="text-3xl font-display text-amber-400">La Pulpería</h1>
                <p className="text-xs text-gray-400">Mercado Artesanal del Saber</p>
              </div>
            </Link>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-display text-amber-400 mb-3 gradient-text">
            <span className="material-symbols-rounded inline-block align-middle mr-2">storefront</span>
            La Pulpería
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Canjea tus <strong className="text-amber-400">Nacatamales Completos</strong> por mejoras estratégicas
          </p>
        </div>

        {/* Monedero del Jugador */}
        <div className="card bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/50 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Nacatamales Disponibles */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-comic">
                <span className="material-symbols-rounded text-5xl text-white">payments</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Nacatamales Completos</p>
                <p className="text-4xl font-display text-amber-400 font-bold">{nacatamalesCount}</p>
              </div>
            </div>

            {/* Ingredientes Individuales */}
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(INGREDIENTES).map(([key, value]) => {
                const cantidad = monedas[value] || 0;
                const tiene = cantidad > 0;
                return (
                  <div
                    key={value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                      tiene
                        ? 'bg-gray-800/80 border-amber-500/50'
                        : 'bg-gray-800/30 border-gray-700 opacity-50'
                    }`}
                  >
                    <div className="w-8 h-8">
                      <IngredientIcon type={value} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 capitalize">{key}</p>
                      <p className={`font-bold ${tiene ? 'text-amber-400' : 'text-gray-600'}`}>
                        {cantidad}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">¿Cómo obtener nacatamales?</p>
              <p className="text-xs text-gray-500">
                Completa 1 de cada ingrediente<br/>
                para formar 1 Nacatamal
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">apps</span>
            <span>Todos</span>
          </button>
          {Object.entries(ITEM_TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
                filter === type
                  ? `bg-gradient-to-r ${config.color} text-white shadow-comic`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="material-symbols-rounded">{config.icon}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        {loading ? (
          <div className="text-center py-16">
            <span className="material-symbols-rounded text-6xl text-amber-400 animate-spin inline-block">progress_activity</span>
            <p className="text-gray-400 mt-4">Cargando productos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card text-center py-16">
            <span className="material-symbols-rounded text-6xl text-gray-600 mb-4">storefront</span>
            <p className="text-gray-400 text-lg">No hay productos disponibles en esta categoría</p>
            <Button onClick={() => setFilter('all')} className="mt-4">
              Ver todos los productos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const typeConfig = ITEM_TYPE_CONFIG[item.type] || ITEM_TYPE_CONFIG[ITEM_TYPES.MEJORA];
              const isPopular = item.timesPurchased >= 10;
              const mejoraInfo = MEJORAS_INFO[item.id] || null;

              return (
                <div
                  key={item.id}
                  className="card hover-lift overflow-hidden group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-amber-700/30"
                >
                  {/* Badge de Popular */}
                  {isPopular && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-comic z-10">
                      <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">local_fire</span>
                      Popular
                    </div>
                  )}

                  {/* Icono del Producto */}
                  <div className="relative mb-6">
                    <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${typeConfig.color} flex items-center justify-center shadow-comic group-hover:scale-110 transition-transform duration-300`}>
                      <span className="material-symbols-rounded text-5xl text-white">{item.icono || typeConfig.icon}</span>
                    </div>
                    {/* Tipo de item */}
                    <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 ${typeConfig.badge} text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg`}>
                      {typeConfig.label}
                    </div>
                  </div>

                  {/* Información del Producto */}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-display text-white mb-2">{item.name}</h3>
                    <p className="text-gray-400 text-sm">{mejoraInfo?.descripcion || item.description}</p>
                  </div>

                  {/* Precio y Stats */}
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                          <span className="material-symbols-rounded text-sm text-white">payments</span>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-amber-400">1 Nacatamal</p>
                          <p className="text-xs text-gray-500">Completo</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{item.timesPurchased} canjeados</p>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Compra */}
                  <Button
                    onClick={() => handlePurchase(item)}
                    disabled={nacatamalesCount < 1}
                    variant={nacatamalesCount >= 1 ? 'primary' : 'secondary'}
                    fullWidth
                    icon={nacatamalesCount >= 1 ? 'shopping_cart' : 'lock'}
                  >
                    {nacatamalesCount >= 1 ? 'Canjear' : 'Necesitas Nacatamal'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Adicional */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50">
            <h3 className="text-xl font-display text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-rounded text-yellow-400">emoji_events</span>
              Mejoras
            </h3>
            <p className="text-gray-400 text-sm">
              Las mejoras te dan ventajas estratégicas durante el juego. Úsalas sabiamente para maximizar tu rendimiento y subir en el ranking nacional.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-yellow-400 text-sm">check</span>
                <span>Se activan automáticamente al usarlas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-yellow-400 text-sm">check</span>
                <span>Solo 1 mejora por partida</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-yellow-400 text-sm">check</span>
                <span>Recarga gratuita cada 24 horas</span>
              </li>
            </ul>
          </div>
          <div className="card bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50">
            <h3 className="text-xl font-display text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-rounded text-purple-400">do_not_disturb_on</span>
              Trabas
            </h3>
            <p className="text-gray-400 text-sm">
              Las trabas afectan a tu oponente durante los retos en línea. Úsalas estratégicamente para desequilibrar la balanza a tu favor.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-purple-400 text-sm">check</span>
                <span>Solo disponibles en retos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-purple-400 text-sm">check</span>
                <span>Se activan al inicio del reto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-purple-400 text-sm">check</span>
                <span>Impacto significativo en el juego</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Consejo del Día */}
        <div className="card mt-8 bg-gradient-to-r from-nica-verde/20 to-nica-amarillo/20 border-nica-verde/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-nica-verde/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-3xl text-nica-verde">lightbulb</span>
            </div>
            <div>
              <h4 className="font-display text-white text-lg mb-2">Consejo del Maestro Cocinero</h4>
              <p className="text-gray-400 text-sm">
                "Un verdadero maestro no depende solo de las mejoras. Practica sin ellas para mejorar tu conocimiento, y úsalas estratégicamente en los momentos clave. ¡La sabiduría es el mejor ingrediente!"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
