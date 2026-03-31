# Guía de Funcionamiento - Base de Datos y Rankings

## ¿Cómo se guardan los datos de los usuarios?

### Estructura de la Base de Datos

La aplicación usa **Firebase Firestore** con las siguientes colecciones:

```text
nicaquizz/
├── users/              → Datos de cada usuario
├── questions/          → Preguntas del juego
├── categories/         → Categorías disponibles
├── shopItems/          → Items de la tienda
├── challenges/         → Retos entre usuarios
├── friendRequests/     → Solicitudes de amistad
└── answers/            → Historial de respuestas
```

---

## 1. Colección `users` - Datos del Usuario

Cada usuario tiene un documento con su UID como ID:

```text
users/
  └── {uid-del-usuario}/
      ├── email: "usuario@ejemplo.com"
      ├── displayName: "Nombre"
      ├── isAdmin: false
      ├── coins: {
      │     maiz: 10,
      │     cerdo: 5,
      │     arroz: 8,
      │     papa: 3,
      │     aceituna: 1
      │   }
      ├── stats: {
      │     totalQuestionsAnswered: 50,
      │     totalCorrect: 35,
      │     wins: 5,
      │     losses: 3,
      │     categoryStats: {
      │       historia: { correct: 10, total: 15 },
      │       matematicas: { correct: 8, total: 12 },
      │       geografia: { correct: 12, total: 15 },
      │       ciencias: { correct: 5, total: 8 }
      │     }
      │   }
      ├── inventory: ["item1", "item2"]
      ├── equipped: {
      │     sombrero: "item1",
      │     camisa: "item2"
      │   }
      └── powerUps: {
            pass_question: 3,
            double_time: 2,
            reduce_options: 2
          }
```

### ¿Cuándo se actualizan estos datos?

#### Al Registrarse:

- Se crea el documento en `users/{uid}`
- Se establecen las monedas en 0
- Se asignan los power-ups iniciales (3, 2, 2)
- Se inicializan las estadísticas en 0

#### Al Jugar (Questions.jsx):

1. **Cada respuesta** se guarda en `answers/`
2. **Estadísticas** se actualizan en `users/{uid}/stats`
3. **Si acierta**: `totalCorrect` aumenta
4. **Si responde**: `totalQuestionsAnswered` aumenta
5. **Por categoría**: `categoryStats[categoria]` se actualiza

#### Al Completar el Quiz:

- Si tuvo al menos 1 acierto → Gana 1 moneda del ingrediente correspondiente
- La moneda se guarda en `users/{uid}/coins/{ingrediente}`

#### Al Ganar un Reto:

- `wins` aumenta en 1
- Gana 2 monedas (en vez de 1)

#### Al Perder un Reto:

- `losses` aumenta en 1

---

## 2. Rankings - ¿Cómo Funcionan?

### Ranking Mundial

**NO es una colección separada.** Se calcula en tiempo real consultando todos los usuarios:

```javascript
// src/services/firestore.js
export async function fetchGlobalRanking(limitCount = 100) {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Filtra usuarios que han respondido al menos 1 pregunta
  // Ordena por aciertos totales, luego por precisión
  const rankedUsers = users
    .filter(user => user.stats?.totalQuestionsAnswered > 0)
    .map(user => ({
      id: user.id,
      displayName: user.displayName,
      totalCorrect: user.stats?.totalCorrect || 0,
      accuracy: Math.round((user.stats?.totalCorrect || 0) / user.stats?.totalQuestionsAnswered * 100)
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

**¿Qué significa esto?**

- Cada vez que entras al ranking, se consultan TODOS los usuarios
- Se filtran los que nunca han jugado
- Se ordenan por: 1) Aciertos totales, 2) Precisión
- Se muestran los top 100

### Ranking por Categoría

Funciona igual, pero filtra por estadísticas de esa categoría:

```javascript
export async function fetchCategoryRanking(categoryId, limitCount = 100) {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Filtra usuarios que han jugado en esa categoría
  // Ordena por aciertos en esa categoría
  const rankedUsers = users
    .filter(user => user.stats?.categoryStats?.[categoryId]?.total > 0)
    .map(user => {
      const catStats = user.stats.categoryStats[categoryId] || { correct: 0, total: 0 };
      return {
        id: user.id,
        displayName: user.displayName,
        correct: catStats.correct || 0,
        total: catStats.total || 0,
        accuracy: Math.round((catStats.correct || 0) / catStats.total * 100)
      };
    })
    .sort((a, b) => {
      if (b.correct !== a.correct) {
        return b.correct - a.correct;
      }
      return b.accuracy - a.accuracy;
    })
    .slice(0, limitCount);

  return rankedUsers;
}
```

---

## 3. Flujo Completo del Juego

### Paso 1: Usuario se Registra

```javascript
// AuthContext.jsx
async function signup(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Crea documento en Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    displayName,
    coins: { maiz: 0, cerdo: 0, arroz: 0, papa: 0, aceituna: 0 },
    stats: { totalQuestionsAnswered: 0, totalCorrect: 0, wins: 0, losses: 0 },
    inventory: [],
    equipped: {},
    powerUps: { pass_question: 3, double_time: 2, reduce_options: 2 }
  });
}
```

### Paso 2: Usuario Juega

```javascript
// Questions.jsx
async function handleAnswer() {
  const correct = selectedAnswer === currentQuestion.correctAnswer;
  
  // 1. Guarda la respuesta en answers/
  await submitAnswer(currentUser.uid, questionId, categoryId, correct);
  
  // 2. Actualiza estadísticas en users/{uid}
  await updateUserStats(questionId, categoryId, correct);
  
  // 3. Si completó el quiz y tuvo aciertos, da moneda
  if (quizComplete && score.correct > 0) {
    await addCoins(currentUser.uid, categoryId, false);
  }
}
```

### Paso 3: Usuario Ve el Ranking

```javascript
// Ranking.jsx
useEffect(() => {
  async function loadRanking() {
    const ranking = await fetchGlobalRanking(100);
    setRanking(ranking);
    
    // Encuentra la posición del usuario actual
    const userIndex = ranking.findIndex(u => u.id === userData?.id);
    setUserRank(userIndex >= 0 ? userIndex + 1 : null);
  }
  loadRanking();
}, []);
```

---

## 4. ¿Qué Pasa Cuando...?

### Cuando un usuario responde correctamente:

```text
1. submitAnswer() → Guarda en answers/
   - { userId, questionId, isCorrect: true, categoryId, answeredAt }

2. updateUserStats() → Actualiza users/{uid}/stats
   - totalQuestionsAnswered: +1
   - totalCorrect: +1
   - categoryStats[categoria].correct: +1
   - categoryStats[categoria].total: +1

3. Si completó el quiz → addCoins()
   - coins[ingrediente]: +1
```

### Cuando un usuario responde incorrectamente:

```text
1. submitAnswer() → Guarda en answers/
   - { userId, questionId, isCorrect: false, categoryId, answeredAt }

2. updateUserStats() → Actualiza users/{uid}/stats
   - totalQuestionsAnswered: +1
   - totalCorrect: se mantiene
   - categoryStats[categoria].total: +1
   - categoryStats[categoria].correct: se mantiene
```

### Cuando un usuario gana un reto:

```text
1. completeChallenge() → Actualiza challenges/{id}
   - status: "completed"
   - winnerId: uid-del-ganador

2. updateUserStats() → Actualiza users/{uid}/stats
   - wins: +1

3. addCoins() → Actualiza users/{uid}/coins
   - coins[ingrediente]: +2 (en vez de +1)
```

---

## 5. Verificación de Datos

### ¿Cómo ver los datos en Firebase Console?

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto `bd-nicaquizz`
3. Click en **Firestore Database**
4. Explora las colecciones:

**Para ver un usuario:**

```text
users/
  └── {uid-del-usuario}/
      └── Ver el documento completo
```

**Para ver el historial de respuestas:**

```text
answers/
  └── Ver todos los documentos
      └── Filtrar por userId
```

**Para ver los rankings:**

- No hay colección `rankings`
- Se calcula automáticamente de `users/`

---

## 6. Comandos Útiles

### Ver estadísticas de un usuario:

```javascript
// En la consola del navegador (F12)
const user = await getUserProfile(uid);
console.log(user.stats);
```

### Ver ranking mundial:

```javascript
// En la consola del navegador (F12)
const ranking = await fetchGlobalRanking(10);
console.log(ranking);
```

### Ver monedas de un usuario:

```javascript
// En la consola del navegador (F12)
const user = await getUserProfile(uid);
console.log(user.coins);
```

---

## 7. Solución de Problemas

### "Las monedas no se guardan"

1. Verifica que `addCoins()` se llame al completar el quiz
2. Revisa las reglas de seguridad de Firestore
3. Verifica en Firebase Console → Firestore → users/{uid}/coins

### "El ranking no se actualiza"

1. El ranking se calcula en tiempo real, no se guarda
2. Verifica que `updateUserStats()` se llame después de cada respuesta
3. Revisa que `stats.totalCorrect` y `stats.totalQuestionsAnswered` se actualicen

### "Las victorias no se guardan"

1. Verifica que `completeChallenge()` se llame al terminar el reto
2. Revisa que `updateUserStats()` actualice `wins` o `losses`
3. Verifica en Firebase Console → Firestore → users/{uid}/stats

---

## Resumen

| ¿Qué se guarda? | ¿Dónde? | ¿Cuándo? |
|-----------------|---------|----------|
| Monedas | `users/{uid}/coins` | Al completar quiz o ganar reto |
| Aciertos | `users/{uid}/stats/totalCorrect` | Después de cada respuesta |
| Victorias | `users/{uid}/stats/wins` | Al ganar un reto |
| Respuestas | `answers/` | Después de cada respuesta |
| Ranking | No se guarda | Se calcula en tiempo real |

**Importante:** Los rankings NO son una colección, se calculan automáticamente consultando `users/` y ordenando por las estadísticas.
