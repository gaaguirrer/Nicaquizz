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
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getShopItems,
  purchaseItem,
  INGREDIENTES,
  ITEM_TYPES,
  getUserWallet,
  exchangeAchiote,
  getUserExchangeHistory
} from '../../services/firestore';

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

// Power-Ups y Desafíos se cargan desde Firestore

export default function Shop() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [nacatamales, setNacatamales] = useState(1250);
  const [exchangeAmount, setExchangeAmount] = useState(1);
  const [targetIngredient, setTargetIngredient] = useState('masa');
  const [exchangeHistory, setExchangeHistory] = useState([]);

  const monedas = userData?.coins || {};
  const achioteCount = monedas.achiote || 0;

  // Ingredientes disponibles para canje
  const exchangeOptions = [
    { id: 'masa', nombre: 'Masa', icono: 'bakery_dining', color: 'bg-[#F4C430]' },
    { id: 'cerdo', nombre: 'Cerdo', icono: 'lunch_dining', color: 'bg-[#FF6B6B]' },
    { id: 'arroz', nombre: 'Arroz', icono: 'rice_bowl', color: 'bg-[#F5F5F5]' },
    { id: 'papa', nombre: 'Papa', icono: 'egg', color: 'bg-[#C9A959]' },
    { id: 'chile', nombre: 'Chile', icono: 'local_fire_department', color: 'bg-[#E74C3C]' }
  ];

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

  async function handleExchange(e) {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Debes iniciar sesión para canjear');
      return;
    }

    if (achioteCount < exchangeAmount) {
      toast.error('No tienes suficientes achiotes');
      return;
    }

    setLoading(true);
    try {
      await exchangeAchiote(currentUser.uid, targetIngredient, exchangeAmount);
      toast.success(`¡Canjeaste ${exchangeAmount} achiote(s) por ${exchangeAmount} ${targetIngredient}!`);
      setExchangeAmount(1);
      // Recargar historial
      const history = await getUserExchangeHistory(currentUser.uid, 5);
      setExchangeHistory(history);
    } catch (error) {
      toast.error(error.message || 'Error al canjear');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body flex flex-col">
      
      {/* TopNavBar */}
      <nav className="bg-[#fefccf] border-b-2 border-[#154212]/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-4xl">🇳🇮</span>
            <div>
              <h1 className="text-2xl font-headline font-black text-[#154212] uppercase tracking-tight">NicaQuizz</h1>
              <p className="text-[10px] text-[#154212]/60 font-medium">El Nacatamal del Conocimiento</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
            <Link to="/categories" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Categorías
            </Link>
            <Link to="/ranking" className="text-[#154212]/70 hover:text-[#154212] transition-colors">
              Ranking
            </Link>
            <Link to="/shop" className="text-[#154212] border-b-4 border-[#154212] pb-1 font-headline font-bold tracking-tight">
              Tienda
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#154212]/5 rounded-lg transition-all scale-95 active:scale-90 duration-200">
              <span className="material-symbols-outlined text-[#2D5A27]">notifications</span>
            </button>
            {currentUser ? (
              <>
                <div className="bg-[#fccc38] text-[#1d1d03] px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-sm">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
                  <span>{nacatamales.toLocaleString()} Nacatamales</span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                  <span className="font-bold">Mi Cuenta</span>
                </Link>
              </>
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

        {/* Casa de Cambio - Achiote */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-[#D9531E] text-3xl">currency_exchange</span>
            <h2 className="text-3xl font-bold font-headline text-[#154212] tracking-tight">
              Casa de Cambio
            </h2>
          </div>

          <div className="bg-gradient-to-br from-[#D9531E]/10 to-[#B93B0E]/10 border-2 border-[#D9531E]/30 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Formulario de Canje */}
              <div>
                <h3 className="text-2xl font-black font-headline text-[#154212] mb-2">
                  Canjea tu Achiote
                </h3>
                <p className="text-[#42493e] mb-6">
                  1 Achiote = 1 ingrediente de tu elección
                </p>

                <form onSubmit={handleExchange} className="space-y-4">
                  {/* Cantidad de Achiote */}
                  <div>
                    <label className="block text-sm font-bold text-[#154212] mb-2">
                      Cantidad a canjear
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max={achioteCount}
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 px-4 py-2 rounded-lg border-2 border-[#154212]/20 focus:border-[#D9531E] focus:outline-none font-bold"
                      />
                      <span className="text-[#42493e] font-medium">
                        (Tienes: <span className="font-bold text-[#D9531E]">{achioteCount} achiotes</span>)
                      </span>
                    </div>
                  </div>

                  {/* Ingrediente destino */}
                  <div>
                    <label className="block text-sm font-bold text-[#154212] mb-2">
                      Ingrediente a recibir
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {exchangeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setTargetIngredient(option.id)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                            targetIngredient === option.id
                              ? 'border-[#D9531E] bg-[#D9531E]/10'
                              : 'border-[#154212]/20 hover:border-[#154212]/40'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full ${option.color} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-sm">{option.icono}</span>
                          </span>
                          <span className="font-bold text-sm text-[#154212]">{option.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="bg-white/60 rounded-xl p-4 border border-[#154212]/10">
                    <p className="text-sm text-[#42493e] mb-1">Recibirás:</p>
                    <p className="text-xl font-black text-[#154212]">
                      {exchangeAmount} {targetIngredient === 'chile' ? 'Chile' : targetIngredient === 'papa' ? 'Papa' : targetIngredient === 'arroz' ? 'Arroz' : targetIngredient === 'cerdo' ? 'Cerdo' : 'Masa'}
                    </p>
                  </div>

                  {/* Botón de Canje */}
                  <button
                    type="submit"
                    disabled={loading || achioteCount === 0}
                    className="w-full bg-[#D9531E] hover:bg-[#B93B0E] disabled:bg-gray-400 text-white font-headline font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">currency_exchange</span>
                    {achioteCount === 0 ? 'Sin achiotes disponibles' : 'Canjear Ahora'}
                  </button>
                </form>
              </div>

              {/* Información y Reglas */}
              <div className="bg-white/80 rounded-2xl p-6 border border-[#154212]/10">
                <h4 className="text-lg font-bold font-headline text-[#154212] mb-4">
                  ¿Cómo funciona?
                </h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#D9531E] text-xl mt-0.5">check_circle</span>
                    <span className="text-[#42493e] text-sm">
                      Los <strong>achiotes</strong> se obtienen completando el <strong>Desafío Diario</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#D9531E] text-xl mt-0.5">check_circle</span>
                    <span className="text-[#42493e] text-sm">
                      Canjea 1 achiote por cualquier ingrediente base (masa, cerdo, arroz, papa o chile)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#D9531E] text-xl mt-0.5">check_circle</span>
                    <span className="text-[#42493e] text-sm">
                      Los achiotes <strong>no pueden</strong> usarse directamente para formar un nacatamal
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#D9531E] text-xl mt-0.5">check_circle</span>
                    <span className="text-[#42493e] text-sm">
                      Úsalos estratégicamente para completar tu colección
                    </span>
                  </li>
                </ul>

                {/* Historial de Canjes */}
                {exchangeHistory.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-[#154212] mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">history</span>
                      Últimos canjes
                    </h5>
                    <div className="space-y-2">
                      {exchangeHistory.map((exchange) => (
                        <div key={exchange.id} className="flex items-center justify-between text-xs p-2 bg-[#154212]/5 rounded-lg">
                          <span className="text-[#D9531E] font-bold">-1 Achiote</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          <span className="font-bold text-[#154212]">+1 {exchange.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
    </div>
  );
}
