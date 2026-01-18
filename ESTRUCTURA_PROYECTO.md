# 📁 ESTRUCTURA DEL PROYECTO - FutureLabs Sneakers Shop

**Última actualización:** 2025-01-15  
**Versión:** 1.0

---

## 📂 ORGANIZACIÓN DE ARCHIVOS

### 🎯 JavaScript (`/js`)

#### **Core System** (Carga crítica - orden importante)
1. `logger.js` - Sistema de logging condicional
2. `error-handler.js` - Manejo centralizado de errores
3. `loading-states.js` - Estados de carga consistentes
4. `utils.js` - Funciones de utilidad compartidas
5. `api.js` - Cliente API unificado
6. `components.js` - Componentes reutilizables (Header, Footer, Cards)
7. `navigation-enhanced.js` - Navegación mejorada
8. `auth.js` - Autenticación y autorización
9. `cart.js` - Gestión del carrito
10. `notifications.js` - Sistema de notificaciones

#### **Features por Página**
- `home.js` - Página principal
- `products.js` - Catálogo de productos
- `product-detail.js` - Detalle de producto
- `cart.js` - Página del carrito
- `checkout.js` - Proceso de pago
- `profile.js` - Perfil de usuario
- `search.js` - Búsqueda de productos
- `order-success.js` - Confirmación de pedido

#### **Componentes de Producto**
- `product-gallery.js` - Galería de imágenes
- `related-products.js` - Productos relacionados
- `recently-viewed.js` - Productos vistos recientemente
- `quick-view.js` - Vista rápida de producto
- `reviews.js` - Sistema de reseñas

#### **Autenticación**
- `login.js` - Inicio de sesión
- `register.js` - Registro
- `recovery.js` - Recuperación de cuenta
- `reset-password.js` - Restablecer contraseña
- `verification.js` - Verificación de email

#### **Admin**
- `admin.js` - Panel principal
- `admin-login.js` - Login de admin
- `admin-crud.js` - CRUD de productos
- `admin-coupons.js` - Gestión de cupones
- `admin-home-content.js` - Contenido del home

#### **Utilidades**
- `breadcrumbs.js` - Navegación breadcrumb
- `seo-manager.js` - Gestión de SEO
- `form-validator.js` - Validación de formularios
- `autocomplete.js` - Autocompletado de búsqueda
- `coupons.js` - Gestión de cupones (frontend)
- `wishlist.js` - Lista de deseos
- `chat-widget.js` - Widget de chat

#### **Páginas Estáticas**
- `about.js` - Página "Acerca de"
- `contact.js` - Página de contacto
- `faq.js` - Preguntas frecuentes
- `legal.js` - Páginas legales
- `404.js` - Página de error 404

---

### 🎨 CSS (`/css`)

#### **Core Styles** (Carga crítica - orden importante)
1. `variables.css` - Variables CSS globales
2. `typography.css` - Tipografía base
3. `home-streetwear.css` - Estilos principales
4. `footer-brutalist.css` - Footer
5. `header-v3.css` - Header
6. `autocomplete.css` - Autocompletado
7. `product-cards.css` - Tarjetas de producto
8. `skeleton.css` - Loading skeletons
9. `animations.css` - Animaciones
10. `notifications.css` - Notificaciones

#### **Páginas Específicas**
- `products-streetwear.css` - Página de productos
- `pdp-brutalist.css` - Product Detail Page
- `cart-brutalist.css` - Carrito
- `checkout-brutalist.css` - Checkout
- `pages-brutalist.css` - Páginas estáticas
- `order-success.css` - Confirmación de pedido
- `404-improved.css` - Error 404

#### **Componentes**
- `product-gallery.css` - Galería de productos
- `related-products.css` - Productos relacionados
- `recently-viewed.css` - Vistos recientemente
- `quickview.css` - Vista rápida
- `reviews.css` - Reseñas
- `breadcrumbs.css` - Breadcrumbs

#### **Específicos**
- `account-brutalist.css` - Cuenta de usuario
- `auth-brutalist.css` - Autenticación
- `profile-wishlist-orders.css` - Perfil
- `admin.css` - Panel admin
- `coupons.css` - Cupones

---

## 🔄 ORDEN DE CARGA ESTÁNDAR

### HTML Head (CSS)
```html
<!-- Core Styles -->
<link rel="stylesheet" href="css/typography.css?v=8.0-URGENT">
<link rel="stylesheet" href="css/home-streetwear.css?v=8.0-URGENT">
<link rel="stylesheet" href="css/footer-brutalist.css?v=8.0-URGENT">
<link rel="stylesheet" href="css/autocomplete.css?v=8.0-URGENT">
<link rel="stylesheet" href="css/header-v3.css?v=8.0-URGENT">
<link rel="stylesheet" href="css/product-cards.css?v=8.0-URGENT">
<link rel="stylesheet" href="css/skeleton.css?v=8.0-URGENT">

<!-- Page-specific CSS -->
<link rel="stylesheet" href="css/[page-specific].css?v=8.0-URGENT">
```

### HTML Body (Scripts)
```html
<!-- Core System -->
<script src="js/logger.js?v=1.0"></script>
<script src="js/error-handler.js?v=1.0"></script>
<script src="js/loading-states.js?v=1.0"></script>
<script src="js/utils.js?v=1.0"></script>
<script src="js/api.js?v=7.2"></script>
<script src="js/components.js?v=7.2"></script>
<script src="js/navigation-enhanced.js?v=7.2"></script>
<script src="js/auth.js?v=7.2"></script>
<script src="js/cart.js?v=7.2"></script>
<script src="js/notifications.js?v=7.2"></script>

<!-- Page-specific Scripts -->
<script src="js/[page-specific].js"></script>
```

---

## 📊 ESTADÍSTICAS

- **Total JS:** 44 archivos
- **Total CSS:** 28 archivos
- **Total HTML:** 23 páginas
- **Core JS:** 10 archivos (carga crítica)
- **Core CSS:** 10 archivos (carga crítica)

---

## ✅ CONVENCIONES

### Versionado
- **CSS Core:** `v8.0-URGENT`
- **JS Core:** `v7.2`
- **JS Utils:** `v1.0`
- **Page-specific:** Sin versión o `v1.0`

### Nomenclatura
- **JS:** `kebab-case.js` (ej: `product-detail.js`)
- **CSS:** `kebab-case.css` (ej: `product-cards.css`)
- **HTML:** `kebab-case.html` (ej: `product-detail.html`)

### Dependencias
- Los archivos core NO deben tener dependencias entre sí (excepto `logger.js` que es base)
- Los archivos de página pueden depender de core
- Usar `window.[Namespace]` para APIs globales

---

## 🗑️ ARCHIVOS OBSOLETOS

### Eliminados
- `css/comparator.css` - Funcionalidad removida
- `ANALISIS_COMPLETO_PROYECTO.md` - Consolidado

### No Existen (Referencias comentadas)
- `js/design-system.js`
- `js/modals.js`
- `js/skeleton.js`

---

## 📝 NOTAS

- Todos los archivos core deben estar disponibles globalmente vía `window`
- El orden de carga es crítico para el funcionamiento correcto
- Las versiones se usan para cache-busting
- Los archivos `defer` se cargan después del DOM

---

**Última revisión:** 2025-01-15
