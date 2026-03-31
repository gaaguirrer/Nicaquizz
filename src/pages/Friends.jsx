import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  getUserProfile,
  searchUsersByEmail,
  sendFriendRequestByEmail
} from '../services/firestore';

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Friends() {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, challenges
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [availableChallengers, setAvailableChallengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMessage({ type: 'error', text: 'No se pudo cargar la información. Verifica tu conexión.' });
      setFriends([]);
      setFriendRequests([]);
      setChallenges([]);
      setAvailableChallengers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptRequest(requestId, senderId) {
    try {
      await acceptFriendRequest(requestId, currentUser.uid, senderId);
      setMessage({ type: 'success', text: '¡Amigo agregado!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al aceptar solicitud' });
    }
  }

  async function handleRejectRequest(requestId) {
    try {
      await rejectFriendRequest(requestId);
      setMessage({ type: 'success', text: 'Solicitud rechazada' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al rechazar solicitud' });
    }
  }

  async function handleSendRequest() {
    if (!searchEmail.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un correo electrónico' });
      return;
    }

    setSearching(true);
    try {
      await sendFriendRequestByEmail(currentUser.uid, searchEmail.trim());
      setMessage({ type: 'success', text: '¡Solicitud enviada!' });
      setSearchEmail('');
      setSearchResults([]);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al enviar solicitud' });
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
      setMessage({ type: 'success', text: '¡Reto aceptado! Redirigiendo...' });
      setTimeout(() => {
        // Redirigir al juego
        window.location.href = `/challenge/${challengeId}`;
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al aceptar reto' });
    }
  }

  async function handleRejectChallenge(challengeId) {
    try {
      await rejectChallenge(challengeId);
      setMessage({ type: 'success', text: 'Reto rechazado' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al rechazar reto' });
    }
  }

  async function handleChallengeUser(userId) {
    if (!confirm(`¿Retar a este usuario?`)) return;
    
    try {
      await createChallenge(currentUser.uid, userId, null, true);
      setMessage({ type: 'success', text: '¡Reto enviado!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al enviar reto' });
    }
  }

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
              <Link to="/friends" className="text-indigo-400 font-medium transition-colors">Amigos</Link>
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
          <MaterialIcon name="group" className="inline-block w-8 h-8 align-middle mr-2" /> Amigos y Retos
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="group" className="inline-block w-5 h-5 align-middle mr-1" /> Amigos ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="mail" className="inline-block w-5 h-5 align-middle mr-1" /> Solicitudes ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="sports_martial_arts" className="inline-block w-5 h-5 align-middle mr-1" /> Retos ({challenges.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'online'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="circle" className="inline-block w-3 h-3 align-middle text-green-500 mr-1" /> En Línea ({availableChallengers.length})
          </button>
        </div>

        {/* Tab: Amigos */}
        {activeTab === 'friends' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">Tus Amigos</h2>

            {/* Buscar amigo */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar por correo electrónico"
                  className="input-field flex-1"
                />
                <button onClick={handleSearch} className="btn-primary" disabled={searching}>
                  <MaterialIcon name="search" className="inline-block w-5 h-5 align-middle" /> Buscar
                </button>
                <button onClick={handleSendRequest} className="btn-primary" disabled={searching || !searchResults.length}>
                  {searching ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Resultados:</p>
                  {searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.displayName || 'Usuario'}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest()}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="person_add" className="inline-block w-5 h-5 align-middle" /> Agregar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searching && (
                <div className="text-center py-4 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                  <p className="text-sm mt-2">Buscando...</p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400 animate-pulse">Cargando amigos...</div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No tienes amigos aún. ¡Agrega a otros jugadores!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <div>
                        <p className="font-semibold text-gray-200">{friend.displayName}</p>
                        <p className="text-sm text-gray-400">{friend.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/challenge/friend/${friend.id}`}
                        className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1 rounded transition-all"
                      >
                        <MaterialIcon name="sports_martial_arts" className="inline-block w-4 h-4 align-middle" /> Retar
                      </Link>
                      <button
                        onClick={() => setMessage({ type: 'error', text: 'Funcionalidad en desarrollo' })}
                        className="text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 px-3 py-1 rounded transition-colors"
                      >
                        <MaterialIcon name="person" className="inline-block w-4 h-4 align-middle" /> Ver Perfil
                      </button>
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
            <h2 className="text-xl font-bold mb-4 text-white">Solicitudes de Amistad</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400 animate-pulse">Cargando...</div>
            ) : friendRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No tienes solicitudes pendientes
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                        {request.sender?.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">{request.sender?.displayName}</p>
                        <p className="text-sm text-gray-400">{request.sender?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id, request.senderId)}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="check" className="inline-block w-5 h-5 align-middle" /> Aceptar
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="close" className="inline-block w-5 h-5 align-middle" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Retos */}
        {activeTab === 'challenges' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">Retos Recibidos</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400 animate-pulse">Cargando...</div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No tienes retos pendientes
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3">
                      <MaterialIcon name="sports_martial_arts" className="text-3xl text-indigo-400" />
                      <div>
                        <p className="font-semibold text-gray-200">{challenge.challenger?.displayName}</p>
                        <p className="text-sm text-gray-400">
                          {challenge.categoryId ? 'Categoría: ' + challenge.categoryId : 'Reto abierto'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptChallenge(challenge.id, challenge.challengerId)}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="check" className="inline-block w-5 h-5 align-middle" /> Aceptar
                      </button>
                      <button
                        onClick={() => handleRejectChallenge(challenge.id)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <MaterialIcon name="close" className="inline-block w-5 h-5 align-middle" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Usuarios en Línea */}
        {activeTab === 'online' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              Usuarios Disponibles para Reto
              <span className="ml-2 text-sm font-normal text-gray-400">
                (Permiten retos abiertos)
              </span>
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400 animate-pulse">Cargando...</div>
            ) : availableChallengers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No hay usuarios disponibles en este momento
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {availableChallengers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="font-semibold text-gray-200">{user.displayName}</p>
                        <p className="text-sm text-gray-400">
                          {user.stats?.totalCorrect || 0} aciertos • {user.stats?.wins || 0} victorias
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleChallengeUser(user.id)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <MaterialIcon name="sports_martial_arts" className="inline-block w-5 h-5 align-middle mr-1" /> Retar
                    </button>
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


