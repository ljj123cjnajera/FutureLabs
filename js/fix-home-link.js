// Script para forzar visibilidad del botón Inicio
(function() {
  'use strict';
  
  function forceHomeLinkVisibility() {
    const homeLinks = document.querySelectorAll('a.home-link, .home-link, [href="index.html"].home-link');
    
    homeLinks.forEach(function(homeLink) {
      if (homeLink) {
        // Aplicar estilos inline con máxima prioridad
        homeLink.style.setProperty('background', '#ffffff', 'important');
        homeLink.style.setProperty('background-color', '#ffffff', 'important');
        homeLink.style.setProperty('color', '#374151', 'important');
        homeLink.style.setProperty('border', '1px solid #e5e7eb', 'important');
        homeLink.style.setProperty('opacity', '1', 'important');
        homeLink.style.setProperty('visibility', 'visible', 'important');
        homeLink.style.setProperty('display', 'flex', 'important');
        homeLink.style.setProperty('padding', '10px 20px', 'important');
        homeLink.style.setProperty('border-radius', '8px', 'important');
        homeLink.style.setProperty('font-weight', '600', 'important');
        homeLink.style.setProperty('box-shadow', '0 1px 3px rgba(0,0,0,0.1)', 'important');
        homeLink.style.setProperty('position', 'relative', 'important');
        homeLink.style.setProperty('z-index', '10', 'important');
        homeLink.style.setProperty('filter', 'none', 'important');
        homeLink.style.setProperty('backdrop-filter', 'none', 'important');
        
        // Forzar icono dentro
        const icon = homeLink.querySelector('i');
        if (icon) {
          icon.style.setProperty('color', '#374151', 'important');
          icon.style.setProperty('opacity', '1', 'important');
          icon.style.setProperty('visibility', 'visible', 'important');
        }
        
        // Remover cualquier pseudo-elemento
        const style = document.createElement('style');
        style.textContent = `
          a.home-link::before,
          a.home-link::after,
          .home-link::before,
          .home-link::after {
            display: none !important;
            content: none !important;
            background: none !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }
    });
  }
  
  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceHomeLinkVisibility);
  } else {
    forceHomeLinkVisibility();
  }
  
  // Ejecutar después de un delay para asegurar que se ejecute después del render
  setTimeout(forceHomeLinkVisibility, 100);
  setTimeout(forceHomeLinkVisibility, 500);
  setTimeout(forceHomeLinkVisibility, 1000);
  
  // Observar cambios en el DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        forceHomeLinkVisibility();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

