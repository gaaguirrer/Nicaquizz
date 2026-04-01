/**
 * Landing.jsx - Página de Aterrizaje de NicaQuizz
 * "Maestro del Nacatamal" - Diseño Claro Modern Mestizaje
 * 
 * Secciones:
 * - Hero con título y CTAs
 * - Prueba Social (Nacatamales hoy + avatares)
 * - Tu Receta al Éxito (3 pasos)
 * - Inventario Cultural (ingredientes)
 * - CTA Final
 * - Footer
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

// Datos para prueba social
const NACATAMALES_HOY = 1284;
const AVATARES = [
  { id: 1, nombre: 'María', imagen: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, nombre: 'Carlos', imagen: 'https://i.pravatar.cc/100?img=2' },
  { id: 3, nombre: 'Ana', imagen: 'https://i.pravatar.cc/100?img=3' }
];

// Pasos del juego
const PASOS = [
  {
    numero: 1,
    titulo: 'Elegir Materia',
    descripcion: 'Selecciona entre Historia, Geografía, Literatura o Arte. Cada una te da ingredientes distintos.',
    icono: 'menu_book',
    color: 'text-[#154212]',
    badgeColor: 'bg-[#154212]'
  },
  {
    numero: 2,
    titulo: 'Responder',
    descripcion: 'Contesta trivias desafiantes. Entre más rápido y preciso seas, mejor será la calidad de tu ingrediente.',
    icono: 'quiz',
    color: 'text-[#755b00]',
    badgeColor: 'bg-[#755b00]'
  },
  {
    numero: 3,
    titulo: 'Ganar Ingredientes',
    descripcion: 'Recolecta Masa, Cerdo, Arroz, Papa y Chile. ¡Cinco ingredientes completan un Nacatamal de Oro!',
    icono: 'inventory_2',
    color: 'text-[#79001c]',
    badgeColor: 'bg-[#79001c]'
  }
];

// Ingredientes
const INGREDIENTES = [
  { tipo: 'masa', nombre: 'Masa', colorIcono: '#D2B48C' },
  { tipo: 'cerdo', nombre: 'Cerdo', colorIcono: '#FFB6C1' },
  { tipo: 'arroz', nombre: 'Arroz', colorIcono: '#F0F0F0' },
  { tipo: 'papa', nombre: 'Papa', colorIcono: '#E3A857' },
  { tipo: 'chile', nombre: 'Chile', colorIcono: '#E74C3C' }
];

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      
      {/* TopNavBar */}
      <nav className="bg-[#fefccf] border-b-2 border-[#154212]/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <div className="text-2xl font-black text-[#154212] uppercase font-headline tracking-tight">
            NicaQuizz
          </div>
          <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
            <Link to="/categories" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
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
            <button className="p-2 text-[#154212] hover:bg-[#154212]/5 rounded-lg transition-all scale-95 active:scale-90 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link
              to={currentUser ? '/play' : '/auth'}
              className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-[#154212] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              <span className="font-bold">{currentUser ? 'Mi Cuenta' : 'Ingresar'}</span>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#fccc38] text-[#1d1d03] font-headline font-bold text-sm mb-6 tracking-wide">
              EL JUEGO CULTURAL DEFINITIVO
            </span>
            <h1 className="text-6xl md:text-7xl font-headline font-extrabold text-[#154212] leading-[1.1] mb-6 tracking-tight">
              ¡Conviértete en el <span className="text-[#755b00] italic">Maestro</span> del Nacatamal!
            </h1>
            <p className="text-xl text-[#42493e] mb-10 max-w-lg leading-relaxed">
              Demuestra tus conocimientos en historia, geografía y arte para recolectar los ingredientes más frescos. ¡Prepara la receta perfecta mientras aprendes sobre Nicaragua!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={currentUser ? '/play' : '/auth?mode=register'}
                className="bg-[#2D5A27] text-white px-8 py-5 rounded-xl font-headline font-bold text-lg shadow-lg hover:bg-[#154212] transition-all scale-100 active:scale-95 flex items-center justify-center gap-2"
              >
                ¡Empezar a Jugar!
                <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
              <Link
                to="#como-funciona"
                className="bg-[#eceabe] text-[#154212] px-8 py-5 rounded-xl font-headline font-bold text-lg hover:bg-[#f2f0c4] transition-all border-2 border-[#154212]/10"
              >
                Ver Tutorial
              </Link>
            </div>
          </div>

          {/* Imagen Hero */}
          <div className="relative group">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#ffdf90]/30 rounded-full blur-3xl group-hover:bg-[#ffdf90]/50 transition-colors duration-700"></div>
            <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl rotate-3 transform transition-transform hover:rotate-0 duration-500 overflow-hidden">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-[#2D5A27] to-[#154212] rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-9xl text-white/80">lunch_dining</span>
              </div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#fccc38]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-bold tracking-widest uppercase">Misión del Día</span>
                </div>
                <h3 className="text-2xl font-headline font-bold">Consigue la Masa Perfecta</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="bg-[#154212] text-white py-12 mb-24 relative">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#fccc38] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#1d1d03] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <div>
                <p className="text-[#bcf0ae] uppercase font-bold tracking-widest text-xs mb-1">ESFUERZO COLECTIVO</p>
                <h4 className="text-3xl font-headline font-extrabold tracking-tight">{NACATAMALES_HOY.toLocaleString()} Nacatamales hoy</h4>
              </div>
            </div>
            <div className="flex -space-x-4">
              {AVATARES.map((avatar) => (
                <img
                  key={avatar.id}
                  alt={avatar.nombre}
                  className="w-12 h-12 rounded-full border-4 border-[#154212] object-cover"
                  src={avatar.imagen}
                />
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#154212] bg-[#ffdf90] text-[#1d1d03] flex items-center justify-center font-bold text-xs">
                +4k
              </div>
            </div>
            <div className="text-right hidden lg:block">
              <p className="italic text-[#bcf0ae]/80">"¡El sabor de la victoria es <br/>mejor que el del achiote!"</p>
            </div>
          </div>
        </section>

        {/* Cómo Funciona Section */}
        <section id="como-funciona" className="max-w-7xl mx-auto px-8 mb-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-[#154212] mb-4 tracking-tight">Tu Receta al Éxito</h2>
            <div className="h-1.5 w-24 bg-[#755b00] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {PASOS.map((paso) => (
              <div key={paso.numero} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-[2rem] bg-[#f8f6c9] flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:-translate-y-2 duration-300 relative">
                  <span className={`material-symbols-outlined ${paso.color} text-5xl`}>{paso.icono}</span>
                  <div className={`absolute -top-3 -right-3 w-10 h-10 ${paso.badgeColor} text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white`}>
                    {paso.numero}
                  </div>
                </div>
                <h3 className={`text-2xl font-headline font-bold ${paso.color} mb-3`}>{paso.titulo}</h3>
                <p className="text-[#42493e] leading-relaxed">{paso.descripcion}</p>
              </div>
            ))}
          </div>

          {/* Ingredients Showcase */}
          <div className="mt-20 p-8 md:p-12 bg-[#f2f0c4] rounded-[3rem] border-2 border-[#154212]/5">
            <h4 className="text-center font-headline font-bold text-[#154212]/60 uppercase tracking-[0.2em] mb-12 text-sm">Alacena Real</h4>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {INGREDIENTES.map((ing) => (
                <div key={ing.tipo} className="flex flex-col items-center gap-4 group">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <IngredientIcon type={ing.tipo} className="w-12 h-12" />
                  </div>
                  <span className="font-headline font-bold text-[#154212]">{ing.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-7xl mx-auto px-8 mb-32">
          <div className="bg-[#154212] rounded-[3rem] overflow-hidden relative p-12 md:p-24 text-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-white mb-8 leading-tight">
                ¿Tienes lo que se necesita para ser <br/>el próximo Maestro Cocinero?
              </h2>
              <p className="text-[#a1d494] text-xl mb-12 max-w-2xl mx-auto">
                Únete a miles de jugadores, compite en el ranking nacional y desbloquea recetas ancestrales mientras aprendes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  to={currentUser ? '/play' : '/auth?mode=register'}
                  className="w-full sm:w-auto px-12 py-6 bg-[#fccc38] text-[#1d1d03] rounded-2xl font-headline font-black text-xl shadow-2xl hover:bg-[#ffdf90] transition-all hover:-translate-y-1"
                >
                  ¡REGISTRARSE AHORA!
                </Link>
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-12 py-6 bg-transparent text-white border-2 border-white/20 rounded-2xl font-headline font-bold text-xl hover:bg-white/10 transition-all"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SideNavBar (Shelf - Ingredientes) */}
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 p-4 z-40 bg-[#fefccf]/90 backdrop-blur-xl rounded-l-2xl shadow-xl border-l border-[#154212]/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center cursor-help group relative">
            <span className="material-symbols-outlined">bakery_dining</span>
            <span className="absolute right-14 bg-[#154212] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Masa: 12
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#fccc38] text-[#1d1d03] flex items-center justify-center cursor-help group relative">
            <span className="material-symbols-outlined">lunch_dining</span>
            <span className="absolute right-14 bg-[#154212] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Cerdo: 05
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#e6e5b9] text-[#154212] flex items-center justify-center cursor-help group relative">
            <span className="material-symbols-outlined">bento</span>
            <span className="absolute right-14 bg-[#154212] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Arroz: 08
            </span>
          </div>
        </div>
      </aside>

      {/* Footer */}
      <footer className="bg-[#154212] w-full py-12 flex flex-col items-center gap-6 px-4 text-center">
        <div className="font-headline font-bold text-[#F4C430] text-2xl tracking-tight">
          NicaQuizz
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-body text-xs tracking-wide text-white">
          <a href="#" className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#F4C430]">
            Sobre el Proyecto
          </a>
          <a href="#" className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#F4C430]">
            Contacto
          </a>
          <a href="#" className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#F4C430]">
            Términos
          </a>
          <a href="#" className="opacity-80 hover:opacity-100 transition-opacity hover:text-[#F4C430]">
            Privacidad
          </a>
        </div>
        <p className="font-body text-xs tracking-wide text-white/60 mt-4">
          © 2025 NicaQuizz - El Arte del Modern Mestizaje
        </p>
      </footer>
    </div>
  );
}
