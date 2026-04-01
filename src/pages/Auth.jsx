/**
 * Auth.jsx - Portal de Autenticación de NicaQuizz
 * "La Puerta del Sabor"
 * 
 * Login/Signup con diseño Nacatamal Vivid
 */

import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Modo desde URL (?mode=register)
  useState(() => {
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
    }
  });

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
      navigate('/play');
    } catch (err) {
      console.error('Error en auth:', err);
      let errorMessage = 'Ocurrió un error. Por favor verifica tus datos e intenta de nuevo.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado. ¿Quieres iniciar sesión?';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña es incorrecta.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'El registro no está habilitado.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
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
      navigate('/play');
    } catch (err) {
      console.error('Error al iniciar con Google:', err);
      setError('Error al iniciar con Google. Inténtelo de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-nica-verde/30 via-gray-900 to-nica-verde/30 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-nica-amarillo/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-nica-rojo/10 rounded-full blur-3xl"></div>
      
      <div className="card w-full max-w-lg animate-fade-in shadow-2xl border-nica-amarillo/30 relative z-10">
        {/* Header con bandera y título */}
        <div className="text-center mb-8">
          {/* Bandera de Nicaragua */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <span className="text-7xl animate-bounce-slow inline-block">🇳🇮</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-nica-verde to-nica-amarillo rounded-full blur-sm"></div>
            </div>
          </div>
          
          <h1 className="text-5xl font-display text-nica-amarillo mb-2 gradient-text">
            NicaQuizz
          </h1>
          <p className="text-gray-400 text-lg">
            {isLogin ? '¡Bienvenido de vuelta, Maestro!' : '¡Comienza tu aventura culinaria!'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            El Nacatamal del Conocimiento
          </p>
        </div>

        {/* Botón de Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-6 py-4 px-6 bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/50 hover:border-blue-400/50 rounded-xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-white hover-lift shadow-comic"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        {/* Separador */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-500 font-medium">o usa tu correo</span>
          </div>
        </div>

        {/* Tabs Login/Registro */}
        <div className="flex mb-6 bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 font-bold transition-all ${
              isLogin
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">login</span>
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 font-bold transition-all ${
              !isLogin
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="material-symbols-rounded inline-block align-middle mr-1 text-sm">person_add</span>
            Registrarse
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <span className="material-symbols-rounded text-xl flex-shrink-0">error</span>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-5">
              <label htmlFor="displayName" className="block text-sm font-bold text-gray-300 mb-2">
                <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">person</span>
                Nombre
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                placeholder="Tu nombre completo"
                disabled={loading}
                required={!isLogin}
              />
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">
              <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">email</span>
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
            <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
              <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">lock</span>
              Contraseña
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
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-2">
              <span className="material-symbols-rounded text-xs inline-block align-middle mr-0.5">info</span>
              Mínimo 6 caracteres
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg font-bold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
                Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-rounded">
                  {isLogin ? 'login' : 'person_add'}
                </span>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </span>
            )}
          </button>
        </form>

        {/* Términos */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Al {isLogin ? 'iniciar sesión' : 'registrarte'}, aceptas nuestros{' '}
            <a href="#" className="text-nica-amarillo hover:underline">Términos</a> y{' '}
            <a href="#" className="text-nica-amarillo hover:underline">Política de Privacidad</a>
          </p>
        </div>

        {/* Decoración de ingredientes */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-center gap-4">
          <div className="w-10 h-10 opacity-50 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <ellipse cx="32" cy="32" rx="12" ry="20" fill="#F4C430"/>
            </svg>
          </div>
          <div className="w-10 h-10 opacity-50 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <rect x="16" y="20" width="32" height="24" rx="4" fill="#FF6B6B"/>
            </svg>
          </div>
          <div className="w-10 h-10 opacity-50 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <ellipse cx="32" cy="40" rx="24" ry="12" fill="#F5F5F5"/>
            </svg>
          </div>
          <div className="w-10 h-10 opacity-50 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <ellipse cx="32" cy="34" rx="20" ry="16" fill="#C9A959"/>
            </svg>
          </div>
          <div className="w-10 h-10 opacity-50 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <path d="M32 12 Q36 8 40 12 L44 18 Q48 24 44 34 Q40 46 34 52 Q28 56 26 52 Q24 48 28 40 Q32 30 34 22 Q36 16 32 12Z" fill="#E74C3C"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
