# NicaQuizz

Aplicación web educativa de preguntas y respuestas con React, Vite y Firebase.

## ¿Qué es NicaQuizz?

Plataforma donde los estudiantes responden preguntas de 4 categorías (Historia, Matemáticas, Geografía y Ciencias) para ganar ingredientes del nacatamal nicaragüense.

## Características

- 4 categorías de preguntas
- Retos entre amigos
- Ranking global y por categoría
- Tienda de mejoras
- Reto diario (gana achiotes)
- Casa de cambio (achiotes por ingredientes)

## Tecnologías

- **Frontend:** React 19, Vite 6, Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Analytics)
- **Testing:** Vitest, Testing Library

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de Firebase
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npm run test
```

## Estructura

```
src/
├── pages/          # Páginas principales
├── components/     # Componentes reutilizables
├── services/       # Conexión con Firebase
├── context/        # Contextos de React
├── utils/          # Funciones utilitarias
└── scripts/        # Scripts de inicialización
```

## Documentación

- [Seguridad](SECURITY.md) - Reglas de Firestore y validaciones
- [Analytics](ANALYTICS.md) - Configuración de GA4 y Sentry
- [Testing](test/README.md) - Guía de tests

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase

## Licencia

MIT
