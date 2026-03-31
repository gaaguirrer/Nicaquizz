import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, CATEGORIA_INGREDIENTE, INGREDIENTE_NAMES } from '../services/firestore';
import { getUserChallenges, getFriends, getAvailableChallengers } from '../services/firestore';

// Iconos SVG personalizados para los ingredientes del nacatamal
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

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Configuración de modos de juego
const GAME_MODES = [
  {
    id: 'categories',
    title: 'Categorías',
    description: 'Elige una categoría y responde preguntas para ganar ingredientes',
    icon: 'menu_book',
    color: 'from-indigo-600 to-purple-600',
    route: '/categories',
    reward: 'Ingrediente por categoría'
  },
  {
    id: 'friends',
    title: 'Retar Amigo',
    description: 'Desafía a un amigo y compite por el ranking',
    icon: 'sports_martial_arts',
    color: 'from-pink-600 to-rose-600',
    route: '/friends',
    reward: 'Chile + Puntos de ranking'
  },
  {
    id: 'online',
    title: 'Reto Abierto',
    description: 'Compite contra jugadores en línea aleatorios',
    icon: 'public',
    color: 'from-cyan-600 to-blue-600',
    route: '/challenge/open',
    reward: '2 Chiles'
  },
  {
    id: 'ranking',
    title: 'Ranking Mundial',
    description: 'Compite por estar en el top global',
    icon: 'emoji_events',
    color: 'from-yellow-600 to-orange-600',
    route: '/ranking',
    reward: 'Prestigio'
  }
];

/**
 * Página PlayMode - Selección de modos de juego
 * Centraliza todas las opciones para jugar
 */
export default function PlayMode() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameData();
  }, []);

  async function loadGameData() {
    try {
      // Cargar categorías
      const cats = await fetchCategories();
      setCategories(cats);

      // Cargar retos pendientes
      const challenges = await getUserChallenges(currentUser.uid, 'pending');
      setPendingChallenges(challenges);

      // Cargar jugadores disponibles para retos abiertos
      const available = await getAvailableChallengers();
      setOnlinePlayers(available.filter(p => p.id !== currentUser.uid));
    } catch (error) {
      console.error('Error al cargar datos del juego:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calcular ingredientes
  const coins = userData?.coins || {};
  const nacatamalesCount = Math.min(
    coins.masa || 0,
    coins.cerdo || 0,
    coins.arroz || 0,
    coins.papa || 0,
    coins.chile || 0
  );

  return (
    <div className="min-h-screen pb-12">
      {/* Header simplificado */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🇳🇮</span>
              <h1 className="text-2xl font-bold gradient-text">NicaQuizz</h1>
            </Link>
          </div>
          
          {/* Contador de nacatamales */}
          <div className="flex items-center gap-2 bg-green-900/50 px-4 py-2 rounded-full border border-green-700">
            <svg viewBox="0 0 64 64" className="w-6 h-6">
              <circle cx="32" cy="32" r="28" fill="#FFD700" stroke="#DAA520" strokeWidth="3"/>
              <circle cx="32" cy="32" r="22" fill="none" stroke="#FFA500" strokeWidth="2"/>
              <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#DAA520">$</text>
            </svg>
            <span className="font-bold text-green-400">{nacatamalesCount}</span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text">
            <MaterialIcon name="sports_esports" className="inline-block w-10 h-10 align-middle mr-2" />
            Modos de Juego
          </h1>
          <p className="text-gray-400 text-lg">Elige cómo quieres jugar y ganar ingredientes</p>
        </div>

        {/* Modos de juego principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {GAME_MODES.map((mode) => (
            <Link
              key={mode.id}
              to={mode.route}
              className="card hover-lift group relative overflow-hidden"
            >
              {/* Fondo con gradiente */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              {/* Contenido */}
              <div className="relative flex items-start gap-4">
                {/* Icono */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <MaterialIcon name={mode.icon} className="text-white text-3xl" />
                </div>
                
                {/* Texto */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{mode.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <MaterialIcon name="rewards" className="text-yellow-400 w-4 h-4" />
                    <span className="text-yellow-400 font-medium">{mode.reward}</span>
                  </div>
                </div>
                
                {/* Flecha */}
                <MaterialIcon name="arrow_forward" className="text-gray-500 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Retos pendientes */}
        {pendingChallenges.length > 0 && (
          <div className="card mb-8 border-yellow-700 bg-yellow-900/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MaterialIcon name="notifications" className="text-yellow-400" />
              Retos Pendientes ({pendingChallenges.length})
            </h2>
            <div className="space-y-3">
              {pendingChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between bg-gray-800/80 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                      <MaterialIcon name="sports_martial_arts" className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {challenge.challenger?.displayName || 'Jugador'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {challenge.categoryId 
                          ? `Categoría: ${challenge.categoryId}`
                          : 'Reto abierto'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/challenge/${challenge.id}`}
                    className="btn-primary text-sm"
                  >
                    Aceptar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorías disponibles para jugar */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MaterialIcon name="menu_book" className="text-indigo-400" />
            Categorías Disponibles
          </h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Cargando categorías...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No hay categorías disponibles
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const ingrediente = CATEGORIA_INGREDIENTE[category.id];
                const catStats = userData?.stats?.categoryStats?.[category.id];
                const catStatsString = catStats 
                  ? `${catStats.correct}/${catStats.total} aciertos`
                  : 'Sin jugar';

                return (
                  <Link
                    key={category.id}
                    to={`/questions/${category.id}`}
                    className="card hover-lift border-l-4 border-indigo-500 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white capitalize group-hover:text-indigo-300 transition-colors">
                        {category.id}
                      </h3>
                      {ingrediente && (
                        <IngredientIcon type={ingrediente} className="w-8 h-8" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      {catStatsString}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Jugadores en línea para retos abiertos */}
        {onlinePlayers.length > 0 && (
          <div className="card border-cyan-700 bg-cyan-900/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MaterialIcon name="public" className="text-cyan-400" />
              Jugadores en Línea ({onlinePlayers.length})
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Desafía a cualquier jugador en línea para ganar 2 chiles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {onlinePlayers.slice(0, 6).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-gray-800/80 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center relative">
                      <MaterialIcon name="person" className="text-white" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {player.displayName || 'Jugador'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {player.stats?.totalQuestionsAnswered || 0} preguntas
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/challenge/open?opponent=${player.id}`}
                    className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Retar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
