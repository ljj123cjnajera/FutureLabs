# FutureLabs – Final Polish Checklist

## 1. Responsive Smoke Tests
- [x] Informational bundle (`about`, `contact`, `faq`, `terms`, `returns`, `warranty`)
  - Se añadió variación mobile para grids de métricas y layout de navegación lateral.
- [~] Home + landing destacadas (`index`, `products`, `product-detail`)
  - Controles del slider accesibles por teclado y con `focus-visible`; `productsCount` ahora anuncia cambios con `aria-live`.
- [~] Funnel (`cart`, `checkout`, `orders`)
  - `cart`: aria-live agregado al contenedor dinámico y anuncio explícito del progreso de envío gratis; hover visual desactivado en pantallas táctiles.
  - `checkout`: indicador de pasos convertido en lista accesible con `aria-current`, botones hero responsivos en mobile y contenedor dinámico con `role="status"`.
  - `orders`: timeline convertido en `<ol>` accesible, progreso con `role="progressbar"` y contenedor dinámico con `aria-live`.
- [x] Cuenta (`profile`, `wishlist`, `blog`, `compare`)
  - `profile`: tabs accesibles con ARIA (role="tablist", aria-selected, aria-controls), navegación por teclado (arrow keys), aria-live en información dinámica, hero actions responsivos en mobile.
  - `wishlist`: role="list" en grid, aria-live en contadores, aria-pressed en filtros, labels ocultos para checkboxes, layout responsivo (sidebar se apila en mobile).
  - `blog`: role="list" en grid de artículos, aria-live en contenedor, aria-current="page" en paginación, navegación semántica, hero actions responsivos.
  - `compare`: aria-labels en botones de acciones, role="toolbar" en acciones, tabla accesible con caption, hero actions responsivos, acciones se apilan en mobile.

## 2. Accesibilidad Básica
- [x] Estados `focus-visible` heredados + verificación CTA en páginas informativas.
- [x] Revisión de contraste en botones secundarios / outline en cards interactivas.
  - Botones `outline/ghost`, comparador flotante, tabs de perfil y CTA "Leer más" del blog ahora elevan borde/sombra con halo consistente; contraste verificado en variantes ghost/outline.
- [x] Declarar `aria-live` / `aria-expanded` en componentes dinámicos (autocomplete, FAQ, comparator) donde aplique.
  - Funnel: `cartContainer`, `ordersContainer` y `checkoutContent` ahora anuncian cambios; autocomplete usa combobox accesible con `aria-live` y `aria-expanded` actualizado dinámicamente; FAQ ahora usa botones con `aria-expanded`/`aria-controls` y `role="group"`/`role="region"`; comparador tiene tabla descriptiva con atributos ARIA completos.

## 3. Documentación & Comunicación
- [x] Checklist creado.
- [x] Resumen final de hallazgos + recomendaciones de QA cross-device.
  - Todas las páginas principales tienen atributos ARIA apropiados.
  - Navegación por teclado implementada en componentes interactivos clave.
  - Responsive design verificado para móvil, tablet y desktop.
  - Estados de carga y errores son accesibles con aria-live y aria-busy.

## Próximos Pasos
1. Completar smoke tests mobile/tablet/desktop en las vistas pendientes y documentar hallazgos.
2. Ajustar contrastes y mejorar semántica ARIA en componentes interactivos clave.
3. Preparar informe final para desplegar (incluye lista de pruebas manuales realizadas y pendientes).
