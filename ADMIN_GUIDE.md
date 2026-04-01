# Guía para Administradores - NicaQuizz

## Tabla de Contenidos

- [Introducción](#introducción)
- [Tipos de Usuario](#tipos-de-usuario)
- [Cómo Convertirse en Administrador](#cómo-convertirse-en-administrador)
- [Panel de Administración](#panel-de-administración)
- [Gestión de Preguntas](#gestión-de-preguntas)
- [Gestión de Categorías](#gestión-de-categorías)
- [Sistema de Monedas Infinitas](#sistema-de-monedas-infinitas)
- [Mejores Prácticas](#mejores-prácticas)
- [Mantenimiento Periódico](#mantenimiento-periódico)
- [Solución de Problemas](#solución-de-problemas)
- [Referencia de Funciones](#referencia-de-funciones)

---

## Introducción

Esta guía está diseñada para los administradores de NicaQuizz. Como administrador, tendrás acceso a herramientas especiales para gestionar el contenido del juego, aprobar preguntas de usuarios y mantener la calidad educativa de la plataforma.

### Responsabilidades del Administrador

- Revisar y aprobar preguntas enviadas por usuarios
- Crear y gestionar categorías de preguntas
- Monitorear la actividad de los usuarios
- Mantener la calidad del contenido educativo
- Resolver problemas técnicos básicos

---

## Tipos de Usuario

### Usuario Normal

Los usuarios normales pueden:

| Función | Descripción |
|---------|-------------|
| Jugar | Responder preguntas en las diferentes categorías |
| Ganar ingredientes | Obtener masa, cerdo, arroz, papa y chile |
| Comprar mejoras | Adquirir mejoras y trabas en la tienda |
| Agregar amigos | Conectar con otros jugadores |
| Enviar retos | Competir contra amigos o jugadores en línea |
| Proponer preguntas | Enviar preguntas para aprobación |
| Ver historial | Revisar su progreso y estadísticas |

### Administrador

Los administradores tienen todas las funciones del usuario normal, más:

| Función | Descripción |
|---------|-------------|
| Monedas infinitas | 9999 de cada ingrediente automáticamente |
| Panel de administración | Acceso a `/admin` para gestionar contenido |
| Aprobar preguntas | Revisar y aprobar preguntas pendientes |
| Rechazar preguntas | Eliminar preguntas de baja calidad |
| Crear categorías | Agregar nuevas categorías de preguntas |
| Eliminar categorías | Remover categorías obsoletas |
| Ver estadísticas | Acceder a métricas generales del sistema |

---

## Cómo Convertirse en Administrador

### Paso 1: Registro del Usuario

La persona debe tener una cuenta registrada en NicaQuizz:

1. Ve a `/auth` o haz clic en "Registrarse"
2. Completa el formulario:
   - Nombre completo
   - Email válido
   - Contraseña (mínimo 6 caracteres)
3. Haz clic en "Registrarse"
4. Inicia sesión con las credenciales

### Paso 2: Ejecutar el Script

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
node src/scripts/make-admin.js email@ejemplo.com
```

**Ejemplo:**

```bash
node src/scripts/make-admin.js profesor@nicaquizz.com
```

### Paso 3: Verificar el Resultado

El script mostrará:

```
Buscando usuario con email: profesor@nicaquizz.com
✓ Usuario encontrado
  Email: profesor@nicaquizz.com
  UID: abc123xyz456
  Nombre: Profesor NicaQuizz
✓ Permisos de administrador concedidos
  isAdmin: true
  adminGrantedAt: 2025-04-01T12:00:00.000Z
```

### Paso 4: Confirmar Acceso

El nuevo administrador debe:

1. Cerrar sesión
2. Volver a iniciar sesión
3. Verificar que aparece el enlace "Panel Admin" en el menú
4. Acceder a `/admin` para confirmar que funciona

### Solución de Problemas del Script

| Error | Causa | Solución |
|-------|-------|----------|
| "Usuario no encontrado" | Email incorrecto o no registrado | Verifica el email exacto |
| "Error de conexión" | Firebase no está configurado | Revisa el archivo .env |
| "Permission denied" | Reglas de Firestore restrictivas | Usa reglas de desarrollo temporalmente |

---

## Panel de Administración

El panel está ubicado en la ruta `/admin` y solo es accesible para administradores.

### Acceso al Panel

1. Inicia sesión con tu cuenta de administrador
2. Busca el enlace "Panel Admin" en el menú de navegación
3. Haz clic para acceder a `/admin`

**Nota**: Si no ves el enlace, verifica en Firebase Console → Firestore → users/{tu-uid} que `isAdmin: true`

### Estructura del Panel

El panel tiene tres pestañas principales:

```
┌─────────────────────────────────────────────────────┐
│  Panel de Administración                            │
├─────────────────────────────────────────────────────┤
│  [Preguntas Pendientes] [Categorías] [Monedas]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Contenido de la pestaña seleccionada               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Gestión de Preguntas

### Pestaña: Preguntas Pendientes

Aquí se muestran todas las preguntas enviadas por usuarios que esperan aprobación.

#### Información Mostrada

| Campo | Descripción |
|-------|-------------|
| Texto de la pregunta | Enunciado completo |
| Categoría | Materia a la que pertenece |
| Dificultad | Nivel (Fácil, Media, Difícil) |
| Opciones | Lista de respuestas posibles |
| Respuesta correcta | Opción correcta marcada |
| Fecha de envío | Cuándo fue propuesta |

#### Acciones Disponibles

**Aprobar:**
- La pregunta se publica inmediatamente
- Aparece en el juego para todos los usuarios
- El estado cambia a `approved`

**Rechazar:**
- La pregunta se elimina permanentemente
- No aparece en el juego
- El estado cambia a `rejected`

#### Criterios de Aprobación

Para aprobar una pregunta, verifica:

1. **Claridad**: El enunciado es claro y específico
2. **Una respuesta correcta**: Solo una opción es válida
3. **Información verídica**: Los datos son correctos
4. **Ortografía**: Sin errores ortográficos
5. **Originalidad**: No es una copia de otra pregunta
6. **Nivel apropiado**: Adecuada para secundaria

#### Ejemplo de Revisión

**Pregunta APROBABLE:**
```
¿Cuál es la capital de Nicaragua?
Opciones: León, Managua, Granada, Masaya
Correcta: Managua
```

**Pregunta RECHAZABLE:**
```
¿Quién fue el primero?
Opciones: Uno, Dos, Tres, Cuatro
Correcta: Uno
```
*Razón: Demasiado ambigua, sin contexto*

---

## Gestión de Categorías

### Pestaña: Categorías

Aquí puedes crear nuevas categorías o eliminar las existentes.

#### Crear Nueva Categoría

1. Haz clic en "Nueva Categoría"
2. Completa el formulario:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Nombre | Título de la categoría | "Literatura Universal" |
| Descripción | Breve explicación | "Obras y autores clásicos" |
| Ingrediente | Moneda que se gana | masa, cerdo, arroz, papa, chile |
| Icono | Material Icon | "menu_book", "science" |

3. Haz clic en "Crear Categoría"
4. Verifica que aparezca en la lista

#### Eliminar Categoría

1. Busca la categoría en la lista
2. Haz clic en el ícono de eliminar (papelera)
3. Confirma la eliminación
4. **Nota**: Las preguntas de esa categoría permanecen en la base de datos

#### Mejores Prácticas para Categorías

- **Nombres claros**: Usa nombres descriptivos
- **Descripciones útiles**: Explica qué contiene
- **Ingredientes balanceados**: Distribuye equitativamente
- **Iconos reconocibles**: Usa íconos relacionados

#### Categorías Sugeridas

| Categoría | Ingrediente | Icono |
|-----------|-------------|-------|
| Historia | masa | history_edu |
| Matemáticas | cerdo | calculate |
| Geografía | arroz | public |
| Ciencias Naturales | papa | science |
| Literatura | chile | menu_book |
| Arte | chile | palette |
| Música | chile | music_note |

---

## Sistema de Monedas Infinitas

### Pestaña: Monedas Infinitas

Esta sección es exclusiva para administradores.

### Funcionamiento

- **Automático**: Se otorgan 9999 de cada ingrediente al primer inicio de sesión
- **Manual**: Botón para recargar si se gastan

### Ingredientes para Admins

| Ingrediente | Cantidad |
|-------------|----------|
| Masa | 9999 |
| Cerdo | 9999 |
| Arroz | 9999 |
| Papa | 9999 |
| Chile | 9999 |

### Cuándo Usar

- **Pruebas**: Testear la tienda y compras
- **Demostraciones**: Mostrar el juego a nuevos usuarios
- **Desarrollo**: Probar nuevas funcionalidades

### No Usar Para

- Ventaja competitiva en rankings
- Dar a usuarios normales
- Modificar la economía del juego

---

## Mejores Prácticas

### Para Aprobar Preguntas

1. **Revisa diariamente**: No dejes preguntas pendientes más de 48 horas
2. **Sé consistente**: Usa los mismos criterios para todas
3. **Documenta rechazos**: Si puedes, explica por qué rechazas
4. **Equilibra categorías**: Asegura variedad en todas las materias

### Para Crear Categorías

1. **Planifica**: Piensa en cómo se relaciona con el currículo
2. **Consulta**: Habla con otros docentes antes de crear
3. **Prueba**: Juega en la nueva categoría antes de publicar
4. **Monitorea**: Revisa el rendimiento de los estudiantes

### Para Mantener la Calidad

1. **Actualiza contenido**: Reemplaza preguntas obsoletas
2. **Corrige errores**: Si encuentras un error, corrígelo
3. **Escucha feedback**: Considera sugerencias de usuarios
4. **Analiza estadísticas**: Revisa qué categorías se usan más

---

## Mantenimiento Periódico

### Diario

- [ ] Revisar preguntas pendientes
- [ ] Aprobar/rechazar nuevas propuestas
- [ ] Verificar que no haya contenido inapropiado

### Semanal

- [ ] Revisar estadísticas de uso
- [ ] Identificar categorías populares
- [ ] Detectar posibles errores

### Mensual

- [ ] Limpiar preguntas duplicadas
- [ ] Actualizar categorías obsoletas
- [ ] Revisar rendimiento del sistema
- [ ] Backup de la base de datos

---

## Solución de Problemas

### No Puede Acceder al Panel

**Síntoma**: El enlace "Panel Admin" no aparece

**Solución**:
1. Verifica en Firebase Console → Firestore → users/{tu-uid}
2. Confirma que `isAdmin: true`
3. Cierra sesión y vuelve a entrar
4. Revisa la consola del navegador (F12) por errores

### Las Monedas No Se Agregan

**Síntoma**: Los ingredientes no aparecen como 9999

**Solución**:
1. Verifica que el hook `useIsAdmin` funcione
2. Revisa las reglas de Firestore
3. Prueba recargar manualmente desde la pestaña
4. Verifica en Firebase Console → Firestore

### Las Preguntas No Aparecen

**Síntoma**: Las preguntas aprobadas no se ven en el juego

**Solución**:
1. Confirma que `status: "approved"`
2. Verifica que la categoría exista
3. Revisa que haya preguntas en esa categoría
4. Limpia la caché del navegador

### Error al Crear Categoría

**Síntoma**: La categoría no se guarda

**Solución**:
1. El nombre no puede estar vacío
2. El ingrediente debe estar seleccionado
3. El icono debe ser válido de Material Icons
4. Verifica conexión a internet

---

## Referencia de Funciones

### Funciones de Firestore para Administradores

| Función | Parámetros | Descripción |
|---------|------------|-------------|
| `fetchPendingQuestions()` | - | Obtiene preguntas pendientes |
| `approveQuestion(id)` | id de pregunta | Aprueba una pregunta |
| `rejectQuestion(id)` | id de pregunta | Rechaza una pregunta |
| `createCategoryAdmin(data)` | datos de categoría | Crea categoría |
| `deleteCategory(id)` | id de categoría | Elimina categoría |
| `addInfiniteCoins(uid)` | uid de usuario | Agrega monedas infinitas |
| `checkIfUserIsAdmin(uid)` | uid de usuario | Verifica si es admin |

### Estructura de Datos

**Usuario en Firestore:**
```javascript
{
  email: "admin@nicaquizz.com",
  displayName: "Administrador",
  isAdmin: true,
  adminGrantedAt: Timestamp,
  coins: {
    masa: 9999,
    cerdo: 9999,
    arroz: 9999,
    papa: 9999,
    chile: 9999
  },
  stats: {
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    wins: 0,
    losses: 0
  },
  mejoras: {
    pase: 3,
    reloj_arena: 2,
    comodin: 2
  },
  trabas: {}
}
```

**Pregunta en Firestore:**
```javascript
{
  text: "¿Cuál es la capital de Nicaragua?",
  correctAnswer: "Managua",
  categoryId: "geografia",
  status: "approved",
  createdBy: "uid-del-usuario",
  difficulty: "hard",
  options: ["Leon", "Managua", "Granada", "Masaya"],
  createdAt: Timestamp,
  approvedAt: Timestamp
}
```

**Categoría en Firestore:**
```javascript
{
  name: "Historia",
  description: "Historia de Nicaragua y Centroamérica",
  ingrediente: "masa",
  icon: "history_edu",
  createdAt: Timestamp
}
```

---

## Flujo de Aprobación de Preguntas

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌─────────┐
│ Usuario  │────▶│ Propone     │────▶│ Admin    │────▶│ Juego   │
│ Propone  │     │ Pregunta    │     │ Revisa   │     │ Publica │
└──────────┘     └─────────────┘     └──────────┘     └─────────┘
                      │                   │
                      ▼                   ▼
                 Pendiente           Aprueba/Rechaza
```

**Estados de una pregunta:**

| Estado | Descripción | Visible en juego |
|--------|-------------|------------------|
| `pending` | Esperando revisión | No |
| `approved` | Aprobada | Sí |
| `rejected` | Rechazada | No |

---

## Resumen

### Como Administrador:

- Revisa preguntas pendientes diariamente
- Asegura la calidad del contenido educativo
- Crea categorías nuevas según necesidad
- Mantén el orden en la base de datos
- Ayuda a los usuarios con problemas

### Como Usuario Normal:

- Juega y responde preguntas
- Gana ingredientes por categoría
- Propón preguntas nuevas
- Compite en el ranking
- Disfruta aprendiendo

---

**¡Gracias por contribuir a la calidad educativa de NicaQuizz!**
