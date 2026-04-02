/**
 * Constantes de la Tienda y Items
 * 
 * Define tipos de items, mejoras y trabas del juego.
 */

export const ITEM_TYPES = {
  MEJORA: 'mejora',
  TRABA: 'traba'
} as const;

export type ItemTipo = typeof ITEM_TYPES[keyof typeof ITEM_TYPES];

export const MEJORAS = {
  RELOJ_ARENA: 'reloj_arena',
  COMODIN: 'comodin',
  PASE: 'pase'
} as const;

export type MejoraType = typeof MEJORAS[keyof typeof MEJORAS];

export const TRABAS = {
  RELOJ_RAPIDO: 'reloj_rapido',
  PREGUNTA_DIFICIL: 'pregunta_dificil',
  SIN_PISTAS: 'sin_pistas',
  CONTROLES_INVERTIDOS: 'controles_invertidos'
} as const;

export type TrabaType = typeof TRABAS[keyof typeof TRABAS];

export const MEJORAS_CONFIG = {
  [MEJORAS.RELOJ_ARENA]: {
    nombre: 'Reloj de Arena',
    descripcion: 'Duplica el tiempo disponible',
    icono: 'hourglass_top',
    color: '#2D5A27'
  },
  [MEJORAS.COMODIN]: {
    nombre: 'Comodín',
    descripcion: 'Elimina opciones incorrectas',
    icono: 'help_outline',
    color: '#F4C430'
  },
  [MEJORAS.PASE]: {
    nombre: 'Pase',
    descripcion: 'Salta la pregunta actual',
    icono: 'skip_next',
    color: '#154212'
  }
};

export const TRABAS_CONFIG = {
  [TRABAS.RELOJ_RAPIDO]: {
    nombre: 'Reloj Rápido',
    descripcion: 'Reduce el tiempo del oponente a la mitad',
    icono: 'timer_off',
    color: '#C41E3A'
  },
  [TRABAS.PREGUNTA_DIFICIL]: {
    nombre: 'Pregunta Difícil',
    descripcion: 'Agrega una pregunta difícil al oponente',
    icono: 'psychology',
    color: '#8B5FBF'
  },
  [TRABAS.SIN_PISTAS]: {
    nombre: 'Sin Pistas',
    descripcion: 'Elimina las pistas del oponente',
    icono: 'lightbulb_off',
    color: '#D9531E'
  },
  [TRABAS.CONTROLES_INVERTIDOS]: {
    nombre: 'Controles Invertidos',
    descripcion: 'Invierte los controles del oponente',
    icono: 'swap_horiz',
    color: '#42493e'
  }
};
