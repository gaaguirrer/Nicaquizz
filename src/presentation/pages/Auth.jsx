/**
 * Auth.jsx - Pagina de Autenticacion de NicaQuizz
 * "Bienvenido de nuevo!"
 *
 * Diseno compacto con errores flotantes, campos inline y botones lado a lado.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage, getAuthErrorIcon } from '../../shared/authErrors';
import { DEPARTAMENTOS } from '../../shared/constants/departments';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, googleLogin } = useAuth();
  const errorTimerRef = useRef(null);

  function handleBackToHome() {
    navigate('/');
  }

  const [isLogin, setIsLogin] = useState(!searchParams.get('register'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [errorIcon, setErrorIcon] = useState('error_outline');
  const [errorVisible, setErrorVisible] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function showError(message, icon) {
    clearTimeout(errorTimerRef.current);
    setError(message);
    setErrorIcon(icon);
    setErrorVisible(true);
  }

  function hideError() {
    clearTimeout(errorTimerRef.current);
    setErrorVisible(false);
    setTimeout(() => setError(''), 300);
  }

  function handleFieldChange() {
    if (errorVisible) {
      hideError();
    }
    if (success) {
      setSuccess('');
    }
  }

  useEffect(() => {
    return () => clearTimeout(errorTimerRef.current);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isLogin) {
      if (!email.trim()) {
        showError('Por favor ingresa tu correo electronico', 'mail');
        return;
      }
      if (!password) {
        showError('Por favor ingresa tu contrasena', 'lock');
        return;
      }
    } else {
      if (!displayName.trim()) {
        showError('Por favor ingresa tu nombre', 'person');
        return;
      }
      if (!email.trim()) {
        showError('Por favor ingresa tu correo electronico', 'mail');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('El correo electronico no tiene un formato valido. Ejemplo: usuario@correo.com', 'error_outline');
        return;
      }
      const emailParts = email.split('@');
      const domainParts = emailParts[1].split('.');
      const tld = domainParts[domainParts.length - 1];
      if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        showError('El correo electronico debe tener un dominio valido. Ejemplo: usuario@correo.com', 'error_outline');
        return;
      }
      if (!password) {
        showError('Por favor ingresa una contrasena', 'lock');
        return;
      }
      if (password.length < 6) {
        showError('La contrasena debe tener al menos 6 caracteres', 'key');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName, department || null);
        setSuccess('Cuenta creada exitosamente.');
      }
      setTimeout(() => navigate('/play'), 1500);
    } catch (err) {
      console.error('Error en auth:', err);
      showError(getAuthErrorMessage(err), getAuthErrorIcon(err));
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      hideError();
      setLoading(true);
      await googleLogin();
      navigate('/play');
    } catch (err) {
      console.error('Error en Google login:', err);
      showError(getAuthErrorMessage(err), getAuthErrorIcon(err));
    }
    setLoading(false);
  }

  return (
    <main className="bg-[#fefccf] font-body text-[#1d1d03] min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0px_8px_32px_rgba(29,29,3,0.08)] relative">

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
        <section className="md:w-2/5 relative bg-[#2D5A27] overflow-hidden flex flex-col justify-center items-center text-center p-8 min-h-[520px]">

          {/* Back Button - Top Left */}
          <button
            onClick={handleBackToHome}
            className="absolute top-4 left-4 flex items-center gap-1 text-white/60 hover:text-white font-bold transition-all hover:gap-2 group z-20"
            aria-label="Volver al inicio"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-xs uppercase tracking-wider">Inicio</span>
          </button>

          {/* Background Motif */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
          </div>

          <div className="relative z-10 space-y-6 flex flex-col items-center">

            {/* The "Nacatamal" Centerpiece */}
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-transform duration-700 bg-white flex items-center justify-center p-3">
                <img
                  src="/icons/ingredientes/nacatamal.png"
                  alt="Nacatamal nicaraguense"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight">
                NicaQuizz
              </h1>
              <p className="text-white/80 font-medium text-base max-w-[220px] mx-auto">
                Sabor a cultura, reto a la mente.
              </p>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="absolute bottom-6 left-8 right-8 text-left border-l-2 border-[#fccc38] pl-3">
            <p className="italic text-white/70 text-xs">
              "El que no conoce su historia, no conoce su sazon."
            </p>
          </div>
        </section>

        {/* Right Column: Authentication Form */}
        <section className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center bg-[#fefccf] relative z-10 min-h-[520px]">
          <div className="max-w-md mx-auto w-full space-y-5 relative">

            <header className="space-y-1">
              <h2 className="font-headline font-bold text-2xl md:text-3xl text-[#1d1d03] tracking-tight">
                {isLogin ? 'Bienvenido de nuevo!' : 'Crea tu cuenta!'}
              </h2>
              <p className="text-[#42493e] text-sm font-medium">
                {isLogin
                  ? 'Ingresa a tu cuenta para continuar.'
                  : 'Registrate para comenzar tu aventura.'}
              </p>
            </header>

            {/* Error Toast - Flotante, sin layout shift */}
            <div
              className={`absolute -top-2 left-0 right-0 z-20 transition-all duration-300 ease-in-out ${
                errorVisible
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              {error && (
                <div className="bg-[#ba1a1a] text-white px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-lg" role="alert">
                  <span className="material-symbols-outlined flex-shrink-0 text-xl mt-0.5">
                    {errorIcon}
                  </span>
                  <div className="flex-1">
                    <p>{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={hideError}
                    className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Cerrar mensaje de error"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Success Toast */}
            <div
              className={`absolute -top-2 left-0 right-0 z-20 transition-all duration-300 ease-in-out ${
                success
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              {success && (
                <div className="bg-[#2D5A27] text-white px-4 py-3 rounded-xl text-sm flex items-center gap-3 shadow-lg">
                  <span className="material-symbols-outlined flex-shrink-0 text-xl">check_circle</span>
                  <div className="flex-1">
                    <p>{success}</p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">

                {/* Name Field (Register only) */}
                {!isLogin && (
                  <div className="group">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-[#154212] uppercase tracking-wider whitespace-nowrap w-28 flex-shrink-0" htmlFor="displayName">
                        Nombre
                      </label>
                      <div className="relative flex-1">
                        <input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => { setDisplayName(e.target.value); handleFieldChange(); }}
                          className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-3 rounded-t-xl transition-all outline-none text-[#1d1d03] placeholder:text-[#42493e]/40 font-medium"
                          placeholder="Tu nombre"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#42493e]/50 text-lg">
                          person
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department Field (Register only) */}
                {!isLogin && (
                  <div className="group">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-[#154212] uppercase tracking-wider whitespace-nowrap w-28 flex-shrink-0" htmlFor="department">
                        Departamento
                      </label>
                      <div className="relative flex-1">
                        <select
                          id="department"
                          value={department}
                          onChange={(e) => { setDepartment(e.target.value); handleFieldChange(); }}
                          className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-3 rounded-t-xl transition-all outline-none text-[#1d1d03] font-medium appearance-none cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled>Selecciona tu departamento</option>
                          {DEPARTAMENTOS.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#42493e]/50 pointer-events-none text-lg">
                          location_on
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="group">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-[#154212] uppercase tracking-wider whitespace-nowrap w-28 flex-shrink-0" htmlFor="email">
                      Email
                    </label>
                    <div className="relative flex-1">
                      <input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); handleFieldChange(); }}
                        className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-3 rounded-t-xl transition-all outline-none text-[#1d1d03] placeholder:text-[#42493e]/40 font-medium"
                        placeholder="ejemplo@correo.com"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#42493e]/50 text-lg">
                        mail
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-[#154212] uppercase tracking-wider whitespace-nowrap w-28 flex-shrink-0" htmlFor="password">
                      Contrasena
                    </label>
                    <div className="relative flex-1">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); handleFieldChange(); }}
                        className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-3 rounded-t-xl transition-all outline-none text-[#1d1d03] placeholder:text-[#42493e]/40 font-medium"
                        placeholder="Minimo 6 caracteres"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#42493e]/50 text-lg">
                        lock
                      </span>
                    </div>
                  </div>
                  {isLogin && (
                    <div className="flex justify-end mt-1 ml-28">
                      <a href="#" className="text-xs font-bold text-[#755b00] hover:text-[#154212] transition-colors">
                        Olvidaste tu contrasena?
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Side by side: Google left, Submit right */}
              <div className="flex gap-3 pt-1">
                {/* Google Button - Left */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f2f0c4] py-3 rounded-xl font-bold text-[#1d1d03] hover:bg-[#eceabe] transition-colors border border-[#c2c9bb]/10 text-xs"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>

                {/* Submit Button - Right */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#fccc38] text-[#1d1d03] font-headline font-extrabold text-sm py-3 rounded-xl shadow-[0_4px_12px_rgba(252,204,56,0.3)] hover:bg-[#ffdf90] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </form>

            {/* Registration Link */}
            <footer className="text-center">
              <p className="text-[#42493e] text-sm font-medium">
                {isLogin ? 'No tienes una cuenta?' : 'Ya tienes una cuenta?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#154212] font-extrabold hover:underline ml-1"
                >
                  {isLogin ? 'Registrarse' : 'Iniciar Sesion'}
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
