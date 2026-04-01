/**
 * Dashboard / Selección de Categorías - NicaQuizz
 * Muestra las categorías disponibles con progreso e ingredientes
 * Diseño de cuadrícula con tarjetas grandes
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, CATEGORIA_INGREDIENTE } from '../services/firestore';
import { getUserChallenges, getFriends, getAvailableChallengers } from '../services/firestore';
import UserMenu from '../components/UserMenu';

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

// Configuración de modos de juego
const GAME_MODES = [
  {
    id: 'categorias',
    titulo: 'Categorías',
    descripcion: 'Elige una materia y gana ingredientes',
    icono: 'menu_book',
    color: 'from-nica-verde to-nica-amarillo',
    ruta: '/categories',
    recompensa: '1 Ingrediente'
  },
  {
    id: 'amigos',
    titulo: 'Retar Amigo',
    descripcion: 'Desafía a un amigo y compite',
    icono: 'sports_martial_arts',
    color: 'from-pink-600 to-rose-600',
    ruta: '/friends',
    recompensa: '2 Chiles'
  },
  {
    id: 'online',
    titulo: 'Reto Abierto',
    descripcion: 'Compite contra jugadores en línea',
    icono: 'public',
    color: 'from-cyan-600 to-blue-600',
    ruta: '/challenge/open',
    recompensa: '2 Chiles'
  },
  {
    id: 'ranking',
    titulo: 'Ranking',
    descripcion: 'Compite por el top global',
    icono: 'emoji_events',
    color: 'from-yellow-600 to-orange-600',
    ruta: '/ranking',
    recompensa: 'Prestigio'
  }
];

// Configuración de categorías con colores
const CATEGORY_COLORS = {
  historia: {
    bg: 'bg-categoria-historia',
    borde: 'border-ocre-600',
    texto: 'text-ocre-400'
  },
  matematicas: {
    bg: 'bg-categoria-matematicas',
    borde: 'border-blue-600',
    texto: 'text-blue-400'
  },
  geografia: {
    bg: 'bg-categoria-geografia',
    borde: 'border-teal-600',
    texto: 'text-teal-400'
  },
  ciencias: {
    bg: 'bg-categoria-ciencias',
    borde: 'border-purple-600',
    texto: 'text-purple-400'
  }
};

export default function PlayMode() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [retosPendientes, setRetosPendientes] = useState([]);
  const [jugadoresOnline, setJugadoresOnline] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosJuego();
  }, []);

  async function cargarDatosJuego() {
    try {
      // Cargar categorías
      const cats = await fetchCategories();
      setCategorias(cats);

      // Cargar retos pendientes
      const retos = await getUserChallenges(currentUser.uid, 'pending');
      setRetosPendientes(retos);

      // Cargar jugadores disponibles
      const disponibles = await getAvailableChallengers();
      setJugadoresOnline(disponibles.filter(p => p.id !== currentUser.uid));
    } catch (error) {
      console.error('Error al cargar datos del juego:', error);
    } finally {
      setCargando(false);
    }
  }

  // Calcular nacatamales completados
  const monedas = userData?.coins || {};
  const nacatamalesCount = Math.min(
    monedas.masa || 0,
    monedas.cerdo || 0,
    monedas.arroz || 0,
    monedas.papa || 0,
    monedas.chile || 0
  );

  // Obtener estadísticas de una categoría
  function obtenerEstadisticas(categoriaId) {
    const catStats = userData?.stats?.categoryStats?.[categoriaId];
    if (!catStats) return { total: 0, correct: 0, precision: 0 };

    const precision = catStats.total > 0
      ? Math.round((catStats.correct / catStats.total) * 100)
      : 0;

    return { ...catStats, precision };
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
                <p className="text-xs text-gray-400">El Nacatamal del Conocimiento</p>
              </div>
            </Link>
          </div>

          {/* Contador de nacatamales */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-nica-verde/50 to-nica-amarillo/50 px-5 py-2.5 rounded-2xl border-2 border-nica-amarillo/50 shadow-comic">
            <span className="material-symbols-rounded text-3xl text-nica-amarillo">lunch_dining</span>
            <span className="font-display text-2xl text-white">{nacatamalesCount}</span>
            <span className="text-xs text-gray-300 hidden sm:inline">completados</span>
          </div>

          {/* Menú de usuario */}
          <UserMenu />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-display text-nica-amarillo mb-3 gradient-text">
            ¡Elige tu Reto!
          </h1>
          <p className="text-gray-400 text-lg">
            Selecciona una categoría y comienza a ganar ingredientes
          </p>
        </div>

        {/* Modos de juego principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {GAME_MODES.map((modo) => (
            <Link
              key={modo.id}
              to={modo.ruta}
              className="card hover-lift group relative overflow-hidden"
            >
              {/* Fondo con gradiente */}
              <div className={`absolute inset-0 bg-gradient-to-br ${modo.color} opacity-15 group-hover:opacity-25 transition-opacity`}></div>

              {/* Contenido */}
              <div className="relative">
                {/* Icono */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${modo.color} flex items-center justify-center shadow-comic mb-4 group-hover:shadow-comic-hover transition-shadow`}>
                  <span className="material-symbols-rounded text-3xl text-white">{modo.icono}</span>
                </div>

                {/* Texto */}
                <h3 className="text-xl font-display text-white mb-2 group-hover:text-nica-amarillo transition-colors">
                  {modo.titulo}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{modo.descripcion}</p>
                
                {/* Recompensa */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-symbols-rounded text-yellow-400 text-sm">rewards</span>
                  <span className="text-yellow-400 font-medium">{modo.recompensa}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Retos pendientes */}
        {retosPendientes.length > 0 && (
          <div className="card mb-10 border-yellow-600 bg-yellow-900/20">
            <h2 className="text-2xl font-display text-white mb-5 flex items-center gap-3">
              <span className="material-symbols-rounded text-yellow-400">notifications</span>
              Retos Pendientes ({retosPendientes.length})
            </h2>
            <div className="space-y-3">
              {retosPendientes.map((reto) => (
                <div
                  key={reto.id}
                  className="flex items-center justify-between bg-gray-800/80 rounded-xl p-4 border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                      <span className="material-symbols-rounded text-white">sports_martial_arts</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {reto.desafiante?.displayName || 'Jugador'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {reto.categoriaId
                          ? `Categoría: ${reto.categoriaId}`
                          : 'Reto abierto'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/challenge/${reto.id}`}
                    className="btn-primary text-sm"
                  >
                    Aceptar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorías disponibles */}
        <div className="card">
          <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-rounded text-nica-amarillo">menu_book</span>
            Categorías Disponibles
          </h2>

          {cargando ? (
            <div className="text-center py-12 text-gray-400">
              <span className="material-symbols-rounded text-4xl animate-spin inline-block">progress_activity</span>
              <p className="mt-4">Cargando categorías...</p>
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="material-symbols-rounded text-4xl inline-block">folder_off</span>
              <p className="mt-4">No hay categorías disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categorias.map((categoria) => {
                const ingrediente = CATEGORIA_INGREDIENTE[categoria.id];
                const stats = obtenerEstadisticas(categoria.id);
                const colores = CATEGORY_COLORS[categoria.id] || CATEGORY_COLORS.historia;

                return (
                  <Link
                    key={categoria.id}
                    to={`/questions/${categoria.id}`}
                    className={`category-card ${colores.bg} ${colores.borde} group relative overflow-hidden`}
                  >
                    {/* Header de categoría */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-rounded text-4xl text-white`}>
                          {categoria.icono || 'menu_book'}
                        </span>
                        {ingrediente && (
                          <div className="w-10 h-10 ingredient-icon">
                            <IngredientIcon type={ingrediente} className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información */}
                    <h3 className="text-2xl font-display text-white mb-2 group-hover:text-nica-amarillo transition-colors capitalize">
                      {categoria.id}
                    </h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">
                      {categoria.descripcion}
                    </p>

                    {/* Progreso */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-white/60">
                          {stats.correct}/{stats.total} aciertos
                        </span>
                        <span className={`font-bold ${
                          stats.precision >= 70 ? 'text-green-400' :
                          stats.precision >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {stats.precision}%
                        </span>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stats.precision >= 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                            stats.precision >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                            'bg-gradient-to-r from-red-500 to-red-400'
                          }`}
                          style={{ width: `${stats.precision}%` }}
                        />
                      </div>
                    </div>

                    {/* Botón Jugar */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <button className="w-full bg-white/20 hover:bg-white/30 text-white font-display font-bold py-2 px-4 rounded-xl transition-all group-hover:bg-white/40">
                        <span className="material-symbols-rounded inline-block align-middle mr-1">play_arrow</span>
                        Jugar
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Jugadores en línea para retos abiertos */}
        {jugadoresOnline.length > 0 && (
          <div className="card mt-10 border-cyan-600 bg-cyan-900/20">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <span className="material-symbols-rounded text-cyan-400">public</span>
              Jugadores en Línea ({jugadoresOnline.length})
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Desafía a cualquier jugador en línea para ganar 2 chiles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jugadoresOnline.slice(0, 6).map((jugador) => (
                <div
                  key={jugador.id}
                  className="flex items-center justify-between bg-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-cyan-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center relative">
                      <span className="material-symbols-rounded text-white">person</span>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {jugador.displayName || 'Jugador'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {jugador.stats?.totalQuestionsAnswered || 0} preguntas
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/challenge/open?opponent=${jugador.id}`}
                    className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-comic hover:shadow-comic-hover"
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
