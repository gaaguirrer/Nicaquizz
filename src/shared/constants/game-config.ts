/**
 * Configuración General del Juego
 * 
 * Constantes y configuraciones globales del juego.
 */

export const GAME_CONFIG = {
  // Niveles y títulos
  LEVELS: {
    QUESTIONS_PER_LEVEL: 10,
    MAX_LEVEL: 50,
    TITLES: {
      APPRENTICE: 'Aprendiz',
    CHEF: 'Chef Experto',
    MASTER: 'Maestro Cocinero',
    SUPREME: 'Maestro Supremo'
    }
  },

  // Reto diario
  DAILY_CHALLENGE: {
    TOTAL_QUESTIONS: 10,
    REWARD_INGREDIENT: 'achiote',
    RESET_HOUR: 0 // Hora de reseteo (UTC)
  },

  // Retos entre jugadores
  CHALLENGE: {
    MAX_PENDING_CHALLENGES: 10,
    CHALLENGE_TIMEOUT_MINUTES: 30
  },

  // Tienda
  SHOP: {
    PRICE_ADJUSTMENT_RATE: 0.1, // 10% por compra
    MIN_PRICE_MULTIPLIER: 0.75, // 75% del precio base
    MAX_DISCOUNT: 0.25 // 25% máximo descuento
  },

  // Estadísticas
  STATS: {
    ACCURACY_DECIMALS: 2,
    RANKING_LIMIT: 100
  }
} as const;

export function getTituloNivel(nivel: number): string {
  const { TITLES } = GAME_CONFIG.LEVELS;
  
  if (nivel >= 50) return TITLES.SUPREME;
  if (nivel >= 20) return TITLES.MASTER;
  if (nivel >= 10) return TITLES.CHEF;
  return TITLES.APPRENTICE;
}

export function calcularNivel(totalQuestionsAnswered: number): number {
  return Math.floor(totalQuestionsAnswered / GAME_CONFIG.LEVELS.QUESTIONS_PER_LEVEL) + 1;
}
