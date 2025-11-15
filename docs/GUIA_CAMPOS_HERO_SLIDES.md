# 📝 Guía: Qué Poner en Cada Campo del Hero Slide

## 🎯 Campos del Formulario y Qué Significan

### 1. **Título** * (Obligatorio)
**Qué es:** El título principal que aparece en el slide, en grande y destacado.

**Ejemplos:**
- "Nuevos Smartphones 2024"
- "Ofertas de Verano"
- "Tecnología de Vanguardia"
- "Bienvenido a FutureLabs"

**Dónde se muestra:** En la parte superior del slide, como un `<h1>` grande.

---

### 2. **Descripción** (Opcional)
**Qué es:** Texto descriptivo que aparece debajo del título, más pequeño.

**Ejemplos:**
- "Descubre la última tecnología en smartphones con las mejores ofertas"
- "Hasta 50% de descuento en productos seleccionados"
- "Innovación y calidad en cada producto"

**Dónde se muestra:** Debajo del título, como un párrafo descriptivo.

---

### 3. **Texto del Botón** (Opcional)
**Qué es:** El texto que aparece dentro del botón de acción (CTA - Call to Action).

**Ejemplos:**
- "Ver Productos"
- "Explorar Ofertas"
- "Comprar Ahora"
- "Saber Más"
- "Ver Catálogo"

**Dónde se muestra:** Dentro de un botón grande y destacado en el slide.

**Nota:** Si no pones texto, el botón NO aparecerá en el slide.

---

### 4. **Link del Botón** (Opcional)
**Qué es:** La URL a donde redirige cuando el usuario hace clic en el botón.

**Ejemplos:**
- `products.html` - Ir a la página de productos
- `products.html?category=celulares` - Ir a productos de celulares
- `products.html?on_sale=true` - Ir a productos en oferta
- `about.html` - Ir a la página "Acerca de"
- `https://example.com/promocion` - URL externa

**Formato:**
- Puede ser una ruta relativa: `products.html`
- Puede incluir parámetros: `products.html?category=smartphones`
- Puede ser una URL completa: `https://www.ejemplo.com`

**Dónde se usa:** Cuando el usuario hace clic en el botón, lo redirige a esta URL.

**Nota:** Si pones "Texto del Botón" pero NO pones "Link del Botón", el botón aparecerá pero no hará nada al hacer clic.

---

### 5. **URL de Imagen** (Opcional)
**Qué es:** La URL completa de la imagen que quieres usar como fondo del slide.

**Ejemplos:**
- `https://example.com/images/hero-smartphone.jpg`
- `https://cdn.example.com/banners/verano-2024.jpg`
- `assets/images/hero-slides/promocion.jpg` (si está en tu servidor)

**Formato:**
- URL completa: `https://ejemplo.com/imagen.jpg`
- Ruta relativa: `assets/images/hero-slides/imagen.jpg`

**Dónde se muestra:** Como imagen de fondo del slide, con un overlay oscuro para que el texto sea legible.

**Alternativa:** También puedes usar el campo "Subir Imagen" para subir un archivo directamente.

**Nota:** Si no pones imagen, el slide usará solo el color de fondo.

---

### 6. **Color de Fondo** (Opcional)
**Qué es:** El color de fondo del slide en formato hexadecimal.

**Valor por defecto:** `#667eea` (morado/azul)

**Ejemplos:**
- `#667eea` - Morado/azul (por defecto)
- `#FF6B6B` - Rojo coral
- `#4ECDC4` - Turquesa
- `#45B7D1` - Azul claro
- `#FFA07A` - Salmón
- `#98D8C8` - Verde menta

**Dónde se muestra:** Como color de fondo del slide. Si hay imagen, el color se usa como overlay.

**Cómo elegir un color:**
1. Puedes usar un selector de color online: https://htmlcolorcodes.com/
2. O usar herramientas como: https://coolors.co/
3. El campo tiene un selector de color visual (color picker)

---

### 7. **Orden** (Opcional)
**Qué es:** Un número que determina en qué orden aparecen los slides en el carrusel.

**Valor por defecto:** `0`

**Cómo funciona:**
- Los slides se ordenan de menor a mayor (0, 1, 2, 3...)
- El slide con orden `0` aparece primero
- El slide con orden `1` aparece segundo
- Y así sucesivamente

**Ejemplos:**
- Slide 1: Orden = `0` (aparece primero)
- Slide 2: Orden = `1` (aparece segundo)
- Slide 3: Orden = `2` (aparece tercero)

**Dónde se usa:** Para controlar el orden de los slides en el carrusel.

---

### 8. **Activo** (Checkbox)
**Qué es:** Si está marcado, el slide se muestra en la página principal. Si no está marcado, el slide está oculto.

**Valor por defecto:** ✅ Marcado (activo)

**Cuándo desmarcarlo:**
- Cuando quieres ocultar temporalmente un slide sin eliminarlo
- Para desactivar promociones que ya expiraron
- Para probar diferentes slides sin que todos se muestren

**Dónde se usa:** Solo los slides activos aparecen en `index.html`.

---

## 🎨 Ejemplos Completos

### Ejemplo 1: Slide Promocional de Verano

```
Título: "Ofertas de Verano 2024"
Descripción: "Hasta 50% de descuento en productos seleccionados"
Texto del Botón: "Ver Ofertas"
Link del Botón: "products.html?on_sale=true"
URL de Imagen: "https://example.com/images/verano-2024.jpg"
Color de Fondo: #FF6B6B
Orden: 0
Activo: ✅
```

**Resultado:** Un slide rojo coral con imagen de verano, que dice "Ofertas de Verano 2024" y tiene un botón "Ver Ofertas" que lleva a productos en oferta.

---

### Ejemplo 2: Slide de Categoría Específica

```
Título: "Nuevos Smartphones"
Descripción: "Descubre la última tecnología en smartphones"
Texto del Botón: "Explorar Smartphones"
Link del Botón: "products.html?category=celulares"
URL de Imagen: "https://example.com/images/smartphones-hero.jpg"
Color de Fondo: #667eea
Orden: 1
Activo: ✅
```

**Resultado:** Un slide morado con imagen de smartphones, que tiene un botón que lleva directamente a la categoría de celulares.

---

### Ejemplo 3: Slide Simple sin Botón

```
Título: "Bienvenido a FutureLabs"
Descripción: "Tu tienda de tecnología de confianza"
Texto del Botón: (vacío)
Link del Botón: (vacío)
URL de Imagen: "https://example.com/images/welcome.jpg"
Color de Fondo: #4ECDC4
Orden: 2
Activo: ✅
```

**Resultado:** Un slide turquesa con imagen de bienvenida, solo con título y descripción, sin botón.

---

## ⚠️ Notas Importantes

1. **Título es obligatorio:** No puedes crear un slide sin título.

2. **Botón requiere ambos campos:** Si quieres un botón funcional, necesitas poner tanto "Texto del Botón" como "Link del Botón".

3. **Imagen o Color:** Si no pones imagen, el slide usará solo el color de fondo. Si pones imagen, se mostrará con un overlay oscuro para legibilidad.

4. **Orden:** Puedes cambiar el orden en cualquier momento editando el slide.

5. **Activo/Inactivo:** Puedes desactivar slides sin eliminarlos, útil para promociones temporales.

---

## 🚀 Consejos

- **Usa imágenes de alta calidad:** Las imágenes se muestran grandes, así que usa imágenes de al menos 1920x1080px.
- **Mantén el texto corto:** El título y descripción deben ser concisos y claros.
- **Botones claros:** El texto del botón debe indicar claramente qué pasará al hacer clic.
- **Orden lógico:** Organiza los slides por importancia o temporada.
- **Prueba en móvil:** Asegúrate de que el texto sea legible en pantallas pequeñas.

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar imágenes de Internet?**
R: Sí, puedes usar cualquier URL de imagen pública. Asegúrate de que la imagen sea accesible y no requiera autenticación.

**P: ¿Qué pasa si no pongo "Link del Botón" pero sí pongo "Texto del Botón"?**
R: El botón aparecerá pero no hará nada al hacer clic. Es mejor dejar ambos campos vacíos si no quieres botón.

**P: ¿Puedo cambiar el orden después de crear los slides?**
R: Sí, puedes editar cualquier slide y cambiar su "Orden" en cualquier momento.

**P: ¿Cuántos slides puedo tener?**
R: No hay límite, pero se recomienda tener entre 3-5 slides para una mejor experiencia de usuario.

**P: ¿Los slides se muestran automáticamente?**
R: Sí, el carrusel cambia automáticamente cada 5 segundos, pero los usuarios también pueden navegar manualmente.

---

## 📚 Recursos Adicionales

- [Guía Completa del Sistema de Hero Slides](./GUIA_HERO_SLIDES.md)
- [Documentación de la API](../backend/routes/home-content.js)
- [Código de Renderizado](../js/home.js#L322)

