/**
 * Challenge.jsx - Configuración del Duelo de NicaQuizz
 * "Sabor y Saber"
 * 
 * Características:
 * - Hero con identidad del desafío
 * - VS Avatar Display (Tú vs Amigo)
 * - Grid de Categorías con recompensas
 * - Opción Duelo Libre
 * - CTA para empezar duelo
 * - BottomNavBar para móvil
 * - Decoración orgánica (hojas, chile)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Categorías disponibles
const CATEGORIAS = [
  {
    id: 'historia',
    nombre: 'Historia',
    icono: 'history_edu',
    color: 'bg-[#79001c]/10',
    textColor: 'text-[#79001c]',
    badgeColor: 'bg-[#ffdad9]',
    badgeText: 'text-[#40000a]',
    recompensa: 'Achiote',
    iconoRecompensa: 'restaurant',
    activo: true
  },
  {
    id: 'matematicas',
    nombre: 'Matemáticas',
    icono: 'calculate',
    color: 'bg-[#154212]/10',
    textColor: 'text-[#154212]',
    badgeColor: 'bg-[#bcf0ae]',
    badgeText: 'text-[#23501e]',
    recompensa: 'Maíz',
    iconoRecompensa: 'nutrition',
    activo: false
  },
  {
    id: 'geografia',
    nombre: 'Geografía',
    icono: 'explore',
    color: 'bg-[#755b00]/10',
    textColor: 'text-[#755b00]',
    badgeColor: 'bg-[#ffdf90]',
    badgeText: 'text-[#241a00]',
    recompensa: 'Hoja',
    iconoRecompensa: 'eco',
    activo: false
  },
  {
    id: 'ciencias',
    nombre: 'Ciencias',
    icono: 'nature',
    color: 'bg-[#2D5A27]/10',
    textColor: 'text-[#2D5A27]',
    badgeColor: 'bg-[#f2f0c4]',
    badgeText: 'text-[#1d1d03]',
    recompensa: 'Cacao',
    iconoRecompensa: 'local_cafe',
    activo: false
  }
];

export default function Challenge() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);

  // Datos simulados del rival
  const rival = {
    nombre: '@marcos_12',
    avatar: 'https://i.pravatar.cc/100?img=11'
  };

  async function handleEmpezarDuelo(tipo = 'categoria') {
    setLoading(true);
    try {
      // Simulación de inicio de duelo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirigir al juego
      navigate(`/challenge/play?tipo=${tipo}&categoria=${categoriaSeleccionada || 'libre'}`);
    } catch (error) {
      console.error('Error al empezar duelo:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#fefccf] shadow-[0_8px_32px_rgba(29,29,3,0.08)] font-headline tracking-tight">
        <Link to="/" className="text-2xl font-bold text-[#154212]">
          NicaQuizz
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/friends" className="text-[#154212]/70 hover:bg-[#154212]/5 transition-colors duration-200">
            Desafíos
          </Link>
          <Link to="/challenge" className="text-[#154212] font-bold border-b-2 border-[#154212] pb-1">
            Amigos
          </Link>
          <Link to="/profile" className="text-[#154212]/70 hover:bg-[#154212]/5 transition-colors duration-200">
            Logros
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#f2f0c4] rounded-full px-4 py-1.5 border border-[#c2c9bb]/10">
            <span className="material-symbols-outlined text-[#154212] text-xl mr-2">search</span>
            <span className="text-[#42493e]/60 text-sm">Buscar...</span>
          </div>
          <button className="material-symbols-outlined text-[#154212] scale-95 active:scale-90 duration-200">
            notifications
          </button>
          <button className="material-symbols-outlined text-[#154212] scale-95 active:scale-90 duration-200">
            settings
          </button>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full border-2 border-[#2D5A27] p-0.5 overflow-hidden"
          >
            <img
              alt="Perfil"
              className="w-full h-full object-cover rounded-full"
              src="https://i.pravatar.cc/100?img=1"
            />
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        
        {/* Hero Section: The Challenge Identity */}
        <section className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-[#154212] leading-tight -tracking-widest">
              Configuración <br/>del <span className="text-[#755b00]">Duelo</span>
            </h1>
            <p className="text-[#42493e] text-lg max-w-md">
              Selecciona el campo de batalla y los ingredientes en juego para este desafío culinario de conocimientos.
            </p>
          </div>

          {/* VS Avatar Display */}
          <div className="relative flex items-center justify-center p-8 bg-[#f8f6c9] rounded-[2.5rem] shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffdf90]/30 to-transparent opacity-40"></div>
            <div className="flex items-center gap-6 relative z-10">
              {/* Tú */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-[#2D5A27] rounded-full flex items-center justify-center text-white border-4 border-[#fefccf] shadow-lg">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <span className="font-bold text-[#154212]">Tú</span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black italic text-[#79001c]">VS</span>
                <div className="w-12 h-1 bg-[#79001c]/20 rounded-full mt-2"></div>
              </div>

              {/* Rival */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full p-1 bg-[#fccc38] shadow-xl overflow-hidden transform hover:rotate-3 transition-transform">
                  <img
                    alt={`Avatar de ${rival.nombre}`}
                    className="w-full h-full rounded-full object-cover"
                    src={rival.avatar}
                  />
                </div>
                <span className="font-bold text-[#154212]">{rival.nombre}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-headline font-bold text-[#1d1d03]">Categorías de Desafío</h2>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 rounded-full bg-[#ffdf90] text-[#1d1d03] font-bold text-sm">
                RECOMPENSA ACTIVA
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaSeleccionada(cat.id)}
                className={`group flex flex-col items-start p-6 rounded-3xl text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border ${
                  categoriaSeleccionada === cat.id
                    ? 'bg-[#e6e5b9] border-[#154212]'
                    : 'bg-white border-[#c2c9bb]/10 hover:border-[#2D5A27]'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center ${cat.textColor} mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cat.icono}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1d1d03] mb-2">{cat.nombre}</h3>
                <div className={`flex items-center gap-2 py-2 px-3 ${cat.badgeColor} rounded-xl mt-auto`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cat.iconoRecompensa}
                  </span>
                  <span className={`text-xs font-bold ${cat.badgeText} tracking-tight`}>
                    Recompensa: {cat.recompensa}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Duelo Libre Option */}
        <section className="mb-20">
          <button
            onClick={() => setCategoriaSeleccionada('libre')}
            className={`w-full flex flex-col md:flex-row items-center justify-between p-8 bg-gradient-to-r from-[#154212] to-[#2D5A27] rounded-[2rem] text-white overflow-hidden relative group transition-all ${
              categoriaSeleccionada === 'libre' ? 'ring-4 ring-[#fccc38]' : ''
            }`}
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 organic-shape -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl">shuffle</span>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold">Duelo Libre</h3>
                <p className="text-white/80">Preguntas aleatorias de todas las categorías. ¡Doble experiencia!</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-4xl mt-6 md:mt-0 relative z-10 animate-pulse">
              arrow_forward_ios
            </span>
          </button>
        </section>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => handleEmpezarDuelo(categoriaSeleccionada || 'libre')}
            disabled={loading}
            className="w-full md:w-auto px-16 py-6 bg-[#fccc38] text-[#1d1d03] font-headline font-extrabold text-2xl rounded-2xl shadow-[0_12px_48px_rgba(117,91,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ¡Empezar Duelo!
            <span className="material-symbols-outlined text-3xl group-hover:translate-x-2 transition-transform">
              swords
            </span>
          </button>
          <p className="text-[#42493e]/60 font-semibold text-sm">
            Tu rival recibirá una notificación al instante.
          </p>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#fefccf]/70 backdrop-blur-xl shadow-[0_-4px_20px_rgba(29,29,3,0.05)] md:hidden">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-transform duration-300 ease-out"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">Inicio</span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center justify-center bg-[#154212] text-[#fefccf] rounded-2xl px-5 py-2 scale-110 transition-transform duration-300 ease-out"
        >
          <span className="material-symbols-outlined">swords</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">Duelo</span>
        </Link>
        <Link
          to="/shop"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-transform duration-300 ease-out"
        >
          <span className="material-symbols-outlined">local_mall</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">Mercado</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-transform duration-300 ease-out"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">Perfil</span>
        </Link>
      </nav>

      {/* Decoration Layer */}
      <div className="fixed top-20 right-0 pointer-events-none -z-10 opacity-20">
        <div className="w-80 h-80 bg-[#2D5A27]/20 rounded-full blur-3xl"></div>
      </div>
      <div className="fixed bottom-0 left-0 pointer-events-none -z-10 opacity-10">
        <div className="w-40 h-40 bg-[#79001c]/20 rounded-full blur-3xl"></div>
      </div>

      {/* Estilos personalizados */}
      <style>{`
        .organic-shape {
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }
      `}</style>
    </div>
  );
}
