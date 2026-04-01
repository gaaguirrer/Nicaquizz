/**
 * Notifications.jsx - Centro de Avisos de NicaQuizz
 * "Centro de Avisos"
 * 
 * Características:
 * - SideNavBar con perfil y navegación
 * - TopAppBar con notificaciones y settings
 * - Filter Tabs (Todos, Trueques, Retos, Logros)
 * - Lista de notificaciones (Trade, Challenge, Achievement, System)
 * - BottomNavBar para móvil
 * - Decoración de fondo
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Notificaciones simuladas
const NOTIFICACIONES = [
  {
    id: 1,
    tipo: 'trueque',
    titulo: '¡Trueque completado!',
    mensaje: '@Juanito aceptó tu oferta de 2 Masas por 1 Cerdo.',
    tiempo: 'Hace 5m',
    icono: 'swap_horiz',
    color: 'border-[#154212]',
    bgIcono: 'bg-[#2D5A27]/10',
    colorIcono: 'text-[#154212]'
  },
  {
    id: 2,
    tipo: 'reto',
    titulo: 'Nuevo Desafío',
    mensaje: '@Elena_Nica te ha desafiado a un duelo de Historia.',
    tiempo: 'Hace 2h',
    icono: 'swords',
    color: 'border-[#755b00]',
    bgIcono: 'bg-[#fccc38]/20',
    colorIcono: 'text-[#755b00]',
    acciones: ['Aceptar', 'Rechazar']
  },
  {
    id: 3,
    tipo: 'logro',
    titulo: '¡Nuevo Logro!',
    mensaje: 'Has recolectado 10 Papas. Reclama tu recompensa.',
    tiempo: 'Ayer',
    icono: 'military_tech',
    color: 'border-[#154212]',
    bgIcono: 'bg-[#bcf0ae]/30',
    colorIcono: 'text-[#154212]',
    accion: 'Reclamar ahora'
  },
  {
    id: 4,
    tipo: 'sistema',
    titulo: 'Aviso del Sistema',
    mensaje: 'Tu inventario está casi lleno. Visita la Pulpería.',
    tiempo: 'Ayer',
    icono: 'inventory_2',
    color: 'border-[#79001c]',
    bgIcono: 'bg-[#a40029]/10',
    colorIcono: 'text-[#79001c]'
  }
];

// Tabs de filtro
const FILTROS = ['Todos', 'Trueques', 'Retos', 'Logros'];

export default function Notifications() {
  const { currentUser } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  // Filtrar notificaciones por tipo
  const notificacionesFiltradas = filtroActivo === 'Todos'
    ? NOTIFICACIONES
    : NOTIFICACIONES.filter(noti => {
        if (filtroActivo === 'Trueques') return noti.tipo === 'trueque';
        if (filtroActivo === 'Retos') return noti.tipo === 'reto';
        if (filtroActivo === 'Logros') return noti.tipo === 'logro';
        return true;
      });

  return (
    <div className="bg-[#fefccf] font-body text-[#1d1d03] min-h-screen" style={{
      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(21, 66, 18, 0.03) 1px, transparent 0)',
      backgroundSize: '24px 24px'
    }}>
      
      {/* SideNavBar (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col py-6 h-full w-72 rounded-r-2xl border-r-0 bg-[#fefccf] shadow-2xl hidden md:flex">
        <div className="px-8 mb-10">
          <h1 className="text-2xl font-black text-[#154212] tracking-tighter">
            Trivias del Mercado
          </h1>
        </div>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-4 p-4 bg-[#eceabe] rounded-xl">
            <img
              className="w-12 h-12 rounded-full object-cover"
              src="https://i.pravatar.cc/100?img=1"
              alt="Perfil de usuario"
            />
            <div>
              <p className="font-headline font-bold text-[#154212] leading-tight">
                ¡Buenas, marchante!
              </p>
              <p className="text-xs text-[#755b00] font-medium uppercase tracking-wider">
                Maestro Cafetalero
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link
            to="/trade"
            className="flex items-center gap-3 text-[#1d1d03] px-4 py-3 mx-2 hover:bg-[#755b00]/10 rounded-lg transition-transform duration-300 translate-x-1"
          >
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-headline text-sm font-medium">Mercado Central</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 text-[#1d1d03] px-4 py-3 mx-2 hover:bg-[#755b00]/10 rounded-lg transition-transform duration-300 translate-x-1"
          >
            <span className="material-symbols-outlined">military_tech</span>
            <span className="font-headline text-sm font-medium">Mis Logros</span>
          </Link>
          <Link
            to="/ranking"
            className="flex items-center gap-3 text-[#1d1d03] px-4 py-3 mx-2 hover:bg-[#755b00]/10 rounded-lg transition-transform duration-300 translate-x-1"
          >
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="font-headline text-sm font-medium">Ranking de Marchantes</span>
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-3 text-[#1d1d03] px-4 py-3 mx-2 hover:bg-[#755b00]/10 rounded-lg transition-transform duration-300 translate-x-1"
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-headline text-sm font-medium">Historia del Grano</span>
          </Link>
          <Link
            to="/account"
            className="flex items-center gap-3 text-[#1d1d03] px-4 py-3 mx-2 hover:bg-[#755b00]/10 rounded-lg transition-transform duration-300 translate-x-1"
          >
            <span className="material-symbols-outlined">help_center</span>
            <span className="font-headline text-sm font-medium">Ayuda</span>
          </Link>
        </nav>
        <div className="px-6 mt-auto">
          <button className="w-full py-4 bg-[#154212] text-white rounded-xl font-headline font-bold shadow-lg hover:brightness-110 transition-all">
            Explorar Tramo Nuevo
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:ml-72 min-h-screen pb-24 md:pb-12">
        
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-6 py-4 h-16 bg-[#fefccf] shadow-[0_8px_32px_rgba(29,29,3,0.08)] sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined md:hidden text-[#154212]">
              menu
            </button>
            <h2 className="font-headline font-bold tracking-tight text-[#154212] text-lg">
              NicaQuizz
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[#154212]/5 transition-colors">
              <span className="material-symbols-outlined text-[#154212]">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-[#154212]/5 transition-colors">
              <span className="material-symbols-outlined text-[#154212]">settings</span>
            </button>
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2D5A27]"
            >
              <img
                className="w-full h-full object-cover"
                src="https://i.pravatar.cc/100?img=1"
                alt="Perfil de usuario"
              />
            </Link>
          </div>
        </header>

        {/* Notification Content */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          
          {/* Header */}
          <div className="mb-10 relative">
            <div className="absolute -top-6 -left-4 w-24 h-24 bg-[#154212]/5 rounded-full blur-3xl"></div>
            <h2 className="text-4xl font-headline font-extrabold text-[#154212] tracking-tight mb-2">
              Centro de Avisos
            </h2>
            <p className="text-[#755b00] font-medium">
              Mantente al tanto de tus trueques y desafíos en el mercado.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            {FILTROS.map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroActivo(filtro)}
                className={`px-6 py-2 rounded-full font-headline font-bold text-sm shadow-md whitespace-nowrap ${
                  filtroActivo === filtro
                    ? 'bg-[#154212] text-white'
                    : 'bg-[#e6e5b9] text-[#154212] hover:bg-[#eceabe] transition-colors'
                }`}
              >
                {filtro}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {notificacionesFiltradas.map((noti) => (
              <div
                key={noti.id}
                className={`bg-white p-6 rounded-2xl shadow-[0_8px_32px_rgba(29,29,3,0.04)] ${noti.color} border-l-4 flex items-start gap-4 hover:translate-x-1 transition-transform duration-300 ${
                  noti.acciones ? 'flex-col md:flex-row' : ''
                }`}
              >
                {/* Icon */}
                <div className={`p-3 ${noti.bgIcono} rounded-xl shrink-0`}>
                  <span className={`material-symbols-outlined ${noti.colorIcono} text-3xl ${
                    noti.tipo === 'reto' || noti.tipo === 'logro' ? '' : ''
                  }`} style={{ fontVariationSettings: noti.tipo === 'logro' ? "'FILL' 1" : "'FILL' 0" }}>
                    {noti.icono}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-headline font-bold ${noti.colorIcono}`}>
                      {noti.titulo}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-[#72796e] tracking-widest">
                      {noti.tiempo}
                    </span>
                  </div>
                  <p className="text-[#42493e] text-sm leading-relaxed mb-3">
                    {noti.mensaje}
                  </p>

                  {/* Actions */}
                  {noti.acciones && (
                    <div className="flex gap-3">
                      {noti.acciones.map((accion) => (
                        <button
                          key={accion}
                          className={`px-6 py-2 rounded-lg font-headline font-bold text-xs shadow-md ${
                            accion === 'Aceptar'
                              ? 'bg-[#154212] text-white hover:brightness-110'
                              : 'bg-[#eceabe] text-[#42493e] hover:bg-[#e6e5b9]'
                          }`}
                        >
                          {accion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Single Action Link */}
                  {noti.accion && (
                    <button className="text-xs font-bold text-[#755b00] flex items-center gap-1 group">
                      {noti.accion}
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Decorative Element */}
            <div className="py-10 flex justify-center opacity-20">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-4xl text-[#154212]">eco</span>
                <span className="material-symbols-outlined text-4xl text-[#755b00]">grain</span>
                <span className="material-symbols-outlined text-4xl text-[#79001c]">local_florist</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#fefccf]/70 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.05)] md:hidden">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-[#1d1d03] p-2 active:scale-90 transition-all duration-300 ease-out"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-bold">Inicio</span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center justify-center text-[#1d1d03] p-2 active:scale-90 transition-all duration-300 ease-out"
        >
          <span className="material-symbols-outlined">quiz</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-bold">Trivias</span>
        </Link>
        <Link
          to="/shop"
          className="flex flex-col items-center justify-center text-[#1d1d03] p-2 active:scale-90 transition-all duration-300 ease-out"
        >
          <span className="material-symbols-outlined">local_mall</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-bold">Tienda</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center bg-[#154212] text-white rounded-2xl p-3 shadow-lg transform -translate-y-2 active:scale-90 transition-all duration-300 ease-out"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-bold">Perfil</span>
        </Link>
      </nav>

      {/* Background Decorative Ingredients */}
      <div className="fixed top-20 right-[-50px] rotate-12 opacity-10 pointer-events-none hidden lg:block">
        <div className="w-64 h-64 bg-[#154212]/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
