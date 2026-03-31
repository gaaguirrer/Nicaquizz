import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import UserMenu from '../components/UserMenu';

// Icono de monedas (nacatamal) - SVG personalizado
const CoinIcon = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className}>
    <circle cx="32" cy="32" r="28" fill="#FFD700" stroke="#DAA520" strokeWidth="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#FFA500" strokeWidth="2"/>
    <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#DAA520">$</text>
  </svg>
);

// Iconos SVG para ingredientes
const IngredientIcon = ({ type, className = '' }) => {
  const icons = {
    masa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="32" rx="12" ry="20" fill="#F4C430" stroke="#D4A017" strokeWidth="2"/>
        <circle cx="28" cy="28" r="3" fill="#E8B830"/>
        <circle cx="36" cy="28" r="3" fill="#E8B830"/>
        <circle cx="28" cy="36" r="3" fill="#E8B830"/>
        <circle cx="36" cy="36" r="3" fill="#E8B830"/>
        <circle cx="32" cy="32" r="3" fill="#E8B830"/>
      </svg>
    ),
    cerdo: (
      <svg viewBox="0 0 64 64" className={className}>
        <rect x="16" y="20" width="32" height="24" rx="4" fill="#FF6B6B" stroke="#CC5555" strokeWidth="2"/>
        <rect x="20" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
        <rect x="34" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
      </svg>
    ),
    arroz: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="40" rx="24" ry="12" fill="#F5F5F5" stroke="#DDD" strokeWidth="2"/>
        <ellipse cx="24" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(-30 24 38)"/>
        <ellipse cx="32" cy="36" rx="4" ry="8" fill="#FFF"/>
        <ellipse cx="40" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(30 40 38)"/>
      </svg>
    ),
    papa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="34" rx="20" ry="16" fill="#C9A959" stroke="#9A7B4A" strokeWidth="2"/>
        <circle cx="26" cy="30" r="3" fill="#8B6F47"/>
        <circle cx="38" cy="32" r="2" fill="#8B6F47"/>
        <circle cx="32" cy="40" r="2" fill="#8B6F47"/>
      </svg>
    ),
    chile: (
      <svg viewBox="0 0 64 64" className={className}>
        <path d="M32 12 Q36 8 40 12 L44 18 Q48 24 44 34 Q40 46 34 52 Q28 56 26 52 Q24 48 28 40 Q32 30 34 22 Q36 16 32 12Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
        <path d="M32 12 Q30 8 28 10 L26 14 Q28 16 32 12Z" fill="#27AE60"/>
      </svg>
    )
  };
  return icons[type] || null;
};

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Colores de ingredientes
const INGREDIENT_COLORS = {
  masa: { bg: 'from-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  cerdo: { bg: 'from-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-400' },
  arroz: { bg: 'from-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400' },
  papa: { bg: 'from-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  chile: { bg: 'from-green-500/20', border: 'border-green-500/50', text: 'text-green-400' }
};

export default function Account() {
  const { currentUser, userData, fetchUserData } = useAuth();
  const toast = useToast();

  // Estados para edición de perfil
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || userData?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Calcular nacatamales completos
  const coins = userData?.coins || {};
  const nacatamalesCount = Math.min(
    coins.masa || 0,
    coins.cerdo || 0,
    coins.arroz || 0,
    coins.papa || 0,
    coins.chile || 0
  );

  // Manejar actualización del nombre
  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    setNameLoading(true);
    try {
      await updateProfile(currentUser, { displayName: displayName.trim() });
      await updateDoc(doc(db, 'users', currentUser.uid), { displayName: displayName.trim() });
      await fetchUserData(currentUser.uid);
      toast.success('Nombre actualizado correctamente');
      setIsEditingName(false);
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      toast.error('Error al actualizar nombre');
    } finally {
      setNameLoading(false);
    }
  };

  // Manejar actualización del correo
  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('El correo no puede estar vacío');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Ingresa un correo válido');
      return;
    }
    setEmailLoading(true);
    try {
      await updateEmail(currentUser, newEmail.trim());
      await updateDoc(doc(db, 'users', currentUser.uid), { email: newEmail.trim() });
      toast.success('Correo actualizado correctamente');
      setIsEditingEmail(false);
      setNewEmail('');
    } catch (error) {
      console.error('Error al actualizar correo:', error);
      if (error.code === 'requires-recent-login') {
        toast.error('Debes iniciar sesión nuevamente para cambiar el correo');
      } else {
        toast.error('Error al actualizar correo');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  // Manejar actualización de contraseña
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      toast.success('Contraseña actualizada correctamente');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      if (error.code === 'wrong-password') {
        toast.error('Contraseña actual incorrecta');
      } else if (error.code === 'requires-recent-login') {
        toast.error('Debes iniciar sesión nuevamente');
      } else {
        toast.error('Error al actualizar contraseña');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Estadísticas
  const stats = userData?.stats || {};
  const totalQuestions = stats.totalQuestionsAnswered || 0;
  const totalCorrect = stats.totalCorrect || 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🇳🇮</span>
              <h1 className="text-2xl font-bold gradient-text">NicaQuizz</h1>
            </Link>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          <MaterialIcon name="settings" className="inline-block w-8 h-8 align-middle mr-2 text-indigo-400" />
          Mi Cuenta
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Configuración de Cuenta */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nombre */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MaterialIcon name="person" className="text-indigo-400" />
                Nombre de usuario
              </h2>
              {isEditingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field w-full"
                    placeholder="Tu nombre"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateName}
                      disabled={nameLoading}
                      className="btn-primary flex-1 text-sm"
                    >
                      {nameLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setDisplayName(currentUser?.displayName || userData?.displayName || '');
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300">{currentUser?.displayName || 'Sin nombre'}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <MaterialIcon name="edit" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Correo electrónico */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MaterialIcon name="email" className="text-blue-400" />
                Correo electrónico
              </h2>
              {isEditingEmail ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-field w-full"
                    placeholder="nuevo@correo.com"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateEmail}
                      disabled={emailLoading}
                      className="btn-primary flex-1 text-sm"
                    >
                      {emailLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => { setIsEditingEmail(false); setNewEmail(''); }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Actual: {currentUser?.email}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 text-sm">{currentUser?.email}</p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <MaterialIcon name="edit" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MaterialIcon name="lock" className="text-green-400" />
                Contraseña
              </h2>
              {isEditingPassword ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Contraseña actual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field w-full text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nueva contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field w-full text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field w-full text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={passwordLoading}
                      className="btn-primary flex-1 text-sm"
                    >
                      {passwordLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300">••••••••</p>
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <MaterialIcon name="edit" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Monedero y Estadísticas */}
          <div className="space-y-6">
            {/* Monedero */}
            <div className="card bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MaterialIcon name="account_balance_wallet" className="text-green-400" />
                Monedero
              </h2>

              {/* Nacatamales */}
              <div className="bg-gray-800/80 rounded-lg p-4 mb-4 border border-green-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-300 text-sm">Nacatamales</span>
                  <div className="flex items-center gap-2">
                    <CoinIcon className="w-6 h-6" />
                    <span className="text-green-400 font-bold text-xl">{nacatamalesCount}</span>
                  </div>
                </div>
                <p className="text-xs text-green-200/70">
                  {nacatamalesCount === 0 
                    ? 'Completa categorías para obtener ingredientes'
                    : `${nacatamalesCount} nacatamal${nacatamalesCount !== 1 ? 'es' : ''} disponible${nacatamalesCount !== 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Ingredientes */}
              <h3 className="text-white font-semibold mb-3 text-sm">Ingredientes</h3>
              <div className="space-y-2">
                {Object.entries(INGREDIENT_COLORS).map(([key, colors]) => {
                  const count = coins[key] || 0;
                  return (
                    <div key={key} className={`flex items-center justify-between p-2 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border}`}>
                      <div className="flex items-center gap-2">
                        <IngredientIcon type={key} className="w-6 h-6" />
                        <span className="text-gray-300 text-sm capitalize">{key}</span>
                      </div>
                      <span className={`font-bold ${colors.text}`}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Botón Jugar */}
              <Link
                to="/play"
                className="mt-4 block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-center py-2.5 rounded-lg font-semibold transition-all hover-lift text-sm"
              >
                <MaterialIcon name="sports_esports" className="inline-block align-middle mr-1" />
                Jugar para ganar más
              </Link>
            </div>

            {/* Estadísticas */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MaterialIcon name="bar_chart" className="text-purple-400" />
                Estadísticas
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Preguntas</span>
                  <span className="text-white font-bold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Aciertos</span>
                  <span className="text-green-400 font-bold">{totalCorrect}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Precisión</span>
                  <span className="text-indigo-400 font-bold">{accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MaterialIcon name="quick_reference" className="text-yellow-400" />
                Accesos
              </h2>
              <div className="space-y-2">
                <Link
                  to="/shop"
                  className="block w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-center py-2.5 rounded-lg font-semibold transition-all hover-lift text-sm"
                >
                  <MaterialIcon name="storefront" className="inline-block align-middle mr-1" />
                  Tienda
                </Link>
                <Link
                  to="/profile"
                  className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-center py-2.5 rounded-lg font-semibold transition-all hover-lift text-sm"
                >
                  <MaterialIcon name="badge" className="inline-block align-middle mr-1" />
                  Perfil
                </Link>
                <Link
                  to="/trade"
                  className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-center py-2.5 rounded-lg font-semibold transition-all hover-lift text-sm"
                >
                  <MaterialIcon name="swap_horiz" className="inline-block align-middle mr-1" />
                  Intercambiar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
