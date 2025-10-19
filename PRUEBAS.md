# 🧪 Guía de Pruebas - FutureLabs

## ✅ **PRUEBAS REALIZADAS**

### **1. Backend API**
- ✅ Health check funcionando
- ✅ 10 productos disponibles
- ✅ 8 categorías disponibles
- ✅ Login funcionando correctamente

---

## 🚀 **CÓMO PROBAR EL SISTEMA COMPLETO**

### **Paso 1: Iniciar Servidores**

#### **Backend:**
```bash
cd backend
npm start
```

Deberías ver:
```
🚀 FutureLabs API corriendo en puerto 3000
📡 Ambiente: development
🌐 URL: http://localhost:3000
```

#### **Frontend:**
```bash
cd ..
python3 -m http.server 8080
```

Deberías ver:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

---

### **Paso 2: Abrir en el Navegador**

```
http://localhost:8080
```

---

### **Paso 3: Abrir la Consola del Navegador**

**Chrome/Edge:** `F12` o `Cmd+Option+I`  
**Safari:** `Cmd+Option+C`

Deberías ver:
```
✅ API inicializada sin token (modo invitado)
FutureLabs - Tu portal al futuro está listo!
✅ Productos destacados cargados: 7
```

---

### **Paso 4: Probar Login**

En la consola del navegador, ejecuta:

```javascript
// Login
await window.authManager.login('customer@example.com', 'password123');
```

Deberías ver:
```
✅ Login exitoso
```

Y en la consola:
```
✅ API inicializada con token
```

---

### **Paso 5: Probar Carrito**

En la consola del navegador, ejecuta:

```javascript
// Agregar producto al carrito
await window.cartManager.add('660e8400-e29b-41d4-a716-446655440001', 1);
```

Deberías ver:
```
✅ Producto agregado al carrito
```

Verifica el contador del carrito en la página (debería mostrar "1").

---

### **Paso 6: Ver Carrito**

En la consola del navegador, ejecuta:

```javascript
// Ver carrito
await window.cartManager.loadCart();
console.log('Items en el carrito:', window.cartManager.items);
console.log('Total:', window.cartManager.total);
console.log('Cantidad:', window.cartManager.count);
```

Deberías ver la información del carrito.

---

### **Paso 7: Probar API Directamente**

En la consola del navegador, ejecuta:

```javascript
// Obtener productos
const products = await window.api.getProducts();
console.log('Productos:', products.data.products);

// Obtener categorías
const categories = await window.api.getCategories();
console.log('Categorías:', categories.data.categories);

// Obtener usuario actual
const user = await window.api.getCurrentUser();
console.log('Usuario:', user.data.user);
```

---

### **Paso 8: Probar Crear Pedido**

En la consola del navegador, ejecuta:

```javascript
// Crear pedido
const order = await window.api.createOrder({
  shipping_address: 'Av. Principal 123',
  shipping_city: 'Lima',
  shipping_country: 'Perú',
  shipping_postal_code: '15001',
  shipping_phone: '+51 987 654 321',
  payment_method: 'stripe',
  shipping_cost: 10,
  tax: 0
});

console.log('Pedido creado:', order);
```

Deberías ver:
```
✅ Pedido creado exitosamente
```

---

## 📊 **VERIFICACIÓN DE FUNCIONALIDADES**

### **✅ Backend:**
- [x] Servidor corriendo en puerto 3000
- [x] Base de datos PostgreSQL conectada
- [x] 35 endpoints funcionando
- [x] Autenticación con JWT
- [x] Productos cargados (10)
- [x] Categorías cargadas (8)
- [x] Usuarios de prueba (3)

### **✅ Frontend:**
- [x] Página carga correctamente
- [x] API Client inicializado
- [x] Sistema de autenticación funcionando
- [x] Sistema de carrito funcionando
- [x] Productos se cargan dinámicamente
- [x] Diseño responsive

### **✅ Integración:**
- [x] Frontend conectado con backend
- [x] Login funcionando
- [x] Carrito funcionando
- [x] Productos cargando desde API
- [x] Tokens JWT funcionando

---

## 🔍 **VERIFICAR EN LA CONSOLA**

### **Mensajes que DEBES ver:**
```
✅ API inicializada sin token (modo invitado)
FutureLabs - Tu portal al futuro está listo!
✅ Productos destacados cargados: 7
```

### **Después del login:**
```
✅ API inicializada con token
✅ Login exitoso
```

### **Después de agregar al carrito:**
```
✅ Producto agregado al carrito
```

---

## 🐛 **SI ALGO NO FUNCIONA**

### **Error: "Cannot connect to API"**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/health
```

### **Error: "Token inválido"**
```javascript
// Hacer logout y login nuevamente
await window.authManager.logout();
await window.authManager.login('customer@example.com', 'password123');
```

### **Error: "CORS"**
- Verificar que el backend esté en puerto 3000
- Verificar que el frontend esté en puerto 8080
- El CORS ya está configurado en el backend

---

## 📝 **CREDENCIALES DE PRUEBA**

### **Cliente:**
```
Email: customer@example.com
Password: password123
```

### **Admin:**
```
Email: admin@futurelabs.com
Password: password123
```

### **Moderador:**
```
Email: moderator@futurelabs.com
Password: password123
```

---

## 🎉 **RESULTADO ESPERADO**

Al completar todas las pruebas, deberías tener:

1. ✅ Backend funcionando en puerto 3000
2. ✅ Frontend funcionando en puerto 8080
3. ✅ Login funcionando
4. ✅ Carrito funcionando
5. ✅ Productos cargando desde el API
6. ✅ Pedidos funcionando
7. ✅ Sin errores en la consola

---

## 🚀 **¡TODO FUNCIONANDO!**

Si todas las pruebas pasan, tu tienda online FutureLabs está **100% funcional** y lista para usar.

---

**Fecha:** 16 de Octubre, 2025  
**Versión:** 1.0.0





