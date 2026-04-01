/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta NicaQuizz - "El Nacatamal del Conocimiento"
        nica: {
          verde: '#2D5A27',        // Verde Hoja de Plátano - Primario
          amarillo: '#F4C430',      // Amarillo Maíz - Secundario
          rojo: '#C41E3A',          // Rojo Chile - Acento
          crema: '#FFFDD0',         // Crema Suave - Fondo
          ocre: '#CC7722',          // Ocre - Historia
          azul: '#5B9BD5',          // Azul suave - Matemáticas
          turquesa: '#40B5AD',      // Turquesa - Geografía
          violeta: '#8B5FBF',       // Violeta - Ciencias
          marron: '#8B4513',        // Marrón - Tierra
          dorado: '#FFD700',        // Dorado - Premios
        },
        nicaragua: {
          blue: '#0067C6',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        'display': ['Bangers', 'Boogaloo', 'cursive'],  // Títulos - estilo lúdico
        'body': ['Roboto', 'Montserrat', 'sans-serif'],  // Cuerpo - legibilidad
      },
      boxShadow: {
        'comic': '4px 4px 0px 0px rgba(0,0,0,0.2)',    // Estilo cómic
        'comic-hover': '6px 6px 0px 0px rgba(0,0,0,0.2)',
        'soft': '0 4px 6px -1px rgba(0,0,0,0.1)',       // Neumorfismo suave
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px #F4C430, 0 0 20px #F4C430' },
          'to': { boxShadow: '0 0 20px #F4C430, 0 0 30px #F4C430' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
