/**
 * NotificationCenter.jsx - Notificaciones
 * 
 * Escucha notificaciones en tiempo real desde Firestore.
 * Tipos: challenge, friend_request, trade, system, achievement
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import Button from './Button';

export default function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
    });

    return unsubscribe;
  }, [userId]);

  // Contar no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Marcar como leída
  async function markAsRead(notificationId) {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  // Marcar todas como leídas
  async function markAllAsRead() {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      notifications
        .filter(n => !n.read)
        .forEach(n => {
          const notifRef = doc(db, 'notifications', n.id);
          batch.update(notifRef, { read: true });
        });
      await batch.commit();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    } finally {
      setLoading(false);
    }
  }

  // Obtener ícono por tipo
  function getIconForType(type) {
    const icons = {
      challenge: 'military_tech',
      friend_request: 'person_add',
      trade: 'swap_horiz',
      system: 'notifications',
      achievement: 'emoji_events'
    };
    return icons[type] || 'notifications';
  }

  // Obtener color por tipo
  function getColorForType(type) {
    const colors = {
      challenge: 'bg-[#C41E3A]/10 text-[#C41E3A]',
      friend_request: 'bg-[#2D5A27]/10 text-[#2D5A27]',
      trade: 'bg-[#F4C430]/10 text-[#755b00]',
      system: 'bg-[#154212]/10 text-[#154212]',
      achievement: 'bg-gradient-to-r from-[#F4C430]/20 to-[#DAA520]/20 text-[#755b00]'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Formatear fecha
  function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-NI');
  }

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#154212]/5 rounded-lg transition-all relative"
        aria-label="Notificaciones"
      >
        <span className="material-symbols-outlined text-[#2D5A27]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-[#C41E3A] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-[#154212]/10 z-50 overflow-hidden animate-[slideIn_0.2s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D5A27] to-[#154212] text-white px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold font-headline text-lg flex items-center gap-2">
              <span className="material-symbols-outlined">notifications</span>
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Marcar todas como leídas'}
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#42493e]/60">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_none</span>
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 border-b border-[#154212]/5 hover:bg-[#154212]/5 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-[#2D5A27]/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícono */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColorForType(notif.type)}`}>
                      <span className="material-symbols-outlined text-lg">{getIconForType(notif.type)}</span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'font-bold text-[#154212]' : 'text-[#42493e]'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-[#42493e]/60 mt-1">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                      
                      {/* Acción si existe */}
                      {notif.actionUrl && (
                        <Link
                          to={notif.actionUrl}
                          className="text-xs text-[#2D5A27] font-bold mt-2 inline-flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver detalle
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      )}
                    </div>

                    {/* Indicador de no leído */}
                    {!notif.read && (
                      <div className="w-2 h-2 bg-[#2D5A27] rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-[#154212]/5 px-6 py-3 text-center">
              <Link
                to="/notifications"
                className="text-xs text-[#2D5A27] font-bold hover:underline"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Animación */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Función para crear notificación (para usar en otras partes del código)
 */
export async function createNotification(db, data) {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId: data.userId,
      type: data.type, // challenge, friend_request, trade, system, achievement
      message: data.message,
      actionUrl: data.actionUrl || null,
      metadata: data.metadata || {},
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
}
