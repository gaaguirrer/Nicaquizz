# NicaQuizz - El Nacatamal del Conocimiento

<span class="material-icons">school</span> **Aplicación web educativa de trivia con temática nicaragüense**

---

## <span class="material-icons">menu_book</span> Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
5. [Firebase: Configuración y Base de Datos](#firebase-configuración-y-base-de-datos)
6. [Netlify: Despliegue y Configuración](#netlify-despliegue-y-configuración)
7. [Estructura del Código](#estructura-del-código)
8. [Funcionalidades de la Aplicación](#funcionalidades-de-la-aplicación)
9. [Ejecución de Tests](#ejecución-de-tests)
10. [Scripts de Inicialización](#scripts-de-inicialización)
11. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## <span class="material-icons">info</span> Descripción del Proyecto

NicaQuizz es una aplicación web educativa diseñada como un juego de trivia con temática cultural nicaragüense. Los estudiantes pueden:

- **Responder preguntas** de diferentes categorías (historia, matemáticas, geografía, ciencias)
- **Gestionar su perfil** con estadísticas de progreso
- **Desafiar a amigos** en batallas de conocimiento
- **Intercambiar ingredientes** (temática de nacatamales) como sistema de recompensas
- **Acceder a una tienda** para mejorar su experiencia de juego
- **Proponer nuevas preguntas** para contribuir al contenido

La aplicación sigue una arquitectura moderna basada en **Clean Architecture** y **Domain-Driven Design (DDD)**, lo que la convierte en un excelente ejemplo de desarrollo profesional.

---

## <span class="material-icons">architecture</span> Arquitectura del Sistema

El proyecto implementa una **Arquitectura Limpia** (Clean Architecture) con las siguientes capas:

```
┌─────────────────────────────────────────┐
│   PRESENTATION (presentación)           │
│   - Componentes React                   │
│   - Páginas                             │
│   - Contextos (Auth, Toast)             │
│   - Hooks personalizados                │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   APPLICATION (aplicación)              │
│   - Servicios de aplicación             │
│   - Casos de uso                        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   DOMAIN (dominio)                      │
│   - Entidades (User, Question, etc.)    │
│   - Interfaces de repositorio           │
│   - Reglas de negocio                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   INFRASTRUCTURE (infraestructura)      │
│   - Implementaciones Firebase           │
│   - Repositorios concretos              │
└─────────────────────────────────────────┘
```

**Principios aplicados:**
- <span class="material-icons">check_circle</span> **SRP** (Single Responsibility Principle): Cada clase tiene una única razón para cambiar
- <span class="material-icons">check_circle</span> **DIP** (Dependency Inversion Principle): Las capas superiores dependen de abstracciones, no de implementaciones
- <span class="material-icons">check_circle</span> **Inyección de Dependencias**: Los servicios reciben sus dependencias, no las crean
- <span class="material-icons">check_circle</span> **Repositorios**: Interfaces que definen contratos para acceso a datos

---

## <span class="material-icons">code</span> Tecnologías Utilizadas

### Frontend
- **React 19**: Biblioteca de interfaz de usuario
- **React Router DOM 7**: Enrutamiento
- **Vite 6**: Bundler y herramientas de desarrollo
- **TailwindCSS 3**: Framework de CSS utility-first
- **TypeScript**: Tipado estático

### Backend y Servicios
- **Firebase 11**: Plataforma de backend como servicio
  - **Firestore**: Base de datos NoSQL
  - **Firebase Auth**: Sistema de autenticación
- **Netlify**: Plataforma de despliegue y funciones serverless

### Testing
- **Vitest**: Framework de tests
- **Testing Library**: Tests centrados en el usuario
- **JS-DOM**: Entorno de pruebas

### Herramientas
- **Sentry**: Monitoreo de errores
- **Google Analytics**: Análisis de uso

---

## <span class="material-icons">settings</span> Configuración del Entorno de Desarrollo

### Prerrequisitos

Antes de comenzar, necesitas tener instalado:

- **Node.js** versión 20 o superior ([descargar aquí](https://nodejs.org/))
- **npm** versión 10 o superior (viene con Node.js)
- **Git** para control de versiones
- Una **cuenta de Firebase** (gratuita)
- Una **cuenta de Netlify** (gratuita)

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Nicaquizz
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias definidas en `package.json`.

### Paso 3: Configurar Variables de Entorno

Copia el archivo de ejemplo y configúralo con tus credenciales:

```bash
cp .env.example .env
```

**IMPORTANTE**: El archivo `.env.example` ya contiene credenciales de demostración. Para producción, debes crear tu propio proyecto de Firebase (ver sección de Firebase más abajo).

### Paso 4: Ejecutar la Aplicación en Modo Desarrollo

```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:3000`.

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run preview` | Previsualiza la versión compilada |
| `npm test` | Ejecuta los tests en modo observación |
| `npm run test:run` | Ejecuta los tests una sola vez |
| `npm run test:ui` | Ejecuta los tests con interfaz gráfica |
| `npm run test:coverage` | Ejecuta los tests con reporte de cobertura |
| `npm run init-db` | Inicializa la base de datos con datos básicos |
| `npm run init-full-db` | Inicializa la base de datos con datos completos |

---

## <span class="material-icons">cloud</span> Firebase: Configuración y Base de Datos

### <span class="material-icons">folder</span> Paso 1: Crear un Proyecto en Firebase

1. **Accede a Firebase Console**: Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Inicia sesión** con tu cuenta de Google

3. **Crea un nuevo proyecto**:
   - Haz clic en **"Agregar proyecto"**
   - Asigna un nombre (ej: `nicaquizz-mi-proyecto`)
   - **Deshabilita Google Analytics** (opcional, puedes activarlo después)
   - Haz clic en **"Crear proyecto"**

4. **Espera a que se configure** el proyecto (toma unos segundos)

### <span class="material-icons">folder</span> Paso 2: Habilitar Firebase Authentication

1. En el panel izquierdo, haz clic en **"Authentication"** (o "Autenticación")

2. Haz clic en **"Comenzar"** o "Get Started"

3. Ve a la pestaña **"Sign-in method"** (Método de inicio de sesión)

4. **Habilita las siguientes opciones**:
   - <span class="material-icons">check_circle</span> **Correo electrónico/contraseña**: Haz clic, activa el interruptor y guarda
   - <span class="material-icons">check_circle</span> **Google**: Haz clic, activa el interruptor, selecciona tu email de soporte y guarda

### <span class="material-icons">folder</span> Paso 3: Crear la Base de Datos Firestore

1. En el panel izquierdo, haz clic en **"Firestore Database"**

2. Haz clic en **"Crear base de datos"**

3. **Configuración de seguridad**:
   - Selecciona **"Comenzar en modo de prueba"** (esto permitirá lecturas/escrituras sin autenticación temporalmente)
   - **IMPORTANTE**: Más adelante configuraremos las reglas de seguridad apropiadas

4. **Ubicación**:
   - Selecciona una ubicación cercana a ti (ej: `us-central` o `us-east1`)
   - Haz clic en **"Habilitar"**

5. **Espera a que se cree** la base de datos

### <span class="material-icons">folder</span> Paso 4: Configurar las Reglas de Seguridad

1. En **Firestore Database**, ve a la pestaña **"Reglas"** (Rules)

2. **Reemplaza el contenido** del archivo de reglas con el archivo `firestore.rules` del proyecto

3. Haz clic en **"Publicar"**

<span class="material-icons">warning</span> **NOTA IMPORTANTE**: Las reglas de seguridad del archivo `firestore.rules` asumen que existe una colección `users` con un campo `isAdmin`. Debes asegurarte de que al menos un usuario tenga privilegios de administrador para poder gestionar la aplicación.

### <span class="material-icons">folder</span> Paso 5: Obtener las Credenciales de Firebase

1. En el panel izquierdo, haz clic en el ícono de **engranaje** ⚙️ junto a "Descripción general del proyecto"

2. Selecciona **"Configuración del proyecto"**

3. **Desplázate hacia abajo** hasta la sección "Tus aplicaciones"

4. Si no hay aplicaciones web registradas:
   - Haz clic en el ícono **</>** (web)
   - Asigna un nombre a la app (ej: `NicaQuizz Web`)
   - **No marques** la opción de Firebase Hosting (usaremos Netlify)
   - Haz clic en **"Registrar app"**

5. **Copia las credenciales** que aparecen. Se verán así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

### <span class="material-icons">folder</span> Paso 6: Configurar el Archivo .env

Abre el archivo `.env` en la raíz del proyecto y **reemplaza los valores** con tus credenciales:

```env
# Firebase Configuration (Vite usa prefijo VITE_)
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Para funciones serverless (Netlify) - Sin prefijo VITE_
FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

# Sentry (Error Tracking) - Opcional
VITE_SENTRY_DSN=https://tu-dsn@sentry.io/tu-proyecto

# Google Analytics - Opcional
VITE_GA_MEASUREMENT_ID=tu_measurement_id
```

<span class="material-icons">info</span> **NOTA**: Las variables con prefijo `VITE_` son para el frontend. Las variables sin prefijo son para las funciones serverless de Netlify.

### <span class="material-icons">folder</span> Paso 7: Inicializar la Base de Datos

Ejecuta el script de inicialización:

```bash
npm run init-full-db
```

Este script creará:
- <span class="material-icons">check_circle</span> Categorías de preguntas
- <span class="material-icons">check_circle</span> Items de la tienda
- <span class="material-icons">check_circle</span> Preguntas de ejemplo
- <span class="material-icons">check_circle</span> Configuración inicial

---

## <span class="material-icons">deploy</span> Netlify: Despliegue y Configuración

### <span class="material-icons">folder</span> Paso 1: Crear una Cuenta en Netlify

1. Ve a [https://www.netlify.com/](https://www.netlify.com/)
2. Haz clic en **"Sign up"**
3. **Regístrate** con tu cuenta de GitHub, GitLab, Bitbucket o email

### <span class="material-icons">folder</span> Paso 2: Preparar el Repositorio en GitHub

<span class="material-icons">info</span> **IMPORTANTE**: Asegúrate de que tu código esté en un repositorio de GitHub antes de continuar.

Si aún no has subido el código:

```bash
# Agrega todos los cambios
git add .

# Haz commit
git commit -m "Configuración completa para despliegue"

# Si aún no tienes un remoto, créalo
git remote add origin <url-de-tu-repositorio-github>

# Sube el código
git push -u origin main
```

### <span class="material-icons">folder</span> Paso 3: Crear un Nuevo Sitio en Netlify

1. **Inicia sesión** en Netlify
2. Haz clic en **"Add new site"** > **"Import an existing project"**
3. **Selecciona tu proveedor de Git** (GitHub, GitLab, etc.)
4. **Autoriza** a Netlify para acceder a tu repositorio
5. **Selecciona el repositorio** de NicaQuizz

### <span class="material-icons">folder</span> Paso 4: Configurar la Construcción

Configura las siguientes opciones:

- **Branch to deploy**: `main` (o `actualizaciones` si prefieres)
- **Build command**: `npm run build` (ya está configurado en `netlify.toml`)
- **Publish directory**: `dist` (ya está configurado en `netlify.toml`)

<span class="material-icons">check_circle</span> **NOTA**: El archivo `netlify.toml` ya contiene toda la configuración necesaria, así que Netlify detectará automáticamente estos valores.

### <span class="material-icons">folder</span> Paso 5: Configurar Variables de Entorno en Netlify

<span class="material-icons">warning</span> **ESTE PASO ES CRÍTICO**: Sin estas variables, la aplicación no funcionará.

1. En tu sitio de Netlify, ve a **"Site configuration"** > **"Environment variables"**

2. **Agrega las siguientes variables** (una por una):

| Variable | Valor |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Tu API key de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `tu-proyecto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `tu-proyecto` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `tu-proyecto.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Tu sender ID |
| `VITE_FIREBASE_APP_ID` | Tu app ID de Firebase |
| `VITE_FIREBASE_MEASUREMENT_ID` | Tu measurement ID |
| `FIREBASE_API_KEY` | Tu API key de Firebase (sin prefijo) |
| `FIREBASE_AUTH_DOMAIN` | `tu-proyecto.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `tu-proyecto` |
| `FIREBASE_STORAGE_BUCKET` | `tu-proyecto.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Tu sender ID |
| `FIREBASE_APP_ID` | Tu app ID de Firebase |

3. Haz clic en **"Add variable"** después de cada una

### <span class="material-icons">folder</span> Paso 6: Desplegar

1. Haz clic en **"Deploy site"**
2. **Espera** a que Netlify compile y despliegue la aplicación (1-3 minutos)
3. Una vez completado, **verás una URL** como: `https://tu-sitio-random123.netlify.app`

<span class="material-icons">check_circle</span> **¡Felicidades! Tu aplicación ya está en producción.**

### <span class="material-icons">folder</span> Paso 7: Configurar un Dominio Personalizado (Opcional)

1. Ve a **"Site configuration"** > **"Domain management"**
2. Haz clic en **"Add custom domain"**
3. **Sigue las instrucciones** para conectar tu dominio

### <span class="material-icons">folder</span> Paso 8: Configuración de Funciones Serverless (Opcional)

El proyecto incluye funciones serverless en `netlify/functions/`. Estas son opcionales y se utilizan para operaciones que requieren credenciales privadas.

Para desplegar las funciones:

```bash
# Instala Netlify CLI globalmente
npm install -g netlify-cli

# Autentica con Netlify
netlify login

# Despliega las funciones
netlify deploy --prod
```

<span class="material-icons">info</span> **NOTA**: Para las funciones serverless, también necesitarás configurar las variables de entorno **sin el prefijo `VITE_`** en Netlify.

---

## <span class="material-icons">folder_open</span> Estructura del Código

```
Nicaquizz/
├── src/
│   ├── application/              # Capa de aplicación (servicios y casos de uso)
│   │   ├── services/             # Servicios de aplicación
│   │   │   ├── AuthService.ts    # Servicio de autenticación
│   │   │   ├── GameService.ts    # Servicio de lógica del juego
│   │   │   └── UserService.ts    # Servicio de usuarios
│   │   └── use-cases/            # Casos de uso (reservado)
│   │
│   ├── domain/                   # Capa de dominio (entidades e interfaces)
│   │   ├── entities/             # Entidades del dominio
│   │   │   ├── UserEntity.ts     # Entidad de usuario con estadísticas
│   │   │   ├── QuestionEntity.ts # Entidad de pregunta
│   │   │   ├── CategoryEntity.ts # Entidad de categoría
│   │   │   └── ChallengeEntity.ts# Entidad de desafío
│   │   ├── repositories/         # Interfaces de repositorios
│   │   └── value-objects/        # Objetos de valor (reservado)
│   │
│   ├── infrastructure/           # Capa de infraestructura
│   │   └── firebase/             # Implementaciones con Firebase
│   │       ├── firebase.config.ts# Configuración de Firebase
│   │       ├── FirebaseUserRepository.ts
│   │       ├── FirebaseQuestionRepository.ts
│   │       └── FirebaseChallengeRepository.ts
│   │
│   ├── presentation/             # Capa de presentación
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── TopNavBar.jsx
│   │   │   ├── UserMenu.jsx
│   │   │   └── ...
│   │   ├── contexts/             # Contextos de React
│   │   │   ├── AuthContext.jsx   # Contexto de autenticación
│   │   │   └── ToastContext.jsx  # Contexto de notificaciones
│   │   ├── hooks/                # Hooks personalizados
│   │   │   └── useIsAdmin.js
│   │   └── pages/                # Páginas de la aplicación
│   │       ├── Landing.jsx       # Página de inicio
│   │       ├── Auth.jsx          # Login/Registro
│   │       ├── PlayMode.jsx      # Selección de modo de juego
│   │       ├── Categories.jsx    # Selección de categoría
│   │       ├── Questions.jsx     # Juego de preguntas
│   │       ├── Profile.jsx       # Perfil de usuario
│   │       ├── RankingConnected.jsx
│   │       ├── ShopConnected.jsx
│   │       ├── FriendsConnected.jsx
│   │       ├── ChallengeConnected.jsx
│   │       └── ...
│   │
│   ├── scripts/                  # Scripts de administración
│   │   ├── init-db.js            # Inicialización básica
│   │   ├── init-full-db.js       # Inicialización completa
│   │   ├── load-data.js          # Carga de datos
│   │   └── make-admin.js         # Otorgar privilegios de admin
│   │
│   ├── services/                 # Servicios legacy/directos
│   │   ├── api.js                # Cliente de API
│   │   └── firestore.js          # Acceso directo a Firestore
│   │
│   ├── shared/                   # Utilidades compartidas
│   │   ├── constants/            # Constantes del sistema
│   │   │   ├── categories.ts
│   │   │   ├── ingredients.ts
│   │   │   ├── shop-items.ts
│   │   │   └── game-config.ts
│   │   ├── types/                # Tipos de TypeScript
│   │   ├── validators/           # Validadores
│   │   └── utils/                # Utilidades (reservado)
│   │
│   ├── test/                     # Configuración de tests
│   │   └── setup.jsx
│   │
│   ├── App.jsx                   # Componente principal con rutas
│   ├── main.jsx                  # Punto de entrada de la aplicación
│   ├── index.css                 # Estilos globales
│   └── validators.js             # Validadores (versión JS)
│
├── netlify/
│   └── functions/                # Funciones serverless de Netlify
│       ├── auth.js
│       ├── users.js
│       ├── data.js
│       └── init-db.js
│
├── public/                       # Archivos estáticos
│   └── icons/
│
├── test/                         # Tests
│   ├── unitarios/
│   ├── integracion/
│   └── e2e/
│
├── .env.example                  # Ejemplo de variables de entorno
├── .gitignore                    # Archivos ignorados por Git
├── firestore.rules               # Reglas de seguridad de Firestore
├── netlify.toml                  # Configuración de Netlify
├── package.json                  # Dependencias y scripts
├── vite.config.js                # Configuración de Vite
├── vitest.config.js              # Configuración de Vitest
├── tailwind.config.js            # Configuración de TailwindCSS
└── postcss.config.js             # Configuración de PostCSS
```

---

## <span class="material-icons">games</span> Funcionalidades de la Aplicación

### <span class="material-icons">person</span> Autenticación y Perfil

- **Registro** con email y contraseña
- **Inicio de sesión** con email o Google
- **Gestión de perfil** con estadísticas detalladas
- **Sistema de monedas** (ingredientes de nacatamal)
- **Estadísticas por categoría** de preguntas

### <span class="material-icons">quiz_answer</span> Modos de Juego

1. **Modo Práctica**: Responde preguntas sin presión de tiempo
2. **Modo Desafío**: Desafía a otros jugadores
3. **Desafío Diario**: Un desafío especial que cambia cada día

### <span class="material-icons">category</span> Categorías de Preguntas

- <span class="material-icons">history_edu</span> **Historia**: Historia de Nicaragua
- <span class="material-icons">calculate</span> **Matemáticas**: Problemas matemáticos
- <span class="material-icons">public</span> **Geografía**: Geografía de Nicaragua
- <span class="material-icons">science</span> **Ciencias**: Ciencias naturales

### <span class="material-icons">store</span> Tienda

Compra mejoras y power-ups:
- **Mejoras**: Incrementan recompensas
- **Trabas**: Obstáculos para oponentes en desafíos

### <span class="material-icons">swap_horiz</span> Intercambios

- **Intercambia ingredientes** con otros jugadores
- **Sistema de regalos**: Envía regalos a tus amigos

### <span class="material-icons">people</span> Sistema de Amigos

- **Envía solicitudes** de amistad
- **Gestiona tu lista** de amigos
- **Desafía a tus amigos** directamente

### <span class="material-icons">emoji_events</span> Ranking

- **Tabla de clasificación** global
- **Estadísticas detalladas** de todos los jugadores
- **Departamentos de Nicaragua** como avatares

### <span class="material-icons">admin_panel_settings</span> Panel de Administración

Solo accesible para usuarios administradores:
- **Aprobar/rechazar** preguntas propuestas
- **Gestionar categorías**
- **Gestionar items de tienda**
- **Moderar contenido**

### <span class="material-icons">add_circle</span> Proponer Preguntas

Los usuarios pueden proponer nuevas preguntas para ser revisadas por administradores.

---

## <span class="material-icons">bug_report</span> Ejecución de Tests

### Ejecutar Todos los Tests

```bash
npm test
```

### Ejecutar Tests Una Sola Vez

```bash
npm run test:run
```

### Ejecutar Tests con Interfaz Gráfica

```bash
npm run test:ui
```

### Ver Cobertura de Tests

```bash
npm run test:coverage
```

### Estructura de Tests

```
test/
├── unitarios/        # Tests unitarios de componentes y funciones
├── integracion/      # Tests de integración entre módulos
└── e2e/              # Tests end-to-end (si están configurados)
```

---

## <span class="material-icons">terminal</span> Scripts de Inicialización

### `npm run init-db`

Inicializa la base de datos con datos mínimos:
- Categorías básicas
- Items de tienda esenciales

**Uso**:
```bash
npm run init-db
```

### `npm run init-full-db`

Inicializa la base de datos con datos completos:
- Todas las categorías
- Items de tienda completos
- Preguntas de ejemplo
- Configuración inicial

**Uso**:
```bash
npm run init-full-db
```

### Scripts Adicionales en `src/scripts/`

- **`init-daily-collections.js`**: Inicializa colecciones diarias
- **`init-monthly-stats.js`**: Inicializa estadísticas mensuales
- **`generate-daily-challenge.js`**: Genera el desafío diario
- **`make-admin.js`**: Otorga privilegios de administrador a un usuario

**Para ejecutar un script específico**:
```bash
node src/scripts/nombre-del-script.js
```

<span class="material-icons">warning</span> **NOTA**: Los scripts requieren que las variables de entorno estén configuradas correctamente en el archivo `.env`.

---

## <span class="material-icons">help</span> Solución de Problemas Comunes

### <span class="material-icons">error</span> Error: "Firebase no está configurado"

**Causa**: El archivo `.env` no está configurado o tiene valores incorrectos.

**Solución**:
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Asegúrate de que todas las variables `VITE_FIREBASE_*` están presentes
3. Reinicia el servidor de desarrollo (`npm run dev`)

### <span class="material-icons">error</span> Error: "Permission Denied" en Firestore

**Causa**: Las reglas de seguridad de Firestore no están configuradas correctamente.

**Solución**:
1. Ve a Firebase Console > Firestore Database > Reglas
2. Reemplaza el contenido con el archivo `firestore.rules`
3. Publica las reglas

### <span class="material-icons">error</span> Error: "Module not found" al ejecutar scripts

**Causa**: Dependencias no instaladas.

**Solución**:
```bash
npm install
```

### <span class="material-icons">error</span> Error: "Port 3000 already in use"

**Causa**: Otro proceso está usando el puerto 3000.

**Solución**:
1. Cierra el otro proceso, o
2. Cambia el puerto en `vite.config.js`:
   ```javascript
   server: {
     port: 3001, // Cambia a otro puerto
     open: true
   }
   ```

### <span class="material-icons">error</span> La aplicación no funciona en Netlify

**Causa**: Variables de entorno no configuradas en Netlify.

**Solución**:
1. Ve a tu sitio en Netlify > Site configuration > Environment variables
2. Agrega todas las variables de Firebase (ver sección de Netlify más arriba)
3. Redeploya la aplicación: **Deploys** > **Trigger deploy** > **Deploy site**

### <span class="material-icons">error</span> Error de CORS

**Causa**: Las reglas de Firestore no permiten acceso desde tu dominio.

**Solución**:
1. En Firebase Console, ve a Authentication > Settings
2. Agrega tu dominio de Netlify a **"Authorized domains"**

### <span class="material-icons">error</span> Error: "Missing environment variable"

**Causa**: Falta una variable de entorno requerida.

**Solución**:
Verifica que TODAS estas variables están en tu archivo `.env` o en Netlify:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### <span class="material-icons">error</span> El build falla en Netlify

**Causa**: Errores de compilación o dependencias faltantes.

**Solución**:
1. Ejecuta `npm run build` localmente para verificar que compila
2. Verifica que todas las dependencias están en `package.json`
3. Revisa los logs de build en Netlify para identificar el error específico

---

## <span class="material-icons">security</span> Seguridad

<span class="material-icons">warning</span> **REGLAS IMPORTANTES DE SEGURIDAD**:

1. **NUNCA subas el archivo `.env` a Git**
   - El archivo `.gitignore` ya está configurado para ignorarlo
   - Usa `.env.example` como plantilla sin valores reales

2. **Configura las reglas de Firestore apropiadamente**
   - No dejes la base de datos en "modo de prueba" en producción
   - Usa el archivo `firestore.rules` proporcionado

3. **Rota las credenciales regularmente**
   - Genera nuevas API keys en Firebase Console periódicamente
   - Actualiza las variables en Netlify

4. **Protege las funciones serverless**
   - No expongas credenciales de Firebase Admin SDK
   - Usa autenticación y autorización en las funciones

---

## <span class="material-icons">info</span> Notas Finales

### <span class="material-icons">build</span> Desarrollo Activo

Este proyecto está en desarrollo activo. Las funcionalidades pueden cambiar. Si encuentras errores o tienes sugerencias, por favor repórtalos.

### <span class="material-icons">library_books</span> Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de Netlify](https://docs.netlify.com/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### <span class="material-icons">contact_support</span> Soporte

Si tienes dudas o necesitas ayuda:

1. Revisa la sección de **Solución de Problemas Comunes**
2. Consulta la documentación de las tecnologías utilizadas
3. Contacta a tu docente

---

<span class="material-icons">emoji_events</span> **¡Buena suerte con el desarrollo y aprendizaje!**
