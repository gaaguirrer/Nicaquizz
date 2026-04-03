/**
 * ChallengeConnected.jsx - Sistema de Retos de NicaQuizz
 * Versión conectada a Firestore
 *
 * Características:
 * - Cargar datos del reto (desde getChallenge)
 * - Aceptar reto (con acceptChallenge)
 * - Sistema de preguntas para retos
 * - Registrar resultado (con completeChallenge)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getChallenge,
  acceptChallenge,
  rejectChallenge,
  deleteChallenge,
  fetchCategoryById,
  getUserProfile
} from '../../services/firestore';
import {
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase/firebase.config';
import TopNavBar from '../components/TopNavBar';
import Button from '../components/Button';

export default function ChallengeConnected() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  
  // Estados
  const [challenge, setChallenge] = useState(null);
  const [category, setCategory] = useState(null);
  const [challenger, setChallenger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  // Estados para timeout
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutElapsed, setTimeoutElapsed] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Cargar datos del reto
  useEffect(() => {
    if (challengeId && currentUser) {
      loadChallenge();
    }
  }, [challengeId, currentUser]);

  // Timer de 1 minuto para el retador si el reto está pendiente
  useEffect(() => {
    if (!challenge || !currentUser) return;

    // Solo aplica si el usuario actual es el challenger y el reto está pendiente
    const isChallenger = challenge.challengerId === currentUser.uid;
    const isPending = challenge.status === 'pending';

    if (!isChallenger || !isPending) return;

    const timer = setTimeout(() => {
      setTimeoutElapsed(true);
      setShowTimeoutModal(true);
    }, 60 * 1000); // 1 minuto

    return () => clearTimeout(timer);
  }, [challenge, currentUser]);

  async function loadChallenge() {
    if (!challengeId) return;
    
    try {
      setLoading(true);
      
      // Cargar datos del reto
      const challengeData = await getChallenge(challengeId);
      
      if (!challengeData) {
        toast.error('Reto no encontrado');
        navigate('/friends');
        return;
      }
      
      setChallenge(challengeData);

      // Cargar categoría si existe
      if (challengeData.categoryId) {
        const categoryData = await fetchCategoryById(challengeData.categoryId);
        setCategory(categoryData);
      }

      // Cargar datos del retador
      if (challengeData.challengerId) {
        const challengerData = await getUserProfile(challengeData.challengerId);
        setChallenger(challengerData);
      }
    } catch (error) {
      toast.handleError(error, 'Error al cargar reto');
    } finally {
      setLoading(false);
    }
  }

  // Listener en tiempo real para cambios en el estado del reto
  // Notifica al retador cuando el retado acepta o rechaza
  useEffect(() => {
    if (!challengeId) return;

    const challengeRef = doc(db, 'challenges', challengeId);
    const unsubscribe = onSnapshot(challengeRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();

      if (data.status === 'rejected' && challenge?.status !== 'rejected') {
        toast.warning('El jugador rechazó tu reto');
      }

      if (data.status === 'accepted' && challenge?.status === 'pending') {
        toast.success('¡El jugador aceptó el reto!');
      }

      setChallenge({ id: snapshot.id, ...data });
    });

    return () => unsubscribe();
  }, [challengeId]);

  // Aceptar reto
  async function handleAceptarReto() {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // Verificar que el usuario es el desafiado
    if (challenge.challengedId !== currentUser.uid) {
      toast.error('Este reto no es para ti');
      return;
    }

    setAccepting(true);
    try {
      await acceptChallenge(challengeId);
      toast.success('¡Reto aceptado!');

      // Navegar a preguntas
      const categoryId = challenge.categoryId || 'historia';
      navigate(`/questions/${categoryId}?challenge=${challengeId}`);
    } catch (error) {
      toast.error(error.message || 'Error al aceptar reto');
    } finally {
      setAccepting(false);
    }
  }

  // Rechazar reto - muestra modal de confirmacion
  async function handleRechazarReto() {
    if (!currentUser) return;
    setShowRejectModal(true);
  }

  async function confirmRechazarReto() {
    setShowRejectModal(false);
    try {
      await rejectChallenge(challengeId);
      toast.success('Reto rechazado');
      navigate('/friends');
    } catch (error) {
      toast.error('Error al rechazar reto');
    }
  }

  // Timeout: Jugar reto abierto
  async function handleTimeoutRetoAbierto() {
    try {
      // Eliminar el reto actual
      await deleteChallenge(challengeId);
      setShowTimeoutModal(false);

      // Ir a jugar solo
      const categoryId = challenge.categoryId || 'historia';
      navigate(`/questions/${categoryId}`);
    } catch (error) {
      toast.error('Error al convertir a reto abierto');
    }
  }

  // Timeout: Retar a otro jugador
  function handleTimeoutOtroJugador() {
    setShowTimeoutModal(false);
    navigate('/play');
  }

  // Timeout: Cancelar reto
  async function handleTimeoutCancelar() {
    try {
      await deleteChallenge(challengeId);
      setShowTimeoutModal(false);
      toast.info('Reto cancelado');
      navigate('/play');
    } catch (error) {
      toast.error('Error al cancelar reto');
    }
  }

  // Estado del reto
  const getStatusBadge = () => {
    if (!challenge) return null;
    
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Pendiente' },
      accepted: { color: 'bg-blue-500', text: 'Aceptado' },
      rejected: { color: 'bg-red-500', text: 'Rechazado' },
      completed: { color: 'bg-green-500', text: 'Completado' }
    };
    
    const config = statusConfig[challenge.status] || statusConfig.pending;
    
    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefccf] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-[#2D5A27] animate-spin inline-block">progress_activity</span>
          <p className="text-[#154212] font-bold mt-4">Cargando reto...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#fefccf] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-[#154212]/20">error</span>
          <p className="text-[#154212] font-bold mt-4">Reto no encontrado</p>
          <Link to="/friends" className="text-[#2D5A27] font-bold underline mt-2 inline-block">
            Volver a Amigos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* TopNavBar */}
      <TopNavBar currentPage="challenge" />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-[#154212]/5 overflow-hidden mb-8">
            {/* Header con estado */}
            <div className="bg-gradient-to-r from-[#2D5A27] to-[#154212] text-white p-6 flex justify-between items-center">
              <h1 className="text-3xl font-headline font-black">Reto de NicaQuizz</h1>
              {getStatusBadge()}
            </div>

            {/* Contenido */}
            <div className="p-8">
              
              {/* Retador vs Desafiado */}
              <div className="flex items-center justify-between mb-8">
                {/* Retador */}
                <div className="text-center flex-1">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {challenger?.displayName?.charAt(0) || 'R'}
                  </div>
                  <p className="font-bold text-[#154212]">{challenger?.displayName || 'Retador'}</p>
                  <p className="text-xs text-[#42493e]/60">Te ha retado</p>
                </div>

                {/* VS */}
                <div className="px-8">
                  <span className="text-4xl font-black text-[#C41E3A] italic">VS</span>
                </div>

                {/* Desafiado */}
                <div className="text-center flex-1">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#79001c] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {currentUser?.displayName?.charAt(0) || 'T'}
                  </div>
                  <p className="font-bold text-[#154212]">{currentUser?.displayName || 'Tú'}</p>
                  <p className="text-xs text-[#42493e]/60">¿Aceptas?</p>
                </div>
              </div>

              {/* Información del Reto */}
              <div className="bg-[#154212]/5 rounded-2xl p-6 border border-[#154212]/10 mb-8">
                <h3 className="font-bold text-[#154212] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span>
                  Detalles del Reto
                </h3>
                
                <div className="space-y-3">
                  {/* Categoría */}
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2D5A27]">menu_book</span>
                    <div>
                      <p className="text-xs text-[#42493e]/60 uppercase font-bold">Categoría</p>
                      <p className="font-bold text-[#154212]">
                        {category?.name || challenge.categoryId ? 
                          (category?.name || challenge.categoryId.toUpperCase()) : 
                          'Cualquier categoría'}
                      </p>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2D5A27]">schedule</span>
                    <div>
                      <p className="text-xs text-[#42493e]/60 uppercase font-bold">Estado</p>
                      <p className="font-bold text-[#154212] capitalize">{challenge.status}</p>
                    </div>
                  </div>

                  {/* Fecha de creación */}
                  {challenge.createdAt && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#2D5A27]">calendar_today</span>
                      <div>
                        <p className="text-xs text-[#42493e]/60 uppercase font-bold">Creado</p>
                        <p className="font-bold text-[#154212]">
                          {challenge.createdAt.toDate().toLocaleDateString('es-NI')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              {challenge.status === 'pending' && challenge.challengedId === currentUser?.uid ? (
                <div className="flex gap-4">
                  <Button
                    onClick={handleAceptarReto}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={accepting}
                  >
                    {accepting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Aceptando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">check</span>
                        Aceptar Reto
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRechazarReto}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <span className="material-symbols-outlined">close</span>
                    Rechazar
                  </Button>
                </div>
              ) : challenge.status === 'accepted' ? (
                <div className="text-center">
                  <p className="text-[#2D5A27] font-bold text-lg mb-4">¡Reto en progreso!</p>
                  <Button
                    onClick={() => navigate(`/questions/${challenge.categoryId || 'historia'}?challenge=${challengeId}`)}
                    variant="primary"
                    size="lg"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                    Continuar Reto
                  </Button>
                </div>
              ) : challenge.status === 'completed' ? (
                <div className="text-center">
                  {/* Resultado del reto */}
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#F4C430] to-[#2D5A27] flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-white text-5xl">
                        {challenge.winnerId === currentUser?.uid ? 'emoji_events' : 'handshake'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-headline font-black text-[#154212] mb-1">
                      {challenge.winnerId === currentUser?.uid ? '¡Victoria!' : 'Reto Completado'}
                    </h2>
                    <p className="text-sm text-[#42493e]">
                      {challenge.winnerId === currentUser?.uid
                        ? 'Has demostrado tu conocimiento'
                        : 'Ambos jugadores han completado el reto'}
                    </p>
                  </div>

                  {/* Marcador */}
                  <div className="bg-gradient-to-br from-[#154212]/10 to-[#C41E3A]/10 rounded-2xl p-6 mb-6 border-2 border-[#154212]/20">
                    <h3 className="font-bold text-[#154212] mb-4 text-sm uppercase tracking-wider">Marcador Final</h3>
                    <div className="flex items-center justify-center gap-6">
                      {/* Retador */}
                      <div className="text-center flex-1">
                        <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white font-bold text-lg">
                          {challenger?.displayName?.charAt(0) || 'R'}
                        </div>
                        <p className="text-xs text-[#42493e]/60 mb-1 truncate">{challenger?.displayName || 'Retador'}</p>
                        <p className="text-4xl font-black text-[#2D5A27]">{challenge.challengerScore}</p>
                        <p className="text-[10px] text-[#42493e]/40">aciertos</p>
                      </div>

                      <div className="text-2xl font-black text-[#154212]/20">VS</div>

                      {/* Desafiado */}
                      <div className="text-center flex-1">
                        <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#79001c] flex items-center justify-center text-white font-bold text-lg">
                          {currentUser?.displayName?.charAt(0) || 'T'}
                        </div>
                        <p className="text-xs text-[#42493e]/60 mb-1 truncate">{currentUser?.displayName || 'Tú'}</p>
                        <p className="text-4xl font-black text-[#C41E3A]">{challenge.challengedScore}</p>
                        <p className="text-[10px] text-[#42493e]/40">aciertos</p>
                      </div>
                    </div>

                    {/* Ganador badge */}
                    {challenge.winnerId && (
                      <div className="mt-4 bg-[#F4C430]/20 rounded-xl p-3 border border-[#F4C430]/30">
                        <p className="text-sm font-bold text-[#154212]">
                          <span className="material-symbols-outlined text-[#F4C430] text-base align-middle mr-1">emoji_events</span>
                          Ganador: {challenge.winnerId === challenger?.id ? challenger?.displayName : currentUser?.displayName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/play')}
                      variant="outline"
                      size="md"
                      className="flex-1"
                    >
                      <span className="material-symbols-outlined">home</span>
                      Inicio
                    </Button>
                    <Button
                      onClick={() => {
                        // Revancha: crear nuevo reto con mismos jugadores
                        navigate(`/play`);
                      }}
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      <span className="material-symbols-outlined">autorenew</span>
                      Revancha
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#42493e]/60">
                  <p>Este reto ha sido {challenge.status}</p>
                </div>
              )}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-gradient-to-r from-[#F4C430]/20 to-[#ffdf90]/20 rounded-2xl p-6 border-2 border-[#F4C430]/30">
            <h3 className="font-bold text-[#154212] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">lightbulb</span>
              ¿Cómo funciona?
            </h3>
            <ul className="space-y-2 text-sm text-[#42493e]">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#F4C430] text-sm">check_circle</span>
                <span>Acepta el reto para comenzar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#F4C430] text-sm">check_circle</span>
                <span>Responde preguntas de la categoría seleccionada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#F4C430] text-sm">check_circle</span>
                <span>El jugador con más aciertos gana</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#F4C430] text-sm">check_circle</span>
                <span>¡Gana ingredientes para tu nacatamal!</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Modal de Confirmacion para Rechazar */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#fefccf] rounded-2xl shadow-2xl w-full max-w-sm border-4 border-[#C41E3A]/50 overflow-hidden">
            <div className="bg-gradient-to-r from-[#C41E3A] to-[#79001c] p-5 text-center">
              <span className="material-symbols-outlined text-white text-5xl mb-2">cancel</span>
              <h3 className="text-xl font-headline font-bold text-white">Rechazar Reto</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-[#42493e] text-center">
                ¿Estas seguro de que deseas rechazar este reto?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-white hover:bg-gray-100 text-[#154212] font-bold py-3 rounded-xl transition-all border-2 border-[#154212]/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRechazarReto}
                  className="flex-1 bg-[#C41E3A] hover:bg-[#A31832] text-white font-bold py-3 rounded-xl transition-all"
                >
                  Sí, Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Timeout */}
      {showTimeoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#fefccf] rounded-2xl shadow-2xl w-full max-w-sm border-4 border-[#F4C430]/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D9531E] to-[#B93B0E] p-5 text-center">
              <span className="material-symbols-outlined text-white text-5xl mb-2">hourglass_top</span>
              <h3 className="text-xl font-headline font-bold text-white">Jugador no responde</h3>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-3">
              <p className="text-sm text-[#42493e] text-center">
                El jugador retado no ha respondido. ¿Qué deseas hacer?
              </p>

              <button
                onClick={handleTimeoutRetoAbierto}
                className="w-full bg-[#2D5A27] hover:bg-[#154212] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Jugar reto abierto
              </button>

              <button
                onClick={handleTimeoutOtroJugador}
                className="w-full bg-[#F4C430] hover:bg-[#ffdf90] text-[#1d1d03] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-lg">people</span>
                Retar a otro jugador
              </button>

              <button
                onClick={handleTimeoutCancelar}
                className="w-full bg-white hover:bg-gray-100 text-[#42493e] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border-2 border-[#154212]/10"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
                Cancelar reto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
