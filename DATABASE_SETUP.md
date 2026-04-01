# 📚 Configuración de Base de Datos - NicaQuizz

## Colecciones Requeridas

Para que todas las nuevas interfaces funcionen correctamente, necesitas las siguientes colecciones en Firebase Firestore:

### 1. Colecciones Existentes (ya creadas por init-db.js)

| Colección | Descripción |
|-----------|-------------|
| `users` | Usuarios y sus datos (monedas, mejoras, estadísticas) |
| `questions` | Preguntas del juego |
| `categories` | Categorías de preguntas |
| `shopItems` | Items de la tienda |
| `challenges` | Retos entre usuarios |
| `friendRequests` | Solicitudes de amistad |
| `answers` | Historial de respuestas |
| `trades` | Intercambios de trueque |
| `gifts` | Regalos entre usuarios |
| `currencies` | Configuración de monedas |

### 2. Colecciones Nuevas (para interfaces nuevas)

#### `departments` - Mapa de Conquista

**Campos requeridos:**
```javascript
{
  nombre: string,           // Nombre del departamento
  capital: string,          // Ciudad capital
  poblacion: number,        // Población aproximada
  extension: number,        // Extensión en km²
  region: string,           // Región (Pacífico, Norte, Central, Caribe, Sur)
  conquistado: boolean,     // Estado de conquista
  preguntasDisponibles: number,
  recompensa: {
    masa: number,
    cerdo: number,
    arroz: number,
    papa: number,
    chile: number
  },
  especial: string,         // Nombre especial (opcional)
  coordenadas: {
    lat: number,
    lng: number
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Índices necesarios:**
- `nombre` (ascendente) - para ordenar alfabéticamente

#### `regionalLeaders` - Líderes Regionales

**Campos requeridos:**
```javascript
{
  departamento: string,     // ID o nombre del departamento
  nombre: string,           // Nombre del líder
  puntos: number,           // Puntos de gloria
  influencia: number,       // Porcentaje de influencia (0-100)
  avatar: string,           // URL del avatar
  titulo: string,           // Título especial
  especialidad: string,     // Especialidad del líder
  activo: boolean,          // Estado activo
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Índices necesarios:**
- `activo` (ascendente)
- `departamento` + `activo` (compuesto)

#### `notifications` - Centro de Avisos

**Campos requeridos:**
```javascript
{
  userId: string,           // ID del usuario
  tipo: string,             // 'trueque', 'reto', 'logro', 'sistema'
  titulo: string,           // Título de la notificación
  mensaje: string,          // Mensaje completo
  leido: boolean,           // Estado de lectura
  data: object,             // Datos adicionales (opcional)
  acciones: array,          // Acciones disponibles (opcional)
  accion: string,           // Acción única (opcional)
  createdAt: Timestamp,
  readAt: Timestamp         // Fecha de lectura (opcional)
}
```

**Índices necesarios:**
- `userId` + `createdAt` (compuesto, descendente)
- `userId` + `leido` (compuesto)

### 3. Campos Nuevos en Colecciones Existentes

#### `users` - Campos Adicionales

```javascript
{
  // ... campos existentes ...
  
  // Mapa de Conquista
  departamentosConquistados: array,  // ['leon', 'granada', ...]
  conquestProgress: number,          // Total de departamentos conquistados
  lastConquestAt: Timestamp,         // Última conquista
  
  // Notificaciones
  unreadNotifications: number        // Contador de notificaciones no leídas
}
```

---

## 🚀 Inicialización Automática

### Opción 1: Inicialización Completa (Recomendado)

```bash
# Instalar dependencias de desarrollo
npm install

# Ejecutar script de inicialización completo
npm run init-full-db
```

Este script crea:
- ✅ 16 departamentos de Nicaragua
- ✅ 5 líderes regionales
- ✅ Verifica shopItems y categories existentes

### Opción 2: Inicialización Manual (Firebase Console)

Si prefieres crear las colecciones manualmente:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Crea cada colección manualmente con los campos especificados arriba

---

## 📋 Verificación de Datos

### Verificar Departamentos

```javascript
// En la consola del navegador (F12)
import { getDepartments } from './src/services/firestore-extensions.js';

const departamentos = await getDepartments();
console.log(`Total departamentos: ${departamentos.length}`);
console.log(departamentos.map(d => d.nombre));
```

### Verificar Líderes Regionales

```javascript
import { getRegionalLeaders } from './src/services/firestore-extensions.js';

const lideres = await getRegionalLeaders();
console.log(`Total líderes: ${lideres.length}`);
lideres.forEach(l => console.log(`${l.nombre} - ${l.departamento}`));
```

### Verificar Notificaciones de Usuario

```javascript
import { getUserNotifications } from './src/services/firestore-extensions.js';

const notificaciones = await getUserNotifications(currentUser.uid);
console.log(`Notificaciones: ${notificaciones.length}`);
notificaciones.forEach(n => console.log(`${n.tipo}: ${n.titulo}`));
```

---

## 🔧 Solución de Problemas

### Error: "The query requires an index"

**Causa:** Faltan índices compuestos en Firestore

**Solución:**
1. El mensaje de error incluye un enlace directo para crear el índice
2. Haz clic en el enlace
3. Espera a que el índice se construya (puede tomar varios minutos)

### Error: "Collection does not exist"

**Causa:** La colección no ha sido creada

**Solución:**
```bash
# Ejecutar el script de inicialización
npm run init-full-db
```

### Error: "Missing permissions"

**Causa:** Reglas de seguridad muy restrictivas

**Solución:**
1. Ve a Firebase Console → Firestore → Rules
2. Asegúrate de permitir lectura en las nuevas colecciones:
```javascript
match /departments/{deptId} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

match /regionalLeaders/{leaderId} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

match /notifications/{notifId} {
  allow read: if request.auth != null && 
    resource.data.userId == request.auth.uid;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}
```

---

## 📊 Estructura Completa de la Base de Datos

```
nicaquizz/
├── users/                    # Usuarios
│   └── {uid}/
│       ├── email
│       ├── displayName
│       ├── coins
│       ├── mejoras
│       ├── stats
│       ├── departamentosConquistados  ← NUEVO
│       └── conquestProgress         ← NUEVO
│
├── departments/              ← NUEVO
│   └── {deptId}/
│       ├── nombre
│       ├── capital
│       ├── region
│       └── ...
│
├── regionalLeaders/          ← NUEVO
│   └── {leaderId}/
│       ├── departamento
│       ├── nombre
│       ├── puntos
│       └── ...
│
├── notifications/            ← NUEVO
│   └── {notifId}/
│       ├── userId
│       ├── tipo
│       ├── titulo
│       └── ...
│
├── questions/
├── categories/
├── shopItems/
├── challenges/
├── friendRequests/
├── answers/
├── trades/
├── gifts/
└── currencies/
```

---

## ✅ Checklist de Verificación

- [ ] Colección `departments` creada con 16 departamentos
- [ ] Colección `regionalLeaders` creada con 5 líderes
- [ ] Colección `notifications` lista para uso
- [ ] Campos nuevos en `users` agregados al esquema
- [ ] Índices compuestos creados
- [ ] Reglas de seguridad actualizadas
- [ ] Script `init-full-db.js` ejecutado exitosamente

---

**¡Listo! Tu base de datos está configurada para todas las nuevas interfaces.**
