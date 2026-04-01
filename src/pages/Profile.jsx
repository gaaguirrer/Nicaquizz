/**
 * Profile.jsx - Perfil e Inventario de NicaQuizz
 * Muestra el Nacatamal en proceso, estadísticas y lista de amigos
 */

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
  getFriends,
  sendFriendRequest,
  getUserChallenges
} from '../services/firestore';
import UserMenu from '../components/UserMenu';

// Iconos SVG para ingredientes
const IngredientIcon = ({ type, className = '', collected = false }) => {
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
  
  const icon = icons[type] || null;
  
  if (!collected) {
    return <div className="grayscale opacity-30">{icon}</div>;
  }
  
  return <div className="ingredient-collected animate-glow">{icon}</div>;
};

// Configuración de ingredientes
const INGREDIENTS_CONFIG = [
  { key: 'masa', name: 'Masa', icon: 'bakery_dining', color: 'bg-amber-400' },
  { key: 'cerdo', name: 'Cerdo', icon: 'set_meal', color: 'bg-pink-400' },
  { key: 'arroz', name: 'Arroz', icon: 'bento', color: 'bg-gray-200' },
  { key: 'papa', name: 'Papa', icon: 'egg', color: 'bg-yellow-600' },
  { key: 'chile', name: 'Chile', icon: 'local_fire_department', color: 'bg-red-600' }
];

export default function Profile() {
  const { currentUser, userData, updatePrivacy } = useAuth();
  const toast = useToast();
  const [wallet, setWallet] = useState({ coins: {}, mejoras: {}, trabas: {} });
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nacatamal');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeInfo, setRechargeInfo] = useState({ canRecharge: false, hoursLeft: 0 });

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      // Cargar monedero
      const walletData = await getUserWallet(currentUser.uid);
      setWallet(walletData);

      // Cargar amigos
      const friendsList = await getFriends(currentUser.uid);
      setAmigos(friendsList);

      // Verificar recarga de mejoras
      const info = await canRechargeMejoras(currentUser.uid);
      setRechargeInfo(info);
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      toast.error('Error al cargar datos del perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleRechargeMejoras() {
    setRechargeLoading(true);
    try {
      await rechargeMejoras(currentUser.uid);
      toast.success('¡Mejoras recargadas exitosamente!');
      const info = await canRechargeMejoras(currentUser.uid);
      setRechargeInfo(info);
      loadProfileData();
    } catch (error) {
      toast.error(error.message || 'Error al recargar mejoras');
    } finally {
      setRechargeLoading(false);
    }
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

  // Calcular progreso del nacatamal
  const totalIngredientes = Object.values(INGREDIENTES).reduce(
    (sum, ing) => sum + (monedas[ing] || 0),
    0
  );
  const maxIngredientes = 5;
  const progresoNacatamal = Math.min((totalIngredientes / maxIngredientes) * 100, 100);

  // Obtener estadísticas
  const stats = userData?.stats || {};
  const totalQuestions = stats.totalQuestionsAnswered || 0;
  const totalCorrect = stats.totalCorrect || 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-rounded text-6xl text-nica-amarillo animate-spin inline-block">progress_activity</span>
          <p className="text-gray-400 mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
                <p className="text-xs text-gray-400">El Nacatamal del Conocimiento</p>
              </div>
            </Link>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Perfil y Estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tarjeta de Perfil */}
            <section className="card relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-nica-amarillo overflow-hidden shadow-comic">
                  <div className="w-full h-full bg-gradient-to-br from-nica-verde to-nica-amarillo flex items-center justify-center">
                    <span className="material-symbols-rounded text-6xl text-white">person</span>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl font-display text-white mb-2">
                    {userData?.displayName || 'Jugador'}
                  </h1>
                  <p className="text-nica-amarillo font-display text-lg flex items-center justify-center md:justify-start gap-2">
                    <span className="material-symbols-rounded">workspace_premium</span>
                    {userData?.isAdmin ? 'Administrador' : 'Maestro Cocinero'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    <span className="bg-nica-verde/30 text-nica-amarillo px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-nica-verde/50">
                      Nivel {Math.floor(totalQuestions / 10) + 1}
                    </span>
                    <span className="bg-nica-amarillo/30 text-nica-amarillo px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-nica-amarillo/50">
                      {wins} Victorias
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Nacatamal en Proceso */}
            <section className="card border-l-4 border-nica-verde">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-display text-white mb-1">Nacatamal en Proceso</h2>
                  <p className="text-gray-400 text-sm">Completa el plato nacional para subir de rango</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-display text-nica-amarillo">{Math.round(progresoNacatamal)}%</span>
                  <p className="text-xs text-gray-400 uppercase font-bold">Sabor Logrado</p>
                </div>
              </div>

              {/* Visualización del Nacatamal */}
              <div className="relative aspect-video bg-gray-800/50 rounded-2xl border border-dashed border-gray-600 p-8">
                {/* Ingredientes en layout asimétrico */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Masa (arriba izquierda) */}
                  <div className="absolute top-4 left-1/4 text-center">
                    <div className={`w-16 h-16 mx-auto mb-1 ${monedas.masa > 0 ? 'animate-glow' : ''}`}>
                      <IngredientIcon type="masa" className="w-full h-full" collected={monedas.masa > 0} />
                    </div>
                    <p className="text-xs font-bold text-gray-300">Masa</p>
                    <p className="text-xs text-nica-amarillo font-display">{monedas.masa || 0}</p>
                  </div>

                  {/* Cerdo (izquierda centro) */}
                  <div className="absolute top-1/2 -left-4 text-center transform -translate-y-1/2">
                    <div className={`w-14 h-14 mx-auto mb-1 ${monedas.cerdo > 0 ? 'animate-glow' : ''}`}>
                      <IngredientIcon type="cerdo" className="w-full h-full" collected={monedas.cerdo > 0} />
                    </div>
                    <p className="text-xs font-bold text-gray-300">Cerdo</p>
                    <p className="text-xs text-nica-amarillo font-display">{monedas.cerdo || 0}</p>
                  </div>

                  {/* Papa (abajo derecha) */}
                  <div className="absolute bottom-4 right-1/4 text-center">
                    <div className={`w-14 h-14 mx-auto mb-1 ${monedas.papa > 0 ? 'animate-glow' : ''}`}>
                      <IngredientIcon type="papa" className="w-full h-full" collected={monedas.papa > 0} />
                    </div>
                    <p className="text-xs font-bold text-gray-300">Papa</p>
                    <p className="text-xs text-nica-amarillo font-display">{monedas.papa || 0}</p>
                  </div>

                  {/* Arroz (derecha) */}
                  <div className="absolute top-1/3 right-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-1 ${monedas.arroz > 0 ? 'animate-glow' : ''}`}>
                      <IngredientIcon type="arroz" className="w-full h-full" collected={monedas.arroz > 0} />
                    </div>
                    <p className="text-xs font-bold text-gray-300">Arroz</p>
                    <p className="text-xs text-nica-amarillo font-display">{monedas.arroz || 0}</p>
                  </div>

                  {/* Chile (centro abajo) */}
                  <div className="absolute bottom-8 left-1/3 text-center">
                    <div className={`w-12 h-12 mx-auto mb-1 ${monedas.chile > 0 ? 'animate-glow' : ''}`}>
                      <IngredientIcon type="chile" className="w-full h-full" collected={monedas.chile > 0} />
                    </div>
                    <p className="text-xs font-bold text-gray-300">Chile</p>
                    <p className="text-xs text-nica-amarillo font-display">{monedas.chile || 0}</p>
                  </div>

                  {/* Nacatamal Central */}
                  <div className="z-10 bg-gradient-to-br from-nica-verde to-nica-amarillo p-6 rounded-3xl rotate-3 shadow-comic border-2 border-nica-verde">
                    <span className="material-symbols-rounded text-6xl text-white">lunch_dining</span>
                  </div>
                </div>

                {/* Nacatamales completados */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-nica-amarillo/20 px-4 py-2 rounded-xl border border-nica-amarillo/50">
                  <span className="material-symbols-rounded text-nica-amarillo">payments</span>
                  <span className="font-display text-xl text-nica-amarillo font-bold">{nacatamalesCount}</span>
                  <span className="text-xs text-gray-300">completados</span>
                </div>
              </div>

              {/* Botón Ir a la Tienda */}
              <Link
                to="/shop"
                className="mt-6 btn-primary w-full flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded">storefront</span>
                Ir a la Tienda
              </Link>
            </section>

            {/* Estadísticas Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center border-b-4 border-nica-verde/30">
                <p className="text-xs font-bold text-nica-verde uppercase tracking-widest mb-1">Aciertos</p>
                <p className="text-3xl font-display text-white">{totalCorrect}</p>
              </div>
              <div className="card text-center border-b-4 border-nica-amarillo/30">
                <p className="text-xs font-bold text-nica-amarillo uppercase tracking-widest mb-1">Precisión</p>
                <p className={`text-3xl font-display ${
                  accuracy >= 70 ? 'text-green-400' : accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>{accuracy}%</p>
              </div>
              <div className="card text-center border-b-4 border-green-500/30">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Victorias</p>
                <p className="text-3xl font-display text-white">{wins}</p>
              </div>
              <div className="card text-center border-b-4 border-red-500/30">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Derrotas</p>
                <p className="text-3xl font-display text-white">{losses}</p>
              </div>
            </section>

            {/* Mejoras y Trabas */}
            <section className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display text-white flex items-center gap-2">
                  <span className="material-symbols-rounded text-nica-amarillo">emoji_events</span>
                  Mejoras y Trabas
                </h3>
                <button
                  onClick={handleRechargeMejoras}
                  disabled={!rechargeInfo.canRecharge || rechargeLoading}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                    rechargeInfo.canRecharge
                      ? 'bg-green-600 hover:bg-green-500 text-white shadow-comic'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {rechargeLoading ? (
                    'Recargando...'
                  ) : rechargeInfo.canRecharge ? (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">refresh</span> Recargar
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">schedule</span> {rechargeInfo.hoursLeft}h
                    </span>
                  )}
                </button>
              </div>

              {/* Mejoras */}
              <div className="mb-6">
                <h4 className="font-bold text-white mb-3">Mejoras</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 text-center">
                    <span className="material-symbols-rounded text-4xl text-yellow-400 mb-2">skip_next</span>
                    <p className="text-sm text-yellow-300 font-bold mb-1">Pase</p>
                    <p className="text-2xl font-display text-yellow-400">{wallet.mejoras?.pase || 0}</p>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 text-center">
                    <span className="material-symbols-rounded text-4xl text-blue-400 mb-2">hourglass_top</span>
                    <p className="text-sm text-blue-300 font-bold mb-1">Reloj Arena</p>
                    <p className="text-2xl font-display text-blue-400">{wallet.mejoras?.reloj_arena || 0}</p>
                  </div>
                  <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center">
                    <span className="material-symbols-rounded text-4xl text-red-400 mb-2">filter_list</span>
                    <p className="text-sm text-red-300 font-bold mb-1">Comodín</p>
                    <p className="text-2xl font-display text-red-400">{wallet.mejoras?.comodin || 0}</p>
                  </div>
                </div>
              </div>

              {/* Trabas */}
              <div>
                <h4 className="font-bold text-white mb-3">Trabas</h4>
                <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-rounded text-4xl text-purple-400">hourglass_empty</span>
                    <div className="flex-1">
                      <p className="font-medium text-purple-300">Reloj Rápido</p>
                      <p className="text-xs text-gray-400">Reduce el tiempo del oponente a la mitad</p>
                    </div>
                    <p className="text-2xl font-display text-purple-400">{wallet.trabas?.reloj_rapido || 0}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Mi Alacena y Amigos */}
          <aside className="space-y-6">
            
            {/* Mi Alacena */}
            <div className="card bg-nica-amarillo/10 border-nica-amarillo/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-nica-amarillo/30 flex items-center justify-center">
                  <span className="material-symbols-rounded text-nica-amarillo text-3xl">kitchen</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-white">Mi Alacena</h4>
                  <p className="text-xs text-gray-400">Ingredientes recolectados</p>
                </div>
              </div>

              <nav className="space-y-2">
                {INGREDIENTS_CONFIG.map((ing) => {
                  const cantidad = monedas[ing.key] || 0;
                  const tiene = cantidad > 0;
                  
                  return (
                    <div
                      key={ing.key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        tiene
                          ? `${ing.color} text-gray-900`
                          : 'bg-gray-800/50 text-gray-500'
                      }`}
                    >
                      <span className="material-symbols-rounded">{ing.icon}</span>
                      <span className="font-medium flex-1">{ing.name}</span>
                      <span className={`font-bold text-xs ${tiene ? 'text-gray-900' : 'text-gray-600'}`}>
                        {tiene ? `x${cantidad}` : '0'}
                      </span>
                    </div>
                  );
                })}
              </nav>

              <Link
                to="/shop"
                className="mt-6 btn-primary w-full flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded">menu_book</span>
                Ver Recetario
              </Link>
            </div>

            {/* Amigos */}
            <div className="card border-b-4 border-gray-600/30">
              <h4 className="font-display font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-rounded">people</span>
                  Amigos
                </span>
                <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded">
                  {amigos.filter(a => a.isOnline).length} en línea
                </span>
              </h4>

              <div className="space-y-4">
                {amigos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <span className="material-symbols-rounded text-4xl mb-2">person_add</span>
                    <p className="text-sm">Aún no tienes amigos</p>
                    <Link to="/friends" className="text-nica-amarillo text-sm hover:underline mt-2 inline-block">
                      Buscar amigos
                    </Link>
                  </div>
                ) : (
                  amigos.slice(0, 5).map((amigo) => (
                    <div key={amigo.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nica-verde to-nica-amarillo flex items-center justify-center">
                            <span className="material-symbols-rounded text-white">person</span>
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-gray-900 rounded-full ${
                            amigo.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`}></span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{amigo.displayName || 'Amigo'}</p>
                          <p className="text-xs text-gray-400">
                            {amigo.isOnline ? 'En línea' : `Visto hace ${amigo.lastSeen ? 'poco' : 'tiempo'}`}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/challenge?opponent=${amigo.id}`}
                        className="bg-nica-verde/20 text-nica-verde text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-nica-verde hover:text-white transition-all"
                      >
                        Retar
                      </Link>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/friends"
                className="mt-6 w-full border-2 border-dashed border-gray-600 py-2 rounded-xl text-xs font-bold text-gray-400 hover:border-nica-amarillo hover:text-nica-amarillo transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-sm">person_add</span>
                + Invitar Amigos
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
