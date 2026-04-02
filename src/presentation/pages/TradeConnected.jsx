/**
 * TradeConnected.jsx - Mercado de Trueques de NicaQuizz
 * Versión conectada a Firestore
 *
 * Características:
 * - Mis ingredientes (desde getUserWallet)
 * - Trueques disponibles (desde getTradeRequests)
 * - Crear nuevo trueque (con createTradeRequest)
 * - Aceptar/Rechazar trueque (con acceptTrade/rejectTrade)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getUserWallet,
  getTradeRequests,
  createTradeRequest,
  acceptTrade,
  rejectTrade,
  INGREDIENTES,
  INGREDIENTE_NAMES
} from '../../services/firestore';
import TopNavBar from '../components/TopNavBar';
import Modal from '../components/Modal';
import Button from '../components/Button';

export default function TradeConnected() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Estados
  const [wallet, setWallet] = useState({ coins: {} });
  const [tradeRequests, setTradeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estado para crear trueque
  const [doyIngrediente, setDoyIngrediente] = useState('masa');
  const [doyCantidad, setDoyCantidad] = useState(1);
  const [buscoIngrediente, setBuscoIngrediente] = useState('cerdo');
  const [buscoCantidad, setBuscoCantidad] = useState(1);

  // Cargar datos
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Cargar monedero del usuario
      const walletData = await getUserWallet(currentUser.uid);
      setWallet(walletData);

      // Cargar solicitudes de trueque disponibles
      const requests = await getTradeRequests();
      // Filtrar solo pendientes y que no sean del usuario actual
      const filtered = requests.filter(
        req => req.status === 'pending' && req.receiverId !== currentUser.uid && req.senderId !== currentUser.uid
      );
      setTradeRequests(filtered);
    } catch (error) {
      toast.handleError(error, 'Error al cargar trueques');
    } finally {
      setLoading(false);
    }
  }

  // Crear nuevo trueque (abierto, sin receiver específico)
  async function handleCrearTrueque(e) {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // Validaciones
    if (doyIngrediente === buscoIngrediente) {
      toast.error('No puedes intercambiar el mismo ingrediente');
      return;
    }

    const miSaldo = wallet.coins[doyIngrediente] || 0;
    if (miSaldo < doyCantidad) {
      toast.error(`No tienes suficientes ${INGREDIENTE_NAMES[doyIngrediente]}. Tienes: ${miSaldo}`);
      return;
    }

    try {
      // Crear trueque abierto (receiverId null, cualquiera puede aceptar)
      await createTradeRequest(
        currentUser.uid,
        null, // receiverId null = abierto a cualquiera
        doyIngrediente,
        doyCantidad,
        buscoIngrediente,
        buscoCantidad
      );
      toast.success('¡Trueque creado exitosamente!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al crear trueque');
    }
  }

  // Aceptar trueque
  async function handleAceptarTrueque(tradeId) {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // Obtener datos del trueque
    const trade = tradeRequests.find(t => t.id === tradeId);
    if (!trade) {
      toast.error('Trueque no encontrado');
      return;
    }

    if (!window.confirm('¿Estás seguro de aceptar este trueque?')) return;

    try {
      await acceptTrade(
        tradeId,
        trade.senderId,
        currentUser.uid,
        trade.offeredIngredient,
        trade.offeredAmount,
        trade.requestedIngredient,
        trade.requestedAmount
      );
      toast.success('¡Trueque aceptado exitosamente!');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al aceptar trueque');
    }
  }

  // Rechazar trueque
  async function handleRechazarTrueque(tradeId) {
    if (!currentUser) return;

    try {
      await rejectTrade(tradeId);
      toast.success('Trueque rechazado');
      loadData();
    } catch (error) {
      toast.error('Error al rechazar trueque');
    }
  }

  // Resetear formulario
  function resetForm() {
    setDoyIngrediente('masa');
    setDoyCantidad(1);
    setBuscoIngrediente('cerdo');
    setBuscoCantidad(1);
  }

  // Obtener icono de ingrediente
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

  // Obtener color de ingrediente
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

  // Ingredientes disponibles para mostrar
  const ingredientes = Object.entries(wallet.coins || {}).map(([key, value]) => ({
    key,
    nombre: INGREDIENTE_NAMES[key] || key,
    cantidad: value,
    icono: getIngredientIcon(key),
    color: getIngredientColor(key)
  })).filter(ing => ing.cantidad > 0);

  // Opciones para select
  const ingredienteOptions = Object.values(INGREDIENTES).filter(ing => ing !== 'achiote');

  return (
    <div className="bg-[#fefccf] text-[#1d1d03] font-body min-h-screen">
      {/* TopNavBar */}
      <TopNavBar currentPage="trade" />

      {/* Main Content Canvas */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Header Section */}
          <section className="relative">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-headline font-extrabold text-[#154212] mb-4 tracking-tight leading-tight">
                Mercado de <br/>
                <span className="text-[#755b00] italic">Trueques Artesanales</span>
              </h1>
              <p className="text-[#42493e] text-lg">
                Cambia tus ingredientes sobrantes y completa tus recetas para el gran banquete de NicaQuizz.
              </p>
            </div>
            {/* Decorative element */}
            <div className="absolute -top-10 -right-4 opacity-20 pointer-events-none hidden lg:block">
              <span className="material-symbols-outlined text-[120px] text-[#154212] rotate-12">potted_plant</span>
            </div>
          </section>

          {/* Mis Ingredientes - Horizontal Scrollable Bento Style */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold text-[#1d1d03] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#154212]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                Mis Ingredientes
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-[#72796e]">
                {ingredientes.length} disponibles
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
                <p className="text-[#42493e]/60 mt-4">Cargando ingredientes...</p>
              </div>
            ) : ingredientes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#154212]/5">
                <p className="text-[#42493e]/60">No tienes ingredientes aún. ¡Juega para conseguir!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ingredientes.map((ing) => (
                  <div
                    key={ing.key}
                    className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-[#f2f0c4] transition-colors border-b-4 border-[#154212]/20"
                  >
                    <div className={`w-16 h-16 ${ing.color} rounded-full flex items-center justify-center mb-3`}>
                      <span className="material-symbols-outlined text-white text-3xl">{ing.icono}</span>
                    </div>
                    <span className="text-xs font-bold text-[#72796e] uppercase">{ing.nombre}</span>
                    <span className="text-3xl font-headline font-black text-[#154212]">{String(ing.cantidad).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trueques Disponibles Grid */}
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-headline font-bold text-[#1d1d03]">Trueques Disponibles</h2>
                <p className="text-[#42493e] text-sm">Oportunidades de intercambio en tu vecindad</p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="md"
                className="flex items-center gap-2"
              >
                <span className="material-symbols-outlined">post_add</span>
                Crear Trueque
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
                <p className="text-[#42493e]/60 mt-4">Cargando trueques...</p>
              </div>
            ) : tradeRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-[#154212]/5">
                <span className="material-symbols-outlined text-6xl text-[#154212]/20 mb-4">swap_horiz</span>
                <p className="text-[#42493e]/60 text-lg mb-4">No hay trueques disponibles en este momento</p>
                <Button onClick={() => setShowCreateModal(true)} variant="primary">
                  Crear el primer trueque
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradeRequests.map((trueque) => (
                  <div
                    key={trueque.id}
                    className="bg-[#fefccf] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(29,29,3,0.08)] group hover:-translate-y-1 transition-transform border-2 border-transparent hover:border-[#755b00]/20"
                  >
                    {/* Header */}
                    <div className="bg-[#154212]/10 p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2D5A27] flex items-center justify-center text-white font-bold">
                        {trueque.sender?.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#154212]">{trueque.sender?.displayName || 'Usuario'}</p>
                        <p className="text-xs text-[#42493e]/60">Quiere intercambiar</p>
                      </div>
                    </div>

                    {/* Trade Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        {/* Doy (offered) */}
                        <div className="text-center flex-1">
                          <p className="text-xs uppercase font-black text-[#154212]/60 mb-1">Ofrece</p>
                          <div className="bg-[#bcf0ae]/30 rounded-xl py-3 border border-[#154212]/10">
                            <p className="text-xl font-black text-[#154212]">
                              {trueque.offeredAmount} {INGREDIENTE_NAMES[trueque.offeredIngredient] || trueque.offeredIngredient}
                            </p>
                          </div>
                        </div>
                        
                        {/* Icono */}
                        <div className="px-4">
                          <span className="material-symbols-outlined text-[#755b00] text-3xl">sync_alt</span>
                        </div>
                        
                        {/* Busco (requested) */}
                        <div className="text-center flex-1">
                          <p className="text-xs uppercase font-black text-[#154212]/60 mb-1">Busca</p>
                          <div className="bg-[#ffdf90]/30 rounded-xl py-3 border border-[#755b00]/10">
                            <p className="text-xl font-black text-[#755b00]">
                              {trueque.requestedAmount} {INGREDIENTE_NAMES[trueque.requestedIngredient] || trueque.requestedIngredient}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAceptarTrueque(trueque.id)}
                          variant="primary"
                          className="flex-1"
                          size="sm"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          Aceptar
                        </Button>
                        <Button
                          onClick={() => handleRechazarTrueque(trueque.id)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bottom CTA / Floating Section */}
          <section className="bg-[#2D5A27] p-8 rounded-3xl relative overflow-hidden text-white">
            <div className="relative z-10 md:flex items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-3xl font-headline font-extrabold mb-2 text-[#bcf0ae]">
                  ¿No encuentras lo que buscas?
                </h3>
                <p className="text-white/90 opacity-90 max-w-lg">
                  Crea tu propia oferta y espera a que otros comerciantes acepten tu propuesta de intercambio.
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#fccc38] text-[#1d1d03] px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl hover:scale-105 transition-transform active:scale-95"
                variant="secondary"
                size="lg"
              >
                <span className="material-symbols-outlined">post_add</span>
                CREAR MI OFERTA
              </Button>
            </div>
            {/* Abstract visual element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </section>
        </div>
      </main>

      {/* Modal Crear Trueque */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Crear Trueque"
        size="md"
      >
        <form onSubmit={handleCrearTrueque} className="space-y-6">
          {/* Doy */}
          <div>
            <label className="block text-sm font-bold text-[#154212] mb-2">
              Yo doy
            </label>
            <div className="flex gap-4">
              <select
                value={doyIngrediente}
                onChange={(e) => setDoyIngrediente(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-bold"
              >
                {ingredienteOptions.map((ing) => (
                  <option key={ing} value={ing}>
                    {INGREDIENTE_NAMES[ing]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max={wallet.coins[doyIngrediente] || 1}
                value={doyCantidad}
                onChange={(e) => setDoyCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-bold text-center"
              />
            </div>
            <p className="text-xs text-[#42493e]/60 mt-2">
              Disponibles: {wallet.coins[doyIngrediente] || 0} {INGREDIENTE_NAMES[doyIngrediente]}
            </p>
          </div>

          {/* Busco */}
          <div>
            <label className="block text-sm font-bold text-[#154212] mb-2">
              Yo busco
            </label>
            <div className="flex gap-4">
              <select
                value={buscoIngrediente}
                onChange={(e) => setBuscoIngrediente(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-bold"
              >
                {ingredienteOptions.map((ing) => (
                  <option key={ing} value={ing}>
                    {INGREDIENTE_NAMES[ing]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={buscoCantidad}
                onChange={(e) => setBuscoCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-bold text-center"
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-[#154212]/5 rounded-xl p-4 border border-[#154212]/10">
            <p className="text-sm font-bold text-[#154212] mb-2">Resumen del trueque:</p>
            <p className="text-center text-lg">
              <span className="font-black text-[#2D5A27]">{doyCantidad} {INGREDIENTE_NAMES[doyIngrediente]}</span>
              <span className="mx-2 text-[#154212]/40">→</span>
              <span className="font-black text-[#755b00]">{buscoCantidad} {INGREDIENTE_NAMES[buscoIngrediente]}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Trueque'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fefccf] shadow-[0_-8px_32px_rgba(29,29,3,0.08)] flex justify-around items-center h-16 z-50 px-4">
        <Link
          to="/trade"
          className="flex flex-col items-center gap-1 text-[#154212] border-b-2 border-[#154212]"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <span className="text-[10px] font-medium">Mercado</span>
        </Link>
        <Link
          to="/friends"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-medium">Amigos</span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">military_tech</span>
          <span className="text-[10px] font-medium">Desafíos</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
