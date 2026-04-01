# Analytics y Monitoreo

## Google Analytics 4

La app ya tiene GA4 integrado vía Firebase Analytics.

### Eventos Automáticos

- `question_answered` - Cuando responden pregunta
- `challenge_completed` - Reto completado
- `item_purchased` - Compra en tienda
- `trade_completed` - Trueque completado
- `achievement_unlocked` - Logro desbloqueado

### Ver Datos

1. Firebase Console → Analytics → Dashboard
2. Link to Google Analytics para más detalles

## Sentry

Error tracking configurado en `ErrorBoundary.jsx`.

### Configurar

1. Crear proyecto en Sentry.io
2. Copiar DSN a `.env`:
   ```
   VITE_SENTRY_DSN=tu-dsn-aqui
   ```

## Métricas Clave

- DAU (usuarios diarios)
- MAU (usuarios mensuales)
- Retención D1, D7, D30
- Preguntas respondidas por día
- Retos completados
