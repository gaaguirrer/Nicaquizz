/**
 * Ranking.jsx - Ranking de Maestros Cocineros de NicaQuizz
 * "El Fogón Supremo"
 * 
 * Características:
 * - Tabla de ranking con Top 3 estilizado
 * - Filtros por categoría
 * - Buscador de jugadores
 * - Misión del Día highlight card
 * - Top por categoría bento
 * - Sidebar Mi Despensa
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGlobalRanking, fetchCategoryRanking } from '../services/firestore';

// Datos simulados para el ranking
const RANKING_DATA = [
  { id: 1, nombre: 'Rodrigo Zelaya', nivel: 84, aciertos: 12402, precision: 98.4, titulo: 'Súper Chef', avatar: 'https://i.pravatar.cc/100?img=1', badge: 'workspace_premium' },
  { id: 2, nombre: 'Elena Murillo', nivel: 79, aciertos: 10850, precision: 96.2, titulo: 'Maestra Arrocera', avatar: 'https://i.pravatar.cc/100?img=2', badge: null },
  { id: 3, nombre: 'Juan C. García', nivel: 75, aciertos: 9921, precision: 94.8, titulo: 'Cocinero Experto', avatar: 'https://i.pravatar.cc/100?img=3', badge: null },
  { id: 4, nombre: 'María Fernández', nivel: 72, aciertos: 9456, precision: 93.5, titulo: 'Chef Senior', avatar: 'https://i.pravatar.cc/100?img=4', badge: null },
  { id: 5, nombre: 'Carlos Sánchez', nivel: 68, aciertos: 8923, precision: 92.1, titulo: 'Chef Senior', avatar: 'https://i.pravatar.cc/100?img=5', badge: null },
  { id: 6, nombre: 'Ana López', nivel: 65, aciertos: 8234, precision: 91.3, titulo: 'Chef', avatar: 'https://i.pravatar.cc/100?img=6', badge: null },
  { id: 7, nombre: 'Luis Martínez', nivel: 62, aciertos: 7845, precision: 90.7, titulo: 'Chef', avatar: 'https://i.pravatar.cc/100?img=7', badge: null },
  { id: 8, nombre: 'Carmen Ruiz', nivel: 59, aciertos: 7456, precision: 89.9, titulo: 'Chef', avatar: 'https://i.pravatar.cc/100?img=8', badge: null },
  { id: 9, nombre: 'Pedro González', nivel: 56, aciertos: 7123, precision: 89.2, titulo: 'Cocinero', avatar: 'https://i.pravatar.cc/100?img=9', badge: null },
  { id: 10, nombre: 'Sofía Hernández', nivel: 53, aciertos: 6789, precision: 88.5, titulo: 'Cocinero', avatar: 'https://i.pravatar.cc/100?img=10', badge: null }
];

// Categorías para filtros
const CATEGORIAS = [
  { id: 'general', nombre: 'General' },
  { id: 'historia', nombre: 'Historia' },
  { id: 'geografia', nombre: 'Geografía' },
  { id: 'ciencias', nombre: 'Ciencias' },
  { id: 'matematicas', nombre: 'Matemáticas' }
];

// Top por categoría
const TOP_CATEGORIAS = [
  { categoria: 'Historia', icono: 'history_edu', color: 'text-tertiary', bg: 'bg-tertiary-container/10', jugador: '@marcos_12' },
  { categoria: 'Geografía', icono: 'map', color: 'text-primary', bg: 'bg-primary-container/10', jugador: '@luisa_nic' },
  { categoria: 'Ciencias', icono: 'science', color: 'text-purple-600', bg: 'bg-purple-500/10', jugador: '@ciencia_nica' },
  { categoria: 'Matemáticas', icono: 'calculate', color: 'text-blue-600', bg: 'bg-blue-500/10', jugador: '@mate_master' }
];

export default function Ranking() {
  const { currentUser } = useAuth();
  const [filtro, setFiltro] = useState('general');
  const [busqueda, setBusqueda] = useState('');
  const [ranking, setRanking] = useState(RANKING_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRanking();
  }, [filtro]);

  async function cargarRanking() {
    setLoading(true);
    try {
      // En producción, usar fetchGlobalRanking o fetchCategoryRanking
      // Por ahora usamos datos simulados
      await new Promise(resolve => setTimeout(resolve, 500));
      setRanking(RANKING_DATA);
    } catch (error) {
      console.error('Error al cargar ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar ranking por búsqueda
  const rankingFiltrado = ranking.filter(jugador =>
    jugador.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ingredientes para sidebar
  const ingredientes = [
    { tipo: 'masa', nombre: 'Masa', icono: 'bakery_dining', activo: false },
    { tipo: 'cerdo', nombre: 'Cerdo', icono: 'restaurant', activo: true },
    { tipo: 'arroz', nombre: 'Arroz', icono: 'grass', activo: false },
    { tipo: 'papa', nombre: 'Papa', icono: 'breakfast_dining', activo: false },
    { tipo: 'chile', nombre: 'Chile', icono: 'hot_tub', activo: false }
  ];

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      
      {/* TopNavBar */}
      <header className="bg-[#fefccf] border-none shadow-[0_8px_32px_rgba(29,29,3,0.08)] sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <Link to="/" className="text-3xl font-black text-[#154212] tracking-tighter font-headline">
            NicaQuizz
          </Link>
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/categories" className="text-stone-600 font-medium font-headline hover:text-[#755b00] transition-colors duration-300">
              Categorías
            </Link>
            <Link to="/ranking" className="text-[#154212] border-b-4 border-[#154212] pb-1 font-bold tracking-tight font-headline hover:text-[#755b00] transition-colors duration-300">
              Ranking
            </Link>
            <Link to="/shop" className="text-stone-600 font-medium font-headline hover:text-[#755b00] transition-colors duration-300">
              Tienda
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              to={currentUser ? '/profile' : '/auth'}
              className="scale-95 active:scale-90 transition-transform text-[#154212]"
            >
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto flex min-h-screen">
        
        {/* SideNavBar - Mi Despensa (Desktop Only) */}
        <aside className="hidden lg:flex flex-col h-screen w-72 bg-[#fefccf] sticky top-[72px] py-8 space-y-4 shadow-xl border-r border-[#154212]/5">
          <div className="px-8 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#fccc38] flex items-center justify-center border-2 border-[#154212]">
                <span className="material-symbols-outlined text-[#1d1d03]">skillet</span>
              </div>
              <div>
                <p className="font-headline font-bold text-[#154212] leading-tight">Mi Despensa</p>
                <p className="text-[10px] text-[#154212]/60 uppercase tracking-widest">Ingredientes recolectados</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-col space-y-1 flex-grow">
            {ingredientes.map((ing) => (
              <Link
                key={ing.tipo}
                to="/shop"
                className={`${
                  ing.activo
                    ? 'bg-[#755b00] text-white rounded-full mx-4 my-1'
                    : 'text-[#154212] opacity-70 hover:bg-[#154212]/10'
                } px-6 py-3 font-headline text-sm uppercase tracking-widest transition-all flex items-center gap-4 ${
                  !ing.activo && 'translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: ing.activo ? "'FILL' 1" : "'FILL' 0" }}>
                  {ing.icono}
                </span>
                {ing.nombre}
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-6 pb-8">
            <Link
              to="/shop"
              className="w-full py-4 bg-[#154212] text-white font-headline font-bold rounded-xl shadow-lg hover:bg-[#2D5A27] transition-all active:scale-95 block text-center"
            >
              Cocinar Nacatamal
            </Link>
          </div>
        </aside>

        {/* Content Canvas */}
        <section className="flex-1 px-8 py-12 md:px-16 overflow-x-hidden">
          
          {/* Header Section */}
          <div className="mb-12 relative">
            <div className="absolute -top-12 -right-8 w-64 h-64 vapor-progress rounded-full blur-3xl opacity-60"></div>
            <h1 className="text-5xl md:text-6xl font-black text-[#154212] font-headline tracking-tighter mb-4 leading-none">
              Ranking de <br/><span className="text-[#755b00]">Maestros Cocineros</span>
            </h1>
            <p className="text-[#42493e] font-body max-w-xl text-lg">
              Los alquimistas del sabor que han dominado el arte del conocimiento nicaragüense. ¿Tienes lo necesario para alcanzar el fogón supremo?
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            
            {/* Main Ranking Table Container */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#72796e]">search</span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#f8f6c9] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 rounded-t-xl font-body transition-all outline-none"
                    placeholder="Buscar cocinero..."
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFiltro(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold font-headline whitespace-nowrap cursor-pointer transition-colors ${
                        filtro === cat.id
                          ? 'bg-[#fccc38] text-[#1d1d03]'
                          : 'bg-[#ffdf90] text-[#584400] hover:bg-[#fccc38]'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ranking Table */}
              {loading ? (
                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(29,29,3,0.06)] overflow-hidden p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#154212] animate-spin inline-block">progress_activity</span>
                  <p className="text-[#42493e] mt-4">Cargando ranking...</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(29,29,3,0.06)] overflow-hidden">
                  {/* Header de tabla */}
                  <div className="grid grid-cols-12 gap-4 p-6 border-b border-[#f2f0c4] text-xs font-black uppercase tracking-widest text-[#154212]/50 font-headline">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Maestro</div>
                    <div className="col-span-2 text-center">Nivel</div>
                    <div className="col-span-2 text-center">Aciertos</div>
                    <div className="col-span-2 text-right">Precisión</div>
                  </div>

                  {/* Lista de jugadores */}
                  <div className="divide-y divide-[#f2f0c4]">
                    {rankingFiltrado.map((jugador, index) => {
                      const esTop1 = index === 0;
                      const esTop2 = index === 1;
                      const esTop3 = index === 2;

                      return (
                        <div
                          key={jugador.id}
                          className={`grid grid-cols-12 gap-4 p-6 items-center group transition-colors ${
                            esTop1 ? 'bg-[#fccc38]/10 hover:bg-[#fccc38]/20' : 'hover:bg-[#f8f6c9]'
                          }`}
                        >
                          {/* Ranking Number */}
                          <div className="col-span-1">
                            {esTop1 ? (
                              <span className="text-2xl font-black text-[#755b00]">01</span>
                            ) : esTop2 ? (
                              <span className="text-xl font-bold text-stone-400">02</span>
                            ) : esTop3 ? (
                              <span className="text-xl font-bold text-stone-300">03</span>
                            ) : (
                              <span className="text-lg font-bold text-[#154212]/50">#{index + 1}</span>
                            )}
                          </div>

                          {/* Jugador Info */}
                          <div className="col-span-5 flex items-center gap-4">
                            <div className="relative">
                              <img
                                alt={jugador.nombre}
                                className={`w-12 h-12 rounded-full object-cover ${
                                  esTop1 ? 'border-2 border-[#755b00]' : 'border-2 border-stone-200'
                                }`}
                                src={jugador.avatar}
                              />
                              {esTop1 && (
                                <span className="absolute -bottom-1 -right-1 bg-[#755b00] text-white rounded-full p-0.5 scale-75">
                                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-headline font-bold text-[#1d1d03] group-hover:text-[#154212] transition-colors">
                                {jugador.nombre}
                              </h3>
                              {jugador.titulo && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  esTop1
                                    ? 'bg-[#bcf0ae] text-[#23501e]'
                                    : 'bg-[#e6e5b9] text-[#42493e]'
                                }`}>
                                  {jugador.titulo}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Nivel */}
                          <div className="col-span-2 text-center font-bold font-headline text-[#154212]">
                            Nvl {jugador.nivel}
                          </div>

                          {/* Aciertos */}
                          <div className="col-span-2 text-center font-body text-[#42493e]">
                            {jugador.aciertos.toLocaleString()}
                          </div>

                          {/* Precisión */}
                          <div className="col-span-2 text-right font-headline font-black text-lg">
                            <span className={esTop1 ? 'text-[#755b00]' : 'text-[#154212]'}>
                              {jugador.precision}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Missions & Highlights */}
            <div className="space-y-8">
              
              {/* Misión del Día Highlight Card */}
              <div className="bg-[#154212] text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl group">
                <div className="absolute -bottom-8 -right-8 opacity-20 transition-transform group-hover:scale-110 duration-500">
                  <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
                </div>
                <div className="relative z-10">
                  <span className="bg-[#fccc38] text-[#1d1d03] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6 inline-block">
                    Misión del Día
                  </span>
                  <h2 className="text-3xl font-black font-headline leading-tight mb-4 tracking-tighter">
                    El Secreto del Achiote
                  </h2>
                  <p className="text-[#a1d494] text-sm font-body mb-8 opacity-90 leading-relaxed">
                    Completa 5 quizzes de la categoría "Cultura" con una precisión mayor al 90% para obtener el ingrediente secreto.
                  </p>
                  <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                      <span>Progreso</span>
                      <span>3/5</span>
                    </div>
                    <div className="h-2 bg-[#2D5A27] rounded-full overflow-hidden">
                      <div className="h-full bg-[#fccc38] w-[60%]"></div>
                    </div>
                  </div>
                  <Link
                    to="/categories"
                    className="w-full py-4 bg-[#fccc38] text-[#1d1d03] font-headline font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-95 block text-center"
                  >
                    Continuar Desafío
                  </Link>
                </div>
              </div>

              {/* Category Mastery Bento Small */}
              <div className="bg-[#f2f0c4] rounded-3xl p-6 border border-[#154212]/5">
                <h4 className="font-headline font-black text-[#154212] text-sm uppercase tracking-widest mb-4">
                  Top por Categoría
                </h4>
                <div className="space-y-4">
                  {TOP_CATEGORIAS.map((top) => (
                    <div
                      key={top.categoria}
                      className="flex items-center justify-between p-3 bg-white rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${top.bg} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined ${top.color} text-lg`}>
                            {top.icono}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-headline text-[#154212]">
                          {top.categoria}
                        </span>
                      </div>
                      <span className="text-xs text-[#42493e] italic">
                        {top.jugador}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#154212] py-12 text-center w-full">
        <div className="flex flex-col items-center justify-center space-y-6 max-w-screen-xl mx-auto px-4">
          <div className="text-[#F4C430] font-bold font-headline text-xl">NicaQuizz</div>
          <div className="flex gap-8 flex-wrap justify-center">
            <a href="#" className="text-[#fefccf]/80 font-headline text-xs font-light tracking-wide hover:text-[#F4C430] transition-colors">
              Sobre el Proyecto
            </a>
            <a href="#" className="text-[#fefccf]/80 font-headline text-xs font-light tracking-wide hover:text-[#F4C430] transition-colors">
              Cultura Nicaragüense
            </a>
            <a href="#" className="text-[#fefccf]/80 font-headline text-xs font-light tracking-wide hover:text-[#F4C430] transition-colors">
              Contacto
            </a>
          </div>
          <p className="text-[#fefccf]/60 font-headline text-xs font-light tracking-wide">
            © 2025 NicaQuizz - El Arte del Nacatamal Digital
          </p>
        </div>
      </footer>
    </div>
  );
}
