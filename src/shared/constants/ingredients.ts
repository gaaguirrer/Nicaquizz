/**
 * Constantes de Ingredientes del Nacatamal
 * 
 * Define las monedas del juego basadas en los ingredientes del nacatamal nicaragüense.
 */

export const INGREDIENTES = {
  MASA: 'masa',
  CERDO: 'cerdo',
  ARROZ: 'arroz',
  PAPA: 'papa',
  CHILE: 'chile',
  ACHIOTE: 'achiote'
} as const;

export type Ingrediente = typeof INGREDIENTES[keyof typeof INGREDIENTES];

export const INGREDIENTE_NAMES: Record<Ingrediente, string> = {
  [INGREDIENTES.MASA]: 'Masa de Maíz',
  [INGREDIENTES.CERDO]: 'Carne de Cerdo',
  [INGREDIENTES.ARROZ]: 'Arroz',
  [INGREDIENTES.PAPA]: 'Papa',
  [INGREDIENTES.CHILE]: 'Chile',
  [INGREDIENTES.ACHIOTE]: 'Achiote'
};

export const INGREDIENTES_BASE: Ingrediente[] = [
  INGREDIENTES.MASA,
  INGREDIENTES.CERDO,
  INGREDIENTES.ARROZ,
  INGREDIENTES.PAPA,
  INGREDIENTES.CHILE
];

export const INGREDIENTES_CONFIG = {
  [INGREDIENTES.MASA]: {
    nombre: 'Masa de Maíz',
    icono: 'bakery_dining',
    color: '#F4C430',
    descripcion: 'Base fundamental del nacatamal'
  },
  [INGREDIENTES.CERDO]: {
    nombre: 'Carne de Cerdo',
    icono: 'lunch_dining',
    color: '#C41E3A',
    descripcion: 'Proteína principal del plato'
  },
  [INGREDIENTES.ARROZ]: {
    nombre: 'Arroz',
    icono: 'grain',
    color: '#154212',
    descripcion: 'Acompañante esencial'
  },
  [INGREDIENTES.PAPA]: {
    nombre: 'Papa',
    icono: 'egg',
    color: '#8B5FBF',
    descripcion: 'Tubérculo de la tierra nicaragüense'
  },
  [INGREDIENTES.CHILE]: {
    nombre: 'Chile',
    icono: 'local_fire_department',
    color: '#D9531E',
    descripcion: 'El toque picante tradicional'
  },
  [INGREDIENTES.ACHIOTE]: {
    nombre: 'Achiote',
    icono: 'auto_awesome',
    color: '#FF6B35',
    descripcion: 'Ingrediente especial de retos diarios'
  }
};
