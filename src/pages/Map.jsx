/**
 * Map.jsx - Mapa de Conquista de NicaQuizz
 * "Mapa Regional de Conquista"
 * 
 * Características:
 * - TopNavBar con buscador, notificaciones, avatar
 * - SideNavBar con perfil y navegación
 * - Header con stats de conquista (64%)
 * - Mapa interactivo con pins (León, Granada, Matagalpa)
 * - Info Sidebar (Líder Regional, Misión Disponible)
 * - Map Controls (zoom in/out, location)
 * - Search Float
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Departamentos simulados
const DEPARTAMENTOS = [
  {
    id: 'leon',
    nombre: 'León',
    estado: 'conquistado',
    posicion: { top: '45%', left: '25%' }
  },
  {
    id: 'granada',
    nombre: 'Granada',
    estado: 'disputa',
    posicion: { top: '65%', left: '45%' }
  },
  {
    id: 'matagalpa',
    nombre: 'Matagalpa',
    estado: 'inexplorado',
    posicion: { top: '35%', left: '55%' }
  }
];

// Líder regional simulado
const LIDER_REGIONAL = {
  nombre: 'Elena "Vigorón" López',
  puntos: 9450,
  influencia: 88,
  avatar: 'https://i.pravatar.cc/100?img=20'
};

export default function Map() {
  const { currentUser } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [zoom, setZoom] = useState(1);

  return (
    <div className="bg-[#fefccf] text-[#1d1d03] font-body min-h-screen selection:bg-[#ffdf90] selection:text-[#1d1d03]">
      
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#fefccf] shadow-[0_8px_32px_rgba(29,29,3,0.08)] font-headline tracking-tight">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-[#154212]">Mestizaje Digital</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-[#f8f6c9] rounded-full px-4 py-2 items-center gap-2">
            <span className="material-symbols-outlined text-[#154212]">search</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-48 text-[#154212]"
              placeholder="Buscar región..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#154212]/5 transition-colors scale-95 active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[#154212]">notifications</span>
            </button>
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#154212]"
            >
              <img
                alt="Perfil del Usuario"
                className="w-full h-full object-cover"
                src="https://i.pravatar.cc/100?img=1"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full z-40 flex flex-col pt-20 bg-[#fefccf] w-64 border-r-0 font-headline font-medium">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#fccc38] rounded-xl flex items-center justify-center text-[#1d1d03] font-black">
              MA
            </div>
            <div>
              <h3 className="text-[#154212] font-bold">Explorador</h3>
              <p className="text-xs text-[#1d1d03]/70">Nivel: Maestro Achiote</p>
            </div>
          </div>
          <nav className="space-y-1">
            <Link
              to="/map"
              className="flex items-center gap-4 py-3 text-[#154212] font-bold border-l-4 border-[#154212] pl-4 transition-all duration-300 ease-in-out"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
              <span>Mapa</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-4 py-3 text-[#1d1d03]/70 pl-5 hover:bg-[#154212]/10 transition-all duration-300 ease-in-out"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Mi Inventario</span>
            </Link>
            <Link
              to="/challenge"
              className="flex items-center gap-4 py-3 text-[#1d1d03]/70 pl-5 hover:bg-[#154212]/10 transition-all duration-300 ease-in-out"
            >
              <span className="material-symbols-outlined">military_tech</span>
              <span>Desafíos</span>
            </Link>
            <Link
              to="/trade"
              className="flex items-center gap-4 py-3 text-[#1d1d03]/70 pl-5 hover:bg-[#154212]/10 transition-all duration-300 ease-in-out"
            >
              <span className="material-symbols-outlined">swap_horiz</span>
              <span>Trueque</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto px-6 py-8 space-y-4">
          <button className="w-full bg-[#154212] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all">
            <span className="material-symbols-outlined">quiz</span>
            Nueva Trivia
          </button>
          <Link
            to="/account"
            className="flex items-center gap-4 py-3 text-[#1d1d03]/70 pl-5 hover:bg-[#154212]/10 transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Ajustes</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 min-h-screen px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section with Asymmetry */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1 bg-[#ffdf90] text-[#1d1d03] rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                Nicaragua Cultural
              </span>
              <h1 className="text-5xl font-extrabold text-[#154212] font-headline leading-tight mb-2">
                Mapa Regional de Conquista
              </h1>
              <p className="text-[#42493e] text-lg">
                Reclama tu territorio a través del conocimiento. Cada departamento es una nueva oportunidad para demostrar tu maestría.
              </p>
            </div>
            
            {/* Conquista Stats */}
            <div className="bg-[#eceabe] p-6 rounded-2xl shadow-[12px_12px_32px_rgba(29,29,3,0.08)] min-w-[280px]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-[#154212]">Progreso Total</span>
                <span className="text-2xl font-black text-[#755b00]">64%</span>
              </div>
              <div className="relative h-4 w-full bg-[#e6e5b9] rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-[#154212] w-[64%]"></div>
              </div>
              <div className="flex gap-4 mt-6 text-xs font-bold text-[#42493e]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#154212]"></div>
                  11 Conquistados
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#fccc38]"></div>
                  4 En Disputa
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Map Section (Bento Style) */}
            <div className="lg:col-span-8 bg-[#f8f6c9] rounded-3xl overflow-hidden min-h-[600px] relative border-4 border-[#f2f0c4]">
              
              {/* Map Texture */}
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')"
              }}></div>

              {/* Map Controls */}
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.2, 2))}
                  className="bg-[#fefccf]/70 backdrop-blur-md p-3 rounded-xl hover:bg-white transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[#154212]">add</span>
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.6))}
                  className="bg-[#fefccf]/70 backdrop-blur-md p-3 rounded-xl hover:bg-white transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[#154212]">remove</span>
                </button>
                <button className="bg-[#fefccf]/70 backdrop-blur-md p-3 rounded-xl hover:bg-white transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[#154212]">my_location</span>
                </button>
              </div>

              {/* Stylized Map */}
              <div className="w-full h-full flex items-center justify-center p-12 relative">
                <div className="relative w-full max-w-xl aspect-[4/5] bg-[#154212]/5 rounded-[40%] blur-3xl absolute opacity-20"></div>
                
                {/* Map Image Placeholder */}
                <div className="relative z-0 w-full h-full flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-[#154212]/10 to-[#755b00]/10 rounded-[40%] flex items-center justify-center">
                    <span className="material-symbols-outlined text-9xl text-[#154212]/20">map</span>
                  </div>

                  {/* Interactive Pins */}
                  {DEPARTAMENTOS.map((dept) => (
                    <button
                      key={dept.id}
                      className="absolute group"
                      style={{ top: dept.posicion.top, left: dept.posicion.left }}
                    >
                      {dept.estado === 'conquistado' && (
                        <>
                          <div className="bg-[#154212] text-white p-2 rounded-full shadow-lg scale-100 hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#fefccf]/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {dept.nombre}
                          </span>
                        </>
                      )}
                      {dept.estado === 'disputa' && (
                        <>
                          <div className="bg-[#fccc38] text-[#1d1d03] p-3 rounded-full shadow-xl ring-4 ring-white/50 animate-pulse scale-125">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                          </div>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-[#fccc38] text-[#1d1d03] px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap shadow-lg">
                            {dept.nombre}
                          </span>
                        </>
                      )}
                      {dept.estado === 'inexplorado' && (
                        <>
                          <div className="bg-[#e6e5b9] text-[#72796e] p-2 rounded-full shadow-lg scale-100 hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">lock</span>
                          </div>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#fefccf]/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {dept.nombre}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Float */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
                <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-[#c2c9bb]/10">
                  <span className="material-symbols-outlined text-[#154212] ml-2">search</span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-[#154212]"
                    placeholder="Buscar un departamento..."
                  />
                  <button className="bg-[#154212] text-white px-4 py-2 rounded-xl text-sm font-bold">
                    Ir
                  </button>
                </div>
              </div>
            </div>

            {/* Info Sidebar (Bento Column) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Regional Leader Card */}
              <div className="bg-white p-8 rounded-[2rem] shadow-[12px_12px_32px_rgba(29,29,3,0.08)] border border-[#f2f0c4] relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#755b00]/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-[#154212] font-headline">Líder Regional</h2>
                  <span className="bg-[#ffdf90] text-[#1d1d03] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    En el Trono
                  </span>
                </div>
                
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-[#fccc38] p-1 bg-white">
                      <img
                        alt="Avatar del Jugador"
                        className="w-full h-full object-cover rounded-full"
                        src={LIDER_REGIONAL.avatar}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#755b00] text-white p-2 rounded-full shadow-lg">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#1d1d03]">{LIDER_REGIONAL.nombre}</h3>
                  <p className="text-[#154212] font-medium">{LIDER_REGIONAL.puntos.toLocaleString()} Puntos de Gloria</p>
                </div>
                
                <div className="bg-[#f8f6c9] rounded-2xl p-4 mb-8">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[#42493e]">Influencia en Granada</span>
                    <span className="font-bold text-[#154212]">{LIDER_REGIONAL.influencia}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#e6e5b9] rounded-full">
                    <div className="h-full bg-[#755b00] w-[88%] rounded-full"></div>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-[#79001c] text-white rounded-2xl font-black text-lg tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#79001c]/20 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">swords</span>
                  DESAFIAR AL LÍDER
                </button>
              </div>

              {/* Region Challenge Card */}
              <div className="bg-[#154212] p-8 rounded-[2rem] text-white shadow-[12px_12px_32px_rgba(29,29,3,0.08)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#755b00]/20 to-transparent opacity-20"></div>
                
                <div className="relative z-10">
                  <h4 className="text-[#fccc38] font-black tracking-widest text-xs uppercase mb-2">
                    Misión Disponible
                  </h4>
                  <h3 className="text-3xl font-headline font-bold mb-4">
                    Trivia de Conquista: Granada Colonial
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    Demuestra tus conocimientos sobre la arquitectura, historia y gastronomía de la Gran Sultana para ganar 500 puntos de conquista.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-[#154212] bg-stone-300"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-[#154212] bg-stone-400"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-[#154212] bg-stone-500"></div>
                    </div>
                    <span className="text-[10px] font-bold opacity-80">
                      124 exploradores aquí ahora
                    </span>
                  </div>
                  
                  <button className="mt-8 w-full py-4 bg-[#fccc38] text-[#1d1d03] rounded-2xl font-black hover:bg-[#ffdf90] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">play_arrow</span>
                    INICIAR CONQUISTA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating UI - Progress "Vapor" effect */}
      <div className="fixed top-0 left-0 w-full h-1 pointer-events-none z-[100] flex">
        <div className="h-full bg-gradient-to-r from-[#fccc38] via-[#154212] to-[#755b00] w-[64%] blur-sm"></div>
      </div>
    </div>
  );
}
