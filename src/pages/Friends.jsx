/**
 * Friends.jsx - Sistema de Amigos y Retos de NicaQuizz
 * "El Rincón del Desafío"
 * 
 * Funcionalidades:
 * - Buscar amigos por email
 * - Ver estados en línea/desconectado
 * - Enviar/recibir solicitudes de amistad
 * - Retar amigos directamente
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
  getAvailableChallengers,
  getUserChallenges,
  acceptChallenge,
  rejectChallenge,
  createChallenge,
  searchUsersByEmail,
  sendFriendRequestByEmail,
  getUserProfile
} from '../services/firestore';
import Button from '../components/Button';

export default function Friends() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [availableChallengers, setAvailableChallengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [friendsData, requestsData, challengesData, challengersData] = await Promise.all([
        getFriends(currentUser.uid).catch(() => []),
        getFriendRequests(currentUser.uid).catch(() => []),
        getUserChallenges(currentUser.uid, 'pending').catch(() => []),
        getAvailableChallengers().catch(() => [])
      ]);

      setFriends(friendsData || []);
      setFriendRequests(requestsData || []);
      setChallenges(challengesData || []);
      setAvailableChallengers((challengersData || []).filter(c => c?.id !== currentUser.uid));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showMessage('error', 'No se pudo cargar la información');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }

  async function handleAcceptRequest(requestId, senderId) {
    try {
      await acceptFriendRequest(requestId, currentUser.uid, senderId);
      showMessage('success', '¡Amigo agregado!');
      loadData();
    } catch (error) {
      showMessage('error', 'Error al aceptar solicitud');
    }
  }

  async function handleRejectRequest(requestId) {
    try {
      await rejectFriendRequest(requestId);
      showMessage('success', 'Solicitud rechazada');
      loadData();
    } catch (error) {
      showMessage('error', 'Error al rechazar solicitud');
    }
  }

  async function handleSendRequest() {
    if (!searchEmail.trim()) {
      showMessage('error', 'Ingresa un correo electrónico');
      return;
    }

    setSearching(true);
    try {
      await sendFriendRequestByEmail(currentUser.uid, searchEmail.trim());
      showMessage('success', '¡Solicitud enviada!');
      setSearchEmail('');
      setSearchResults([]);
    } catch (error) {
      showMessage('error', error.message || 'Error al enviar solicitud');
    } finally {
      setSearching(false);
    }
  }

  async function handleSearch() {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsersByEmail(searchEmail.trim());
      setSearchResults(results.filter(u => u.id !== currentUser.uid));
    } catch (error) {
      console.error('Error al buscar:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleAcceptChallenge(challengeId, challengerId) {
    try {
      await acceptChallenge(challengeId);
      showMessage('success', '¡Reto aceptado! Redirigiendo...');
      setTimeout(() => {
        navigate(`/challenge/${challengeId}`);
      }, 1000);
    } catch (error) {
      showMessage('error', 'Error al aceptar reto');
    }
  }

  async function handleRejectChallenge(challengeId) {
    try {
      await rejectChallenge(challengeId);
      showMessage('success', 'Reto rechazado');
      loadData();
    } catch (error) {
      showMessage('error', 'Error al rechazar reto');
    }
  }

  async function handleChallengeUser(userId, userName) {
    if (!selectedCategory) {
      showMessage('error', 'Selecciona una categoría para el reto');
      return;
    }

    try {
      const challengeId = await createChallenge(currentUser.uid, userId, selectedCategory, false);
      showMessage('success', `¡Reto enviado a ${userName}!`);
      setSelectedCategory('');
      loadData();
    } catch (error) {
      showMessage('error', 'Error al enviar reto');
    }
  }

  async function handleChallengeAvailablePlayer(playerId, playerName) {
    if (!selectedCategory) {
      showMessage('error', 'Selecciona una categoría para el reto');
      return;
    }

    try {
      const challengeId = await createChallenge(currentUser.uid, playerId, selectedCategory, false);
      showMessage('success', `¡Reto enviado a ${playerName}!`);
      setSelectedCategory('');
      loadData();
    } catch (error) {
      showMessage('error', 'Error al enviar reto');
    }
  }

  // Categorías disponibles para retos
  const categorias = [
    { id: 'historia', nombre: 'Historia', color: 'bg-amber-500' },
    { id: 'matematicas', nombre: 'Matemáticas', color: 'bg-blue-500' },
    { id: 'geografia', nombre: 'Geografía', color: 'bg-green-500' },
    { id: 'ciencias', nombre: 'Ciencias', color: 'bg-purple-500' },
    { id: null, nombre: 'Libre', color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-nica-verde/10 via-gray-900 to-nica-verde/10">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/play" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
                <p className="text-xs text-gray-400">El Rincón del Desafío</p>
              </div>
            </Link>
          </div>
          <Link to="/play" className="text-gray-400 hover:text-nica-amarillo transition-colors flex items-center gap-2">
            <span className="material-symbols-rounded">home</span>
            <span className="hidden sm:inline">Volver</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display text-nica-amarillo mb-3 gradient-text">
            <span className="material-symbols-rounded inline-block align-middle mr-2">people</span>
            Amigos y Retos
          </h1>
          <p className="text-gray-400 text-lg">
            Desafía a tus amigos y demuestra quién sabe más
          </p>
        </div>

        {/* Mensajes */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-400 border border-green-700/50'
              : 'bg-red-900/30 text-red-400 border border-red-700/50'
          }`}>
            <span className="material-symbols-rounded text-2xl">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {message.text}
          </div>
        )}

        {/* Selector de Categoría para Retos */}
        <div className="card mb-8">
          <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-nica-amarillo">category</span>
            Categoría del Reto
          </h2>
          <div className="flex flex-wrap gap-3">
            {categorias.map((cat) => (
              <button
                key={cat.id || 'libre'}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-3 rounded-xl font-bold transition-all hover-lift flex items-center gap-2 ${
                  selectedCategory === cat.id || (cat.id === null && selectedCategory === '')
                    ? `${cat.color} text-white shadow-comic`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
          {!selectedCategory && selectedCategory !== null && (
            <p className="text-gray-500 text-sm mt-3">
              <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">info</span>
              Selecciona una categoría antes de enviar un reto
            </p>
          )}
        </div>

        {/* Tabs de Navegación */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">people</span>
            <span>Mis Amigos ({friends.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">mail</span>
            <span>Solicitudes ({friendRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">sports_martial_arts</span>
            <span>Retos ({challenges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'online'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">public</span>
            <span>En Línea ({availableChallengers.length})</span>
          </button>
        </div>

        {/* Tab: Buscar Amigos */}
        <div className="card mb-8">
          <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-nica-amarillo">person_add</span>
            Buscar Amigos
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="amigo@correo.com"
              className="input-field flex-1"
              disabled={searching}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching} variant="secondary" icon="search">
              Buscar
            </Button>
            <Button onClick={handleSendRequest} disabled={searching} variant="primary" icon="send">
              Enviar Solicitud
            </Button>
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nica-verde to-nica-amarillo flex items-center justify-center">
                      <span className="material-symbols-rounded text-white">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.displayName || 'Usuario'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleSendRequest} variant="primary" size="sm" icon="person_add">
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab: Mis Amigos */}
        {activeTab === 'friends' && (
          <div className="card">
            <h2 className="text-xl font-display text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-rounded text-nica-amarillo">people</span>
              Lista de Amigos ({friends.length})
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-rounded text-6xl text-nica-amarillo animate-spin inline-block">progress_activity</span>
                <p className="text-gray-400 mt-4">Cargando amigos...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl mb-4">people_outline</span>
                <p className="text-lg">Aún no tienes amigos</p>
                <p className="text-sm mt-2">Busca amigos por email para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-nica-amarillo/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nica-verde to-nica-amarillo flex items-center justify-center">
                          <span className="material-symbols-rounded text-white text-xl">person</span>
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-gray-900 rounded-full ${
                          friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`}></span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{friend.displayName || 'Amigo'}</p>
                        <p className="text-xs text-gray-500">
                          {friend.isOnline ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/challenge?opponent=${friend.id}&category=${selectedCategory || ''}`}
                        className="bg-nica-verde/20 hover:bg-nica-verde/30 text-nica-verde border border-nica-verde/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">sports_martial_arts</span>
                        Retar
                      </Link>
                      <Link
                        to={`/profile/${friend.id}`}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">person</span>
                        Perfil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Solicitudes */}
        {activeTab === 'requests' && (
          <div className="card">
            <h2 className="text-xl font-display text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-rounded text-nica-amarillo">mail</span>
              Solicitudes Recibidas ({friendRequests.length})
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl animate-spin inline-block">progress_activity</span>
                <p className="mt-4">Cargando...</p>
              </div>
            ) : friendRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl mb-4">mark_email_read</span>
                <p className="text-lg">No hay solicitudes pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nica-verde to-nica-amarillo flex items-center justify-center">
                        <span className="material-symbols-rounded text-white text-xl">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{request.sender?.displayName || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{request.sender?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(request.id, request.sender.id)}
                        variant="success"
                        size="sm"
                        icon="check"
                      >
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        variant="secondary"
                        size="sm"
                        icon="close"
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Retos Recibidos */}
        {activeTab === 'challenges' && (
          <div className="card">
            <h2 className="text-xl font-display text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-rounded text-nica-amarillo">sports_martial_arts</span>
              Retos Pendientes ({challenges.length})
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl animate-spin inline-block">progress_activity</span>
                <p className="mt-4">Cargando...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl mb-4">emoji_events</span>
                <p className="text-lg">No hay retos pendientes</p>
                <p className="text-sm mt-2">¡Sé el primero en desafiar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                        <span className="material-symbols-rounded text-white text-xl">sports_martial_arts</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{challenge.challenger?.displayName || 'Jugador'}</p>
                        <p className="text-xs text-gray-500">
                          {challenge.categoryId ? `Categoría: ${challenge.categoryId}` : 'Reto abierto'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptChallenge(challenge.id, challenge.challengerId)}
                        variant="success"
                        size="sm"
                        icon="check"
                      >
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleRejectChallenge(challenge.id)}
                        variant="secondary"
                        size="sm"
                        icon="close"
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Jugadores En Línea */}
        {activeTab === 'online' && (
          <div className="card">
            <h2 className="text-xl font-display text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-rounded text-nica-amarillo">public</span>
              Jugadores Disponibles ({availableChallengers.length})
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl animate-spin inline-block">progress_activity</span>
                <p className="mt-4">Cargando...</p>
              </div>
            ) : availableChallengers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-symbols-rounded text-6xl mb-4">signal_wifi_off</span>
                <p className="text-lg">No hay jugadores en línea</p>
                <p className="text-sm mt-2">Intenta más tarde</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableChallengers.map(player => (
                  <div key={player.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                          <span className="material-symbols-rounded text-white text-xl">person</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{player.displayName || 'Jugador'}</p>
                        <p className="text-xs text-gray-500">
                          {player.stats?.totalQuestionsAnswered || 0} preguntas respondidas
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleChallengeAvailablePlayer(player.id, player.displayName || 'Jugador')}
                      variant="primary"
                      size="sm"
                      icon="sports_martial_arts"
                    >
                      Retar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
