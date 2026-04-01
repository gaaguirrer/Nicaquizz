/**
 * RankingConnected.jsx - Ranking de Maestros Cocineros de NicaQuizz
 * Versión conectada a Firestore
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGlobalRanking, fetchCategoryRanking } from '../services/firestore';
import TopNavBar from '../components/TopNavBar';

// Categorías para filtros
const CATEGORIAS = [
  { id: 'general', nombre: 'General' },
  { id: 'historia', nombre: 'Historia' },
  { id: 'matematicas', nombre: 'Matemáticas' },
  { id: 'geografia', nombre: 'Geografía' },
  { id: 'ciencias', nombre: 'Ciencias' }
];

export default function RankingConnected() {
  const { currentUser } = useAuth();
  const [filtro, setFiltro] = useState('general');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [miPosicion, setMiPosicion] = useState(null);

  useEffect(() => {
    cargarRanking();
  }, [filtro]);

  async function cargarRanking() {
    setLoading(true);
    try {
      let datos;
      if (filtro === 'general') {
        datos = await fetchGlobalRanking(100);
      } else {
        datos = await fetchCategoryRanking(filtro, 100);
      }
      setRanking(datos);

      // Encontrar mi posición
      if (currentUser) {
        const miIndice = datos.findIndex(u => u.id === currentUser.uid);
        setMiPosicion(miIndice >= 0 ? miIndice + 1 : null);
      }
    } catch (error) {
      console.error('Error al cargar ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* TopNavBar */}
      <TopNavBar currentPage="ranking" />

      <div className="max-w-screen-2xl mx-auto">
        {/* Content Canvas */}
        <section className="px-8 py-12">
          
          {/* Header Section */}
          <div className="mb-12 relative">
            <div className="absolute -top-12 -right-8 w-64 h-64 bg-[#F4C430]/20 rounded-full blur-3xl opacity-60"></div>
            <h1 className="text-5xl md:text-6xl font-black text-[#154212] font-headline tracking-tighter mb-4 leading-none relative z-10">
              Ranking de <br/><span className="text-[#755b00]">Maestros Cocineros</span>
            </h1>
            <p className="text-[#42493e] font-body max-w-xl text-lg relative z-10">
              Los alquimistas del sabor que han dominado el arte del conocimiento nicaragüense. ¿Tienes lo necesario para alcanzar el fogón supremo?
            </p>
          </div>

          {/* Filtros de Categoría */}
          <div className="mb-12 flex flex-wrap gap-4">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFiltro(cat.id)}
                className={`px-6 py-3 rounded-2xl font-bold font-headline text-sm transition-all ${
                  filtro === cat.id
                    ? 'bg-[#2D5A27] text-white shadow-lg scale-105'
                    : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Top 3 Podium */}
          {ranking.length >= 3 && (
            <div className="mb-16 grid grid-cols-3 gap-4 items-end">
              {/* Segundo Lugar */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-4 border-black overflow-hidden shadow-xl">
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                    {ranking[1].displayName?.charAt(0) || '2'}
                  </div>
                </div>
                <p className="font-bold text-sm text-[#154212] mb-1 truncate">
                  {ranking[1].displayName || 'Jugador'}
                </p>
                <p className="text-xs text-[#42493e]/60 mb-2">
                  {filtro === 'general' ? `${ranking[1].totalQuestionsAnswered || 0} preguntas` : `${ranking[1].correct || 0} aciertos`}
                </p>
                <div className="bg-gray-300 h-32 rounded-t-lg border-4 border-black flex items-end justify-center pb-4">
                  <span className="text-4xl font-black text-white drop-shadow-lg">2</span>
                </div>
              </div>

              {/* Primer Lugar */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F4C430] to-[#DAA520] border-4 border-black overflow-hidden shadow-xl">
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                    {ranking[0].displayName?.charAt(0) || '1'}
                  </div>
                </div>
                <p className="font-bold text-sm text-[#154212] mb-1 truncate">
                  {ranking[0].displayName || 'Jugador'}
                </p>
                <p className="text-xs text-[#42493e]/60 mb-2">
                  {filtro === 'general' ? `${ranking[0].totalQuestionsAnswered || 0} preguntas` : `${ranking[0].correct || 0} aciertos`}
                </p>
                <div className="bg-[#F4C430] h-40 rounded-t-lg border-4 border-black flex items-end justify-center pb-4">
                  <span className="text-5xl font-black text-white drop-shadow-lg">1</span>
                </div>
              </div>

              {/* Tercer Lugar */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 border-4 border-black overflow-hidden shadow-xl">
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                    {ranking[2].displayName?.charAt(0) || '3'}
                  </div>
                </div>
                <p className="font-bold text-sm text-[#154212] mb-1 truncate">
                  {ranking[2].displayName || 'Jugador'}
                </p>
                <p className="text-xs text-[#42493e]/60 mb-2">
                  {filtro === 'general' ? `${ranking[2].totalQuestionsAnswered || 0} preguntas` : `${ranking[2].correct || 0} aciertos`}
                </p>
                <div className="bg-amber-600 h-24 rounded-t-lg border-4 border-black flex items-end justify-center pb-4">
                  <span className="text-3xl font-black text-white drop-shadow-lg">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Lista Completa de Ranking */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-[#154212]/5 overflow-hidden">
            <div className="bg-[#154212] text-white px-8 py-4">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined">leaderboard</span>
                Posiciones {filtro === 'general' ? 'Globales' : `de ${CATEGORIAS.find(c => c.id === filtro)?.nombre}`}
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#154212]/40 animate-spin inline-block">progress_activity</span>
                <p className="text-[#42493e]/60 mt-4">Cargando ranking...</p>
              </div>
            ) : ranking.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#154212]/40">leaderboard</span>
                <p className="text-[#42493e]/60 mt-4">No hay datos de ranking disponibles</p>
              </div>
            ) : (
              <div className="divide-y divide-[#154212]/5">
                {ranking.slice(3).map((jugador, index) => {
                  const posicion = index + 4;
                  const esMiPosicion = currentUser && jugador.id === currentUser.uid;
                  
                  return (
                    <div
                      key={jugador.id}
                      className={`flex items-center gap-6 px-8 py-4 hover:bg-[#f8f6c9]/50 transition-colors ${
                        esMiPosicion ? 'bg-[#2D5A27]/10' : ''
                      }`}
                    >
                      {/* Posición */}
                      <div className="w-12 text-center">
                        <span className={`text-lg font-black ${
                          posicion <= 10 ? 'text-[#154212]' : 'text-[#154212]/40'
                        }`}>
                          {posicion}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white font-bold">
                        {jugador.displayName?.charAt(0) || 'J'}
                      </div>

                      {/* Información */}
                      <div className="flex-1">
                        <p className={`font-bold ${
                          esMiPosicion ? 'text-[#2D5A27]' : 'text-[#154212]'
                        }`}>
                          {jugador.displayName || 'Jugador'}
                          {esMiPosicion && <span className="ml-2 text-xs">(Tú)</span>}
                        </p>
                        <p className="text-xs text-[#42493e]/60">
                          {filtro === 'general' 
                            ? `${jugador.totalQuestionsAnswered || 0} preguntas respondidas`
                            : `${jugador.correct || 0} aciertos`
                          }
                        </p>
                      </div>

                      {/* Estadísticas */}
                      <div className="text-right">
                        <p className="text-lg font-black text-[#154212]">
                          {jugador.accuracy || 0}%
                        </p>
                        <p className="text-xs text-[#42493e]/60">precisión</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mi Posición */}
          {miPosicion && miPosicion > 10 && (
            <div className="mt-8 bg-[#2D5A27]/10 border-2 border-[#2D5A27]/30 rounded-2xl p-6">
              <p className="text-sm font-bold text-[#2D5A27] mb-2">Tu posición</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2D5A27] flex items-center justify-center text-white font-black text-xl">
                  {miPosicion}
                </div>
                <div>
                  <p className="font-bold text-[#154212]">
                    {currentUser?.displayName || 'Tú'}
                  </p>
                  <p className="text-xs text-[#42493e]/60">
                    Sigue jugando para mejorar tu posición
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
