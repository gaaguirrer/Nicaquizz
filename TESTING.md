# Testing en NicaQuizz

## Comandos

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:ui

# Con cobertura
npm run test:coverage

# Una vez (CI/CD)
npm run test:run
```

## Estructura de Tests

```
src/
├── components/
│   ├── Button.test.jsx
│   └── Card.test.jsx
├── services/
│   └── firestore.test.js
└── validators.test.js
```

## Escribir Tests

### Componentes

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

it('renderiza texto', () => {
  render(<Button>Click</Button>);
  expect(screen.getByText('Click')).toBeInTheDocument();
});

it('llama a onClick', () => {
  const fn = vi.fn();
  render(<Button onClick={fn}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(fn).toHaveBeenCalled();
});
```

### Servicios

```jsx
import { validateEmail } from './validators';

it('valida emails', () => {
  expect(validateEmail('test@example.com').valid).toBe(true);
  expect(validateEmail('invalid').valid).toBe(false);
});
```

## Cobertura Objetivo

- Líneas: 70%
- Funciones: 70%
- Branches: 70%
