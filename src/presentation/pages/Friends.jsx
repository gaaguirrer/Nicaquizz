/**
 * Friends.jsx - Directorio de Amigos y Retos de NicaQuizz
 * "Sabor y Saber"
 * 
 * Características:
 * - Buscador de amigos
 * - Solicitudes pendientes
 * - Lista de amigos en línea
 * - Retos recibidos sidebar
 * - Mini Achievement Card
 * - BottomNav para móvil
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Amigos simulados
const AMIGOS = [
  {
    id: 1,
    nombre: 'Xochitl Castillo',
    titulo: 'Experta en Vigorón',
    nivel: 14,
    avatar: 'https://i.pravatar.cc/100?img=5',
    enLinea: true
  },
  {
    id: 2,
    nombre: 'Mateo Silva',
    titulo: 'Maestro del Gallo Pinto',
    nivel: 22,
    avatar: 'https://i.pravatar.cc/100?img=11',
    enLinea: true
  },
  {
    id: 3,
    nombre: 'Maria Elena',
    titulo: 'Aprendiz de Almíbar',
    nivel: 8,
    avatar: 'https://i.pravatar.cc/100?img=9',
    enLinea: false
  },
  {
    id: 4,
    nombre: 'Carlos Méndez',
    titulo: 'Chef de Indio Viejo',
    nivel: 18,
    avatar: 'https://i.pravatar.cc/100?img=12',
    enLinea: true
  },
  {
    id: 5,
    nombre: 'Ana Rodríguez',
    titulo: 'Reina del Tiste',
    nivel: 25,
    avatar: 'https://i.pravatar.cc/100?img=10',
    enLinea: true
  },
  {
    id: 6,
    nombre: 'Luis González',
    titulo: 'Cocinero de Nacatamales',
    nivel: 30,
    avatar: 'https://i.pravatar.cc/100?img=13',
    enLinea: false
  }
];

// Solicitudes pendientes
const SOLICITUDES = [
  { id: 1, nombre: 'Felix Rivas', avatar: 'https://i.pravatar.cc/100?img=14' },
  { id: 2, nombre: 'Carmen López', avatar: 'https://i.pravatar.cc/100?img=15' },
  { id: 3, nombre: 'Jorge Martín', avatar: 'https://i.pravatar.cc/100?img=16' }
];

// Retos recibidos
const RETOS = [
  {
    id: 1,
    rival: 'Ramon G.',
    avatar: 'https://i.pravatar.cc/100?img=17',
    tipo: 'Postres Tradicionales',
    tiempo: 'Hace 5 min'
  },
  {
    id: 2,
    rival: 'Carla J.',
    avatar: 'https://i.pravatar.cc/100?img=18',
    tipo: 'Historia del Cacao',
    tiempo: 'Hace 2 horas'
  }
];

export default function Friends() {
  const { currentUser } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [amigosFiltrados, setAmigosFiltrados] = useState(AMIGOS);

  function handleBuscar() {
    const filtrados = AMIGOS.filter(amigo =>
      amigo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setAmigosFiltrados(filtrados);
  }

  async function handleRetar(amigoId) {
    console.log('Retando a:', amigoId);
    // En producción: abrir modal de configuración de reto
  }

  async function handleAceptarSolicitud(solicitudId) {
    console.log('Aceptando solicitud:', solicitudId);
  }

  async function handleAceptarReto(retoId) {
    console.log('Aceptando reto:', retoId);
    // En producción: navegar a Challenge.jsx
  }

  return (
    <div className="min-h-screen bg-[#fefccf] font-body text-[#1d1d03]">
      
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-[#fefccf] shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
        <Link to="/" className="text-2xl font-bold text-[#154212] tracking-tight font-headline">
          NicaQuizz
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/friends" className="text-[#154212]/70 font-semibold hover:text-[#154212] transition-colors">
            Desafíos
          </Link>
          <Link to="/friends" className="text-[#154212] font-bold border-b-2 border-[#154212] pb-1">
            Amigos
          </Link>
          <Link to="/profile" className="text-[#154212]/70 font-semibold hover:text-[#154212] transition-colors">
            Logros
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#154212]/5 transition-colors">
            <span className="material-symbols-outlined text-[#154212]">notifications</span>
          </button>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#2D5A27]"
          >
            <img
              alt="Perfil del usuario"
              className="w-full h-full object-cover"
              src="https://i.pravatar.cc/100?img=1"
            />
          </Link>
        </div>
      </header>

      <div className="flex min-h-screen pt-24">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-6rem)] sticky top-24 left-0 p-6 space-y-8">
          <div className="space-y-4">
            <Link
              to="/"
              className="flex items-center gap-4 px-5 py-3 rounded-2xl text-[#154212]/60 hover:text-[#154212] transition-all"
            >
              <span className="material-symbols-outlined">home</span>
              <span className="font-bold tracking-wider text-xs uppercase">Inicio</span>
            </Link>
            <Link
              to="/challenge"
              className="flex items-center gap-4 px-5 py-3 rounded-2xl text-[#154212]/60 hover:text-[#154212] transition-all"
            >
              <span className="material-symbols-outlined">swords</span>
              <span className="font-bold tracking-wider text-xs uppercase">Duelo</span>
            </Link>
            <Link
              to="/friends"
              className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-[#154212] text-[#fefccf] shadow-lg scale-105 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <span className="font-bold tracking-wider text-xs uppercase">Perfil</span>
            </Link>
            <Link
              to="/shop"
              className="flex items-center gap-4 px-5 py-3 rounded-2xl text-[#154212]/60 hover:text-[#154212] transition-all"
            >
              <span className="material-symbols-outlined">local_mall</span>
              <span className="font-bold tracking-wider text-xs uppercase">Mercado</span>
            </Link>
          </div>

          {/* Decorative Illustration */}
          <div className="mt-auto relative p-6 rounded-3xl bg-[#eceabe] overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:rotate-12 transition-transform duration-500">
              <div className="w-24 h-24 bg-[#F4C430]/30 rounded-full"></div>
            </div>
            <p className="relative z-10 text-xs font-bold text-[#154212] italic">
              "El maíz es nuestra raíz"
            </p>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <section className="relative">
              <h1 className="text-5xl font-extrabold font-headline text-[#154212] tracking-tighter mb-4">
                Directorio de Amigos y Retos
              </h1>
              <p className="text-lg text-[#154212]/70 max-w-2xl">
                Encuentra a tus compatriotas culinarios y demuestra quién conoce mejor el sabor de nuestra tierra.
              </p>
            </section>

            {/* Search Bento Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Search Friends Section */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border-b-4 border-[#154212]/10">
                <h2 className="text-xl font-bold text-[#154212] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">search</span>
                  Buscar Amigos
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                      className="w-full bg-[#f8f6c9] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-4 rounded-xl transition-all outline-none text-[#154212]"
                      placeholder="Escribe el nombre del usuario..."
                    />
                  </div>
                  <button
                    onClick={handleBuscar}
                    className="bg-[#154212] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2D5A27] transition-all active:scale-95"
                  >
                    <span>Buscar</span>
                  </button>
                </div>
              </div>

              {/* Pending Invites Section */}
              <div className="bg-[#a40029]/10 p-8 rounded-3xl border-l-4 border-[#79001c]">
                <h2 className="text-xl font-bold text-[#79001c] mb-6 flex items-center justify-between">
                  Solicitudes
                  <span className="bg-[#79001c] text-white text-xs px-2 py-1 rounded-full">
                    {SOLICITUDES.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {SOLICITUDES.map((solicitud) => (
                    <div
                      key={solicitud.id}
                      className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f2f0c4]">
                        <img
                          alt={solicitud.nombre}
                          className="w-full h-full object-cover"
                          src={solicitud.avatar}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#154212] truncate">
                          {solicitud.nombre}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAceptarSolicitud(solicitud.id)}
                        className="p-2 text-[#154212] hover:bg-[#154212]/5 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Challenges & Friends Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* Friends List (Left) */}
              <div className="lg:col-span-3 space-y-8">
                <div className="flex items-end justify-between border-b-2 border-[#154212]/5 pb-4">
                  <h2 className="text-3xl font-bold font-headline text-[#154212]">
                    Amigos en Línea
                  </h2>
                  <span className="text-[#154212]/60 font-semibold text-sm">
                    Ver todos ({AMIGOS.length})
                  </span>
                </div>

                {/* Friends Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {amigosFiltrados.map((amigo) => (
                    <div
                      key={amigo.id}
                      className={`bg-[#f8f6c9] p-6 rounded-3xl hover:bg-[#f2f0c4] transition-all duration-300 group ${
                        !amigo.enLinea ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-md">
                            <img
                              alt={amigo.nombre}
                              className="w-full h-full object-cover"
                              src={amigo.avatar}
                            />
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-5 h-5 ${
                              amigo.enLinea ? 'bg-green-500' : 'bg-gray-400'
                            } border-4 border-[#f8f6c9] rounded-full`}
                          ></div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                              amigo.enLinea
                                ? 'bg-[#ffdf90] text-[#1d1d03]'
                                : 'bg-[#c2c9bb] text-[#42493e]'
                            }`}
                          >
                            Nivel {amigo.nivel}
                          </span>
                        </div>
                      </div>
                      <h3
                        className={`font-bold text-lg mb-1 ${
                          amigo.enLinea ? 'text-[#154212]' : 'text-[#154212]/60'
                        }`}
                      >
                        {amigo.nombre}
                      </h3>
                      <p
                        className={`text-xs mb-6 font-medium ${
                          amigo.enLinea ? 'text-[#154212]/60' : 'text-[#154212]/40'
                        }`}
                      >
                        {amigo.titulo}
                      </p>
                      <button
                        onClick={() => handleRetar(amigo.id)}
                        disabled={!amigo.enLinea}
                        className={`w-full py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                          amigo.enLinea
                            ? 'bg-white text-[#154212] group-hover:bg-[#154212] group-hover:text-white'
                            : 'bg-[#eceabe] text-[#154212]/40 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          swords
                        </span>
                        {amigo.enLinea ? 'Retar' : 'Offline'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Column: Challenges (Right) */}
              <div className="space-y-8">
                
                {/* Retos Recibidos */}
                <div className="bg-[#154212] text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                  {/* Background Motif */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-8xl">restaurant</span>
                  </div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#fccc38]">flash_on</span>
                    Retos Recibidos
                  </h2>
                  <div className="space-y-4 relative z-10">
                    {RETOS.map((reto) => (
                      <div
                        key={reto.id}
                        className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            alt={reto.rival}
                            className="w-8 h-8 rounded-full bg-white/20"
                            src={reto.avatar}
                          />
                          <div>
                            <p className="text-xs font-bold leading-none">{reto.rival}</p>
                            <p className="text-[10px] opacity-70">{reto.tiempo}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-4">
                          Te ha retado a un duelo de "{reto.tipo}"
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAceptarReto(reto.id)}
                            className="flex-1 bg-[#fccc38] text-[#1d1d03] text-xs font-bold py-2 rounded-xl"
                          >
                            Aceptar
                          </button>
                          <button className="px-3 bg-white/10 text-xs font-bold py-2 rounded-xl">
                            Ignorar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Achievement Card */}
                <div className="bg-[#fccc38] p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <span
                        className="material-symbols-outlined text-[#755b00] text-3xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        military_tech
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1d1d03] opacity-70">
                        Tu Rango
                      </p>
                      <p className="text-xl font-black text-[#1d1d03]">General del Baho</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#fefccf]/70 backdrop-blur-xl shadow-[0_-4px_20px_rgba(29,29,3,0.05)] rounded-t-3xl">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-transform active:scale-110"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Inicio
          </span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-transform active:scale-110"
        >
          <span className="material-symbols-outlined">swords</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Duelo
          </span>
        </Link>
        <Link
          to="/shop"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-transform active:scale-110"
        >
          <span className="material-symbols-outlined">local_mall</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Mercado
          </span>
        </Link>
        <Link
          to="/friends"
          className="flex flex-col items-center justify-center bg-[#154212] text-[#fefccf] rounded-2xl px-5 py-2 scale-110 shadow-lg"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Perfil
          </span>
        </Link>
      </footer>
    </div>
  );
}
