}
# Seguridad en NicaQuizz

## Reglas de Firestore

Las reglas están en `firestore.rules`. Resumen:

- **users**: Lectura pública, escritura solo del dueño
- **questions**: Lectura solo aprobadas, escritura users (pending) o admin (approve)
- **challenges**: Solo participantes pueden leer/escribir
- **trades**: Solo participantes pueden leer, receiver puede aceptar
- **notifications**: Solo el dueño puede leer

## Validaciones del Cliente

En `src/validators.js`:

- `validateEmail()` - Formato de email
- `validatePassword()` - 6+ caracteres, letras y números
- `validateTrade()` - Ingredientes diferentes, 1-100 cantidad
- `validateQuestion()` - 4 opciones, categoría válida

## Error Tracking

La app usa Sentry para reportar errores en producción.

## Autenticación

- Firebase Auth con email/password
- Rutas protegidas con PrivateRoute
- Admin routes con AdminRoute
