# 🎠 Guía Completa: Sistema de Hero Slides

## 📋 Resumen

El sistema de Hero Slides permite gestionar el carrusel principal de la página de inicio desde el panel de administración. Los slides se muestran dinámicamente en `index.html`.

---

## ✅ Estado Actual: **FUNCIONAL Y COMPLETO**

### Backend ✅
- ✅ Tabla `hero_slides` creada en la base de datos
- ✅ Modelo `HeroSlide.js` con métodos CRUD
- ✅ Endpoints API completos:
  - `GET /api/home-content/hero-slides` (público - solo activos)
  - `GET /api/home-content/admin/hero-slides` (admin - todos)
  - `POST /api/home-content/admin/hero-slides` (crear)
  - `PUT /api/home-content/admin/hero-slides/:id` (actualizar)
  - `DELETE /api/home-content/admin/hero-slides/:id` (eliminar)

### Frontend - Panel Admin ✅
- ✅ Sección "Hero Slides" en el menú lateral
- ✅ Tabla que lista todos los slides
- ✅ Modal para crear/editar slides
- ✅ Validación de formularios
- ✅ Subida de imágenes
- ✅ Preview de imágenes
- ✅ Botones de editar/eliminar

### Frontend - Página Principal ✅
- ✅ Carga dinámica de slides desde la API
- ✅ Renderizado automático en el carrusel
- ✅ Filtrado de slides activos
- ✅ Ordenamiento por `order_index`
- ✅ Integración con `HeroCarousel` para navegación
- ✅ Estado vacío cuando no hay slides

---

## 🎯 Cómo Usar el Sistema

### 1. Acceder al Panel de Administración

1. Ir a `admin-login.html`
2. Iniciar sesión con credenciales de administrador
3. En el menú lateral, hacer clic en **"Hero Slides"**

### 2. Crear un Nuevo Slide

1. Hacer clic en el botón **"Nuevo Slide"**
2. Completar el formulario:
   - **Título** * (obligatorio): Título principal del slide
   - **Descripción** (opcional): Texto descriptivo
   - **Texto del Botón** (opcional): Texto del botón CTA
   - **Link del Botón** (opcional): URL a donde redirige el botón
   - **URL de Imagen** (opcional): URL directa de la imagen
   - **Subir Imagen** (opcional): Subir archivo de imagen
   - **Color de Fondo**: Color hexadecimal (por defecto #667eea)
   - **Orden**: Número para ordenar slides (0, 1, 2, ...)
   - **Activo**: Checkbox para activar/desactivar el slide
3. Hacer clic en **"Guardar"**

### 3. Editar un Slide Existente

1. En la tabla de slides, hacer clic en **"Editar"** del slide deseado
2. Modificar los campos necesarios
3. Hacer clic en **"Guardar"**

### 4. Eliminar un Slide

1. En la tabla de slides, hacer clic en **"Eliminar"** del slide deseado
2. Confirmar la eliminación

### 5. Ordenar Slides

Los slides se ordenan automáticamente por el campo **"Orden"** (ascendente). Para cambiar el orden:

1. Editar cada slide
2. Cambiar el valor del campo **"Orden"**
3. Guardar

**Ejemplo:**
- Slide 1: Orden = 0
- Slide 2: Orden = 1
- Slide 3: Orden = 2

---

## 📊 Estructura de Datos

### Tabla `hero_slides`

```sql
- id (UUID, primary key)
- title (string, 200, required)
- description (text, optional)
- button_text (string, 100, optional)
- button_link (string, 500, optional)
- image_url (string, 500, optional)
- background_color (string, 50, optional, default: #667eea)
- order_index (integer, default: 0)
- is_active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
```

### Ejemplo de Slide

```json
{
  "id": "uuid-here",
  "title": "Nuevos Smartphones 2024",
  "description": "Descubre la última tecnología en smartphones",
  "button_text": "Ver Productos",
  "button_link": "products.html?category=celulares",
  "image_url": "https://example.com/hero-image.jpg",
  "background_color": "#667eea",
  "order_index": 0,
  "is_active": true
}
```

---

## 🔄 Flujo de Funcionamiento

### 1. Panel Admin → Base de Datos

```
Admin crea/edita slide
    ↓
js/admin-home-content.js → saveHeroSlide()
    ↓
window.api.createHeroSlide() / updateHeroSlide()
    ↓
POST/PUT /api/home-content/admin/hero-slides
    ↓
HeroSlide.create() / HeroSlide.update()
    ↓
Base de datos (hero_slides table)
```

### 2. Base de Datos → Frontend Público

```
Usuario visita index.html
    ↓
HomeManager.init() → loadHomeContent()
    ↓
window.api.getHomeContent()
    ↓
GET /api/home-content/all
    ↓
HeroSlide.getAll(activeOnly: true)
    ↓
Filtra slides activos y ordena por order_index
    ↓
HomeManager.renderHeroSlides()
    ↓
Crea elementos DOM dinámicamente
    ↓
window.initHeroCarousel() → Inicializa carrusel
```

---

## 🎨 Renderizado en el Frontend

### Estructura HTML Generada

```html
<div class="hero-slider" id="heroSlider">
  <div class="hero-slides" id="heroSlidesContainer">
    <div class="slide active" style="background: #667eea; background-image: url(...)">
      <div class="slide-content">
        <h1>Título del Slide</h1>
        <p>Descripción del slide</p>
        <button class="btn btn-primary btn-lg">Texto del Botón</button>
      </div>
    </div>
    <!-- Más slides... -->
  </div>
  <div class="slider-controls" id="heroSliderDots">
    <button class="slider-dot active"></button>
    <!-- Más dots... -->
  </div>
</div>
```

### Estilos Aplicados

- **Background**: Color de fondo o imagen con overlay
- **Background Image**: Si hay `image_url`, se aplica con gradiente oscuro
- **Orden**: Los slides se muestran en el orden de `order_index`
- **Activo/Inactivo**: Solo slides con `is_active = true` se muestran

---

## ⚠️ Notas Importantes

### 1. Campo "Eyebrow" (No Implementado)

El código del frontend (`js/home.js:360`) intenta mostrar un campo `eyebrow`, pero:
- ❌ No existe en la tabla de la BD
- ❌ No existe en el formulario del admin
- ✅ **Solución**: Se puede ignorar o agregar en una futura migración

### 2. Validaciones

- **Título**: Obligatorio
- **Link del Botón**: Si se proporciona, debe ser una URL válida (https://...)
- **Imagen**: Debe proporcionarse URL o archivo (al crear nuevo)
- **Orden**: Debe ser un número entero >= 0

### 3. Subida de Imágenes

- Se usa el endpoint `/api/upload` para subir imágenes
- El archivo se convierte a base64 y se envía al servidor
- La URL resultante se guarda en `image_url`

### 4. Estados Vacíos

- Si no hay slides activos, se muestra un estado vacío
- El carrusel se oculta automáticamente
- Los controles (flechas, dots) se ocultan si hay menos de 2 slides

---

## 🐛 Solución de Problemas

### Problema: Los slides no aparecen en el frontend

**Verificar:**
1. ¿Los slides están marcados como `is_active = true`?
2. ¿El endpoint `/api/home-content/all` devuelve datos?
3. ¿Hay errores en la consola del navegador?
4. ¿El carrusel se inicializa correctamente?

### Problema: No puedo crear/editar slides en el admin

**Verificar:**
1. ¿Estás autenticado como administrador?
2. ¿El token JWT es válido?
3. ¿Hay errores en la consola del navegador?
4. ¿El endpoint del backend está respondiendo?

### Problema: La imagen no se sube

**Verificar:**
1. ¿El endpoint `/api/upload` está funcionando?
2. ¿El archivo es una imagen válida?
3. ¿El tamaño del archivo no excede el límite?
4. ¿Hay errores en la consola del navegador?

---

## 🚀 Mejoras Futuras Sugeridas

1. **Campo "Eyebrow"**: Agregar campo opcional para texto pequeño sobre el título
2. **Animaciones personalizadas**: Permitir elegir tipo de transición
3. **Vista previa en tiempo real**: Mostrar cómo se verá el slide antes de guardar
4. **Arrastrar y soltar**: Reordenar slides arrastrándolos
5. **Duplicar slide**: Botón para duplicar un slide existente
6. **Fechas de validez**: Permitir programar slides para fechas específicas

---

## 📝 Ejemplo de Uso Completo

### Crear un Slide Promocional

1. **Título**: "Ofertas de Verano 2024"
2. **Descripción**: "Hasta 50% de descuento en productos seleccionados"
3. **Texto del Botón**: "Ver Ofertas"
4. **Link del Botón**: "products.html?on_sale=true"
5. **Imagen**: Subir imagen promocional de verano
6. **Color de Fondo**: #FF6B6B (rojo coral)
7. **Orden**: 0 (primero)
8. **Activo**: ✅ Marcado

**Resultado**: El slide aparecerá primero en el carrusel con la imagen y el botón que redirige a productos en oferta.

---

## ✅ Checklist de Funcionalidad

- [x] Crear slide desde admin
- [x] Editar slide existente
- [x] Eliminar slide
- [x] Subir imagen
- [x] Usar URL de imagen
- [x] Ordenar slides
- [x] Activar/desactivar slides
- [x] Mostrar slides en frontend
- [x] Carrusel funcional con navegación
- [x] Estados vacíos cuando no hay slides
- [x] Validación de formularios
- [x] Preview de imágenes
- [ ] Campo "eyebrow" (opcional, no crítico)

---

## 🎉 Conclusión

**El sistema de Hero Slides está COMPLETO y FUNCIONAL.** Puedes usarlo inmediatamente para gestionar el carrusel principal de la página de inicio desde el panel de administración.

