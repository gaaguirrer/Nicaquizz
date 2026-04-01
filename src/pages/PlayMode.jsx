/**
 * PlayMode.jsx - Dashboard / Selección de Categorías de NicaQuizz
 * "Mi Alacena del Saber" - Diseño Claro Modern Mestizaje
 * 
 * Características:
 * - Header Sticky con nivel y avatar
 * - Sidebar "Mi Alacena" derecha fija con ingredientes
 * - Grid de Categorías tipo Bento
 * - Footer con enlaces
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, CATEGORIA_INGREDIENTE } from '../services/firestore';
import { getUserChallenges, getAvailableChallengers } from '../services/firestore';
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

// Configuración de categorías con colores
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
  }
};

export default function PlayMode() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [retosPendientes, setRetosPendientes] = useState([]);
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
    } catch (error) {
      console.error('Error al cargar datos del juego:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calcular estadísticas de usuario
  const monedas = userData?.coins || {};
  const stats = userData?.stats || {};
  
  const totalIngredientes = Object.values(monedas).reduce((sum, val) => sum + (val || 0), 0);
  const nacatamalesCount = Math.min(
    monedas.masa || 0,
    monedas.cerdo || 0,
    monedas.arroz || 0,
    monedas.papa || 0,
    monedas.chile || 0
  );

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

  const ingredientes = [
    { tipo: 'masa', nombre: 'Masa', cantidad: monedas.masa || 0, icono: 'bakery_dining', color: 'bg-[#F4C430]' },
    { tipo: 'cerdo', nombre: 'Cerdo', cantidad: monedas.cerdo || 0, icono: 'lunch_dining', color: 'bg-[#FF6B6B]' },
    { tipo: 'arroz', nombre: 'Arroz', cantidad: monedas.arroz || 0, icono: 'rice_bowl', color: 'bg-[#F5F5F5]' },
    { tipo: 'papa', nombre: 'Papa', cantidad: monedas.papa || 0, icono: 'egg', color: 'bg-[#C9A959]' },
    { tipo: 'chile', nombre: 'Chile', cantidad: monedas.chile || 0, icono: 'local_fire_department', color: 'bg-[#E74C3C]' }
  ];

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* Header Sticky */}
      <header className="bg-[#fefccf] border-b-2 border-[#154212]/10 shadow-[0_8px_32px_rgba(29,29,3,0.08)] sticky top-0 z-50">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🇳🇮</span>
            <div>
              <h1 className="text-2xl font-headline font-black text-[#154212] uppercase tracking-tight">NicaQuizz</h1>
              <p className="text-[10px] text-[#154212]/60 font-medium">El Nacatamal del Conocimiento</p>
            </div>
          </div>

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

          {/* Categories Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categorias.map((categoria) => {
              const config = CATEGORY_CONFIG[categoria.id] || CATEGORY_CONFIG.historia;
              const ingrediente = CATEGORIA_INGREDIENTE[categoria.id];
              const stats = obtenerEstadisticas(categoria.id);

              return (
                <div
                  key={categoria.id}
                  className="group relative bg-white rounded-xl p-8 transition-all hover:translate-y-[-4px] shadow-sm overflow-hidden border border-[#154212]/5 hover:shadow-[0_8px_32px_rgba(29,29,3,0.08)]"}
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

        {/* Sidebar "Mi Alacena" */}
        <aside className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-72 bg-[#fefccf]/90 backdrop-blur-xl flex flex-col p-6 border-l border-[#154212]/5 shadow-xl overflow-y-auto">
          
          {/* Header de Alacena */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#2D5A27] flex items-center justify-center text-white font-bold shadow-lg">
                <span className="material-symbols-outlined">kitchen</span>
              </div>
              <div>
                <h4 className="text-[#154212] font-bold font-headline">Mi Alacena</h4>
                <p className="text-xs text-[#755b00] font-medium uppercase tracking-wider">Ingredientes recolectados</p>
              </div>
            </div>
            
            {/* Progreso Total */}
            <div className="p-4 bg-[#2D5A27]/5 rounded-xl border border-[#2D5A27]/10">
              <div className="flex justify-between text-xs mb-2 font-bold text-[#154212]">
                <span>Total ingredientes</span>
                <span>{totalIngredientes}/25</span>
              </div>
              <div className="h-2 bg-[#e6e5b9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2D5A27] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalIngredientes / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lista de Ingredientes */}
          <nav className="flex-grow space-y-2">
            {ingredientes.map((ing) => (
              <div
                key={ing.tipo}
                className={`${ing.color} text-[#1d1d03] rounded-xl px-4 py-3 flex items-center gap-3 transition-transform hover:translate-x-[-4px] shadow-sm ${
                  ing.cantidad === 0 ? 'opacity-50 grayscale' : ''
                }`}
              >
                <span className="material-symbols-outlined text-xl">{ing.icono}</span>
                <span className="font-headline text-sm font-bold flex-grow">{ing.nombre}</span>
                <span className="font-bold text-xs bg-white/50 px-2 py-1 rounded">
                  {ing.cantidad}
                </span>
              </div>
            ))}
          </nav>

          {/* Nacatamales Completados */}
          <div className="mt-4 p-4 bg-gradient-to-r from-[#F4C430]/30 to-[#ffdf90]/30 rounded-xl border-2 border-[#F4C430]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4C430] to-[#DAA520] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#154212] uppercase">Nacatamales</p>
                <p className="text-2xl font-headline font-bold text-[#154212]">{nacatamalesCount}</p>
              </div>
            </div>
          </div>

          {/* Botón Ver Recetario */}
          <Link
            to="/shop"
            className="mt-4 bg-[#2D5A27] hover:bg-[#154212] text-white font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">menu_book</span>
            Ver Recetario
          </Link>
        </aside>
      </div>
    </div>
  );
}
