import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Por favor ingresa tu nombre');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en auth:', err);
      let errorMessage = 'Ocurrió un error. Por favor verifica tus datos e intenta de nuevo.';

      // Códigos de error de Firebase Auth
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña es incorrecta.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'El registro con email/password no está habilitado.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al iniciar con Google:', err);
      setError('Ocurrio un error al iniciar con Google. Intentelo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      <div className="card w-full max-w-md animate-fade-in shadow-2xl border-gray-600/50">
        <div className="text-center mb-8">
          {/* Bandera de Nicaragua - Emoji */}
          <div className="flex justify-center mb-4">
            <span className="text-7xl animate-pulse">��</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">NicaQuizz</h1>
          <p className="text-gray-400">Pon a prueba tu conocimiento</p>
        </div>

        {/* Boton de Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-4 py-3 px-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-gray-200 hover-lift"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">o continua con email</span>
          </div>
        </div>

        <div className="flex mb-6 bg-gray-700/50 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 font-semibold transition-all ${
              isLogin
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Iniciar Sesion
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 font-semibold transition-all ${
              !isLogin
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                placeholder="Tu nombre"
                disabled={loading}
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@correo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesion' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Al registrarte, aceptas los términos y condiciones del servicio.
        </div>
      </div>
    </div>
  );
}
