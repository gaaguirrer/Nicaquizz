# Instrucciones para Commits de Git

## Reglas para Mensajes de Commit

1. **Sé simple y directo**
   - Ve al grano sobre qué cambió
   - No incluyas explicaciones extensas

2. **Sin emojis**
   - No uses 🚀 ✅ ❌ 🎉 ni ningún otro emoji
   - Solo texto plano

3. **Sin explicaciones de IA**
   - No escribas como si fueras un asistente
   - No incluyas frases como "Este commit agrega..." o "Se ha implementado..."
   - Escribe como un desarrollador hablando a otro desarrollador

4. **Formato recomendado**
   ```
   tipo: descripción corta del cambio

   - Detalle opcional 1
   - Detalle opcional 2
   ```

5. **Ejemplos**

   ✅ Bien:
   ```
   feat: agregar autenticación con Google
   fix: corregir error en login
   refactor: optimizar consultas a Firestore
   ```

   ❌ Mal:
   ```
   🚀 feat: Implementar autenticación con Google OAuth ✨
   
   Este commit agrega la funcionalidad de Google Sign-In...
   ```

## Ramas de Trabajo

- `main`: Solo código estable y verificado
- `actualizaciones`: Desarrollo activo y cambios en progreso
