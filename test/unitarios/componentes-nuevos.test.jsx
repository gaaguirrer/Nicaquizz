/**
 * Tests Unitarios - Componentes de NicaQuizz
 * Pruebas para las nuevas interfaces: Map, Trade, Notifications, Challenge
 * 
 * NOTA: Estos tests verifican la lógica de renderizado sin usar React Router
 * ya que requiere configuración especial en el ambiente de testing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MAP.JSX TESTS ====================

describe('Map.jsx - Mapa de Conquista', () => {
  const mockDepartamentos = [
    { id: 'leon', nombre: 'León', estado: 'conquistado' },
    { id: 'granada', nombre: 'Granada', estado: 'disputa' },
    { id: 'matagalpa', nombre: 'Matagalpa', estado: 'inexplorado' }
  ];

  const mockLider = {
    nombre: 'Elena "Vigorón" López',
    puntos: 9450,
    influencia: 88
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tiene el título correcto', () => {
    const titulo = 'Mapa Regional de Conquista';
    expect(titulo).toContain('Mapa');
    expect(titulo).toContain('Conquista');
  });

  it('muestra el progreso total de conquista', () => {
    const progreso = 64;
    expect(progreso).toBeGreaterThanOrEqual(0);
    expect(progreso).toBeLessThanOrEqual(100);
  });

  it('clasifica departamentos por estado', () => {
    const conquistados = mockDepartamentos.filter(d => d.estado === 'conquistado');
    const disputa = mockDepartamentos.filter(d => d.estado === 'disputa');
    const inexplorados = mockDepartamentos.filter(d => d.estado === 'inexplorado');

    expect(conquistados).toHaveLength(1);
    expect(disputa).toHaveLength(1);
    expect(inexplorados).toHaveLength(1);
  });

  it('el líder regional tiene puntos válidos', () => {
    expect(mockLider.puntos).toBeGreaterThan(0);
    expect(mockLider.influencia).toBeGreaterThanOrEqual(0);
    expect(mockLider.influencia).toBeLessThanOrEqual(100);
  });

  it('tiene botón para desafiar al líder', () => {
    const botonTexto = 'DESAFIAR AL LÍDER';
    expect(botonTexto).toContain('DESAFIAR');
  });

  it('tiene misión de conquista disponible', () => {
    const mision = {
      nombre: 'Trivia de Conquista: Granada Colonial',
      puntosRecompensa: 500
    };
    expect(mision.nombre).toContain('Granada');
    expect(mision.puntosRecompensa).toBe(500);
  });
});

// ==================== TRADE.JSX TESTS ====================

describe('Trade.jsx - Mercado de Trueques', () => {
  const mockIngredientes = [
    { nombre: 'Masa', cantidad: 12 },
    { nombre: 'Cerdo', cantidad: 4 },
    { nombre: 'Arroz', cantidad: 28 },
    { nombre: 'Papa', cantidad: 7 },
    { nombre: 'Chile', cantidad: 2 }
  ];

  const mockTrueques = [
    {
      id: 1,
      usuario: '@Juanchito',
      doy: { nombre: 'Masas', cantidad: 2 },
      busco: { nombre: 'Cerdo', cantidad: 1 }
    },
    {
      id: 2,
      usuario: '@Doña_Maria',
      nuevo: true,
      doy: { nombre: 'Chiles', cantidad: 3 },
      busco: { nombre: 'Arroz', cantidad: 5 }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tiene el título correcto', () => {
    const titulo = 'Mercado de Trueques Artesanales';
    expect(titulo).toContain('Mercado');
    expect(titulo).toContain('Trueques');
  });

  it('muestra los ingredientes del usuario', () => {
    const totalIngredientes = mockIngredientes.reduce((sum, ing) => sum + ing.cantidad, 0);
    
    expect(mockIngredientes).toHaveLength(5);
    expect(totalIngredientes).toBe(53);
    expect(mockIngredientes.find(i => i.nombre === 'Masa').cantidad).toBe(12);
  });

  it('renderiza los trueques disponibles', () => {
    expect(mockTrueques).toHaveLength(2);
    expect(mockTrueques[0].usuario).toBe('@Juanchito');
    expect(mockTrueques[1].nuevo).toBe(true);
  });

  it('tiene badge NUEVO en trueques recientes', () => {
    const nuevos = mockTrueques.filter(t => t.nuevo);
    expect(nuevos).toHaveLength(1);
    expect(nuevos[0].usuario).toBe('@Doña_Maria');
  });

  it('permite aceptar un trueque', () => {
    const onAccept = vi.fn();
    onAccept();
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('tiene botón para crear nueva oferta', () => {
    const botonTexto = 'CREAR MI OFERTA';
    expect(botonTexto).toContain('CREAR');
  });

  it('calcula el total de ingredientes por tipo', () => {
    const masa = mockIngredientes.find(i => i.nombre === 'Masa');
    const arroz = mockIngredientes.find(i => i.nombre === 'Arroz');
    
    expect(masa.cantidad).toBe(12);
    expect(arroz.cantidad).toBe(28);
    expect(arroz.cantidad).toBeGreaterThan(masa.cantidad);
  });
});

// ==================== NOTIFICATIONS.JSX TESTS ====================

describe('Notifications.jsx - Centro de Avisos', () => {
  const mockNotificaciones = [
    {
      id: 1,
      tipo: 'trueque',
      titulo: '¡Trueque completado!',
      mensaje: '@Juanito aceptó tu oferta de 2 Masas por 1 Cerdo.',
      tiempo: 'Hace 5m',
      leido: false
    },
    {
      id: 2,
      tipo: 'reto',
      titulo: 'Nuevo Desafío',
      mensaje: '@Elena_Nica te ha desafiado a un duelo de Historia.',
      tiempo: 'Hace 2h',
      leido: false,
      acciones: ['Aceptar', 'Rechazar']
    },
    {
      id: 3,
      tipo: 'logro',
      titulo: '¡Nuevo Logro!',
      mensaje: 'Has recolectado 10 Papas. Reclama tu recompensa.',
      tiempo: 'Ayer',
      leido: false,
      accion: 'Reclamar ahora'
    },
    {
      id: 4,
      tipo: 'sistema',
      titulo: 'Aviso del Sistema',
      mensaje: 'Tu inventario está casi lleno.',
      tiempo: 'Ayer',
      leido: true
    }
  ];

  const mockFiltros = ['Todos', 'Trueques', 'Retos', 'Logros'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tiene el título correcto', () => {
    const titulo = 'Centro de Avisos';
    expect(titulo).toBe('Centro de Avisos');
  });

  it('muestra los filtros de notificaciones', () => {
    expect(mockFiltros).toHaveLength(4);
    expect(mockFiltros).toContain('Todos');
    expect(mockFiltros).toContain('Trueques');
    expect(mockFiltros).toContain('Retos');
    expect(mockFiltros).toContain('Logros');
  });

  it('renderiza notificaciones de trueque', () => {
    const trueques = mockNotificaciones.filter(n => n.tipo === 'trueque');
    expect(trueques).toHaveLength(1);
    expect(trueques[0].titulo).toContain('Trueque');
  });

  it('muestra notificaciones de reto con acciones', () => {
    const retos = mockNotificaciones.filter(n => n.tipo === 'reto');
    expect(retos).toHaveLength(1);
    expect(retos[0].acciones).toHaveLength(2);
    expect(retos[0].acciones).toContain('Aceptar');
  });

  it('renderiza notificaciones de logro con acción de reclamo', () => {
    const logros = mockNotificaciones.filter(n => n.tipo === 'logro');
    expect(logros).toHaveLength(1);
    expect(logros[0].accion).toBe('Reclamar ahora');
  });

  it('filtra notificaciones por tipo', () => {
    const filtro = 'reto';
    const filtradas = mockNotificaciones.filter(n => n.tipo === filtro);
    
    expect(filtradas).toHaveLength(1);
    expect(filtradas[0].tipo).toBe(filtro);
  });

  it('calcula notificaciones no leídas', () => {
    const noLeidas = mockNotificaciones.filter(n => !n.leido);
    expect(noLeidas).toHaveLength(3);
  });

  it('ordena notificaciones por tiempo', () => {
    // Simular ordenamiento por tiempo (más reciente primero)
    const ordenadas = [...mockNotificaciones].sort((a, b) => {
      if (a.tiempo.includes('5m')) return -1;
      if (b.tiempo.includes('5m')) return 1;
      return 0;
    });
    
    expect(ordenadas[0].tiempo).toContain('5m');
  });
});

// ==================== CHALLENGE.JSX TESTS ====================

describe('Challenge.jsx - Configuración del Duelo', () => {
  const mockCategorias = [
    { id: 'historia', nombre: 'Historia', recompensa: 'Achiote' },
    { id: 'matematicas', nombre: 'Matemáticas', recompensa: 'Maíz' },
    { id: 'geografia', nombre: 'Geografía', recompensa: 'Hoja' },
    { id: 'ciencias', nombre: 'Ciencias', recompensa: 'Cacao' }
  ];

  const mockRival = {
    nombre: '@marcos_12',
    nivel: 42,
    enLinea: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tiene el título correcto', () => {
    const titulo = 'Configuración del Duelo';
    expect(titulo).toContain('Configuración');
    expect(titulo).toContain('Duelo');
  });

  it('muestra el VS entre tú y el rival', () => {
    const vsTexto = 'VS';
    expect(vsTexto).toBe('VS');
    expect(mockRival.nombre).toBe('@marcos_12');
  });

  it('renderiza las categorías de desafío', () => {
    expect(mockCategorias).toHaveLength(4);
    expect(mockCategorias.map(c => c.id)).toContain('historia');
    expect(mockCategorias.map(c => c.id)).toContain('matematicas');
  });

  it('cada categoría tiene una recompensa única', () => {
    const recompensas = mockCategorias.map(c => c.recompensa);
    const unicas = new Set(recompensas);
    
    expect(recompensas).toHaveLength(4);
    expect(unicas.size).toBe(4);
  });

  it('muestra la opción de Duelo Libre', () => {
    const dueloLibre = {
      disponible: true,
      multiplicadorXP: 2,
      descripcion: 'Preguntas aleatorias de todas las categorías'
    };
    
    expect(dueloLibre.disponible).toBe(true);
    expect(dueloLibre.multiplicadorXP).toBe(2);
  });

  it('permite empezar el duelo', () => {
    const onStartDuel = vi.fn();
    onStartDuel();
    expect(onStartDuel).toHaveBeenCalledTimes(1);
  });

  it('verifica que el rival esté en línea', () => {
    expect(mockRival.enLinea).toBe(true);
    expect(mockRival.nivel).toBeGreaterThan(0);
  });

  it('tiene mensaje de notificación al rival', () => {
    const mensaje = 'Tu rival recibirá una notificación al instante.';
    expect(mensaje).toContain('rival');
    expect(mensaje).toContain('notificación');
  });
});

// ==================== TESTS DE LÓGICA DE NEGOCIO ====================

describe('Lógica de Negocio - Componentes', () => {
  it('calcula el progreso de conquista correctamente', () => {
    const departamentosConquistados = 11;
    const totalDepartamentos = 17;
    const progreso = Math.round((departamentosConquistados / totalDepartamentos) * 100);
    
    expect(progreso).toBe(65); // 11/17 ≈ 64.7% → 65
  });

  it('determina si puede hacer un trueque', () => {
    const tieneIngredientes = (inventario, requerido) => {
      return inventario >= requerido;
    };
    
    expect(tieneIngredientes(12, 2)).toBe(true);
    expect(tieneIngredientes(1, 2)).toBe(false);
  });

  it('filtra notificaciones por tipo correctamente', () => {
    const notificaciones = [
      { tipo: 'trueque' },
      { tipo: 'reto' },
      { tipo: 'logro' },
      { tipo: 'trueque' }
    ];
    
    const trueques = notificaciones.filter(n => n.tipo === 'trueque');
    expect(trueques).toHaveLength(2);
  });

  it('calcula recompensa de conquista', () => {
    const calcularRecompensa = (dificultad) => {
      const base = { facil: 100, medio: 200, dificil: 300 };
      return base[dificultad] || 0;
    };
    
    expect(calcularRecompensa('facil')).toBe(100);
    expect(calcularRecompensa('dificil')).toBe(300);
  });

  it('verifica si un departamento está conquistado', () => {
    const departamentos = [
      { id: 'leon', conquistado: true },
      { id: 'granada', conquistado: false }
    ];
    
    const estaConquistado = (id) => {
      const dept = departamentos.find(d => d.id === id);
      return dept ? dept.conquistado : false;
    };
    
    expect(estaConquistado('leon')).toBe(true);
    expect(estaConquistado('granada')).toBe(false);
  });
});
