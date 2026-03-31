# NicaQuizz

Aplicación web de preguntas y respuestas para estudiantes de nivel secundaria, desarrollada con **React**, **Vite**, **Netlify Functions** y **Firebase**.

## Características Principales

### Sistema de Juego
- **Preguntas difíciles** organizadas en 4 categorías
- **Ranking mundial** - Compite con todos los jugadores
- **Ranking por categoría** - Sé el mejor en cada materia
- **Temporizador** - 30 segundos por pregunta

### Economía del Nacatamal
Gana **ingredientes del nacatamal** respondiendo preguntas:
- **Masa de Maíz** - Categoría: Historia
- **Carne de Cerdo** - Categoría: Matemáticas
- **Arroz** - Categoría: Geografía
- **Papa** - Categoría: Ciencias Naturales
- **Aceituna** - Bonus por retos abiertos

¡Completa los 5 ingredientes para formar un **nacatamal** y comprar items!

### Tienda con Precios Dinámicos
- Los precios se ajustan según la **demanda** de cada item
- **Precio base** con variación según compras realizadas
- **Descuento máximo**: 25% del precio base
- **Aumento de precio**: Sin límite (10% por cada compra)

### Personalización de Personaje
- Personaje estilo **3D bits** personalizable
- **Slots de equipo**: Sombreros, Camisas, Pantalones, Botas, Accesorios

### Power-ups
- **Pasar Pregunta** (3 gratis)
- **Duplicar Tiempo** (2 gratis)
- **Reducir Opciones** (2 gratis)

### Sistema Social
- **Agregar amigos** - Conecta con otros jugadores
- **Retos en línea** - Compite contra amigos o jugadores disponibles
- **Perfiles públicos** - Muestra tus estadísticas
- **Estado en línea** - Ve quién está disponible para jugar

## � Arquitectura

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Netlify Functions   │────▶│    Firebase     │
│   (React/Vite)  │     │   (Serverless API)   │     │  (Auth/Firestore)│
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

### Ventajas de esta arquitectura:

1. **Seguridad**: Las credenciales de Firebase están en el servidor (funciones)
2. **Escalabilidad**: Netlify Functions escala automáticamente
3. **Costo cero**: Plan gratuito de Netlify + Firebase
4. **Performance**: CDN global de Netlify para el frontend

##  Estructura del Proyecto

```
Niquizz/
├── netlify/
│   └── functions/
│       ├── utils/
│       │   ├── firebase.js      # Config Firebase Admin
│       │   └── helpers.js       # Utilidades CORS
│       ├── auth.js              # Autenticación
│       ├── users.js             # CRUD usuarios
│       ├── data.js              # CRUD categorías, preguntas, items
│       └── init-db.js           # Inicializar BD
├── src/
│   ├── components/              # Componentes reutilizables
│   ├── context/
│   │   └── AuthContext.jsx      # Autenticación y estado global
│   ├── hooks/
│   │   └── useIsAdmin.js        # Hook para verificar admin
│   ├── pages/
│   │   ├── Auth.jsx             # Login/Registro
│   │   ├── Dashboard.jsx        # Página principal
│   │   ├── Categories.jsx       # Lista de categorías
│   │   ├── Questions.jsx        # Juego de preguntas
│   │   ├── Ranking.jsx          # Rankings mundial y por categoría
│   │   ├── Shop.jsx             # Tienda de items
│   │   ├── Profile.jsx          # Perfil, inventario y personaje
│   │   ├── Friends.jsx          # Amigos y retos
│   │   ├── ProposeQuestion.jsx
│   │   └── AdminPanel.jsx       # Panel de administrador
│   ├── services/
│   │   ├── api.js               # Cliente para Netlify Functions
│   │   └── firestore.js         # Constantes y utilidades
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── netlify.toml                 # Configuración Netlify
├── package.json
├── tailwind.config.js
├── vite.config.js
├── .env.example
└── README.md
```

## � Instalación y Desarrollo

### 1. Clonar el repositorio

```bash
cd Niquizz
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y reemplaza con tus credenciales de Firebase:

```bash
cp .env.example .env
```

Edita `.env`:
```
VITE_FIREBASE_API_KEY=TU_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=TU_PROYECTO.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=TU_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=TU_PROYECTO.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=TU_APP_ID
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

##  Implementación en Netlify

### Opción A: GitHub + Netlify (Recomendado)

1. Sube tu código a GitHub
2. Ve a [Netlify](https://app.netlify.com/)
3. **Add new site** → **Import an existing project**
4. Conecta tu repositorio
5. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Agrega las variables de entorno en Netlify
7. **Deploy site**

### Opción B: Netlify CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Iniciar sesión
netlify login

# Crear sitio
netlify init

# Desplegar
netlify deploy --prod
```

### Inicializar Base de Datos

Después del deploy, ejecuta:

```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/init-db
```

##  Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/.netlify/functions/auth` | Auth (signup/login) |
| GET | `/.netlify/functions/users?uid=xxx` | Obtener usuario |
| POST | `/.netlify/functions/users` | Crear usuario |
| PUT | `/.netlify/functions/users?uid=xxx` | Actualizar usuario |
| GET | `/.netlify/functions/data?collection=categories` | Obtener categorías |
| GET | `/.netlify/functions/data?collection=questions` | Obtener preguntas |
| POST | `/.netlify/functions/data` | Crear documento |
| PUT | `/.netlify/functions/data?collection=questions&id=xxx` | Actualizar |
| DELETE | `/.netlify/functions/data?collection=questions&id=xxx` | Eliminar |
| POST | `/.netlify/functions/init-db` | Inicializar BD |

##  Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de la build
```

##  Seguridad

### Variables de Entorno

Las credenciales de Firebase están configuradas como variables de entorno en Netlify, nunca en el código.

### Reglas de Firestore

Configura las siguientes reglas en Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /{collection=**}/{doc=**} {
      allow read, write: if true;
    }
  }
}
```

### Funciones Serverless

- Todas las funciones incluyen headers CORS
- Validación de datos de entrada
- Uso de Firebase Admin SDK para operaciones privilegiadas

## Roles de Usuario

### Usuario Normal
- Responder preguntas
- Ganar ingredientes
- Comprar items
- Personalizar personaje
- Agregar amigos
- Enviar/recibir retos

### Administrador
- Todo lo anterior, más:
- Aprobar/rechazar preguntas
- Crear categorías
- Ver estadísticas generales

Para asignar rol admin: Firebase Console → Firestore → users/{uid} → `isAdmin: true`

## Tecnologías

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Hosting**: Netlify

## Documentación Adicional

- [IMPLEMENTACION_RAPIDA.md](IMPLEMENTACION_RAPIDA.md) - Guía paso a paso para desplegar
- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Guía completa de implementación
- [netlify/functions/README.md](netlify/functions/README.md) - Documentación de funciones

## Licencia

Este proyecto es de código abierto y puede ser modificado libremente.

---

**¡Disfruta aprendiendo con NicaQuizz!**
