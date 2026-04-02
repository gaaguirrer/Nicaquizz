/**
 * PlayMode.jsx - Dashboard Principal
 *
 * Página principal después de login.
 * Muestra categorías, reto diario y retos pendientes.
 *
 * El diseño es responsive: 1 columna en móvil, 2 en desktop.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchCategories, CATEGORIA_INGREDIENTE, getTodayChallenge, hasUserCompletedDailyChallenge } from '../../services/firestore';
import { getUserChallenges, getAvailableChallengers } from '../../services/firestore';
import UserMenu from '../components/UserMenu';
import IngredientIcon from '../components/IngredientIcon';

// Configuración de categorías
// Colores, íconos e ingredientes de cada categoría
const CATEGORY_CONFIG = {
  historia: {
    nombre: 'Historia',
    subtitulo: 'Nuestras Raíces',
    ingrediente: 'masa',
    ingredienteNombre: 'Masa / Maíz',
    icono: 'history_edu',
    color: 'bg-[#2D5A27]',
    colorClaro: 'bg-[#2D5A27]/5',
    borde: 'border-[#2D5A27]/20'
  },
  matematicas: {
    nombre: 'Matemáticas',
    subtitulo: 'Cuentas Claras',
    ingrediente: 'cerdo',
    ingredienteNombre: 'Carne de Cerdo',
    icono: 'calculate',
    color: 'bg-[#C41E3A]',
    colorClaro: 'bg-[#C41E3A]/5',
    borde: 'border-[#C41E3A]/20'
  },
  geografia: {
    nombre: 'Geografía',
    subtitulo: 'Tierras Fértiles',
    ingrediente: 'arroz',
    ingredienteNombre: 'Arroz',
    icono: 'public',
    color: 'bg-[#154212]',
    colorClaro: 'bg-[#154212]/5',
    borde: 'border-[#154212]/20'
  },
  ciencias: {
    nombre: 'Ciencias',
    subtitulo: 'Biodiversidad',
    ingrediente: 'papa',
    ingredienteNombre: 'Papa',
    icono: 'science',
    color: 'bg-[#8B5FBF]',
    colorClaro: 'bg-[#8B5FBF]/5',
    borde: 'border-[#8B5FBF]/20'
  },
  retos: {
    nombre: 'Retos',
    subtitulo: 'Desafío Diario',
    ingrediente: 'achiote',
    ingredienteNombre: 'Achiote',
    icono: 'emoji_events',
    color: 'bg-[#D9531E]',
    colorClaro: 'bg-[#D9531E]/5',
    borde: 'border-[#D9531E]/20'
  }
};

export default function PlayMode() {
  const { currentUser, userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [retosPendientes, setRetosPendientes] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosJuego();
  }, []);

  async function cargarDatosJuego() {
    try {
      const cats = await fetchCategories();
      setCategorias(cats);

      const retos = await getUserChallenges(currentUser.uid, 'pending');
      setRetosPendientes(retos);

      // Cargar reto diario
      const challenge = await getTodayChallenge();
      setDailyChallenge(challenge);

      // Verificar si ya completó el reto diario
      if (challenge) {
        const completed = await hasUserCompletedDailyChallenge(currentUser.uid);
        setDailyChallengeCompleted(completed);
      }
    } catch (error) {
      toast.error('Error al cargar datos del juego');
      console.error('Error al cargar datos del juego:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calcular estadísticas de usuario
  const monedas = userData?.coins || {};
  const stats = userData?.stats || {};

  const nivel = Math.floor((stats.totalQuestionsAnswered || 0) / 10) + 1;
  const tituloNivel = nivel >= 50 ? 'Maestro Supremo' : nivel >= 20 ? 'Maestro Cocinero' : nivel >= 10 ? 'Chef Experto' : 'Aprendiz';

  // Obtener estadísticas de una categoría
  function obtenerEstadisticas(categoriaId) {
    const catStats = stats.categoryStats?.[categoriaId];
    if (!catStats) return { total: 0, correct: 0, precision: 0 };

    const precision = catStats.total > 0
      ? Math.round((catStats.correct / catStats.total) * 100)
      : 0;

    return { ...catStats, precision };
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* Header Sticky */}
      <header className="bg-[#fefccf] border-b-2 border-[#154212]/10 shadow-[0_8px_32px_rgba(29,29,3,0.08)] sticky top-0 z-50">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-4xl">🇳🇮</span>
            <div>
              <h1 className="text-2xl font-headline font-black text-[#154212] uppercase tracking-tight">NicaQuizz</h1>
              <p className="text-[10px] text-[#154212]/60 font-medium">El Nacatamal del Conocimiento</p>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
            <Link to="/categories" className="text-[#154212] border-b-2 border-[#154212] pb-1 transition-colors">
              Categorías
            </Link>
            <Link to="/ranking" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Ranking
            </Link>
            <Link to="/shop" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Tienda
            </Link>
            <Link to="/friends" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Amigos
            </Link>
          </nav>

          {/* Usuario */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#154212]/5 rounded-lg transition-all scale-95 active:scale-90 duration-200">
              <span className="material-symbols-outlined text-[#2D5A27]">notifications</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#154212]/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#154212] uppercase tracking-widest">Nivel {nivel}</p>
                <p className="text-[10px] text-[#755b00] font-bold">{tituloNivel}</p>
              </div>
              <button className="scale-95 active:scale-90 duration-200">
                <span className="material-symbols-outlined text-4xl text-[#2D5A27]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal con Sidebar */}
      <div className="flex max-w-7xl mx-auto">

        {/* Sidebar */}
        <aside className="w-80 fixed right-8 top-24 hidden lg:block">
          <UserMenu />
        </aside>

        {/* Canvas Content */}
        <main className="flex-grow p-8 pr-80">
          
          {/* Header Section */}
          <section className="mb-12">
            <h1 className="text-5xl font-headline font-extrabold text-[#154212] mb-4 tracking-tight leading-none">
              ¿Qué vamos a <span className="text-[#755b00] italic">cocinar</span> hoy?
            </h1>
            <p className="text-[#42493e] max-w-xl text-lg">
              Completa las lecciones para recolectar ingredientes frescos y desbloquear las recetas más icónicas de nuestra tierra.
            </p>
          </section>

          {/* Retos Pendientes */}
          {retosPendientes.length > 0 && (
            <section className="mb-8 p-6 bg-[#F4C430]/20 border-2 border-[#F4C430]/50 rounded-xl">
              <h2 className="text-xl font-headline font-bold text-[#154212] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F4C430]">notifications</span>
                Retos Pendientes ({retosPendientes.length})
              </h2>
              <div className="space-y-3">
                {retosPendientes.map((reto) => (
                  <div key={reto.id} className="flex items-center justify-between bg-white/80 rounded-lg p-4 border border-[#154212]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xl">sports_martial_arts</span>
                      </div>
                      <div>
                        <p className="font-bold text-[#154212]">{reto.desafiante?.displayName || 'Jugador'}</p>
                        <p className="text-sm text-[#42493e]/60">
                          {reto.categoriaId ? `Categoría: ${reto.categoriaId}` : 'Reto abierto'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/challenge/${reto.id}`}
                      className="bg-[#2D5A27] hover:bg-[#154212] text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                      Aceptar
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reto Diario - Achiote */}
          {!loading && dailyChallenge && (
            <section className="mb-8">
              <div className={`group relative bg-gradient-to-br from-[#D9531E] to-[#B93B0E] rounded-xl p-8 transition-all hover:translate-y-[-4px] shadow-lg overflow-hidden border border-[#D9531E]/20 ${dailyChallengeCompleted ? 'opacity-75' : ''}`}>
                {/* Icono decorativo de fondo */}
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-9xl text-white">emoji_events</span>
                </div>

                <div className="relative z-10">
                  {/* Header de tarjeta */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-white text-[#D9531E] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {dailyChallengeCompleted ? 'Completado' : 'Disponible'}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-white/90 mb-1">Recompensa:</span>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-lg border border-white/30">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                        <span className="text-sm font-bold uppercase">1 Achiote</span>
                      </div>
                    </div>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-2xl font-headline font-bold text-white mb-2">
                    Desafío Diario
                  </h3>
                  <p className="text-white/90 text-sm mb-6">
                    {dailyChallengeCompleted 
                      ? '¡Felicidades! Ya completaste el reto de hoy. Vuelve mañana.' 
                      : `Responde correctamente ${dailyChallenge.totalQuestions || 10} preguntas de diversas categorías y gana un Achiote.`}
                  </p>

                  {/* Progreso */}
                  {dailyChallengeCompleted && (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-bold">¡Reto completado!</span>
                      </div>
                    </div>
                  )}

                  {/* Botón Jugar */}
                  <Link
                    to={dailyChallengeCompleted ? '/play' : `/questions/retos`}
                    className={`w-full bg-white hover:bg-white/90 text-[#D9531E] font-headline font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${dailyChallengeCompleted ? 'cursor-default pointer-events-none' : ''}`}
                  >
                    {dailyChallengeCompleted ? (
                      <>
                        <span className="material-symbols-outlined">check_circle</span>
                        Ya Completado
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">play_arrow</span>
                        Jugar Reto Diario
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Categories Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categorias.map((categoria) => {
              const config = CATEGORY_CONFIG[categoria.id] || CATEGORY_CONFIG.historia;
              const ingrediente = CATEGORIA_INGREDIENTE[categoria.id];
              const stats = obtenerEstadisticas(categoria.id);

              return (
                <div
                  key={categoria.id}
                  className="group relative bg-white rounded-xl p-8 transition-all hover:translate-y-[-4px] shadow-sm overflow-hidden border border-[#154212]/5 hover:shadow-[0_8px_32px_rgba(29,29,3,0.08)]"
                >
                  {/* Icono decorativo de fondo */}
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-9xl text-[#154212]">{config.icono}</span>
                  </div>

                  <div className="relative z-10">
                    {/* Header de tarjeta */}
                    <div className="flex justify-between items-start mb-6">
                      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest`}>
                        {config.nombre}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-[#755b00] mb-1">Gana:</span>
                        <div className="flex items-center gap-2 bg-[#ffdf90] text-[#1d1d03] px-3 py-1.5 rounded-lg border border-[#755b00]/10">
                          {ingrediente && (
                            <div className="w-5 h-5">
                              <IngredientIcon type={ingrediente} className="w-full h-full" />
                            </div>
                          )}
                          <span className="text-sm font-bold uppercase">{config.ingredienteNombre}</span>
                        </div>
                      </div>
                    </div>

                    {/* Título y descripción */}
                    <h3 className="text-2xl font-headline font-bold text-[#154212] mb-2">
                      {config.subtitulo}
                    </h3>
                    <p className="text-[#42493e]/80 text-sm mb-6">
                      {categoria.descripcion || `Domina ${config.nombre.toLowerCase()} y gana ingredientes`}
                    </p>

                    {/* Progreso */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-[#42493e]">Progreso de recolección</span>
                        <span className={config.color.replace('bg-', 'text-')}>{stats.precision}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#e6e5b9] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${config.color} rounded-full transition-all duration-500`}
                          style={{ width: `${stats.precision}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#42493e]/60">
                        <span>Aciertos: {stats.correct}/{stats.total}</span>
                      </div>
                    </div>

                    {/* Botón Jugar */}
                    <Link
                      to={`/questions/${categoria.id}`}
                      className={`w-full ${config.color} hover:opacity-90 text-white font-headline font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2`}
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Jugar Lección
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-[#154212]/10">
            <div className="flex flex-col items-center gap-6">
              <div className="font-headline font-bold text-[#F4C430] text-xl flex items-center gap-2">
                <span className="text-2xl">🇳🇮</span>
                NicaQuizz
              </div>
              <nav className="flex flex-wrap justify-center gap-8 text-xs tracking-wide text-[#fefccf]/80">
                <a href="#" className="text-[#42493e]/60 hover:text-[#154212] transition-colors underline decoration-[#F4C430]">
                  Sobre el Proyecto
                </a>
                <a href="#" className="text-[#42493e]/60 hover:text-[#154212] transition-colors">
                  Contacto
                </a>
                <a href="#" className="text-[#42493e]/60 hover:text-[#154212] transition-colors">
                  Términos
                </a>
                <a href="#" className="text-[#42493e]/60 hover:text-[#154212] transition-colors">
                  Privacidad
                </a>
              </nav>
              <p className="text-[#42493e]/40 text-xs tracking-wide">
                © 2025 NicaQuizz - El Arte del Modern Mestizaje
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
