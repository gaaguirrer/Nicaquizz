/**
 * Constantes de Categorías del Juego
 * 
 * Define las categorías de preguntas y su configuración visual.
 */

import { INGREDIENTES, type Ingrediente } from './ingredients';

export const CATEGORIAS = {
  HISTORIA: 'historia',
  MATEMATICAS: 'matematicas',
  GEOGRAFIA: 'geografia',
  CIENCIAS: 'ciencias',
  RETOS: 'retos'
} as const;

export type Categoria = typeof CATEGORIAS[keyof typeof CATEGORIAS];

export const CATEGORIA_INGREDIENTE: Record<Categoria, Ingrediente> = {
  [CATEGORIAS.HISTORIA]: INGREDIENTES.MASA,
  [CATEGORIAS.MATEMATICAS]: INGREDIENTES.CERDO,
  [CATEGORIAS.GEOGRAFIA]: INGREDIENTES.ARROZ,
  [CATEGORIAS.CIENCIAS]: INGREDIENTES.PAPA,
  [CATEGORIAS.RETOS]: INGREDIENTES.ACHIOTE
};

export const CATEGORIAS_CONFIG = {
  [CATEGORIAS.HISTORIA]: {
    nombre: 'Historia',
    subtitulo: 'Nuestras Raíces',
    icono: 'history_edu',
    color: '#2D5A27',
    colorClaro: 'rgba(45, 90, 39, 0.05)',
    borde: 'rgba(45, 90, 39, 0.2)'
  },
  [CATEGORIAS.MATEMATICAS]: {
    nombre: 'Matemáticas',
    subtitulo: 'Cuentas Claras',
    icono: 'calculate',
    color: '#C41E3A',
    colorClaro: 'rgba(196, 30, 58, 0.05)',
    borde: 'rgba(196, 30, 58, 0.2)'
  },
  [CATEGORIAS.GEOGRAFIA]: {
    nombre: 'Geografía',
    subtitulo: 'Tierras Fértiles',
    icono: 'public',
    color: '#154212',
    colorClaro: 'rgba(21, 66, 18, 0.05)',
    borde: 'rgba(21, 66, 18, 0.2)'
  },
  [CATEGORIAS.CIENCIAS]: {
    nombre: 'Ciencias',
    subtitulo: 'Biodiversidad',
    icono: 'science',
    color: '#8B5FBF',
    colorClaro: 'rgba(139, 95, 191, 0.05)',
    borde: 'rgba(139, 95, 191, 0.2)'
  },
  [CATEGORIAS.RETOS]: {
    nombre: 'Retos',
    subtitulo: 'Desafío Diario',
    icono: 'emoji_events',
    color: '#D9531E',
    colorClaro: 'rgba(217, 83, 30, 0.05)',
    borde: 'rgba(217, 83, 30, 0.2)'
  }
};

export function getCategoriaConfig(categoriaId: string) {
  return CATEGORIAS_CONFIG[categoriaId as Categoria] || CATEGORIAS_CONFIG.HISTORIA;
}

export function getCategoriaIngrediente(categoriaId: string): Ingrediente {
  return CATEGORIA_INGREDIENTE[categoriaId as Categoria] || INGREDIENTES.MASA;
}
