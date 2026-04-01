# Guía de Reglas de Seguridad de Firestore - NicaQuizz

## Tabla de Contenidos

- [Introducción](#introducción)
- [Conceptos Básicos](#conceptos-básicos)
- [Estructura de las Reglas](#estructura-de-las-reglas)
- [Niveles de Seguridad](#niveles-de-seguridad)
- [Configuración Paso a Paso](#configuración-paso-a-paso)
- [Reglas por Colección](#reglas-por-colección)
- [Pruebas de Reglas](#pruebas-de-reglas)
- [Errores Comunes](#errores-comunes)
- [Mejores Prácticas](#mejores-prácticas)
- [Solución de Problemas](#solución-de-problemas)

---

## Introducción

Las reglas de seguridad de Firestore controlan quién puede leer y escribir en tu base de datos. Son fundamentales para proteger los datos de los usuarios y prevenir accesos no autorizados.

### ¿Por Qué Son Importantes?

| Razón | Descripción |
|-------|-------------|
| **Protección de datos** | Evita que usuarios accedan a información ajena |
| **Integridad** | Previene modificaciones malintencionadas |
| **Privacidad** | Controla qué información es pública |
| **Costos** | Evita lecturas/escrituras innecesarias |

### Características de las Reglas

- **Se ejecutan en el servidor**: No pueden ser bypasseadas desde el cliente
- **Se evalúan antes de cada operación**: Lectura, escritura, actualización, eliminación
- **Usan un lenguaje propio**: Similar a JavaScript pero con limitaciones
- **Son gratuitas**: No cuentan contra los límites del plan

---

## Conceptos Básicos

### Variables Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `request` | Datos de la solicitud | `request.auth.uid` |
| `resource` | Datos existentes (para update/delete) | `resource.data.isAdmin` |
| `get(path)` | Obtiene un documento específico | `get(/path/to/doc).data` |
| `exists(path)` | Verifica si un documento existe | `exists(/databases/$(database)/documents/users/$(request.auth.uid))` |

### Operadores Comunes

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `==` | Igualdad | `request.auth.uid == userId` |
| `!=` | Desigualdad | `request.auth.uid != userId` |
| `&&` | Y lógico | `a && b` |
| `||` | O lógico | `a || b` |
| `!` | Negación | `!condition` |
| `in` | Pertenece al array | `request.auth.uid in array` |
| `>` `<` `>=` `<=` | Comparación | `age > 18` |

### Funciones Útiles

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `request.auth != null` | Usuario autenticado | `allow read: if request.auth != null` |
| `request.auth.uid` | UID del usuario actual | `request.auth.uid == userId` |
| `request.time` | Timestamp actual | `request.time < timestamp` |
| `resource.data` | Datos actuales del documento | `resource.data.isAdmin == true` |
| `request.resource.data` | Datos que se van a escribir | `request.resource.data.keys().hasAll(['email'])` |

---

## Estructura de las Reglas

### Sintaxis Básica

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas aquí
  }
}
```

### Niveles de Anidación

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Nivel 1: Colección users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Nivel 2: Colección questions
    match /questions/{questionId} {
      allow read: if true;  // Público
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    // Función auxiliar
    function isAdmin() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return request.auth != null && userDoc.isAdmin == true;
    }
  }
}
```

### Funciones Personalizadas

```javascript
function isAdmin() {
  let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
  return request.auth != null && userDoc.isAdmin == true;
}

function isOwner(userId) {
  return request.auth != null && request.auth.uid == userId;
}

function isAuthenticated() {
  return request.auth != null;
}
```

---

## Niveles de Seguridad

### Nivel 1: Desarrollo (Muy Permisivo)

**Úsalo solo para desarrollo local. NUNCA en producción.**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Riesgos:**
- Cualquiera puede leer todos los datos
- Cualquiera puede modificar o eliminar datos
- No hay protección de información sensible

---

### Nivel 2: Producción Básico (Recomendado para empezar)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: Solo el dueño puede escribir
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Preguntas: Lectura pública, escritura autenticada
    match /questions/{questionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Categorías: Solo admins pueden escribir
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Items de tienda: Solo admins pueden escribir
    match /shopItems/{itemId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Retos: Solo participantes pueden modificar
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.challengerId == request.auth.uid || 
        resource.data.challengedId == request.auth.uid
      );
    }
    
    // Solicitudes de amistad: Solo involucrados pueden modificar
    match /friendRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.senderId == request.auth.uid || 
        resource.data.receiverId == request.auth.uid
      );
    }
    
    // Respuestas: Solo el usuario puede crear las suyas
    match /answers/{answerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Regla por defecto para otras colecciones
    match /{collection=**}/{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### Nivel 3: Producción Avanzado (Recomendado)

Incluye validación de datos y restricciones adicionales.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funciones auxiliares
    function isAdmin() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return request.auth != null && userDoc.isAdmin == true;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
    }
    
    // Usuarios
    match /users/{userId} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null && 
        request.auth.uid == userId &&
        isValidEmail(request.resource.data.email) &&
        request.resource.data.keys().hasAll(['email', 'displayName']);
      
      allow update: if isOwner(userId) &&
        !request.resource.data.keys().hasAny(['isAdmin', 'adminGrantedAt']); // No pueden auto-otorgarse admin
      
      allow delete: if isOwner(userId);
    }
    
    // Preguntas
    match /questions/{questionId} {
      allow read: if true;
      
      allow create: if request.auth != null &&
        request.resource.data.keys().hasAll(['text', 'correctAnswer', 'options', 'categoryId']) &&
        request.resource.data.text.size() > 0 &&
        request.resource.data.text.size() < 500 &&
        request.resource.data.options.size() >= 2 &&
        request.resource.data.options.size() <= 4;
      
      allow update, delete: if isAdmin();
    }
    
    // Categorías
    match /categories/{categoryId} {
      allow read: if true;
      
      allow create: if isAdmin() &&
        request.resource.data.keys().hasAll(['name', 'ingrediente']) &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() < 50;
      
      allow update, delete: if isAdmin();
    }
    
    // Items de tienda
    match /shopItems/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Retos
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null &&
        request.resource.data.challengerId == request.auth.uid &&
        request.resource.data.challengerId != request.resource.data.challengedId;
      
      allow update: if request.auth != null && (
        resource.data.challengerId == request.auth.uid || 
        resource.data.challengedId == request.auth.uid
      ) &&
      // Solo pueden cambiar ciertos campos
      request.resource.data.diff().keys().hasOnly(['status', 'winnerId', 'challengerScore', 'challengedScore', 'completedAt']);
    }
    
    // Solicitudes de amistad
    match /friendRequests/{requestId} {
      allow read: if request.auth != null && (
        resource.data.senderId == request.auth.uid || 
        resource.data.receiverId == request.auth.uid
      );
      
      allow create: if request.auth != null &&
        request.resource.data.senderId == request.auth.uid &&
        request.resource.data.senderId != request.resource.data.receiverId;
      
      allow update: if request.auth != null && (
        resource.data.senderId == request.auth.uid || 
        resource.data.receiverId == request.auth.uid
      );
    }
    
    // Respuestas
    match /answers/{answerId} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
    
    // Regla por defecto
    match /{collection=**}/{doc=**} {
      allow read: if request.auth != null;
      allow write: if false; // Nadie puede escribir por defecto
    }
  }
}
```

---

## Configuración Paso a Paso

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "bd-nicaquizz"
3. Haz clic en **Firestore Database** en el menú izquierdo

### Paso 2: Ir a la Pestaña de Reglas

1. En Firestore Database, haz clic en la pestaña **Rules** (Reglas)
2. Verás el editor de reglas con el código actual

### Paso 3: Copiar las Reglas

1. Selecciona todo el código actual (Ctrl+A)
2. Elimínalo (Delete)
3. Copia las reglas del nivel deseado (ver arriba)
4. Pégalas en el editor

### Paso 4: Publicar las Reglas

1. Haz clic en **Publish** (Publicar) en la esquina superior derecha
2. Confirma que quieres reemplazar las reglas actuales
3. Espera a que aparezca el mensaje de éxito

### Paso 5: Verificar

1. Ve a la pestaña **Data** (Datos)
2. Intenta leer/escribir desde tu aplicación
3. Si funciona, las reglas están correctas

---

## Reglas por Colección

### users

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Usuarios autenticados | `request.auth != null` |
| create | Dueño del documento | `request.auth.uid == userId` |
| update | Dueño del documento | `request.auth.uid == userId` |
| delete | Dueño del documento | `request.auth.uid == userId` |

**Validaciones recomendadas:**
- Email válido
- No permitir auto-otorgar admin
- Requerir campos básicos

---

### questions

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Todos (público) | `true` |
| create | Usuarios autenticados | `request.auth != null` |
| update | Administradores | `isAdmin()` |
| delete | Administradores | `isAdmin()` |

**Validaciones recomendadas:**
- Texto no vacío y < 500 caracteres
- 2-4 opciones
- Respuesta correcta debe estar en las opciones

---

### categories

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Todos (público) | `true` |
| create | Administradores | `isAdmin()` |
| update | Administradores | `isAdmin()` |
| delete | Administradores | `isAdmin()` |

---

### shopItems

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Todos (público) | `true` |
| create | Administradores | `isAdmin()` |
| update | Administradores | `isAdmin()` |
| delete | Administradores | `isAdmin()` |

---

### challenges

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Usuarios autenticados | `request.auth != null` |
| create | Usuarios autenticados | `request.auth != null` |
| update | Participantes | `challengerId == uid || challengedId == uid` |
| delete | Nadie | `false` |

---

### friendRequests

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Involucrados | `senderId == uid || receiverId == uid` |
| create | Usuarios autenticados | `request.auth != null` |
| update | Involucrados | `senderId == uid || receiverId == uid` |
| delete | Nadie | `false` |

---

### answers

| Operación | Quién puede | Condición |
|-----------|-------------|-----------|
| read | Usuarios autenticados | `request.auth != null` |
| create | Usuarios autenticados | `request.auth != null` |
| update | Nadie | `false` |
| delete | Nadie | `false` |

---

## Pruebas de Reglas

### Usando el Simulador de Reglas

Firebase Console incluye un simulador para probar reglas sin modificar datos reales.

**Pasos:**

1. Ve a Firebase Console → Firestore → Rules
2. Haz clic en **Simulator** (Simulador)
3. Configura la prueba:
   - **Location**: Selecciona la colección y documento
   - **Operation**: read, write, update, delete
   - **Authentication**: Simula usuario autenticado o anónimo
4. Haz clic en **Run** (Ejecutar)
5. Revisa el resultado: Allowed o Denied

### Ejemplos de Pruebas

**Prueba 1: Usuario autenticado lee su perfil**

```
Location: users/abc123
Operation: read
Authentication: Logged in (uid: abc123)
Expected: Allowed
```

**Prueba 2: Usuario no autenticado lee preguntas**

```
Location: questions/xyz789
Operation: read
Authentication: Anonymous
Expected: Allowed
```

**Prueba 3: Usuario normal intenta borrar categoría**

```
Location: categories/historia
Operation: delete
Authentication: Logged in (uid: abc123, isAdmin: false)
Expected: Denied
```

**Prueba 4: Admin crea categoría**

```
Location: categories/
Operation: create
Authentication: Logged in (uid: abc123, isAdmin: true)
Data: { name: "Arte", ingrediente: "chile" }
Expected: Allowed
```

### Usando la CLI de Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Ejecutar pruebas
firebase emulators:start --only firestore

# En otro terminal, ejecuta tu app y prueba las reglas
```

---

## Errores Comunes

### Error 1: Olvidar `request.auth != null`

**Incorrecto:**
```javascript
allow read: if request.auth.uid == userId;
```

**Correcto:**
```javascript
allow read: if request.auth != null && request.auth.uid == userId;
```

**Por qué**: Si `request.auth` es null, acceder a `request.auth.uid` causa error.

---

### Error 2: Usar `resource.data` en create

**Incorrecto:**
```javascript
allow create: if resource.data.isAdmin == true;
```

**Correcto:**
```javascript
allow create: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
```

**Por qué**: En create, `resource` no existe aún (es un documento nuevo).

---

### Error 3: No validar campos requeridos

**Incorrecto:**
```javascript
allow create: if request.auth != null;
```

**Correcto:**
```javascript
allow create: if request.auth != null &&
  request.resource.data.keys().hasAll(['email', 'displayName']);
```

**Por qué**: Sin validación, pueden crearse documentos incompletos.

---

### Error 4: Reglas demasiado permisivas en producción

**Incorrecto:**
```javascript
match /{document=**} {
  allow read, write: if true;
}
```

**Correcto:**
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
```

**Por qué**: Las reglas permisivas exponen todos los datos.

---

### Error 5: Sintaxis incorrecta de paths

**Incorrecto:**
```javascript
get(/databases/(database)/documents/users/$(request.auth.uid))
```

**Correcto:**
```javascript
get(/databases/$(database)/documents/users/$(request.auth.uid))
```

**Por qué**: El signo `$` debe estar dentro del path, no fuera.

---

## Mejores Prácticas

### 1. Usa Funciones Auxiliares

```javascript
// Bien
function isAdmin() {
  let doc = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
  return request.auth != null && doc.isAdmin == true;
}

allow update: if isAdmin();

// Mal
allow update: if request.auth != null && 
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
```

---

### 2. Valida Datos de Entrada

```javascript
// Bien
allow create: if request.auth != null &&
  request.resource.data.email.matches('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$') &&
  request.resource.data.displayName.size() > 0 &&
  request.resource.data.displayName.size() < 50;

// Mal
allow create: if request.auth != null;
```

---

### 3. Usa Reglas Específicas por Colección

```javascript
// Bien
match /users/{userId} { ... }
match /questions/{questionId} { ... }
match /categories/{categoryId} { ... }

// Mal
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

---

### 4. Niega por Defecto

```javascript
// Al final de tus reglas
match /{collection=**}/{doc=**} {
  allow read: if request.auth != null;
  allow write: if false; // Nadie puede escribir por defecto
}
```

---

### 5. Comenta Tus Reglas

```javascript
// Usuarios: Solo el dueño puede modificar su perfil
match /users/{userId} {
  allow read: if request.auth != null; // Cualquier usuario autenticado
  allow write: if request.auth.uid == userId; // Solo el dueño
}
```

---

## Solución de Problemas

### Error: "Ocurrió un error" al registrarse

**Síntoma**: El registro falla con mensaje genérico

**Causa probable**: Reglas de Firestore demasiado restrictivas

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca el error específico (ej: "Permission denied")
3. Revisa las reglas de la colección `users`
4. Asegúrate de permitir `create` para usuarios autenticados

---

### Error: "Permission denied" al leer preguntas

**Síntoma**: Las preguntas no se cargan

**Causa probable**: Regla de read en `questions` es muy restrictiva

**Solución**:
```javascript
// Cambia esto:
match /questions/{questionId} {
  allow read: if request.auth != null;
}

// Por esto:
match /questions/{questionId} {
  allow read: if true; // Público
}
```

---

### Error: "Missing or insufficient permissions"

**Síntoma**: Operación rechazada

**Causa probable**: La condición en la regla no se cumple

**Solución**:
1. Verifica que el usuario está autenticado
2. Revisa que el UID coincide
3. Para admins, verifica que `isAdmin: true` en Firestore

---

### Error: Las reglas no se aplican

**Síntoma**: Cambios en reglas no tienen efecto

**Causa probable**: Las reglas no se publicaron

**Solución**:
1. Ve a Firebase Console → Firestore → Rules
2. Haz clic en **Publish** (no solo Save)
3. Espera unos segundos
4. Prueba de nuevo

---

### Debugging con Logs

Agrega logs temporales en tu código para identificar el problema:

```javascript
// En tu código frontend
try {
  await addDoc(collection(db, 'questions'), newQuestion);
} catch (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
}
```

**Códigos de error comunes:**

| Código | Significado |
|--------|-------------|
| `permission-denied` | Reglas bloquean la operación |
| `unavailable` | Problema de conexión |
| `not-found` | Documento o colección no existe |
| `invalid-argument` | Datos inválidos |

---

## Referencia Rápida

### Plantilla Base

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funciones auxiliares
    function isAdmin() { ... }
    function isOwner(id) { ... }
    
    // Colecciones
    match /users/{userId} { ... }
    match /questions/{questionId} { ... }
    match /categories/{categoryId} { ... }
    
    // Regla por defecto
    match /{collection=**}/{doc=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

### Checklist de Seguridad

- [ ] Usuarios solo pueden modificar su propio documento
- [ ] Preguntas son públicas para lectura
- [ ] Solo admins pueden modificar categorías
- [ ] Retos solo pueden ser modificados por participantes
- [ ] Validación de campos requeridos
- [ ] Regla por defecto deniega escritura
- [ ] Funciones auxiliares definidas
- [ ] Comentarios explicativos agregados

---

**¡Configura correctamente tus reglas para mantener NicaQuizz seguro!**
