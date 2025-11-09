// 🧩 Componentes Reutilizables
// Versión: 2.0 - Sin botón Inicio (eliminado 2024-11-04)
class Components {
  static getFooter() {
    return `
      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-column">
              <h3>Sobre FutureLabs</h3>
              <ul>
                <li><a href="about.html">Quiénes somos</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="contact.html">Trabaja con nosotros</a></li>
                <li><a href="contact.html">Sala de prensa</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h3>Servicio al Cliente</h3>
              <ul>
                <li><a href="contact.html">Contacto</a></li>
                <li><a href="faq.html">Preguntas Frecuentes</a></li>
                <li><a href="orders.html">Estado de mi pedido</a></li>
                <li><a href="products.html">Guías de compra</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h3>Políticas</h3>
              <ul>
                <li><a href="terms.html">Términos y Condiciones</a></li>
                <li><a href="privacy.html">Políticas de Privacidad</a></li>
                <li><a href="warranty.html">Garantías</a></li>
                <li><a href="returns.html">Devoluciones</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h3>Mi Cuenta</h3>
              <ul>
                <li><a href="profile.html">Mi Perfil</a></li>
                <li><a href="orders.html">Mis Pedidos</a></li>
                <li><a href="wishlist.html">Mi Wishlist</a></li>
                <li><a href="cart.html">Mi Carrito</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="payment-section">
              <p>Métodos de pago seguros</p>
              <div class="payment-methods">
                <div class="payment-method">Visa</div>
                <div class="payment-method">MasterCard</div>
                <div class="payment-method">Amex</div>
                <div class="payment-method">PagoEfectivo</div>
                <div class="payment-method">Yape</div>
                <div class="payment-method">Plin</div>
              </div>
            </div>
            <div class="social-section">
              <p>Síguenos</p>
              <div class="social-icons">
                <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook"></i></a>
                <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://twitter.com" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="https://youtube.com" target="_blank"><i class="fab fa-youtube"></i></a>
                <a href="https://tiktok.com" target="_blank"><i class="fab fa-tiktok"></i></a>
              </div>
            </div>
          </div>
          <div class="copyright">
            <p>&copy; ${new Date().getFullYear()} FutureLabs. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    `;
  }

  static getHeader(showSearch = true, showNav = true) {
    const searchBar = showSearch ? `
            <div class="search-bar">
              <input type="text" placeholder="Busca en FutureLabs.com" id="searchInput">
              <button class="search-btn" onclick="performSearch()"><i class="fas fa-search"></i></button>
              <div id="searchSuggestions" class="search-suggestions" style="display: none;"></div>
            </div>
    ` : '';
    
    const navBar = showNav ? `
          <nav class="nav-bar">
            <a href="products.html" class="all-categories"><i class="fas fa-bars"></i> Todas las categorías</a>
            <a href="products.html?filter=on-sale"><i class="fas fa-fire"></i> Ofertas Flash</a>
            <a href="products.html?filter=featured"><i class="fas fa-rocket"></i> Lanzamientos</a>
            <a href="products.html?category=laptops"><i class="fas fa-microchip"></i> Laptops & PC</a>
            <a href="products.html?category=smart-home"><i class="fas fa-home"></i> Smart Home</a>
            <a href="products.html?category=gaming"><i class="fas fa-gamepad"></i> Gaming</a>
            <a href="products.html?filter=promo"><i class="fas fa-tag"></i> Promos y Cupones</a>
            <a href="financing.html"><i class="fas fa-university"></i> Financiamiento</a>
          </nav>
    ` : '';
    
    return `
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="top-bar ${!showSearch && !showNav ? 'header-simple' : ''}">
            <div class="logo" onclick="window.location.href='index.html'">
              <i class="fas fa-rocket"></i>
              FutureLabs
            </div>
            ${searchBar}
            <div class="user-actions">
              <a href="#" class="affiliate-link" style="background: rgb(255, 255, 255) !important; background-color: rgb(255, 255, 255) !important; color: rgb(55, 65, 81) !important; border: 1px solid rgb(229, 231, 235) !important; opacity: 1 !important; visibility: visible !important; display: flex !important; padding: 10px 20px !important; border-radius: 8px !important; font-weight: 600 !important; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;"><i class="fas fa-store"></i> Conviértete en Afiliado</a>
              <a href="#" class="account-link" id="accountLink" style="background: rgb(255, 255, 255) !important; background-color: rgb(255, 255, 255) !important; color: rgb(55, 65, 81) !important; border: 1px solid rgb(229, 231, 235) !important; opacity: 1 !important; visibility: visible !important; display: flex !important; padding: 10px 20px !important; border-radius: 8px !important; font-weight: 600 !important; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;"><i class="fas fa-user"></i> <span id="accountText">Cuenta</span></a>
              <a href="compare.html" class="cart-icon" id="comparatorLink" style="position: relative;">
                <i class="fas fa-balance-scale"></i>
                <span class="cart-count" id="comparator-count" style="display: none;">0</span>
              </a>
              <a href="#" class="cart-icon" onclick="window.location.href='cart.html'">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
              </a>
            </div>
          </div>
          ${navBar}
        </div>
      </header>
    `;
  }

  static initHeader() {
    console.log('🔵 [COMPONENTS] initHeader() ejecutado');
    
    // FORZAR VISIBILIDAD DE TODOS LOS BOTONES DEL HEADER
    function forceAllHeaderButtons() {
      console.log('🔵 [COMPONENTS] forceAllHeaderButtons() ejecutado');
      
      // Lista de todos los botones que necesitan fix (sin home-link que fue eliminado)
      const buttonsToFix = [
        'a.affiliate-link',
        '.affiliate-link',
        'a.account-link',
        '.account-link',
        'a.admin-link',
        '.admin-link'
      ];
      
      buttonsToFix.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
          if (button) {
            console.log(`🔵 [COMPONENTS] Aplicando fix a: ${selector}`, button);
            
            // Eliminar estilos primero
            button.removeAttribute('style');
            
            // Aplicar estilos críticos
            button.style.setProperty('background', 'rgb(255, 255, 255)', 'important');
            button.style.setProperty('background-color', 'rgb(255, 255, 255)', 'important');
            button.style.setProperty('color', 'rgb(55, 65, 81)', 'important');
            button.style.setProperty('opacity', '1', 'important');
            button.style.setProperty('visibility', 'visible', 'important');
            button.style.setProperty('display', 'flex', 'important');
            button.style.setProperty('position', 'relative', 'important');
            button.style.setProperty('z-index', '1000', 'important');
            button.style.setProperty('pointer-events', 'auto', 'important');
            
            // Iconos dentro del botón
            const icons = button.querySelectorAll('i');
            icons.forEach(icon => {
              icon.style.setProperty('color', 'rgb(55, 65, 81)', 'important');
              icon.style.setProperty('opacity', '1', 'important');
              icon.style.setProperty('visibility', 'visible', 'important');
            });
            
            // Remover clases problemáticas
            button.classList.remove('btn-ghost', 'btn-outline');
          }
        });
      });
    }
    
    // Ejecutar para TODOS los botones
    forceAllHeaderButtons();
    
    // Ejecutar inmediatamente y varias veces para asegurar que se apliquen los estilos
    setTimeout(() => { forceAllHeaderButtons(); }, 0);
    setTimeout(() => { forceAllHeaderButtons(); }, 50);
    setTimeout(() => { forceAllHeaderButtons(); }, 100);
    setTimeout(() => { forceAllHeaderButtons(); }, 300);
    setTimeout(() => { forceAllHeaderButtons(); }, 500);
    
    // Manejar botón de cuenta
    const accountLink = document.getElementById('accountLink');
    const accountText = document.getElementById('accountText');
    
    if (accountLink && accountText) {
      // Función para habilitar el botón
      const enableButton = () => {
        accountLink.style.pointerEvents = 'auto';
        accountLink.style.opacity = '1';
      };
      
      // Función para deshabilitar el botón
      const disableButton = () => {
        accountLink.style.pointerEvents = 'none';
        accountLink.style.opacity = '0.5';
      };
      
      // Deshabilitar el botón mientras está inicializando
      disableButton();
      
      // Verificar periódicamente si la inicialización se completó
      const checkInitialization = setInterval(() => {
        if (window.authManager && !window.authManager.isInitializing) {
          clearInterval(checkInitialization);
          enableButton();
          console.log('✅ Botón "Cuenta" habilitado');
        }
      }, 100);
      
      accountLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Verificar si está inicializando
        if (window.authManager && window.authManager.isInitializing) {
          console.log('⏳ AuthManager está inicializando, esperando...');
          return;
        }
        
        if (window.authManager && window.authManager.isAuthenticated()) {
          window.location.href = 'profile.html';
        } else {
          if (window.modalManager) {
            window.modalManager.showLogin();
          }
        }
      });
      
      // Actualizar texto del botón si está autenticado
      if (window.authManager && window.authManager.isAuthenticated()) {
        accountText.textContent = 'Mi Cuenta';
      }
      
      // Escuchar cambios en el estado de autenticación
      document.addEventListener('authStateChanged', async () => {
        if (window.authManager && window.authManager.isAuthenticated()) {
          accountText.textContent = 'Mi Cuenta';
          
          // Verificar si es admin y mostrar botón de admin
          try {
            const user = await window.authManager.getCurrentUser();
            if (user && (user.role === 'admin' || user.role === 'moderator')) {
              this.showAdminButton();
            } else {
              this.hideAdminButton();
            }
          } catch (error) {
            console.error('Error checking user role:', error);
          }
        } else {
          accountText.textContent = 'Cuenta';
          this.hideAdminButton();
        }
      });
      
      // Verificar si ya hay usuario admin al inicializar
      setTimeout(async () => {
        await this.checkAndShowAdminButton();
      }, 500);
    }
  }

  static async showAdminButton() {
    // Verificar si el botón ya existe
    if (document.getElementById('adminButton')) {
      return;
    }
    
    const userActions = document.querySelector('.user-actions');
    if (!userActions) return;
    
    // Crear botón de admin
    const adminButton = document.createElement('a');
    adminButton.href = 'admin.html';
    adminButton.className = 'admin-link';
    adminButton.id = 'adminButton';
    adminButton.innerHTML = '<i class="fas fa-cog"></i> Admin';
    adminButton.style.cssText = 'color: #667eea; font-weight: 600;';
    
    // Insertar antes del botón de cuenta
    const accountLink = document.getElementById('accountLink');
    if (accountLink && accountLink.parentNode) {
      userActions.insertBefore(adminButton, accountLink);
    }
  }
  
  static hideAdminButton() {
    const adminButton = document.getElementById('adminButton');
    if (adminButton) {
      adminButton.remove();
    }
  }
  
  static async checkAndShowAdminButton() {
    try {
      if (window.authManager && window.authManager.isAuthenticated()) {
        const user = await window.authManager.getCurrentUser();
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
          this.showAdminButton();
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  static initSearch() {
    this.ensureAutocompleteAssets();
  }

  static ensureAutocompleteAssets() {
    if (typeof document === 'undefined') return;

    if (!document.querySelector('link[data-autocomplete-style]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/autocomplete.css?v=1.0';
      link.setAttribute('data-autocomplete-style', 'true');
      document.head.appendChild(link);
    }

    const initialize = () => {
      if (window.searchAutocomplete && typeof window.searchAutocomplete.init === 'function') {
        window.searchAutocomplete.init();
      } else if (typeof window.initializeAutocomplete === 'function') {
        window.initializeAutocomplete();
      }
    };

    if (window.searchAutocomplete || typeof window.initializeAutocomplete === 'function') {
      initialize();
      return;
    }

    if (!document.querySelector('script[data-autocomplete-script]')) {
      const script = document.createElement('script');
      script.src = 'js/autocomplete.js';
      script.defer = true;
      script.setAttribute('data-autocomplete-script', 'true');
      script.onload = () => initialize();
      document.body.appendChild(script);
    }
  }
  
  static initCartCounter() {
    // Actualizar contador de carrito
    document.addEventListener('cartUpdated', (e) => {
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        cartCount.textContent = e.detail.count;
      }
    });
  }
}

// Función de búsqueda global
function performSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const query = searchInput.value.trim();
  if (!query) return;

  if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
    window.searchAutocomplete.executeSearch(query);
  } else if (typeof window.initializeAutocomplete === 'function') {
    window.initializeAutocomplete();
    if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
      window.searchAutocomplete.executeSearch(query);
    } else {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  } else {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }
}

// Función de búsqueda con query específica
function performSearchWithQuery(query) {
  if (!query) return;

  if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
    window.searchAutocomplete.executeSearch(query);
  } else if (typeof window.initializeAutocomplete === 'function') {
    window.initializeAutocomplete();
    if (window.searchAutocomplete && typeof window.searchAutocomplete.executeSearch === 'function') {
      window.searchAutocomplete.executeSearch(query);
    } else {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  } else {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  }
}

// Hacer disponible globalmente
window.Components = Components;


