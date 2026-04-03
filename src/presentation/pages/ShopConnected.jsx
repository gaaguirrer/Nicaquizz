/**
 * ShopConnected.jsx - Tienda y Casa de Cambio
 *
 * Secciones:
 * - Conseguir Nacatamal: Convertir 5 monedas distintas en nacatamal
 * - Trueque: Casa de cambio de achiote por ingredientes
 * - Buffs: Mejoras (reloj_arena, comodin, pase)
 * - Debuffs: Trabas (reloj_rapido, pregunta_dificil, etc.)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getShopItems,
  purchaseItem,
  exchangeAchiote,
  getUserExchangeHistory,
  getUserWallet,
  convertToNacatamalManual,
  INGREDIENTES,
  ITEM_TYPES,
  clearCache
} from '../../services/firestore';
import TopNavBar from '../components/TopNavBar';

export default function ShopConnected() {
  const { currentUser, userData } = useAuth();
  const toast = useToast();

  // Estados
  const [shopItems, setShopItems] = useState([]);
  const [wallet, setWallet] = useState({ coins: {}, mejoras: {}, trabas: {} });
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para canje de achiote
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

      // Limpiar cache para obtener datos frescos de Firestore
      clearCache(`wallet_${currentUser.uid}`);

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
      loadData();
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

  // Canjear 5 ingredientes por 1 nacatamal (manual)
  async function handleConvertToNacatamal() {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setLoading(true);
    try {
      const resultado = await convertToNacatamalManual(currentUser.uid);
      if (resultado.success) {
        toast.success(`¡Canjeaste ${resultado.ingredientesUsados} ingredientes por ${resultado.nacatamalesAgregados} nacatamal!`);
        loadData();
      }
    } catch (error) {
      toast.error(error.message || 'Error al convertir');
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
      achiote: 'auto_awesome',
      nacatamal: 'restaurant'
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
      achiote: 'bg-[#D9531E]',
      nacatamal: 'bg-[#2D5A27]'
    };
    return colors[key] || 'bg-gray-400';
  }

  // Calcular nacatamales
  const monedas = wallet.coins || {};
  const nacatamalesCount = monedas.nacatamal || 0;
  const achioteCount = monedas.achiote || 0;

  // Ingredientes base disponibles
  const ingredientesBase = ['masa', 'cerdo', 'arroz', 'papa', 'chile'];
  const puedeConvertir = ingredientesBase.every(ing => (monedas[ing] || 0) >= 1);

  // Filtrar items por tipo
  const mejoras = shopItems.filter(item => item.type === ITEM_TYPES.MEJORA);
  const trabas = shopItems.filter(item => item.type === ITEM_TYPES.TRABA);

  // Opciones para canje de achiote
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-black text-[#154212] tracking-tighter font-headline leading-none mb-2">
            La Pulpería
          </h1>
          <p className="text-base text-[#42493e] max-w-xl font-medium">
            Equípate y convierte tus ingredientes para dominar el Nacatamal Digital.
          </p>
        </header>

        {/* Sección: Conseguir Nacatamal */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">restaurant</span>
            <h2 className="text-2xl font-bold font-headline text-[#154212] tracking-tight">
              Conseguir Nacatamal
            </h2>
          </div>

          <div className="bg-gradient-to-br from-[#2D5A27]/10 to-[#154212]/10 border-2 border-[#2D5A27]/30 rounded-xl p-5">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Info de conversión */}
              <div>
                <h3 className="text-lg font-black font-headline text-[#154212] mb-2">
                  Conversión Automática
                </h3>
                <p className="text-[#42493e] text-sm mb-4">
                  1 de cada ingrediente base = 1 Nacatamal
                </p>

                {/* Ingredientes necesarios */}
                <div className="space-y-2 mb-4">
                  {ingredientesBase.map((ing) => {
                    const tiene = monedas[ing] || 0;
                    const suficiente = tiene >= 1;
                    return (
                      <div key={ing} className="flex items-center justify-between bg-white/70 rounded-lg p-2 border border-[#154212]/10">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full ${getIngredientColor(ing)} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-sm">{getIngredientIcon(ing)}</span>
                          </span>
                          <span className="text-[#154212] text-sm font-medium capitalize">{ing}</span>
                        </div>
                        <span className={`font-bold text-sm ${suficiente ? 'text-[#2D5A27]' : 'text-[#C41E3A]'}`}>
                          {tiene} {suficiente ? '✓' : '✗'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Botón convertir */}
                <button
                  onClick={handleConvertToNacatamal}
                  disabled={loading || !puedeConvertir}
                  className="w-full bg-[#2D5A27] hover:bg-[#154212] disabled:bg-gray-400 text-white font-headline font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-lg">autorenew</span>
                  {puedeConvertir ? 'Convertir a Nacatamal' : 'Faltan ingredientes'}
                </button>
              </div>

              {/* Nacatamales actuales */}
              <div className="bg-white/80 rounded-xl p-4 border border-[#154212]/10">
                <h4 className="text-lg font-bold font-headline text-[#154212] mb-3">
                  Tus Nacatamales
                </h4>
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#2D5A27]/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[#2D5A27] text-5xl">restaurant</span>
                  </div>
                  <p className="text-4xl font-black text-[#2D5A27]">{nacatamalesCount}</p>
                  <p className="text-sm text-[#42493e]">nacatamal{nacatamalesCount !== 1 ? 'es' : ''}</p>
                </div>

                {/* Usos del nacatamal */}
                <div className="space-y-2 text-xs text-[#42493e]">
                  <p className="font-bold text-[#154212]">Usos:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[#2D5A27] text-sm mt-0.5">check_circle</span>
                      <span>Comprar mejoras (Buffs)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[#2D5A27] text-sm mt-0.5">check_circle</span>
                      <span>Aceptar desafíos (Debuffs)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Trueque (Casa de Cambio de Achiote) */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#D9531E] text-2xl">currency_exchange</span>
            <h2 className="text-2xl font-bold font-headline text-[#154212] tracking-tight">
              Trueque - Casa de Cambio
            </h2>
          </div>

          <div className="bg-gradient-to-br from-[#D9531E]/10 to-[#B93B0E]/10 border-2 border-[#D9531E]/30 rounded-xl p-5">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Formulario de Canje */}
              <div>
                <h3 className="text-lg font-black font-headline text-[#154212] mb-2">
                  Canjea tu Achiote
                </h3>
                <p className="text-[#42493e] text-sm mb-4">
                  1 Achiote = 1 ingrediente de tu elección
                </p>

                <form onSubmit={handleExchange} className="space-y-3">
                  {/* Cantidad de Achiote */}
                  <div>
                    <label className="block text-xs font-bold text-[#154212] mb-1">
                      Cantidad a canjear
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max={achioteCount}
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 rounded-lg border-2 border-[#154212]/20 focus:border-[#D9531E] focus:outline-none font-bold text-sm"
                      />
                      <span className="text-[#42493e] text-xs">
                        (Tienes: <span className="font-bold text-[#D9531E]">{achioteCount}</span>)
                      </span>
                    </div>
                  </div>

                  {/* Ingrediente destino */}
                  <div>
                    <label className="block text-xs font-bold text-[#154212] mb-1">
                      Ingrediente a recibir
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {exchangeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setTargetIngredient(option.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                            targetIngredient === option.id
                              ? 'border-[#D9531E] bg-[#D9531E]/10'
                              : 'border-[#154212]/20 hover:border-[#154212]/40'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full ${option.color} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-xs">{option.icono}</span>
                          </span>
                          <span className="font-bold text-xs text-[#154212]">{option.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botón de Canje */}
                  <button
                    type="submit"
                    disabled={loading || achioteCount === 0}
                    className="w-full bg-[#D9531E] hover:bg-[#B93B0E] disabled:bg-gray-400 text-white font-headline font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">currency_exchange</span>
                    {achioteCount === 0 ? 'Sin achiotes' : 'Canjear'}
                  </button>
                </form>
              </div>

              {/* Información y Reglas */}
              <div className="bg-white/80 rounded-xl p-4 border border-[#154212]/10">
                <h4 className="text-sm font-bold font-headline text-[#154212] mb-3">
                  ¿Cómo funciona?
                </h4>
                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#D9531E] text-base mt-0.5">check_circle</span>
                    <span className="text-[#42493e]">
                      Los <strong>achiotes</strong> se obtienen en el <strong>Desafío Diario</strong> y <strong>Reto del Achiote</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#D9531E] text-base mt-0.5">check_circle</span>
                    <span className="text-[#42493e]">
                      Canjea 1 achiote por cualquier ingrediente base
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#D9531E] text-base mt-0.5">check_circle</span>
                    <span className="text-[#42493e]">
                      Los achiotes <strong>no</strong> forman nacatamal directamente
                    </span>
                  </li>
                </ul>

                {/* Historial de Canjes */}
                {exchangeHistory.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-[#154212] mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">history</span>
                      Últimos canjes
                    </h5>
                    <div className="space-y-1">
                      {exchangeHistory.map((exchange) => (
                        <div key={exchange.id} className="flex items-center justify-between text-xs p-1.5 bg-[#154212]/5 rounded">
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

        {/* Sección: Buffs (Mejoras) */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#2D5A27] text-2xl">flash_on</span>
            <h2 className="text-2xl font-bold font-headline text-[#154212] tracking-tight">
              Buffs - Mejoras
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
              <p className="text-[#42493e]/60 mt-2 text-sm">Cargando...</p>
            </div>
          ) : mejoras.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-[#154212]/5">
              <p className="text-[#42493e]/60 text-sm">No hay mejoras disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mejoras.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#f8f6c9] p-5 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg flex flex-col h-full border-b-3 border-transparent hover:border-[#154212]"
                >
                  <div className="w-12 h-12 bg-[#2D5A27]/10 rounded-xl flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#154212] text-3xl">{item.icon || 'star'}</span>
                  </div>
                  <h3 className="text-lg font-bold font-headline mb-1">{item.name}</h3>
                  <p className="text-[#42493e] text-sm mb-4 flex-grow">{item.description || 'Mejora tu rendimiento'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-[#755b00] font-bold text-sm">
                      <span className="material-symbols-outlined text-sm">restaurant</span>
                      <span>{item.currentPrice || item.basePrice}</span>
                    </div>
                    <button
                      onClick={() => handleComprar(item)}
                      disabled={loading || nacatamalesCount < 1}
                      className="bg-[#2D5A27] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#154212] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {nacatamalesCount < 1 ? 'Sin nacatamales' : 'Comprar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sección: Debuffs (Trabas) */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#79001c] text-2xl">local_fire_department</span>
            <h2 className="text-2xl font-bold font-headline text-[#79001c] tracking-tight">
              Debuffs - Desafíos
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
              <p className="text-[#42493e]/60 mt-2 text-sm">Cargando...</p>
            </div>
          ) : trabas.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-[#154212]/5">
              <p className="text-[#42493e]/60 text-sm">No hay desafíos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trabas.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#ffdad9] p-5 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-lg flex flex-col h-full border-b-3 border-transparent hover:border-[#79001c]"
                >
                  <div className="w-12 h-12 bg-[#79001c]/10 rounded-xl flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#79001c] text-3xl">{item.icon || 'fire'}</span>
                  </div>
                  <h3 className="text-lg font-bold font-headline mb-1">{item.name}</h3>
                  <p className="text-[#42493e] text-sm mb-4 flex-grow">{item.description || 'Aumenta la dificultad'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-[#79001c] font-bold text-sm">
                      <span className="material-symbols-outlined text-sm">local_fire_department</span>
                      <span>{item.reward || 'Bonus'}</span>
                    </div>
                    <button
                      onClick={() => handleComprar(item)}
                      disabled={loading || nacatamalesCount < 1}
                      className="bg-[#79001c] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#a40029] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <section className="mt-8 p-6 bg-[#154212] rounded-xl text-[#fefccf] relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <span className="material-symbols-outlined text-[12rem]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="max-w-md text-center md:text-left">
              <h3 className="text-2xl font-black font-headline mb-2 tracking-tighter">
                ¿Te faltan ingredientes?
              </h3>
              <p className="text-[#fefccf]/80 text-sm">
                Sigue respondiendo trivias para ganar más ingredientes y convertirlos en nacatamales.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/play"
                className="bg-[#fccc38] text-[#1d1d03] px-6 py-3 rounded-xl font-bold hover:bg-[#ffdf90] transition-all flex items-center gap-2 group text-sm"
              >
                Jugar Ahora
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
              </Link>
              <Link
                to="/categories"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all text-sm"
              >
                Ver Categorías
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#154212] w-full mt-auto py-8 flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="text-[#F4C430] font-bold font-headline text-lg">NicaQuizz</div>
        <p className="text-[#fefccf]/60 font-headline text-xs font-light tracking-wide">
          © 2025 NicaQuizz - El Arte del Nacatamal Digital
        </p>
      </footer>
    </div>
  );
}
