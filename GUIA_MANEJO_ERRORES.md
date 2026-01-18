# 🛡️ GUÍA DE MANEJO DE ERRORES - FutureLabs

**Última actualización:** 2025-01-15  
**Versión:** 1.0

---

## 📋 PRINCIPIOS

### 1. **Siempre usar ErrorHandler para errores de API**
Todos los errores de API deben pasar por `window.ErrorHandler.api()` para:
- Logging consistente
- Notificaciones apropiadas al usuario
- Manejo automático de errores comunes (401, 403, 500, etc.)

### 2. **No usar `alert()`**
`alert()` bloquea la UI y no es accesible. Usar `window.notifications` en su lugar.

### 3. **Logging condicional**
Siempre usar `window.Logger` en lugar de `console.log/error/warn` para respetar niveles de log en producción.

### 4. **Contexto siempre**
Siempre proporcionar contexto al manejar errores para facilitar debugging.

---

## 🎯 PATRONES RECOMENDADOS

### ✅ **Error de API (Recomendado)**
```javascript
try {
    const response = await window.api.getProduct(id);
    // ... procesar respuesta
} catch (error) {
    window.ErrorHandler.api(error, 'loadProduct', 'No se pudo cargar el producto');
    return;
}
```

### ✅ **Error con manejo personalizado**
```javascript
try {
    await someOperation();
} catch (error) {
    window.ErrorHandler.handle(error, {
        context: 'OperationName',
        userMessage: 'Mensaje amigable para el usuario',
        showNotification: true,
        logError: true,
        onError: (err, msg) => {
            // Manejo adicional si es necesario
        }
    });
}
```

### ✅ **Error de validación**
```javascript
if (!isValid) {
    window.ErrorHandler.validation('El campo es requerido', 'email');
    return;
}
```

### ✅ **Async seguro**
```javascript
const result = await window.ErrorHandler.safe(
    async () => await window.api.getData(),
    {
        context: 'loadData',
        userMessage: 'No se pudo cargar la información'
    }
);
```

### ❌ **NO HACER (Patrones incorrectos)**

#### ❌ Usar `alert()`
```javascript
// ❌ MAL
catch (error) {
    alert('Error: ' + error.message);
}
```

#### ❌ Solo log sin notificación
```javascript
// ❌ MAL
catch (error) {
    console.error(error);
    // Usuario no sabe qué pasó
}
```

#### ❌ Notificación sin contexto
```javascript
// ❌ MAL
catch (error) {
    window.notifications.error('Error', 'Algo salió mal');
    // No hay logging, no hay contexto
}
```

#### ❌ Manejo inconsistente
```javascript
// ❌ MAL - Diferentes formas en el mismo archivo
catch (error) {
    if (window.notifications) window.notifications.error('Error', error.message);
}
// ... más adelante ...
catch (error) {
    alert(error.message);
}
// ... más adelante ...
catch (error) {
    console.error(error);
}
```

---

## 🔧 CASOS DE USO ESPECÍFICOS

### **Errores de Red/Conectividad**
```javascript
try {
    await window.api.getData();
} catch (error) {
    // ErrorHandler detecta automáticamente errores de red
    window.ErrorHandler.api(error, 'getData', 'No se pudo conectar con el servidor');
}
```

### **Errores de Autenticación (401)**
```javascript
try {
    await window.api.getProtectedData();
} catch (error) {
    // ErrorHandler redirige automáticamente a login si es 401
    window.ErrorHandler.api(error, 'getProtectedData');
}
```

### **Errores de Validación de Formularios**
```javascript
if (!email || !window.Utils.validateEmail(email)) {
    window.ErrorHandler.validation('Email inválido', 'email');
    return;
}
```

### **Errores Silenciosos (Solo Log)**
```javascript
try {
    await optionalOperation();
} catch (error) {
    // No mostrar notificación, solo log
    window.ErrorHandler.handle(error, {
        context: 'optionalOperation',
        showNotification: false,
        logError: true
    });
}
```

---

## 📊 TIPOS DE ERRORES Y MANEJO

| Tipo de Error | Handler | Notificación | Log | Redirección |
|--------------|---------|--------------|-----|-------------|
| API Error | `ErrorHandler.api()` | ✅ Automática | ✅ | Si es 401 |
| Network Error | `ErrorHandler.api()` | ✅ "Error de Conexión" | ✅ | No |
| Validation Error | `ErrorHandler.validation()` | ✅ Warning | ❌ | No |
| Auth Error (401) | `ErrorHandler.api()` | ✅ "Sesión Expirada" | ✅ | ✅ A login |
| Permission Error (403) | `ErrorHandler.api()` | ✅ "Acceso Denegado" | ✅ | No |
| Server Error (500) | `ErrorHandler.api()` | ✅ "Error del Servidor" | ✅ | No |
| Silent Error | `ErrorHandler.handle()` | ❌ | ✅ | No |

---

## 🔍 VERIFICACIÓN DE CONSISTENCIA

### Checklist para cada archivo:
- [ ] ¿Se usa `ErrorHandler` para errores de API?
- [ ] ¿Se evita `alert()`?
- [ ] ¿Se usa `window.Logger` en lugar de `console.*`?
- [ ] ¿Se proporciona contexto en todos los errores?
- [ ] ¿Se muestra notificación al usuario cuando es apropiado?
- [ ] ¿El manejo de errores es consistente en todo el archivo?

---

## 📝 EJEMPLOS DE MIGRACIÓN

### Antes (Inconsistente):
```javascript
try {
    const data = await fetch('/api/data');
    if (!data.ok) {
        alert('Error al cargar datos');
    }
} catch (error) {
    console.error(error);
}
```

### Después (Consistente):
```javascript
try {
    const response = await window.api.getData();
    // ... procesar
} catch (error) {
    window.ErrorHandler.api(error, 'loadData', 'No se pudo cargar la información');
}
```

---

## 🎯 ARCHIVOS PRIORITARIOS PARA REVISAR

1. **js/checkout.js** - Manejo de errores en proceso de pago
2. **js/cart.js** - Errores al agregar/actualizar carrito
3. **js/product-detail.js** - Errores al cargar producto
4. **js/profile.js** - Errores al cargar perfil/pedidos
5. **js/products.js** - Errores al cargar catálogo

---

## ✅ BENEFICIOS

- **Consistencia:** Todos los errores se manejan de la misma forma
- **UX Mejorada:** Mensajes claros y apropiados para el usuario
- **Debugging:** Logging estructurado facilita encontrar problemas
- **Mantenibilidad:** Código más fácil de mantener y entender
- **Accesibilidad:** No se usa `alert()` que bloquea la UI

---

**Última revisión:** 2025-01-15
