# 🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA

## ✅ **VERIFICACIÓN DEL BACKEND**

### **Health Check:**
```bash
curl http://localhost:3000/health
✅ Backend funcionando
```

### **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'
✅ Login OK - Token generado
```

### **Productos:**
```bash
curl http://localhost:3000/api/products
✅ 5 productos cargados
```

### **Categorías:**
```bash
curl http://localhost:3000/api/categories
✅ 8 categorías cargadas
```

---

## ✅ **VERIFICACIÓN DEL FRONTEND**

### **Página Principal:**
```bash
curl http://localhost:8080
✅ HTML válido
```

### **Scripts:**
```bash
✅ js/api.js - Carga correctamente
✅ js/auth.js - Carga correctamente
✅ js/cart.js - Carga correctamente
✅ js/notifications.js - Carga correctamente
✅ js/modals.js - Carga correctamente
✅ js/home.js - Carga correctamente
✅ js/components.js - Carga correctamente
```

---

## 🐛 **POSIBLES PROBLEMAS Y SOLUCIONES**

### **1. Problema: "No puedo hacer login"**

**Causas Posibles:**
- ❌ Credenciales incorrectas
- ❌ Backend no está corriendo
- ❌ Error de red/CORS
- ❌ Token no se guarda

**Solución:**
```bash
# Verificar backend
curl http://localhost:3000/health

# Verificar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'

# Credenciales correctas:
Email: customer@example.com
Password: customer123
```

---

### **2. Problema: "La sesión desaparece al recargar"**

**Causas Posibles:**
- ❌ Token no se guarda en localStorage
- ❌ Token no se carga al iniciar
- ❌ Token expira muy rápido

**Solución:**
```javascript
// Verificar en consola del navegador:
console.log('Token:', localStorage.getItem('auth_token'));
console.log('Usuario:', window.authManager.currentUser);
console.log('Autenticado:', window.authManager.isAuthenticated());
```

---

### **3. Problema: "No veo los productos"**

**Causas Posibles:**
- ❌ API no responde
- ❌ Error en la carga de productos
- ❌ Problema con el renderizado

**Solución:**
```bash
# Verificar productos
curl http://localhost:3000/api/products

# Verificar categorías
curl http://localhost:3000/api/categories
```

---

### **4. Problema: "El carrito no funciona"**

**Causas Posibles:**
- ❌ No hay usuario logueado
- ❌ Error en la API del carrito
- ❌ Problema con el contador

**Solución:**
```bash
# Verificar carrito (requiere autenticación)
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### **5. Problema: "El header no se actualiza"**

**Causas Posibles:**
- ❌ Evento authStateChanged no se dispara
- ❌ components.js no se carga
- ❌ Error en el listener

**Solución:**
```javascript
// Verificar en consola del navegador:
console.log('Components:', window.Components);
console.log('AuthManager:', window.authManager);
```

---

## 🔧 **SOLUCIONES RÁPIDAS**

### **1. Limpiar Cache del Navegador:**
```
1. Presionar Ctrl+Shift+R (o Cmd+Shift+R en Mac)
2. O ir a Configuración > Privacidad > Borrar datos de navegación
3. Seleccionar "Imágenes y archivos en caché"
4. Click en "Borrar datos"
```

### **2. Verificar Consola del Navegador:**
```
1. Presionar F12
2. Ir a la pestaña "Console"
3. Ver si hay errores en rojo
4. Compartir los errores
```

### **3. Reiniciar Servidores:**
```bash
# Detener servidores
Ctrl+C

# Reiniciar backend
cd backend
npm start

# Reiniciar frontend (en otra terminal)
python3 -m http.server 8080
```

---

## 📋 **CHECKLIST DE VERIFICACIÓN**

### **Backend:**
- [ ] Puerto 3000 está abierto
- [ ] Base de datos está conectada
- [ ] Migraciones ejecutadas
- [ ] Seeds ejecutados
- [ ] Login funciona

### **Frontend:**
- [ ] Puerto 8080 está abierto
- [ ] Todos los scripts cargan
- [ ] Todos los CSS cargan
- [ ] No hay errores en consola
- [ ] Login funciona

### **Integración:**
- [ ] API client funciona
- [ ] Auth manager funciona
- [ ] Token se guarda
- [ ] Header se actualiza
- [ ] Carrito funciona

---

## 🆘 **SI NADA FUNCIONA**

### **Paso 1: Verificar Servidores**
```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost:8080
```

### **Paso 2: Verificar Base de Datos**
```bash
cd backend
npm run migrate:latest
npm run seed:run
```

### **Paso 3: Limpiar Todo**
```bash
# Limpiar localStorage
localStorage.clear()

# Recargar página
Ctrl+Shift+R
```

---

## 📞 **INFORMACIÓN PARA REPORTAR**

Si sigues teniendo problemas, por favor proporciona:

1. **¿Qué estás intentando hacer?**
   - Ejemplo: "Hacer login"

2. **¿Qué error ves?**
   - Ejemplo: "No puedo iniciar sesión"

3. **¿En qué página ocurre?**
   - Ejemplo: "En index.html"

4. **¿Hay mensajes en la consola?**
   - Presionar F12 y ver la pestaña Console

5. **Screenshots:**
   - De la página
   - De la consola del navegador

---

**Fecha:** 16 de Octubre, 2025  
**Estado:** 🔍 DIAGNÓSTICO COMPLETO  
**Versión:** 12.5.0





