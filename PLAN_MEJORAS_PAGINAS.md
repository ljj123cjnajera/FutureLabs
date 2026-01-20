# 🎯 PLAN DE MEJORAS SISTEMÁTICAS - Todas las Páginas

## 📋 PROBLEMAS IDENTIFICADOS

### 1. Estructura HTML Inconsistente
- ❌ Algunas páginas sin footer
- ❌ Orden de scripts inconsistente
- ❌ Falta de etiquetas semánticas (main, section)
- ❌ ARIA labels faltantes

### 2. CSS y Estilos
- ❌ Imports CSS inconsistentes
- ❌ Falta de versionado en algunos CSS
- ❌ Estilos duplicados

### 3. Scripts
- ❌ Orden de carga inconsistente
- ❌ Falta error-handler.js y loading-states.js en algunas páginas
- ❌ Scripts duplicados

### 4. Responsive Design
- ❌ Falta de meta viewport en algunas páginas
- ❌ Media queries inconsistentes

### 5. Accesibilidad
- ❌ Falta de aria-labels
- ❌ Contraste de colores
- ❌ Navegación por teclado

## ✅ CORRECCIONES PRIORITARIAS

### FASE 1: Estructura Básica (CRÍTICO)
1. ✅ Agregar footer a todas las páginas
2. ✅ Estandarizar orden de scripts
3. ✅ Agregar etiquetas semánticas
4. ✅ Verificar que todas tengan header y footer

### FASE 2: Scripts y Funcionalidad
1. ✅ Agregar error-handler.js donde falte
2. ✅ Agregar loading-states.js donde falte
3. ✅ Estandarizar orden: logger → api → components → auth → notifications → page-specific

### FASE 3: CSS y Diseño
1. ✅ Estandarizar imports CSS
2. ✅ Agregar versionado a todos los CSS
3. ✅ Verificar que todos usen variables.css

### FASE 4: UX y Accesibilidad
1. ✅ Mejorar mensajes de error
2. ✅ Agregar estados de carga
3. ✅ Mejorar accesibilidad

## 📝 CHECKLIST POR PÁGINA

### Páginas Principales
- [x] index.html - ✅ OK
- [x] products.html - ✅ OK
- [x] product-detail.html - ✅ OK
- [x] cart.html - ✅ OK
- [x] checkout.html - ✅ OK
- [x] profile.html - ✅ OK
- [x] about.html - ✅ OK
- [x] contact.html - ✅ OK
- [x] search.html - ✅ skeleton en loading, media 600px (filtros, grid 1 col), typography→variables

### Páginas de Autenticación
- [x] login.html - ✅ Corregido (footer agregado)
- [x] register.html - ✅ Corregido (footer agregado)
- [x] forgot-password.html - ✅ OK
- [x] reset-password.html - ✅ OK

### Páginas Legales/Info
- [x] faq.html - ✅ OK
- [x] terms.html - ✅ OK
- [x] privacy.html - ✅ OK
- [x] returns.html - ✅ OK (scripts duplicados corregidos)
- [x] warranty.html - ✅ OK
- [x] 404.html - ✅ Corregido (footer agregado)

### Páginas Admin
- [x] admin.html - ✅ Revisado: notifications.css, enlace Cupones→admin-coupons, showSection con guards
- [x] admin-login.html - ✅ Revisado: CSS reducido (auth-brutalist), scripts mínimos (logger, error-handler, loading-states, api, admin-login)
- [x] admin-coupons.html - ✅ Revisado: fuentes al inicio, utils.js, CSS sin header/footer/autocomplete

### Otras
- [x] order-success.html - ✅ OK: preconnect + fuentes; header/footer inyectados; logger, error-handler, loading-states, api, components, auth, notifications, cart, wishlist

## 🚀 PRÓXIMOS PASOS

1. ~~Verificar y corregir páginas admin~~ ✅
2. ~~Mejorar search.html (CSS)~~ ✅ skeleton, media queries móvil
3. ~~Agregar error-handler y loading-states a todas~~ ✅ (todas las .html los incluyen)
4. ~~Mejorar responsive: faq, terms, profile, 404~~ ✅ faq/legal layouts en pages-brutalist; profile en account-brutalist; 404 footer, .btn-home, breakpoint 600px
5. ~~Optimizar performance (preload críticos, defer no críticos, lazy images)~~ ✅ preload typography+imagen hero en index; getProductCard ya usa loading=lazy
