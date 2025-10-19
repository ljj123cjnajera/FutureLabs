# 🐛 DEBUG - PROBLEMA DE SESIÓN

## 🔴 **PROBLEMA:**

Después de hacer login exitoso:
1. ✅ Login funciona
2. ✅ Token se genera
3. ❌ Al hacer click en "Cuenta", redirige a `profile.html`
4. ❌ La página desaparece inmediatamente
5. ❌ Vuelve a `index.html`

---

## 🔍 **DEBUGGING AGREGADO:**

He agregado logs detallados en `js/auth.js` para rastrear el problema.

---

## 🧪 **CÓMO DEBUGGEAR:**

### **1. Abre la consola del navegador (F12)**

### **2. Haz login con estas credenciales:**
```
Email: customer@example.com
Password: customer123
```

### **3. Observa los logs en la consola:**

Deberías ver algo como:
```
🔐 Intentando login con: customer@example.com
📥 Respuesta del servidor: {success: true, data: {...}}
✅ Usuario autenticado: {id: "...", email: "..."}
💾 Token guardado: eyJhbGciOiJIUzI1NiIs...
🎉 Login exitoso, evento authStateChanged disparado
```

### **4. Después del login, haz click en "Cuenta"**

Deberías ver:
```
🔍 isAuthenticated: true, currentUser: {id: "...", email: "..."}
```

---

## 📋 **INFORMACIÓN QUE NECESITO:**

Por favor, copia y pega TODOS los logs de la consola después de:

1. **Hacer login**
2. **Hacer click en "Cuenta"**

---

## 🔧 **POSIBLES CAUSAS:**

### **1. Token no se guarda en localStorage**
**Verificar:**
```javascript
// En la consola del navegador, escribe:
localStorage.getItem('auth_token')
```

**Resultado esperado:**
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **2. Token no se carga al recargar la página**
**Verificar:**
1. Haz login
2. Recarga la página (F5)
3. En la consola, escribe:
```javascript
window.authManager.isAuthenticated()
```

**Resultado esperado:**
```
true
```

### **3. Evento authStateChanged no se dispara**
**Verificar:**
En la consola, después del login, deberías ver:
```
🎉 Login exitoso, evento authStateChanged disparado
```

---

## 🚀 **PRUEBA RÁPIDA:**

### **1. Limpia el localStorage:**
```javascript
// En la consola del navegador:
localStorage.clear()
```

### **2. Recarga la página:**
```
F5
```

### **3. Haz login nuevamente:**
```
Email: customer@example.com
Password: customer123
```

### **4. Verifica el token:**
```javascript
// En la consola:
localStorage.getItem('auth_token')
```

### **5. Verifica autenticación:**
```javascript
// En la consola:
window.authManager.isAuthenticated()
```

---

## 📝 **FORMATO DE REPORTE:**

Por favor, copia y pega:

```markdown
**1. Logs después del login:**
[Pega aquí los logs]

**2. Valor de localStorage.getItem('auth_token'):**
[Pega aquí el valor]

**3. Valor de window.authManager.isAuthenticated():**
[Pega aquí true o false]

**4. Logs después de hacer click en "Cuenta":**
[Pega aquí los logs]

**5. ¿Qué pasa exactamente?**
[Describe el comportamiento]
```

---

## 🔍 **ARCHIVOS MODIFICADOS:**

1. ✅ `js/auth.js` - Agregados logs detallados
   - Logs en `login()`
   - Logs en `isAuthenticated()`

---

**Con esta información podré identificar exactamente dónde está el problema.** 🚀
