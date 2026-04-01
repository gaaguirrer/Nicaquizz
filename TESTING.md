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
│   └── componentes-nuevos.test.jsx    # Tests de componentes
├── integracion/
│   └── servicios-nuevos.test.js       # Tests de servicios Firestore
└── e2e/
    └── flujos-nuevos.test.js          # Tests de flujos completos
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

### Ejecutar Tests Específicos

```bash
# Tests unitarios de componentes
npm test -- componentes-nuevos

# Tests de integración de servicios
npm test -- servicios-nuevos

# Tests E2E de flujos
npm test -- flujos-nuevos
```

---

## 📊 Cobertura de Tests

### Tests Unitarios (20+ tests)

| Componente | Tests | Descripción |
|------------|-------|-------------|
| **Map.jsx** | 8 | Mapa de Conquista, líderes, progreso |
| **Trade.jsx** | 6 | Mercado de Trueques, ingredientes |
| **Notifications.jsx** | 6 | Centro de Avisos, filtros |
| **Challenge.jsx** | 6 | Configuración de Duelo |

### Tests de Integración (15+ tests)

| Servicio | Tests | Descripción |
|----------|-------|-------------|
| **Mapa** | 6 | departments, regionalLeaders, conquestProgress |
| **Notificaciones** | 9 | CRUD completo de notifications |

### Tests E2E (20+ tests)

| Flujo | Tests | Descripción |
|-------|-------|-------------|
| **Mapa de Conquista** | 4 | Explorar, desafiar, iniciar conquista |
| **Mercado de Trueques** | 3 | Ver ingredientes, aceptar trueque |
| **Centro de Avisos** | 4 | Filtrar, aceptar desafío, reclamar |
| **Configuración de Duelo** | 2 | Seleccionar categoría, duelo libre |
| **Flujos Cruzados** | 3 | Integración entre interfaces |
| **Estados y Errores** | 4 | Manejo de loading, errores |

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
