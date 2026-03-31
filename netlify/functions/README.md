# Netlify Functions README

## Instalación de Dependencias

Para desarrollar las funciones serverless localmente, instala las dependencias:

```bash
cd netlify/functions
npm install
```

## Funciones Disponibles

### 1. `auth.js` - Autenticación

Maneja el registro e inicio de sesión de usuarios.

**Endpoint:** `POST /.netlify/functions/auth`

**Body:**
```json
{
  "action": "signup",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "displayName": "Nombre Usuario"
}
```

**Respuesta:**
```json
{
  "uid": "abc123",
  "email": "usuario@ejemplo.com",
  "displayName": "Nombre Usuario",
  "token": "jwt-token..."
}
```

### 2. `users.js` - Gestión de Usuarios

CRUD de usuarios en Firestore.

**Endpoints:**
- `GET /.netlify/functions/users?uid=xxx` - Obtener perfil
- `POST /.netlify/functions/users` - Crear usuario
- `PUT /.netlify/functions/users?uid=xxx` - Actualizar (stats, coins, powerUps)

### 3. `data.js` - Datos Generales

CRUD para categorías, preguntas, items de tienda, respuestas.

**Endpoints:**
- `GET /.netlify/functions/data?collection=categories` - Obtener categorías
- `GET /.netlify/functions/data?collection=questions&status=approved` - Preguntas aprobadas
- `POST /.netlify/functions/data` - Crear documento
- `PUT /.netlify/functions/data?collection=questions&id=xxx` - Actualizar
- `DELETE /.netlify/functions/data?collection=questions&id=xxx` - Eliminar

### 4. `init-db.js` - Inicializar Base de Datos

Crea categorías, items de tienda y preguntas de ejemplo.

**Endpoint:** `POST /.netlify/functions/init-db`

**Respuesta:**
```json
{
  "success": true,
  "categories": 4,
  "shopItems": 25,
  "questions": 12
}
```

## Variables de Entorno

Las funciones requieren las siguientes variables en Netlify:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

## Desarrollo Local

Para probar las funciones localmente:

1. Instala Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Crea un archivo `.env` en la raíz:
   ```bash
   cp .env.example .env
   ```

3. Ejecuta:
   ```bash
   netlify dev
   ```

4. Las funciones estarán disponibles en `http://localhost:8888/.netlify/functions/`

## Pruebas con curl

```bash
# Inicializar BD
curl -X POST http://localhost:8888/.netlify/functions/init-db

# Obtener categorías
curl http://localhost:8888/.netlify/functions/data?collection=categories

# Registrar usuario
curl -X POST http://localhost:8888/.netlify/functions/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"signup","email":"test@test.com","password":"123456","displayName":"Test"}'
```

## Estructura de Respuestas

Todas las funciones siguen este formato:

**Éxito:**
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "error": "Mensaje de error"
}
```

## CORS

Todas las funciones incluyen headers CORS para permitir peticiones desde cualquier origen:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## Seguridad

- Las funciones usan la API REST de Firebase
- Para producción, considera usar Firebase Admin SDK con Service Account
- Las reglas de seguridad de Firestore aún son necesarias
- Nunca expongas credenciales en el código del cliente
