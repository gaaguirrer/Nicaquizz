/**
 * Landing.jsx - Página de Aterrizaje
 *
 * Primera página para usuarios no autenticados.
 * Muestra estadísticas dinámicas de nacatamales completados (caché 3h).
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  getTodayNacatamalesCount, 
  getTodayActiveUsers, 
  registerActiveUserToday, 
  getTodayChallenge, 
  hasUserCompletedDailyChallenge,
  getLastMonthNacatamalesCount,
  getTopUsersByNacatamales,
  incrementMonthlyNacatamales
} from '../../services/firestore';
import IngredientIcon from '../components/IngredientIcon';

export default function Landing() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [nacatamalesCount, setNacatamalesCount] = useState(0);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  useEffect(() => {
    async function loadMonthlyStats() {
      try {
        // Registrar usuario activo y actualizar contador si está logueado
        if (currentUser) {
          await registerActiveUserToday(currentUser.uid);
          await incrementMonthlyNacatamales(currentUser.uid);
        }

        // Cargar estadísticas del mes pasado (con caché de 3h)
        const count = await getLastMonthNacatamalesCount();
        const users = await getTopUsersByNacatamales(4);
        const challenge = await getTodayChallenge();

        setNacatamalesCount(count);
        setTopUsers(users);
        setDailyChallenge(challenge);
      } catch (error) {
        toast.handleError(error, 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    }

    loadMonthlyStats();
  }, [currentUser]);

  async function handleDailyChallenge() {
    if (!currentUser) {
      toast.info('Inicia sesión para participar en el reto diario');
      navigate('/auth');
      return;
    }

    try {
      // Verificar si ya completó el reto hoy
      const completed = await hasUserCompletedDailyChallenge(currentUser.uid);
      
      if (completed) {
        toast.success('¡Ya completaste el reto de hoy! Vuelve mañana.');
        return;
      }

      // Redirigir al reto diario
      // Si hay categoryId, ir a esa categoría, sino ir a preguntas generales con flag daily
      if (dailyChallenge?.categoryId) {
        navigate(`/questions/${dailyChallenge.categoryId}?daily=true`);
      } else if (dailyChallenge?.questionIds?.length > 0) {
        // Si no hay categoryId pero hay questionIds, ir a historia como default
        navigate(`/questions/historia?daily=true`);
      } else {
        toast.error('No hay reto disponible hoy. ¡Vuelve mañana!');
      }
    } catch (error) {
      toast.handleError(error, 'Error al iniciar reto diario');
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDD0] text-[#1d1d03] font-body">
      
      {/* TopNavBar */}
      <nav className="bg-[#fefccf] border-b-2 border-[#154212]/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🇳🇮</span>
            <div>
              <h1 className="text-2xl font-headline font-black text-[#154212] uppercase tracking-tight">NicaQuizz</h1>
              <p className="text-[10px] text-[#154212]/60 font-medium">El Nacatamal del Conocimiento</p>
            </div>
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
            {/* Campanita de notificaciones - Solo visible si está logueado */}
            {currentUser && (
              <Link
                to="/notifications"
                className="p-2 hover:bg-[#154212]/5 rounded-lg transition-all scale-95 active:scale-90 duration-200 relative"
              >
                <span className="material-symbols-outlined text-[#2D5A27]">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C41E3A] rounded-full"></span>
              </Link>
            )}
            {currentUser ? (
              <Link
                to="/play"
                className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <span className="font-bold">Mi Cuenta</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                <span className="font-bold">Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#C41E3A] text-white font-bold text-sm mb-6 tracking-wide shadow-sm uppercase">
              ¡Nicaragua te espera!
            </span>
            <h1 className="text-6xl md:text-8xl font-headline text-[#2D5A27] leading-tight mb-6 drop-shadow-sm">
              ¡Conviértete en el <br/>
              <span className="text-[#F4C430] italic">Maestro</span> del <br/>
              Nacatamal!
            </h1>
            <p className="text-xl text-[#2D5A27]/80 mb-10 max-w-lg leading-relaxed font-medium">
              Aprende Historia, Mate y más mientras recolectas los ingredientes más frescos para la receta perfecta. ¡Nicaragua es tu tablero de juego!
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to={currentUser ? '/play' : '/auth?mode=register'}
                className="btn-comic bg-[#F4C430] text-[#1d1d03] px-10 py-5 rounded-2xl font-game text-3xl animate-bounce-slow flex items-center justify-center gap-3"
              >
                ¡Empezar a Jugar!
                <span className="material-symbols-outlined text-4xl">rocket_launch</span>
              </Link>
              <Link
                to="#como-funciona"
                className="btn-comic bg-white text-[#2D5A27] px-10 py-5 rounded-2xl font-headline text-2xl hover:bg-white/90"
              >
                Ver Tutorial
              </Link>
            </div>
          </div>

          {/* Imagen Hero */}
          <div className="relative group">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#F4C430]/20 rounded-full blur-3xl"></div>
            <div 
              className="relative z-10 bg-white p-6 rounded-[2.5rem] border-4 border-black shadow-comic rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer"
              onClick={handleDailyChallenge}
            >
              <div className="relative w-full h-[500px] bg-gradient-to-br from-[#2D5A27] to-[#154212] rounded-[1.5rem] flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-9xl text-white/80">lunch_dining</span>
              </div>
              <div className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-md p-6 rounded-2xl border-2 border-[#F4C430]/50 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#F4C430]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span className="font-bold tracking-widest uppercase text-xs">Reto Diario</span>
                </div>
                <h3 className="text-3xl font-headline">Encuentra el Achiote Sagrado</h3>
                <p className="text-sm text-[#F4C430]/80 mt-1">
                  {loading ? 'Cargando...' : dailyChallenge ? '¡Disponible hoy!' : 'Próximamente'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="bg-[#2D5A27] py-10 relative border-y-4 border-black">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-[#F4C430] border-4 border-black flex items-center justify-center shadow-comic">
                <span className="material-symbols-outlined text-black text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <div>
                <p className="text-[#F4C430] font-bold tracking-widest text-sm mb-1 uppercase">Sabor Comunitario</p>
                <h4 className="text-4xl font-game text-white tracking-wider">
                  {loading ? 'Cargando...' : `${nacatamalesCount.toLocaleString()} Nacatamales el mes pasado`}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {topUsers.length > 0 ? (
                  topUsers.map((user, index) => (
                    <img
                      key={user.uid || user.id || index}
                      alt={user.displayName || 'Jugador'}
                      className="w-14 h-14 rounded-full border-4 border-black object-cover"
                      src={user.photoURL || `https://i.pravatar.cc/100?img=${index + 1}`}
                      title={`${user.displayName || 'Jugador'} - ${user.count || 0} nacatamales`}
                    />
                  ))
                ) : (
                  <>
                    <img
                      alt="Jugador"
                      className="w-14 h-14 rounded-full border-4 border-black object-cover"
                      src="https://i.pravatar.cc/100?img=1"
                    />
                    <img
                      alt="Jugador"
                      className="w-14 h-14 rounded-full border-4 border-black object-cover"
                      src="https://i.pravatar.cc/100?img=2"
                    />
                    <img
                      alt="Jugador"
                      className="w-14 h-14 rounded-full border-4 border-black object-cover"
                      src="https://i.pravatar.cc/100?img=3"
                    />
                    <div className="w-14 h-14 rounded-full border-4 border-black bg-[#C41E3A] text-white flex items-center justify-center font-bold text-sm">
                      +4k
                    </div>
                  </>
                )}
              </div>
              <div className="hidden lg:block">
                {topUsers.length > 0 ? (
                  <div className="text-white/90 font-medium text-sm">
                    <p className="font-bold text-[#F4C430]">Top jugadores del mes:</p>
                    <p className="text-white/80 italic">
                      {topUsers.map(u => u.displayName || 'Jugador').join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/80 italic font-medium">
                    "¡El sabor de la victoria es <br/>mejor que el del achiote!"
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Cómo Funciona Section */}
        <section id="como-funciona" className="max-w-7xl mx-auto px-8 py-32">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-headline text-[#2D5A27] mb-6">Tu Receta al Éxito</h2>
            <div className="h-2 w-32 bg-[#F4C430] mx-auto rounded-full border-2 border-black"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white border-4 border-black rounded-[2.5rem] p-10 pt-20 text-center shadow-comic h-full transition-transform hover:-translate-y-4">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#F4C430] border-4 border-black rounded-3xl flex items-center justify-center shadow-comic rotate-6 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-black text-6xl">menu_book</span>
                </div>
                <div className="absolute top-4 right-6 font-game text-5xl text-[#2D5A27]/10">01</div>
                <h3 className="text-3xl font-headline text-[#2D5A27] mb-4">Elige una materia</h3>
                <p className="text-[#2D5A27]/70 font-semibold leading-relaxed">
                  Historia, Mate, Geografía o Ciencias. Cada una desbloquea un ingrediente único.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white border-4 border-black rounded-[2.5rem] p-10 pt-20 text-center shadow-comic h-full transition-transform hover:-translate-y-4">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#C41E3A] border-4 border-black rounded-3xl flex items-center justify-center shadow-comic -rotate-6 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-white text-6xl">quiz</span>
                </div>
                <div className="absolute top-4 right-6 font-game text-5xl text-[#2D5A27]/10">02</div>
                <h3 className="text-3xl font-headline text-[#2D5A27] mb-4">Responde correctamente</h3>
                <p className="text-[#2D5A27]/70 font-semibold leading-relaxed">
                  Demuestra tu ingenio en trivias rápidas. ¡La precisión es clave para un buen guiso!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white border-4 border-black rounded-[2.5rem] p-10 pt-20 text-center shadow-comic h-full transition-transform hover:-translate-y-4">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#2D5A27] border-4 border-black rounded-3xl flex items-center justify-center shadow-comic rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-white text-6xl">inventory_2</span>
                </div>
                <div className="absolute top-4 right-6 font-game text-5xl text-[#2D5A27]/10">03</div>
                <h3 className="text-3xl font-headline text-[#2D5A27] mb-4">Gana ingredientes</h3>
                <p className="text-[#2D5A27]/70 font-semibold leading-relaxed">
                  Masa, Cerdo, Arroz, Papa y Chile. ¡Completa los cinco para el Nacatamal de Oro!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients Showcase */}
        <section className="max-w-4xl mx-auto px-8 mb-32">
          <div className="bg-white/50 border-4 border-black border-dashed rounded-[3rem] p-12 text-center">
            <h4 className="font-game text-2xl text-[#2D5A27]/40 uppercase tracking-widest mb-10">Tu Alacena Cultural</h4>
            <div className="flex flex-wrap justify-center gap-10">
              {[
                { nombre: 'Masa', tipo: 'masa', color: 'bg-[#F4C430]/20' },
                { nombre: 'Cerdo', tipo: 'cerdo', color: 'bg-[#C41E3A]/20' },
                { nombre: 'Arroz', tipo: 'arroz', color: 'bg-[#2D5A27]/20' },
                { nombre: 'Papa', tipo: 'papa', color: 'bg-yellow-100' },
                { nombre: 'Chile', tipo: 'chile', color: 'bg-red-100' }
              ].map((ing) => (
                <div key={ing.nombre} className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-2xl ${ing.color} border-2 border-black flex items-center justify-center p-2`}>
                    <IngredientIcon type={ing.tipo} size={40} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-tighter">{ing.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-7xl mx-auto px-8 mb-32">
          <div className="bg-[#2D5A27] border-4 border-black rounded-[4rem] overflow-hidden relative p-16 md:p-28 text-center shadow-comic">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-headline text-white mb-10 leading-tight">
                ¿Tienes lo que se necesita <br/> para ser el próximo <span className="text-[#F4C430] italic">Maestro</span>?
              </h2>
              <p className="text-[#F4C430] font-bold text-2xl mb-16 max-w-2xl mx-auto drop-shadow-sm">
                Únete a miles de jugadores, compite en el ranking nacional y desbloquea recetas ancestrales.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link
                  to={currentUser ? '/play' : '/auth?mode=register'}
                  className="w-full sm:w-auto px-16 py-8 btn-comic bg-[#F4C430] text-[#1d1d03] rounded-2xl font-game text-4xl shadow-comic"
                >
                  ¡REGISTRARSE AHORA!
                </Link>
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-16 py-8 border-4 border-white text-white rounded-2xl font-headline text-3xl hover:bg-white hover:text-[#2D5A27] transition-all"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#154212] w-full mt-auto py-12 flex flex-col items-center gap-6 px-4 text-center">
        <div className="font-headline font-bold text-[#F4C430] text-2xl tracking-tight">
          NicaQuizz
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-body text-xs tracking-wide text-[#fefccf]">
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
        <p className="font-body text-xs tracking-wide text-[#fefccf]/60 mt-4">
          © 2025 NicaQuizz - El Arte del Modern Mestizaje
        </p>
      </footer>

      {/* Estilos personalizados para botones cómic */}
      <style>{`
        .btn-comic {
          transition: all 0.2s ease;
          border: 3px solid #000;
          box-shadow: 6px 6px 0px #000;
        }
        .btn-comic:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }
        .btn-comic:active {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px #000;
        }
      `}</style>
    </div>
  );
}
