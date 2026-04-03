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
import { fetchCategories, CATEGORIA_INGREDIENTE, getTodayChallenge, hasUserCompletedDailyChallenge, clearCache, createChallenge, getAvailableChallengers } from '../../services/firestore';
import { getUserChallenges } from '../../services/firestore';
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
  },
  mezcolanza: {
    nombre: 'Mezcolanza',
    subtitulo: 'Mezcla de Saberes',
    ingrediente: 'chile',
    ingredienteNombre: 'Chile',
    icono: 'shuffle',
    color: 'bg-[#FF6B35]',
    colorClaro: 'bg-[#FF6B35]/5',
    borde: 'border-[#FF6B35]/20'
  },
  reto_achiote: {
    nombre: 'Reto del Achiote',
    subtitulo: 'El Desafío Supremo',
    ingrediente: 'achiote',
    ingredienteNombre: 'Achiote',
    icono: 'auto_awesome',
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

  // Estados para modal de reto
  const [modalReto, setModalReto] = useState({ abierto: false, categoriaId: null });
  const [jugadoresOnline, setJugadoresOnline] = useState([]);
  const [cargandoJugadores, setCargandoJugadores] = useState(false);

  useEffect(() => {
    cargarDatosJuego();
  }, []);

  async function cargarDatosJuego() {
    try {
      // Limpiar caché de categorías para obtener datos frescos
      clearCache('categories');

      // Cargar categorías (crítico)
      const cats = await fetchCategories();
      console.log('PlayMode - Categorías cargadas:', cats.map(c => c.id));
      setCategorias(cats);

      // Cargar retos pendientes (opcional - puede fallar si no hay índice)
      try {
        const retos = await getUserChallenges(currentUser.uid, 'pending');
        setRetosPendientes(retos);
      } catch (error) {
        console.warn('No se pudieron cargar los retos pendientes:', error.message);
        setRetosPendientes([]);
      }

      // Cargar reto diario (opcional)
      try {
        const challenge = await getTodayChallenge();
        setDailyChallenge(challenge);

        if (challenge) {
          const completed = await hasUserCompletedDailyChallenge(currentUser.uid);
          setDailyChallengeCompleted(completed);
        }
      } catch (error) {
        console.warn('No se pudo cargar el reto diario:', error.message);
      }
    } catch (error) {
      console.error('Error crítico al cargar datos del juego:', error);
      toast.error('Error al cargar categorías');
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

  // Abrir modal de selección de reto
  async function abrirModalReto(categoriaId) {
    setModalReto({ abierto: true, categoriaId });
    setCargandoJugadores(true);
    try {
      const jugadores = await getAvailableChallengers();
      // Filtrarse a sí mismo
      const filtrados = jugadores.filter(j => j.id !== currentUser.uid);
      setJugadoresOnline(filtrados);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      setJugadoresOnline([]);
    } finally {
      setCargandoJugadores(false);
    }
  }

  // Cerrar modal
  function cerrarModalReto() {
    setModalReto({ abierto: false, categoriaId: null });
    setJugadoresOnline([]);
  }

  // Reto abierto (jugar solo)
  function jugarRetoAbierto() {
    cerrarModalReto();
    navigate(`/questions/${modalReto.categoriaId}`);
  }

  // Retar a un jugador específico
  async function retarJugador(jugadorId) {
    if (!currentUser || !modalReto.categoriaId) return;

    try {
      // Crear reto en Firestore
      const challengeId = await createChallenge(
        currentUser.uid,
        jugadorId,
        modalReto.categoriaId,
        false
      );

      toast.success('¡Reto enviado!');
      cerrarModalReto();

      // Navegar a la página del reto para esperar
      navigate(`/challenge/${challengeId}`);
    } catch (error) {
      toast.error(error.message || 'Error al crear reto');
    }
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
            <button className="p-2 hover:bg-[#154212]/5 rounded-lg transition-all scale-95 active:scale-90 duration-200 relative">
              <span className="material-symbols-outlined text-[#2D5A27]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C41E3A] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#154212]/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#154212] uppercase tracking-widest">{userData?.displayName || 'Usuario'}</p>
                <p className="text-[10px] text-[#755b00] font-bold">Nivel {nivel} - {tituloNivel}</p>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto">

        {/* Canvas Content */}
        <main className="p-8">
          
          {/* Header Section */}
          <section className="mb-8">
            <h1 className="text-3xl font-headline font-extrabold text-[#154212] mb-2 tracking-tight leading-none">
              ¿Qué vamos a <span className="text-[#755b00] italic">cocinar</span> hoy?
            </h1>
            <p className="text-[#42493e] max-w-xl text-base">
              Completa las lecciones para recolectar ingredientes frescos y desbloquear las recetas más icónicas de nuestra tierra.
            </p>
          </section>

          {/* Retos Pendientes */}
          {retosPendientes.length > 0 && (
            <section className="mb-6 p-4 bg-[#F4C430]/20 border-2 border-[#F4C430]/50 rounded-xl">
              <h2 className="text-lg font-headline font-bold text-[#154212] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F4C430] text-xl">notifications</span>
                Retos Pendientes ({retosPendientes.length})
              </h2>
              <div className="space-y-2">
                {retosPendientes.map((reto) => (
                  <div key={reto.id} className="flex items-center justify-between bg-white/80 rounded-lg p-3 border border-[#154212]/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-base">sports_martial_arts</span>
                      </div>
                      <div>
                        <p className="font-bold text-[#154212] text-sm">{reto.desafiante?.displayName || 'Jugador'}</p>
                        <p className="text-xs text-[#42493e]/60">
                          {reto.categoriaId ? `Categoría: ${reto.categoriaId}` : 'Reto abierto'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/challenge/${reto.id}`}
                      className="bg-[#2D5A27] hover:bg-[#154212] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all"
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
            <section className="mb-6">
              <div className={`group relative bg-gradient-to-br from-[#D9531E] to-[#B93B0E] rounded-xl p-5 transition-all hover:translate-y-[-4px] shadow-lg overflow-hidden border border-[#D9531E]/20 ${dailyChallengeCompleted ? 'opacity-75' : ''}`}>
                {/* Icono decorativo de fondo */}
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-9xl text-white">emoji_events</span>
                </div>

                <div className="relative z-10">
                  {/* Header de tarjeta */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-white text-[#D9531E] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {dailyChallengeCompleted ? 'Completado' : 'Disponible'}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-white/90 mb-1">Recompensa:</span>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur text-white px-2 py-1 rounded-lg border border-white/30">
                        <span className="material-symbols-outlined text-base">auto_awesome</span>
                        <span className="text-xs font-bold uppercase">1 Achiote</span>
                      </div>
                    </div>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-xl font-headline font-bold text-white mb-1.5">
                    Desafío Diario
                  </h3>
                  <p className="text-white/90 text-xs mb-4">
                    {dailyChallengeCompleted
                      ? '¡Felicidades! Ya completaste el reto de hoy. Vuelve mañana.'
                      : `Responde correctamente ${dailyChallenge.totalQuestions || 10} preguntas de diversas categorías y gana un Achiote.`}
                  </p>

                  {/* Progreso */}
                  {dailyChallengeCompleted && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span className="font-bold text-sm">¡Reto completado!</span>
                      </div>
                    </div>
                  )}

                  {/* Botón Jugar */}
                  <Link
                    to={dailyChallengeCompleted ? '/play' : `/questions/retos`}
                    className={`w-full bg-white hover:bg-white/90 text-[#D9531E] font-headline font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm ${dailyChallengeCompleted ? 'cursor-default pointer-events-none' : ''}`}
                  >
                    {dailyChallengeCompleted ? (
                      <>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Ya Completado
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                        Jugar Reto Diario
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Categories Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => {
              const config = CATEGORY_CONFIG[categoria.id] || CATEGORY_CONFIG.historia;
              const ingrediente = CATEGORIA_INGREDIENTE[categoria.id];
              const stats = obtenerEstadisticas(categoria.id);

              return (
                <div
                  key={categoria.id}
                  className="group relative bg-white rounded-xl p-5 transition-all hover:translate-y-[-4px] shadow-sm overflow-hidden border border-[#154212]/5 hover:shadow-[0_8px_32px_rgba(29,29,3,0.08)]"
                >
                  {/* Icono decorativo de fondo */}
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-9xl text-[#154212]">{config.icono}</span>
                  </div>

                  <div className="relative z-10">
                    {/* Header de tarjeta */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`${config.color} text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
                        {config.nombre}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-[#755b00] mb-1">Gana:</span>
                        <div className="flex items-center gap-1.5 bg-[#ffdf90] text-[#1d1d03] px-2 py-1 rounded-lg border border-[#755b00]/10">
                          {ingrediente && (
                            <div className="w-4 h-4">
                              <IngredientIcon type={ingrediente} className="w-full h-full" />
                            </div>
                          )}
                          <span className="text-xs font-bold uppercase">{config.ingredienteNombre}</span>
                        </div>
                      </div>
                    </div>

                    {/* Título y descripción */}
                    <h3 className="text-lg font-headline font-bold text-[#154212] mb-1.5">
                      {config.subtitulo}
                    </h3>
                    <p className="text-[#42493e]/80 text-xs mb-4">
                      {categoria.descripcion || `Domina ${config.nombre.toLowerCase()} y gana ingredientes`}
                    </p>

                    {/* Progreso */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#42493e]">Progreso</span>
                        <span className={config.color.replace('bg-', 'text-')}>{stats.precision}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#e6e5b9] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${config.color} rounded-full transition-all duration-500`}
                          style={{ width: `${stats.precision}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#42493e]/60">
                        <span>Aciertos: {stats.correct}/{stats.total}</span>
                      </div>
                    </div>

                    {/* Botón Jugar */}
                    <button
                      onClick={() => abrirModalReto(categoria.id)}
                      className={`w-full ${config.color} hover:opacity-90 text-white font-headline font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm`}
                    >
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                      Jugar Lección
                    </button>
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

        {/* Modal de Selección de Reto */}
        {modalReto.abierto && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={cerrarModalReto}
            />

            {/* Modal */}
            <div className="relative bg-[#fefccf] rounded-2xl shadow-2xl w-full max-w-md border-4 border-[#154212]/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2D5A27] to-[#154212] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-headline font-bold text-white">
                    Elige tu Reto
                  </h3>
                  <button
                    onClick={cerrarModalReto}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 space-y-4">
                {/* Opción: Reto Abierto */}
                <button
                  onClick={jugarRetoAbierto}
                  className="w-full bg-[#2D5A27]/10 hover:bg-[#2D5A27]/20 border-2 border-[#2D5A27]/30 rounded-xl p-4 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2D5A27] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#154212]">Reto Abierto</p>
                      <p className="text-xs text-[#42493e]">Juega solo y gana ingredientes</p>
                    </div>
                  </div>
                </button>

                {/* Separador */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#154212]/10" />
                  <span className="text-xs font-bold text-[#154212]/40 uppercase">o</span>
                  <div className="flex-1 h-px bg-[#154212]/10" />
                </div>

                {/* Opción: Retar Jugador */}
                <div className="bg-[#F4C430]/10 border-2 border-[#F4C430]/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#F4C430] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">people</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#154212]">Retar a un Jugador</p>
                      <p className="text-xs text-[#42493e]">Elige un oponente conectado</p>
                    </div>
                  </div>

                  {/* Lista de jugadores online */}
                  {cargandoJugadores ? (
                    <div className="text-center py-4">
                      <span className="material-symbols-outlined text-[#154212]/40 animate-spin inline-block">progress_activity</span>
                      <p className="text-xs text-[#42493e]/60 mt-2">Cargando jugadores...</p>
                    </div>
                  ) : jugadoresOnline.length === 0 ? (
                    <div className="text-center py-4">
                      <span className="material-symbols-outlined text-[#154212]/20 text-3xl">person_off</span>
                      <p className="text-xs text-[#42493e]/60 mt-2">No hay jugadores conectados</p>
                      <button
                        onClick={jugarRetoAbierto}
                        className="mt-2 text-xs text-[#2D5A27] font-bold underline"
                      >
                        Jugar reto abierto en su lugar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {jugadoresOnline.map((jugador) => (
                        <button
                          key={jugador.id}
                          onClick={() => retarJugador(jugador.id)}
                          className="w-full flex items-center gap-3 bg-white/70 hover:bg-white rounded-lg p-3 transition-all border border-[#154212]/10"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white font-bold text-sm">
                              {(jugador.displayName || 'J').charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-[#154212] truncate">
                              {jugador.displayName || 'Jugador'}
                            </p>
                            <p className="text-[10px] text-[#42493e]/60">
                              Nivel {Math.floor((jugador.stats?.totalQuestionsAnswered || 0) / 10) + 1}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-[#2D5A27] text-xl">sword_rose</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
