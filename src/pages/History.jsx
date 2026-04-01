/**
 * History.jsx - Historial de Partidas de NicaQuizz
 * "El Libro de las Batallas"
 * 
 * Muestra:
 * - Partidas ganadas y perdidas
 * - Ingredientes obtenidos por partida
 * - Estadísticas detalladas
 * - Historial de retos
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firestore';

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

// Partidas simuladas para demostración (en producción vendrían de Firestore)
const PARTIDAS_SIMULADAS = [
  {
    id: 1,
    tipo: 'categoria',
    categoria: 'historia',
    fecha: new Date(Date.now() - 1000 * 60 * 30), // hace 30 min
    resultado: 'victoria',
    aciertos: 8,
    total: 10,
    ingredientes: [{ tipo: 'masa', cantidad: 1 }],
    rival: null
  },
  {
    id: 2,
    tipo: 'reto',
    categoria: 'matematicas',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 2), // hace 2 horas
    resultado: 'derrota',
    aciertos: 5,
    total: 10,
    ingredientes: [],
    rival: 'Carlos M.'
  },
  {
    id: 3,
    tipo: 'categoria',
    categoria: 'geografia',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 5), // hace 5 horas
    resultado: 'victoria',
    aciertos: 9,
    total: 10,
    ingredientes: [{ tipo: 'arroz', cantidad: 1 }],
    rival: null
  },
  {
    id: 4,
    tipo: 'reto',
    categoria: 'ciencias',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24), // hace 1 día
    resultado: 'victoria',
    aciertos: 7,
    total: 10,
    ingredientes: [{ tipo: 'papa', cantidad: 2 }],
    rival: 'Ana G.'
  },
  {
    id: 5,
    tipo: 'categoria',
    categoria: 'historia',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 48), // hace 2 días
    resultado: 'victoria',
    aciertos: 10,
    total: 10,
    ingredientes: [{ tipo: 'masa', cantidad: 1 }],
    rival: null
  },
  {
    id: 6,
    tipo: 'reto',
    categoria: null,
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 72), // hace 3 días
    resultado: 'victoria',
    aciertos: 8,
    total: 10,
    ingredientes: [{ tipo: 'chile', cantidad: 2 }],
    rival: 'Luis R.'
  }
];

const CATEGORIAS_INFO = {
  historia: { nombre: 'Historia', color: 'bg-amber-500', icono: 'history_edu' },
  matematicas: { nombre: 'Matemáticas', color: 'bg-blue-500', icono: 'calculate' },
  geografia: { nombre: 'Geografía', color: 'bg-green-500', icono: 'public' },
  ciencias: { nombre: 'Ciencias', color: 'bg-purple-500', icono: 'science' }
};

export default function History() {
  const { currentUser, userData } = useAuth();
  const [filtro, setFiltro] = useState('todas'); // todas, victorias, derrotas, retos, categoria
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      // En producción, cargar desde Firestore
      // Por ahora usamos datos simulados
      await new Promise(resolve => setTimeout(resolve, 500));
      setPartidas(PARTIDAS_SIMULADAS);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar partidas
  const partidasFiltradas = partidas.filter(partida => {
    if (filtro === 'todas') return true;
    if (filtro === 'victorias') return partida.resultado === 'victoria';
    if (filtro === 'derrotas') return partida.resultado === 'derrota';
    if (filtro === 'retos') return partida.tipo === 'reto';
    if (filtro === 'categoria') return partida.tipo === 'categoria';
    return true;
  });

  // Calcular estadísticas
  const estadisticas = {
    total: partidas.length,
    victorias: partidas.filter(p => p.resultado === 'victoria').length,
    derrotas: partidas.filter(p => p.resultado === 'derrota').length,
    retosGanados: partidas.filter(p => p.tipo === 'reto' && p.resultado === 'victoria').length,
    ingredientesTotales: partidas.reduce((acc, p) => {
      p.ingredientes.forEach(ing => {
        acc[ing.tipo] = (acc[ing.tipo] || 0) + ing.cantidad;
      });
      return acc;
    }, {})
  };

  const precision = estadisticas.total > 0
    ? Math.round((estadisticas.victorias / estadisticas.total) * 100)
    : 0;

  // Formatear fecha
  function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days} días`;
    return date.toLocaleDateString('es-ES');
  }

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-nica-verde/10 via-gray-900 to-nica-verde/10">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/play" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
                <p className="text-xs text-gray-400">El Libro de las Batallas</p>
              </div>
            </Link>
          </div>
          <Link to="/play" className="text-gray-400 hover:text-nica-amarillo transition-colors flex items-center gap-2">
            <span className="material-symbols-rounded">home</span>
            <span className="hidden sm:inline">Volver</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display text-nica-amarillo mb-3 gradient-text">
            <span className="material-symbols-rounded inline-block align-middle mr-2">history_edu</span>
            Historial de Partidas
          </h1>
          <p className="text-gray-400 text-lg">
            Revisa tu progreso y ingredientes obtenidos
          </p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-display text-white font-bold">{estadisticas.total}</p>
          </div>
          <div className="card text-center border-green-700/50 bg-green-900/20">
            <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Victorias</p>
            <p className="text-3xl font-display text-green-400 font-bold">{estadisticas.victorias}</p>
          </div>
          <div className="card text-center border-red-700/50 bg-red-900/20">
            <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Derrotas</p>
            <p className="text-3xl font-display text-red-400 font-bold">{estadisticas.derrotas}</p>
          </div>
          <div className="card text-center border-nica-amarillo/50 bg-nica-amarillo/20">
            <p className="text-xs text-nica-amarillo uppercase tracking-wider mb-1">Precisión</p>
            <p className="text-3xl font-display text-nica-amarillo font-bold">{precision}%</p>
          </div>
          <div className="card text-center border-purple-700/50 bg-purple-900/20">
            <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Retos Ganados</p>
            <p className="text-3xl font-display text-purple-400 font-bold">{estadisticas.retosGanados}</p>
          </div>
        </div>

        {/* Ingredientes Obtenidos */}
        <div className="card mb-8">
          <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-nica-amarillo">inventory_2</span>
            Ingredientes Obtenidos
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(estadisticas.ingredientesTotales).map(([tipo, cantidad]) => (
              <div key={tipo} className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="w-12 h-12 mx-auto mb-2">
                  <IngredientIcon type={tipo} className="w-full h-full" />
                </div>
                <p className="text-xs text-gray-400 capitalize mb-1">{tipo}</p>
                <p className="text-2xl font-display text-nica-amarillo font-bold">{cantidad}</p>
              </div>
            ))}
            {Object.keys(estadisticas.ingredientesTotales).length === 0 && (
              <p className="text-gray-500 col-span-5 text-center py-4">
                Aún no has obtenido ingredientes
              </p>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift ${
              filtro === 'todas'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">filter_list</span>
            Todas ({partidas.length})
          </button>
          <button
            onClick={() => setFiltro('victorias')}
            className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift ${
              filtro === 'victorias'
                ? 'bg-green-600 text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">check_circle</span>
            Victorias ({estadisticas.victorias})
          </button>
          <button
            onClick={() => setFiltro('derrotas')}
            className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift ${
              filtro === 'derrotas'
                ? 'bg-red-600 text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">cancel</span>
            Derrotas ({estadisticas.derrotas})
          </button>
          <button
            onClick={() => setFiltro('retos')}
            className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift ${
              filtro === 'retos'
                ? 'bg-purple-600 text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">sports_martial_arts</span>
            Retos
          </button>
          <button
            onClick={() => setFiltro('categoria')}
            className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift ${
              filtro === 'categoria'
                ? 'bg-blue-600 text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">menu_book</span>
            Categorías
          </button>
        </div>

        {/* Lista de Partidas */}
        {loading ? (
          <div className="card text-center py-12">
            <span className="material-symbols-rounded text-6xl text-nica-amarillo animate-spin inline-block">progress_activity</span>
            <p className="text-gray-400 mt-4">Cargando historial...</p>
          </div>
        ) : partidasFiltradas.length === 0 ? (
          <div className="card text-center py-12">
            <span className="material-symbols-rounded text-6xl text-gray-600 mb-4">history</span>
            <p className="text-gray-400 text-lg">No hay partidas registradas</p>
            <p className="text-sm mt-2">¡Comienza a jugar para crear tu historial!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partidasFiltradas.map((partida) => {
              const catInfo = CATEGORIAS_INFO[partida.categoria] || { nombre: 'Libre', color: 'bg-gray-500', icono: 'games' };
              
              return (
                <div
                  key={partida.id}
                  className={`card p-5 border-l-4 ${
                    partida.resultado === 'victoria'
                      ? 'border-green-500 bg-green-900/10'
                      : 'border-red-500 bg-red-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Información principal */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Resultado */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        partida.resultado === 'victoria'
                          ? 'bg-green-600/30'
                          : 'bg-red-600/30'
                      }`}>
                        <span className={`material-symbols-rounded text-3xl ${
                          partida.resultado === 'victoria' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {partida.resultado === 'victoria' ? 'emoji_events' : 'sports_cricket'}
                        </span>
                      </div>

                      {/* Detalles */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            partida.tipo === 'reto'
                              ? 'bg-purple-900/50 text-purple-400'
                              : 'bg-blue-900/50 text-blue-400'
                          }`}>
                            {partida.tipo === 'reto' ? 'Reto' : 'Categoría'}
                          </span>
                          {partida.rival && (
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <span className="material-symbols-rounded text-xs">person</span>
                              vs {partida.rival}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-rounded text-sm ${catInfo.color.replace('bg-', 'text-')}`}>
                            {catInfo.icono}
                          </span>
                          <span className="font-bold text-white">
                            {partida.categoria ? catInfo.nombre : 'Reto Libre'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(partida.fecha)}
                        </p>
                      </div>
                    </div>

                    {/* Puntuación */}
                    <div className="text-center px-6">
                      <p className="text-3xl font-display font-bold text-white">
                        {partida.aciertos}/{partida.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round((partida.aciertos / partida.total) * 100)}% precisión
                      </p>
                    </div>

                    {/* Ingredientes obtenidos */}
                    <div className="flex items-center gap-2">
                      {partida.ingredientes.length > 0 ? (
                        partida.ingredientes.map((ing, idx) => (
                          <div key={idx} className="relative group">
                            <div className="w-10 h-10">
                              <IngredientIcon type={ing.tipo} className="w-full h-full animate-glow" />
                            </div>
                            {ing.cantidad > 1 && (
                              <span className="absolute -top-1 -right-1 bg-nica-amarillo text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {ing.cantidad}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Sin ingredientes</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
