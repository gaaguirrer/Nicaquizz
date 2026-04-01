/**
 * ChallengeResult.jsx - Resultados del Duelo de NicaQuizz
 * "¡Duelo Finalizado!"
 * 
 * Características:
 * - Result Header con badge y título
 * - Bento Grid Results (Comparison Card + Rewards Card)
 * - Score Visualizer con barra de progreso
 * - Action Buttons (Revancha, Volver)
 * - Fun Fact Section
 * - BottomNavBar para móvil
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChallengeResult() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Datos simulados del resultado
  const resultado = {
    ganaste: true,
    tuPuntuacion: 9,
    totalPreguntas: 10,
    rival: {
      nombre: 'Rafaela G.',
      avatar: 'https://i.pravatar.cc/100?img=20',
      puntuacion: 7
    },
    recompensas: {
      chiles: 2,
      xp: 150,
      xpProgreso: 65
    }
  };

  // Fun facts aleatorios
  const funFacts = [
    {
      titulo: 'Sabías que...',
      texto: "El Nacatamal, rey de nuestra gastronomía, tiene sus raíces en la palabra náhuatl 'nacatl' (carne) y 'tamalli' (tamal). ¡Tu victoria hoy te hace un verdadero Maestro de la Masa!"
    },
    {
      titulo: 'Dato Curioso',
      texto: 'El Vigorón se sirve tradicionalmente en hoja de chagüite, una planta que le da ese sabor único que solo los nicaragüenses conocemos.'
    },
    {
      titulo: '¿Lo Sabías?',
      texto: 'La Chicha Bruja es una bebida fermentada de maíz que se ha preparado en Nicaragua desde tiempos precolombinos. ¡Es parte de nuestra identidad!'
    }
  ];

  const funFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  async function handleRevancha() {
    console.log('Solicitando revancha...');
    navigate('/challenge');
  }

  return (
    <div className="min-h-screen bg-[#fefccf] text-[#1d1d03] font-body overflow-x-hidden">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#fefccf] shadow-[0_8px_32px_rgba(29,29,3,0.08)]">
        <Link to="/" className="flex items-center gap-4">
          <span className="text-2xl font-bold text-[#154212] font-headline tracking-tight">
            NicaQuizz
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/friends" className="text-[#154212]/70 font-headline tracking-tight hover:bg-[#154212]/5 transition-colors">
            Desafíos
          </Link>
          <Link to="/friends" className="text-[#154212] font-bold border-b-2 border-[#154212] pb-1 font-headline tracking-tight">
            Amigos
          </Link>
          <Link to="/profile" className="text-[#154212]/70 font-headline tracking-tight hover:bg-[#154212]/5 transition-colors">
            Logros
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#f8f6c9] px-4 py-2 rounded-full border border-[#c2c9bb]/20">
            <span className="material-symbols-outlined text-[#154212] mr-2">search</span>
            <input
              type="text"
              placeholder="Buscar amigos..."
              className="bg-transparent border-none focus:ring-0 text-sm w-32 text-[#154212]"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-[#154212]/5 transition-colors">
            <span className="material-symbols-outlined text-[#154212]">notifications</span>
          </button>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full border-2 border-[#2D5A27] overflow-hidden shadow-sm"
          >
            <img
              alt="Perfil del usuario"
              className="w-full h-full object-cover"
              src="https://i.pravatar.cc/100?img=1"
            />
          </Link>
        </div>
      </header>

      <main className="relative pt-24 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 opacity-5 pointer-events-none -z-10">
          <div className="absolute top-40 -left-20 w-64 h-64 bg-[#154212]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-[#755b00]/10 rounded-full blur-3xl"></div>
        </div>

        {/* Result Header */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ffdf90] text-[#1d1d03] px-6 py-2 rounded-full mb-6 shadow-sm">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <span className="font-headline font-bold uppercase tracking-widest text-sm">
              ¡Duelo Finalizado!
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold text-[#154212] tracking-tighter mb-4">
            {resultado.ganaste ? '¡Ganaste el Duelo!' : '¡Mejor suerte la próxima!'}
          </h1>
          <p className="text-[#1d1d03]/70 max-w-lg mx-auto text-lg">
            {resultado.ganaste
              ? 'Tu conocimiento sobre el vigorón y la chicha bruja ha superado a tu oponente. ¡Sigue así!'
              : 'Tu rival fue más rápido esta vez. ¡Practica y vuelve a intentarlo!'}
          </p>
        </section>

        {/* Bento Grid Results */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full mb-12">
          
          {/* Comparison Card */}
          <div className="md:col-span-8 bg-white rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(29,29,3,0.08)] flex flex-col justify-between overflow-hidden relative">
            <div className="flex justify-between items-end mb-8 relative z-10">
              {/* Tú */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full border-4 ${
                    resultado.ganaste ? 'border-[#154212]' : 'border-[#72796e]'
                  } p-1`}>
                    <img
                      alt="Tú"
                      className="w-full h-full object-cover rounded-full"
                      src="https://i.pravatar.cc/100?img=1"
                    />
                  </div>
                  {resultado.ganaste && (
                    <div className="absolute -bottom-2 -right-2 bg-[#154212] text-white p-1 rounded-full border-2 border-white">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="font-headline font-bold text-[#154212] text-xl">Tú</span>
                  <div className="text-4xl font-extrabold text-[#154212]">
                    {resultado.tuPuntuacion}
                    <span className="text-xl text-[#154212]/40">/{resultado.totalPreguntas}</span>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center pb-8">
                <span className="font-headline font-black text-6xl text-[#c2c9bb]/30 italic">VS</span>
              </div>

              {/* Oponente */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#72796e] p-1">
                  <img
                    alt="Oponente"
                    className="w-full h-full object-cover rounded-full"
                    src={resultado.rival.avatar}
                  />
                </div>
                <div className="text-center">
                  <span className="font-headline font-bold text-[#1d1d03]/60 text-xl">
                    {resultado.rival.nombre}
                  </span>
                  <div className="text-4xl font-extrabold text-[#1d1d03]/60">
                    {resultado.rival.puntuacion}
                    <span className="text-xl text-[#1d1d03]/30">/{resultado.totalPreguntas}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Visualizer */}
            <div className="h-4 w-full bg-[#f8f6c9] rounded-full flex overflow-hidden">
              <div
                className={`h-full ${resultado.ganaste ? 'bg-[#154212]' : 'bg-[#72796e]'}`}
                style={{ width: `${(resultado.tuPuntuacion / resultado.totalPreguntas) * 100}%` }}
              ></div>
              <div
                className="h-full bg-[#755b00]"
                style={{ width: `${(resultado.rival.puntuacion / resultado.totalPreguntas) * 100}%` }}
              ></div>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 opacity-10 w-64 pointer-events-none">
              <div className="w-full h-full bg-[#154212] rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="md:col-span-4 bg-[#2D5A27] rounded-[2rem] p-8 text-white shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="material-symbols-outlined text-6xl">stars</span>
            </div>
            <h3 className="font-headline font-bold text-xl mb-6 text-white/80 uppercase tracking-widest">
              Botín del Duelo
            </h3>
            <div className="flex gap-4 mb-8">
              {/* Chile Ingredient */}
              <div className="group relative">
                <div className="w-20 h-20 bg-[#a40029] rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    nutrition
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 bg-[#fccc38] text-[#1d1d03] w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-[#2D5A27]">
                  x{resultado.recompensas.chiles}
                </div>
                <p className="mt-2 font-headline font-bold text-sm">Chiles</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80">Experiencia</span>
                <span className="font-bold text-[#fccc38]">+{resultado.recompensas.xp} XP</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#fccc38]"
                  style={{ width: `${resultado.recompensas.xpProgreso}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl mb-16">
          <button
            onClick={handleRevancha}
            className="flex-1 bg-[#fccc38] hover:bg-[#f0c12c] text-[#1d1d03] py-5 px-8 rounded-2xl font-headline font-bold text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg group"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">
              replay
            </span>
            Revancha
          </button>
          <Link
            to="/"
            className="flex-1 bg-[#eceabe] hover:bg-[#e6e5b9] text-[#154212] py-5 px-8 rounded-2xl font-headline font-bold text-xl flex items-center justify-center gap-3 transition-all active:scale-95 border border-[#c2c9bb]/30"
          >
            <span className="material-symbols-outlined">home</span>
            Volver al Inicio
          </Link>
        </div>

        {/* Fun Fact Section */}
        <div className="mt-16 bg-[#f8f6c9] rounded-3xl p-8 max-w-3xl w-full flex gap-6 items-start">
          <div className="bg-[#755b00]/10 p-4 rounded-2xl">
            <span className="material-symbols-outlined text-[#755b00] text-3xl">lightbulb</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-[#154212] mb-2 text-lg">
              {funFact.titulo}
            </h4>
            <p className="text-[#1d1d03]/70 leading-relaxed italic">
              {funFact.texto}
            </p>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#fefccf]/70 backdrop-blur-xl shadow-[0_-4px_20px_rgba(29,29,3,0.05)] rounded-t-3xl">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-colors"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Inicio
          </span>
        </Link>
        <Link
          to="/challenge"
          className="flex flex-col items-center justify-center bg-[#154212] text-[#fefccf] rounded-2xl px-5 py-2 scale-110"
        >
          <span className="material-symbols-outlined">swords</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Duelo
          </span>
        </Link>
        <Link
          to="/shop"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-colors"
        >
          <span className="material-symbols-outlined">local_mall</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Mercado
          </span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center text-[#154212]/60 px-5 py-2 hover:text-[#154212] transition-colors"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-headline text-[10px] font-semibold uppercase tracking-wider mt-1">
            Perfil
          </span>
        </Link>
      </nav>
    </div>
  );
}
