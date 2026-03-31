# Configuración de Reglas de Firestore para NicaQuizz

## Problema Común: Error al Crear Cuenta

Si recibes el error "Ocurrió un error" al intentar registrarte con email/password, es probable que las reglas de seguridad de Firestore no estén configuradas correctamente.

## Solución Paso a Paso

### 1. Ir a Firebase Console
1. Abre https://console.firebase.google.com/
2. Selecciona tu proyecto: **bd-nicaquizz**
3. Haz clic en **Firestore Database** en el menú izquierdo

### 2. Verificar Reglas Actuales
1. Haz clic en la pestaña **Rules** (Reglas)
2. Revisa las reglas actuales

### 3. Actualizar Reglas (OPCIÓN 1 - Desarrollo)

Para desarrollo, usa reglas permisivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir todo en desarrollo (SOLO PARA DESARROLLO)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

 **ADVERTENCIA**: Estas reglas permiten que CUALQUIERA lea y escriba en tu base de datos. Úsalas SOLO en desarrollo.

### 4. Actualizar Reglas (OPCIÓN 2 - Producción)

Para producción, usa reglas seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Colección de usuarios
    match /users/{userId} {
      // Cualquier usuario autenticado puede crear su propio documento
      allow create: if request.auth != null && request.auth.uid == userId;
      // Solo el dueño puede leer/actualizar/borrar su documento
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Colección de preguntas
    match /questions/{questionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Colección de categorías
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Colección de shopItems
    match /shopItems/{itemId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Colección de challenges (retos)
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.challengedId == request.auth.uid || resource.data.challengerId == request.auth.uid);
    }

    // Colección de friendRequests
    match /friendRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }

    // Colección de trades (intercambios)
    match /trades/{tradeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }

    // Colección de gifts (regalos)
    match /gifts/{giftId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // Colección de answers (respuestas)
    match /answers/{answerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // Colección de currencies (monedas)
    match /currencies/{currencyId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 5. Publicar Reglas
1. Copia las reglas apropiadas (desarrollo o producción)
2. Pégalas en el editor de reglas
3. Haz clic en **Publish** (Publicar)

### 6. Verificar Habilitación de Email/Password
1. En Firebase Console, ve a **Authentication**
2. Haz clic en **Sign-in method**
3. Asegúrate de que **Email/Password** esté **Habilitado**
4. Si no lo está, haz clic en él y activa el interruptor

### 7. Probar Registro
1. Ve a http://localhost:3002/auth
2. Haz clic en "Registrarse"
3. Ingresa:
   - Nombre: Test User
   - Email: test@test.com
   - Contraseña: test123
4. Haz clic en "Registrarse"
5. Debería redirigirte al Dashboard

### 8. Verificar en Firebase Console
1. Ve a **Authentication** → **Users**
2. Deberías ver el usuario `test@test.com`
3. Ve a **Firestore Database**
4. Deberías ver la colección `users` con un documento (el UID del usuario)

## Códigos de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `auth/operation-not-allowed` | Email/Password no habilitado | Habilitar en Authentication → Sign-in method |
| `permission-denied` | Reglas de Firestore incorrectas | Actualizar reglas (ver arriba) |
| `auth/email-already-in-use` | Email ya registrado | Usar otro email o iniciar sesión |
| `auth/weak-password` | Contraseña < 6 caracteres | Usar contraseña más larga |
| `network-request-failed` | Sin conexión a internet | Verificar conexión |

## Debugging

Si aún tienes problemas, abre la consola del navegador (F12) y busca:
- ` Usuario Auth creado:` - El usuario se creó en Auth
- ` Perfil actualizado:` - El displayName se actualizó
- ` Guardando en Firestore:` - Intentando guardar en Firestore
- ` Error completo en signup:` - El error detallado

El mensaje de error te dirá exactamente qué está fallando.
