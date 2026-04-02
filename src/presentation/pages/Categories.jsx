import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories } from '../../services/firestore';

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();

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
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* TopNavBar */}
      <nav className="bg-[#fefccf] border-b-2 border-[#154212]/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-4xl">🇳🇮</span>
            <div>
              <h1 className="text-2xl font-headline font-black text-[#154212] uppercase tracking-tight">NicaQuizz</h1>
              <p className="text-[10px] text-[#154212]/60 font-medium">El Nacatamal del Conocimiento</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
            <Link to="/categories" className="text-[#154212] border-b-4 border-[#154212] pb-1 transition-colors">
              Categorías
            </Link>
            <Link to="/ranking" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Ranking
            </Link>
            <Link to="/shop" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Tienda
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#154212]/5 rounded-lg transition-all scale-95 active:scale-90 duration-200">
              <span className="material-symbols-outlined text-[#2D5A27]">notifications</span>
            </button>
            {currentUser ? (
              <Link
                to="/play"
                className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <span className="font-bold">Mi Cuenta</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                <span className="font-bold">Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-5xl font-headline font-black text-[#154212] mb-4 tracking-tight">Categorías</h1>
        <p className="text-xl text-[#42493e] mb-12 max-w-2xl">
          Elige tu especialidad culinaria y domina el arte del Nacatamal Digital
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-[#42493e] text-lg">Cargando categorías...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-[#154212]/10">
            <p className="text-[#42493e] text-lg">No hay categorías disponibles aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const stats = getCategoryStats(category.id);
              return (
                <Link
                  key={category.id}
                  to={`/questions/${category.id}`}
                  className="bg-white rounded-2xl p-8 transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(21,66,18,0.12)] border-2 border-[#154212]/5 hover:border-[#154212]/20"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#2D5A27]/10 rounded-xl flex items-center justify-center">
                      <MaterialIcon name="menu_book" className="text-[#2D5A27] text-3xl" />
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-[#154212]">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-[#42493e] mb-6">
                    {category.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-[#42493e]">Progreso</span>
                      <span className="text-[#2D5A27]">{stats.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-[#e6e5b9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2D5A27] rounded-full transition-all"
                        style={{ width: `${stats.accuracy}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#42493e]/60">
                      <span>Aciertos: {stats.correct}/{stats.total}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#154212] w-full mt-auto py-12 flex flex-col items-center gap-6 px-4 text-center">
        <div className="font-headline font-bold text-[#F4C430] text-xl tracking-tight">
          NicaQuizz
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-body text-xs tracking-wide text-[#fefccf]/80">
          <a href="#" className="hover:text-[#F4C430] transition-colors">
            Sobre el Proyecto
          </a>
          <a href="#" className="hover:text-[#F4C430] transition-colors">
            Contacto
          </a>
          <a href="#" className="hover:text-[#F4C430] transition-colors">
            Términos
          </a>
          <a href="#" className="hover:text-[#F4C430] transition-colors">
            Privacidad
          </a>
        </div>
        <p className="text-[#fefccf]/60 text-xs tracking-wide">
          © 2025 NicaQuizz - El Arte del Nacatamal Digital
        </p>
      </footer>
    </div>
  );
}
