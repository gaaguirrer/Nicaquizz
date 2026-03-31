# Sistema de Administradores - NicaQuizz

## Introduccion

Este documento explica como funciona el sistema de administradores en NicaQuizz. La idea es que entiendan bien como gestionar el contenido del juego y como pueden contribuir con nuevas preguntas.

## Tipos de Usuario

En el sistema tenemos dos tipos de usuarios:

### Usuario Normal

Como usuario normal ustedes pueden:

- Jugar y responder preguntas en las diferentes categorias
- Ganar ingredientes del nacatamal (maiz, cerdo, arroz, papa, aceituna)
- Comprar items en la tienda
- Personalizar tu personaje
- Proponer nuevas preguntas para que otros jugadores las respondan

### Administrador

El administrador tiene todo lo que tiene el usuario normal, mas estas funciones:

- Monedas infinitas automaticas: 9999 de cada ingrediente al iniciar sesion
- Acceso al panel de administracion en `/admin`
- Aprobar o rechazar preguntas enviadas por usuarios
- Crear nuevas categorias de preguntas
- Eliminar categorias existentes

## Panel de Administracion

El panel esta en la ruta `/admin` y solo pueden entrar los administradores. Tiene tres pestanas:

### Preguntas Pendientes

Aqui van a ver todas las preguntas que los usuarios enviaron. Para cada una pueden:

- Ver el contenido completo: texto, respuesta correcta, categoria y dificultad
- Aprobar: La pregunta se publica y aparece en el juego
- Rechazar: La pregunta se elimina

Mi recomendacion es que revisen esta seccion regularmente para mantener el contenido actualizado.

### Categorias

Aqui pueden gestionar las categorias:

**Para crear una nueva:**

1. Pongan el nombre (ej: "Literatura Universal")
2. Agreguen una descripcion si quieren
3. Seleccionen el ingrediente asociado (esto determina que moneda se gana al jugar)
4. Elijan un icono de Material Icons
5. Click en "Crear Categoria"

**Para eliminar una existente:**

- Click en el icono de eliminar al lado de la categoria
- Confirmen la eliminacion
- Tengan en cuenta que las preguntas de esa categoria quedan en la base de datos

### Monedas Infinitas

Esta seccion es solo para administradores. Muestra los 5 ingredientes con 9999 cada uno y un boton para recargar manualmente.

Las monedas infinitas se agregan solas cuando un administrador inicia sesion por primera vez, pero esta pestana les sirve si necesitan recargar manualmente en algun momento.

## Como Proponer una Pregunta

Si quieren contribuir con preguntas al juego, sigan estos pasos:

1. Vayan a `/propose` o hagan click en "Proponer Pregunta" en el menu
2. Completen el formulario:
   - Categoria: Seleccionen la relacionada con su pregunta
   - Dificultad: Facil, Media o Dificil
   - Pregunta: Escriban el enunciado
   - Opciones: De 2 a 4 opciones de respuesta
   - Respuesta Correcta: Debe coincidir exactamente con una de las opciones
3. Revisen que todo este correcto
4. Click en "Enviar Pregunta"
5. Van a recibir una confirmacion

**¿Que pasa despues?**

Su pregunta queda pendiente. Un administrador la va a revisar y si la aprueba, va a aparecer en el juego para todos. Si la rechaza, no se va a ver.

## Consejos para Crear Buenas Preguntas

Para que aprueben sus preguntas, tengan en cuenta esto:

1. **Claridad**: Redacten de forma clara y especifica
2. **Una sola respuesta correcta**: Que no haya lugar a dudas
3. **Informacion veridica**: Verifiquen los datos antes de enviar
4. **Originalidad**: Eviten preguntas demasiado obvias o repetidas
5. **Ortografia**: Revisen antes de enviar

## Como Hacer Administrador a un Usuario

Si necesitan que alguien sea administrador, sigan estos pasos:

### Paso 1: Registro

La persona tiene que crear una cuenta primero. Sin cuenta registrada, no se puede asignar el rol.

### Paso 2: Ejecutar el script

Abran una terminal en la carpeta del proyecto y ejecuten:

```bash
node src/scripts/make-admin.js email@ejemplo.com
```

Pongan el correo del usuario que va a ser administrador.

**Ejemplo:**

```bash
node src/scripts/make-admin.js profesor@nicaquizz.com
```

### Paso 3: Verificar

El script les va a mostrar:

- Email del usuario
- UID del usuario
- Nombre del usuario
- Permisos concedidos

### Paso 4: Iniciar sesion

El nuevo administrador tiene que cerrar sesion y volver a entrar. Cuando ingrese, va a ver:
- El enlace "Panel Admin" en la navegacion

- Monedas infinitas en su cuenta
- Acceso a `/admin`

## Estructura de Datos

### Usuario en Firestore

Cada usuario se guarda en `users` asi:

```javascript
{
  email: "usuario@ejemplo.com",
  displayName: "Nombre del Usuario",
  isAdmin: false,
  coins: {
    maiz: 10,
    cerdo: 5,
    arroz: 8,
    papa: 3,
    aceituna: 1
  },
  stats: {
    totalQuestionsAnswered: 50,
    totalCorrect: 35,
    wins: 5,
    losses: 3
  }
}
```

### Pregunta en Firestore

Las preguntas van a `questions`:

```javascript
{
  text: "¿Cual es la capital de Nicaragua?",
  correctAnswer: "Managua",
  categoryId: "geografia",
  status: "approved",
  createdBy: "uid-del-usuario",
  difficulty: "hard",
  options: ["Leon", "Managua", "Granada", "Masaya"],
  createdAt: Timestamp
}
```

### Categoria en Firestore

Las categorias van a `categories`:

```javascript
{
  name: "Historia",
  description: "Historia de Nicaragua y Centroamerica",
  ingrediente: "maiz",
  icon: "history_edu",
  createdAt: Timestamp
}
```

## Flujo de Aprobacion

```text
Usuario → Propone Pregunta → Pendiente → Admin Revisa → Aprueba/Rechaza
```

Si aprueban: `status: "approved"` y aparece en el juego
Si rechazan: se elimina la pregunta

## Componentes Relacionados

| Componente | Ruta | Que hace |
|------------|------|----------|
| AdminPanel.jsx | /admin | Panel de administracion |
| ProposeQuestion.jsx | /propose | Formulario para proponer |

## Funciones de Firestore

| Funcion | Que hace |
|---------|----------|
| fetchPendingQuestions() | Obtiene preguntas pendientes |
| approveQuestion(id) | Aprueba una pregunta |
| rejectQuestion(id) | Rechaza una pregunta |
| createCategoryAdmin() | Crea categoria (solo admin) |
| deleteCategory(id) | Elimina categoria (solo admin) |
| proposeQuestion() | Propone pregunta (usuarios) |
| addInfiniteCoins(uid) | Agrega monedas infinitas |
| checkIfUserIsAdmin(uid) | Verifica si es admin |

## Script make-admin.js

Este script convierte un usuario en administrador.

**Uso:**

```bash
node src/scripts/make-admin.js email@ejemplo.com
```

**Lo que hace:**

1. Busca el usuario por email en Firestore
2. Pone `isAdmin: true`
3. Agrega la fecha de cuando se le dio el rol
4. Muestra los datos del usuario

## Reglas de Seguridad

Para production, configuren esto en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /questions/{questionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if get(/databases/(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if get(/databases/(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /{collection=**}/{doc=**} {
      allow read, write: if true;
    }
  }
}
```

## Solucion de Problemas

### No puede acceder al panel

1. Verifiquen que `isAdmin: true` en Firestore
2. Cierren sesion y vuelvan a entrar
3. Revisen la consola del navegador

### Las monedas no se agregan

1. Verifiquen que el hook `useIsAdmin` este funcionando
2. Revisen las reglas de Firestore
3. Prueben agregar manualmente desde la pestana

### Las preguntas no aparecen

1. Verifiquen que `status: "pending"`
2. Revisen que `fetchPendingQuestions` funcione
3. Chequeen los indices en Firebase Console

### Error al crear categoria

1. El nombre no puede estar vacio
2. El ingrediente tiene que estar seleccionado
3. El icono tiene que ser valido de Material Icons

## Resumen

**Como administrador:**

- Revisar preguntas pendientes
- Asegurar la calidad del contenido
- Crear categorias nuevas
- Mantener el orden

**Como usuario normal:**

- Jugar y responder preguntas
- Ganar premios por categorias
- Proponer preguntas nuevas
- Competir en el ranking
