/**
 * Landing.jsx - Página de Aterrizaje de NicaQuizz
 * "El Modern Mestizaje"
 * 
 * Secciones:
 * - Hero Impactante con título y CTA
 * - Tu Receta al Éxito (pasos del juego)
 * - Prueba Social Dinámica (contador + avatares)
 * - Inventario Cultural (ingredientes)
 * - CTA de Cierre para registro
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

// Datos simulados para prueba social
const NACATAMALES_HOY = 1847;
const AVATARES = [
  { id: 1, nombre: 'María', imagen: '👩‍🎓' },
  { id: 2, nombre: 'Carlos', imagen: '👨‍💼' },
  { id: 3, nombre: 'Ana', imagen: '👩‍🔬' },
  { id: 4, nombre: 'Luis', imagen: '👨‍🎨' }
];

// Pasos del juego
const PASOS = [
  {
    numero: 1,
    titulo: 'Elige tu Materia',
    descripcion: 'Selecciona entre Historia, Matemáticas, Geografía o Ciencias. Cada categoría te da un ingrediente único.',
    icono: 'menu_book',
    color: 'from-nica-verde to-nica-amarillo',
    ingrediente: null
  },
  {
    numero: 2,
    titulo: 'Responde Correctamente',
    descripcion: 'Contesta trivias desafiantes. Tienes 30 segundos por pregunta. ¡Usa mejoras estratégicamente!',
    icono: 'quiz',
    color: 'from-blue-500 to-cyan-500',
    ingrediente: null
  },
  {
    numero: 3,
    titulo: 'Gana Ingredientes',
    descripcion: 'Recolecta Masa, Cerdo, Arroz, Papa y Chile. ¡Cinco ingredientes completan un Nacatamal!',
    icono: 'inventory_2',
    color: 'from-nica-amarillo to-orange-500',
    ingrediente: null
  }
];

// Ingredientes del nacatamal
const INGREDIENTES = [
  { 
    tipo: 'masa', 
    nombre: 'Masa de Maíz', 
    categoria: 'Historia', 
    descripcion: 'La base de todo nacatamal. Gánala dominando la historia de Nicaragua.',
    color: 'bg-amber-400'
  },
  { 
    tipo: 'cerdo', 
    nombre: 'Carne de Cerdo', 
    categoria: 'Matemáticas', 
    descripcion: 'Proteína matemática. Resuelve problemas y obtén este ingrediente esencial.',
    color: 'bg-pink-400'
  },
  { 
    tipo: 'arroz', 
    nombre: 'Arroz', 
    categoria: 'Geografía', 
    descripcion: 'Grano de conocimiento geográfico. Explora el mundo y gánalo.',
    color: 'bg-gray-200'
  },
  { 
    tipo: 'papa', 
    nombre: 'Papa', 
    categoria: 'Ciencias', 
    descripcion: 'Tubérculo científico. Domina las ciencias naturales para obtenerlo.',
    color: 'bg-yellow-600'
  },
  { 
    tipo: 'chile', 
    nombre: 'Chile', 
    categoria: 'Retos', 
    descripcion: 'El toque picante. Gánalo en retos en línea contra otros jugadores.',
    color: 'bg-red-600'
  }
];

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-nica-verde/30 via-gray-900 to-nica-verde/30">
      {/* Header / Navegación */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-nica-amarillo/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
                <p className="text-xs text-gray-400">El Nacatamal del Conocimiento</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/auth" className="text-gray-300 hover:text-nica-amarillo font-bold transition-colors hidden sm:block">
                  Iniciar Sesión
                </Link>
                <Link to="/auth?mode=register" className="btn-primary">
                  <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">play_arrow</span>
                  ¡Empezar a Jugar!
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-nica-amarillo/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-nica-rojo/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Contenido Hero */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-nica-amarillo/20 border border-nica-amarillo/50 px-4 py-2 rounded-full mb-6">
              <span className="material-symbols-rounded text-nica-amarillo text-sm">emoji_events</span>
              <span className="text-nica-amarillo font-bold text-sm">¡Únete a +5,000 jugadores!</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-5xl md:text-7xl font-display text-nica-amarillo mb-6 leading-tight gradient-text">
              ¡Conviértete en el<br/>
              <span className="text-white">Maestro del Nacatamal!</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Aprende <strong className="text-nica-amarillo">Historia</strong>, <strong className="text-nica-amarillo">Matemáticas</strong> y más mientras recolectas ingredientes para tu nacatamal virtual.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to={currentUser ? '/play' : '/auth?mode=register'}
                className="btn-primary text-lg px-8 py-5 animate-bounce-slow"
              >
                <span className="material-symbols-rounded inline-block align-middle mr-2">play_arrow</span>
                {currentUser ? 'Ir al Juego' : '¡Empezar a Jugar!'}
              </Link>
              <Link
                to="#como-funciona"
                className="btn-secondary text-lg px-8 py-5"
              >
                <span className="material-symbols-rounded inline-block align-middle mr-2">info</span>
                Saber Más
              </Link>
            </div>

            {/* Prueba Social - Nacatamales Hoy */}
            <div className="card bg-gradient-to-r from-nica-verde/30 to-nica-amarillo/30 border-nica-amarillo/50 inline-block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nica-amarillo to-yellow-600 flex items-center justify-center shadow-comic">
                  <span className="material-symbols-rounded text-4xl text-white">lunch_dining</span>
                </div>
                <div className="text-left">
                  <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Nacatamales Completados Hoy</p>
                  <p className="text-4xl font-display text-nica-amarillo font-bold">{NACATAMALES_HOY.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Avatares de jugadores */}
              <div className="mt-4 pt-4 border-t border-nica-amarillo/30">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  {AVATARES.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-nica-verde to-nica-amarillo flex items-center justify-center text-xl shadow-comic hover:scale-110 transition-transform"
                      title={avatar.nombre}
                    >
                      {avatar.imagen}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 border-2 border-gray-600">
                    +4k
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen/Ilustración Hero */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 rounded-3xl shadow-2xl border border-nica-amarillo/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Nacatamal Central */}
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-nica-amarillo to-yellow-600 rounded-full blur-2xl opacity-50 animate-glow"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-nica-verde to-nica-amarillo rounded-full flex items-center justify-center shadow-comic">
                    <span className="material-symbols-rounded text-8xl text-white">lunch_dining</span>
                  </div>
                </div>
                <h3 className="text-2xl font-display text-nica-amarillo mb-2">¡Tu Nacatamal Te Espera!</h3>
                <p className="text-gray-400">Completa los 5 ingredientes para convertirte en Maestro</p>
              </div>

              {/* Ingredientes Flotantes */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gray-800 rounded-2xl shadow-comic flex items-center justify-center animate-bounce-slow">
                <IngredientIcon type="masa" className="w-10 h-10" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gray-800 rounded-2xl shadow-comic flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <IngredientIcon type="cerdo" className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gray-800 rounded-2xl shadow-comic flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '1s' }}>
                <IngredientIcon type="arroz" className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gray-800 rounded-2xl shadow-comic flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
                <IngredientIcon type="papa" className="w-10 h-10" />
              </div>
            </div>

            {/* Decoración de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-nica-amarillo/20 to-nica-rojo/20 rounded-3xl rotate-6 scale-105 -z-10"></div>
          </div>
        </div>
      </section>

      {/* Sección: Tu Receta al Éxito */}
      <section id="como-funciona" className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          {/* Título de Sección */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-nica-amarillo mb-4">Tu Receta al Éxito</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-nica-verde to-nica-amarillo mx-auto rounded-full mb-4"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tres simples pasos para convertirte en el Maestro Cocinero
            </p>
          </div>

          {/* Pasos */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Línea conectora (desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-nica-verde/50 via-nica-amarillo/50 to-nica-verde/50 rounded-full"></div>

            {PASOS.map((paso, index) => (
              <div key={paso.numero} className="relative">
                {/* Card de Paso */}
                <div className="card text-center group hover-lift">
                  {/* Número de Paso */}
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${paso.color} flex items-center justify-center shadow-comic border-4 border-gray-900 z-10`}>
                    <span className="text-white font-display font-bold text-xl">{paso.numero}</span>
                  </div>

                  {/* Icono */}
                  <div className={`w-24 h-24 mx-auto mb-6 mt-4 rounded-2xl bg-gradient-to-br ${paso.color} flex items-center justify-center shadow-comic group-hover:shadow-comic-hover transition-shadow`}>
                    <span className="material-symbols-rounded text-5xl text-white">{paso.icono}</span>
                  </div>

                  {/* Contenido */}
                  <h3 className="text-2xl font-display text-white mb-3 group-hover:text-nica-amarillo transition-colors">
                    {paso.titulo}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {paso.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Inventario Cultural */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Título de Sección */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-nica-amarillo mb-4">Inventario Cultural</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-nica-verde to-nica-amarillo mx-auto rounded-full mb-4"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Colecciona los 5 ingredientes del nacatamal nicaragüense
            </p>
          </div>

          {/* Grid de Ingredientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {INGREDIENTES.map((ing) => (
              <div
                key={ing.tipo}
                className="card text-center group hover-lift relative overflow-hidden"
              >
                {/* Fondo con gradiente */}
                <div className={`absolute inset-0 ${ing.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

                {/* Icono del Ingrediente */}
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IngredientIcon type={ing.tipo} className="w-full h-full" />
                  </div>

                  {/* Información */}
                  <h3 className="text-xl font-display text-white mb-2">{ing.nombre}</h3>
                  
                  {/* Categoría Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                    ing.categoria === 'Historia' ? 'bg-amber-900/50 text-amber-400' :
                    ing.categoria === 'Matemáticas' ? 'bg-blue-900/50 text-blue-400' :
                    ing.categoria === 'Geografía' ? 'bg-green-900/50 text-green-400' :
                    ing.categoria === 'Ciencias' ? 'bg-purple-900/50 text-purple-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {ing.categoria}
                  </div>

                  <p className="text-gray-400 text-sm">
                    {ing.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Fórmula del Nacatamal */}
          <div className="card mt-12 bg-gradient-to-r from-nica-verde/20 to-nica-amarillo/20 border-nica-amarillo/50 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="material-symbols-rounded text-nica-amarillo text-3xl">formula</span>
              <h3 className="text-2xl font-display text-white">Fórmula del Nacatamal</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Completa los 5 ingredientes para formar un <strong className="text-nica-amarillo">Nacatamal Completo</strong> y canjéalo por mejoras en La Pulpería.
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {INGREDIENTES.map((ing) => (
                <div key={ing.tipo} className="flex items-center gap-2">
                  <div className="w-10 h-10">
                    <IngredientIcon type={ing.tipo} className="w-full h-full" />
                  </div>
                  <span className="text-nica-amarillo font-bold">+</span>
                </div>
              ))}
              <span className="text-white font-bold text-2xl">=</span>
              <div className="flex items-center gap-2 bg-nica-amarillo/20 px-4 py-2 rounded-xl border border-nica-amarillo/50">
                <span className="material-symbols-rounded text-nica-amarillo text-2xl">payments</span>
                <span className="text-nica-amarillo font-bold">1 Nacatamal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: CTA de Cierre */}
      <section className="py-20 px-4 bg-gradient-to-r from-nica-verde/30 via-nica-amarillo/20 to-nica-verde/30">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icono Principal */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-nica-amarillo to-yellow-600 flex items-center justify-center shadow-comic animate-glow">
            <span className="material-symbols-rounded text-6xl text-white">school</span>
          </div>

          {/* Título */}
          <h2 className="text-4xl md:text-6xl font-display text-nica-amarillo mb-6">
            ¿Tienes lo que se necesita para ser el próximo<br/>
            <span className="text-white">Maestro Cocinero?</span>
          </h2>

          {/* Descripción */}
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Únete a miles de jugadores, compite en el ranking nacional y desbloquea recetas ancestrales mientras aprendes sobre la cultura nicaragüense.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to={currentUser ? '/play' : '/auth?mode=register'}
              className="btn-primary text-lg px-10 py-5 shadow-2xl"
            >
              <span className="material-symbols-rounded inline-block align-middle mr-2">person_add</span>
              {currentUser ? 'Comenzar Aventura' : '¡Registrarse Ahora!'}
            </Link>
            <Link
              to="/auth"
              className="btn-secondary text-lg px-10 py-5"
            >
              <span className="material-symbols-rounded inline-block align-middle mr-2">login</span>
              Iniciar Sesión
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-12">
            <div>
              <p className="text-4xl font-display text-nica-amarillo font-bold">5,000+</p>
              <p className="text-gray-400 text-sm mt-1">Jugadores</p>
            </div>
            <div>
              <p className="text-4xl font-display text-nica-amarillo font-bold">50,000+</p>
              <p className="text-gray-400 text-sm mt-1">Preguntas</p>
            </div>
            <div>
              <p className="text-4xl font-display text-nica-amarillo font-bold">4</p>
              <p className="text-gray-400 text-sm mt-1">Categorías</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-3">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h3 className="text-2xl font-display text-nica-amarillo">NicaQuizz</h3>
                <p className="text-xs text-gray-500">El Nacatamal del Conocimiento</p>
              </div>
            </div>

            {/* Enlaces */}
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-nica-amarillo transition-colors">Sobre el Proyecto</a>
              <a href="#" className="text-gray-400 hover:text-nica-amarillo transition-colors">Contacto</a>
              <a href="#" className="text-gray-400 hover:text-nica-amarillo transition-colors">Términos</a>
              <a href="#" className="text-gray-400 hover:text-nica-amarillo transition-colors">Privacidad</a>
            </nav>

            {/* Copyright */}
            <p className="text-gray-600 text-sm">
              © 2025 NicaQuizz - El Arte del Modern Mestizaje
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
