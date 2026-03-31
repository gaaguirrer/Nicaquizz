import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getFriends,
  getUserTrades,
  getTradeRequests,
  createTradeRequest,
  acceptTrade,
  rejectTrade,
  getDailyTradeLimit,
  INGREDIENTES,
  INGREDIENTE_NAMES,
  fetchCurrencies,
  canGiftToday,
  getSentGifts,
  sendCoinsToFriend,
  exchangeCoins,
  getUserWallet
} from '../services/firestore';
import UserMenu from '../components/UserMenu';

// Iconos SVG personalizados para ingredientes\nconst IngredientIcon=({type,className=""})=>{const icons={masa:(<svg viewBox="0 0 64 64" className={className}><ellipse cx="32" cy="32" rx="12" ry="20" fill="#F4C430" stroke="#D4A017" strokeWidth="2"/><circle cx="28" cy="28" r="3" fill="#E8B830"/><circle cx="36" cy="28" r="3" fill="#E8B830"/><circle cx="28" cy="36" r="3" fill="#E8B830"/><circle cx="36" cy="36" r="3" fill="#E8B830"/><circle cx="32" cy="32" r="3" fill="#E8B830"/></svg>),cerdo:(<svg viewBox="0 0 64 64" className={className}><rect x="16" y="20" width="32" height="24" rx="4" fill="#FF6B6B" stroke="#CC5555" strokeWidth="2"/><rect x="20" y="24" width="10" height="8" rx="2" fill="#FF8888"/><rect x="34" y="24" width="10" height="8" rx="2" fill="#FF8888"/></svg>),arroz:(<svg viewBox="0 0 64 64" className={className}><ellipse cx="32" cy="40" rx="24" ry="12" fill="#F5F5F5" stroke="#DDD" strokeWidth="2"/><ellipse cx="24" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(-30 24 38)"/><ellipse cx="32" cy="36" rx="4" ry="8" fill="#FFF"/><ellipse cx="40" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(30 40 38)"/></svg>),papa:(<svg viewBox="0 0 64 64" className={className}><ellipse cx="32" cy="34" rx="20" ry="16" fill="#C9A959" stroke="#9A7B4A" strokeWidth="2"/><circle cx="26" cy="30" r="3" fill="#8B6F47"/><circle cx="38" cy="32" r="2" fill="#8B6F47"/><circle cx="32" cy="40" r="2" fill="#8B6F47"/></svg>),chile:(<svg viewBox="0 0 64 64" className={className}><path d="M32 12 Q36 8 40 12 L44 18 Q48 24 44 34 Q40 46 34 52 Q28 56 26 52 Q24 48 28 40 Q32 30 34 22 Q36 16 32 12Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/><path d="M32 12 Q30 8 28 10 L26 14 Q28 16 32 12Z" fill="#27AE60"/></svg>)};return icons[type]||null;};\n\n// Mapeo de ingredientes a iconos de Google Material Icons
const INGREDIENT_ICONS = {
  masa: 'corn',        // Mazorca de trigo/maíz
  cerdo: 'bento',    // Plato con carne
  arroz: 'wheat',   // Bowl de arroz
  papa: 'cookie',          // Huevo (forma similar a papa)
  chile: 'local_fire_department'  // Fuego (picante)
};

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Trade() {
  const { currentUser, userData } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('create'); // create, requests, history, gifts
  const [friends, setFriends] = useState([]);
  const [tradeRequests, setTradeRequests] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [giftHistory, setGiftHistory] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estado para crear intercambio
  const [selectedFriend, setSelectedFriend] = useState('');
  const [offeredIngredient, setOfferedIngredient] = useState('');
  const [offeredAmount, setOfferedAmount] = useState(1);
  const [requestedIngredient, setRequestedIngredient] = useState('');
  const [requestedAmount, setRequestedAmount] = useState(1);
  const [dailyTradesUsed, setDailyTradesUsed] = useState(0);
  
  // Estado para enviar regalos
  const [giftFriend, setGiftFriend] = useState('');
  const [giftIngredient, setGiftIngredient] = useState('');
  const [giftAmount, setGiftAmount] = useState(1);
  const [canSendGift, setCanSendGift] = useState(true);
  const [giftLoading, setGiftLoading] = useState(false);

  useEffect(() => {
    loadData();
    checkGiftAbility();
  }, []);

  async function checkGiftAbility() {
    try {
      const canGift = await canGiftToday(currentUser.uid);
      setCanSendGift(canGift);
    } catch (error) {
      console.error('Error al verificar regalo:', error);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const [friendsData, requestsData, historyData, currenciesData, dailyLimit, giftData] = await Promise.all([
        getFriends(currentUser.uid),
        getTradeRequests(currentUser.uid),
        getUserTrades(currentUser.uid),
        fetchCurrencies(),
        getDailyTradeLimit(currentUser.uid),
        getGiftHistory(currentUser.uid)
      ]);

      setFriends(friendsData || []);
      setTradeRequests(requestsData || []);
      setTradeHistory(historyData || []);
      setCurrencies(currenciesData || []);
      setDailyTradesUsed(dailyLimit || 0);
      setGiftHistory(giftData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendGift(e) {
    e.preventDefault();
    
    if (!giftFriend) {
      toast.error('Selecciona un amigo');
      return;
    }
    if (!giftIngredient) {
      toast.error('Selecciona un ingrediente');
      return;
    }
    if (giftAmount <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    // Verificar si puede enviar regalos hoy
    if (!canSendGift) {
      toast.error('Ya enviaste un regalo hoy. Vuelve mañana.');
      return;
    }

    // Verificar si tiene suficientes monedas
    const userCoins = coins[giftIngredient] || 0;
    if (userCoins < giftAmount) {
      toast.error(`No tienes suficientes ${INGREDIENTE_NAMES[giftIngredient]}`);
      return;
    }

    setGiftLoading(true);
    try {
      await createGift(currentUser.uid, giftFriend, giftIngredient, giftAmount);
      toast.success('¡Regalo enviado con éxito!');
      
      // Resetear formulario
      setGiftFriend('');
      setGiftIngredient('');
      setGiftAmount(1);
      setCanSendGift(false);
      
      loadData();
    } catch (error) {
      console.error('Error al enviar regalo:', error);
      toast.error(error.message || 'Error al enviar regalo');
    } finally {
      setGiftLoading(false);
    }
  }

  async function handleCreateTrade(e) {
    e.preventDefault();
    
    if (!selectedFriend) {
      setMessage({ type: 'error', text: 'Selecciona un amigo' });
      return;
    }
    if (!offeredIngredient || !requestedIngredient) {
      setMessage({ type: 'error', text: 'Selecciona ambos ingredientes' });
      return;
    }
    if (offeredAmount <= 0 || requestedAmount <= 0) {
      setMessage({ type: 'error', text: 'Las cantidades deben ser mayores a 0' });
      return;
    }

    // Verificar limite diario
    if (dailyTradesUsed >= 3) {
      setMessage({ type: 'error', text: 'Has alcanzado el límite de 3 intercambios diarios' });
      return;
    }

    try {
      await createTradeRequest(
        currentUser.uid,
        selectedFriend,
        offeredIngredient,
        offeredAmount,
        requestedIngredient,
        requestedAmount
      );
      setMessage({ type: 'success', text: 'Solicitud de intercambio enviada' });
      
      // Resetear formulario
      setSelectedFriend('');
      setOfferedIngredient('');
      setOfferedAmount(1);
      setRequestedIngredient('');
      setRequestedAmount(1);
      
      loadData();
    } catch (error) {
      console.error('Error al crear intercambio:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear intercambio' });
    }
  }

  async function handleAcceptTrade(trade) {
    try {
      await acceptTrade(
        trade.id,
        trade.senderId,
        currentUser.uid,
        trade.offeredIngredient,
        trade.offeredAmount,
        trade.requestedIngredient,
        trade.requestedAmount
      );
      setMessage({ type: 'success', text: '¡Intercambio completado!' });
      loadData();
    } catch (error) {
      console.error('Error al aceptar intercambio:', error);
      setMessage({ type: 'error', text: error.message || 'Error al aceptar intercambio' });
    }
  }

  async function handleRejectTrade(tradeId) {
    try {
      await rejectTrade(tradeId);
      setMessage({ type: 'success', text: 'Intercambio rechazado' });
      loadData();
    } catch (error) {
      console.error('Error al rechazar intercambio:', error);
      setMessage({ type: 'error', text: 'Error al rechazar intercambio' });
    }
  }

  const coins = userData?.coins || {};

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold gradient-text">
              <span className="text-3xl">��</span> NicaQuizz
            </h1>
            <nav className="hidden md:flex gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Inicio</Link>
              <Link to="/categories" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Categorías</Link>
              <Link to="/ranking" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Ranking</Link>
              <Link to="/friends" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Amigos</Link>
              <Link to="/trade" className="text-indigo-400 font-medium transition-colors">Intercambio</Link>
              <Link to="/shop" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Tienda</Link>
              <Link to="/profile" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Perfil</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <h1 className="text-4xl font-bold text-white mb-8 gradient-text">
          <MaterialIcon name="swap_horiz" className="inline-block w-8 h-8 align-middle mr-2" /> Intercambio de Monedas
        </h1>

        {/* Info de límite diario */}
        <div className="card mb-6 bg-indigo-900/30 border border-indigo-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MaterialIcon name="info" className="text-indigo-400 text-2xl" />
              <div>
                <p className="text-indigo-200 font-semibold">Límite de intercambios</p>
                <p className="text-indigo-300 text-sm">
                  Puedes intercambiar hasta 3 veces por día
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-400">
                {dailyTradesUsed}/3
              </p>
              <p className="text-xs text-indigo-300">usados hoy</p>
            </div>
          </div>
          <div className="mt-3 bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                dailyTradesUsed >= 3 ? 'bg-red-500' :
                dailyTradesUsed >= 2 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${(dailyTradesUsed / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="add_circle" className="inline-block w-5 h-5 align-middle mr-1" /> Crear Intercambio
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="mail" className="inline-block w-5 h-5 align-middle mr-1" /> Solicitudes ({tradeRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="history" className="inline-block w-5 h-5 align-middle mr-1" /> Historial
          </button>
          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'gifts'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="card_giftcard" className="inline-block w-5 h-5 align-middle mr-1" /> Regalos
          </button>
        </div>

        {/* Tab: Crear Intercambio */}
        {activeTab === 'create' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Formulario */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 text-white">
                <MaterialIcon name="add_circle" className="inline-block w-6 h-6 align-middle mr-1" /> Nuevo Intercambio
              </h2>
              <form onSubmit={handleCreateTrade} className="space-y-4">
                {/* Seleccionar amigo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amigo *
                  </label>
                  <select
                    value={selectedFriend}
                    onChange={(e) => setSelectedFriend(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Selecciona un amigo</option>
                    {friends.map(friend => (
                      <option key={friend.id} value={friend.id}>
                        {friend.displayName} ({friend.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Yo ofrezco */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tú ofreces *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={offeredIngredient}
                      onChange={(e) => setOfferedIngredient(e.target.value)}
                      className="input-field flex-1"
                      required
                    >
                      <option value="">Ingrediente</option>
                      {Object.entries(INGREDIENTES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {INGREDIENTE_NAMES[value]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={offeredAmount}
                      onChange={(e) => setOfferedAmount(parseInt(e.target.value) || 1)}
                      className="input-field w-20"
                      placeholder="Cantidad"
                      required
                    />
                  </div>
                  {offeredIngredient && (
                    <p className="text-sm text-gray-400 mt-1">
                      Tienes: <span className="font-bold text-green-400">{coins[offeredIngredient] || 0}</span>
                    </p>
                  )}
                </div>

                {/* Yo solicito */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tú solicitas *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={requestedIngredient}
                      onChange={(e) => setRequestedIngredient(e.target.value)}
                      className="input-field flex-1"
                      required
                    >
                      <option value="">Ingrediente</option>
                      {Object.entries(INGREDIENTES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {INGREDIENTE_NAMES[value]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(parseInt(e.target.value) || 1)}
                      className="input-field w-20"
                      placeholder="Cantidad"
                      required
                    />
                  </div>
                </div>

                {/* Resumen */}
                {offeredIngredient && requestedIngredient && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Resumen del intercambio:</p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <IngredientIcon type={offeredIngredient} className="text-red-400 text-4xl mb-1" />
                        <p className="text-sm font-bold text-white">-{offeredAmount}</p>
                        <p className="text-xs text-gray-400">{INGREDIENTE_NAMES[offeredIngredient]}</p>
                      </div>
                      <MaterialIcon name="swap_horiz" className="text-gray-500 text-2xl" />
                      <div className="text-center">
                        <IngredientIcon type={requestedIngredient} className="text-green-400 text-4xl mb-1" />
                        <p className="text-sm font-bold text-green-400">+{requestedAmount}</p>
                        <p className="text-xs text-gray-400">{INGREDIENTE_NAMES[requestedIngredient]}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={dailyTradesUsed >= 3}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    dailyTradesUsed >= 3
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  }`}
                >
                  {dailyTradesUsed >= 3 ? 'Límite alcanzado' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>

            {/* Tus monedas */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 text-white">
                <MaterialIcon name="grain" className="inline-block w-6 h-6 align-middle mr-1" /> Tus Monedas
              </h2>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(INGREDIENTES).map(([key, value]) => (
                  <div
                    key={key}
                    className={`text-center p-3 rounded-lg ${
                      (coins[value] || 0) > 0
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto mb-1">
                      <MaterialIcon name={INGREDIENT_ICONS[key]} className={`w-full h-full ${
                        (coins[value] || 0) > 0 ? 'text-green-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <p className="text-xs text-gray-400 truncate">{INGREDIENTE_NAMES[value]}</p>
                    <p className={`text-lg font-bold ${
                      (coins[value] || 0) > 0 ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {coins[value] || 0}
                    </p>
                  </div>
                ))}
              </div>

              {/* Monedas adicionales */}
              {currencies.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-3">Otras Monedas</h3>
                  <div className="space-y-2">
                    {currencies.filter(c => c.active).map(currency => (
                      <div key={currency.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <MaterialIcon name={currency.icon} className="text-gray-400" />
                          <span className="text-gray-300 text-sm">{currency.name}</span>
                        </div>
                        <span className="font-bold text-white">{coins[currency.name] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Solicitudes */}
        {activeTab === 'requests' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              Solicitudes Recibidas
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : tradeRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No tienes solicitudes pendientes
              </div>
            ) : (
              <div className="space-y-4">
                {tradeRequests.map(trade => (
                  <div key={trade.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                          {trade.sender?.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{trade.sender?.displayName}</p>
                          <p className="text-sm text-gray-400">Quiere intercambiar</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{trade.offeredAmount}</p>
                        <p className="text-xs text-gray-400">{INGREDIENTE_NAMES[trade.offeredIngredient]}</p>
                      </div>
                      <MaterialIcon name="arrow_forward" className="text-gray-500" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{trade.requestedAmount}</p>
                        <p className="text-xs text-gray-400">{INGREDIENTE_NAMES[trade.requestedIngredient]}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptTrade(trade)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="check" className="inline-block align-middle" /> Aceptar
                      </button>
                      <button
                        onClick={() => handleRejectTrade(trade.id)}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="close" className="inline-block align-middle" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Historial */}
        {activeTab === 'history' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="history" className="inline-block w-6 h-6 align-middle mr-1" /> Historial de Intercambios
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : tradeHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No has realizado intercambios aún
              </div>
            ) : (
              <div className="space-y-3">
                {tradeHistory.map(trade => (
                  <div key={trade.id} className={`p-4 rounded-lg border ${
                    trade.status === 'completed' ? 'bg-green-900/20 border-green-700' :
                    trade.status === 'rejected' ? 'bg-red-900/20 border-red-700' :
                    'bg-gray-800 border-gray-700'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <MaterialIcon name={
                          trade.status === 'completed' ? 'check_circle' :
                          trade.status === 'rejected' ? 'cancel' : 'pending'
                        } className={`text-lg ${
                          trade.status === 'completed' ? 'text-green-400' :
                          trade.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                        }`} />
                        <span className="font-semibold text-white capitalize">{trade.status}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {trade.date || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {trade.offeredAmount} {INGREDIENTE_NAMES[trade.offeredIngredient]} →
                      {trade.requestedAmount} {INGREDIENTE_NAMES[trade.requestedIngredient]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Regalos */}
        {activeTab === 'gifts' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Formulario para enviar regalo */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 text-white">
                <MaterialIcon name="card_giftcard" className="inline-block w-6 h-6 align-middle mr-1" /> Enviar Regalo
              </h2>
              
              <div className={`mb-4 p-3 rounded-lg ${
                canSendGift ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  <MaterialIcon name={canSendGift ? 'check_circle' : 'cancel'} className={
                    canSendGift ? 'text-green-400' : 'text-red-400'
                  } />
                  <p className={`text-sm ${canSendGift ? 'text-green-300' : 'text-red-300'}`}>
                    {canSendGift ? 'Puedes enviar 1 regalo hoy' : 'Ya enviaste un regalo hoy. Vuelve mañana.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendGift} className="space-y-4">
                {/* Seleccionar amigo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amigo *
                  </label>
                  <select
                    value={giftFriend}
                    onChange={(e) => setGiftFriend(e.target.value)}
                    className="input-field"
                    required
                    disabled={!canSendGift || giftLoading}
                  >
                    <option value="">Selecciona un amigo</option>
                    {friends.map(friend => (
                      <option key={friend.id} value={friend.id}>
                        {friend.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar ingrediente */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ingrediente *
                  </label>
                  <select
                    value={giftIngredient}
                    onChange={(e) => setGiftIngredient(e.target.value)}
                    className="input-field"
                    required
                    disabled={!canSendGift || giftLoading}
                  >
                    <option value="">Selecciona un ingrediente</option>
                    {Object.entries(INGREDIENTES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {INGREDIENTE_NAMES[value]} - {coins[value] || 0}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(parseInt(e.target.value) || 1)}
                    className="input-field"
                    disabled={!canSendGift || giftLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSendGift || giftLoading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    canSendGift
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {giftLoading ? 'Enviando...' : (
                    <><MaterialIcon name="card_giftcard" className="inline-block w-5 h-5 align-middle mr-1" /> Enviar Regalo</>
                  )}
                </button>
              </form>
            </div>

            {/* Historial de regalos */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 text-white">
                <MaterialIcon name="history" className="inline-block w-6 h-6 align-middle mr-1" /> Historial de Regalos
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Cargando...</div>
              ) : giftHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No has enviado regalos aún
                </div>
              ) : (
                <div className="space-y-3">
                  {giftHistory.map(gift => (
                    <div key={gift.id} className="p-4 rounded-lg border bg-gray-800 border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <MaterialIcon name="card_giftcard" className="text-lg text-pink-400" />
                        <span className="font-semibold text-white">Regalo enviado</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Fecha: {gift.date || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-300">
                        Cantidad: <span className="font-bold text-green-400">{gift.amount}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
