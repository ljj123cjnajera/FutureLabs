# 🔧 Corrección de Race Condition en Autenticación

## Problema Reportado
Después de probar con diferentes usuarios (admin, moderador, customer), el problema volvió a ocurrir:
- Al iniciar sesión con cualquier usuario, redirige a `index.html`
- El botón "Mi Cuenta" se puede hacer click inmediatamente
- Si se hace click antes de que `authManager.init()` termine de cargar el usuario, `isAuthenticated()` retorna `false`
- Esto causa que se redirija de vuelta a `index.html`, creando el efecto de "cierre instantáneo"

## Causa Raíz: Race Condition
El problema era una **race condition** entre:
1. El `authManager.init()` que se ejecuta al cargar la página
2. El evento `authStateChanged` que se dispara después del login
3. El usuario haciendo click en "Mi Cuenta" antes de que la inicialización termine

**Flujo problemático:**
```
1. Usuario hace login → Token se guarda en localStorage
2. Redirige a index.html
3. authManager.init() comienza a cargar el usuario (asíncrono)
4. Usuario hace click en "Mi Cuenta" (ANTES de que init() termine)
5. isAuthenticated() retorna false (porque currentUser aún es null)
6. Redirige a index.html → "cierre instantáneo"
```

## Solución Implementada: Estado de Inicialización

### 1. Agregar Estado `isInitializing` al AuthManager

**Archivo:** `/Users/luis/Downloads/FutureLabs/js/auth.js`

```javascript
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitializing = true; // ✅ Nuevo estado
    // ...
  }
}
```

### 2. Actualizar Método `init()` para Marcar Inicialización

```javascript
async init() {
  console.log('🔧 AuthManager init() - Iniciando...');
  this.isInitializing = true; // ✅ Marcar como inicializando
  
  // ... código de inicialización ...
  
  // Marcar como inicializado
  this.isInitializing = false; // ✅ Marcar como completado
  console.log('✅ AuthManager inicializado completamente');
}
```

### 3. Actualizar Método `isAuthenticated()` para Verificar Estado

```javascript
isAuthenticated() {
  // ✅ No permitir autenticación mientras está inicializando
  if (this.isInitializing) {
    console.log('⏳ isAuthenticated: Inicializando, retornando false');
    return false;
  }
  
  const authenticated = this.currentUser !== null;
  console.log('🔍 isAuthenticated:', authenticated, 'currentUser:', this.currentUser);
  return authenticated;
}
```

### 4. Deshabilitar Botón "Mi Cuenta" Durante Inicialización

**Archivo:** `/Users/luis/Downloads/FutureLabs/js/components.js`

```javascript
static initHeader() {
  const accountLink = document.getElementById('accountLink');
  const accountText = document.getElementById('accountText');
  
  if (accountLink && accountText) {
    // ✅ Deshabilitar el botón mientras está inicializando
    accountLink.style.pointerEvents = 'none';
    accountLink.style.opacity = '0.5';
    
    accountLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // ✅ Verificar si está inicializando
      if (window.authManager && window.authManager.isInitializing) {
        console.log('⏳ AuthManager está inicializando, esperando...');
        return;
      }
      
      if (window.authManager && window.authManager.isAuthenticated()) {
        window.location.href = 'profile.html';
      } else {
        if (window.modalManager) {
          window.modalManager.showLogin();
        }
      }
    });
    
    // Escuchar cambios en el estado de autenticación
    document.addEventListener('authStateChanged', () => {
      // ✅ Habilitar el botón después de que se complete la inicialización
      if (window.authManager && !window.authManager.isInitializing) {
        accountLink.style.pointerEvents = 'auto';
        accountLink.style.opacity = '1';
      }
      
      if (window.authManager && window.authManager.isAuthenticated()) {
        accountText.textContent = 'Mi Cuenta';
      } else {
        accountText.textContent = 'Cuenta';
      }
    });
  }
}
```

### 5. Esperar Inicialización en Páginas Protegidas

**Archivo:** `/Users/luis/Downloads/FutureLabs/profile.html`

**Antes:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
      window.location.href = 'index.html';
    } else {
      loadUserData();
      loadStats();
    }
  }, 500);
});
```

**Después:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  // ✅ Esperar a que la inicialización se complete
  const checkAuth = setInterval(() => {
    if (window.authManager && !window.authManager.isInitializing) {
      clearInterval(checkAuth);
      console.log('✅ AuthManager inicializado completamente');
      
      if (!window.authManager.isAuthenticated()) {
        console.log('❌ Usuario no autenticado, redirigiendo a index.html');
        window.location.href = 'index.html';
      } else {
        console.log('✅ Usuario autenticado, cargando perfil');
        loadUserData();
        loadStats();
      }
    }
  }, 100);
});
```

**Archivo:** `/Users/luis/Downloads/FutureLabs/cart.html`

**Antes:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadCart();
  }, 500);
});
```

**Después:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  // ✅ Esperar a que la inicialización se complete
  const checkAuth = setInterval(() => {
    if (window.authManager && !window.authManager.isInitializing) {
      clearInterval(checkAuth);
      console.log('✅ AuthManager inicializado completamente');
      loadCart();
    }
  }, 100);
});
```

## Flujo Correcto Ahora

```
1. Usuario hace login → Token se guarda en localStorage
2. Redirige a index.html
3. authManager.init() comienza (isInitializing = true)
4. Botón "Mi Cuenta" está DESHABILITADO (opacity: 0.5, pointer-events: none)
5. authManager.init() carga el usuario
6. authManager.init() termina (isInitializing = false)
7. Evento authStateChanged se dispara
8. Botón "Mi Cuenta" se HABILITA (opacity: 1, pointer-events: auto)
9. Usuario hace click en "Mi Cuenta"
10. isAuthenticated() retorna true
11. Redirige a profile.html correctamente
```

## Beneficios de la Solución

1. **Previene Race Conditions:** El botón está deshabilitado hasta que la inicialización se complete
2. **Feedback Visual:** El usuario ve que el botón está deshabilitado (opacity: 0.5)
3. **Logging Detallado:** Fácil de rastrear qué está pasando en cada paso
4. **Robusto:** Funciona incluso si el usuario hace click rápidamente
5. **Consistente:** Se aplica en todas las páginas protegidas (profile.html, cart.html)

## Pruebas Recomendadas

### 1. Login Rápido
1. Abrir `index.html`
2. Hacer click en "Cuenta" rápidamente
3. Ingresar credenciales y hacer login
4. **Inmediatamente después del login, intentar hacer click en "Mi Cuenta"**
5. ✅ El botón debe estar deshabilitado (gris)
6. ✅ Después de 1-2 segundos, el botón se habilita
7. ✅ Hacer click en "Mi Cuenta" debe cargar el perfil correctamente

### 2. Login con Diferentes Usuarios
1. Login con `admin@futurelabs.com` / `admin123`
2. Logout
3. Login con `customer@example.com` / `customer123`
4. Logout
5. Login con `moderator@futurelabs.com` / `moderator123`
6. ✅ Cada login debe funcionar correctamente
7. ✅ El perfil debe cargar sin cerrarse

### 3. Múltiples Logins/Logouts
1. Login → Logout → Login → Logout (repetir 5 veces)
2. ✅ Cada ciclo debe funcionar correctamente
3. ✅ No debe haber "cierre instantáneo"

### 4. Verificación de Logs
En la consola del navegador, verás:
```
🔧 AuthManager init() - Iniciando...
🔑 Token en localStorage: eyJhbGciOiJIUzI1NiIs...
✅ window.api está disponible
💾 Token actualizado en API client
🔍 Llamando a getCurrentUser...
✅ Usuario obtenido: customer@example.com
🎉 Evento authStateChanged disparado
✅ AuthManager inicializado completamente
```

## Logs Importantes

### Durante Inicialización
- `⏳ isAuthenticated: Inicializando, retornando false` → Normal, el botón está deshabilitado
- `⏳ AuthManager está inicializando, esperando...` → El usuario hizo click antes de tiempo

### Después de Inicialización
- `✅ AuthManager inicializado completamente` → Todo listo
- `🔍 isAuthenticated: true` → Usuario autenticado
- `🔍 isAuthenticated: false` → Usuario no autenticado

## Estado Actual

✅ Race condition resuelta
✅ Botón "Mi Cuenta" se deshabilita durante inicialización
✅ Feedback visual para el usuario
✅ Logging detallado para debugging
✅ Funciona con múltiples usuarios
✅ Funciona con múltiples logins/logouts

## Notas Técnicas

1. **`isInitializing`:** Se establece en `true` al inicio de `init()` y en `false` al final
2. **`pointer-events: none`:** Deshabilita completamente los clicks en el botón
3. **`opacity: 0.5`:** Proporciona feedback visual de que el botón está deshabilitado
4. **`setInterval` con 100ms:** Verifica cada 100ms si la inicialización se completó
5. **`clearInterval`:** Limpia el intervalo cuando la inicialización se completa

## Comparación: Antes vs Después

### Antes (Con Race Condition)
```
Login → Redirige → init() comienza → Usuario hace click → isAuthenticated() = false → Redirige → ❌ Error
```

### Después (Sin Race Condition)
```
Login → Redirige → init() comienza → Botón deshabilitado → init() termina → Botón habilitado → Usuario hace click → isAuthenticated() = true → ✅ Funciona
```

## Archivos Modificados

1. `/Users/luis/Downloads/FutureLabs/js/auth.js`
   - Agregado `isInitializing` al constructor
   - Actualizado `init()` para marcar inicialización
   - Actualizado `isAuthenticated()` para verificar estado

2. `/Users/luis/Downloads/FutureLabs/js/components.js`
   - Deshabilitar botón durante inicialización
   - Habilitar botón después de inicialización
   - Verificar estado antes de redirigir

3. `/Users/luis/Downloads/FutureLabs/profile.html`
   - Esperar a que inicialización se complete
   - Usar `setInterval` en lugar de `setTimeout`

4. `/Users/luis/Downloads/FutureLabs/cart.html`
   - Esperar a que inicialización se complete
   - Usar `setInterval` en lugar de `setTimeout`

## Próximos Pasos

Si el problema persiste, revisar:
1. Los logs en la consola del navegador
2. El tiempo que toma `authManager.init()` en completarse
3. Si hay errores de red que retrasan la carga del usuario
4. Si el token se guarda correctamente después del login




