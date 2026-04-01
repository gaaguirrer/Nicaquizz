/**
 * History.jsx - Diario de Batallas de NicaQuizz
 * "Mi Diario de Batallas"
 * 
 * Características:
 * - Stats Grid (Total Duels, Win Rate)
 * - Lista de batallas recientes
 * - Cards con avatar, resultado, botín
 * - CTA para nueva batalla
 * - BottomNavBar para móvil
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Stats simulados
const STATS = {
  totalDuels: 124,
  duelsEstaSemana: 12,
  winRate: 76
};

// Batallas recientes simuladas
const BATALLAS = [
  {
    id: 1,
    rival: 'Chef_Marcos',
    avatar: 'https://i.pravatar.cc/100?img=11',
    nivel: 42,
    fecha: '12 de Oct, 2023',
    resultado: 'victoria',
    categoria: 'Geografía',
    botin: [
      { nombre: 'Masa', icono: 'bakery_dining', color: 'text-[#154212]' },
      { nombre: 'Chile', icono: 'nutrition', color: 'text-[#79001c]' },
      { nombre: 'Arroz', icono: 'grass', color: 'text-[#755b00]' }
    ]
  },
  {
    id: 2,
    rival: 'Elena_Nica',
    avatar: 'https://i.pravatar.cc/100?img=20',
    nivel: 38,
    fecha: '11 de Oct, 2023',
    resultado: 'derrota',
    categoria: 'Historia',
    botin: [
      { nombre: 'Papa', icono: 'egg', color: 'text-stone-400' }
    ]
  },
  {
    id: 3,
    rival: 'Minguito_99',
    avatar: 'https://i.pravatar.cc/100?img=12',
    nivel: 55,
    fecha: '10 de Oct, 2023',
    resultado: 'victoria',
    categoria: 'Gastronomía',
    botin: [
      { nombre: 'Cerdo', icono: 'restaurant', color: 'text-[#154212]' },
      { nombre: 'Arroz', icono: 'grass', color: 'text-[#755b00]' }
    ]
  }
];

export default function History() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body pb-32">
      
      {/* TopNavBar */}
      <nav className="bg-[#fefccf] shadow-[0px_8px_32px_rgba(29,29,3,0.08)] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-[#154212]">
          NicaQuizz
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/categories" className="text-stone-500 font-semibold hover:bg-[#154212]/5 transition-colors px-3 py-1 rounded-lg">
            Explorar
          </Link>
          <Link to="/friends" className="text-stone-500 font-semibold hover:bg-[#154212]/5 transition-colors px-3 py-1 rounded-lg">
            Comunidad
          </Link>
          <Link to="/history" className="text-[#154212] font-bold border-b-2 border-[#154212] px-1">
            Historial
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="material-symbols-outlined text-primary cursor-pointer hover:bg-[#154212]/5 p-2 rounded-full transition-colors">
            account_circle
          </Link>
          <button className="material-symbols-outlined text-primary cursor-pointer hover:bg-[#154212]/5 p-2 rounded-full transition-colors">
            settings
          </button>
        </div>
      </nav>

      <main className="pt-24 px-4 max-w-4xl mx-auto relative">
        
        {/* Journal Texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#154212 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.03
        }}></div>

        {/* Header */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-[#154212] tracking-tight mb-2">
            Mi Diario de Batallas
          </h1>
          <p className="text-[#42493e] font-medium">
            Crónicas de tus duelos y los ingredientes recolectados.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Total Duels */}
          <div className="bg-[#f8f6c9] rounded-xl p-6 shadow-[0px_8px_32px_rgba(29,29,3,0.05)] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-9xl text-[#154212]" style={{ fontVariationSettings: "'FILL' 1" }}>
                swords
              </span>
            </div>
            <p className="text-[#755b00] font-bold text-sm tracking-widest uppercase mb-1">
              Total Duels
            </p>
            <h3 className="text-5xl font-black text-[#154212]">{STATS.totalDuels}</h3>
            <div className="mt-4 flex items-center gap-2 text-[#154212] font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+{STATS.duelsEstaSemana} esta semana</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-[#2D5A27] text-white rounded-xl p-6 shadow-[0px_8px_32px_rgba(29,29,3,0.08)] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-9xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <p className="text-[#bcf0ae] font-bold text-sm tracking-widest uppercase mb-1">
              Win Rate
            </p>
            <h3 className="text-5xl font-black text-white">{STATS.winRate}%</h3>
            <div className="mt-4 flex items-center gap-2 text-[#bcf0ae] font-semibold">
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${STATS.winRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Battles */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-[#154212] flex items-center gap-2">
              <span className="material-symbols-outlined">history</span>
              Recientes
            </h2>
            <button className="text-[#154212] font-semibold text-sm hover:underline">
              Ver todo
            </button>
          </div>

          <div className="space-y-4">
            {BATALLAS.map((batalla) => (
              <div
                key={batalla.id}
                className={`bg-white rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 border-l-8 ${
                  batalla.resultado === 'victoria'
                    ? 'border-[#154212]'
                    : 'border-[#79001c]'
                } transition-all hover:translate-x-1 ${
                  batalla.resultado === 'derrota' ? 'opacity-90' : ''
                }`}
              >
                {/* Avatar y Nombre */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <img
                      alt={`Avatar de ${batalla.rival}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#bcf0ae]"
                      src={batalla.avatar}
                    />
                    <div className={`absolute -bottom-1 -right-1 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      batalla.resultado === 'victoria'
                        ? 'bg-[#154212]'
                        : 'bg-[#79001c]'
                    }`}>
                      LVL {batalla.nivel}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#154212]">{batalla.rival}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#42493e] font-medium">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {batalla.fecha}
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                <div className="flex flex-col items-center justify-center px-6 border-x-0 md:border-x border-[#c2c9bb]/30">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#755b00] mb-1">
                    Resultado
                  </span>
                  <span className={`font-black text-xl italic uppercase ${
                    batalla.resultado === 'victoria'
                      ? 'text-[#154212]'
                      : 'text-[#79001c]'
                  }`}>
                    {batalla.resultado === 'victoria' ? 'Victoria' : 'Derrota'}
                  </span>
                  <span className="text-xs font-semibold text-[#42493e] mt-1">
                    {batalla.categoria}
                  </span>
                </div>

                {/* Botín */}
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#755b00] mb-3 text-center md:text-left">
                    Botín Obtenido
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {batalla.botin.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-[#f2f0c4] p-1.5 rounded-lg border border-[#154212]/5"
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${item.color}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {item.icono}
                        </span>
                        <span className="text-xs font-bold text-[#154212]">
                          {item.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="mt-12 p-8 rounded-3xl bg-[#eceabe] relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-[#154212] mb-2 italic">
              ¿Listo para el próximo ingrediente?
            </h3>
            <p className="text-[#42493e] mb-6 font-medium max-w-md">
              Te faltan 3 <span className="text-[#154212] font-bold">Papitas</span> para completar tu receta de Nacatamal Tradicional.
            </p>
            <Link
              to="/categories"
              className="bg-[#154212] text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-[#2D5A27] transition-all scale-100 active:scale-95 duration-200 inline-block"
            >
              NUEVA BATALLA
            </Link>
          </div>
          <div
            className="absolute top-0 right-0 h-full w-1/3 opacity-20 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1589113103503-496a9d914447?auto=format&fit=crop&q=80&w=400')"
            }}
          ></div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#fefccf]/70 backdrop-blur-xl">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-[#154212]/60"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">
            Inicio
          </span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center justify-center text-[#154212]/60"
        >
          <span className="material-symbols-outlined text-2xl">sports_esports</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">
            Batallas
          </span>
        </Link>
        <Link
          to="/history"
          className="flex flex-col items-center justify-center bg-[#2D5A27] text-white rounded-2xl px-5 py-2 scale-110"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            history
          </span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">
            Historial
          </span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center text-[#154212]/60"
        >
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">
            Perfil
          </span>
        </Link>
      </footer>
    </div>
  );
}
