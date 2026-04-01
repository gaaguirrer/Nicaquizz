/**
 * HistoryConnected.jsx - Historial de Batallas de NicaQuizz
 * Versión conectada a Firestore
 *
 * Características:
 * - Historial de batallas (desde getUserBattleHistory)
 * - Estadísticas de batallas (desde getBattleStats)
 * - Filtros por resultado (victorias/derrotas)
 * - Gráfica de progreso
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getUserBattleHistory,
  getBattleStats,
  INGREDIENTE_NAMES
} from '../services/firestore';
import TopNavBar from '../components/TopNavBar';

export default function HistoryConnected() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filtro, setFiltro] = useState('all'); // all, wins, losses
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  async function loadData() {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Cargar historial
      const historyData = await getUserBattleHistory(currentUser.uid, 50);
      setHistory(historyData);

      // Cargar estadísticas
      const statsData = await getBattleStats(currentUser.uid);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar historial
  const historialFiltrado = history.filter(h => {
    if (filtro === 'wins') return h.won;
    if (filtro === 'losses') return !h.won;
    return true;
  });

  // Formatear fecha
  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-NI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* TopNavBar */}
      <TopNavBar currentPage="history" />

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Header */}
          <section className="relative">
            <h1 className="text-5xl font-headline font-extrabold text-[#154212] tracking-tighter mb-4">
              Historial de <br/>
              <span className="text-[#755b00] italic">Batallas</span>
            </h1>
            <p className="text-[#42493e] text-lg max-w-2xl">
              Revisa tu progreso, analiza tus victorias y aprende de tus derrotas en el camino hacia la maestría.
            </p>
          </section>

          {/* Estadísticas Resumen */}
          {stats && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border-b-4 border-[#2D5A27]/30">
                <p className="text-xs font-bold text-[#2D5A27] uppercase tracking-widest mb-1">Total</p>
                <p className="text-4xl font-headline font-black text-[#154212]">{stats.totalBattles}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-b-4 border-green-500/30">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Victorias</p>
                <p className="text-4xl font-headline font-black text-green-600">{stats.wins}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-b-4 border-red-500/30">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Derrotas</p>
                <p className="text-4xl font-headline font-black text-red-600">{stats.losses}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-b-4 border-[#F4C430]/30">
                <p className="text-xs font-bold text-[#F4C430] uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-4xl font-headline font-black text-[#755b00]">{stats.winRate}%</p>
              </div>
            </section>
          )}

          {/* Filtros */}
          <section className="flex items-center gap-4 border-b-2 border-[#154212]/10 pb-4">
            <button
              onClick={() => setFiltro('all')}
              className={`px-6 py-2 rounded-xl font-bold font-headline transition-all ${
                filtro === 'all'
                  ? 'bg-[#2D5A27] text-white'
                  : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
              }`}
            >
              Todas ({history.length})
            </button>
            <button
              onClick={() => setFiltro('wins')}
              className={`px-6 py-2 rounded-xl font-bold font-headline transition-all ${
                filtro === 'wins'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
              }`}
            >
              Victorias ({stats?.wins || 0})
            </button>
            <button
              onClick={() => setFiltro('losses')}
              className={`px-6 py-2 rounded-xl font-bold font-headline transition-all ${
                filtro === 'losses'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
              }`}
            >
              Derrotas ({stats?.losses || 0})
            </button>
          </section>

          {/* Lista de Historial */}
          {loading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
              <p className="text-[#42493e]/60 mt-4">Cargando historial...</p>
            </div>
          ) : historialFiltrado.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-[#154212]/5">
              <span className="material-symbols-outlined text-6xl text-[#154212]/20 mb-4">history</span>
              <p className="text-[#42493e]/60 text-lg mb-4">
                {filtro === 'all' 
                  ? 'No has jugado ninguna batalla aún'
                  : filtro === 'wins'
                  ? 'No tienes victorias registradas'
                  : 'No tienes derrotas registradas'
                }
              </p>
              <Link
                to="/play"
                className="inline-flex items-center gap-2 bg-[#2D5A27] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#154212] transition-colors"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Jugar Ahora
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {historialFiltrado.map((batalla, index) => (
                <div
                  key={batalla.id}
                  className={`bg-white rounded-2xl p-6 border-l-4 ${
                    batalla.won 
                      ? 'border-green-500 bg-green-50/30' 
                      : 'border-red-500 bg-red-50/30'
                  } hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Resultado */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl ${
                        batalla.won 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}>
                        {batalla.won ? '✓' : '✗'}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-[#154212]">
                          {batalla.won ? '¡Victoria!' : 'Derrota'}
                        </p>
                        <p className="text-sm text-[#42493e]/60">
                          vs {batalla.opponentName || 'Oponente'}
                        </p>
                      </div>
                    </div>

                    {/* Puntuación */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-[#42493e]/60 mb-1">Tu</p>
                        <p className={`text-2xl font-black ${
                          batalla.won ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {batalla.userScore}
                        </p>
                        <p className="text-xs text-[#42493e]/60">
                          {batalla.userCorrect}/{batalla.totalQuestions} correctas
                        </p>
                      </div>

                      <div className="text-[#154212]/40 text-2xl font-black">-</div>

                      <div className="text-center">
                        <p className="text-xs text-[#42493e]/60 mb-1">Rival</p>
                        <p className={`text-2xl font-black ${
                          batalla.won ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {batalla.opponentScore}
                        </p>
                        <p className="text-xs text-[#42493e]/60">
                          {batalla.opponentCorrect}/{batalla.totalQuestions} correctas
                        </p>
                      </div>
                    </div>

                    {/* Categoría y Fecha */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#154212]">
                        {INGREDIENTE_NAMES[batalla.categoryId] || batalla.categoryName || batalla.categoryId || 'General'}
                      </p>
                      <p className="text-xs text-[#42493e]/60">
                        {formatDate(batalla.completedAt)}
                      </p>
                      {batalla.earnedCoins && Object.keys(batalla.earnedCoins).length > 0 && (
                        <div className="flex gap-1 mt-2 justify-end">
                          {Object.entries(batalla.earnedCoins).map(([ing, amount]) => (
                            <span key={ing} className="text-xs bg-[#F4C430]/20 text-[#755b00] px-2 py-1 rounded font-bold">
                              +{amount} {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
