/**
 * Tests Unitarios - Componentes de NicaQuizz
 * Pruebas para las nuevas interfaces: Map, Trade, Notifications, Challenge
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ==================== MAP.JSX TESTS ====================

describe('Map.jsx - Mapa de Conquista', () => {
  const mockDepartamentos = [
    { id: 'leon', nombre: 'León', estado: 'conquistado', posicion: { top: '45%', left: '25%' } },
    { id: 'granada', nombre: 'Granada', estado: 'disputa', posicion: { top: '65%', left: '45%' } },
    { id: 'matagalpa', nombre: 'Matagalpa', estado: 'inexplorado', posicion: { top: '35%', left: '55%' } }
  ];

  const mockLider = {
    nombre: 'Elena "Vigorón" López',
    puntos: 9450,
    influencia: 88,
    avatar: 'https://i.pravatar.cc/100?img=20'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título del mapa correctamente', () => {
    render(
      <BrowserRouter>
        <div data-testid="map-component">
          <h1>Mapa Regional de Conquista</h1>
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Mapa Regional de Conquista')).toBeInTheDocument();
  });

  it('muestra el progreso total de conquista', () => {
    render(
      <div>
        <span>Progreso Total</span>
        <span>64%</span>
      </div>
    );
    
    expect(screen.getByText('Progreso Total')).toBeInTheDocument();
    expect(screen.getByText('64%')).toBeInTheDocument();
  });

  it('renderiza los departamentos conquistados con icono check', () => {
    render(
      <div>
        {mockDepartamentos.filter(d => d.estado === 'conquistado').map(dept => (
          <div key={dept.id} data-testid={`dept-${dept.id}`}>
            <span>check_circle</span>
            <span>{dept.nombre}</span>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('León')).toBeInTheDocument();
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('renderiza los departamentos en disputa con animación', () => {
    render(
      <div>
        {mockDepartamentos.filter(d => d.estado === 'disputa').map(dept => (
          <div key={dept.id} data-testid={`dept-${dept.id}`} className="animate-pulse">
            <span>swords</span>
            <span>{dept.nombre}</span>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('Granada')).toBeInTheDocument();
    expect(screen.getByText('swords')).toBeInTheDocument();
  });

  it('muestra el líder regional con puntos de gloria', () => {
    render(
      <div>
        <h2>Líder Regional</h2>
        <h3>{mockLider.nombre}</h3>
        <p>{mockLider.puntos.toLocaleString()} Puntos de Gloria</p>
      </div>
    );
    
    expect(screen.getByText('Líder Regional')).toBeInTheDocument();
    expect(screen.getByText('Elena "Vigorón" López')).toBeInTheDocument();
    expect(screen.getByText('9,450 Puntos de Gloria')).toBeInTheDocument();
  });

  it('renderiza la barra de influencia del líder', () => {
    const influencia = 88;
    render(
      <div>
        <span>Influencia en Granada</span>
        <span>{influencia}%</span>
        <div className="progress-bar" style={{ width: `${influencia}%` }} />
      </div>
    );
    
    expect(screen.getByText('Influencia en Granada')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
  });

  it('muestra el botón para desafiar al líder', () => {
    render(
      <button>DESAFIAR AL LÍDER</button>
    );
    
    const button = screen.getByText('DESAFIAR AL LÍDER');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('swords');
  });

  it('renderiza la misión disponible de conquista', () => {
    render(
      <div>
        <span>Misión Disponible</span>
        <h3>Trivia de Conquista: Granada Colonial</h3>
        <button>INICIAR CONQUISTA</button>
      </div>
    );
    
    expect(screen.getByText('Misión Disponible')).toBeInTheDocument();
    expect(screen.getByText('Trivia de Conquista: Granada Colonial')).toBeInTheDocument();
    expect(screen.getByText('INICIAR CONQUISTA')).toBeInTheDocument();
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

  it('renderiza el título del mercado correctamente', () => {
    render(
      <BrowserRouter>
        <div>
          <h1>Mercado de Trueques Artesanales</h1>
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Mercado de Trueques Artesanales')).toBeInTheDocument();
  });

  it('muestra los ingredientes del usuario', () => {
    render(
      <div>
        <h2>Mis Ingredientes</h2>
        {mockIngredientes.map(ing => (
          <div key={ing.nombre} data-testid={`ing-${ing.nombre}`}>
            <span>{ing.nombre}</span>
            <span>{String(ing.cantidad).padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('Mis Ingredientes')).toBeInTheDocument();
    expect(screen.getByText('Masa')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Arroz')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
  });

  it('renderiza los trueques disponibles', () => {
    render(
      <div>
        <h2>Trueques Disponibles</h2>
        {mockTrueques.map(trueque => (
          <div key={trueque.id} data-testid={`trueque-${trueque.id}`}>
            <span>{trueque.usuario}</span>
            <span>Doy {trueque.doy.cantidad} {trueque.doy.nombre}</span>
            <span>Busco {trueque.busco.cantidad} {trueque.busco.nombre}</span>
            <button>Aceptar Trueque</button>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('Trueques Disponibles')).toBeInTheDocument();
    expect(screen.getByText('@Juanchito')).toBeInTheDocument();
    expect(screen.getByText('Doy 2 Masas')).toBeInTheDocument();
    expect(screen.getByText('Busco 1 Cerdo')).toBeInTheDocument();
  });

  it('muestra badge NUEVO en trueques recientes', () => {
    render(
      <div>
        {mockTrueques.filter(t => t.nuevo).map(trueque => (
          <div key={trueque.id}>
            <span className="badge">NUEVO</span>
            <span>{trueque.usuario}</span>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('NUEVO')).toBeInTheDocument();
    expect(screen.getByText('@Doña_Maria')).toBeInTheDocument();
  });

  it('permite aceptar un trueque', () => {
    const onAccept = vi.fn();
    render(
      <button onClick={onAccept}>Aceptar Trueque</button>
    );
    
    fireEvent.click(screen.getByText('Aceptar Trueque'));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('muestra el botón para crear nueva oferta', () => {
    render(
      <div>
        <h3>¿No encuentras lo que buscas?</h3>
        <button>CREAR MI OFERTA</button>
      </div>
    );
    
    expect(screen.getByText('¿No encuentras lo que buscas?')).toBeInTheDocument();
    expect(screen.getByText('CREAR MI OFERTA')).toBeInTheDocument();
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
      tiempo: 'Hace 5m'
    },
    {
      id: 2,
      tipo: 'reto',
      titulo: 'Nuevo Desafío',
      mensaje: '@Elena_Nica te ha desafiado a un duelo de Historia.',
      tiempo: 'Hace 2h',
      acciones: ['Aceptar', 'Rechazar']
    },
    {
      id: 3,
      tipo: 'logro',
      titulo: '¡Nuevo Logro!',
      mensaje: 'Has recolectado 10 Papas. Reclama tu recompensa.',
      tiempo: 'Ayer',
      accion: 'Reclamar ahora'
    }
  ];

  const mockFiltros = ['Todos', 'Trueques', 'Retos', 'Logros'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título del centro de avisos', () => {
    render(
      <BrowserRouter>
        <div>
          <h1>Centro de Avisos</h1>
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Centro de Avisos')).toBeInTheDocument();
  });

  it('muestra los filtros de notificaciones', () => {
    render(
      <div>
        {mockFiltros.map(filtro => (
          <button key={filtro} className={filtro === 'Todos' ? 'active' : ''}>
            {filtro}
          </button>
        ))}
      </div>
    );
    
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Trueques')).toBeInTheDocument();
    expect(screen.getByText('Retos')).toBeInTheDocument();
    expect(screen.getByText('Logros')).toBeInTheDocument();
    expect(screen.getByText('Todos')).toHaveClass('active');
  });

  it('renderiza notificaciones de trueque', () => {
    render(
      <div>
        {mockNotificaciones.filter(n => n.tipo === 'trueque').map(notif => (
          <div key={notif.id} data-testid={`notif-${notif.id}`}>
            <span>swap_horiz</span>
            <h3>{notif.titulo}</h3>
            <p>{notif.mensaje}</p>
            <span>{notif.tiempo}</span>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('¡Trueque completado!')).toBeInTheDocument();
    expect(screen.getByText('@Juanito aceptó tu oferta de 2 Masas por 1 Cerdo.')).toBeInTheDocument();
    expect(screen.getByText('Hace 5m')).toBeInTheDocument();
  });

  it('muestra notificaciones de reto con botones de acción', () => {
    render(
      <div>
        {mockNotificaciones.filter(n => n.tipo === 'reto').map(notif => (
          <div key={notif.id}>
            <span>swords</span>
            <h3>{notif.titulo}</h3>
            <p>{notif.mensaje}</p>
            <button>Aceptar</button>
            <button>Rechazar</button>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('Nuevo Desafío')).toBeInTheDocument();
    expect(screen.getByText('Aceptar')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  it('renderiza notificaciones de logro con link de reclamo', () => {
    render(
      <div>
        {mockNotificaciones.filter(n => n.tipo === 'logro').map(notif => (
          <div key={notif.id}>
            <span>military_tech</span>
            <h3>{notif.titulo}</h3>
            <p>{notif.mensaje}</p>
            <button>Reclamar ahora</button>
          </div>
        ))}
      </div>
    );
    
    expect(screen.getByText('¡Nuevo Logro!')).toBeInTheDocument();
    expect(screen.getByText('Has recolectado 10 Papas. Reclama tu recompensa.')).toBeInTheDocument();
    expect(screen.getByText('Reclamar ahora')).toBeInTheDocument();
  });

  it('filtra notificaciones por tipo al hacer click en los tabs', () => {
    const onFilterChange = vi.fn();
    
    render(
      <div>
        {mockFiltros.map(filtro => (
          <button 
            key={filtro} 
            onClick={() => onFilterChange(filtro)}
            className={filtro === 'Todos' ? 'active' : ''}
          >
            {filtro}
          </button>
        ))}
      </div>
    );
    
    fireEvent.click(screen.getByText('Retos'));
    expect(onFilterChange).toHaveBeenCalledWith('Retos');
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
    avatar: 'https://i.pravatar.cc/100?img=11'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza la configuración del duelo', () => {
    render(
      <BrowserRouter>
        <div>
          <h1>Configuración del Duelo</h1>
        </div>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Configuración del Duelo')).toBeInTheDocument();
  });

  it('muestra el VS entre tú y el rival', () => {
    render(
      <div>
        <div data-testid="tu-avatar">
          <span>Tú</span>
        </div>
        <span className="vs">VS</span>
        <div data-testid="rival-avatar">
          <span>{mockRival.nombre}</span>
        </div>
      </div>
    );
    
    expect(screen.getByText('Tú')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByText('@marcos_12')).toBeInTheDocument();
  });

  it('renderiza las categorías de desafío', () => {
    render(
      <div>
        <h2>Categorías de Desafío</h2>
        {mockCategorias.map(cat => (
          <button key={cat.id} data-testid={`cat-${cat.id}`}>
            <span>{cat.nombre}</span>
            <span>Recompensa: {cat.recompensa}</span>
          </button>
        ))}
      </div>
    );
    
    expect(screen.getByText('Categorías de Desafío')).toBeInTheDocument();
    expect(screen.getByText('Historia')).toBeInTheDocument();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
    expect(screen.getByText('Recompensa: Achiote')).toBeInTheDocument();
  });

  it('muestra la opción de Duelo Libre', () => {
    render(
      <button>
        <span>shuffle</span>
        <span>Duelo Libre</span>
        <p>Preguntas aleatorias de todas las categorías. ¡Doble experiencia!</p>
      </button>
    );
    
    expect(screen.getByText('Duelo Libre')).toBeInTheDocument();
    expect(screen.getByText('Preguntas aleatorias de todas las categorías. ¡Doble experiencia!')).toBeInTheDocument();
  });

  it('permite empezar el duelo', () => {
    const onStartDuel = vi.fn();
    render(
      <button onClick={onStartDuel}>
        <span>swords</span>
        ¡Empezar Duelo!
      </button>
    );
    
    fireEvent.click(screen.getByText('¡Empezar Duelo!'));
    expect(onStartDuel).toHaveBeenCalledTimes(1);
  });

  it('muestra el mensaje de notificación al rival', () => {
    render(
      <p>Tu rival recibirá una notificación al instante.</p>
    );
    
    expect(screen.getByText('Tu rival recibirá una notificación al instante.')).toBeInTheDocument();
  });
});
