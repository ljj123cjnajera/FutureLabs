# FutureLabs - Diagrama de Flujo de Conexión de Archivos

## Diagrama de Flujo: Carga y Conexión de Archivos

```
                    ┌─────────────────┐
                    │   INICIO        │
                    │  Usuario abre   │
                    │  index.html     │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Navegador      │
                    │  parsea HTML    │
                    │  index.html     │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Encuentra      │
                    │  <link> tags    │
                    │  para CSS       │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ¿Cargar        │
                    │  CSS?           │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Carga          │
                    │  css/style.css  │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Carga          │
                    │  css/responsive.css │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Encuentra      │
                    │  <script> tags  │
                    │  para JS        │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ¿Cargar        │
                    │  JavaScript?    │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Carga          │
                    │  js/carousel.js │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Carga          │
                    │  js/main.js     │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  DOMContentLoaded│
                    │  Event Fired    │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ¿Ejecutar      │
                    │  carousel.js?   │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Inicializa     │
                    │  HeroCarousel   │
                    │  Class          │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ¿Ejecutar      │
                    │  main.js?       │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initStickyHeader│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initSearchFunctionality│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initCartFunctionality│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initSmoothScrolling│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initPlaceholderInteractions│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initSubscriptionBanner│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initChatButton │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Ejecuta        │
                    │  initMegaMenu   │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  ¿Todos los     │
                    │  módulos        │
                    │  cargados?      │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Página         │
                    │  completamente  │
                    │  funcional      │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  FIN            │
                    │  Usuario puede  │
                    │  interactuar    │
                    └─────────────────┘
```

## Detalle de Conexiones por Archivo

### 1. **index.html** (Archivo Principal)
```
index.html
├── <head>
│   ├── <link rel="stylesheet" href="css/style.css">
│   ├── <link rel="stylesheet" href="css/responsive.css">
│   └── <link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome/6.4.0/css/all.min.css">
├── <body>
│   ├── <!-- Header -->
│   ├── <!-- Hero Section -->
│   ├── <!-- Benefits Section -->
│   ├── <!-- Affiliate Banner -->
│   ├── <!-- Flash Offers -->
│   ├── <!-- Banner Grid -->
│   ├── <!-- Product Carousels -->
│   ├── <!-- Categories Section -->
│   ├── <!-- SEO Content -->
│   ├── <!-- Footer -->
│   ├── <!-- Floating Components -->
│   ├── <script src="js/carousel.js"></script>
│   └── <script src="js/main.js"></script>
└── </body>
```

### 2. **css/style.css** (Estilos Principales)
```
style.css
├── :root (CSS Variables)
├── * (Reset)
├── body (Base styles)
├── .container (Layout)
├── .header (Navigation)
├── .hero (Hero section)
├── .section (Content sections)
├── .benefits-slider (Benefits)
├── .affiliate-banner (Affiliate)
├── .banner-grid (Banners)
├── .category-carousel (Carousels)
├── .categories-carousel (Categories)
├── .footer (Footer)
├── .mega-menu (Mega menu)
├── .sticky-footer (Floating)
├── .chat-button (Floating)
└── @keyframes (Animations)
```

### 3. **css/responsive.css** (Responsive Design)
```
responsive.css
├── @media (max-width: 1024px) - Tablet
├── @media (max-width: 768px) - Mobile
└── @media (max-width: 480px) - Small Mobile
```

### 4. **js/carousel.js** (Sistema de Carruseles)
```
carousel.js
├── class HeroCarousel
│   ├── constructor()
│   ├── init()
│   ├── showSlide()
│   ├── nextSlide()
│   ├── prevSlide()
│   ├── goToSlide()
│   ├── startAutoSlide()
│   └── stopAutoSlide()
├── DOMContentLoaded Event
│   ├── HeroCarousel instantiation
│   └── initHorizontalCarousels()
└── initHorizontalCarousels()
    ├── Mouse events
    └── Touch events
```

### 5. **js/main.js** (Funcionalidad Principal)
```
main.js
├── DOMContentLoaded Event
│   ├── initStickyHeader()
│   ├── initSearchFunctionality()
│   ├── initCartFunctionality()
│   ├── initSmoothScrolling()
│   ├── initPlaceholderInteractions()
│   ├── initSubscriptionBanner()
│   ├── initChatButton()
│   └── initMegaMenu()
├── initStickyHeader()
├── initSearchFunctionality()
├── initCartFunctionality()
├── initSmoothScrolling()
├── initPlaceholderInteractions()
├── initSubscriptionBanner()
├── initChatButton()
├── initMegaMenu()
├── showNotification()
└── Dynamic Style Injection
```

## Flujo de Ejecución Detallado

### **Fase 1: Carga de HTML**
1. Usuario abre `index.html`
2. Navegador parsea el HTML
3. Encuentra referencias a CSS y JS

### **Fase 2: Carga de CSS**
1. Carga `css/style.css` (estilos principales)
2. Carga `css/responsive.css` (media queries)
3. Carga Font Awesome desde CDN
4. Aplica estilos al DOM

### **Fase 3: Carga de JavaScript**
1. Carga `js/carousel.js` (sistema de carruseles)
2. Carga `js/main.js` (funcionalidad principal)
3. Ejecuta código JavaScript

### **Fase 4: Inicialización**
1. `DOMContentLoaded` event se dispara
2. `carousel.js` inicializa `HeroCarousel`
3. `main.js` ejecuta todas las funciones `init*()`
4. Página queda completamente funcional

### **Fase 5: Interacción del Usuario**
1. Usuario puede interactuar con todos los elementos
2. Event listeners están activos
3. Funcionalidades responden a las acciones del usuario

## Dependencias entre Archivos

```
index.html
├── css/style.css (depende de)
├── css/responsive.css (depende de)
├── js/carousel.js (depende de)
└── js/main.js (depende de)

css/style.css
└── (no depende de otros archivos del proyecto)

css/responsive.css
└── (depende de css/style.css para sobrescribir estilos)

js/carousel.js
└── (depende de elementos HTML con clases específicas)

js/main.js
├── (depende de elementos HTML con IDs y clases)
└── (depende de js/carousel.js para funcionalidad completa)
```

## Orden de Carga Crítico

1. **HTML** → `index.html` (primero)
2. **CSS** → `style.css` → `responsive.css` (segundo)
3. **JavaScript** → `carousel.js` → `main.js` (tercero)
4. **Inicialización** → Event listeners y funcionalidades (cuarto)

Este orden es crítico porque:
- El HTML debe cargarse primero para que el CSS tenga elementos a los que aplicar estilos
- El CSS debe cargarse antes que el JS para que los elementos tengan sus estilos aplicados
- El JavaScript debe cargarse al final para que el DOM esté completamente renderizado
- Los event listeners deben inicializarse después de que todos los archivos estén cargados

