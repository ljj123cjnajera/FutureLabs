# 🧪 Guía Completa de Pruebas - FutureLabs

## 📋 **ÍNDICE DE PRUEBAS**

1. [Backend](#backend)
2. [Autenticación](#autenticación)
3. [Productos](#productos)
4. [Carrito](#carrito)
5. [Checkout y Pagos](#checkout-y-pagos)
6. [Perfil de Usuario](#perfil-de-usuario)
7. [Wishlist](#wishlist)
8. [Reseñas](#reseñas)
9. [Cupones](#cupones)
10. [Panel de Administración](#panel-de-administración)
11. [Blog](#blog)
12. [Páginas Legales](#páginas-legales)

---

## 🔧 **PREPARACIÓN**

### **1. Iniciar Servicios:**

```bash
# Terminal 1: Backend
cd /Users/luis/Downloads/FutureLabs/backend
npm start

# Terminal 2: Frontend
cd /Users/luis/Downloads/FutureLabs
python3 -m http.server 8080
```

### **2. Verificar Servicios:**

```bash
# Backend
curl http://localhost:3000/health

# Frontend
# Abrir http://localhost:8080 en el navegador
```

### **3. Credenciales de Prueba:**

```
ADMIN:
Email: admin@futurelabs.com
Password: admin123

CLIENTE:
Email: customer@example.com
Password: customer123

MODERADOR:
Email: moderator@futurelabs.com
Password: moderator123
```

---

## 🔧 **BACKEND**

### **Test 1: Health Check**
```bash
curl http://localhost:3000/health
```
**Esperado:** `{"status":"OK","timestamp":"...","uptime":...}`

### **Test 2: Base de Datos**
```bash
# Verificar tablas
psql -U luis -d futurelabs -c "\dt"
```
**Esperado:** 10 tablas

### **Test 3: Endpoints Públicos**
```bash
# Productos
curl http://localhost:3000/api/products

# Categorías
curl http://localhost:3000/api/categories

# Blog
curl http://localhost:3000/api/blog
```
**Esperado:** Respuestas JSON con `success: true`

---

## 🔐 **AUTENTICACIÓN**

### **Test 1: Registro de Usuario**
```
1. Ir a http://localhost:8080/
2. Click en "Cuenta"
3. Click en "Registrarse"
4. Llenar formulario:
   - Email: test@example.com
   - Password: test123
   - First Name: Test
   - Last Name: User
5. Click en "Registrarse"
```
**Esperado:** Notificación de éxito y redirección

### **Test 2: Login**
```
1. Click en "Cuenta"
2. Ingresar credenciales de cliente
3. Click en "Iniciar Sesión"
```
**Esperado:** Login exitoso, botón cambia a "Mi Cuenta"

### **Test 3: Logout**
```
1. Click en "Mi Cuenta"
2. Click en "Cerrar Sesión"
```
**Esperado:** Logout exitoso, botón cambia a "Cuenta"

### **Test 4: Recuperación de Contraseña**
```
1. Ir a http://localhost:8080/forgot-password.html
2. Ingresar email: customer@futurelabs.com
3. Click en "Enviar Instrucciones"
```
**Esperado:** Mensaje de éxito, token en consola

```
4. Ir a http://localhost:8080/reset-password.html
5. Ingresar token de consola
6. Ingresar nueva contraseña
7. Click en "Restablecer Contraseña"
```
**Esperado:** Contraseña restablecida exitosamente

---

## 📦 **PRODUCTOS**

### **Test 1: Ver Productos**
```
1. Ir a http://localhost:8080/products.html
```
**Esperado:** Lista de productos con imágenes, precios, y botones

### **Test 2: Filtros**
```
1. En products.html, usar filtros:
   - Categoría: Smartphones
   - Precio: 500-2000
   - Marca: Apple
2. Click en "Aplicar Filtros"
```
**Esperado:** Productos filtrados correctamente

### **Test 3: Ordenamiento**
```
1. En products.html, cambiar ordenamiento:
   - Precio: Menor a Mayor
   - Rating: Mayor a Menor
   - Más Recientes
```
**Esperado:** Productos ordenados correctamente

### **Test 4: Paginación**
```
1. En products.html, usar paginación
2. Click en "Siguiente" y "Anterior"
```
**Esperado:** Navegación entre páginas funciona

### **Test 5: Detalle de Producto**
```
1. Click en cualquier producto
2. Ver detalles completos
```
**Esperado:** Información completa del producto

---

## 🛒 **CARRITO**

### **Test 1: Agregar al Carrito**
```
1. En products.html o index.html
2. Click en "Agregar al Carrito" de un producto
```
**Esperado:** Notificación de éxito, contador aumenta

### **Test 2: Ver Carrito**
```
1. Click en ícono del carrito
2. O ir a http://localhost:8080/cart.html
```
**Esperado:** Lista de productos en el carrito

### **Test 3: Modificar Cantidad**
```
1. En cart.html
2. Cambiar cantidad de un producto
```
**Esperado:** Total se actualiza automáticamente

### **Test 4: Eliminar del Carrito**
```
1. En cart.html
2. Click en "Eliminar" de un producto
```
**Esperado:** Producto eliminado, total actualizado

### **Test 5: Vaciar Carrito**
```
1. En cart.html
2. Click en "Vaciar Carrito"
```
**Esperado:** Carrito vacío

---

## 💳 **CHECKOUT Y PAGOS**

### **Test 1: Proceso de Checkout**
```
1. Agregar productos al carrito
2. Click en "Proceder al Checkout"
3. Llenar información de envío
4. Seleccionar método de pago
5. Click en "Realizar Pedido"
```
**Esperado:** Pedido creado exitosamente

### **Test 2: Cupones**
```
1. En checkout.html
2. Ingresar código: WELCOME10
3. Click en "Aplicar"
```
**Esperado:** Descuento aplicado, total actualizado

### **Test 3: Ver Pedidos**
```
1. Ir a http://localhost:8080/orders.html
```
**Esperado:** Lista de pedidos del usuario

---

## 👤 **PERFIL DE USUARIO**

### **Test 1: Ver Perfil**
```
1. Ir a http://localhost:8080/profile.html
```
**Esperado:** Información del usuario cargada

### **Test 2: Editar Información**
```
1. En profile.html
2. Modificar nombre, teléfono
3. Click en "Guardar Cambios"
```
**Esperado:** Información actualizada exitosamente

### **Test 3: Cambiar Contraseña**
```
1. En profile.html
2. Llenar formulario de cambio de contraseña
3. Click en "Cambiar Contraseña"
```
**Esperado:** Contraseña cambiada exitosamente

---

## ❤️ **WISHLIST**

### **Test 1: Agregar a Wishlist**
```
1. En products.html o index.html
2. Click en ícono de corazón
```
**Esperado:** Producto agregado a wishlist

### **Test 2: Ver Wishlist**
```
1. Ir a http://localhost:8080/wishlist.html
```
**Esperado:** Lista de productos en wishlist

### **Test 3: Eliminar de Wishlist**
```
1. En wishlist.html
2. Click en "Eliminar"
```
**Esperado:** Producto eliminado de wishlist

### **Test 4: Agregar al Carrito desde Wishlist**
```
1. En wishlist.html
2. Click en "Agregar al Carrito"
```
**Esperado:** Producto agregado al carrito

---

## ⭐ **RESEÑAS**

### **Test 1: Ver Reseñas**
```
1. Ir a detalle de un producto
2. Scroll hasta sección de reseñas
```
**Esperado:** Reseñas existentes mostradas

### **Test 2: Crear Reseña**
```
1. En detalle de producto
2. Llenar formulario de reseña
3. Click en "Enviar Reseña"
```
**Esperado:** Reseña creada exitosamente

### **Test 3: Editar Reseña**
```
1. En profile.html o orders.html
2. Buscar reseña propia
3. Click en "Editar"
4. Modificar y guardar
```
**Esperado:** Reseña actualizada

---

## 🎟️ **CUPONES**

### **Test 1: Validar Cupón**
```
1. En checkout.html
2. Ingresar código: WELCOME10
3. Click en "Aplicar"
```
**Esperado:** Cupón válido, descuento aplicado

### **Test 2: Cupón Inválido**
```
1. En checkout.html
2. Ingresar código: INVALIDO
3. Click en "Aplicar"
```
**Esperado:** Mensaje de error

### **Test 3: Cupón Expirado**
```
1. En checkout.html
2. Ingresar código: EXPIRED
3. Click en "Aplicar"
```
**Esperado:** Mensaje de cupón expirado

---

## 🎛️ **PANEL DE ADMINISTRACIÓN**

### **Test 1: Login de Admin**
```
1. Ir a http://localhost:8080/admin-login.html
2. Ingresar credenciales de admin
3. Click en "Iniciar Sesión"
```
**Esperado:** Redirección a panel admin

### **Test 2: Dashboard**
```
1. En admin.html
2. Ver sección Dashboard
```
**Esperado:** Estadísticas cargadas

### **Test 3: Productos - Crear**
```
1. En admin.html, sección Productos
2. Click en "Crear Producto"
3. Llenar formulario
4. Click en "Guardar"
```
**Esperado:** Producto creado exitosamente

### **Test 4: Productos - Editar**
```
1. En admin.html, sección Productos
2. Click en ícono de editar
3. Modificar información
4. Click en "Guardar"
```
**Esperado:** Producto actualizado

### **Test 5: Productos - Eliminar**
```
1. En admin.html, sección Productos
2. Click en ícono de eliminar
3. Confirmar eliminación
```
**Esperado:** Producto eliminado

### **Test 6: Categorías - CRUD**
```
1. En admin.html, sección Categorías
2. Probar crear, editar, eliminar
```
**Esperado:** Operaciones exitosas

### **Test 7: Usuarios**
```
1. En admin.html, sección Usuarios
2. Ver lista de usuarios
3. Editar usuario
```
**Esperado:** Información cargada y editable

### **Test 8: Pedidos**
```
1. En admin.html, sección Pedidos
2. Ver lista de pedidos
3. Click en "Ver" de un pedido
```
**Esperado:** Detalles completos del pedido

### **Test 9: Reseñas**
```
1. En admin.html, sección Reseñas
2. Ver lista de reseñas
3. Editar reseña
4. Aprobar/Desaprobar
```
**Esperado:** Operaciones exitosas

---

## 📝 **BLOG**

### **Test 1: Ver Blog**
```
1. Ir a http://localhost:8080/blog.html
```
**Esperado:** Lista de posts con paginación

### **Test 2: Paginación del Blog**
```
1. En blog.html
2. Usar botones de paginación
```
**Esperado:** Navegación entre páginas funciona

### **Test 3: Detalle de Post**
```
1. En blog.html
2. Click en "Leer más" de un post
```
**Esperado:** Post completo mostrado

---

## 📜 **PÁGINAS LEGALES**

### **Test 1: Términos y Condiciones**
```
1. Ir a http://localhost:8080/terms.html
2. O desde footer → "Términos y Condiciones"
```
**Esperado:** Página completa con contenido

### **Test 2: Política de Privacidad**
```
1. Ir a http://localhost:8080/privacy.html
2. O desde footer → "Políticas de Privacidad"
```
**Esperado:** Página completa con contenido

### **Test 3: Política de Garantía**
```
1. Ir a http://localhost:8080/warranty.html
2. O desde footer → "Garantías"
```
**Esperado:** Página completa con contenido

### **Test 4: Política de Devoluciones**
```
1. Ir a http://localhost:8080/returns.html
2. O desde footer → "Devoluciones"
```
**Esperado:** Página completa con contenido

---

## 🐛 **VERIFICACIÓN DE ERRORES**

### **Test 1: Errores de Red**
```
1. Detener backend
2. Intentar operaciones
```
**Esperado:** Mensajes de error claros

### **Test 2: Validación de Formularios**
```
1. Intentar enviar formularios vacíos
2. Intentar datos inválidos
```
**Esperado:** Mensajes de validación

### **Test 3: Permisos**
```
1. Intentar acceder a admin sin permisos
2. Intentar editar perfil de otro usuario
```
**Esperado:** Acceso denegado

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### **Backend:**
- [ ] Health check funciona
- [ ] Base de datos conectada
- [ ] Todos los endpoints responden
- [ ] Autenticación JWT funciona
- [ ] Validaciones funcionan

### **Frontend:**
- [ ] Todas las páginas cargan
- [ ] Navegación funciona
- [ ] Formularios validan
- [ ] Notificaciones aparecen
- [ ] Modales funcionan
- [ ] Responsive design funciona

### **Funcionalidades:**
- [ ] Registro y login
- [ ] Recuperación de contraseña
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] Checkout funciona
- [ ] Cupones funcionan
- [ ] Wishlist funciona
- [ ] Reseñas funcionan
- [ ] Perfil funciona
- [ ] Panel admin funciona
- [ ] Blog funciona
- [ ] Páginas legales cargan

---

## 📊 **REPORTE DE PRUEBAS**

### **Plantilla de Reporte:**

```
TEST: [Nombre del Test]
ESTADO: ✅ PASÓ / ❌ FALLÓ
OBSERVACIONES: [Notas]
TIEMPO: [Duración]
```

### **Ejemplo:**

```
TEST: Login de Usuario
ESTADO: ✅ PASÓ
OBSERVACIONES: Login funciona correctamente, token guardado
TIEMPO: 5 segundos
```

---

## 🚨 **PROBLEMAS COMUNES**

### **1. Backend no inicia:**
```bash
# Verificar logs
tail -f /tmp/backend.log

# Verificar puerto
lsof -i :3000
```

### **2. Base de datos no conecta:**
```bash
# Verificar PostgreSQL
psql -U luis -d futurelabs -c "SELECT 1;"
```

### **3. Frontend no carga:**
```bash
# Verificar servidor
curl http://localhost:8080
```

### **4. CORS errors:**
```bash
# Verificar configuración en backend/server.js
```

---

## 📝 **NOTAS**

- Todas las pruebas deben realizarse en orden
- Documentar cualquier error encontrado
- Tomar screenshots de problemas
- Verificar en múltiples navegadores
- Probar en diferentes dispositivos

---

**Fecha:** 16 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** 🧪 Listo para Pruebas

