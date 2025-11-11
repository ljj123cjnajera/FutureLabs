# FutureLabs – Final Polish Checklist

## 1. Responsive Smoke Tests
- [x] Informational bundle (`about`, `contact`, `faq`, `terms`, `returns`, `warranty`)
  - Se añadió variación mobile para grids de métricas y layout de navegación lateral.
- [~] Home + landing destacadas (`index`, `products`, `product-detail`)
  - Controles del slider accesibles por teclado y con `focus-visible`; `productsCount` ahora anuncia cambios con `aria-live`.
- [ ] Funnel (`cart`, `checkout`, `orders`)
- [ ] Cuenta (`profile`, `wishlist`, `blog`, `compare`)

## 2. Accesibilidad Básica
- [x] Estados `focus-visible` heredados + verificación CTA en páginas informativas.
- [ ] Revisión de contraste en botones secundarios / outline en cards interactivas.
- [ ] Declarar `aria-live` / `aria-expanded` en componentes dinámicos (autocomplete, FAQ, comparator) donde aplique.

## 3. Documentación & Comunicación
- [x] Checklist creado.
- [ ] Resumen final de hallazgos + recomendaciones de QA cross-device.

## Próximos Pasos
1. Completar smoke tests mobile/tablet/desktop en las vistas pendientes y documentar hallazgos.
2. Ajustar contrastes y mejorar semántica ARIA en componentes interactivos clave.
3. Preparar informe final para desplegar (incluye lista de pruebas manuales realizadas y pendientes).
