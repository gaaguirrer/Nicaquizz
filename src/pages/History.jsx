import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserChallenges,
  getUserTrades,
  getGiftHistory,
  fetchApprovedQuestions
} from '../services/firestore';

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function History() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('games'); // games, trades, gifts, questions
  const [gameHistory, setGameHistory] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [giftHistory, setGiftHistory] = useState([]);
  const [proposedQuestions, setProposedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      // Cargar historial de retos
      const challenges = await getUserChallenges(currentUser.uid, 'completed');
      setGameHistory(challenges || []);

      // Cargar historial de intercambios
      const trades = await getUserTrades(currentUser.uid);
      setTradeHistory(trades || []);

      // Cargar historial de regalos
      const gifts = await getGiftHistory(currentUser.uid);
      setGiftHistory(gifts || []);

      // Cargar preguntas propuestas
      const questions = await fetchApprovedQuestions(null, 'hard');
      const userQuestions = questions?.filter(q => q.createdBy === currentUser.uid) || [];
      setProposedQuestions(userQuestions);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setMessage({ type: 'error', text: 'Error al cargar historial' });
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-NI', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
              <Link to="/friends" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">Amigos</Link>
              <Link to="/history" className="text-indigo-400 font-medium transition-colors">Historial</Link>
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
          <MaterialIcon name="history" className="inline-block w-8 h-8 align-middle mr-2" /> Mi Historial
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="sports_martial_arts" className="inline-block w-5 h-5 align-middle mr-1" /> Partidas
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'trades'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="swap_horiz" className="inline-block w-5 h-5 align-middle mr-1" /> Intercambios
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
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover-lift ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MaterialIcon name="lightbulb" className="inline-block w-5 h-5 align-middle mr-1" /> Preguntas Propuestas
          </button>
        </div>

        {/* Tab: Partidas */}
        {activeTab === 'games' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="sports_martial_arts" className="inline-block w-6 h-6 align-middle mr-1" /> Historial de Partidas
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : gameHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No has jugado partidas aún
              </div>
            ) : (
              <div className="space-y-3">
                {gameHistory.map(game => (
                  <div key={game.id} className={`p-4 rounded-lg border ${
                    game.winnerId === currentUser.uid ? 'bg-green-900/20 border-green-700' :
                    game.winnerId ? 'bg-red-900/20 border-red-700' :
                    'bg-gray-800 border-gray-700'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <MaterialIcon name={
                          game.winnerId === currentUser.uid ? 'emoji_events' :
                          game.winnerId ? 'sentiment_dissatisfied' : 'pending'
                        } className={`text-lg ${
                          game.winnerId === currentUser.uid ? 'text-yellow-400' :
                          game.winnerId ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className="font-semibold text-white capitalize">
                          {game.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(game.completedAt || game.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {game.categoryId ? (
                        <p>Categoría: <span className="capitalize">{game.categoryId}</span></p>
                      ) : (
                        <p>Reto abierto</p>
                      )}
                      <div className="flex gap-4 mt-2">
                        <span className={game.winnerId === currentUser.uid ? 'text-green-400 font-bold' : 'text-gray-400'}>
                          Tú: {game.challengerId === currentUser.uid ? game.challengerScore : game.challengedScore}
                        </span>
                        <span className="text-gray-500">vs</span>
                        <span className={game.winnerId && game.winnerId !== currentUser.uid ? 'text-green-400 font-bold' : 'text-gray-400'}>
                          Oponente: {game.challengerId === currentUser.uid ? game.challengedScore : game.challengerScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Intercambios */}
        {activeTab === 'trades' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="swap_horiz" className="inline-block w-6 h-6 align-middle mr-1" /> Historial de Intercambios
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
                        {formatDate(trade.completedAt || trade.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div className="flex items-center gap-4">
                        <span className="text-red-400">-{trade.offeredAmount}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-green-400">+{trade.requestedAmount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Regalos */}
        {activeTab === 'gifts' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="card_giftcard" className="inline-block w-6 h-6 align-middle mr-1" /> Historial de Regalos
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
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <MaterialIcon name="card_giftcard" className="text-lg text-pink-400" />
                        <span className="font-semibold text-white">Regalo enviado</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(gift.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>Cantidad: <span className="font-bold text-green-400">{gift.amount}</span></p>
                      <p>Fecha: {gift.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Preguntas Propuestas */}
        {activeTab === 'questions' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-white">
              <MaterialIcon name="lightbulb" className="inline-block w-6 h-6 align-middle mr-1" /> Preguntas Propuestas
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : proposedQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No has propuesto preguntas aún
                <Link to="/propose" className="block mt-2 text-indigo-400 hover:text-indigo-300">
                  Proponer una pregunta →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {proposedQuestions.map(question => (
                  <div key={question.id} className={`p-4 rounded-lg border ${
                    question.status === 'approved' ? 'bg-green-900/20 border-green-700' :
                    question.status === 'pending' ? 'bg-yellow-900/20 border-yellow-700' :
                    'bg-gray-800 border-gray-700'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <MaterialIcon name={
                          question.status === 'approved' ? 'check_circle' :
                          question.status === 'pending' ? 'schedule' : 'cancel'
                        } className={`text-lg ${
                          question.status === 'approved' ? 'text-green-400' :
                          question.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
                        }`} />
                        <span className="font-semibold text-white capitalize">{question.status}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(question.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">{question.text}</p>
                    <div className="text-sm text-gray-400">
                      <p>Categoría: <span className="capitalize">{question.categoryId}</span></p>
                      <p>Dificultad: <span className="capitalize">{question.difficulty}</span></p>
                    </div>
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
