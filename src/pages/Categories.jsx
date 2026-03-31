import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../services/firestore';

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  }

  // Obtener estadísticas de una categoría
  function getCategoryStats(categoryId) {
    const catStats = userData?.stats?.categoryStats?.[categoryId];
    if (!catStats) return { total: 0, correct: 0, accuracy: 0 };
    
    const accuracy = catStats.total > 0 
      ? Math.round((catStats.correct / catStats.total) * 100) 
      : 0;
    
    return { ...catStats, accuracy };
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
              <Link to="/categories" className="text-indigo-400 font-medium transition-colors">
                Categorías
              </Link>
              <Link to="/ranking" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Ranking
              </Link>
              <Link to="/propose" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Proponer Pregunta
              </Link>
              {userData?.isAdmin && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Panel Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 gradient-text">Categorías</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-400">Cargando categorías...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="card text-center text-gray-400">
            No hay categorías disponibles aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const stats = getCategoryStats(category.id);
              return (
                <Link
                  key={category.id}
                  to={`/questions/${category.id}`}
                  className="card hover-lift"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <MaterialIcon name="menu_book" className="text-indigo-400 text-3xl" />
                      <h3 className="text-xl font-bold text-indigo-400">
                        {category.name}
                      </h3>
                    </div>
                    <span className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium border border-indigo-700/50">
                      {stats.total} preguntas
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Aciertos: {stats.correct}/{stats.total}
                    </span>
                    <span className={`font-bold ${
                      stats.accuracy >= 70 ? 'text-green-400' :
                      stats.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {stats.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stats.accuracy >= 70 ? 'bg-green-500' :
                        stats.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stats.accuracy}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


