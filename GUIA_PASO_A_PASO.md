# 📖 GUÍA PASO A PASO - Verificación Completa

## 🎯 **OBJETIVO**

Verificar que TODO el sistema funcione correctamente.

---

## 📋 **PASO 1: VERIFICAR BACKEND**

### **1.1. Abrir Terminal:**
```bash
cd /Users/luis/Downloads/FutureLabs
```

### **1.2. Verificar que el Backend esté Corriendo:**
```bash
curl http://localhost:3000/health
```

**Resultado Esperado:**
```json
{"status":"ok","message":"Server is running"}
```

✅ **Si ves esto, el backend está funcionando.**

---

## 📋 **PASO 2: VERIFICAR LOGIN**

### **2.1. Probar Login desde Terminal:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

✅ **Si ves esto, el login funciona.**

---

## 📋 **PASO 3: VERIFICAR PRODUCTOS**

### **3.1. Probar Productos desde Terminal:**
```bash
curl http://localhost:3000/api/products
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": [...]
}
```

✅ **Si ves esto, los productos funcionan.**

---

## 📋 **PASO 4: ABRIR FRONTEND**

### **4.1. Abrir en el Navegador:**
```
http://localhost:8080
```

**Resultado Esperado:**
- ✅ Página carga
- ✅ No hay errores en consola (F12)
- ✅ Se ven productos

---

## 📋 **PASO 5: HACER LOGIN DESDE EL NAVEGADOR**

### **5.1. Click en "Cuenta":**
- Debería abrir un modal de login

### **5.2. Ingresar Credenciales:**
```
Email: customer@example.com
Password: customer123
```

### **5.3. Click en "Iniciar Sesión":**

**Resultado Esperado:**
- ✅ Modal se cierra
- ✅ Botón cambia a "Mi Cuenta"
- ✅ Se redirige a index.html

---

## 📋 **PASO 6: VERIFICAR SESIÓN**

### **6.1. Abrir Consola del Navegador (F12):**

### **6.2. Ejecutar estos comandos:**
```javascript
// Verificar token
console.log('Token:', localStorage.getItem('auth_token'));

// Verificar usuario
console.log('Usuario:', window.authManager.currentUser);

// Verificar si está autenticado
console.log('Autenticado:', window.authManager.isAuthenticated());
```

**Resultado Esperado:**
```
Token: eyJhbGciOiJIUzI1NiIs...
Usuario: {id: "...", email: "customer@example.com", ...}
Autenticado: true
```

✅ **Si ves esto, la sesión funciona.**

---

## 📋 **PASO 7: NAVEGAR ENTRE PÁGINAS**

### **7.1. Ir a Products:**
```
http://localhost:8080/products.html
```

**Resultado Esperado:**
- ✅ Página carga
- ✅ Se ven productos
- ✅ Botón sigue mostrando "Mi Cuenta"

### **7.2. Volver a Index:**
```
http://localhost:8080/index.html
```

**Resultado Esperado:**
- ✅ Página carga
- ✅ Botón sigue mostrando "Mi Cuenta"

✅ **Si ves esto, la sesión persiste.**

---

## 📋 **PASO 8: CERRAR SESIÓN**

### **8.1. Click en "Mi Cuenta":**
- Debería ir a profile.html

### **8.2. Click en "Cerrar Sesión":**

**Resultado Esperado:**
- ✅ Sesión cerrada
- ✅ Botón cambia a "Cuenta"

---

## 🐛 **SI ALGO NO FUNCIONA**

### **Problema 1: "No puedo hacer login"**

**Solución:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/health

# Si no responde, reiniciar backend
cd backend
npm start
```

---

### **Problema 2: "La sesión desaparece"**

**Solución:**
```javascript
// En la consola del navegador (F12):
localStorage.clear()
location.reload()

// Luego hacer login de nuevo
```

---

### **Problema 3: "No veo productos"**

**Solución:**
```bash
# Verificar productos desde terminal
curl http://localhost:3000/api/products

# Si no responde, reiniciar backend
```

---

### **Problema 4: "El header no se actualiza"**

**Solución:**
```javascript
// En la consola del navegador (F12):
console.log('AuthManager:', window.authManager);
console.log('Components:', window.Components);

// Si son undefined, recargar página
location.reload()
```

---

## ✅ **CHECKLIST FINAL**

- [ ] Backend funciona (Paso 1)
- [ ] Login funciona desde terminal (Paso 2)
- [ ] Productos funcionan (Paso 3)
- [ ] Frontend carga (Paso 4)
- [ ] Login funciona desde navegador (Paso 5)
- [ ] Sesión persiste (Paso 6)
- [ ] Navegación funciona (Paso 7)
- [ ] Logout funciona (Paso 8)

---

## 📞 **SI TODAVÍA HAY PROBLEMAS**

Por favor, proporciona:

1. **¿En qué paso falla?**
2. **¿Qué error ves?**
3. **Screenshot de la consola (F12)**

---

**Fecha:** 16 de Octubre, 2025  
**Estado:** 📖 GUÍA COMPLETA  
**Versión:** 12.5.0





