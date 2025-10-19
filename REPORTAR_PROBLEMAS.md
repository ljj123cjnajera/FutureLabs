# 🐛 REPORTAR PROBLEMAS - FUTURELABS

## 📋 **Para ayudarte a resolver los problemas, necesito información específica:**

---

## ❓ **PREGUNTAS:**

### **1. ¿Qué específicamente no está funcionando?**

Por favor, dime:
- [ ] Login/Registro
- [ ] Agregar productos al carrito
- [ ] Wishlist
- [ ] Ver productos
- [ ] Panel de administración
- [ ] Checkout
- [ ] Búsqueda
- [ ] Otro: _________________

---

### **2. ¿Qué error ves en la consola del navegador?**

**Pasos para ver errores:**
1. Abre http://localhost:8080
2. Presiona F12 (o Cmd+Option+I en Mac)
3. Ve a la pestaña "Console"
4. Copia TODOS los errores que veas (en rojo)

**Ejemplo de lo que necesito:**
```
Error en API: Error: Error obteniendo productos destacados
    at api.js:34
    at home.js:28
```

---

### **3. ¿Qué página estás visitando cuando ocurre el problema?**

- [ ] Homepage (http://localhost:8080)
- [ ] Productos
- [ ] Detalle de producto
- [ ] Carrito
- [ ] Checkout
- [ ] Wishlist
- [ ] Perfil
- [ ] Panel de admin
- [ ] Otra: _________________

---

### **4. ¿Qué pasos seguiste antes de que ocurriera el problema?**

**Ejemplo:**
```
1. Abrí http://localhost:8080
2. Hice click en "Cuenta"
3. Intenté hacer login
4. El modal se cerró inmediatamente
```

---

### **5. ¿El backend está corriendo?**

**Verifica en la terminal:**
```bash
ps aux | grep "node backend/server.js"
```

**Deberías ver algo como:**
```
luis  12345  node backend/server.js
```

---

### **6. ¿El frontend está corriendo?**

**Verifica en la terminal:**
```bash
lsof -i :8080
```

**Deberías ver algo como:**
```
Python  12345  luis  6u  IPv6  TCP *:http-alt (LISTEN)
```

---

## 🔍 **VERIFICACIÓN RÁPIDA**

### **1. Verifica que los servidores estén corriendo:**

```bash
# Backend
curl http://localhost:3000/api/products/featured?limit=8

# Debería devolver JSON con productos

# Frontend
curl http://localhost:8080

# Debería devolver HTML
```

---

### **2. Verifica la consola del navegador:**

**Abre la consola (F12) y verifica:**
- ✅ NO debe haber errores en rojo
- ✅ NO debe haber errores 500
- ✅ NO debe haber errores 404
- ✅ Los scripts deben cargarse

---

### **3. Verifica la pestaña Network:**

1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Recarga la página (F5)
4. Verifica que las peticiones tengan:
   - ✅ Status 200 (verde)
   - ❌ NO Status 500 (rojo)
   - ❌ NO Status 404 (rojo)

---

## 📸 **INFORMACIÓN ÚTIL**

Si puedes, envía:
1. **Screenshot de la consola del navegador** (con los errores)
2. **Screenshot de la pestaña Network** (con las peticiones fallidas)
3. **Screenshot de la página** (donde ocurre el problema)

---

## 🚀 **ARREGLO RÁPIDO**

Si todo está fallando, intenta:

### **1. Reiniciar el backend:**
```bash
pkill -f "node backend/server.js"
cd /Users/luis/Downloads/FutureLabs
node backend/server.js
```

### **2. Reiniciar el frontend:**
```bash
pkill -f "python3 -m http.server"
cd /Users/luis/Downloads/FutureLabs
python3 -m http.server 8080
```

### **3. Limpiar caché del navegador:**
- Presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac)
- O ve a DevTools > Network > Disable cache

---

## 📝 **FORMATO DE REPORTE**

Por favor, usa este formato:

```markdown
**Problema:**
[Describe qué no funciona]

**Página:**
[URL donde ocurre]

**Pasos para reproducir:**
1. ...
2. ...
3. ...

**Error en consola:**
[Copia el error completo]

**Screenshot:**
[Si es posible, adjunta screenshot]
```

---

## 🔧 **PROBLEMAS COMUNES Y SOLUCIONES**

### **1. "Cannot GET /api/..."**
**Causa:** Backend no está corriendo
**Solución:** Inicia el backend con `node backend/server.js`

### **2. "500 Internal Server Error"**
**Causa:** Error en el backend o base de datos
**Solución:** Verifica los logs del backend

### **3. "CORS policy"**
**Causa:** Frontend y backend en diferentes puertos
**Solución:** Verifica que CORS esté configurado en backend

### **4. "Modal se cierra inmediatamente"**
**Causa:** Eventos de click conflictivos
**Solución:** Ya corregido en última versión

### **5. "Sesión no persiste"**
**Causa:** Token no se guarda correctamente
**Solución:** Ya corregido en última versión

---

## 📞 **AYUDA**

Si después de verificar todo lo anterior sigues teniendo problemas:

1. **Copia TODOS los errores de la consola**
2. **Copia los logs del backend** (terminal donde corre el servidor)
3. **Dime exactamente qué no funciona**
4. **Dime qué pasos seguiste**

---

**Con esta información podré ayudarte a resolver el problema rápidamente.** 🚀




