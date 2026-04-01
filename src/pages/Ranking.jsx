/**
 * Ranking.jsx - Tabla de Clasificación Nacional de NicaQuizz
 * "El Maestro Cocinero Supremo"
 * 
 * Características:
 * - Ranking nacional dinámico
 * - Filtros por materia
 * - Misión del Día destacada
 * - Posición del usuario en tiempo real
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGlobalRanking, fetchCategoryRanking, fetchCategories } from '../services/firestore';
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

// Misiones del Día predefinidas
const MISIONES_DEL_DIA = [
  {
    id: 1,
    titulo: 'Maestro de Historia',
    descripcion: 'Gana 3 partidas en Historia hoy',
    ingrediente: 'masa',
    recompensa: '2 Masa de Maíz',
    progreso: 0,
    total: 3
  },
  {
    id: 2,
    titulo: 'Velocista Matemático',
    descripcion: 'Responde 10 preguntas en menos de 10s cada una',
    ingrediente: 'cerdo',
    recompensa: '2 Carne de Cerdo',
    progreso: 0,
    total: 10
  },
  {
    id: 3,
    titulo: 'Explorador Geográfico',
    descripcion: 'Completa 5 categorías de Geografía',
    ingrediente: 'arroz',
    recompensa: '3 Arroz',
    progreso: 0,
    total: 5
  },
  {
    id: 4,
    titulo: 'Científico del Día',
    descripcion: 'Obtén 100% de precisión en Ciencias',
    ingrediente: 'papa',
    recompensa: '2 Papa',
    progreso: 0,
    total: 1
  },
  {
    id: 5,
    titulo: 'Retador Supremo',
    descripcion: 'Gana 3 retos en línea',
    ingrediente: 'chile',
    recompensa: '3 Chile',
    progreso: 0,
    total: 3
  }
];

// Configuración de categorías con colores
const CATEGORY_COLORS = {
  historia: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-600' },
  matematicas: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-600' },
  geografia: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-600' },
  ciencias: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-600' }
};

export default function Ranking() {
  const { userData } = useAuth();
  const [filtro, setFiltro] = useState('nacional'); // 'nacional', 'historia', 'matematicas', 'geografia', 'ciencias'
  const [ranking, setRanking] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [misionDelDia, setMisionDelDia] = useState(MISIONES_DEL_DIA[0]);

  useEffect(() => {
    loadData();
    // Seleccionar misión del día aleatoria
    const misionAleatoria = MISIONES_DEL_DIA[Math.floor(Math.random() * MISIONES_DEL_DIA.length)];
    setMisionDelDia(misionAleatoria);
  }, [filtro]);

  async function loadData() {
    setLoading(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);

      let rankingData;
      if (filtro === 'nacional') {
        rankingData = await fetchGlobalRanking(100);
      } else {
        rankingData = await fetchCategoryRanking(filtro, 100);
      }

      setRanking(rankingData);

      // Encontrar posición del usuario
      const userIndex = rankingData.findIndex(u => u.id === userData?.id);
      setUserRank(userIndex >= 0 ? userIndex + 1 : null);
    } catch (error) {
      console.error('Error al cargar ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  // Medallas para top 3
  const getMedal = (position) => {
    if (position === 1) return { icon: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    if (position === 2) return { icon: '🥈', color: 'text-gray-400', bg: 'bg-gray-900/30' };
    if (position === 3) return { icon: '🥉', color: 'text-amber-700', bg: 'bg-amber-900/30' };
    return null;
  };

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-nica-verde/20 via-gray-900 to-nica-verde/20">
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
          <UserMenu />
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Título y Misión del Día */}
        <div className="mb-8">
          <h1 className="text-5xl font-display text-center text-nica-amarillo mb-6 gradient-text">
            <span className="material-symbols-rounded inline-block align-middle mr-2">emoji_events</span>
            Ranking Nacional
          </h1>
          <p className="text-center text-gray-400 text-lg mb-8">
            Compite por ser el <strong className="text-nica-amarillo">Maestro Cocinero Supremo</strong>
          </p>

          {/* Misión del Día */}
          <div className="card bg-gradient-to-r from-nica-verde/30 to-nica-amarillo/30 border-2 border-nica-amarillo/50 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-nica-amarillo/30 flex items-center justify-center">
                <span className="material-symbols-rounded text-4xl text-nica-amarillo">task_alt</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display text-white">Misión del Día</h2>
                <p className="text-gray-400 text-sm">Completa la misión para ganar ingredientes extra</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{misionDelDia.titulo}</h3>
                  <p className="text-gray-400 text-sm">{misionDelDia.descripcion}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div className="w-8 h-8">
                      <IngredientIcon type={misionDelDia.ingrediente} className="w-full h-full" />
                    </div>
                    <span className="text-nica-amarillo font-bold">{misionDelDia.recompensa}</span>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progreso</span>
                  <span>{misionDelDia.progreso}/{misionDelDia.total}</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-nica-verde to-nica-amarillo h-full rounded-full transition-all duration-500"
                    style={{ width: `${(misionDelDia.progreso / misionDelDia.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              <span className="material-symbols-rounded text-xs inline-block align-middle mr-1">schedule</span>
              La misión se reinicia en 24 horas
            </p>
          </div>
        </div>

        {/* Filtros por Materia */}
        <div className="card mb-8">
          <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded">filter_list</span>
            Filtrar por Materia
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltro('nacional')}
              className={`px-5 py-3 rounded-xl font-bold transition-all hover-lift flex items-center gap-2 ${
                filtro === 'nacional'
                  ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="material-symbols-rounded">public</span>
              Nacional
            </button>
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.historia;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFiltro(cat.id)}
                  className={`px-5 py-3 rounded-xl font-bold transition-all hover-lift flex items-center gap-2 ${
                    filtro === cat.id
                      ? `${colors.bg} text-white shadow-comic`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span className="material-symbols-rounded">{cat.icono || 'menu_book'}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla de Ranking */}
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-nica-verde/50 to-nica-amarillo/50 px-6 py-4 border-b border-nica-amarillo/30">
            <h2 className="text-2xl font-display text-white flex items-center gap-3">
              <span className="material-symbols-rounded text-nica-amarillo">leaderboard</span>
              {filtro === 'nacional' ? 'Tabla de Clasificación Nacional' : `Ranking de ${filtro}`}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="material-symbols-rounded text-6xl text-nica-amarillo animate-spin inline-block">progress_activity</span>
              <p className="text-gray-400 mt-4">Cargando ranking...</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="material-symbols-rounded text-6xl inline-block mb-4">leaderboard_off</span>
              <p className="text-lg">Aún no hay participantes en esta categoría</p>
              <p className="text-sm mt-2">¡Sé el primero en competir!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Posición
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Jugador
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                      {filtro === 'nacional' ? 'Aciertos Totales' : 'Aciertos'}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Respondidas
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Precisión
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Victorias
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {ranking.map((user, index) => {
                    const isCurrentUser = user.id === userData?.id;
                    const position = index + 1;
                    const medal = getMedal(position);

                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-nica-amarillo/20 border-l-4 border-nica-amarillo'
                            : medal?.bg || 'hover:bg-gray-800/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {medal ? (
                              <span className="text-3xl">{medal.icon}</span>
                            ) : (
                              <span className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                                position < 10 ? 'bg-nica-verde/30 text-nica-verde' : 'bg-gray-700 text-gray-400'
                              }`}>
                                {position}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              isCurrentUser 
                                ? 'bg-nica-amarillo text-gray-900' 
                                : 'bg-gradient-to-br from-nica-verde to-nica-amarillo text-white'
                            }`}>
                              {user.displayName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <span className={`font-bold ${
                                isCurrentUser ? 'text-nica-amarillo' : 'text-white'
                              }`}>
                                {user.displayName}
                              </span>
                              {isCurrentUser && (
                                <span className="text-gray-400 text-xs block">Tú</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-2xl font-display text-green-400 font-bold">
                            {user.correct || user.totalCorrect}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">
                          {user.total || user.totalQuestionsAnswered}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${
                            user.accuracy >= 70
                              ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                              : user.accuracy >= 40
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                              : 'bg-red-900/30 text-red-400 border border-red-700/50'
                          }`}>
                            {user.accuracy}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="material-symbols-rounded text-green-400 text-sm">emoji_events</span>
                            <span className="text-white font-bold">{user.wins || 0}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Posición del usuario si no está en el top 100 */}
        {userRank && userRank > 100 && (
          <div className="card mt-6 bg-nica-verde/20 border-2 border-nica-verde/50">
            <div className="flex items-center justify-center gap-4">
              <span className="material-symbols-rounded text-nica-verde text-3xl">trending_up</span>
              <p className="text-gray-300 text-lg">
                Tu posición actual: <span className="font-bold text-nica-verde text-xl">#{userRank}</span>
              </p>
              <span className="material-symbols-rounded text-nica-verde text-3xl">trending_up</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
