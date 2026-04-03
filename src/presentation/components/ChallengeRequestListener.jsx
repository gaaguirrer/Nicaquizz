/**
 * ChallengeRequestListener.jsx - Detector de Retos en Tiempo Real
 *
 * Escucha en tiempo real la coleccion 'challenges' para detectar
 * cuando un jugador recibe un reto pendiente. Muestra un popup modal
 * con opciones de Aceptar o Rechazar.
 *
 * Se monta dentro de AuthProvider en App.jsx para estar siempre activo
 * cuando el usuario esta autenticado.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase/firebase.config';

export default function ChallengeRequestListener() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [challengerName, setChallengerName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [processing, setProcessing] = useState(false);

  const processedIdsRef = useRef(new Set());

  useEffect(() => {
    if (!currentUser) {
      setPendingChallenge(null);
      return;
    }

    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      where('challengedId', '==', currentUser.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty || !currentUser) return;

      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const challengeData = change.doc.data();
          const challengeId = change.doc.id;

          if (processedIdsRef.current.has(challengeId)) continue;
          processedIdsRef.current.add(challengeId);

          if (challengeData.status !== 'pending') continue;

          setPendingChallenge({ id: challengeId, ...challengeData });

          try {
            const challengerDoc = await getDoc(doc(db, 'users', challengeData.challengerId));
            const name = challengerDoc.exists()
              ? challengerDoc.data().displayName
              : 'Un jugador';
            setChallengerName(name);
          } catch {
            setChallengerName('Un jugador');
          }

          try {
            if (challengeData.categoryId) {
              const catDoc = await getDoc(doc(db, 'categories', challengeData.categoryId));
              setCategoryName(catDoc.exists() ? catDoc.data().name : challengeData.categoryId);
            } else {
              setCategoryName('Cualquier categoria');
            }
          } catch {
            setCategoryName('Cualquier categoria');
          }

          break;
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  async function handleAceptar() {
    if (!pendingChallenge || !currentUser) return;

    setProcessing(true);
    try {
      const challengeRef = doc(db, 'challenges', pendingChallenge.id);
      await updateDoc(challengeRef, {
        status: 'accepted',
        startedAt: serverTimestamp()
      });

      toast.success('¡Reto aceptado!');

      const categoryId = pendingChallenge.categoryId || 'historia';
      navigate(`/questions/${categoryId}?challenge=${pendingChallenge.id}`);

      setPendingChallenge(null);
    } catch (error) {
      toast.error('Error al aceptar el reto');
    } finally {
      setProcessing(false);
    }
  }

  async function handleRechazar() {
    if (!pendingChallenge || !currentUser) return;

    setProcessing(true);
    try {
      const challengeRef = doc(db, 'challenges', pendingChallenge.id);
      await updateDoc(challengeRef, {
        status: 'rejected'
      });

      toast.info('Reto rechazado');
      setPendingChallenge(null);
    } catch (error) {
      toast.error('Error al rechazar el reto');
    } finally {
      setProcessing(false);
    }
  }

  if (!pendingChallenge) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-bounce-in">
        <div className="bg-[#fefccf] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#F4C430]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D5A27] to-[#154212] p-6 text-center relative">
            <span className="material-symbols-outlined text-[#F4C430] text-5xl">swords</span>
            <h2 className="text-2xl font-headline font-black text-white mt-2">
              ¡Te han Retado!
            </h2>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Retador */}
            <div className="flex items-center gap-4 mb-4 bg-white/70 rounded-2xl p-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#154212] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {challengerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-[#42493e]/60 font-bold uppercase">Retador</p>
                <p className="text-lg font-bold text-[#154212]">{challengerName}</p>
              </div>
            </div>

            {/* Categoria */}
            <div className="flex items-center gap-3 mb-6 bg-[#154212]/5 rounded-xl p-3">
              <span className="material-symbols-outlined text-[#2D5A27]">menu_book</span>
              <div>
                <p className="text-xs text-[#42493e]/60 font-bold uppercase">Categoria</p>
                <p className="font-bold text-[#154212]">{categoryName}</p>
              </div>
            </div>

            {/* Pregunta */}
            <p className="text-center text-[#154212] font-bold text-lg mb-6">
              Aceptas el desafio?
            </p>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleRechazar}
                disabled={processing}
                className="flex-1 bg-white hover:bg-gray-100 text-[#C41E3A] font-bold py-3 rounded-xl transition-all border-2 border-[#C41E3A]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">close</span>
                Rechazar
              </button>
              <button
                onClick={handleAceptar}
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-[#2D5A27] to-[#154212] hover:from-[#154212] hover:to-[#0d2d0a] text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Aceptando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Aceptar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
