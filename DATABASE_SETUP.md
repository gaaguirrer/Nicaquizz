# Configuración de Base de Datos

## Inicializar Firestore

```bash
# Datos básicos (categorías, preguntas, shop items)
npm run init-db

# Datos completos (departamentos, líderes, notificaciones)
npm run init-full-db
```

## Scripts Disponibles

- `src/scripts/init-db.js` - Datos básicos
- `src/scripts/init-full-db.js` - Datos completos
- `src/scripts/init-daily-collections.js` - Colecciones diarias
- `src/scripts/generate-daily-challenge.js` - Reto diario
- `src/scripts/migrate-users-for-achiote.js` - Migración de usuarios

## Colecciones

- `users` - Usuarios y sus datos
- `categories` - Categorías de preguntas
- `questions` - Preguntas (status: pending/approved/rejected)
- `challenges` - Retos entre usuarios
- `trades` - Trueques
- `shopItems` - Items de tienda
- `dailyChallenges` - Reto diario
- `dailyStats` - Estadísticas diarias
