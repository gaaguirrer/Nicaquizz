import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGlobalRanking, fetchCategoryRanking, fetchCategories } from '../services/firestore';

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Ranking() {
  const { userData } = useAuth();
  const [rankingType, setRankingType] = useState('global'); // 'global' o 'category'
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [ranking, setRanking] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadData();
  }, [rankingType, selectedCategoryId]);

  async function loadData() {
    setLoading(true);
    try {
      const [cats, globalRanking] = await Promise.all([
        fetchCategories(),
        fetchGlobalRanking(100)
      ]);
      
      setCategories(cats);
      
      if (rankingType === 'global') {
        setRanking(globalRanking);
        // Encontrar posición del usuario
        const userIndex = globalRanking.findIndex(u => u.id === userData?.id);
        setUserRank(userIndex >= 0 ? userIndex + 1 : null);
      } else if (selectedCategoryId) {
        const categoryRanking = await fetchCategoryRanking(selectedCategoryId, 100);
        setRanking(categoryRanking);
        const userIndex = categoryRanking.findIndex(u => u.id === userData?.id);
        setUserRank(userIndex >= 0 ? userIndex + 1 : null);
      }
    } catch (error) {
      console.error('Error al cargar ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryChange(e) {
    setSelectedCategoryId(e.target.value);
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold gradient-text"><span className="text-3xl">��</span> NicaQuizz</h1>
            <nav className="hidden md:flex gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Inicio
              </Link>
              <Link to="/categories" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Categorías
              </Link>
              <Link to="/ranking" className="text-indigo-400 font-medium transition-colors">
                Ranking
              </Link>
              <Link to="/friends" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Amigos
              </Link>
              <Link to="/shop" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Tienda
              </Link>
              <Link to="/profile" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Perfil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center gradient-text">
          {rankingType === 'global' ? (
            <><MaterialIcon name="public" className="inline-block w-8 h-8 align-middle mr-1" /> Ranking Mundial</>
          ) : (
            <><MaterialIcon name="menu_book" className="inline-block w-8 h-8 align-middle mr-1" /> Ranking por Categoría</>
          )}
        </h1>

        {/* Selector de tipo de ranking */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setRankingType('global')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all hover-lift ${
                  rankingType === 'global'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MaterialIcon name="public" className="inline-block w-5 h-5 align-middle mr-1" /> Ranking Mundial
              </button>
              <button
                onClick={() => {
                  setRankingType('category');
                  if (categories.length > 0 && !selectedCategoryId) {
                    setSelectedCategoryId(categories[0].id);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all hover-lift ${
                  rankingType === 'category'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MaterialIcon name="menu_book" className="inline-block w-5 h-5 align-middle mr-1" /> Por Categoría
              </button>
            </div>

            {rankingType === 'category' && (
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="input-field w-auto"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Nota sobre el ranking mundial */}
        {rankingType === 'global' && (
          <div className="bg-indigo-900/30 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-lg">
            <p className="text-indigo-200">
              <strong><MaterialIcon name="emoji_events" className="inline-block w-5 h-5 align-middle mr-1" /> Ranking Mundial:</strong> Compite con todos los jugadores.
              El ranking se basa en el número total de aciertos y precisión.
              <br />
              <em className="text-sm text-indigo-300">Nota: El ranking mundial no otorga monedas, solo gloria.</em>
            </p>
          </div>
        )}

        {/* Tabla de ranking */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-400 animate-pulse">
              Cargando ranking...
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {rankingType === 'category' && !selectedCategoryId
                ? 'Selecciona una categoría para ver el ranking'
                : 'Aún no hay participantes'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                      Posición
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
                      {rankingType === 'global' ? 'Aciertos Totales' : 'Aciertos (Cat.)'}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
                      Respondidas
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
                      Precisión
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
                      Victorias
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((user, index) => {
                    const isCurrentUser = user.id === userData?.id;
                    const position = index + 1;

                    return (
                      <tr
                        key={user.id}
                        className={`border-t border-gray-700/50 transition-colors ${
                          isCurrentUser
                            ? 'bg-indigo-900/30'
                            : index < 3 ? 'bg-yellow-900/20' : 'hover:bg-gray-700/30'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {position === 1 && <MaterialIcon name="emoji_events" className="text-yellow-500" />}
                            {position === 2 && <MaterialIcon name="emoji_events" className="text-gray-400" />}
                            {position === 3 && <MaterialIcon name="emoji_events" className="text-amber-700" />}
                            {position > 3 && (
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-gray-300">
                                {position}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${
                            isCurrentUser ? 'text-indigo-300' : 'text-gray-200'
                          }`}>
                            {user.displayName}
                            {isCurrentUser && <span className="text-gray-400"> (Tú)</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-green-400">
                            {user.correct || user.totalCorrect}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">
                          {user.total || user.totalQuestionsAnswered}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                            user.accuracy >= 70
                              ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                              : user.accuracy >= 40
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                              : 'bg-red-900/30 text-red-400 border border-red-700/50'
                          }`}>
                            {user.accuracy}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400">
                          <span>{user.wins || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Posición del usuario si no está en el top */}
        {userRank && userRank > 10 && (
          <div className="card mt-6 bg-indigo-900/30 border-2 border-indigo-700/50">
            <p className="text-center text-gray-300">
              Tu posición: <span className="font-bold text-indigo-400">#{userRank}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}


