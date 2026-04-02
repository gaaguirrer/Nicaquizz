/**
 * TopNavBar.jsx - Navegación Superior
 * 
 * Barra de navegación en todas las páginas.
 * Muestra logo, menú, notificaciones y botón de cuenta.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function TopNavBar({ 
  currentPage = 'home', 
  showNacatamales = false, 
  nacatamalesCount = 0 
}) {
  const { currentUser } = useAuth();

  const isActive = (page) => currentPage === page;

  return (
    <nav className="bg-[#fefccf] border-b-2 border-[#154212]/10 sticky top-0 z-50 shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
      <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
        {/* Logo con Bandera */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-4xl group-hover:scale-110 transition-transform">🇳🇮</span>
          <div>
            <h1 className="text-2xl font-headline font-black text-[#154212] uppercase tracking-tight">
              NicaQuizz
            </h1>
            <p className="text-[10px] text-[#154212]/60 font-medium">
              El Nacatamal del Conocimiento
            </p>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <div className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
          <Link 
            to="/categories" 
            className={`transition-colors ${
              isActive('categories') 
                ? 'text-[#154212] border-b-4 border-[#154212] pb-1' 
                : 'text-[#154212]/70 hover:text-[#154212]'
            }`}
          >
            Categorías
          </Link>
          <Link 
            to="/ranking" 
            className={`transition-colors ${
              isActive('ranking') 
                ? 'text-[#154212] border-b-4 border-[#154212] pb-1' 
                : 'text-[#154212]/70 hover:text-[#154212]'
            }`}
          >
            Ranking
          </Link>
          <Link 
            to="/shop" 
            className={`transition-colors ${
              isActive('shop') 
                ? 'text-[#154212] border-b-4 border-[#154212] pb-1' 
                : 'text-[#154212]/70 hover:text-[#154212]'
            }`}
          >
            Tienda
          </Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          {/* Notificaciones - Solo si está logueado */}
          {currentUser && (
            <NotificationCenter userId={currentUser.uid} />
          )}

          {/* Contador de Nacatamales (opcional) */}
          {showNacatamales && (
            <div className="hidden lg:flex items-center gap-2 bg-[#fccc38] text-[#1d1d03] px-4 py-2 rounded-full font-bold shadow-sm">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bakery_dining</span>
              <span>{nacatamalesCount.toLocaleString()}</span>
            </div>
          )}

          {/* Botón de Cuenta */}
          {currentUser ? (
            <Link
              to="/play"
              className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              <span className="font-bold">Mi Cuenta</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-3 bg-[#2D5A27] text-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#1e3d1a] transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
              <span className="font-bold">Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
