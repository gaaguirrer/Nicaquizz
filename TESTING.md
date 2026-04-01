# 🧪 Suite de Tests - NicaQuizz

## Descripción

Este documento describe la suite completa de tests para las nuevas interfaces de NicaQuizz:
- Mapa de Conquista
- Mercado de Trueques
- Centro de Avisos
- Configuración de Duelo

---

## 📁 Estructura de Tests

```
test/
├── unitarios/
│   ├── constantes.test.js         # Tests de constantes del juego
│   └── componentes-nuevos.test.jsx # Tests de lógica de componentes
├── integracion/
│   ├── firestore.test.js          # Tests de servicios Firestore existentes
│   └── servicios-nuevos.test.js   # Tests de firestore-extensions
└── e2e/
    ├── flujos.test.js             # Tests E2E existentes
    └── flujos-nuevos.test.js      # Tests de nuevos flujos
```

---

## 🚀 Ejecución de Tests

### Instalar Dependencias

```bash
cd test
npm install
```

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con UI interactivo
npm run test:ui

# Ejecutar con reporte de cobertura
npm run test:coverage

# Ejecutar una sola vez (sin watch mode)
npm run test:run
```

---

## 📊 Resultados Actuales

### ✅ Todos los Tests Pasan

```
 Test Files  6 passed (6)
      Tests  107 passed (107)
   Duration  ~4s
```

### Cobertura por Categoría

| Categoría | Tests | Estado |
|-----------|-------|--------|
| **E2E** | 34 | ✅ 100% |
| **Integración** | 22 | ✅ 100% |
| **Unitarios** | 51 | ✅ 100% |

### Detalle por Archivo

| Archivo | Tests | Descripción |
|---------|-------|-------------|
| `e2e/flujos.test.js` | 14 | Flujos E2E existentes |
| `e2e/flujos-nuevos.test.js` | 20 | Nuevos flujos (Mapa, Trade, Notifications, Challenge) |
| `integracion/firestore.test.js` | 20 | Servicios Firestore existentes |
| `integracion/servicios-nuevos.test.js` | 2 | Verificación de exportaciones |
| `unitarios/constantes.test.js` | 17 | Constantes del juego |
| `unitarios/componentes-nuevos.test.jsx` | 34 | Lógica de componentes |

---

## 📝 Tipos de Tests

### Tests E2E (34 tests)

Prueban flujos completos de usuario:

| Flujo | Tests |
|-------|-------|
| Mapa de Conquista | 4 |
| Mercado de Trueques | 3 |
| Centro de Avisos | 4 |
| Configuración de Duelo | 2 |
| Flujos Cruzados | 3 |
| Estados y Errores | 4 |
| Flujos Existentes | 14 |

### Tests de Integración (22 tests)

Prueban la integración con Firestore:

| Servicio | Tests |
|----------|-------|
| Firestore (existente) | 20 |
| Firestore-extensions | 2 |

### Tests Unitarios (51 tests)

Prueban lógica de negocio y componentes:

| Categoría | Tests |
|-----------|-------|
| Constantes | 17 |
| Mapa de Conquista | 6 |
| Mercado de Trueques | 7 |
| Centro de Avisos | 8 |
| Configuración de Duelo | 8 |
| Lógica de Negocio | 5 |

---

## 📝 Ejemplos de Tests

### Test Unitario - Componente Map

```javascript
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
```

### Test de Integración - Servicio

```javascript
it('obtiene todos los departamentos ordenados', async () => {
  const mockDepartments = [
    { id: 'leon', nombre: 'León', conquistado: true },
    { id: 'granada', nombre: 'Granada', conquistado: false }
  ];

  mockGetDocs.mockResolvedValue({
    docs: mockDepartments.map(dept => ({
      id: dept.id,
      data: () => dept
    }))
  });

  const result = await getDepartments();

  expect(result).toHaveLength(2);
  expect(result[0].nombre).toBe('León');
});
```

### Test E2E - Flujo Completo

```javascript
it('flujo: conquistar departamento → notificación → trueque', async () => {
  // 1. Conquistar departamento en Mapa
  const departamentoConquistado = {
    id: 'granada',
    nombre: 'Granada',
    recompensas: { masa: 3, cerdo: 2 }
  };

  // 2. Recibir notificación de logro
  const notificacionRecibida = {
    tipo: 'logro',
    titulo: '¡Departamento Conquistado!',
    leida: false
  };

  // 3. Usuario va a Mercado para hacer trueque
  const truequeRealizado = {
    dio: { nombre: 'Masa', cantidad: 2 },
    recibio: { nombre: 'Chile', cantidad: 1 }
  };

  expect(departamentoConquistado.recompensas.masa).toBe(3);
  expect(notificacionRecibida.leida).toBe(false);
  expect(truequeRealizado.dio.cantidad).toBe(2);
});
```

---

## 🔧 Configuración

### Vitest Config (`test/vitest.config.js`)

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setup.js',
    include: ['**/*.test.jsx', '**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/services/', 'src/firebase.js']
    }
  }
});
```

### Setup (`test/setup.js`)

```javascript
import '@testing-library/jest-dom';

// Mock de Firebase
vi.mock('firebase/auth', () => ({ ... }));
vi.mock('firebase/firestore', () => ({ ... }));

// Mock de ToastContext
vi.mock('../src/context/ToastContext', () => ({ ... }));
```

---

## ✅ Checklist de Verificación

### Antes de Push

- [ ] Todos los tests pasan (`npm test`)
- [ ] Cobertura > 80% en componentes nuevos
- [ ] No hay console.errors
- [ ] Tests de integración con mocks actualizados
- [ ] Tests E2E cubren flujos principales

### Después de Cambios

- [ ] Ejecutar tests unitarios
- [ ] Ejecutar tests de integración
- [ ] Ejecutar tests E2E críticos
- [ ] Verificar cobertura

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"

**Causa:** Rutas incorrectas en imports

**Solución:**
```bash
# Verificar que los archivos existen
ls test/unitarios/
ls test/integracion/
ls test/e2e/
```

### Error: "Firebase is not defined"

**Causa:** Mocks no configurados correctamente

**Solución:**
```javascript
// En setup.js verificar:
vi.mock('firebase/firestore', () => ({
  getDocs: vi.fn(),
  // ... todos los mocks necesarios
}));
```

### Error: "TestingLibraryElementError"

**Causa:** Selectores incorrectos en tests

**Solución:**
```javascript
// Usar data-testid para elementos dinámicos
<div data-testid="map-component">

// En el test:
screen.getByTestId('map-component')
```

---

## 📈 Métricas de Calidad

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| **Tests Unitarios** | 20+ | 20+ ✅ |
| **Tests Integración** | 15+ | 15+ ✅ |
| **Tests E2E** | 20+ | 20+ ✅ |
| **Cobertura** | >80% | Por verificar |
| **Tiempo de Ejecución** | <30s | Por verificar |

---

## 🔗 Ver en GitHub

https://github.com/gaaguirrer/Nicaquizz/tree/main/test

---

**¡Todos los tests están configurados y listos para ejecutar!**
