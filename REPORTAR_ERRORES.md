# 🐛 Cómo Reportar Errores

## 📋 **INFORMACIÓN NECESARIA**

Para poder ayudarte a corregir los errores, necesito que me proporciones:

### **1. Descripción del Error:**
```
¿Qué está pasando?
¿Qué debería pasar?
```

### **2. Pasos para Reproducir:**
```
1. Paso 1
2. Paso 2
3. Paso 3
```

### **3. Mensaje de Error:**
```
¿Qué mensaje de error ves?
```

### **4. Ubicación:**
```
¿En qué página ocurre el error?
¿Qué funcionalidad no funciona?
```

### **5. Captura de Pantalla:**
```
Si es posible, describe lo que ves
```

---

## 🔍 **VERIFICACIONES QUE PUEDO HACER**

### **Backend:**
```bash
# Verificar logs
tail -f /tmp/backend.log

# Verificar endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/products
curl http://localhost:3000/api/categories
```

### **Frontend:**
```bash
# Verificar que carga
curl http://localhost:8080

# Verificar archivos
ls -la js/
ls -la css/
```

### **Base de Datos:**
```bash
# Verificar usuarios
psql -U luis -d futurelabs -c "SELECT email FROM users;"

# Verificar productos
psql -U luis -d futurelabs -c "SELECT COUNT(*) FROM products;"
```

---

## 📝 **EJEMPLO DE REPORTE DE ERROR**

```
DESCRIPCIÓN:
No puedo hacer login con las credenciales del cliente

PASOS:
1. Ir a http://localhost:8080
2. Click en "Cuenta"
3. Ingresar email y contraseña
4. Click en "Iniciar Sesión"

ERROR:
Mensaje: "Email o contraseña incorrectos"

UBICACIÓN:
Página: index.html
Funcionalidad: Login

CREDENCIALES USADAS:
Email: customer@example.com
Password: customer123
```

---

## 🎯 **ERRORES COMUNES Y SOLUCIONES**

### **1. Error: "Cannot read property of undefined"**
**Solución:** Verificar que los scripts estén cargados en el orden correcto

### **2. Error: "Failed to fetch"**
**Solución:** Verificar que el backend esté corriendo en puerto 3000

### **3. Error: "404 Not Found"**
**Solución:** Verificar que la ruta del endpoint sea correcta

### **4. Error: "401 Unauthorized"**
**Solución:** Verificar credenciales o token JWT

### **5. Error: Header/Footer no aparece**
**Solución:** Verificar que components.js esté incluido

---

## 🚀 **CÓMO VERIFICAR QUE TODO FUNCIONA**

### **1. Backend:**
```bash
curl http://localhost:3000/health
# Esperado: {"status":"OK",...}
```

### **2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'
# Esperado: {"success":true,...}
```

### **3. Productos:**
```bash
curl http://localhost:3000/api/products
# Esperado: {"success":true,"data":{"products":[...]}}
```

### **4. Frontend:**
```
Abrir http://localhost:8080 en el navegador
# Esperado: Página carga con header y footer
```

---

## 📞 **SIGUIENTE PASO**

Por favor, proporciona:
1. ✅ Descripción del error específico
2. ✅ Pasos para reproducirlo
3. ✅ Mensaje de error (si hay)
4. ✅ En qué página ocurre

Con esta información podré corregir el error de manera precisa.

---

**Fecha:** 16 de Octubre, 2025  
**Estado:** ⏳ Esperando reporte de errores





