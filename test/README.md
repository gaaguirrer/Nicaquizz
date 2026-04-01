# Guía de Testing - NicaQuizz

## Comandos Disponibles

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch (desarrollo)
npm run test:ui

# Ejecutar tests y generar reporte de cobertura
npm run test:coverage

# Ejecutar tests una vez (CI/CD)
npm run test:run
```

## Estructura de Tests

```
test/
├── unitarios/           # Tests unitarios
│   ├── componentes.test.jsx
│   ├── componentes-nuevos.test.jsx
│   ├── constantes.test.jsx
│   └── servicios.test.jsx
├── integracion/         # Tests de integración
│   ├── firestore.test.js
│   └── servicios-nuevos.test.js
└── e2e/                # Tests end-to-end
    ├── flujos.test.js
    └── flujos-nuevos.test.js

src/
├── components/
│   ├── Button.test.jsx
│   ├── Card.test.jsx
│   └── Modal.test.jsx
└── services/
    └── firestore.test.js
```

## Escribiendo Tests

### Componentes

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

describe('Button Component', () => {
  it('debe renderizar correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('debe llamar a onClick al hacer click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Servicios

```jsx
import { describe, it, expect, vi } from 'vitest';
import { getTodayDateString } from '../services/firestore';

describe('Funciones de utilidad', () => {
  it('debe retornar fecha en formato correcto', () => {
    const date = new Date('2025-04-01T12:00:00Z');
    vi.spyOn(global, 'Date').mockImplementation(() => date);
    
    expect(getTodayDateString()).toBe('2025-04-01');
    
    vi.restoreAllMocks();
  });
});
```

## Configuración

- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Environment**: jsdom
- **Cobertura mínima**: 70%

## Mocks

Los mocks de Firebase y React Router están configurados en `src/test/setup.jsx`.

## Mejores Prácticas

1. **Nombres descriptivos**: `it('debe hacer algo cuando...')`
2. **Un assert por test**: Cada test debe verificar una cosa
3. **Mocks externos**: Mockear Firebase y APIs externas
4. **Cleanup**: El setup hace cleanup automáticamente
5. **Cobertura**: Apuntar a >70% de cobertura
