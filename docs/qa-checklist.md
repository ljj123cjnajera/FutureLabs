# Checklist QA - FutureLabs Pre-Deploy

## 🎯 Objetivo
Verificar que todas las funcionalidades críticas del panel de administración y frontend funcionen correctamente antes de hacer deploy a producción.

---

## ✅ Checklist General

### 🔐 Autenticación y Seguridad
- [ ] Login de admin funciona correctamente
- [ ] Logout elimina token y redirige
- [ ] Acceso sin token redirige a login
- [ ] Token expirado maneja correctamente
- [ ] Usuarios sin rol admin no pueden acceder
- [ ] Sesión persiste al recargar página

### 🎨 Frontend Público
- [ ] Home page carga correctamente
- [ ] Contenido dinámico (hero slides, banners, benefits, sections) se muestra
- [ ] Solo contenido activo aparece
- [ ] Orden (order_index) se respeta
- [ ] Búsqueda funciona
- [ ] Carrito funciona
- [ ] Wishlist funciona
- [ ] Checkout funciona
- [ ] Registro y login de usuarios funciona
- [ ] Verificación de email funciona

### 📦 Panel de Administración - Productos
- [ ] Listar productos funciona
- [ ] Crear producto funciona (con validaciones)
- [ ] Editar producto funciona
- [ ] Eliminar producto funciona
- [ ] Subida de imágenes funciona
- [ ] Validaciones de formulario funcionan
- [ ] Estados vacíos se muestran correctamente
- [ ] Errores se manejan apropiadamente

### 🏷️ Panel de Administración - Categorías
- [ ] Listar categorías funciona
- [ ] Crear categoría funciona
- [ ] Editar categoría funciona
- [ ] Eliminar categoría funciona
- [ ] Validaciones funcionan

### 🛒 Panel de Administración - Pedidos
- [ ] Listar pedidos funciona
- [ ] Ver detalles de pedido funciona
- [ ] Estados se muestran correctamente
- [ ] Información de cliente se muestra
- [ ] Items del pedido se listan

### 👥 Panel de Administración - Usuarios
- [ ] Listar usuarios funciona
- [ ] Editar usuario funciona
- [ ] Estados de verificación se muestran

### ⭐ Panel de Administración - Reseñas
- [ ] Listar reseñas funciona
- [ ] Editar reseña funciona
- [ ] Eliminar reseña funciona
- [ ] Validación de rating (1-5) funciona

### 🏠 Panel de Administración - Contenido Home
- [ ] Hero Slides: CRUD completo funciona
- [ ] Banners: CRUD completo funciona (con fechas)
- [ ] Beneficios: CRUD completo funciona
- [ ] Secciones Home: CRUD completo funciona
- [ ] Contenido se sincroniza con frontend

### ⚠️ Validaciones y Edge Cases
- [ ] Validaciones de números funcionan (precio, stock, rating)
- [ ] Validaciones de texto funcionan (nombre, slug)
- [ ] Validaciones de URLs funcionan (imágenes)
- [ ] Validaciones de fechas funcionan (banners)
- [ ] Campos requeridos muestran error si están vacíos
- [ ] Errores de red se manejan apropiadamente
- [ ] Errores 401 redirigen a login
- [ ] Errores 500 muestran mensaje apropiado
- [ ] XSS: Datos se escapan correctamente
- [ ] Múltiples operaciones simultáneas se previenen

### 📱 Responsive
- [ ] Panel funciona en móvil/tablet
- [ ] Modales se adaptan a pantallas pequeñas
- [ ] Tablas son scrollables en móvil
- [ ] Frontend funciona en móvil/tablet

### 🔔 Notificaciones y Feedback
- [ ] Toasts de éxito se muestran
- [ ] Toasts de error se muestran
- [ ] Mensajes vacíos son descriptivos
- [ ] Estados de carga (spinners) se muestran
- [ ] Botones se deshabilitan durante operaciones

---

## 🧪 Pruebas Específicas por Navegador

### Chrome
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] Performance aceptable

### Firefox
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] Performance aceptable

### Safari
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] Caching funciona correctamente
- [ ] Performance aceptable

---

## 🔍 Pruebas de Performance

- [ ] Dashboard carga en < 3 segundos
- [ ] Tablas de datos cargan en < 2 segundos
- [ ] Modales se abren sin delay visible
- [ ] Imágenes se cargan correctamente
- [ ] No hay memory leaks evidentes

---

## 🐛 Bugs Conocidos y Pendientes

### Críticos (Bloquean deploy)
- [ ] Ninguno

### Altos (Deben resolverse pronto)
- [ ] Ninguno

### Medios (Pueden esperar)
- [ ] Ninguno

### Bajos (Mejoras futuras)
- [ ] Ninguno

---

## 📋 Checklist de Deploy

### Pre-Deploy
- [ ] Todas las pruebas del checklist pasan
- [ ] Código está en la rama correcta (`fix/db-connection-railway`)
- [ ] Cambios están commiteados y pusheados
- [ ] Variables de entorno están configuradas
- [ ] Base de datos está actualizada (migrations)
- [ ] Backend está corriendo en Railway
- [ ] Frontend está desplegado (GitHub Pages o similar)

### Post-Deploy
- [ ] Verificar que el backend responde
- [ ] Verificar que el frontend carga
- [ ] Probar login de admin
- [ ] Probar una operación CRUD (crear producto)
- [ ] Verificar que el contenido aparece en frontend
- [ ] Revisar logs de Railway por errores

---

## 📝 Notas Adicionales

### Ambiente de Producción
- **Backend URL**: `https://futurelabs-production.up.railway.app`
- **Frontend URL**: `https://ljj123cjnajera.github.io/FutureLabs`
- **Base de datos**: PostgreSQL en Railway

### Credenciales de Prueba
- **Admin**: `admin@futurelabs.com` / `password123`
- **Usuario de prueba**: `test@futurelabs.com` / `password123`

### Comandos Útiles
```bash
# Verificar estado de git
git status

# Verificar rama actual
git branch

# Verificar últimos commits
git log --oneline -5

# Verificar que cambios están pusheados
git log origin/fix/db-connection-railway --oneline -5
```

---

## ✅ Firma de Aprobación

- [ ] **Desarrollador**: _________________ Fecha: ___________
- [ ] **QA/Tester**: _________________ Fecha: ___________
- [ ] **Product Owner**: _________________ Fecha: ___________

---

**Última actualización**: 2025-01-XX
**Versión**: 1.0

