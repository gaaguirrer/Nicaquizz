/**
 * Shop.jsx - La Pulpería de Mejoras de NicaQuizz
 * "Ingredientes Secretos del Sabor"
 * 
 * Características:
 * - Power-Ups: Saltador, Reloj de Arena, Comodín
 * - Desafíos: Reloj Rápido, Pregunta Difícil, Sin Pistas
 * - Sidebar Mi Despensa (inventario)
 * - CTA final para jugar
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getShopItems,
  purchaseItem,
  INGREDIENTES,
  ITEM_TYPES,
  getUserWallet
} from '../services/firestore';

// Power-Ups disponibles
const POWER_UPS = [
  {
    id: 'saltador',
    nombre: 'Saltador',
    descripcion: 'Salta esa pregunta que te quema como el achiote puro. No pierdes puntos ni racha.',
    icono: 'step_over',
    precio: 150,
    color: 'bg-[#154212]'
  },
  {
    id: 'reloj_arena',
    nombre: 'Reloj de Arena',
    descripcion: 'Añade 30 segundos extras. Tómate tu tiempo para amarrar bien ese conocimiento.',
    icono: 'hourglass_empty',
    precio: 200,
    color: 'bg-[#154212]'
  },
  {
    id: 'comodin',
    nombre: 'Comodín',
    descripcion: 'Elimina dos respuestas incorrectas. Como quitarle la cáscara al ajo, más fácil imposible.',
    icono: 'style',
    precio: 350,
    color: 'bg-[#154212]'
  }
];

// Desafíos disponibles
const DESAFIOS = [
  {
    id: 'reloj_rapido',
    nombre: 'Reloj Rápido',
    descripcion: 'El tiempo corre al doble. Solo para expertos que no parpadean al cocinar.',
    icono: 'timer_off',
    recompensa: 500,
    multiplicador: 'x2',
    color: 'border-[#79001c]'
  },
  {
    id: 'pregunta_dificil',
    nombre: 'Pregunta Difícil',
    descripcion: 'Asegura que tu próxima tanda de preguntas sea de nivel "Abuela Nicaragüense".',
    icono: 'psychology_alt',
    recompensa: 750,
    multiplicador: 'x3',
    color: 'border-[#79001c]'
  },
  {
    id: 'sin_pistas',
    nombre: 'Sin Pistas',
    descripcion: 'Desactiva todos tus power-ups activos para un reto de honor puro.',
    icono: 'visibility_off',
    recompensa: 300,
    multiplicador: 'x1.5',
    color: 'border-[#79001c]'
  }
];

// Ingredientes para sidebar
const INVENTARIO = [
  { tipo: 'masa', nombre: 'Masa', cantidad: 12, icono: 'bakery_dining', activo: false },
  { tipo: 'cerdo', nombre: 'Cerdo', cantidad: 4, icono: 'restaurant', activo: false },
  { tipo: 'arroz', nombre: 'Hojas', cantidad: 8, icono: 'grass', activo: true },
  { tipo: 'chile', nombre: 'Chile', cantidad: 2, icono: 'hot_tub', activo: false }
];

export default function Shop() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [nacatamales, setNacatamales] = useState(1250);

  async function handleComprar(item) {
    setLoading(true);
    try {
      // Simulación de compra
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`¡${item.nombre} comprado exitosamente!`);
      setNacatamales(prev => prev - item.precio);
    } catch (error) {
      toast.error('Error al comprar');
    } finally {
      setLoading(false);
    }
  }

  async function handleDesafio(desafio) {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`¡Desafío ${desafio.nombre} activado!`);
      navigate('/categories');
    } catch (error) {
      toast.error('Error al activar desafío');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body flex flex-col">
      
      {/* TopNavBar */}
      <nav className="bg-[#fefccf] shadow-[0_8px_32px_rgba(29,29,3,0.08)] flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto sticky top-0 z-50 border-none">
        <Link to="/" className="text-3xl font-black text-[#154212] tracking-tighter font-headline">
          NicaQuizz
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/categories" className="text-stone-600 font-medium font-headline hover:text-[#755b00] transition-colors duration-300">
            Categorías
          </Link>
          <Link to="/ranking" className="text-stone-600 font-medium font-headline hover:text-[#755b00] transition-colors duration-300">
            Ranking
          </Link>
          <Link to="/shop" className="text-[#154212] border-b-4 border-[#154212] pb-1 font-headline font-bold tracking-tight">
            Tienda
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-[#fccc38] text-[#1d1d03] px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
            <span>{nacatamales.toLocaleString()} Nacatamales</span>
          </div>
          <Link
            to={currentUser ? '/profile' : '/auth'}
            className="text-[#154212] scale-95 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          </Link>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        
        {/* Header */}
        <header className="mb-16 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#154212]/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-6xl font-black text-[#154212] tracking-tighter font-headline leading-none mb-4">
              La Pulpería<br/><span className="text-[#755b00]">de Mejoras</span>
            </h1>
            <p className="text-xl text-[#42493e] max-w-xl font-medium">
              Equípate con ingredientes especiales para dominar el arte del Nacatamal Digital. Cada compra te acerca a la maestría culinaria.
            </p>
          </div>
        </header>

        {/* Power-Ups Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-[#154212] text-3xl">flash_on</span>
            <h2 className="text-3xl font-bold font-headline text-[#154212] tracking-tight">
              Power-Ups: Ingredientes Secretos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {POWER_UPS.map((item) => (
              <div
                key={item.id}
                className="bg-[#f8f6c9] p-8 rounded-xl transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(21,66,18,0.12)] flex flex-col h-full border-b-4 border-transparent hover:border-[#154212]"
              >
                <div className="w-16 h-16 bg-[#2D5A27]/10 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#154212] text-4xl">{item.icono}</span>
                </div>
                <h3 className="text-2xl font-bold font-headline mb-2">{item.nombre}</h3>
                <p className="text-[#42493e] mb-8 flex-grow">{item.descripcion}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-[#755b00] font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
                    <span>{item.precio}</span>
                  </div>
                  <button
                    onClick={() => handleComprar(item)}
                    disabled={loading || nacatamales < item.precio}
                    className="bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#154212] hover:text-white transition-all scale-95 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Desafíos Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-[#79001c] text-3xl">local_fire_department</span>
            <h2 className="text-3xl font-bold font-headline text-[#79001c] tracking-tight">
              Desafíos: Chile Picante
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DESAFIOS.map((desafio) => (
              <div
                key={desafio.id}
                className={`bg-[#eceabe] p-8 rounded-xl transition-all border-l-4 ${desafio.color} flex flex-col h-full`}
              >
                <div className="w-12 h-12 bg-[#79001c]/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#79001c] text-2xl">{desafio.icono}</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">{desafio.nombre}</h3>
                <p className="text-[#42493e] text-sm mb-6 flex-grow">{desafio.descripcion}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-[#42493e] font-bold">
                      Recompensa {desafio.multiplicador}
                    </span>
                    <div className="flex items-center gap-1 text-[#755b00] font-bold">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
                      <span>{desafio.recompensa}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDesafio(desafio)}
                    disabled={loading}
                    className="bg-[#79001c] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#a40029] transition-all scale-95 active:scale-90"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 p-12 bg-[#154212] rounded-[2rem] text-[#fefccf] relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <span className="material-symbols-outlined text-[20rem]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-md text-center md:text-left">
              <h3 className="text-4xl font-black font-headline mb-4 tracking-tighter">
                ¿Te faltan Nacatamales?
              </h3>
              <p className="text-[#fefccf]/80 text-lg">
                Sigue respondiendo trivias sobre nuestra cultura para ganar más puntos y canjearlos por estas increíbles mejoras.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/categories"
                className="bg-[#fccc38] text-[#1d1d03] px-8 py-4 rounded-xl font-bold hover:bg-[#ffdf90] hover:text-[#1d1d03] transition-all flex items-center gap-2 group"
              >
                Jugar Ahora
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                to="/profile"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Ver Logros
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#154212] w-full mt-auto py-12 flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="flex space-x-8 flex-wrap justify-center">
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
        <div className="text-[#F4C430] font-bold font-headline text-xl">NicaQuizz</div>
        <p className="text-[#fefccf]/60 font-headline text-xs font-light tracking-wide">
          © 2025 NicaQuizz - El Arte del Nacatamal Digital
        </p>
      </footer>

      {/* Sidebar - Mi Despensa (Desktop Only) */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col bg-[#fefccf] h-fit py-8 space-y-4 rounded-r-[2rem] shadow-xl z-40 border border-[#154212]/5">
        <div className="px-6 mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#154212]/40 mb-1">Tu Inventario</p>
          <h4 className="font-headline font-black text-[#154212] text-lg">Mi Despensa</h4>
        </div>
        <div className="flex flex-col">
          {INVENTARIO.map((ing) => (
            <Link
              key={ing.tipo}
              to="/shop"
              className={`${
                ing.activo
                  ? 'bg-[#755b00] text-white rounded-full mx-4 my-1 shadow-lg'
                  : 'text-[#154212] opacity-70 hover:bg-[#154212]/10'
              } flex items-center gap-4 px-6 py-3 transition-all cursor-pointer ${
                !ing.activo && 'translate-x-1 group'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: ing.activo ? "'FILL' 1" : "'FILL' 0" }}>
                {ing.icono}
              </span>
              <span className="font-headline text-sm uppercase tracking-widest font-bold">
                {ing.nombre} x{ing.cantidad}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 px-4">
          <Link
            to="/profile"
            className="w-full bg-[#154212] text-white py-4 rounded-2xl font-bold font-headline text-xs uppercase tracking-widest shadow-lg hover:shadow-[#154212]/20 hover:scale-[1.02] transition-all block text-center"
          >
            Cocinar Nacatamal
          </Link>
        </div>
      </aside>
    </div>
  );
}
