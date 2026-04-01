/**
 * Landing Page - Puerta de Entrada de NicaQuizz
 * "El Nacatamal del Conocimiento"
 * 
 * Presenta el juego a los nuevos usuarios con:
 * - Hero section con CTA principal
 * - Sección "Cómo Funciona" con 3 pasos
 * - Social proof con contador de nacatamales
 * - Vista previa de categorías
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

export default function Landing() {
  const { currentUser } = useAuth();

  // Categorías con sus ingredientes y colores
  const categorias = [
    {
      nombre: 'Historia',
      icono: 'history_edu',
      color: 'bg-categoria-historia',
      ingrediente: 'masa',
      descripcion: 'Historia de Nicaragua y Centroamérica'
    },
    {
      nombre: 'Matemáticas',
      icono: 'calculate',
      color: 'bg-categoria-matematicas',
      ingrediente: 'cerdo',
      descripcion: 'Álgebra, geometría y cálculo'
    },
    {
      nombre: 'Geografía',
      icono: 'public',
      color: 'bg-categoria-geografia',
      ingrediente: 'arroz',
      descripcion: 'Geografía de Nicaragua y el mundo'
    },
    {
      nombre: 'Ciencias',
      icono: 'science',
      color: 'bg-categoria-ciencias',
      ingrediente: 'papa',
      descripcion: 'Biología, química y física'
    }
  ];

  // Pasos de "Cómo Funciona"
  const pasos = [
    {
      numero: 1,
      titulo: 'Elige una Materia',
      descripcion: 'Selecciona entre Historia, Matemáticas, Geografía o Ciencias',
      icono: 'menu_book'
    },
    {
      numero: 2,
      titulo: 'Responde Correctamente',
      descripcion: 'Tienes 30 segundos por pregunta. ¡Usa tus mejoras estratégicamente!',
      icono: 'check_circle'
    },
    {
      numero: 3,
      titulo: 'Gana Ingredientes',
      descripcion: 'Completa categorías y colecciona los 5 ingredientes del nacatamal',
      icono: 'lunch_dining'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nica-verde via-gray-900 to-nica-verde/50">
      {/* Navegación */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇳🇮</span>
            <div>
              <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
              <p className="text-xs text-gray-400">El Nacatamal del Conocimiento</p>
            </div>
          </div>
          {currentUser ? (
            <UserMenu />
          ) : (
            <div className="flex gap-3">
              <Link
                to="/auth"
                className="btn-secondary"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/auth?mode=register"
                className="btn-bounce"
              >
                ¡Empezar a Jugar!
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-nica-amarillo/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-nica-rojo/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Título principal */}
          <h2 className="text-6xl md:text-8xl font-display mb-6 animate-fade-in">
            <span className="gradient-text-nica">
              ¡Conviértete en el Maestro<br/>del Nacatamal!
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Aprende <strong className="text-nica-amarillo">Historia</strong>, <strong className="text-nica-amarillo">Matemáticas</strong> y más 
            mientras recolectas ingredientes para tu nacatamal virtual.
          </p>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to={currentUser ? '/play' : '/auth?mode=register'}
              className="btn-bounce text-lg px-8 py-4"
            >
              <span className="material-symbols-rounded inline-block align-middle mr-2">
                play_arrow
              </span>
              {currentUser ? 'Ir al Juego' : '¡Empezar a Jugar!'}
            </Link>
            <Link
              to="/play"
              className="btn-secondary text-lg px-8 py-4"
            >
              <span className="material-symbols-rounded inline-block align-middle mr-2">
                info
              </span>
              Saber Más
            </Link>
          </div>

          {/* Ingredientes en animación */}
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {['masa', 'cerdo', 'arroz', 'papa', 'chile'].map((ing, i) => (
              <div 
                key={ing}
                className="w-16 h-16 md:w-20 md:h-20 animate-bounce-slow"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <IngredientIcon type={ing} className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display text-center text-nica-amarillo mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Tres simples pasos para convertirte en el maestro del nacatamal
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {pasos.map((paso, index) => (
              <div 
                key={paso.numero}
                className="card text-center relative group hover-lift"
              >
                {/* Número de paso */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-nica-amarillo to-nica-verde rounded-full flex items-center justify-center font-display text-2xl text-white shadow-comic border-2 border-black/20">
                    {paso.numero}
                  </div>
                </div>

                {/* Icono */}
                <div className="w-20 h-20 bg-gradient-to-br from-nica-verde to-nica-amarillo rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 shadow-comic group-hover:shadow-comic-hover transition-shadow">
                  <span className="material-symbols-rounded text-4xl text-white">
                    {paso.icono}
                  </span>
                </div>

                <h3 className="text-2xl font-display text-white mb-3">
                  {paso.titulo}
                </h3>
                <p className="text-gray-400">
                  {paso.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Contador */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center bg-gradient-to-br from-nica-verde/30 to-nica-amarillo/30 border-nica-amarillo/50">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="material-symbols-rounded text-4xl text-nica-amarillo">
                lunch_dining
              </span>
              <h3 className="text-2xl font-display text-white">
                Nacatamales Completados Hoy
              </h3>
            </div>
            <div className="text-6xl font-display text-nica-amarillo animate-glow">
              127
            </div>
            <p className="text-gray-400 mt-2">
              ¡Únete a la competencia!
            </p>
          </div>
        </div>
      </section>

      {/* Categorías Preview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display text-center text-nica-amarillo mb-4">
            Categorías Disponibles
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Compite en 4 categorías y colecciona todos los ingredientes
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorias.map((cat) => (
              <div
                key={cat.nombre}
                className={`${cat.color} category-card group`}
              >
                {/* Icono de categoría */}
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-rounded text-4xl text-white">
                    {cat.icono}
                  </span>
                  <div className="w-10 h-10">
                    <IngredientIcon type={cat.ingrediente} className="w-full h-full" />
                  </div>
                </div>

                {/* Información */}
                <h3 className="text-2xl font-display text-white mb-2 group-hover:text-nica-amarillo transition-colors">
                  {cat.nombre}
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  {cat.descripcion}
                </p>

                {/* Ingrediente */}
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="material-symbols-rounded text-sm">rewards</span>
                  <span className="capitalize">{cat.ingrediente}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Secundario */}
          <div className="text-center mt-12">
            <Link
              to="/play"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center"
            >
              <span className="material-symbols-rounded mr-2">explore</span>
              Ver Todas las Categorías
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🇳🇮</span>
            <span className="font-display text-xl text-nica-amarillo">NicaQuizz</span>
          </div>
          <p className="text-gray-500 text-sm">
            Hecho con ❤️ para el aprendizaje de Nicaragua
          </p>
          <p className="text-gray-600 text-xs mt-2">
            © 2025 NicaQuizz. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
