/**
 * FriendsConnected.jsx - Directorio de Amigos y Retos de NicaQuizz
 * Versión conectada a Firestore
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getFriends,
  getFriendRequests,
  getUserChallenges,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsersByEmail,
  rejectChallenge,
  createChallenge
} from '../../services/firestore';
import TopNavBar from '../components/TopNavBar';

export default function FriendsConnected() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Estados
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [retos, setRetos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [challengingId, setChallengingId] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // Cargar amigos
      const friendsList = await getFriends(currentUser.uid);
      setAmigos(friendsList);

      // Cargar solicitudes pendientes
      const requests = await getFriendRequests(currentUser.uid);
      setSolicitudes(requests);

      // Cargar retos pendientes
      const challenges = await getUserChallenges(currentUser.uid, 'pending');
      setRetos(challenges);
    } catch (error) {
      toast.handleError(error, 'Error al cargar amigos');
    } finally {
      setLoading(false);
    }
  }

  // Buscar usuarios
  async function handleBuscar(e) {
    e.preventDefault();
    if (!busqueda.trim()) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      const resultados = await searchUsersByEmail(busqueda);
      const amigosIds = amigos.map(a => a.id);
      const filtrados = resultados.filter(
        u => !amigosIds.includes(u.id) && u.id !== currentUser.uid
      );
      setResultadosBusqueda(filtrados);
    } catch (error) {
      toast.handleError(error, 'Error al buscar usuarios');
    }
  }

  // Enviar solicitud de amistad
  async function handleEnviarSolicitud(userId) {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      await sendFriendRequest(currentUser.uid, userId);
      toast.success('Solicitud de amistad enviada');
      setResultadosBusqueda([]);
      setBusqueda('');
    } catch (error) {
      toast.error(error.message || 'Error al enviar solicitud');
    }
  }

  // Aceptar solicitud
  async function handleAceptarSolicitud(requestId, senderId) {
    if (!currentUser) return;

    try {
      await acceptFriendRequest(requestId, currentUser.uid, senderId);
      toast.success('¡Amigo agregado!');
      loadData();
    } catch (error) {
      toast.error('Error al aceptar solicitud');
    }
  }

  // Rechazar solicitud
  async function handleRechazarSolicitud(requestId) {
    if (!currentUser) return;

    try {
      await rejectFriendRequest(requestId);
      toast.success('Solicitud rechazada');
      loadData();
    } catch (error) {
      toast.error('Error al rechazar solicitud');
    }
  }

  // Retar amigo - Crea el reto en Firestore y navega
  async function handleRetar(amigoId) {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setChallengingId(amigoId);
    try {
      const challengeId = await createChallenge(currentUser.uid, amigoId, null, false);
      toast.success('¡Reto enviado!');
      navigate(`/challenge/${challengeId}`);
    } catch (error) {
      toast.error('Error al enviar el reto');
    } finally {
      setChallengingId(null);
    }
  }

  // Rechazar reto
  async function handleRechazarReto(retoId) {
    if (!currentUser) return;
    try {
      await rejectChallenge(retoId);
      toast.success('Reto rechazado');
      loadData();
    } catch (error) {
      toast.error('Error al rechazar reto');
    }
  }

  return (
    <div className="min-h-screen bg-[#fefccf] font-body text-[#1d1d03]">
      {/* TopNavBar Componente Reutilizable */}
      <TopNavBar currentPage="friends" />

      <div className="flex min-h-screen pt-24">
        {/* Main Content Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-12">

            {/* Hero Section */}
            <section className="relative">
              <h1 className="text-5xl font-extrabold font-headline text-[#154212] tracking-tighter mb-4">
                Directorio de Amigos y Retos
              </h1>
              <p className="text-lg text-[#154212]/70 max-w-2xl">
                Encuentra a tus compatriotas culinarios y demuestra quién conoce mejor el sabor de nuestra tierra.
              </p>
            </section>

            {/* Search Bento Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Search Friends Section */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border-b-4 border-[#154212]/10">
                <h2 className="text-xl font-bold text-[#154212] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">search</span>
                  Buscar Amigos
                </h2>
                <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full bg-[#f8f6c9] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-4 rounded-xl transition-all outline-none text-[#154212]"
                      placeholder="Escribe el nombre del usuario..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#154212] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2D5A27] transition-all active:scale-95"
                  >
                    <span>Buscar</span>
                  </button>
                </form>

                {/* Resultados de búsqueda */}
                {resultadosBusqueda.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold text-[#154212]/60 uppercase">Resultados</h3>
                    {resultadosBusqueda.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="flex items-center justify-between bg-[#f8f6c9] p-4 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2D5A27] flex items-center justify-center text-white font-bold">
                            {usuario.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#154212]">
                              {usuario.displayName || 'Usuario'}
                            </p>
                            <p className="text-xs text-[#154212]/60">{usuario.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEnviarSolicitud(usuario.id)}
                          className="bg-[#2D5A27] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#154212] transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Invites Section */}
              <div className="bg-[#a40029]/10 p-8 rounded-3xl border-l-4 border-[#79001c]">
                <h2 className="text-xl font-bold text-[#79001c] mb-6 flex items-center justify-between">
                  Solicitudes
                  <span className="bg-[#79001c] text-white text-xs px-2 py-1 rounded-full">
                    {solicitudes.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {solicitudes.length === 0 ? (
                    <p className="text-sm text-[#79001c]/60 text-center py-4">
                      No hay solicitudes pendientes
                    </p>
                  ) : (
                    solicitudes.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f2f0c4] flex items-center justify-center font-bold text-[#154212]">
                          {solicitud.sender?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#154212] truncate">
                            {solicitud.sender?.displayName || 'Usuario'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAceptarSolicitud(solicitud.id, solicitud.senderId)}
                          className="p-2 text-[#154212] hover:bg-[#154212]/5 rounded-lg"
                          title="Aceptar"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button
                          onClick={() => handleRechazarSolicitud(solicitud.id)}
                          className="p-2 text-[#79001c] hover:bg-[#79001c]/5 rounded-lg"
                          title="Rechazar"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Challenges & Friends Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-12">

              {/* Friends List (Left) */}
              <div className="lg:col-span-3 space-y-8">
                <div className="flex items-end justify-between border-b-2 border-[#154212]/5 pb-4">
                  <h2 className="text-3xl font-bold font-headline text-[#154212]">
                    Amigos en Línea
                  </h2>
                  <span className="text-[#154212]/60 font-semibold text-sm">
                    Ver todos ({amigos.length})
                  </span>
                </div>

                {/* Friends Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    <p className="text-[#154212]/60 col-span-full text-center py-8">
                      Cargando amigos...
                    </p>
                  ) : amigos.length === 0 ? (
                    <p className="text-[#154212]/60 col-span-full text-center py-8">
                      No tienes amigos aún. ¡Busca y agrega a otros jugadores!
                    </p>
                  ) : (
                    amigos.map((amigo) => (
                      <div
                        key={amigo.id}
                        className={`bg-[#f8f6c9] p-6 rounded-3xl hover:bg-[#f2f0c4] transition-all duration-300 group ${
                          !amigo.isOnline ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-[#2D5A27] flex items-center justify-center text-white text-2xl font-bold">
                              {amigo.displayName?.charAt(0) || 'A'}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 ${
                                amigo.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              } border-4 border-[#f8f6c9] rounded-full`}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                amigo.isOnline
                                  ? 'bg-[#ffdf90] text-[#1d1d03]'
                                  : 'bg-[#c2c9bb] text-[#42493e]'
                              }`}
                            >
                              Nivel {amigo.stats?.level || 1}
                            </span>
                          </div>
                        </div>
                        <h3
                          className={`font-bold text-lg mb-1 ${
                            amigo.isOnline ? 'text-[#154212]' : 'text-[#154212]/60'
                          }`}
                        >
                          {amigo.displayName || 'Amigo'}
                        </h3>
                        <p
                          className={`text-xs mb-6 font-medium ${
                            amigo.isOnline ? 'text-[#154212]/60' : 'text-[#154212]/40'
                          }`}
                        >
                          {amigo.bio || 'Jugador de NicaQuizz'}
                        </p>
                        <button
                          onClick={() => handleRetar(amigo.id)}
                          disabled={!amigo.isOnline || challengingId === amigo.id}
                          className={`w-full py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                            amigo.isOnline
                              ? 'bg-white text-[#154212] group-hover:bg-[#154212] group-hover:text-white'
                              : 'bg-[#eceabe] text-[#154212]/40 cursor-not-allowed'
                          } ${challengingId === amigo.id ? 'opacity-60 cursor-wait' : ''}`}
                        >
                          {challengingId === amigo.id ? (
                            <>
                              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-sm">swords</span>
                              {amigo.isOnline ? 'Retar' : 'Offline'}
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Side Column: Challenges (Right) */}
              <div className="space-y-8">

                {/* Retos Recibidos */}
                <div className="bg-[#154212] text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-8xl">restaurant</span>
                  </div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                    <span className="material-symbols-outlined text-[#fccc38]">flash_on</span>
                    Retos Recibidos
                  </h2>
                  <div className="space-y-4 relative z-10">
                    {retos.length === 0 ? (
                      <p className="text-sm text-white/60 text-center py-4">
                        No hay retos pendientes
                      </p>
                    ) : (
                      retos.map((reto) => (
                        <div
                          key={reto.id}
                          className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm">person</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-none">
                                {reto.challenger?.displayName || 'Jugador'}
                              </p>
                              <p className="text-[10px] opacity-70">Hace poco</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium mb-4">
                            Te ha retado a un duelo{reto.categoryId ? ` de ${reto.categoryId}` : ''}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/challenge/${reto.id}`);
                              }}
                              className="flex-1 bg-[#fccc38] text-[#1d1d03] text-xs font-bold py-2 rounded-xl hover:bg-[#ffdf90] transition-colors"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRechazarReto(reto.id);
                              }}
                              className="px-3 bg-white/10 text-xs font-bold py-2 rounded-xl hover:bg-white/20 transition-colors"
                            >
                              Ignorar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mini Achievement Card */}
                <div className="bg-[#fccc38] p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <span
                        className="material-symbols-outlined text-[#755b00] text-3xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        military_tech
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#1d1d03] opacity-70">
                        Tu Rango
                      </p>
                      <p className="text-lg font-bold text-[#1d1d03]">
                        {amigos.length >= 10 ? 'Maestro Social' : amigos.length >= 5 ? 'Chef Popular' : 'Aprendiz'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fefccf] shadow-[0_-8px_32px_rgba(29,29,3,0.08)] flex justify-around items-center h-16 z-50 px-4">
        <Link
          to="/trade"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] font-medium">Mercado</span>
        </Link>
        <Link
          to="/friends"
          className="flex flex-col items-center gap-1 text-[#154212] border-b-2 border-[#154212]"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
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
