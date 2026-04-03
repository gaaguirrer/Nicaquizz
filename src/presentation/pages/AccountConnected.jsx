/**
 * AccountConnected.jsx - Configuración de Cuenta de NicaQuizz
 * Versión conectada a Firestore
 *
 * Características:
 * - Cargar datos actuales del usuario
 * - Actualizar displayName y bio
 * - Cambiar avatar (selector)
 * - Toggle privacidad con updateUserPrivacy
 * - Cambiar contraseña (Firebase Auth)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../infrastructure/firebase/firebase.config';
import TopNavBar from '../components/TopNavBar';
import Button from '../components/Button';
import { getAuthErrorMessage } from '../../shared/authErrors';
import { DEPARTAMENTOS } from '../../shared/constants/departments';

export default function AccountConnected() {
  const { currentUser, userData, updatePrivacy } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    department: '',
    isPublicProfile: true,
    allowOpenChallenges: true
  });

  // Estados para contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Cargar datos actuales
  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        bio: userData.bio || '',
        department: userData.department || '',
        isPublicProfile: userData.isPublicProfile ?? true,
        allowOpenChallenges: userData.allowOpenChallenges ?? true
      });
    }
  }, [userData]);

  // Actualizar perfil
  async function handleGuardarPerfil(e) {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setLoading(true);
    try {
      // Actualizar Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        department: formData.department || null,
        isPublicProfile: formData.isPublicProfile,
        allowOpenChallenges: formData.allowOpenChallenges
      });

      // Actualizar Auth (solo displayName)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
      }

      // Actualizar contexto
      if (updatePrivacy) {
        await updatePrivacy(formData.isPublicProfile, formData.allowOpenChallenges);
      }

      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.handleError(error, 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  }

  // Cambiar contraseña
  async function handleCambiarPassword(e) {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // Validaciones
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      // Importar funciones de Firebase Auth
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');

      // Re-autenticar
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Cambiar contraseña
      await updatePassword(currentUser, passwordForm.newPassword);
      
      toast.success('Contraseña actualizada exitosamente');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);

      const userMessage = getAuthErrorMessage(error);
      toast.error(userMessage);
    } finally {
      setChangingPassword(false);
    }
  }

  // Toggle switches
  function handleToggle(field) {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }

  // Eliminar cuenta
  async function handleEliminarCuenta() {
    if (!currentUser) {
      toast.error('Debes iniciar sesión');
      return;
    }

    // Confirmación final
    const confirmText = prompt('Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta:');
    if (confirmText !== 'ELIMINAR') {
      toast.info('Eliminación cancelada');
      return;
    }

    try {
      // Re-autenticar por seguridad
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Eliminar documento de Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userRef);

      // Eliminar usuario de Auth
      await deleteUser(currentUser);

      toast.success('Cuenta eliminada exitosamente');
      
      // Redirigir al home después de un breve delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);

      const userMessage = getAuthErrorMessage(error);
      toast.error(userMessage);

      if (error.code === 'auth/requires-recent-login' || error.code === 'auth/user-token-expired') {
        navigate('/auth');
      }
    }
  }

  // Avatares disponibles
  const avatars = [
    { id: 1, color: 'from-[#2D5A27] to-[#154212]', icon: 'person' },
    { id: 2, color: 'from-[#C41E3A] to-[#79001c]', icon: 'chef' },
    { id: 3, color: 'from-[#F4C430] to-[#DAA520]', icon: 'restaurant' },
    { id: 4, color: 'from-[#8B5FBF] to-[#5B3A7A]', icon: 'military_tech' },
    { id: 5, color: 'from-[#154212] to-[#0A1F08]', icon: 'school' }
  ];

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body">
      {/* TopNavBar */}
      <TopNavBar currentPage="account" />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <section>
            <h1 className="text-5xl font-headline font-extrabold text-[#154212] tracking-tighter mb-2">
              Configuración
            </h1>
            <p className="text-[#42493e] text-lg">
              Administra tu cuenta y preferencias
            </p>
          </section>

          {/* Perfil */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-[#154212]/5 overflow-hidden">
            <div className="bg-[#154212] text-white px-8 py-4">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined">person</span>
                Perfil Público
              </h2>
            </div>

            <form onSubmit={handleGuardarPerfil} className="p-8 space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-3">
                  Avatar
                </label>
                <div className="flex gap-4 flex-wrap">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white text-2xl font-bold transition-all ${
                        formData.displayName?.charAt(0) === String(avatar.id) 
                          ? 'ring-4 ring-[#2D5A27] scale-110' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <span className="material-symbols-outlined">{avatar.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-bold"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Email (solo lectura) */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 bg-[#154212]/5 text-[#42493e]/60 font-bold"
                />
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Departamento
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-bold appearance-none cursor-pointer bg-white"
                >
                  <option value="">Sin definir</option>
                  {DEPARTAMENTOS.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#2D5A27] focus:outline-none font-medium resize-none"
                  placeholder="Cuéntanos sobre ti..."
                  maxLength={200}
                />
                <p className="text-xs text-[#42493e]/60 mt-1 text-right">
                  {formData.bio?.length || 0}/200 caracteres
                </p>
              </div>

              {/* Botón Guardar */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Guardar Cambios
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Privacidad */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-[#154212]/5 overflow-hidden">
            <div className="bg-[#2D5A27] text-white px-8 py-4">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined">privacy_tip</span>
                Privacidad
              </h2>
            </div>

            <div className="p-8 space-y-6">
              {/* Perfil Público */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#154212]">Perfil Público</p>
                  <p className="text-sm text-[#42493e]/60">
                    Otros usuarios pueden ver tu perfil y estadísticas
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('isPublicProfile')}
                  className={`w-14 h-8 rounded-full transition-colors relative ${
                    formData.isPublicProfile ? 'bg-[#2D5A27]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.isPublicProfile 
                        ? 'left-7' 
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Retos Abiertos */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#154212]">Permitir Retos Abiertos</p>
                  <p className="text-sm text-[#42493e]/60">
                    Cualquier usuario puede retarte sin ser tu amigo
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('allowOpenChallenges')}
                  className={`w-14 h-8 rounded-full transition-colors relative ${
                    formData.allowOpenChallenges ? 'bg-[#2D5A27]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.allowOpenChallenges 
                        ? 'left-7' 
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-[#154212]/5 overflow-hidden">
            <div className="bg-[#C41E3A] text-white px-8 py-4">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined">lock</span>
                Seguridad
              </h2>
            </div>

            <form onSubmit={handleCambiarPassword} className="p-8 space-y-6">
              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#C41E3A] focus:outline-none font-bold"
                  placeholder="••••••••"
                />
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#C41E3A] focus:outline-none font-bold"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-bold text-[#154212] mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/20 focus:border-[#C41E3A] focus:outline-none font-bold"
                  placeholder="••••••••"
                />
              </div>

              {/* Botón Cambiar */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={changingPassword}
                className="w-full bg-[#C41E3A] hover:bg-[#a40029]"
              >
                {changingPassword ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Cambiando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock_reset</span>
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Zona de Peligro */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-red-500/30 overflow-hidden">
            <div className="bg-red-600 text-white px-8 py-4">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Zona de Peligro
              </h2>
            </div>

            <div className="p-8">
              <p className="text-[#42493e] mb-6">
                Una vez que elimines tu cuenta, no hay vuelta atrás. ¿Estás seguro?
              </p>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña actual para confirmar"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#154212]/10 focus:border-red-500 focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-red-500 text-red-600 hover:bg-red-50"
                  onClick={handleEliminarCuenta}
                >
                  <span className="material-symbols-outlined">delete_forever</span>
                  Eliminar Cuenta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
