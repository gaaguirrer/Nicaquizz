# NicaQuizz

Aplicación web educativa de preguntas y respuestas diseñada para estudiantes de nivel secundaria, desarrollada con **React**, **Vite** y **Firebase**.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Modos de Juego](#modos-de-juego)
- [Sistema de Economía](#sistema-de-economía)
- [Tienda](#tienda)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Implementación](#implementación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Solución de Problemas](#solución-de-problemas)
- [Documentación Adicional](#documentación-adicional)
- [Licencia](#licencia)

---

## Descripción

NicaQuizz es una plataforma educativa interactiva que combina el aprendizaje con la gamificación. Los estudiantes pueden poner a prueba sus conocimientos en diversas categorías mientras compiten con sus compañeros y ganan recompensas virtuales.

El juego utiliza la temática del **nacatamal nicaragüense** como sistema de economía, donde los estudiantes coleccionan ingredientes al responder correctamente las preguntas.

---

## Características Principales

### Sistema de Juego

| Característica | Descripción |
|----------------|-------------|
| **4 categorías** | Historia, Matemáticas, Geografía y Ciencias Naturales |
| **Temporizador** | 30 segundos por pregunta |
| **Dificultad** | Preguntas de nivel difícil |
| **Ranking mundial** | Compite con todos los jugadores registrados |
| **Ranking por categoría** | Sé el mejor en cada materia |
| **Estadísticas** | Seguimiento de aciertos, precisión y progreso |

### Sistema Social

- **Agregar amigos** - Conecta con otros jugadores mediante búsqueda por email
- **Retos en línea** - Compite contra amigos o jugadores disponibles
- **Perfiles públicos** - Muestra tus estadísticas e inventario
- **Estado en línea** - Ve quién está disponible para jugar
- **Historial de juego** - Revisa tu progreso y partidas anteriores

### Accesibilidad

- **Diseño responsivo** - Funciona en computadoras, tablets y móviles
- **Interfaz intuitiva** - Fácil de usar para estudiantes de todas las edades
- **Feedback inmediato** - Notificaciones de aciertos y errores

---

## Modos de Juego

### 1. Categorías

Selecciona una categoría específica y responde preguntas para ganar ingredientes del nacatamal.

| Categoría | Ingrediente | Descripción |
|-----------|-------------|-------------|
| Historia | Masa de Maíz | Historia de Nicaragua y Centroamérica |
| Matemáticas | Carne de Cerdo | Operaciones, álgebra y geometría |
| Geografía | Arroz | Geografía nacional y mundial |
| Ciencias Naturales | Papa | Biología, física y química |

**Recompensa**: 1 ingrediente por categoría completada (con al menos 1 acierto)

### 2. Retar Amigo

Desafía a un amigo específico y compite por el ranking.

- Elige un amigo de tu lista
- Selecciona categoría o juego libre
- El ganador gana 2 ingredientes

### 3. Reto Abierto

Compite contra jugadores en línea aleatorios.

- Emparejamiento automático
- Gana 2 chiles por victoria
- Disponible solo si el perfil es público

### 4. Ranking Mundial

Compite por estar en el top global.

- Ordenado por aciertos totales
- Desempate por precisión (porcentaje)
- Actualización en tiempo real

---

## Sistema de Economía

### Ingredientes del Nacatamal

Gana ingredientes respondiendo preguntas correctamente:

| Ingrediente | Símbolo | Cómo obtener |
|-------------|---------|--------------|
| Masa de Maíz | 🌽 | Categoría Historia |
| Carne de Cerdo | 🥩 | Categoría Matemáticas |
| Arroz | 🍚 | Categoría Geografía |
| Papa | 🥔 | Categoría Ciencias Naturales |
| Chile | 🌶️ | Retos abiertos |

### Nacatamal Completo

Un nacatamal se completa cuando tienes **al menos 1 de cada ingrediente**. Los nacatamales completos se usan como moneda en la tienda.

**Fórmula**: `Nacatamales = mínimo(masa, cerdo, arroz, papa, chile)`

### Progreso

```
Cada categoría completada → 1 ingrediente
Cada reto ganado → 2 ingredientes
Nacatamal completo → 1 moneda de tienda
```

---

## Tienda

### Mejoras (Power-ups)

Ventajas que puedes usar durante el juego:

| Mejora | Icono | Efecto | Uso |
|--------|-------|--------|-----|
| Pase | ⏭️ | Salta una pregunta difícil | Cuando no sabes la respuesta |
| Reloj de Arena | ⏱️ | Duplica el tiempo disponible | Para preguntas complejas |
| Comodín | 🎯 | Elimina opciones incorrectas | Reduce a 2 opciones |

### Trabas (Debuffs)

Desventajas que aplicas al oponente en retos:

| Traba | Icono | Efecto | Cuándo usar |
|-------|-------|--------|-------------|
| Reloj Rápido | ⏲️ | Reduce tiempo del oponente a la mitad | Cuando va ganando |
| Pregunta Difícil | ❓ | Agrega pregunta difícil | Para complicar |
| Sin Pistas | 🚫 | Elimina pistas del oponente | Cuando necesita ayuda |
| Controles Invertidos | 🔄 | Invierte los controles | Para confundir |

### Reglas de Uso

1. **Solo 1 mejora por partida** - No puedes usar múltiples mejoras en el mismo juego
2. **Las mejoras se recargan gratis cada 24 horas**
3. **Las trabas se compran con nacatamales completos**
4. **Precios dinámicos** - El precio varía según la demanda (+10% por compra, -25% mínimo)

---

## Tecnologías

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React | 19.x |
| Build | Vite | 6.x |
| Estilos | Tailwind CSS | 3.x |
| Rutas | React Router | 7.x |
| Backend | Firebase Firestore | - |
| Autenticación | Firebase Auth | - |
| Hosting | Vercel / Firebase Hosting | - |

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión 18 o superior
- **npm** o **yarn** como gestor de paquetes
- **Cuenta de Google** para Firebase
- **Git** para clonar el repositorio

### Verificar instalaciones

```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
git --version     # Debe mostrar 2.x.x
```

---

## Instalación

### Paso 1: Clonar el repositorio

```bash
cd "C:\Users\ingga\OneDrive\Documentos\Nueva carpeta"
git clone <url-del-repositorio> NicaQuizz
cd NicaQuizz
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- React y React DOM
- Vite (build tool)
- Tailwind CSS (estilos)
- Firebase SDK
- React Router (navegación)

### Paso 3: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **Agregar proyecto**
3. Sigue el asistente de configuración
4. Una vez creado, ve a **Configuración del proyecto** (engranaje)
5. Baja hasta **Tus apps** y haz clic en el ícono de web `</>`
6. Registra la app con el nombre "NicaQuizz"
7. Copia las credenciales de configuración

---

## Configuración

### Crear archivo .env

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### Editar .env

Abre `.env` y reemplaza con tus credenciales:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Habilitar servicios en Firebase

1. **Authentication**:
   - Ve a Authentication → Sign-in method
   - Habilita **Email/Password**

2. **Firestore Database**:
   - Ve a Firestore Database
   - Haz clic en **Crear base de datos**
   - Selecciona **Modo prueba** (para desarrollo)
   - Elige una ubicación (us-central1 recomendado)

3. **Reglas de seguridad** (ver [FIRESTORE_RULES_GUIDE.md](FIRESTORE_RULES_GUIDE.md))

---

## Ejecución

### Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa de la build |

---

## Implementación

### Opción A: Vercel (Recomendado)

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com/)
3. Haz clic en **Add New Project**
4. Importa tu repositorio de GitHub
5. Configura las variables de entorno (mismo contenido que .env)
6. Haz clic en **Deploy**

**Ventajas**:
- Deploy automático al hacer push
- HTTPS incluido
- CDN global

### Opción B: Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto
firebase init hosting

# Configurar:
# - Public directory: dist
# - Single page app: Yes
# - GitHub integration: Opcional

# Desplegar
firebase deploy
```

### Opción C: Netlify

1. Sube tu código a GitHub
2. Ve a [Netlify](https://app.netlify.com/)
3. **Add new site** → **Import an existing project**
4. Conecta tu repositorio
5. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Agrega las variables de entorno
7. **Deploy site**

---

## Estructura del Proyecto

```
NicaQuizz/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   └── UserMenu.jsx     # Menú de usuario
│   ├── context/             # Contextos de React
│   │   ├── AuthContext.jsx  # Autenticación y estado global
│   │   └── ToastContext.jsx # Notificaciones emergentes
│   ├── hooks/               # Hooks personalizados
│   │   └── useIsAdmin.js    # Verifica si es administrador
│   ├── pages/               # Páginas principales
│   │   ├── Landing.jsx      # Página de aterrizaje
│   │   ├── Auth.jsx         # Login/Registro
│   │   ├── PlayMode.jsx     # Selección de modos de juego
│   │   ├── Categories.jsx   # Lista de categorías
│   │   ├── Questions.jsx    # Juego de preguntas
│   │   ├── Ranking.jsx      # Rankings mundial y por categoría
│   │   ├── Shop.jsx         # Tienda de mejoras y trabas
│   │   ├── Profile.jsx      # Perfil e inventario
│   │   ├── Friends.jsx      # Amigos y solicitudes
│   │   ├── Challenge.jsx    # Retos en línea
│   │   ├── Trade.jsx        # Intercambio de monedas
│   │   ├── History.jsx      # Historial de juego
│   │   ├── Account.jsx      # Configuración de cuenta
│   │   ├── ProposeQuestion.jsx  # Proponer preguntas
│   │   └── AdminPanel.jsx   # Panel de administrador
│   ├── services/            # Servicios y utilidades
│   │   ├── api.js           # Funciones auxiliares
│   │   └── firestore.js     # Funciones de Firestore
│   ├── scripts/             # Scripts de utilidad
│   │   ├── load-data.js     # Cargar datos iniciales
│   │   └── make-admin.js    # Convertir usuario en admin
│   ├── App.jsx              # Componente principal con rutas
│   ├── firebase.js          # Configuración de Firebase
│   ├── index.css            # Estilos globales
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore               # Archivos a ignorar en Git
├── index.html               # HTML principal
├── package.json             # Dependencias y scripts
├── tailwind.config.js       # Configuración de Tailwind
├── vite.config.js           # Configuración de Vite
├── README.md                # Este archivo
├── ADMIN_GUIDE.md           # Guía para administradores
├── DATABASE_GUIDE.md        # Guía de base de datos
└── FIRESTORE_RULES_GUIDE.md # Configuración de reglas
```

---

## Solución de Problemas

### Error: "No se puede conectar con Firebase"

**Causa**: Credenciales incorrectas en .env

**Solución**:
1. Verifica que el archivo .env exista
2. Revisa que todas las variables estén completas
3. Reinicia el servidor de desarrollo

### Error: "Permission denied" en Firestore

**Causa**: Reglas de seguridad demasiado restrictivas

**Solución**:
1. Ve a Firebase Console → Firestore → Rules
2. Para desarrollo, usa reglas permisivas temporalmente
3. Ver [FIRESTORE_RULES_GUIDE.md](FIRESTORE_RULES_GUIDE.md)

### Error: "Usuario no encontrado"

**Causa**: El documento del usuario no existe en Firestore

**Solución**:
1. Cierra sesión
2. Vuelve a registrarte
3. Verifica en Firebase Console → Firestore → users

### Error: "Las monedas no se guardan"

**Causa**: Problema con las reglas de seguridad o la función addCoins

**Solución**:
1. Verifica las reglas de Firestore
2. Revisa la consola del navegador (F12)
3. Comprueba que la categoría tenga ingrediente asignado

### Error: "El ranking no se actualiza"

**Causa**: Las estadísticas no se están guardando

**Solución**:
1. Verifica que `updateUserStats` se llame después de cada respuesta
2. Revisa Firebase Console → Firestore → users/{uid}/stats
3. Comprueba que categoryStats se actualice correctamente

---

## Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Guía completa para administradores |
| [DATABASE_GUIDE.md](DATABASE_GUIDE.md) | Funcionamiento de la base de datos |
| [FIRESTORE_RULES_GUIDE.md](FIRESTORE_RULES_GUIDE.md) | Configuración de reglas de seguridad |

---

## Licencia

Este proyecto es de código abierto y puede ser modificado libremente para fines educativos.

---

## Contacto y Soporte

Para reportar errores o sugerencias, contacta al equipo de desarrollo o abre un issue en el repositorio.

---

**¡Disfruta aprendiendo con NicaQuizz!**
