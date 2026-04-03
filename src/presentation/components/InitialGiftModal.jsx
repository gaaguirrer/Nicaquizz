/**
 * InitialGiftModal.jsx - Modal de Regalo de Bienvenida
 *
 * Muestra un modal a los usuarios que no han reclamado su regalo
 * de 3 nacatamales. Solo aparece una vez por cuenta.
 * Se muestra cada vez que el usuario se loguea hasta que reclame.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase/firebase.config';

export default function InitialGiftModal() {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setShowModal(false);
      return;
    }

    async function checkGiftStatus() {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          // Solo mostrar si no ha reclamado el regalo
          if (!data.initialGiftClaimed) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Error al verificar regalo inicial:', error);
      }
    }

    checkGiftStatus();
  }, [currentUser]);

  async function handleReclamar() {
    if (!currentUser) return;

    setClaiming(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);

      // Dar 3 nacatamales y marcar como reclamado
      await updateDoc(userRef, {
        'coins.nacatamal': 3,
        initialGiftClaimed: true
      });

      toast.success('¡Has recibido 3 nacatamales de regalo de bienvenida!');
      setShowModal(false);
    } catch (error) {
      toast.error('Error al reclamar el regalo. Intenta de nuevo.');
    } finally {
      setClaiming(false);
    }
  }

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-bounce-in">
        <div className="bg-[#fefccf] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#F4C430]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D5A27] to-[#154212] p-6 text-center relative">
            <div className="absolute top-2 left-3">
              <span className="material-symbols-outlined text-[#F4C430] text-3xl">celebration</span>
            </div>
            <div className="absolute top-2 right-3">
              <span className="material-symbols-outlined text-[#F4C430] text-3xl">star</span>
            </div>
            <span className="material-symbols-outlined text-[#F4C430] text-6xl">restaurant</span>
            <h2 className="text-2xl font-headline font-black text-white mt-3">
              ¡Bienvenido a NicaQuizz!
            </h2>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Mensaje */}
            <div className="text-center mb-6">
              <p className="text-[#154212] font-bold text-lg mb-2">
                Tienes un regalo de bienvenida
              </p>
              <p className="text-sm text-[#42493e]/70">
                Como nuevo jugador, recibes 3 nacatamales gratis para comenzar tu aventura.
              </p>
            </div>

            {/* Nacatamales de regalo */}
            <div className="bg-gradient-to-br from-[#2D5A27]/10 to-[#154212]/10 rounded-2xl p-5 mb-6 border-2 border-[#2D5A27]/20">
              <div className="flex items-center justify-center gap-3">
                <span className="material-symbols-outlined text-[#2D5A27] text-4xl">restaurant</span>
                <div>
                  <p className="text-4xl font-black text-[#2D5A27]">3</p>
                  <p className="text-sm text-[#154212]/60 font-bold">nacatamales</p>
                </div>
              </div>
            </div>

            {/* Boton reclamar */}
            <button
              onClick={handleReclamar}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-[#2D5A27] to-[#154212] hover:from-[#154212] hover:to-[#0d2d0a] text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {claiming ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Reclamando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">card_giftcard</span>
                  ¡Reclamar 3 Nacatamales!
                </>
              )}
            </button>

            {/* Nota */}
            <p className="text-xs text-center text-[#42493e]/50 mt-4">
              Este regalo solo esta disponible una vez. Úsalo sabiamente en la tienda.
            </p>
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
