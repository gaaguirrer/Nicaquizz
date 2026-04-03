/**
 * Departamentos de Nicaragua
 *
 * Lista oficial de los 16 departamentos y regiones autonomas
 * utilizados en NicaQuizz para registro, perfil y mapa de conquista.
 */

export const DEPARTAMENTOS = [
  { id: 'boaco', nombre: 'Boaco', capital: 'Boaco', region: 'Central' },
  { id: 'carazo', nombre: 'Carazo', capital: 'Jinotepe', region: 'Pacifico' },
  { id: 'chinandega', nombre: 'Chinandega', capital: 'Chinandega', region: 'Pacifico' },
  { id: 'chontales', nombre: 'Chontales', capital: 'Juigalpa', region: 'Central' },
  { id: 'esteli', nombre: 'Esteli', capital: 'Esteli', region: 'Norte' },
  { id: 'granada', nombre: 'Granada', capital: 'Granada', region: 'Pacifico' },
  { id: 'leon', nombre: 'Leon', capital: 'Leon', region: 'Pacifico' },
  { id: 'madriz', nombre: 'Madriz', capital: 'Somoto', region: 'Norte' },
  { id: 'managua', nombre: 'Managua', capital: 'Managua', region: 'Pacifico' },
  { id: 'masaya', nombre: 'Masaya', capital: 'Masaya', region: 'Pacifico' },
  { id: 'matagalpa', nombre: 'Matagalpa', capital: 'Matagalpa', region: 'Norte' },
  { id: 'nueva-segovia', nombre: 'Nueva Segovia', capital: 'Ocotal', region: 'Norte' },
  { id: 'rivas', nombre: 'Rivas', capital: 'Rivas', region: 'Pacifico' },
  { id: 'rio-san-juan', nombre: 'Rio San Juan', capital: 'San Carlos', region: 'Sur' },
  { id: 'raan', nombre: 'RAAN', capital: 'Bilwi', region: 'Caribe' },
  { id: 'raas', nombre: 'RAAS', capital: 'Bluefields', region: 'Caribe' }
];

export const REGIONES = ['Pacifico', 'Central', 'Norte', 'Sur', 'Caribe'];

export function getDepartamentoById(id) {
  return DEPARTAMENTOS.find(d => d.id === id) || null;
}

export function getDepartamentosByRegion(region) {
  return DEPARTAMENTOS.filter(d => d.region === region);
}

export function getDepartamentoOptions() {
  return DEPARTAMENTOS.map(d => ({
    value: d.id,
    label: d.nombre
  }));
}
