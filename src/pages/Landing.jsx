/**
 * Landing Page - Página de bienvenida de NicaQuizz
 * Presenta el juego a los nuevos usuarios y los motiva a comenzar
 * Incluye: Hero section, características, categorías y llamado a la acción
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from '../components/UserMenu';

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Iconos SVG personalizados para los ingredientes del nacatamal
// Cada ingrediente se gana en una categoría diferente
const IngredientIcon = ({ type, className = '' }) => {
  const icons = {
    Masa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="32" rx="12" ry="20" fill="#F4C430" stroke="#D4A017" strokeWidth="2"/>
        <circle cx="28" cy="28" r="3" fill="#E8B830"/>
        <circle cx="36" cy="28" r="3" fill="#E8B830"/>
        <circle cx="28" cy="36" r="3" fill="#E8B830"/>
        <circle cx="36" cy="36" r="3" fill="#E8B830"/>
        <circle cx="32" cy="32" r="3" fill="#E8B830"/>
      </svg>
    ),
    'Carne de Cerdo': (
      <svg viewBox="0 0 64 64" className={className}>
        <rect x="16" y="20" width="32" height="24" rx="4" fill="#FF6B6B" stroke="#CC5555" strokeWidth="2"/>
        <rect x="20" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
        <rect x="34" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
      </svg>
    ),
    Arroz: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="40" rx="24" ry="12" fill="#F5F5F5" stroke="#DDD" strokeWidth="2"/>
        <ellipse cx="24" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(-30 24 38)"/>
        <ellipse cx="32" cy="36" rx="4" ry="8" fill="#FFF"/>
        <ellipse cx="40" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(30 40 38)"/>
      </svg>
    ),
    Papa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="34" rx="20" ry="16" fill="#C9A959" stroke="#9A7B4A" strokeWidth="2"/>
        <circle cx="26" cy="30" r="3" fill="#8B6F47"/>
        <circle cx="38" cy="32" r="2" fill="#8B6F47"/>
        <circle cx="32" cy="40" r="2" fill="#8B6F47"/>
      </svg>
    ),
    Chile: (
      <svg viewBox="0 0 64 64" className={className}>
        <path d="M32 12 Q36 8 40 12 L44 18 Q48 24 44 34 Q40 46 34 52 Q28 56 26 52 Q24 48 28 40 Q32 30 34 22 Q36 16 32 12Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
        <path d="M32 12 Q30 8 28 10 L26 14 Q28 16 32 12Z" fill="#27AE60"/>
      </svg>
    )
  };
  return icons[type] || <MaterialIcon name="grain" className={className} />;
};

export default function Landing() {
  const { currentUser } = useAuth();

  // Lista de categorías disponibles en el juego
  // Cada categoría otorga un ingrediente diferente del nacatamal
  const categorias = [
    {
      nombre: 'Historia',
      icono: 'history_edu',
      color: 'from-blue-500 to-blue-600',
      ingrediente: 'Masa',
      descripcion: 'Historia de Nicaragua y Centroamerica'
    },
    {
      nombre: 'Matematicas',
      icono: 'calculate',
      color: 'from-red-500 to-red-600',
      ingrediente: 'Carne de Cerdo',
      descripcion: 'Algebra, geometria y calculo'
    },
    {
      nombre: 'Geografia',
      icono: 'public',
      color: 'from-green-500 to-green-600',
      ingrediente: 'Arroz',
      descripcion: 'Geografia de Nicaragua y el mundo'
    },
    {
      nombre: 'Ciencias',
      icono: 'science',
      color: 'from-purple-500 to-purple-600',
      ingrediente: 'Papa',
      descripcion: 'Biologia, quimica y fisica'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      {/* Header - Barra de navegación */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo - Redirige a la landing page */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl">🇳🇮</span>
            <h1 className="text-2xl font-bold gradient-text">NicaQuizz</h1>
          </Link>

          {/* Botones de acción / UserMenu */}
          <div className="flex gap-4 items-center">
            {currentUser ? (
              <>
                <nav className="hidden md:flex gap-2 mr-4">
                  <Link to="/play" className="text-gray-400 hover:text-white px-3 py-2 font-medium transition-colors">Inicio</Link>
                  <Link to="/ranking" className="text-gray-400 hover:text-white px-3 py-2 font-medium transition-colors">Ranking</Link>
                </nav>
                <UserMenu />
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-secondary">
                  Iniciar Sesion
                </Link>
                <Link to="/auth" className="btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Sección principal de bienvenida */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        {/* Título principal - Atrae la atención inmediatamente */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
          ¡Pon a prueba tu <span className="gradient-text">conocimiento!</span>
        </h2>

        {/* Descripción - Explica qué es el juego en una frase */}
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          NicaQuizz es un juego de preguntas y respuestas donde compites con otros estudiantes,
          ganas ingredientes y formas tu propio nacatamal mientras aprendes.
        </p>

        {/* Botones de llamada a la acción - Posicionados prominentemente */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {currentUser ? (
            <Link to="/play" className="btn-primary py-4 px-10 text-lg hover-lift shadow-xl shadow-indigo-500/30">
              <span className="material-symbols-outlined align-middle mr-2">sports_esports</span>
              Ir a Jugar
            </Link>
          ) : (
            <Link to="/auth" className="btn-primary py-4 px-10 text-lg hover-lift shadow-xl shadow-indigo-500/30">
              <span className="material-symbols-outlined align-middle mr-2">rocket_launch</span>
              Comenzar Ahora - ¡Es gratis!
            </Link>
          )}

          {/* Botón secundario para conocer más */}
          <a href="#como-funciona" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Saber más
          </a>
        </div>

        {/* Indicador visual de scroll */}
        <div className="animate-bounce">
          <span className="material-symbols-outlined text-gray-400 text-4xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Como Funciona - Instrucciones paso a paso */}
      <section id="como-funciona" className="bg-gray-800/50 backdrop-blur-sm py-20 border-y border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16 gradient-text">
            ¿Como Funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1: Responder preguntas */}
            <div className="card hover-lift text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                <span className="material-symbols-outlined text-4xl text-white">quiz</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">1. Responde Preguntas</h3>
              <p className="text-gray-400">
                Elige una categoria y responde preguntas dificiles con 30 segundos por pregunta.
              </p>
            </div>
            
            {/* Paso 2: Ganar ingredientes */}
            <div className="card hover-lift text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <span className="material-symbols-outlined text-4xl text-white">lunch_dining</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">2. Gana Ingredientes</h3>
              <p className="text-gray-400">
                Por cada categoria completada, ganas un ingrediente del nacatamal.
              </p>
            </div>
            
            {/* Paso 3: Comprar items */}
            <div className="card hover-lift text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
                <span className="material-symbols-outlined text-4xl text-white">shopping_cart</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">3. Compra Power-ups</h3>
              <p className="text-gray-400">
                Completa tu nacatamal y canjealo por power-ups y debuffs para mejorar tu juego.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias - Muestra las 4 categorías disponibles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-4 gradient-text">
            Categorias Disponibles
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Compite en 4 categorias y colecciona todos los ingredientes
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorias.map((cat) => (
              <div
                key={cat.nombre}
                className="card overflow-hidden hover-lift group"
              >
                <div className={`bg-gradient-to-br ${cat.color} p-6 text-white rounded-xl`}>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform duration-300">
                      {cat.icono}
                    </span>
                    <h3 className="text-2xl font-bold">{cat.nombre}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <IngredientIcon type={cat.ingrediente} className="w-6 h-6" />
                    <span className="font-semibold text-gray-200">{cat.ingrediente}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{cat.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caracteristicas - Muestra todas las features del juego */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">
            Caracteristicas del Juego
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-5xl text-indigo-300">leaderboard</span>
                <div>
                  <h3 className="font-bold text-xl mb-2">Ranking Mundial</h3>
                  <p className="text-white/80">Compite con todos los jugadores y llega a la cima.</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-5xl text-purple-300">timer</span>
                <div>
                  <h3 className="font-bold text-xl mb-2">Temporizador</h3>
                  <p className="text-white/80">30 segundos por pregunta. ¡Piensa rapido!</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-5xl text-pink-300">people</span>
                <div>
                  <h3 className="font-bold text-xl mb-2">Juego Social</h3>
                  <p className="text-white/80">Agrega amigos y compite contra ellos.</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-5xl text-green-300">swap_horiz</span>
                <div>
                  <h3 className="font-bold text-xl mb-2">Intercambio</h3>
                  <p className="text-white/80">Intercambia monedas con amigos (max 3/dia).</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-5xl text-yellow-300">card_giftcard</span>
                <div>
                  <h3 className="font-bold text-xl mb-2">Regalos</h3>
                  <p className="text-white/80">Regala monedas a tus amigos (1/dia).</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-5xl text-red-300">emoji_events</span>
                <div>
                  <h3 className="font-bold text-xl mb-2">Nacatamales</h3>
                  <p className="text-white/80">Completa ingredientes y forma nacatamales automaticamente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Último llamado a la acción */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          ¿Listo para comenzar?
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Unete a miles de estudiantes y demuestra tu conocimiento
        </p>
        {currentUser ? (
          <Link to="/play" className="btn-primary py-4 px-8 text-lg hover-lift">
            <span className="material-symbols-outlined align-middle mr-2">sports_esports</span>
            Jugar Ahora
          </Link>
        ) : (
          <Link to="/auth" className="btn-primary py-4 px-8 text-lg hover-lift">
            <span className="material-symbols-outlined align-middle mr-2">person_add</span>
            Crear Cuenta Gratis
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🇳🇮</span>
            <h3 className="text-xl font-bold gradient-text">NicaQuizz</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Hecho con <span className="material-symbols-outlined text-red-500 align-middle text-lg">favorite</span> para estudiantes de Nicaragua.
          </p>
        </div>
      </footer>
    </div>
  );
}
