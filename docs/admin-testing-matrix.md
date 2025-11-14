# Matriz de Pruebas - Panel de Administración FutureLabs

## 📋 Índice
1. [Autenticación y Acceso](#autenticación-y-acceso)
2. [Dashboard](#dashboard)
3. [Productos](#productos)
4. [Categorías](#categorías)
5. [Pedidos](#pedidos)
6. [Usuarios](#usuarios)
7. [Reseñas](#reseñas)
8. [Contenido del Home](#contenido-del-home)
9. [Validaciones y Edge Cases](#validaciones-y-edge-cases)

---

## 🔐 Autenticación y Acceso

### Pruebas de Login
- [ ] **ACC-001**: Login con credenciales válidas de admin
  - **Resultado esperado**: Redirección al panel, token guardado
- [ ] **ACC-002**: Login con credenciales inválidas
  - **Resultado esperado**: Mensaje de error, no redirección
- [ ] **ACC-003**: Login con usuario sin rol admin
  - **Resultado esperado**: Mensaje de permisos insuficientes, redirección a index
- [ ] **ACC-004**: Acceso directo a admin.html sin token
  - **Resultado esperado**: Redirección a admin-login.html
- [ ] **ACC-005**: Logout funciona correctamente
  - **Resultado esperado**: Token eliminado, redirección a login

### Pruebas de Sesión
- [ ] **ACC-006**: Token expirado/inválido
  - **Resultado esperado**: Redirección a login con mensaje apropiado
- [ ] **ACC-007**: Persistencia de sesión al recargar página
  - **Resultado esperado**: Usuario permanece logueado

---

## 📊 Dashboard

### Carga de Datos
- [ ] **DASH-001**: Estadísticas generales se cargan correctamente
  - **Verificar**: Total productos, usuarios, pedidos, ventas
- [ ] **DASH-002**: Gráficos se renderizan (Chart.js)
  - **Verificar**: Ventas últimos 7 días, pedidos por estado, top productos, métodos de pago
- [ ] **DASH-003**: Pedidos recientes se muestran (máx. 10)
  - **Verificar**: Tabla con datos correctos, botón "Ver" funciona
- [ ] **DASH-004**: Estado vacío cuando no hay datos
  - **Resultado esperado**: Mensaje descriptivo con icono

### Manejo de Errores
- [ ] **DASH-005**: Error al cargar dashboard
  - **Resultado esperado**: Mensaje de error con botón "Reintentar"

---

## 📦 Productos

### Listado
- [ ] **PROD-001**: Tabla de productos se carga correctamente
  - **Verificar**: Columnas (ID, Nombre, Precio, Stock, Categoría, Estado, Acciones)
- [ ] **PROD-002**: Estado de carga muestra spinner
- [ ] **PROD-003**: Estado vacío cuando no hay productos
  - **Resultado esperado**: Mensaje descriptivo con icono
- [ ] **PROD-004**: Error al cargar productos muestra mensaje con "Reintentar"

### Crear Producto
- [ ] **PROD-005**: Botón "Nuevo Producto" abre modal
- [ ] **PROD-006**: Validación de campos requeridos
  - **Campos**: Nombre (mín. 3 chars), Slug (mín. 3, formato válido), Precio (> 0), Categoría, Stock (≥ 0, entero)
- [ ] **PROD-007**: Validación de precio de descuento
  - **Verificar**: Debe ser < precio normal, > 0, número válido
- [ ] **PROD-008**: Validación de slug (solo letras minúsculas, números, guiones)
- [ ] **PROD-009**: Subida de imagen funciona
  - **Verificar**: Preview, URL generada correctamente
- [ ] **PROD-010**: Guardar producto nuevo exitosamente
  - **Resultado esperado**: Toast de éxito, tabla actualizada, modal se cierra
- [ ] **PROD-011**: Error al guardar muestra mensaje apropiado

### Editar Producto
- [ ] **PROD-012**: Botón "Editar" abre modal con datos precargados
- [ ] **PROD-013**: Modal no se cierra durante carga
- [ ] **PROD-014**: Loading overlay se muestra durante carga
- [ ] **PROD-015**: Error al cargar producto muestra mensaje con "Reintentar"
- [ ] **PROD-016**: Actualizar producto exitosamente
  - **Resultado esperado**: Toast de éxito, tabla actualizada
- [ ] **PROD-017**: Validaciones funcionan igual que en crear

### Eliminar Producto
- [ ] **PROD-018**: Botón "Eliminar" muestra confirmación
- [ ] **PROD-019**: Eliminar producto exitosamente
  - **Resultado esperado**: Toast de éxito, tabla actualizada
- [ ] **PROD-020**: Cancelar eliminación no hace nada

---

## 🏷️ Categorías

### Listado
- [ ] **CAT-001**: Tabla de categorías se carga correctamente
- [ ] **CAT-002**: Estado vacío cuando no hay categorías
- [ ] **CAT-003**: Error al cargar muestra mensaje con "Reintentar"

### Crear Categoría
- [ ] **CAT-004**: Botón "Nueva Categoría" abre modal
- [ ] **CAT-005**: Validación de campos requeridos
  - **Campos**: Nombre (mín. 3 chars), Slug (mín. 3, formato válido)
- [ ] **CAT-006**: Guardar categoría nueva exitosamente
- [ ] **CAT-007**: Error al guardar muestra mensaje apropiado

### Editar Categoría
- [ ] **CAT-008**: Botón "Editar" abre modal con datos precargados
- [ ] **CAT-009**: Actualizar categoría exitosamente
- [ ] **CAT-010**: Validaciones funcionan igual que en crear

### Eliminar Categoría
- [ ] **CAT-011**: Botón "Eliminar" muestra confirmación
- [ ] **CAT-012**: Eliminar categoría exitosamente

---

## 🛒 Pedidos

### Listado
- [ ] **ORD-001**: Tabla de pedidos se carga correctamente
  - **Verificar**: Columnas (Número, Cliente, Total, Estado, Pago, Fecha, Acciones)
- [ ] **ORD-002**: Estado vacío cuando no hay pedidos
- [ ] **ORD-003**: Error al cargar muestra mensaje con "Reintentar"
- [ ] **ORD-004**: Toast de éxito muestra cantidad cargada

### Ver Detalles
- [ ] **ORD-005**: Botón "Ver" abre modal con detalles
- [ ] **ORD-006**: Información del pedido se muestra correctamente
  - **Verificar**: Número, cliente, email, teléfono, fecha, estado, pago, totales, dirección
- [ ] **ORD-007**: Items del pedido se listan correctamente
- [ ] **ORD-008**: Estado vacío cuando no hay items

---

## 👥 Usuarios

### Listado
- [ ] **USER-001**: Tabla de usuarios se carga correctamente
  - **Verificar**: Columnas (ID, Nombre, Email, Rol, Verificado, Fecha, Acciones)
- [ ] **USER-002**: Estado vacío cuando no hay usuarios
- [ ] **USER-003**: Error al cargar muestra mensaje con "Reintentar"
- [ ] **USER-004**: Toast de éxito muestra cantidad cargada

### Editar Usuario
- [ ] **USER-005**: Botón "Editar" abre modal con datos precargados
- [ ] **USER-006**: Actualizar usuario exitosamente
- [ ] **USER-007**: Validación de email funciona

---

## ⭐ Reseñas

### Listado
- [ ] **REV-001**: Tabla de reseñas se carga correctamente
  - **Verificar**: Columnas (ID, Usuario, Producto, Rating, Título, Aprobado, Acciones)
- [ ] **REV-002**: Estado vacío cuando no hay reseñas
- [ ] **REV-003**: Error al cargar muestra mensaje con "Reintentar"
- [ ] **REV-004**: Toast de éxito muestra cantidad cargada

### Editar Reseña
- [ ] **REV-005**: Botón "Editar" abre modal con datos precargados
- [ ] **REV-006**: Validación de rating (1-5)
  - **Verificar**: Números fuera de rango muestran error
- [ ] **REV-007**: Actualizar reseña exitosamente

### Eliminar Reseña
- [ ] **REV-008**: Botón "Eliminar" muestra confirmación
- [ ] **REV-009**: Eliminar reseña exitosamente

---

## 🏠 Contenido del Home

### Hero Slides
- [ ] **HOME-001**: Listado de hero slides se carga
- [ ] **HOME-002**: Crear nuevo slide funciona
  - **Verificar**: Validación de campos, subida de imagen, orden
- [ ] **HOME-003**: Editar slide funciona
- [ ] **HOME-004**: Eliminar slide funciona
- [ ] **HOME-005**: Cambiar orden (order_index) funciona

### Banners
- [ ] **HOME-006**: Listado de banners se carga
- [ ] **HOME-007**: Crear banner funciona
  - **Verificar**: Validación de fechas (start_date, end_date), tipo, posición
- [ ] **HOME-008**: Editar banner funciona
- [ ] **HOME-009**: Eliminar banner funciona

### Beneficios
- [ ] **HOME-010**: Listado de beneficios se carga
- [ ] **HOME-011**: Crear beneficio funciona
  - **Verificar**: Validación de icono/imagen, orden
- [ ] **HOME-012**: Editar beneficio funciona
- [ ] **HOME-013**: Eliminar beneficio funciona

### Secciones Home
- [ ] **HOME-014**: Listado de secciones se carga
- [ ] **HOME-015**: Crear sección funciona
  - **Verificar**: Validación de tipo, categoría, límite, orden
- [ ] **HOME-016**: Editar sección funciona
- [ ] **HOME-017**: Eliminar sección funciona

### Sincronización Frontend
- [ ] **HOME-018**: Contenido creado en admin aparece en index.html
  - **Verificar**: Hero slides, banners, benefits, sections se muestran
- [ ] **HOME-019**: Solo contenido activo se muestra
- [ ] **HOME-020**: Orden (order_index) se respeta

---

## ⚠️ Validaciones y Edge Cases

### Validaciones de Formularios
- [ ] **VAL-001**: Campos requeridos muestran error si están vacíos
- [ ] **VAL-002**: Validación de números (precio, stock, rating)
  - **Verificar**: NaN, negativos, decimales en stock
- [ ] **VAL-003**: Validación de URLs (imágenes)
- [ ] **VAL-004**: Validación de fechas (banners)
- [ ] **VAL-005**: Validación de email (usuarios)

### Manejo de Errores
- [ ] **ERR-001**: Error de red muestra mensaje apropiado
- [ ] **ERR-002**: Error 401 (no autorizado) redirige a login
- [ ] **ERR-003**: Error 500 muestra mensaje genérico
- [ ] **ERR-004**: Timeout de requests muestra mensaje

### Estados de Carga
- [ ] **LOAD-001**: Spinners se muestran durante carga
- [ ] **LOAD-002**: Botones se deshabilitan durante operaciones
- [ ] **LOAD-003**: Múltiples operaciones simultáneas se previenen

### XSS y Seguridad
- [ ] **SEC-001**: Datos se escapan correctamente (escapeHtml)
- [ ] **SEC-002**: No se pueden inyectar scripts en campos de texto
- [ ] **SEC-003**: IDs se validan antes de usar en queries

### Responsive
- [ ] **RESP-001**: Panel funciona en móvil (tablet)
- [ ] **RESP-002**: Modales se adaptan a pantallas pequeñas
- [ ] **RESP-003**: Tablas son scrollables en móvil

---

## 📝 Notas de Pruebas

### Ambiente de Pruebas
- **Backend**: Railway (producción/staging)
- **Frontend**: Localhost o GitHub Pages
- **Navegadores**: Chrome, Firefox, Safari (últimas versiones)

### Datos de Prueba
- Usuario admin: `admin@futurelabs.com` / `password123`
- Productos de prueba: Varios con diferentes estados
- Pedidos de prueba: Varios con diferentes estados

### Checklist Pre-Deploy
Ver `docs/qa-checklist.md` para checklist completo antes de deploy.

---

**Última actualización**: 2025-01-XX
**Versión**: 1.0

