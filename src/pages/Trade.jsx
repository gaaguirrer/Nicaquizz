/**
 * Trade.jsx - Mercado de Trueques de NicaQuizz
 * "Mercado de Trueques Artesanales"
 * 
 * Características:
 * - TopAppBar con buscador
 * - SideNavBar con perfil y navegación
 * - Mis Ingredientes (grid horizontal)
 * - Trueques Disponibles (cards de ofertas)
 * - Bottom CTA
 * - Mobile Navigation
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ingredientes del usuario
const MIS_INGREDIENTES = [
  { nombre: 'Masa', cantidad: 12, icono: 'bakery_dining', color: 'bg-[#2D5A27]', border: 'border-[#154212]/20' },
  { nombre: 'Cerdo', cantidad: 4, icono: 'set_meal', color: 'bg-[#fccc38]', border: 'border-[#755b00]/20' },
  { nombre: 'Arroz', cantidad: 28, icono: 'grain', color: 'bg-[#bcf0ae]', border: 'border-[#2D5A27]/20' },
  { nombre: 'Papa', cantidad: 7, icono: 'circle', color: 'bg-[#e6e5b9]', border: 'border-[#72796e]/20' },
  { nombre: 'Chile', cantidad: 2, icono: 'local_fire_department', color: 'bg-[#a40029]', border: 'border-[#79001c]/20' }
];

// Trueques disponibles
const TRUEQUES = [
  {
    id: 1,
    usuario: '@Juanchito',
    avatar: 'https://i.pravatar.cc/100?img=11',
    imagen: 'https://images.unsplash.com/photo-1589113103503-496a9d914447?auto=format&fit=crop&q=80&w=400',
    doy: { nombre: 'Masas', cantidad: 2, color: 'text-[#154212]', bg: 'bg-[#bcf0ae]/30', border: 'border-[#154212]/10' },
    busco: { nombre: 'Cerdo', cantidad: 1, color: 'text-[#755b00]', bg: 'bg-[#ffdf90]/30', border: 'border-[#755b00]/10' }
  },
  {
    id: 2,
    usuario: '@Doña_Maria',
    avatar: 'https://i.pravatar.cc/100?img=20',
    imagen: 'https://images.unsplash.com/photo-1589113103503-496a9d914447?auto=format&fit=crop&q=80&w=400',
    nuevo: true,
    doy: { nombre: 'Chiles', cantidad: 3, color: 'text-[#79001c]', bg: 'bg-[#ffdad9]/30', border: 'border-[#79001c]/10' },
    busco: { nombre: 'Arroz', cantidad: 5, color: 'text-[#154212]', bg: 'bg-[#bcf0ae]/30', border: 'border-[#154212]/10' }
  },
  {
    id: 3,
    usuario: '@Chef_Nica',
    avatar: 'https://i.pravatar.cc/100?img=12',
    imagen: 'https://images.unsplash.com/photo-1589113103503-496a9d914447?auto=format&fit=crop&q=80&w=400',
    doy: { nombre: 'Papas', cantidad: 4, color: 'text-[#1d1d03]', bg: 'bg-[#e6e5b9]/30', border: 'border-[#72796e]/10' },
    busco: { nombre: 'Masas', cantidad: 2, color: 'text-[#154212]', bg: 'bg-[#bcf0ae]/30', border: 'border-[#154212]/10' }
  }
];

export default function Trade() {
  const { currentUser } = useAuth();
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="bg-[#fefccf] text-[#1d1d03] font-body min-h-screen">
      
      {/* TopAppBar Shell */}
      <header className="bg-[#fefccf] flex justify-between items-center w-full px-6 h-16 z-50 fixed top-0 shadow-[0_8px_32px_rgba(29,29,3,0.08)] font-headline tracking-tight">
        <Link to="/" className="flex items-center gap-4">
          <span className="text-2xl font-bold italic text-[#154212]">NicaQuizz</span>
        </Link>
        <div className="flex-1 max-w-md px-8 hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">search</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f8f6c9] border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#154212]/20 text-sm"
              placeholder="Buscar trueques..."
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 text-stone-600 hover:bg-[#154212]/5 transition-colors rounded-full active:scale-95 duration-200">
            notifications
          </button>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full border-2 border-[#2D5A27] overflow-hidden bg-stone-200"
          >
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src="https://i.pravatar.cc/100?img=1"
            />
          </Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header Section with Asymmetry */}
          <section className="relative">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-headline font-extrabold text-[#154212] mb-4 tracking-tight leading-tight">
                Mercado de <br/>
                <span className="text-[#755b00] italic">Trueques Artesanales</span>
              </h1>
              <p className="text-[#42493e] text-lg">
                Cambia tus ingredientes sobrantes y completa tus recetas para el gran banquete de NicaQuizz.
              </p>
            </div>
            {/* Decorative element breaking the grid */}
            <div className="absolute -top-10 -right-4 opacity-20 pointer-events-none hidden lg:block">
              <span className="material-symbols-outlined text-[120px] text-[#154212] rotate-12">potted_plant</span>
            </div>
          </section>

          {/* Mis Ingredientes - Horizontal Scrollable Bento Style */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold text-[#1d1d03] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#154212]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                Mis Ingredientes
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-[#72796e]">Actualizado ahora</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {MIS_INGREDIENTES.map((ing) => (
                <div
                  key={ing.nombre}
                  className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-[#f2f0c4] transition-colors border-b-4 {ing.border}"
                >
                  <div className={`w-16 h-16 ${ing.color} rounded-full flex items-center justify-center mb-3`}>
                    <span className="material-symbols-outlined text-white text-3xl">{ing.icono}</span>
                  </div>
                  <span className="text-xs font-bold text-[#72796e] uppercase">{ing.nombre}</span>
                  <span className="text-3xl font-headline font-black text-[#154212]">{String(ing.cantidad).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Trueques Disponibles Grid */}
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-headline font-bold text-[#1d1d03]">Trueques Disponibles</h2>
                <p className="text-[#42493e] text-sm">Oportunidades de intercambio en tu vecindad</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#eceabe] px-4 py-2 rounded-full text-sm font-bold text-[#154212] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filtrar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRUEQUES.map((trueque) => (
                <div
                  key={trueque.id}
                  className="bg-[#fefccf] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(29,29,3,0.08)] group hover:-translate-y-1 transition-transform border-2 border-transparent hover:border-[#755b00]/20"
                >
                  {/* Image Header */}
                  <div className="h-32 bg-stone-200 relative">
                    <img
                      className="w-full h-full object-cover opacity-80"
                      src={trueque.imagen}
                      alt={`Trueque de ${trueque.usuario}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fefccf] via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src={trueque.avatar}
                          alt={`Avatar de ${trueque.usuario}`}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#1d1d03]">{trueque.usuario}</span>
                      {trueque.nuevo && (
                        <span className="bg-[#fccc38] px-2 py-0.5 rounded text-[10px] text-[#1d1d03] font-black">
                          NUEVO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trade Details */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center flex-1">
                        <p className={`text-xs uppercase font-black ${trueque.doy.color}/60 mb-1`}>Doy</p>
                        <div className={`${trueque.doy.bg} rounded-xl py-3 border ${trueque.doy.border}`}>
                          <p className={`text-xl font-black ${trueque.doy.color}`}>
                            {trueque.doy.cantidad} {trueque.doy.nombre}
                          </p>
                        </div>
                      </div>
                      <div className="px-4">
                        <span className="material-symbols-outlined text-[#755b00]">sync_alt</span>
                      </div>
                      <div className="text-center flex-1">
                        <p className={`text-xs uppercase font-black ${trueque.busco.color}/60 mb-1`}>Busco</p>
                        <div className={`${trueque.busco.bg} rounded-xl py-3 border ${trueque.busco.border}`}>
                          <p className={`text-xl font-black ${trueque.busco.color}`}>
                            {trueque.busco.cantidad} {trueque.busco.nombre}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-4 bg-[#154212] text-white rounded-xl font-black uppercase tracking-wider text-sm hover:shadow-lg transition-all active:scale-95">
                      Aceptar Trueque
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA / Floating Section */}
          <section className="bg-[#2D5A27] p-8 rounded-3xl relative overflow-hidden text-white">
            <div className="relative z-10 md:flex items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-3xl font-headline font-extrabold mb-2 text-[#bcf0ae]">
                  ¿No encuentras lo que buscas?
                </h3>
                <p className="text-white/90 opacity-90 max-w-lg">
                  Crea tu propia oferta y espera a que otros comerciantes acepten tu propuesta de intercambio.
                </p>
              </div>
              <button className="px-8 py-4 bg-[#fccc38] text-[#1d1d03] rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl hover:scale-105 transition-transform active:scale-95">
                <span className="material-symbols-outlined">post_add</span>
                CREAR MI OFERTA
              </button>
            </div>
            {/* Abstract visual element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </section>
        </div>
      </main>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fefccf] shadow-[0_-8px_32px_rgba(29,29,3,0.08)] flex justify-around items-center h-16 z-50 px-4">
        <Link
          to="/trade"
          className="flex flex-col items-center gap-1 text-[#154212] border-b-2 border-[#154212]"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <span className="text-[10px] font-bold">Mercado</span>
        </Link>
        <Link
          to="/friends"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-medium">Amigos</span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">military_tech</span>
          <span className="text-[10px] font-medium">Desafíos</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center gap-1 text-stone-600"
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
