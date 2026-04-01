# Guía de Base de Datos - NicaQuizz

## Tabla de Contenidos

- [Introducción](#introducción)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Colecciones](#colecciones)
- [Flujos de Datos](#flujos-de-datos)
- [Índices Requeridos](#índices-requeridos)
- [Consultas Comunes](#consultas-comunes)
- [Optimización](#optimización)
- [Backup y Restauración](#backup-y-restauración)
- [Solución de Problemas](#solución-de-problemas)

---

## Introducción

NicaQuizz utiliza **Firebase Firestore**, una base de datos NoSQL en tiempo real. Esta guía explica cómo se organizan los datos, cómo fluyen a través de la aplicación y cómo realizar operaciones comunes.

### Características de Firestore

| Característica | Descripción |
|----------------|-------------|
| Tipo | Documento-orientado (NoSQL) |
| Estructura | Colecciones → Documentos → Campos |
| Sincronización | Tiempo real automática |
| Escalabilidad | Automática y sin límites prácticos |
| Consultas | Por campos indexados |

---

## Estructura de la Base de Datos

### Diagrama de Colecciones

```
nicaquizz/
│
├── users/              → Datos de cada usuario
│   └── {uid}/          → Documento por usuario
│
├── questions/          → Preguntas del juego
│   └── {questionId}/   → Documento por pregunta
│
├── categories/         → Categorías disponibles
│   └── {categoryId}/   → Documento por categoría
│
├── shopItems/          → Items de la tienda
│   └── {itemId}/       → Documento por item
│
├── challenges/         → Retos entre usuarios
│   └── {challengeId}/  → Documento por reto
│
├── friendRequests/     → Solicitudes de amistad
│   └── {requestId}/    → Documento por solicitud
│
├── answers/            → Historial de respuestas
│   └── {answerId}/     → Documento por respuesta
│
└── currencies/         → Configuración de monedas
    └── {currencyId}/   → Documento por moneda
```

---

## Colecciones

### 1. users

Almacena información de cada usuario registrado.

**ID del documento**: UID de Firebase Auth

**Estructura:**

```javascript
{
  // Información básica
  email: "usuario@ejemplo.com",           // string
  displayName: "Nombre Usuario",          // string
  isAdmin: false,                         // boolean
  adminGrantedAt: Timestamp,              // Timestamp (opcional)
  
  // Monedas (ingredientes del nacatamal)
  coins: {
    masa: 10,                             // number
    cerdo: 5,                             // number
    arroz: 8,                             // number
    papa: 3,                              // number
    chile: 1                              // number
  },
  
  // Estadísticas de juego
  stats: {
    totalQuestionsAnswered: 50,           // number
    totalCorrect: 35,                     // number
    wins: 5,                              // number
    losses: 3,                            // number
    categoryStats: {                      // object
      historia: { correct: 10, total: 15 },
      matematicas: { correct: 8, total: 12 },
      geografia: { correct: 12, total: 15 },
      ciencias: { correct: 5, total: 8 }
    }
  },
  
  // Mejoras (power-ups)
  mejoras: {
    pase: 3,                              // number
    reloj_arena: 2,                       // number
    comodin: 2                            // number
  },
  
  // Trabas (debuffs)
  trabas: {
    reloj_rapido: 0,                      // number
    pregunta_dificil: 0,                  // number
    sin_pistas: 0,                        // number
    controles_invertidos: 0               // number
  },
  
  // Configuración de privacidad
  isPublicProfile: true,                  // boolean
  allowOpenChallenges: true,              // boolean
  
  // Estado en línea
  isOnline: false,                        // boolean
  lastSeen: Timestamp,                    // Timestamp
  
  // Lista de amigos (UIDs)
  friends: ["uid1", "uid2"],              // array
  
  // Recarga de mejoras
  lastMejoraRecharge: Timestamp,          // Timestamp
  
  // Metadata
  createdAt: "2025-04-01T12:00:00.000Z"  // string ISO
}
```

**Campos indexados automáticamente:**
- `email` (para búsquedas)
- `isPublicProfile`
- `allowOpenChallenges`
- `isOnline`

---

### 2. questions

Almacena todas las preguntas disponibles en el juego.

**ID del documento**: Auto-generado por Firestore

**Estructura:**

```javascript
{
  text: "¿Cuál es la capital de Nicaragua?",  // string
  correctAnswer: "Managua",                   // string
  options: ["Leon", "Managua", "Granada", "Masaya"], // array
  categoryId: "geografia",                    // string (referencia a categories)
  difficulty: "hard",                         // string: easy, medium, hard
  status: "approved",                         // string: pending, approved, rejected
  createdBy: "uid-del-usuario",               // string (referencia a users)
  createdAt: Timestamp,                       // Timestamp
  approvedAt: Timestamp,                      // Timestamp (opcional)
  rejectedAt: Timestamp                       // Timestamp (opcional)
}
```

**Estados de pregunta:**

| Estado | Descripción | Visible en juego |
|--------|-------------|------------------|
| `pending` | Enviada por usuario, esperando revisión | No |
| `approved` | Aprobada por admin | Sí |
| `rejected` | Rechazada por admin | No |

**Campos indexados:**
- `status` (para filtrar aprobadas)
- `categoryId` (para filtrar por categoría)
- `difficulty` (para filtrar por dificultad)
- `createdAt` (para ordenar)

---

### 3. categories

Define las categorías de preguntas disponibles.

**ID del documento**: Auto-generado o personalizado (ej: "historia")

**Estructura:**

```javascript
{
  name: "Historia",                         // string
  description: "Historia de Nicaragua y Centroamérica", // string
  ingrediente: "masa",                      // string: masa, cerdo, arroz, papa, chile
  icon: "history_edu",                      // string (Material Icon)
  createdAt: Timestamp                      // Timestamp
}
```

**Ingredientes válidos:**

| Ingrediente | Categoría típica |
|-------------|------------------|
| `masa` | Historia |
| `cerdo` | Matemáticas |
| `arroz` | Geografía |
| `papa` | Ciencias Naturales |
| `chile` | Bonus (retos, literatura, arte) |

---

### 4. shopItems

Items disponibles para compra en la tienda.

**ID del documento**: Auto-generado por Firestore

**Estructura:**

```javascript
{
  name: "Reloj de Arena",                   // string
  description: "Duplica tu tiempo disponible", // string
  type: "mejora",                           // string: mejora, traba
  icon: "timer",                            // string (Material Icon)
  basePrice: 1,                             // number (en nacatamales)
  currentPrice: 1,                          // number (calculado)
  timesPurchased: 15,                       // number
  totalRevenue: 15,                         // number
  active: true,                             // boolean
  createdAt: Timestamp                      // Timestamp
}
```

**Tipos de items:**

| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| `mejora` | Ventaja para el jugador | Reloj de Arena, Comodín, Pase |
| `traba` | Desventaja para el oponente | Reloj Rápido, Pregunta Difícil |

**Cálculo de precio dinámico:**

```javascript
const demandMultiplier = 1 + (timesPurchased * 0.1); // +10% por compra
const minPrice = basePrice * 0.75;                    // 25% mínimo
const currentPrice = Math.max(minPrice, basePrice * demandMultiplier);
```

---

### 5. challenges

Retos entre dos usuarios.

**ID del documento**: Auto-generado por Firestore

**Estructura:**

```javascript
{
  challengerId: "uid-retador",              // string (quien inicia)
  challengedId: "uid-desafiado",            // string (quien recibe)
  categoryId: "historia",                   // string (opcional, null = libre)
  isOpenChallenge: false,                   // boolean
  status: "pending",                        // string: pending, accepted, rejected, completed
  winnerId: "uid-ganador",                  // string (null hasta completar)
  challengerScore: 8,                       // number (aciertos)
  challengedScore: 6,                       // number (aciertos)
  createdAt: Timestamp,                     // Timestamp
  startedAt: Timestamp,                     // Timestamp (opcional)
  completedAt: Timestamp                    // Timestamp (opcional)
}
```

**Estados de reto:**

| Estado | Descripción | Acciones posibles |
|--------|-------------|-------------------|
| `pending` | Esperando aceptación | Aceptar, Rechazar |
| `accepted` | Aceptado, en progreso | Completar |
| `rejected` | Rechazado | Ninguna |
| `completed` | Finalizado | Ninguna |

---

### 6. friendRequests

Solicitudes de amistad entre usuarios.

**ID del documento**: Auto-generado por Firestore

**Estructura:**

```javascript
{
  senderId: "uid-remite",                   // string
  receiverId: "uid-destino",                // string
  status: "pending",                        // string: pending, accepted, rejected
  createdAt: Timestamp                      // Timestamp
}
```

---

### 7. answers

Historial de todas las respuestas dadas por los usuarios.

**ID del documento**: Auto-generado por Firestore

**Estructura:**

```javascript
{
  userId: "uid-usuario",                    // string
  questionId: "uid-pregunta",               // string
  categoryId: "historia",                   // string
  isCorrect: true,                          // boolean
  answeredAt: Timestamp                     // Timestamp
}
```

**Nota**: Esta colección puede crecer rápidamente. Considera archivar respuestas antiguas periódicamente.

---

### 8. currencies

Configuración de monedas especiales (opcional, para futuras expansiones).

**Estructura:**

```javascript
{
  name: "Token Dorado",                     // string
  description: "Moneda especial para items raros", // string
  icon: "star",                             // string
  defaultAmount: 0,                         // number
  active: true                              // boolean
}
```

---

## Flujos de Datos

### 1. Registro de Usuario

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario     │────▶│ Firebase    │────▶│ Firestore   │
│ se registra │     │ Auth        │     │ users/{uid} │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pasos:**

1. Usuario completa formulario de registro
2. Firebase Auth crea cuenta con email/password
3. Se genera UID único
4. Firestore crea documento en `users/{uid}` con:
   - Email y displayName
   - coins: todos en 0
   - stats: todos en 0
   - mejoras: pase=3, reloj_arena=2, comodin=2
   - trabas: vacío
   - isPublicProfile: true
   - allowOpenChallenges: true

---

### 2. Responder Pregunta

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario     │────▶│ Firestore   │────▶│ Firestore   │
│ responde    │     │ answers/    │     │ users/{uid} │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pasos:**

1. Usuario selecciona respuesta
2. Se compara con `correctAnswer`
3. Se guarda en `answers/`:
   - userId, questionId, categoryId, isCorrect, answeredAt
4. Se actualiza `users/{uid}/stats`:
   - totalQuestionsAnswered: +1
   - totalCorrect: +1 (si es correcta)
   - categoryStats[categoria].total: +1
   - categoryStats[categoria].correct: +1 (si es correcta)

---

### 3. Completar Categoría

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Quiz        │────▶│ Verifica    │────▶│ Agrega      │
│ completado  │     │ aciertos    │     │ ingrediente │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pasos:**

1. Usuario completa todas las preguntas de la categoría
2. Se verifica si tuvo al menos 1 acierto
3. Si sí, se agrega 1 ingrediente correspondiente:
   - historia → masa
   - matematicas → cerdo
   - geografia → arroz
   - ciencias → papa
4. Se actualiza `users/{uid}/coins/{ingrediente}: increment(1)`

---

### 4. Ganar Reto

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario     │────▶│ Actualiza   │────▶│ Agrega      │
│ gana reto   │     │ challenge   │     │ 2 monedas   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pasos:**

1. Se determina el ganador por mayor cantidad de aciertos
2. Se actualiza `challenges/{id}`:
   - status: "completed"
   - winnerId: uid del ganador
   - challengerScore, challengedScore
   - completedAt: Timestamp
3. Se actualiza `users/{winnerUid}/stats/wins: increment(1)`
4. Se agregan 2 monedas del ingrediente correspondiente

---

### 5. Comprar en Tienda

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Usuario     │────▶│ Verifica    │────▶│ Consume     │
│ compra item │     │ nacatamal   │     │ ingredientes│
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pasos:**

1. Usuario selecciona item
2. Se verifica si tiene nacatamal completo (1 de cada ingrediente)
3. Si no tiene, se rechaza la compra
4. Si tiene, se consume 1 nacatamal:
   - masa: -1, cerdo: -1, arroz: -1, papa: -1, chile: -1
5. Se agrega la mejora o traba correspondiente
6. Se actualiza `shopItems/{id}`:
   - timesPurchased: +1
   - totalRevenue: +currentPrice

---

## Índices Requeridos

Firestore requiere índices compuestos para ciertas consultas. Configúralos en Firebase Console → Firestore → Índices.

### Índices Automáticos

Firestore crea índices automáticos para:
- Campos individuales
- Ordenamientos simples

### Índices Compuestos Necesarios

| Colección | Campos | Ordenamiento | Uso |
|-----------|--------|--------------|-----|
| questions | status, categoryId, difficulty | createdAt desc | Filtrar preguntas por categoría |
| questions | status, difficulty | createdAt desc | Filtrar todas las preguntas |
| challenges | challengedId, status | createdAt desc | Retos recibidos |
| friendRequests | receiverId, status | - | Solicitudes recibidas |
| users | isPublicProfile, allowOpenChallenges | - | Jugadores disponibles |

### Cómo Crear Índices

1. Ve a Firebase Console
2. Selecciona tu proyecto
3. Firestore Database → Pestaña "Índices"
4. Haz clic en "Agregar índice"
5. Configura:
   - Colección
   - Campos a indexar
   - Ordenamiento
6. Guarda y espera (puede tomar varios minutos)

---

## Consultas Comunes

### Obtener Perfil de Usuario

```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

async function getUserProfile(uid) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}
```

### Obtener Preguntas Aprobadas por Categoría

```javascript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

async function getQuestionsByCategory(categoryId, difficulty = 'hard') {
  const q = query(
    collection(db, 'questions'),
    where('status', '==', 'approved'),
    where('categoryId', '==', categoryId),
    where('difficulty', '==', difficulty),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

### Obtener Ranking Mundial

```javascript
async function getGlobalRanking(limitCount = 100) {
  const snapshot = await getDocs(collection(db, 'users'));
  
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  const rankedUsers = users
    .filter(user => user.stats?.totalQuestionsAnswered > 0)
    .map(user => ({
      id: user.id,
      displayName: user.displayName,
      totalCorrect: user.stats?.totalCorrect || 0,
      accuracy: Math.round(
        (user.stats?.totalCorrect || 0) / user.stats?.totalQuestionsAnswered * 100
      )
    }))
    .sort((a, b) => {
      if (b.totalCorrect !== a.totalCorrect) {
        return b.totalCorrect - a.totalCorrect;
      }
      return b.accuracy - a.accuracy;
    })
    .slice(0, limitCount);
  
  return rankedUsers;
}
```

### Obtener Amigos de un Usuario

```javascript
async function getFriends(uid) {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  
  if (!docSnap.exists()) return [];
  
  const friendIds = docSnap.data().friends || [];
  if (friendIds.length === 0) return [];
  
  const friends = await Promise.all(
    friendIds.map(id => getUserProfile(id))
  );
  
  return friends.filter(f => f !== null);
}
```

### Obtener Retos Pendientes

```javascript
async function getPendingChallenges(uid) {
  const q = query(
    collection(db, 'challenges'),
    where('challengedId', '==', uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## Optimización

### Mejores Prácticas

1. **Indexa campos consultados**: Si filtras por un campo, indexalo
2. **Limita resultados**: Usa `limit()` para no traer datos innecesarios
3. **Pagina resultados**: Para listas largas, usa paginación
4. **Evita lecturas innecesarias**: Cachea datos cuando sea posible
5. **Usa escuchas en tiempo real solo cuando necesites**: `onSnapshot` consume más recursos que `getDocs`

### Estructura de Datos Eficiente

**Bien:**
```javascript
// Datos anidados para acceso rápido
stats: {
  totalQuestionsAnswered: 50,
  totalCorrect: 35,
  categoryStats: {
    historia: { correct: 10, total: 15 }
  }
}
```

**Mal:**
```javascript
// Datos separados que requieren múltiples lecturas
statsTotal: { answered: 50, correct: 35 }
statsHistoria: { answered: 15, correct: 10 }
statsMatematicas: { answered: 12, correct: 8 }
```

### Costos de Lectura/Escritura

| Operación | Costo |
|-----------|-------|
| Lectura de documento | 1 lectura |
| Escritura de documento | 1 escritura |
| Actualización de campo | 1 escritura |
| Eliminación de documento | 1 escritura |

**Plan gratuito de Firestore:**
- 50,000 lecturas/día
- 20,000 escrituras/día
- 20,000 eliminaciones/día

---

## Backup y Restauración

### Exportar Datos

Usa la herramienta de línea de comandos de Firebase:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Exportar toda la base de datos
firebase firestore:export gs://tu-bucket/backup-2025-04-01
```

### Importar Datos

```bash
# Importar desde backup
firebase firestore:import gs://tu-bucket/backup-2025-04-01
```

### Backup Manual (Colección por Colección)

```javascript
// Script para exportar una colección
import { collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';

async function exportCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  writeFileSync(`${collectionName}-backup.json`, JSON.stringify(data, null, 2));
  console.log(`Exportados ${data.length} documentos de ${collectionName}`);
}

// Uso
exportCollection('users');
exportCollection('questions');
exportCollection('categories');
```

### Restaurar desde JSON

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

async function importCollection(collectionName, filePath) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  
  for (const doc of data) {
    const { id, ...rest } = doc;
    await addDoc(collection(db, collectionName), rest);
  }
  
  console.log(`Importados ${data.length} documentos a ${collectionName}`);
}
```

---

## Solución de Problemas

### Error: "Too many document reads"

**Causa**: Se excedió el límite de lecturas del plan gratuito

**Solución**:
1. Implementa paginación
2. Cachea datos en el frontend
3. Reduce la frecuencia de actualizaciones
4. Considera actualizar al plan pay-as-you-go

### Error: "The query requires an index"

**Causa**: La consulta combina campos que no están indexados juntos

**Solución**:
1. Lee el mensaje de error (incluye enlace para crear el índice)
2. Haz clic en el enlace o crea el índice manualmente
3. Espera a que el índice se construya (puede tomar minutos)

### Error: "Permission denied"

**Causa**: Las reglas de Firestore no permiten la operación

**Solución**:
1. Revisa las reglas en Firebase Console → Firestore → Rules
2. Para desarrollo, usa reglas más permisivas temporalmente
3. Para producción, ajusta las reglas según necesites

### Datos No Se Sincronizan

**Causa**: Problema de conexión o escuchas mal configuradas

**Solución**:
1. Verifica conexión a internet
2. Revisa que las escuchas `onSnapshot` estén correctamente configuradas
3. Limpia la caché del navegador
4. Revisa la consola por errores

### Colección `answers` Muy Grande

**Causa**: Se guardan todas las respuestas sin límite

**Solución**:
1. Implementa archivado automático (respuestas > 30 días)
2. Guarda solo estadísticas agregadas, no cada respuesta
3. Considera no guardar el historial completo en producción

---

## Referencia Rápida

### Tipos de Datos en Firestore

| Tipo | Ejemplo | Notas |
|------|---------|-------|
| string | "Hola" | Texto Unicode |
| number | 42, 3.14 | Entero o flotante |
| boolean | true, false | Valor lógico |
| null | null | Valor nulo |
| Timestamp | Timestamp.now() | Fecha y hora |
| GeoPoint | new GeoPoint(lat, lng) | Ubicación geográfica |
| Array | [1, 2, 3] | Lista de valores |
| Map/Object | { a: 1, b: 2 } | Objeto anidado |

### Operaciones Atómicas

| Operación | Método | Ejemplo |
|-----------|--------|---------|
| Incrementar | `increment(n)` | `coins: increment(1)` |
| Decrementar | `increment(-n)` | `coins: increment(-1)` |
| Agregar al array | `arrayUnion(x)` | `friends: arrayUnion(uid)` |
| Remover del array | `arrayRemove(x)` | `friends: arrayRemove(uid)` |
| Valor actual | `serverTimestamp()` | `createdAt: serverTimestamp()` |

---

**¡Esta guía te ayudará a entender y gestionar la base de datos de NicaQuizz!**
