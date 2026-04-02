import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/firestore';

/**
 * Hook para verificar si el usuario actual es administrador
 * Nota: Las monedas infinitas deben agregarse manualmente desde el AdminPanel
 */
export function useIsAdmin() {
  const { currentUser, userData } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Si ya tenemos userData, verificar directamente
      if (userData) {
        const adminStatus = userData.isAdmin || false;
        setIsAdmin(adminStatus);
        setLoading(false);
        return;
      }

      // Si no, obtener el perfil del usuario
      try {
        const profile = await getUserProfile(currentUser.uid);
        const adminStatus = profile?.isAdmin || false;
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error al verificar admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [currentUser, userData]);

  return { isAdmin, loading };
}

