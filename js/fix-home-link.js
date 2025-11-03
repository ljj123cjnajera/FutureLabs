// Script para forzar visibilidad del botón Inicio
(function() {
  'use strict';
  
  function forceHomeLinkVisibility() {
    // Múltiples selectores para encontrar el botón
    const homeLinks = document.querySelectorAll('a.home-link, .home-link, [href="index.html"].home-link, a[href="index.html"], .user-actions a[href="index.html"], .top-bar.header-simple a[href="index.html"]');
    
    console.log('🔍 [FIX-HOME-LINK] Buscando botones Inicio...', homeLinks.length, 'encontrados');
    
    if (homeLinks.length === 0) {
      console.warn('⚠️ [FIX-HOME-LINK] No se encontró ningún botón Inicio. Buscando alternativas...');
      // Buscar cualquier enlace que contenga "Inicio" como texto
      const allLinks = document.querySelectorAll('.user-actions a, .top-bar a');
      allLinks.forEach(link => {
        if (link.textContent.includes('Inicio') || link.querySelector('i.fa-home')) {
          console.log('✅ [FIX-HOME-LINK] Encontrado botón Inicio alternativo:', link);
          homeLinks.push(link);
        }
      });
    }
    
    homeLinks.forEach(function(homeLink, index) {
      if (homeLink) {
        console.log(`✅ Aplicando estilos al botón Inicio #${index + 1}:`, homeLink);
        
        // Verificar estilos actuales ANTES de aplicar
        const currentBg = window.getComputedStyle(homeLink).backgroundColor;
        const currentColor = window.getComputedStyle(homeLink).color;
        const currentOpacity = window.getComputedStyle(homeLink).opacity;
        console.log(`   Estilos ANTES: bg=${currentBg}, color=${currentColor}, opacity=${currentOpacity}`);
        
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
        
        // Verificar estilos DESPUÉS de aplicar
        setTimeout(() => {
          const newBg = window.getComputedStyle(homeLink).backgroundColor;
          const newColor = window.getComputedStyle(homeLink).color;
          const newOpacity = window.getComputedStyle(homeLink).opacity;
          console.log(`   Estilos DESPUÉS: bg=${newBg}, color=${newColor}, opacity=${newOpacity}`);
        }, 50);
      }
    });
    
    // Remover cualquier pseudo-elemento (solo una vez)
    if (!document.getElementById('home-link-fix-style')) {
      const style = document.createElement('style');
      style.id = 'home-link-fix-style';
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
  }
  
  // Ejecutar cuando el DOM esté listo
  console.log('🚀 [FIX-HOME-LINK] Script cargado. Estado del DOM:', document.readyState);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('✅ [FIX-HOME-LINK] DOMContentLoaded - ejecutando fix');
      forceHomeLinkVisibility();
    });
  } else {
    console.log('✅ [FIX-HOME-LINK] DOM ya listo - ejecutando fix inmediatamente');
    forceHomeLinkVisibility();
  }
  
  // Ejecutar después de un delay para asegurar que se ejecute después del render
  setTimeout(() => {
    console.log('⏰ [FIX-HOME-LINK] Ejecutando fix después de 100ms');
    forceHomeLinkVisibility();
  }, 100);
  
  setTimeout(() => {
    console.log('⏰ [FIX-HOME-LINK] Ejecutando fix después de 300ms');
    forceHomeLinkVisibility();
  }, 300);
  
  setTimeout(() => {
    console.log('⏰ [FIX-HOME-LINK] Ejecutando fix después de 500ms');
    forceHomeLinkVisibility();
  }, 500);
  
  setTimeout(() => {
    console.log('⏰ [FIX-HOME-LINK] Ejecutando fix después de 1000ms');
    forceHomeLinkVisibility();
  }, 1000);
  
  setTimeout(() => {
    console.log('⏰ [FIX-HOME-LINK] Ejecutando fix después de 2000ms (último intento)');
    forceHomeLinkVisibility();
  }, 2000);
  
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

