/**
 * Account.jsx - Configuración de Cuenta de NicaQuizz
 * "Configuración"
 * 
 * Características:
 * - TopNavBar
 * - SideNavBar (desktop)
 * - Perfil Público (avatar, username, bio, seleccionar avatar)
 * - Privacidad (Perfil Público, Retos Abiertos)
 * - Seguridad (Cambiar Contraseña, Eliminar Cuenta)
 * - Action Footer (Cancelar, Guardar)
 * - BottomNavBar (mobile)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Avatares disponibles
const AVATARES = [
  { icono: 'restaurant_menu', nombre: 'Chef' },
  { icono: 'cooking', nombre: 'Cocinando' },
  { icono: 'skillet', nombre: 'Sartén' },
  { icono: 'outdoor_grill', nombre: 'Parrilla' }
];

export default function Account() {
  const { currentUser, userData } = useAuth();
  const [username, setUsername] = useState('GourmetNica92');
  const [bio, setBio] = useState('Amante de los nacatamales y experto en la historia del cacao nicaragüense. ¡Retame a un duelo de trivia!');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(1);
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [retosAbiertos, setRetosAbiertos] = useState(false);

  async function handleGuardar() {
    console.log('Guardando cambios:', {
      username,
      bio,
      avatarSeleccionado,
      perfilPublico,
      retosAbiertos
    });
    // En producción: llamar a API para actualizar perfil
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body selection:bg-[#ffdf90] selection:text-[#1d1d03]">
      
      {/* TopNavBar */}
      <header className="fixed top-0 z-50 w-full bg-[#fefccf] flex justify-between items-center px-6 py-4 shadow-[0px_8px_32px_rgba(29,29,3,0.08)]">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[#154212] font-headline tracking-tight">
            NicaQuizz
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-headline tracking-tight text-lg">
          <Link to="/categories" className="text-stone-600 hover:bg-[#154212]/5 transition-colors px-2 py-1">
            Explorar
          </Link>
          <Link to="/challenge" className="text-stone-600 hover:bg-[#154212]/5 transition-colors px-2 py-1">
            Batallas
          </Link>
          <Link to="/account" className="text-[#154212] font-bold border-b-2 border-[#154212] px-2 py-1">
            Ajustes
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="material-symbols-outlined text-[#154212] scale-95 active:scale-90 duration-200">
            account_circle
          </Link>
          <button className="material-symbols-outlined text-[#154212] scale-95 active:scale-90 duration-200">
            settings
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-20">
        {/* Main Content Canvas */}
        <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto">
          
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#154212] font-headline tracking-tight mb-2">
              Configuración
            </h1>
            <p className="text-[#42493e] max-w-md">
              Personaliza tu experiencia culinaria y gestiona la seguridad de tu cuenta.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Section: Perfil Público (Bento Style) */}
            <section className="md:col-span-8 flex flex-col gap-8">
              <div className="bg-[#f8f6c9] rounded-[32px] p-8 relative overflow-hidden">
                {/* Organic Shape Decoration */}
                <div
                  className="absolute -right-8 -top-8 w-32 h-32 bg-[#154212]/5 opacity-50"
                  style={{
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
                  }}
                ></div>

                <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#154212]">person</span>
                  Perfil Público
                </h2>

                <div className="flex flex-col md:flex-row gap-10">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                        <img
                          alt="Chef Avatar"
                          className="w-full h-full object-cover"
                          src="https://i.pravatar.cc/150?img=1"
                        />
                      </div>
                      <button className="absolute bottom-1 right-1 bg-[#154212] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-[#f8f6c9] hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-[#154212] tracking-widest uppercase">
                      Rango: Chef Junior
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-6">
                    <div className="group">
                      <label className="block text-xs font-bold text-[#42493e] uppercase tracking-widest mb-2 px-1">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-3 rounded-xl transition-all outline-none text-[#154212]"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-bold text-[#42493e] uppercase tracking-widest mb-2 px-1">
                        Biografía
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-[#f2f0c4] border-b-2 border-[#c2c9bb]/20 focus:border-[#154212] focus:ring-0 px-4 py-3 rounded-xl transition-all outline-none resize-none text-[#154212]"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="mt-10">
                  <label className="block text-xs font-bold text-[#42493e] uppercase tracking-widest mb-4 px-1">
                    Seleccionar Avatar 'Chef'
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    {AVATARES.map((avatar, index) => (
                      <button
                        key={avatar.icono}
                        onClick={() => setAvatarSeleccionado(index)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          avatarSeleccionado === index
                            ? 'bg-[#154212] text-white shadow-md'
                            : 'bg-[#e6e5b9] text-[#154212] hover:bg-[#154212] hover:text-white'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-2xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {avatar.icono}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Privacidad y Seguridad (Side Column) */}
            <aside className="md:col-span-4 flex flex-col gap-8">
              
              {/* Privacidad */}
              <div className="bg-[#f8f6c9] rounded-[32px] p-8 shadow-sm">
                <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#755b00]">visibility</span>
                  Privacidad
                </h2>
                <div className="space-y-6">
                  
                  {/* Perfil Público Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm">Perfil Público</p>
                      <p className="text-xs text-[#42493e]">Otros pueden ver tus logros.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={perfilPublico}
                        onChange={(e) => setPerfilPublico(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#c2c9bb] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154212]"></div>
                    </label>
                  </div>

                  {/* Retos Abiertos Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm">Retos Abiertos</p>
                      <p className="text-xs text-[#42493e]">Permitir desafíos de extraños.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={retosAbiertos}
                        onChange={(e) => setRetosAbiertos(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#c2c9bb] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154212]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="bg-[#f8f6c9] rounded-[32px] p-8 shadow-sm">
                <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#79001c]">shield</span>
                  Seguridad
                </h2>
                <button className="w-full text-left p-4 bg-[#fefccf] rounded-2xl flex items-center justify-between group hover:bg-[#79001c]/5 transition-colors">
                  <span className="font-bold text-sm">Cambiar Contraseña</span>
                  <span className="material-symbols-outlined text-[#79001c] group-hover:translate-x-1 transition-transform">
                    arrow_forward_ios
                  </span>
                </button>
                <button className="w-full text-left p-4 mt-4 bg-[#fefccf] rounded-2xl flex items-center justify-between group hover:bg-[#ffdad6] transition-colors">
                  <span className="font-bold text-sm text-[#ba1a1a]">Eliminar Cuenta</span>
                  <span className="material-symbols-outlined text-[#ba1a1a]">delete_forever</span>
                </button>
              </div>
            </aside>

            {/* Action Footer */}
            <div className="md:col-span-12 flex justify-end items-center gap-4 pt-4 border-t border-[#c2c9bb]/10">
              <button className="px-8 py-3 rounded-xl font-bold text-[#42493e] hover:bg-[#f2f0c4] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-10 py-3 bg-[#154212] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(21,66,18,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>

          {/* Visual Texture Element (Hoja de Plátano) */}
          <div className="mt-20 opacity-10 pointer-events-none absolute bottom-0 right-0 overflow-hidden w-96 h-96 -z-10 transform rotate-12 translate-x-20 translate-y-20">
            <div className="w-full h-full bg-[#154212] rounded-full blur-3xl"></div>
          </div>
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#fefccf]/70 backdrop-blur-xl rounded-t-[32px] shadow-[0_-4px_24px_rgba(29,29,3,0.05)]">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-[#154212]/60 scale-110 duration-300 ease-out"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Inicio</span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center justify-center text-[#154212]/60"
        >
          <span className="material-symbols-outlined">sports_esports</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Batallas</span>
        </Link>
        <Link
          to="/history"
          className="flex flex-col items-center justify-center text-[#154212]/60"
        >
          <span className="material-symbols-outlined">history</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Historial</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center bg-[#154212] text-white rounded-2xl px-5 py-2 scale-110 duration-300 ease-out"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-headline text-[10px] uppercase tracking-widest mt-1">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
