/**
 * ShopConnected.jsx - Tienda y Casa de Cambio
 * 
 * - Compra de mejoras y trabas con nacatamales
 * - Canje de achiotes por ingredientes (1:1)
 * 
 * Para comprar se requiere 1 nacatamal completo.
 * El canje de achiote es 1:1 (1 achiote = 1 ingrediente).
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getShopItems,
  purchaseItem,
  exchangeAchiote,
  getUserExchangeHistory,
  getUserWallet,
  INGREDIENTES,
  ITEM_TYPES
} from '../services/firestore';
import TopNavBar from '../components/TopNavBar';

export default function ShopConnected() {
  const { currentUser, userData } = useAuth();
  const toast = useToast();
  
  // Estados
  const [shopItems, setShopItems] = useState([]);
  const [wallet, setWallet] = useState({ coins: {}, mejoras: {}, trabas: {} });
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para canje
  const [exchangeAmount, setExchangeAmount] = useState(1);
  const [targetIngredient, setTargetIngredient] = useState('masa');

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Cargar items de la tienda
      const items = await getShopItems();
      setShopItems(items);

      // Cargar monedero del usuario
      const walletData = await getUserWallet(currentUser.uid);
      setWallet(walletData);

      // Cargar historial de canjes
      const history = await getUserExchangeHistory(currentUser.uid, 5);
      setExchangeHistory(history);
    } catch (error) {
      toast.handleError(error, 'Error al cargar tienda');
    } finally {
      setLoading(false);
    }
  }

  // Comprar item
  async function handleComprar(item) {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setLoading(true);
    try {
      await purchaseItem(currentUser.uid, item.id, item.currentPrice, item.type);
      toast.success(`¡${item.name} comprado exitosamente!`);
      loadData(); // Recargar datos
    } catch (error) {
      toast.error(error.message || 'Error al comprar item');
    } finally {
      setLoading(false);
    }
  }

  // Canjear achiote
  async function handleExchange(e) {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    const achioteCount = wallet.coins?.[INGREDIENTES.ACHIOTE] || 0;
    if (achioteCount < exchangeAmount) {
      toast.error('No tienes suficientes achiotes');
      return;
    }

    setLoading(true);
    try {
      await exchangeAchiote(currentUser.uid, targetIngredient, exchangeAmount);
      toast.success(`¡Canjeaste ${exchangeAmount} achiote(s) por ${exchangeAmount} ${getIngredientName(targetIngredient)}!`);
      setExchangeAmount(1);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al canjear');
    } finally {
      setLoading(false);
    }
  }

  function getIngredientName(key) {
    const names = {
      masa: 'Masa',
      cerdo: 'Cerdo',
      arroz: 'Arroz',
      papa: 'Papa',
      chile: 'Chile'
    };
    return names[key] || key;
  }

  function getIngredientIcon(key) {
    const icons = {
      masa: 'bakery_dining',
      cerdo: 'lunch_dining',
      arroz: 'rice_bowl',
      papa: 'egg',
      chile: 'local_fire_department',
      achiote: 'auto_awesome'
    };
    return icons[key] || 'circle';
  }

  function getIngredientColor(key) {
    const colors = {
      masa: 'bg-[#F4C430]',
      cerdo: 'bg-[#FF6B6B]',
      arroz: 'bg-[#F5F5F5]',
      papa: 'bg-[#C9A959]',
      chile: 'bg-[#E74C3C]',
      achiote: 'bg-[#D9531E]'
    };
    return colors[key] || 'bg-gray-400';
  }

  // Calcular nacatamales completados
  const monedas = wallet.coins || {};
  const nacatamalesCount = Math.min(
    monedas.masa || 0,
    monedas.cerdo || 0,
    monedas.arroz || 0,
    monedas.papa || 0,
    monedas.chile || 0
  );

  const achioteCount = monedas.achiote || 0;

  // Filtrar items por tipo
  const mejoras = shopItems.filter(item => item.type === ITEM_TYPES.MEJORA);
  const trabas = shopItems.filter(item => item.type === ITEM_TYPES.TRABA);

  // Opciones para canje
  const exchangeOptions = [
    { id: 'masa', nombre: 'Masa', icono: 'bakery_dining', color: 'bg-[#F4C430]' },
    { id: 'cerdo', nombre: 'Cerdo', icono: 'lunch_dining', color: 'bg-[#FF6B6B]' },
    { id: 'arroz', nombre: 'Arroz', icono: 'rice_bowl', color: 'bg-[#F5F5F5]' },
    { id: 'papa', nombre: 'Papa', icono: 'egg', color: 'bg-[#C9A959]' },
    { id: 'chile', nombre: 'Chile', icono: 'local_fire_department', color: 'bg-[#E74C3C]' }
  ];

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body flex flex-col">
      {/* TopNavBar */}
      <TopNavBar 
        currentPage="shop" 
        showNacatamales={true} 
        nacatamalesCount={nacatamalesCount} 
      />

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
                      {exchangeAmount} {getIngredientName(targetIngredient)}
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
                          <span className="font-bold text-[#154212]">+1 {getIngredientName(exchange.to)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Power-Ups Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-[#154212] text-3xl">flash_on</span>
            <h2 className="text-3xl font-bold font-headline text-[#154212] tracking-tight">
              Power-Ups: Ingredientes Secretos
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
              <p className="text-[#42493e]/60 mt-4">Cargando items...</p>
            </div>
          ) : mejoras.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#154212]/5">
              <p className="text-[#42493e]/60">No hay power-ups disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mejoras.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#f8f6c9] p-8 rounded-xl transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(21,66,18,0.12)] flex flex-col h-full border-b-4 border-transparent hover:border-[#154212]"
                >
                  <div className="w-16 h-16 bg-[#2D5A27]/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#154212] text-4xl">{item.icon || 'star'}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">{item.name}</h3>
                  <p className="text-[#42493e] mb-8 flex-grow">{item.description || 'Mejora tu rendimiento en el juego'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-[#755b00] font-bold">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
                      <span>{item.currentPrice || item.basePrice}</span>
                    </div>
                    <button
                      onClick={() => handleComprar(item)}
                      disabled={loading || nacatamalesCount < 1}
                      className="bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#154212] hover:text-white transition-all scale-95 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {nacatamalesCount < 1 ? 'Sin nacatamales' : 'Comprar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Desafíos Section (Trabas) */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-[#79001c] text-3xl">local_fire_department</span>
            <h2 className="text-3xl font-bold font-headline text-[#79001c] tracking-tight">
              Desafíos: Chile Picante
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
              <p className="text-[#42493e]/60 mt-4">Cargando items...</p>
            </div>
          ) : trabas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#154212]/5">
              <p className="text-[#42493e]/60">No hay desafíos disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trabas.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#ffdad9] p-8 rounded-xl transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(121,0,28,0.12)] flex flex-col h-full border-b-4 border-transparent hover:border-[#79001c]"
                >
                  <div className="w-16 h-16 bg-[#79001c]/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#79001c] text-4xl">{item.icon || 'fire'}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">{item.name}</h3>
                  <p className="text-[#42493e] mb-8 flex-grow">{item.description || 'Aumenta la dificultad para mayor recompensa'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-[#79001c] font-bold">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      <span>{item.reward || 'Bonus'}</span>
                    </div>
                    <button
                      onClick={() => handleComprar(item)}
                      disabled={loading || nacatamalesCount < 1}
                      className="bg-[#79001c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#a40029] hover:text-white transition-all scale-95 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {nacatamalesCount < 1 ? 'Sin nacatamales' : 'Aceptar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
