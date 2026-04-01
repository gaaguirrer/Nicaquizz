/**
 * Auth.jsx - Página de Autenticación de NicaQuizz
 * "¡Bienvenido de nuevo!"
 * 
 * Características:
 * - Left Column: Ilustración del Nacatamal + Branding
 * - Right Column: Formulario de Login
 * - Campos: Email, Contraseña
 * - Botón: Ingresar
 * - Divider: "O continúa con"
 * - Google Login
 * - Link: Registrarse
 * - Decoración: Organic shapes, vapor trails
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup } = useAuth();
  
  const [isLogin, setIsLogin] = useState(!searchParams.get('register'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    // TODO: Implementar Google Auth
    console.log('Google login');
  }

  return (
    <main className="bg-[#fefccf] font-body text-[#1d1d03] min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0px_8px_32px_rgba(29,29,3,0.08)] relative">
        
        {/* Decoration: Organic Asymmetry */}
        <div
          className="absolute -top-12 -left-12 w-48 h-48 bg-[#154212]/5 z-0"
          style={{
            borderRadius: '63% 37% 54% 46% / 45% 48% 52% 55%'
          }}
        ></div>
        <div
          className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#755b00]/5 z-0"
          style={{
            borderRadius: '63% 37% 54% 46% / 45% 48% 52% 55%'
          }}
        ></div>

        {/* Left Column: Illustration & Brand */}
        <section className="md:w-1/2 relative min-h-[400px] md:min-h-[600px] bg-[#2D5A27] overflow-hidden flex flex-col justify-center items-center text-center p-12">
          
          {/* Background Motif */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
          </div>

          <div className="relative z-10 space-y-8 flex flex-col items-center">
            
            {/* The "Nacatamal" Centerpiece */}
            <div className="relative group">
              <div
                className="absolute -inset-4 blur-2xl rounded-full opacity-50"
                style={{
                  background: 'radial-gradient(circle at center, rgba(45, 90, 39, 0.1) 0%, transparent 70%)'
                }}
              ></div>
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#F4C430] to-[#D4A017] rounded-full flex items-center justify-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-transform duration-700">
                <span className="material-symbols-outlined text-9xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lunch_dining
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-white tracking-tight leading-tight">
                NicaQuizz
              </h1>
              <p className="text-white/80 font-medium text-lg max-w-sm mx-auto">
                Sabor a cultura, reto a la mente. El saber de nuestra tierra en tus manos.
              </p>
            </div>
          </div>

          {/* Footer Quote (Editorial Style) */}
          <div className="absolute bottom-8 left-12 right-12 text-left border-l-2 border-[#fccc38] pl-4">
            <p className="italic text-white/70 text-sm">
              "El que no conoce su historia, no conoce su sazón."
            </p>
          </div>
        </section>

        {/* Right Column: Authentication Form */}
        <section className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-[#fefccf] relative z-10">
          <div className="max-w-md mx-auto w-full space-y-10">
            
            <header className="space-y-2">
              <h2 className="font-headline font-bold text-3xl text-[#1d1d03] tracking-tight">
                {isLogin ? '¡Bienvenido de nuevo!' : '¡Crea tu cuenta!'}
              </h2>
              <p className="text-[#42493e] font-medium">
                {isLogin
                  ? 'Ingresa a tu cuenta para continuar tu viaje por Nicaragua.'
                  : 'Regístrate para comenzar tu aventura culinaria.'}
              </p>
            </header>

            {error && (
              <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                
                {/* Name Field (Register only) */}
                {!isLogin && (
                  <div className="group">
                    <label className="block text-sm font-semibold text-[#154212] mb-1 ml-1 uppercase tracking-wider" htmlFor="displayName">
                      Nombre
                    </label>
                    <div className="relative">
                      <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-4 rounded-t-xl transition-all outline-none text-[#1d1d03] placeholder:text-[#42493e]/40 font-medium"
                        placeholder="Tu nombre"
                        required={!isLogin}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#42493e]/50">
                        person
                      </span>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-[#154212] mb-1 ml-1 uppercase tracking-wider" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-4 rounded-t-xl transition-all outline-none text-[#1d1d03] placeholder:text-[#42493e]/40 font-medium"
                      placeholder="ejemplo@correo.com"
                      required
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#42493e]/50">
                      mail
                    </span>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-[#154212] mb-1 ml-1 uppercase tracking-wider" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-4 rounded-t-xl transition-all outline-none text-[#1d1d03] placeholder:text-[#42493e]/40 font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#42493e]/50">
                      lock
                    </span>
                  </div>
                  {isLogin && (
                    <div className="flex justify-end mt-2">
                      <a href="#" className="text-xs font-bold text-[#755b00] hover:text-[#154212] transition-colors">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fccc38] text-[#1d1d03] font-headline font-extrabold text-lg py-4 rounded-xl shadow-[0_4px_12px_rgba(252,204,56,0.3)] hover:bg-[#ffdf90] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Procesando...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Ingresar' : 'Registrarse'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#c2c9bb]/20"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-[#42493e]/50 uppercase tracking-widest">
                O continúa con
              </span>
              <div className="flex-grow border-t border-[#c2c9bb]/20"></div>
            </div>

            {/* Google Login Option */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#f2f0c4] py-4 rounded-xl font-bold text-[#1d1d03] hover:bg-[#eceabe] transition-colors border border-[#c2c9bb]/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login with Google
            </button>

            {/* Registration Link */}
            <footer className="text-center pt-4">
              <p className="text-[#42493e] font-medium">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#154212] font-extrabold hover:underline ml-1"
                >
                  {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                </button>
              </p>
            </footer>
          </div>
        </section>
      </div>

      {/* Contextual "Vapor" Orbs (Background Decoration) */}
      <div className="fixed top-20 right-[10%] w-32 h-32 bg-[#755b00]/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 left-[10%] w-48 h-48 bg-[#154212]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
    </main>
  );
}
