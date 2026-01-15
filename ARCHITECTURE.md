# 🏗️ ARQUITECTURA DEL PROYECTO - FutureLabs Sneakers Shop

**Última actualización:** 2025-01-14  
**Versión:** 2.0

---

## 📁 ESTRUCTURA DEL PROYECTO

```
jpp/
├── assets/              # Recursos estáticos (imágenes, etc.)
├── backend/             # API Node.js/Express
│   ├── database/        # Migraciones y seeds
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de API
│   ├── middleware/      # Middleware personalizado
│   └── scripts/         # Scripts de utilidad
├── css/                 # Estilos (29 archivos)
│   ├── variables.css    # Variables CSS globales
│   ├── typography.css   # Tipografía
│   ├── home-streetwear.css  # Estilos principales
│   ├── header-v3.css    # Header
│   ├── footer-brutalist.css  # Footer
│   └── [página]-*.css  # Estilos específicos por página
├── js/                  # JavaScript (40+ archivos)
│   ├── logger.js        # Sistema de logging
│   ├── error-handler.js # Manejo de errores
│   ├── loading-states.js # Estados de carga
│   ├── api.js           # Cliente API
│   ├── components.js    # Componentes reutilizables
│   ├── auth.js          # Autenticación
│   ├── cart.js          # Carrito de compras
│   └── [página].js      # Scripts específicos por página
├── *.html               # Páginas HTML (23 archivos)
└── docs/                # Documentación

```

---

## 🎯 ESTÁNDARES Y CONVENCIONES

### Versionado
- **CSS:** `v8.0-URGENT` (unificado)
- **JS Core:** `v7.2` (unificado)
- **JS Utils:** `v1.0` (logger, error-handler, loading-states)

### Orden de Scripts (Estándar)
1. `logger.js?v=1.0`
2. `error-handler.js?v=1.0`
3. `loading-states.js?v=1.0`
4. `api.js?v=7.2`
5. `components.js?v=7.2`
6. `navigation-enhanced.js?v=7.2`
7. `auth.js?v=7.2`
8. `cart.js?v=7.2` (si aplica)
9. `notifications.js?v=7.2`
10. Scripts específicos de página

### Orden de CSS (Estándar)
1. `typography.css?v=8.0-URGENT`
2. `home-streetwear.css?v=8.0-URGENT`
3. `footer-brutalist.css?v=8.0-URGENT`
4. `autocomplete.css?v=8.0-URGENT`
5. `header-v3.css?v=8.0-URGENT`
6. `product-cards.css?v=8.0-URGENT`
7. `skeleton.css?v=8.0-URGENT`
8. CSS específicos de página

---

## 🔧 COMPONENTES PRINCIPALES

### Core System
- **Logger:** Sistema de logging condicional (producción vs desarrollo)
- **ErrorHandler:** Manejo centralizado de errores
- **LoadingStates:** Estados de carga consistentes
- **API Client:** Cliente unificado para todas las peticiones

### UI Components
- **Components:** Header, Footer, Product Cards, etc.
- **Navigation:** Navegación mejorada con categorías
- **Notifications:** Sistema de notificaciones toast
- **Cart Engine:** Gestión del carrito de compras

### Features
- **Auth:** Autenticación y autorización
- **Products:** Catálogo de productos
- **Checkout:** Proceso de pago
- **Profile:** Perfil de usuario
- **Admin:** Panel de administración

---

## 🌐 API ENDPOINTS

Base URL: `https://futurelabs-production.up.railway.app/api`

### Principales
- `GET /products` - Listar productos
- `GET /products/:id` - Detalle de producto
- `GET /cart` - Obtener carrito
- `POST /cart` - Agregar al carrito
- `POST /orders` - Crear pedido
- `GET /user/profile` - Perfil de usuario
- `GET /addresses` - Direcciones del usuario

---

## 🚀 FLUJOS PRINCIPALES

### Flujo de Compra
1. Usuario navega productos → `products.html`
2. Ve detalle → `product-detail.html`
3. Agrega al carrito → `cart.js`
4. Procede al checkout → `checkout.html`
5. Confirma pedido → `order-success.html`

### Flujo de Autenticación
1. Login/Register → `auth.js`
2. Token guardado en localStorage
3. Header actualizado con `Components.initHeader()`
4. Carrito sincronizado con API

---

## 📝 NOTAS IMPORTANTES

- **No usar `console.log` directamente** - Usar `window.Logger`
- **Manejar errores** con `window.ErrorHandler`
- **Mostrar loading** con `window.LoadingStates`
- **Versiones consistentes** en todas las páginas
- **Traducciones** completas en español

---

## 🔄 ESTADO ACTUAL

- ✅ Estructura base establecida
- ✅ Sistema de logging implementado
- ✅ Manejo de errores centralizado
- ⚠️ Algunas funcionalidades incompletas
- ⚠️ Algunas traducciones pendientes
- 🔄 Refactorización en progreso
