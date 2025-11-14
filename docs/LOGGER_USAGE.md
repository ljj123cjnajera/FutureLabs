# 📝 Guía de Uso del Sistema de Logging

## 🎯 Propósito

El sistema de logging condicional (`js/logger.js`) permite:
- **Desarrollo**: Ver todos los logs (debug, info, warn, error)
- **Producción**: Solo mostrar errores críticos

## 🚀 Uso Básico

### Reemplazar `console.log`
```javascript
// ❌ Antes
console.log('✅ Producto agregado al carrito');

// ✅ Ahora
window.Logger.success('Producto agregado al carrito');
// o
window.Logger.info('Producto agregado al carrito');
```

### Reemplazar `console.error`
```javascript
// ❌ Antes
console.error('❌ Error cargando productos:', error);

// ✅ Ahora
window.Logger.error('Error cargando productos:', error);
```

### Reemplazar `console.warn`
```javascript
// ❌ Antes
console.warn('⚠️ Respuesta inválida del servidor:', response);

// ✅ Ahora
window.Logger.warn('Respuesta inválida del servidor:', response);
```

### Para debugging detallado
```javascript
// Solo se muestra en desarrollo
window.Logger.debug('Estado del carrito:', cartData);
```

## 📊 Niveles de Log

1. **ERROR** (0) - Siempre visible
   - Errores críticos que afectan funcionalidad
   - Usar: `window.Logger.error()`

2. **WARN** (1) - Visible en desarrollo
   - Advertencias que no bloquean pero son importantes
   - Usar: `window.Logger.warn()`

3. **INFO** (2) - Visible en desarrollo
   - Información general del flujo
   - Usar: `window.Logger.info()`

4. **DEBUG** (3) - Solo desarrollo
   - Información detallada para debugging
   - Usar: `window.Logger.debug()`

5. **SUCCESS** (2) - Visible en desarrollo
   - Operaciones completadas exitosamente
   - Usar: `window.Logger.success()`

## 🔍 Detección Automática

El logger detecta automáticamente si está en desarrollo o producción:

- **Desarrollo**: `localhost`, `127.0.0.1`, o protocolo `file:`
- **Producción**: Cualquier otro dominio

## 📝 Ejemplos de Migración

### Ejemplo 1: HomeManager
```javascript
// ❌ Antes
console.log('🏠 HomeManager init() - Iniciando...');
console.log('✅ HomeManager inicializado correctamente');
console.error('❌ Error inicializando HomeManager:', error);

// ✅ Ahora
window.Logger.info('HomeManager init() - Iniciando...');
window.Logger.success('HomeManager inicializado correctamente');
window.Logger.error('Error inicializando HomeManager:', error);
```

### Ejemplo 2: AuthManager
```javascript
// ❌ Antes
console.log('🔐 AuthManager.login() - Iniciando con:', email);
console.log('✅ Usuario autenticado:', this.currentUser.email);
console.error('❌ Error en login:', error);

// ✅ Ahora
window.Logger.debug('AuthManager.login() - Iniciando con:', email);
window.Logger.success('Usuario autenticado:', this.currentUser.email);
window.Logger.error('Error en login:', error);
```

## ⚠️ Notas Importantes

1. **No eliminar logs de error**: Los `Logger.error()` siempre se muestran, incluso en producción
2. **Usar debug para información sensible**: Los logs de debug no aparecen en producción
3. **Mantener información útil**: Los logs deben ayudar a diagnosticar problemas
4. **No loggear datos sensibles**: Nunca loggear contraseñas, tokens completos, etc.

## 🔄 Migración Gradual

No es necesario migrar todo de una vez. Se puede hacer gradualmente:

1. Empezar con archivos nuevos
2. Migrar archivos que se modifiquen
3. Migrar archivos críticos primero (auth, api, checkout)

## 🎨 Formato de Mensajes

El logger agrega automáticamente:
- **Emojis** para identificación visual
- **Timestamps** en desarrollo
- **Niveles** de log apropiados

No es necesario incluir emojis en los mensajes, el logger los agrega automáticamente.

