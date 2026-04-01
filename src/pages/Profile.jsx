import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getUserWallet,
  INGREDIENTES,
  INGREDIENTE_NAMES,
  rechargeMejoras,
  canRechargeMejoras,
  TRABAS
} from '../services/firestore';
import UserMenu from '../components/UserMenu';

// Iconos SVG personalizados para ingredientes
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

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Mapeo de ingredientes a colores
const INGREDIENT_COLORS = {
  masa: { bg: 'from-amber-100 to-amber-200', border: 'border-amber-400', text: 'text-amber-600' },
  cerdo: { bg: 'from-pink-200 to-rose-300', border: 'border-pink-400', text: 'text-pink-600' },
  arroz: { bg: 'from-gray-50 to-gray-100', border: 'border-gray-300', text: 'text-gray-600' },
  papa: { bg: 'from-yellow-200 to-amber-300', border: 'border-yellow-500', text: 'text-yellow-700' },
  chile: { bg: 'from-green-200 to-emerald-300', border: 'border-green-500', text: 'text-green-600' }
};

// Mapeo de tabs a iconos
const TAB_ICONS = {
  stats: 'bar_chart',
  wallet: 'account_balance_wallet',
  mejoras: 'emoji_events',
  privacy: 'lock'
};

export default function Profile() {
  const { currentUser, userData, updatePrivacy } = useAuth();
  const toast = useToast();
  const [wallet, setWallet] = useState({ coins: {}, mejoras: {}, trabas: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeInfo, setRechargeInfo] = useState({ canRecharge: false, hoursLeft: 0 });

  useEffect(() => {
    loadWallet();
    checkRechargeInfo();
  }, []);

  async function checkRechargeInfo() {
    try {
      const info = await canRechargeMejoras(currentUser.uid);
      setRechargeInfo(info);
    } catch (error) {
      console.error('Error al verificar recarga:', error);
    }
  }

  async function handleRechargeMejoras() {
    setRechargeLoading(true);
    try {
      await rechargeMejoras(currentUser.uid);
      toast.success('¡Mejoras recargadas exitosamente!');
      checkRechargeInfo();
      loadWallet();
    } catch (error) {
      toast.error(error.message || 'Error al recargar mejoras');
    } finally {
      setRechargeLoading(false);
    }
  }

  async function loadWallet() {
    try {
      const data = await getUserWallet(currentUser.uid);
      setWallet(data);
    } catch (error) {
      console.error('Error al cargar monedero:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePrivacyChange(isPublic, allowOpenChallenges) {
    try {
      await updatePrivacy(isPublic, allowOpenChallenges);
      setMessage({ type: 'success', text: 'Configuración actualizada' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar' });
    }
  }

  // Calcular estadísticas
  const stats = userData?.stats || {};
  const totalQuestions = stats.totalQuestionsAnswered || 0;
  const totalCorrect = stats.totalCorrect || 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;

  // Calcular nacatamales completos
  const coins = wallet.coins || {};
  const hasNacatamal = Object.values(INGREDIENTES).every(ing => (coins[ing] || 0) >= 1);
  const nacatamalesCount = hasNacatamal
    ? Math.min(...Object.values(INGREDIENTES).map(ing => coins[ing] || 0))
    : 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🇳🇮</span>
              <h1 className="text-2xl font-bold gradient-text">NicaQuizz</h1>
            </Link>
          </div>
          <UserMenu />
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

        <h1 className="text-3xl font-bold text-white mb-6 gradient-text">
          <MaterialIcon name="person" className="inline-block w-8 h-8 align-middle mr-2" />
          Mi Perfil
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name={TAB_ICONS.stats} className="inline-block w-5 h-5 align-middle mr-1" /> Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'wallet'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name={TAB_ICONS.wallet} className="inline-block w-5 h-5 align-middle mr-1" /> Monedero
          </button>
          <button
            onClick={() => setActiveTab('mejoras')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'mejoras'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name={TAB_ICONS.mejoras} className="inline-block w-5 h-5 align-middle mr-1" /> Mejoras
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name={TAB_ICONS.privacy} className="inline-block w-5 h-5 align-middle mr-1" /> Privacidad
          </button>
        </div>

        {/* Tab: Estadísticas */}
        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4 text-white">
                <MaterialIcon name="bar_chart" className="inline-block w-6 h-6 align-middle mr-1" /> Estadísticas Generales
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Preguntas Respondidas</span>
                  <span className="font-bold text-2xl text-white">{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Aciertos</span>
                  <span className="font-bold text-2xl text-green-400">{totalCorrect}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Precisión</span>
                  <span className={`font-bold text-2xl ${
                    accuracy >= 70 ? 'text-green-400' :
                    accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{accuracy}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Victorias</span>
                  <span className="font-bold text-2xl text-green-400">{wins}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Derrotas</span>
                  <span className="font-bold text-2xl text-red-400">{losses}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4 text-white">Progreso por Categoría</h2>
              <div className="space-y-4">
                {Object.entries(stats.categoryStats || {}).map(([catId, catStats]) => (
                  <div key={catId} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium capitalize">{catId}</span>
                      <span className="text-gray-400 text-sm">
                        {catStats.correct}/{catStats.total} aciertos
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${catStats.total > 0 ? (catStats.correct / catStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.categoryStats || {}).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MaterialIcon name="menu_book" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Juega en las categorías para ver tu progreso</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Monedero */}
        {activeTab === 'wallet' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="account_balance_wallet" className="inline-block w-6 h-6 align-middle mr-1" /> Monedero
            </h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : (
              <>
                {/* Nacatamales completos */}
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-4 mb-6 border border-green-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-green-300 font-semibold mb-1">Nacatamales Completos</h3>
                      <p className="text-green-200 text-sm">
                        {nacatamalesCount === 0 
                          ? 'Completa categorías para obtener ingredientes'
                          : `Tienes ${nacatamalesCount} nacatamal${nacatamalesCount !== 1 ? 'es' : ''} para usar en la tienda`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 64 64" className="w-12 h-12">
                        <circle cx="32" cy="32" r="28" fill="#FFD700" stroke="#DAA520" strokeWidth="3"/>
                        <circle cx="32" cy="32" r="22" fill="none" stroke="#FFA500" strokeWidth="2"/>
                        <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#DAA520">$</text>
                      </svg>
                      <span className="text-green-400 font-bold text-3xl">{nacatamalesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Ingredientes individuales */}
                <h3 className="text-white font-semibold mb-3">Ingredientes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {Object.entries(INGREDIENTES).map(([key, value]) => {
                    const count = coins[value] || 0;
                    const hasIngredient = count >= 1;
                    const colors = INGREDIENT_COLORS[key] || { bg: 'from-gray-200 to-gray-300', border: 'border-gray-400', text: 'text-gray-600' };

                    return (
                      <div
                        key={key}
                        className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                          hasIngredient
                            ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-lg`
                            : 'bg-gray-800/50 border border-gray-600/50 opacity-50'
                        }`}
                      >
                        <div className="w-12 h-12 mb-2">
                          <IngredientIcon
                            type={key}
                            className={`w-full h-full ${!hasIngredient ? 'grayscale' : ''}`}
                          />
                        </div>
                        <span className={`text-sm font-bold ${
                          hasIngredient ? colors.text : 'text-gray-500'
                        }`}>
                          {INGREDIENTE_NAMES[value]}
                        </span>
                        <span className={`text-lg font-bold ${
                          hasIngredient ? 'text-white' : 'text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Enlaces rápidos */}
                <div className="flex gap-4 mt-6">
                  <Link
                    to="/play"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-center py-3 rounded-lg font-semibold transition-all hover-lift"
                  >
                    <MaterialIcon name="sports_esports" className="inline-block align-middle mr-2" />
                    Jugar
                  </Link>
                  <Link
                    to="/trade"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-center py-3 rounded-lg font-semibold transition-all hover-lift"
                  >
                    <MaterialIcon name="swap_horiz" className="inline-block align-middle mr-2" />
                    Intercambiar
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Mejoras */}
        {activeTab === 'mejoras' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="emoji_events" className="inline-block w-6 h-6 align-middle mr-1" /> Mejoras y Trabas
            </h2>

            {/* Mejoras */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white text-lg">Mejoras</h3>
                <button
                  onClick={handleRechargeMejoras}
                  disabled={!rechargeInfo.canRecharge || rechargeLoading}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                    rechargeInfo.canRecharge
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  title={rechargeInfo.canRecharge ? 'Recargar mejoras' : `Disponible en ${rechargeInfo.hoursLeft}h`}
                >
                  {rechargeLoading ? (
                    'Recargando...'
                  ) : rechargeInfo.canRecharge ? (
                    <><MaterialIcon name="refresh" className="inline-block w-4 h-4 align-middle" /> Recargar</>
                  ) : (
                    <><MaterialIcon name="schedule" className="inline-block w-4 h-4 align-middle" /> {rechargeInfo.hoursLeft}h</>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2 text-yellow-400">
                    <MaterialIcon name="skip_next" className="text-3xl" />
                  </div>
                  <div className="text-sm text-yellow-300 font-medium mb-1">Pase</div>
                  <div className="font-bold text-yellow-400 text-2xl">{wallet.mejoras?.pase || 0}</div>
                  <p className="text-xs text-gray-400 mt-2">Salta una pregunta difícil</p>
                </div>
                <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2 text-blue-400">
                    <MaterialIcon name="timer" className="text-3xl" />
                  </div>
                  <div className="text-sm text-blue-300 font-medium mb-1">Reloj de Arena</div>
                  <div className="font-bold text-blue-400 text-2xl">{wallet.mejoras?.reloj_arena || 0}</div>
                  <p className="text-xs text-gray-400 mt-2">Duplica tu tiempo</p>
                </div>
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2 text-red-400">
                    <MaterialIcon name="filter_list" className="text-3xl" />
                  </div>
                  <div className="text-sm text-red-300 font-medium mb-1">Comodín</div>
                  <div className="font-bold text-red-400 text-2xl">{wallet.mejoras?.comodin || 0}</div>
                  <p className="text-xs text-gray-400 mt-2">Elimina opciones incorrectas</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                <MaterialIcon name="info" className="inline-block w-3 h-3 align-middle mr-1" />
                Recarga gratuita disponible cada 24 horas
              </p>
            </div>

            {/* Trabas */}
            <div>
              <h3 className="font-bold text-white text-lg mb-3">Trabas</h3>
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl text-purple-400">
                    <MaterialIcon name="hourglass_empty" className="text-3xl" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-purple-300">Reloj Rápido</div>
                    <p className="text-xs text-gray-400">Reduce el tiempo del oponente a la mitad</p>
                  </div>
                  <div className="font-bold text-purple-400 text-2xl">{wallet.trabas?.reloj_rapido || 0}</div>
                </div>
                <p className="text-xs text-gray-400">
                  <MaterialIcon name="info" className="inline-block w-3 h-3 align-middle mr-1" />
                  Las trabas se compran en la tienda y se usan en retos contra otros jugadores
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Privacidad */}
        {activeTab === 'privacy' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="lock" className="inline-block w-6 h-6 align-middle mr-1" /> Configuración de Privacidad
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Perfil Público</h3>
                  <p className="text-sm text-gray-400">Permite que otros vean tu perfil y estadísticas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.isPublicProfile || false}
                    onChange={(e) => handlePrivacyChange(e.target.checked, userData?.allowOpenChallenges || false)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Permitir Retos Abiertos</h3>
                  <p className="text-sm text-gray-400">Permite que cualquier jugador te desafíe</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.allowOpenChallenges || false}
                    onChange={(e) => handlePrivacyChange(userData?.isPublicProfile || false, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
