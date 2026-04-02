/**
 * AdminPanel.jsx - Panel de Control Docente de NicaQuizz
 * "El Fogón del Maestro"
 * 
 * Características:
 * - Sidebar de navegación
 * - Stats Bento Grid (Preguntas, Usuarios, Monedas)
 * - Lista de preguntas pendientes con aprobar/rechazar
 * - Filtros por categoría
 * - Paginación
 * - FAB para nuevo aviso
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Preguntas pendientes simuladas
const PREGUNTAS_PENDIENTES = [
  {
    id: 1,
    categoria: 'Gastronomía',
    dificultad: 'Intermedio',
    texto: '¿Cuál es el ingrediente principal que le da el color característico a la masa del nacatamal?',
    opciones: ['A. Achiote', 'B. Pimentón', 'C. Chile de árbol', 'D. Cúrcuma'],
    tiempo: 'hace 2 horas',
    color: 'border-[#154212]',
    badgeColor: 'bg-[#154212]/10 text-[#154212]',
    iconoDificultad: 'signal_cellular_alt'
  },
  {
    id: 2,
    categoria: 'Historia',
    dificultad: 'Avanzado',
    texto: '¿En qué año se firmó el acta de Independencia de Centroamérica en la que Nicaragua participó?',
    opciones: ['A. 1821', 'B. 1810', 'C. 1838', 'D. 1900'],
    tiempo: 'hace 5 horas',
    color: 'border-[#79001c]',
    badgeColor: 'bg-[#79001c]/10 text-[#79001c]',
    iconoDificultad: 'signal_cellular_alt_2_bar'
  },
  {
    id: 3,
    categoria: 'Geografía',
    dificultad: 'Fácil',
    texto: '¿Cómo se le conoce popularmente al Lago Cocibolca?',
    opciones: ['A. El Gran Lago de Nicaragua', 'B. Lago de Managua', 'C. Laguna de Apoyo', 'D. El Ojo de Agua'],
    tiempo: 'hace 1 día',
    color: 'border-[#755b00]',
    badgeColor: 'bg-[#755b00]/10 text-[#755b00]',
    iconoDificultad: 'signal_cellular_alt_1_bar'
  }
];

// Categorías para filtros
const CATEGORIAS = ['Todos', 'Gastronomía', 'Historia', 'Geografía', 'Ciencias'];

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [preguntas] = useState(PREGUNTAS_PENDIENTES);

  // Stats
  const stats = {
    preguntasPendientes: 42,
    nuevosUsuarios: 128,
    monedasRepartidas: '12.5k'
  };

  async function handleAprobar(id) {
    console.log('Aprobando pregunta:', id);
    // En producción: llamar a API para aprobar
  }

  async function handleRechazar(id) {
    console.log('Rechazando pregunta:', id);
    // En producción: llamar a API para rechazar
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fefccf] text-[#1d1d03] font-body">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col h-screen w-72 rounded-r-[2rem] sticky left-0 top-0 bg-[#fefccf] shadow-xl py-8 space-y-4">
        <div className="px-8 mb-8">
          <h1 className="text-3xl font-black text-[#154212] tracking-tighter font-headline">NicaQuizz</h1>
          <p className="text-[0.65rem] uppercase tracking-widest text-[#755b00] font-bold mt-1">
            Panel de Control Docente
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-4 bg-[#755b00] text-white rounded-full mx-4 my-1 px-6 py-3 transition-transform translate-x-1"
          >
            <span className="material-symbols-outlined">pending_actions</span>
            <span className="font-headline text-sm uppercase tracking-widest">Preguntas Pendientes</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-4 text-[#154212] opacity-70 px-8 py-3 hover:bg-[#154212]/10 transition-all font-headline text-sm uppercase tracking-widest"
          >
            <span className="material-symbols-outlined">category</span>
            <span>Categorías</span>
          </Link>
          <Link
            to="/admin/currencies"
            className="flex items-center gap-4 text-[#154212] opacity-70 px-8 py-3 hover:bg-[#154212]/10 transition-all font-headline text-sm uppercase tracking-widest"
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Monedas</span>
          </Link>

          {/* Mi Despensa */}
          <div className="pt-8 px-8">
            <p className="text-[10px] font-bold text-[#154212]/60 uppercase tracking-[0.2em] mb-4">
              Mi Despensa
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#154212] opacity-80">
                <span className="material-symbols-outlined text-lg">bakery_dining</span>
                <span className="text-xs font-headline tracking-widest uppercase">Masa</span>
              </div>
              <div className="flex items-center gap-3 text-[#154212] opacity-80">
                <span className="material-symbols-outlined text-lg">restaurant</span>
                <span className="text-xs font-headline tracking-widest uppercase">Cerdo</span>
              </div>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="px-6 mt-auto">
          <div className="bg-[#f2f0c4] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#fccc38] flex items-center justify-center text-[#1d1d03]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1d1d03]">Prof. Ramírez</p>
              <p className="text-[10px] text-[#72796e]">Editor Senior</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Bar */}
        <header className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto bg-[#fefccf] border-none shadow-[0_8px_32px_rgba(29,29,3,0.08)] sticky top-0 z-10 md:relative md:shadow-none">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight text-[#154212] font-headline">
              Preguntas Pendientes
            </h2>
            <p className="text-xs text-[#72796e] font-medium">
              Revisión de contenido enviado por la comunidad
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined p-2 rounded-full hover:bg-[#f2f0c4] transition-colors text-[#154212]">
              notifications
            </button>
            <button className="material-symbols-outlined p-2 rounded-full hover:bg-[#f2f0c4] transition-colors text-[#154212]">
              settings
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preguntas por Revisar */}
            <div className="bg-[#2D5A27] p-6 rounded-xl text-white flex justify-between items-end relative overflow-hidden group shadow-lg">
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-80 mb-1">Preguntas por Revisar</p>
                <p className="text-4xl font-black font-headline">{stats.preguntasPendientes}</p>
              </div>
              <span className="material-symbols-outlined text-6xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                fact_check
              </span>
              <div className="bg-[#154212]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm relative z-10">
                +5 hoy
              </div>
            </div>

            {/* Nuevos Usuarios */}
            <div className="bg-[#fccc38] p-6 rounded-xl text-[#1d1d03] flex justify-between items-end relative overflow-hidden group shadow-lg">
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-80 mb-1">Nuevos Usuarios</p>
                <p className="text-4xl font-black font-headline">{stats.nuevosUsuarios}</p>
              </div>
              <span className="material-symbols-outlined text-6xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                group_add
              </span>
              <div className="bg-[#755b00]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm relative z-10">
                Esta semana
              </div>
            </div>

            {/* Monedas Repartidas */}
            <div className="bg-[#e6e5b9] p-6 rounded-xl text-[#1d1d03] flex justify-between items-end relative overflow-hidden group shadow-lg border border-[#c2c9bb]/10">
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-80 mb-1">Monedas Repartidas</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#755b00]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    stars
                  </span>
                  <p className="text-4xl font-black font-headline">{stats.monedasRepartidas}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-6xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                toll
              </span>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            
            {/* Filters */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroActivo(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      filtroActivo === cat
                        ? 'bg-[#ffdf90] text-[#1d1d03]'
                        : 'bg-[#eceabe] text-[#72796e] hover:bg-[#ffdf90]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 text-[#154212] font-bold text-sm">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filtrar
              </button>
            </div>

            {/* Question Cards */}
            <div className="space-y-4">
              {preguntas.map((pregunta) => (
                <div
                  key={pregunta.id}
                  className={`bg-[#f8f6c9] p-6 rounded-xl shadow-sm ${pregunta.color} border-l-4 transition-all hover:translate-x-1 group`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`${pregunta.badgeColor} px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest`}>
                          {pregunta.categoria}
                        </span>
                        <span className="text-[#72796e] text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">{pregunta.iconoDificultad}</span>
                          {pregunta.dificultad}
                        </span>
                        <span className="text-[#72796e] text-xs">• {pregunta.tiempo}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1d1d03] leading-tight">
                        {pregunta.texto}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                        {pregunta.opciones.map((opcion, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-[#fefccf] text-[11px] border border-[#c2c9bb]/20 italic"
                          >
                            {opcion}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-3 shrink-0">
                      <button
                        onClick={() => handleAprobar(pregunta.id)}
                        className="flex-1 md:w-32 bg-[#2D5A27] text-white py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(pregunta.id)}
                        className="flex-1 md:w-32 bg-[#e6e5b9] text-[#79001c] py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#ffdad9] transition-colors active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center pt-8 gap-2">
              <button className="w-10 h-10 rounded-full border border-[#c2c9bb] flex items-center justify-center text-[#154212] hover:bg-[#f2f0c4] transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-[#154212] text-white font-bold text-sm">1</button>
              <button className="w-10 h-10 rounded-full hover:bg-[#f2f0c4] text-[#72796e] font-bold text-sm">2</button>
              <button className="w-10 h-10 rounded-full hover:bg-[#f2f0c4] text-[#72796e] font-bold text-sm">3</button>
              <button className="w-10 h-10 rounded-full border border-[#c2c9bb] flex items-center justify-center text-[#154212] hover:bg-[#f2f0c4] transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full mt-auto py-12 bg-[#154212] flex flex-col items-center justify-center space-y-6 text-center px-4">
          <p className="text-[#F4C430] font-bold text-lg font-headline">NicaQuizz Admin</p>
          <div className="flex gap-6 flex-wrap justify-center">
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
          <p className="text-[#fefccf]/60 font-headline text-[10px] font-light tracking-wide">
            © 2025 NicaQuizz - El Arte del Nacatamal Digital
          </p>
        </footer>
      </main>

      {/* Floating Action Button (FAB) */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#755b00] text-[#1d1d03] rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-105 active:scale-95 transition-transform group">
        <span className="material-symbols-outlined text-3xl">campaign</span>
        <span className="absolute right-full mr-4 bg-[#1d1d03] text-[#fefccf] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Nuevo Aviso
        </span>
      </button>
    </div>
  );
}
