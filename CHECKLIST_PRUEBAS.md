# ✅ Checklist de Pruebas - FutureLabs

## 🚀 **INICIO RÁPIDO**

### **1. Verificar Servicios:**
```bash
# Backend
curl http://localhost:3000/health

# Frontend
# Abrir http://localhost:8080
```

### **2. Credenciales:**
```
Admin:    admin@futurelabs.com / admin123
Cliente:  customer@futurelabs.com / customer123
```

---

## 📋 **CHECKLIST DE PRUEBAS**

### **🔐 AUTENTICACIÓN**

- [ ] **Registro de Usuario**
  - Ir a http://localhost:8080/
  - Click en "Cuenta" → "Registrarse"
  - Llenar formulario y registrarse
  - ✅ Verificar: Notificación de éxito

- [ ] **Login**
  - Click en "Cuenta"
  - Ingresar: customer@example.com / customer123
  - ✅ Verificar: Botón cambia a "Mi Cuenta"

- [ ] **Logout**
  - Click en "Mi Cuenta" → "Cerrar Sesión"
  - ✅ Verificar: Botón cambia a "Cuenta"

- [ ] **Recuperación de Contraseña**
  - Ir a http://localhost:8080/forgot-password.html
  - Ingresar email y enviar
  - ✅ Verificar: Token en consola
  - Ir a http://localhost:8080/reset-password.html
  - Ingresar token y nueva contraseña
  - ✅ Verificar: Contraseña restablecida

---

### **📦 PRODUCTOS**

- [ ] **Ver Productos**
  - Ir a http://localhost:8080/products.html
  - ✅ Verificar: Lista de productos visible

- [ ] **Filtros**
  - Aplicar filtro de categoría
  - Aplicar filtro de precio
  - Aplicar filtro de marca
  - ✅ Verificar: Productos filtrados correctamente

- [ ] **Ordenamiento**
  - Cambiar a "Precio: Menor a Mayor"
  - Cambiar a "Rating: Mayor a Menor"
  - ✅ Verificar: Productos ordenados

- [ ] **Paginación**
  - Click en "Siguiente"
  - Click en "Anterior"
  - ✅ Verificar: Navegación funciona

- [ ] **Detalle de Producto**
  - Click en cualquier producto
  - ✅ Verificar: Información completa

---

### **🛒 CARRITO**

- [ ] **Agregar al Carrito**
  - Click en "Agregar al Carrito"
  - ✅ Verificar: Notificación + contador aumenta

- [ ] **Ver Carrito**
  - Click en ícono del carrito
  - ✅ Verificar: Productos listados

- [ ] **Modificar Cantidad**
  - Cambiar cantidad en cart.html
  - ✅ Verificar: Total actualizado

- [ ] **Eliminar Producto**
  - Click en "Eliminar"
  - ✅ Verificar: Producto eliminado

- [ ] **Vaciar Carrito**
  - Click en "Vaciar Carrito"
  - ✅ Verificar: Carrito vacío

---

### **💳 CHECKOUT Y PAGOS**

- [ ] **Proceso de Checkout**
  - Agregar productos al carrito
  - Click en "Proceder al Checkout"
  - Llenar información de envío
  - Seleccionar método de pago
  - Click en "Realizar Pedido"
  - ✅ Verificar: Pedido creado

- [ ] **Cupones**
  - En checkout.html
  - Ingresar código: WELCOME10
  - Click en "Aplicar"
  - ✅ Verificar: Descuento aplicado

- [ ] **Ver Pedidos**
  - Ir a http://localhost:8080/orders.html
  - ✅ Verificar: Lista de pedidos

---

### **👤 PERFIL DE USUARIO**

- [ ] **Ver Perfil**
  - Ir a http://localhost:8080/profile.html
  - ✅ Verificar: Información cargada

- [ ] **Editar Información**
  - Modificar nombre, teléfono
  - Click en "Guardar Cambios"
  - ✅ Verificar: Información actualizada

- [ ] **Cambiar Contraseña**
  - Llenar formulario de cambio
  - Click en "Cambiar Contraseña"
  - ✅ Verificar: Contraseña cambiada

---

### **❤️ WISHLIST**

- [ ] **Agregar a Wishlist**
  - Click en ícono de corazón
  - ✅ Verificar: Producto agregado

- [ ] **Ver Wishlist**
  - Ir a http://localhost:8080/wishlist.html
  - ✅ Verificar: Lista visible

- [ ] **Eliminar de Wishlist**
  - Click en "Eliminar"
  - ✅ Verificar: Producto eliminado

- [ ] **Agregar al Carrito desde Wishlist**
  - Click en "Agregar al Carrito"
  - ✅ Verificar: Producto en carrito

---

### **⭐ RESEÑAS**

- [ ] **Ver Reseñas**
  - Ir a detalle de producto
  - Scroll hasta reseñas
  - ✅ Verificar: Reseñas visibles

- [ ] **Crear Reseña**
  - Llenar formulario de reseña
  - Click en "Enviar Reseña"
  - ✅ Verificar: Reseña creada

- [ ] **Editar Reseña**
  - En profile.html
  - Buscar reseña propia
  - Editar y guardar
  - ✅ Verificar: Reseña actualizada

---

### **🎛️ PANEL DE ADMINISTRACIÓN**

- [ ] **Login de Admin**
  - Ir a http://localhost:8080/admin-login.html
  - Ingresar credenciales de admin
  - ✅ Verificar: Redirección a panel

- [ ] **Dashboard**
  - Ver sección Dashboard
  - ✅ Verificar: Estadísticas cargadas

- [ ] **Productos - Crear**
  - Click en "Crear Producto"
  - Llenar formulario
  - ✅ Verificar: Producto creado

- [ ] **Productos - Editar**
  - Click en ícono de editar
  - Modificar información
  - ✅ Verificar: Producto actualizado

- [ ] **Productos - Eliminar**
  - Click en ícono de eliminar
  - Confirmar
  - ✅ Verificar: Producto eliminado

- [ ] **Categorías - CRUD**
  - Crear categoría
  - Editar categoría
  - Eliminar categoría
  - ✅ Verificar: Operaciones exitosas

- [ ] **Usuarios**
  - Ver lista de usuarios
  - Editar usuario
  - ✅ Verificar: Operaciones exitosas

- [ ] **Pedidos**
  - Ver lista de pedidos
  - Click en "Ver" de un pedido
  - ✅ Verificar: Detalles completos

- [ ] **Reseñas**
  - Ver lista de reseñas
  - Editar reseña
  - Aprobar/Desaprobar
  - ✅ Verificar: Operaciones exitosas

---

### **📝 BLOG**

- [ ] **Ver Blog**
  - Ir a http://localhost:8080/blog.html
  - ✅ Verificar: Posts visibles

- [ ] **Paginación del Blog**
  - Usar botones de paginación
  - ✅ Verificar: Navegación funciona

- [ ] **Detalle de Post**
  - Click en "Leer más"
  - ✅ Verificar: Post completo

---

### **📜 PÁGINAS LEGALES**

- [ ] **Términos y Condiciones**
  - Ir a http://localhost:8080/terms.html
  - O desde footer
  - ✅ Verificar: Página completa

- [ ] **Política de Privacidad**
  - Ir a http://localhost:8080/privacy.html
  - O desde footer
  - ✅ Verificar: Página completa

- [ ] **Política de Garantía**
  - Ir a http://localhost:8080/warranty.html
  - O desde footer
  - ✅ Verificar: Página completa

- [ ] **Política de Devoluciones**
  - Ir a http://localhost:8080/returns.html
  - O desde footer
  - ✅ Verificar: Página completa

---

### **🎨 UX/UI**

- [ ] **Responsive Design**
  - Probar en móvil
  - Probar en tablet
  - Probar en desktop
  - ✅ Verificar: Diseño adaptativo

- [ ] **Notificaciones**
  - Realizar acciones que generen notificaciones
  - ✅ Verificar: Notificaciones aparecen

- [ ] **Modales**
  - Abrir modales de login/registro
  - Abrir modales de admin
  - ✅ Verificar: Modales funcionan

- [ ] **Navegación**
  - Navegar entre páginas
  - ✅ Verificar: Navegación fluida

- [ ] **Validaciones**
  - Enviar formularios vacíos
  - Enviar datos inválidos
  - ✅ Verificar: Validaciones funcionan

---

### **🐛 MANEJO DE ERRORES**

- [ ] **Errores de Red**
  - Detener backend
  - Intentar operaciones
  - ✅ Verificar: Mensajes de error claros

- [ ] **Permisos**
  - Intentar acceder a admin sin permisos
  - ✅ Verificar: Acceso denegado

- [ ] **Datos Inválidos**
  - Enviar datos incorrectos
  - ✅ Verificar: Validación funciona

---

## 📊 **RESUMEN DE PRUEBAS**

### **Total de Tests:**
- Autenticación: 4 tests
- Productos: 5 tests
- Carrito: 5 tests
- Checkout: 3 tests
- Perfil: 3 tests
- Wishlist: 4 tests
- Reseñas: 3 tests
- Panel Admin: 9 tests
- Blog: 3 tests
- Páginas Legales: 4 tests
- UX/UI: 5 tests
- Manejo de Errores: 3 tests

**Total: 51 tests**

---

## ✅ **CRITERIOS DE ÉXITO**

### **Todos los tests deben:**
- ✅ Ejecutarse sin errores
- ✅ Mostrar comportamiento esperado
- ✅ Tener feedback visual claro
- ✅ Funcionar en múltiples navegadores
- ✅ Ser responsive

---

## 📝 **NOTAS**

- Marcar cada test con ✅ cuando esté completo
- Documentar cualquier problema encontrado
- Tomar screenshots de bugs
- Probar en múltiples navegadores

---

## 🎯 **OBJETIVO**

Completar **100% de los tests** para validar que todas las funcionalidades están trabajando correctamente.

---

**Fecha:** 16 de Octubre, 2025  
**Estado:** 🧪 Listo para Pruebas  
**Tiempo Estimado:** 2 horas

