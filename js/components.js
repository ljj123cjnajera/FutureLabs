// 🧩 Componentes Reutilizables
// Versión: 2.1 - Includes Global Auth Guard


class Components {
  static updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        // Optional: Hide badge if 0
        if (count === 0 && el.classList.contains('action-badge')) {
          // el.style.display = 'none'; // Maybe? User might prefer seeing '0'
        } else {
          el.style.display = 'flex';
        }
      });
    } catch (e) {
      if (window.Logger) window.Logger.warn('Components: Could not update cart count', e);
    }
  }

  static getFooter() {
    return `
        <div class="container">
            <div class="footer-grid">
                <!-- Brand / Bio -->
                <div class="footer-col footer-brand">
                    <div class="footer-logo">SNEAKERS SHOP</div>
                    <p class="footer-bio">
                        El destino definitivo para los mejores sneakers. Selección exclusiva de Nike, Jordan, Yeezy y más. 
                        <br><br>
                        EST. 2024 — PERÚ
                    </p>
                    <div class="social-links">
                        <a href="https://instagram.com" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="https://tiktok.com" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                        <a href="https://twitter.com" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="https://youtube.com" target="_blank" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>

                <!-- Links 1 -->
                <div class="footer-col">
                    <h3>TIENDA</h3>
                    <ul>
                        <li><a href="products.html?filter=new">Nuevos Lanzamientos</a></li>
                        <li><a href="products.html?filter=best">Más Vendidos</a></li>
                        <li><a href="products.html?filter=trending">En Tendencia</a></li>
                        <li><a href="products.html?filter=on-sale">En Oferta</a></li>
                    </ul>
                </div>

                <!-- Links 2 -->
                <div class="footer-col">
                    <h3>SOPORTE</h3>
                    <ul>
                        <li><a href="profile.html?tab=orders">Rastrear Pedido</a></li>
                        <li><a href="faq.html">Preguntas Frecuentes</a></li>
                        <li><a href="returns.html">Devoluciones</a></li>
                        <li><a href="contact.html">Contáctanos</a></li>
                    </ul>
                </div>

                <!-- Newsletter Mejorado -->
                <div class="footer-col footer-newsletter">
                    <h3>🔥 ÚNETE AL CLUB</h3>
                    <p class="newsletter-desc">
                        <strong>10% OFF</strong> en tu primera compra + acceso exclusivo a drops limitados
                    </p>
                    <div class="newsletter-benefits">
                        <span class="benefit-item">✓ Acceso anticipado</span>
                        <span class="benefit-item">✓ Ofertas exclusivas</span>
                        <span class="benefit-item">✓ Notificaciones de restock</span>
                    </div>
                    <div class="input-group">
                        <input type="email" id="jsFooterEmail" name="email" autocomplete="email" placeholder="TU EMAIL AQUÍ">
                        <button onclick="window.homeEngine?.subscribeNewsletter(document.getElementById('jsFooterEmail').value)">→</button>
                    </div>
                    <div class="guarantees-bar">
                        <div class="guarantee-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>100% Auténtico</span>
                        </div>
                        <div class="guarantee-item">
                            <i class="fas fa-truck"></i>
                            <span>Envío Gratis</span>
                        </div>
                        <div class="guarantee-item">
                            <i class="fas fa-undo"></i>
                            <span>30 Días Devolución</span>
                        </div>
                    </div>
                    <div class="payment-methods">
                        <span class="payment-method">VISA</span>
                        <span class="payment-method">MC</span>
                        <span class="payment-method">AMEX</span>
                        <span class="payment-method">YAPE</span>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} SNEAKERS SHOP. TODOS LOS DERECHOS RESERVADOS.</p>
                <div class="footer-meta">
                    <a href="privacy.html">PRIVACIDAD</a>
                    <a href="terms.html">TÉRMINOS</a>
                    <a href="sitemap.xml">MAPA DEL SITIO</a>
                </div>
            </div>
            <!-- SPACER FOR STICKY FOOTER -->
            <div style="height: 150px; width: 100%; display: block; background: transparent;"></div>
        </div>
    `;
  }

  static loadHeader(showSearch = true, showNav = true) {
    const headerElement = document.getElementById('mainHeader');
    if (headerElement) {
      headerElement.innerHTML = this.getHeader(showSearch, showNav);
      this.initLoyaltyBadge();
      this.updateCartCount();
    } else {
      if (window.Logger) window.Logger.warn('Components.loadHeader: #mainHeader element not found');
    }
  }

  static getHeader(showSearch = true, showNav = true) {
    // 1. ANNOUNCEMENT BAR TICKER
    const announcementBar = `
        <div class="announcement-bar">
            <div class="announcement-content" id="announcementText">
                ENVÍO GRATIS EN PEDIDOS MAYORES A S/ 150 ✈️
            </div>
        </div>
    `;

    // 2. MEGA MENU DATA (Ideally this comes from a config, simplistic here for MVP)
    const megaMenuHTML = `
        <div class="mega-menu-dropdown">
            <div class="mega-menu-container">
                <div class="mega-column">
                    <h4>Colecciones</h4>
                    <ul>
                        <li><a href="products.html?filter=new-arrivals">Nuevos Lanzamientos 🔥</a></li>
                        <li><a href="products.html?filter=best-sellers">Más Vendidos</a></li>
                        <li><a href="products.html?collection=limited">Ediciones Limitadas</a></li>
                        <li><a href="products.html?collection=essentials">Esenciales</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <h4>Marcas</h4>
                    <ul>
                        <li><a href="products.html?category=jordan">Air Jordan</a></li>
                        <li><a href="products.html?category=yeezy">Yeezy</a></li>
                        <li><a href="products.html?category=nike">Nike</a></li>
                        <li><a href="products.html?category=adidas">Adidas</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <h4>Categorías</h4>
                    <ul>
                        <li><a href="products.html?type=high-top">High Tops</a></li>
                        <li><a href="products.html?type=low-top">Low Tops</a></li>
                        <li><a href="products.html?type=running">Running</a></li>
                        <li><a href="products.html?type=slides">Slides</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <div class="mega-promo">
                        <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600" alt="Promoción" loading="lazy">
                        <div class="promo-content">
                            <h5>RECIÉN LANZADO</h5>
                            <a href="products.html?filter=new" class="promo-btn">COMPRAR AHORA</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return `
      <header class="header-v3">
        ${announcementBar}
        
        <div class="header-main-row">
            <div class="container" style="display: flex; justify-content: space-between; align-items: center; padding: 0;">
                <!-- LOGO -->
                <!-- LOGO (TEXT ONLY - BRUTALIST V3) -->
                <a href="index.html" class="header-logo" style="text-decoration: none; display: block;">
                    <span style="font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 1.8rem; letter-spacing: -1px; line-height: 1; color: var(--black); text-transform: uppercase;">
                        SNEAKERS<span style="color: var(--accent);">SHOP</span>
                    </span>
                </a>

                <!-- SEARCH (Desktop) -->
                ${showSearch ? `
                <div class="header-search desktop-only">
                    <div class="search-input-wrapper">
                        <input type="text" id="headerSearchInput" name="q" placeholder="BUSCAR PRODUCTOS..." style="cursor: text;" aria-label="Buscar productos">
                        <button class="search-icon-btn" onclick="window.Components.submitSearch()" aria-label="Buscar"><i class="fas fa-search" aria-hidden="true"></i></button>
                    </div>
                </div>
                ` : ''}

                <!-- ACTIONS -->
                <div class="header-actions">
                    <a href="#" onclick="window.handleAuthRedirect(event, 'profile.html?tab=loyalty')" class="action-btn" id="headerLoyaltyBadge" style="display: none; border: 1px solid var(--black); background: var(--black); color: var(--white);">
                        <i class="fas fa-medal"></i>
                        <span class="desktop-only" id="headerLoyaltyPoints">0 PTS</span>
                    </a>
                    <a href="#" onclick="window.handleAuthRedirect(event, 'profile.html')" class="action-btn" aria-label="Mi cuenta">
                        <i class="far fa-user" aria-hidden="true"></i>
                        <span class="desktop-only">CUENTA</span>
                    </a>
                    <button class="action-btn" onclick="window.location.href='profile.html?tab=wishlist'" aria-label="Lista de deseos">
                        <i class="far fa-heart" aria-hidden="true"></i>
                        <span class="action-badge" id="wishlistCount" style="display: none;">0</span>
                        <span class="desktop-only">FAVORITOS</span>
                    </button>
                    <button class="action-btn" onclick="window.CartDrawer ? window.CartDrawer.open() : window.location.href='cart.html'" aria-label="Carrito de compras">
                        <i class="fas fa-shopping-bag" aria-hidden="true"></i>
                        <span class="action-badge cart-count">0</span>
                        <span class="desktop-only">CARRITO</span>
                    </button>
                    <button class="header-mobile-toggle mobile-only" onclick="document.getElementById('mobileMenu').classList.add('active')">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- NAVIGATION -->
        ${showNav ? `
        <nav class="header-nav desktop-only">
            <div class="container" style="padding: 0;">
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="products.html?filter=new" class="nav-link">NUEVOS LANZAMIENTOS</a>
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item"><a href="products.html?category=jordan" class="nav-link">JORDAN</a></li>
                    <li class="nav-item"><a href="products.html?category=yeezy" class="nav-link">YEEZY</a></li>
                    <li class="nav-item"><a href="products.html?category=nike" class="nav-link">NIKE</a></li>
                    <li class="nav-item nav-item-featured"><a href="products.html?filter=sale" class="nav-link nav-link-sale" style="color: var(--accent);">OFERTAS</a></li>
                </ul>
            </nav>
            ` : ''}
            
        <!-- CART DRAWER (New Phase 81 Feature) -->
        <div id="cartDrawerOverlay" class="cart-drawer-overlay" onclick="window.CartDrawer.close()"></div>
        <div id="cartDrawer" class="cart-drawer">
            <div class="cart-drawer-header">
                <h3>TU CARRITO (<span class="cart-count">0</span>)</h3>
                <button class="close-drawer-btn" onclick="window.CartDrawer.close()" aria-label="Cerrar carrito">×</button>
            </div>
            <div class="cart-drawer-items" id="cartDrawerItems">
                <!-- Items injected here -->
                <div class="empty-cart-message">
                    <p>TU CARRITO ESTÁ VACÍO</p>
                    <button class="btn btn-black" onclick="window.CartDrawer.close()">EMPEZAR A COMPRAR</button>
                </div>
            </div>
            <div class="cart-drawer-footer">
                <div class="cart-total-row">
                    <span>TOTAL</span>
                    <span id="cartDrawerTotal">S/ 0.00</span>
                </div>
                <button class="btn btn-black btn-block" onclick="window.location.href='checkout.html'">PAGAR</button>
                <button class="btn btn-outline btn-block" onclick="window.location.href='cart.html'">VER CARRITO</button>
            </div>
        </div>

        <!-- SEARCH OVERLAY (New Phase 81 Feature) -->
        <div id="searchOverlay" class="search-overlay">
            <button class="search-close-btn" onclick="window.SearchOverlay.close()">×</button>
            <div class="search-container-large search-bar">
                <input type="text" id="largeSearchInput" class="search-input-large" placeholder="¿QUÉ ESTÁS BUSCANDO?" autocomplete="off" aria-label="Buscar productos">
                <div class="search-suggestions">
                    <span class="search-tag" onclick="window.SearchOverlay.search('Jordan')">JORDAN</span>
                    <span class="search-tag" onclick="window.SearchOverlay.search('Yeezy')">YEEZY</span>
                    <span class="search-tag" onclick="window.SearchOverlay.search('Dunk')">DUNK</span>
                    <span class="search-tag" onclick="window.SearchOverlay.search('Travis Scott')">TRAVIS SCOTT</span>
                </div>
            </div>
        </div>

        <!-- MOBILE MENU OVERLAY (Improved V3) -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay" onclick="window.MobileMenu.toggle()"></div>
        <div class="mobile-menu-sidebar" id="mobileMenu">
            <div class="mobile-menu-header">
                <h3>MENU</h3>
                <button class="close-menu-btn" onclick="document.getElementById('mobileMenu').classList.remove('active')">×</button>
            </div>
            <div class="mobile-menu-content">
                <div class="mobile-search" onclick="window.SearchOverlay.open()">
                    <input type="text" placeholder="BUSCAR SNEAKERS..." readonly aria-label="Buscar">
                    <button aria-label="Buscar"><i class="fas fa-search" aria-hidden="true"></i></button>
                </div>
                <ul class="mobile-nav-list">
                    <li><a href="products.html?filter=new">🔥 NUEVOS LANZAMIENTOS</a></li>
                    <li><a href="products.html?category=jordan">JORDAN</a></li>
                    <li><a href="products.html?category=yeezy">YEEZY</a></li>
                    <li><a href="products.html?category=nike">NIKE</a></li>
                    <li><a href="products.html?category=adidas">ADIDAS</a></li>
                    <li><a href="products.html?filter=sale" style="color: var(--error);">OFERTAS</a></li>
                </ul>
                <div class="mobile-auth-links">
                    <a href="login.html">INICIAR SESIÓN</a>
                    <a href="register.html">REGISTRARSE</a>
                </div>
            </div>
        </div>
      </header>
    `;
  }

  // Inject Cart Logic
  static initCartDrawer() {
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
    
    if (!cartDrawer || !cartDrawerOverlay) {
      if (window.Logger) window.Logger.warn('⚠️ Cart drawer elements not found. Make sure getHeader() is called first.');
      return;
    }
    
    window.CartDrawer = {
      open: () => {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartDrawerOverlay');
        if (drawer && overlay) {
          drawer.classList.add('active');
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        } else if (window.Logger) {
          window.Logger.warn('⚠️ Cart drawer elements not found when trying to open');
        }
      },
      close: () => {
        const drawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('cartDrawerOverlay');
        if (drawer && overlay) {
          drawer.classList.remove('active');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    };
  }

  static initSearchOverlay() {
    window.SearchOverlay = {
      open: () => {
        const overlay = document.getElementById('searchOverlay');
        const input = document.getElementById('largeSearchInput');
        if (overlay) {
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
          if (input) setTimeout(() => input.focus(), 300);
        }
      },
      close: () => {
        document.getElementById('searchOverlay').classList.remove('active');
        document.body.style.overflow = '';
      },
      search: (term) => {
        window.location.href = `products.html?search=${encodeURIComponent(term)}`;
      }
    };

    // Bind Enter Key
    const input = document.getElementById('largeSearchInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          window.SearchOverlay.search(input.value);
        }
      });
    }
  }

  static initHeader() {
    if (window.headerInitialized) return;
    window.headerInitialized = true;
    if (window.Logger) window.Logger.log('🔵 [COMPONENTS] initHeader() executed');

    // Initialize Cart Drawer (must be done after header HTML is injected)
    this.initCartDrawer();
    
    // Initialize Search Overlay
    this.initSearchOverlay();
    
    // MobileMenu is initialized globally below (line 763), no need to init here

    // Ticker Animation Logic - Mensajes más convincentes
    const messages = [
      "🚚 ENVÍO GRATIS A TODO PERÚ • CÓDIGO: LIMA20 = S/ 20 OFF",
      "🔥 NUEVO DROP JORDAN ESTE VIERNES • STOCK LIMITADO",
      "⚡ ÚNETE AL CLUB Y OBTÉN 10% OFF EN TU PRIMERA COMPRA",
      "💳 ACEPTAMOS YAPE • PAGO SEGURO • 100% AUTÉNTICO"
    ];
    let msgIndex = 0;
    const ticker = document.getElementById('announcementText');
    if (ticker) {
      setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        ticker.style.opacity = 0;
        setTimeout(() => {
          ticker.innerText = messages[msgIndex];
          ticker.style.opacity = 1;
        }, 500);
      }, 4000);
    }

    this.ensureWishlistAssets();
    this.ensureVerificationAssets();
    this.updateCartCount();

    // Check admin status
    setTimeout(async () => {
      await this.checkAndShowAdminButton();
      this.initLoyaltyBadge();
    }, 1000);
  }

  static async showAdminButton() {
    // Verificar si el botón ya existe
    if (document.getElementById('adminButton')) {
      return;
    }

    const userActions = document.querySelector('.header-actions'); // Updated selector for V3
    if (!userActions) return;

    // Crear botón de admin
    const adminButton = document.createElement('a');
    adminButton.href = 'admin.html';
    adminButton.className = 'action-btn';
    adminButton.id = 'adminButton';
    adminButton.innerHTML = '<i class="fas fa-cog"></i> <span>Admin</span>';
    adminButton.style.cssText = 'color: var(--accent); font-weight: 800;';

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
      if (window.Logger) window.Logger.error('Error checking admin status:', error);
    }
  }

  static initSearch() {
    // Init logic for Header Search Input
    const input = document.getElementById('headerSearchInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitSearch();
        }
      });
    }

    // Keep autocomplete loading if needed but ensure our direct search works
    // Solo llamar ensureAutocompleteAssets si no está ya inicializando
    if (!this._autocompleteInitializing) {
      try {
        this.ensureAutocompleteAssets();
      } catch (e) {
        if (window.Logger) window.Logger.error('Error in initSearch ensureAutocompleteAssets:', e);
      }
    }
  }

  static submitSearch() {
    const input = document.getElementById('headerSearchInput');
    const query = input ? input.value.trim() : '';
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  }

  static ensureWishlistAssets() {
    if (typeof document === 'undefined') return;

    const syncIfReady = () => {
      if (window.wishlistManager && typeof window.wishlistManager.syncToggleButtons === 'function') {
        window.wishlistManager.syncToggleButtons(document);
      }
    };

    // 1. Check if logic is already loaded
    if (window.wishlistManager) {
      syncIfReady();
      return;
    }

    // 2. CRITICAL GATE: Only load if there are actual buttons needing it
    // or if we are explicitly on the wishlist page
    const hasWishlistButtons = document.querySelector('.action-btn[onclick*="wishlist"], .product-quick-action[onclick*="wishlist"]');
    const isWishlistPage = window.location.pathname.includes('profile.html') && window.location.search.includes('tab=wishlist');

    if (!hasWishlistButtons && !isWishlistPage && !document.getElementById('wishlistGrid')) {
      // No need to inject script on a page with no wishlist interactions
      return;
    }

    if (document.querySelector('script[data-wishlist-script]')) {
      document.querySelector('script[data-wishlist-script]').addEventListener('load', () => syncIfReady(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'js/wishlist.js';
    script.defer = true;
    script.setAttribute('data-wishlist-script', 'true');
    script.onload = () => syncIfReady();
    document.body.appendChild(script);
  }

  static ensureVerificationAssets() {
    if (typeof document === 'undefined') return;

    // GATE: Only load on auth pages or if explicit container exists
    const verificationContainer = document.getElementById('verificationModal');
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');

    if (!verificationContainer && !isAuthPage) {
      return;
    }

    if (window.verificationManager) {
      return;
    }

    if (document.querySelector('script[data-verification-script]')) {
      document
        .querySelector('script[data-verification-script]')
        .addEventListener('load', () => {
          if (window.Logger) window.Logger.log('🔵 [COMPONENTS] verification assets loaded (existing)');
        }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'js/verification.js';
    script.defer = true;
    script.setAttribute('data-verification-script', 'true');
    document.body.appendChild(script);
  }

  static ensureAutocompleteAssets() {
    if (typeof document === 'undefined') return;
    
    // Prevenir bucle infinito
    if (this._autocompleteInitializing) return;
    this._autocompleteInitializing = true;

    if (!document.querySelector('link[data-autocomplete-style]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/autocomplete.css?v=1.0';
      link.setAttribute('data-autocomplete-style', 'true');
      document.head.appendChild(link);
    }

    const initialize = () => {
      // NO inicializar searchAutocomplete aquí - ya se inicializa automáticamente en autocomplete.js
      // Solo verificar que el script se cargó correctamente
      if (window.searchAutocomplete && window.searchAutocomplete.initialized) {
        // Ya está inicializado, no hacer nada
        if (window.Logger) window.Logger.log('✅ SearchAutocomplete ya está inicializado');
      } else if (window.searchAutocomplete && typeof window.searchAutocomplete.init === 'function' && !window.searchAutocomplete.initialized) {
        // Solo inicializar si no está ya inicializado
        try {
          window.searchAutocomplete.init();
        } catch (e) {
          if (window.Logger) window.Logger.error('Error initializing searchAutocomplete:', e);
        }
      }
      // NO llamar initializeAutocomplete() aquí - causa bucle infinito
      // NO llamar initSearch aquí para evitar bucle infinito
      // initSearch ya se llama desde initHeader
      
      // Solo inicializar overlay y cart counter si no están ya inicializados
      if (!this._overlayInitialized) {
        this.initSearchOverlay();
        this._overlayInitialized = true;
      }
      if (!this._cartCounterInitialized) {
        this.initCartCounter();
        this._cartCounterInitialized = true;
      }
    };

    // NO llamar initialize() si searchAutocomplete ya está inicializado
    // El script autocomplete.js se inicializa automáticamente
    if (window.searchAutocomplete && window.searchAutocomplete.initialized) {
      this._autocompleteInitializing = false;
      return;
    }
    
    if (window.searchAutocomplete && typeof window.searchAutocomplete.init === 'function') {
      // Solo inicializar si no está ya inicializado
      if (!window.searchAutocomplete.initialized) {
        initialize();
      }
      this._autocompleteInitializing = false;
      return;
    }

    if (!document.querySelector('script[data-autocomplete-script]')) {
      const script = document.createElement('script');
      script.src = 'js/autocomplete.js';
      script.defer = true;
      script.setAttribute('data-autocomplete-script', 'true');
      script.onload = () => {
        initialize();
        this._autocompleteInitializing = false;
      };
      script.onerror = () => {
        this._autocompleteInitializing = false;
      };
      document.body.appendChild(script);
    } else {
      this._autocompleteInitializing = false;
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

  static getProductCard(product) {
    const discount = product.discount_price ?
      Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

    // Mock sizes logic (preserved from Home for consistency, ideally should come from API)
    // Tallas Disponibles might be a string or array in 'specifications'
    let sizeText = 'US 7 • 8 • 9 • 10 • 11';
    try {
      let specs = product.specifications;
      if (typeof specs === 'string') specs = JSON.parse(specs);
      if (specs && specs['Tallas Disponibles']) {
        const sizes = Array.isArray(specs['Tallas Disponibles'])
          ? specs['Tallas Disponibles']
          : specs['Tallas Disponibles'].split(',');
        sizeText = sizes.slice(0, 5).join(' • ');
      }
    } catch (e) { }


    // SVG Data URI Placeholder (More visible with better contrast)
    const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='45%25' text-anchor='middle'%3ESNEAKERS%3C/text%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='60%25' text-anchor='middle'%3ESHOP%3C/text%3E%3C/svg%3E";

    // Normalize image URL - validate before using
    let imageUrl = placeholderImg;
    if (product.image_url && 
        product.image_url.trim() !== '' && 
        !product.image_url.includes('undefined') &&
        !product.image_url.includes('null') &&
        (product.image_url.startsWith('http') || product.image_url.startsWith('/') || product.image_url.startsWith('assets/'))) {
      imageUrl = product.image_url;
    } else if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      const firstImg = product.images[0];
      if (firstImg && firstImg.trim() !== '' && !firstImg.includes('undefined')) {
        imageUrl = firstImg;
      }
    } else if (typeof product.images === 'string' && product.images.trim() !== '') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
          const parsedImg = parsed[0];
          if (parsedImg && parsedImg.trim() !== '' && !parsedImg.includes('undefined')) {
            imageUrl = parsedImg;
          }
        }
      } catch (e) {
        // Not valid JSON, use placeholder
      }
    }

    // Always use placeholder if image URL is invalid
    if (!imageUrl || imageUrl === '' || imageUrl.includes('undefined') || imageUrl.includes('null')) {
      imageUrl = placeholderImg;
    }

    return `
      <div class="product-card">
        <div class="product-image-container" onclick="window.location.href='product-detail.html?id=${product.id}'">
          <img src="${imageUrl}" 
               class="product-image"
               alt="${product.name || 'Producto'}" 
               loading="lazy"
               decoding="async"
               onerror="this.onerror=null; this.src='${placeholderImg}'; this.style.display='block';"
               onload="this.style.display='block';"
               style="display: block; min-height: 100%; object-fit: cover;">
          
          <div class="product-badges">
            ${discount > 0 ? `<span class="product-badge product-badge-sale">-${Math.round(discount)}% OFF</span>` : ''}
            ${product.is_new || product.created_at ? `<span class="product-badge product-badge-new">NUEVO</span>` : ''}
            ${product.is_bestseller || product.sales_count > 50 ? `<span class="product-badge product-badge-bestseller">🔥 MÁS VENDIDO</span>` : ''}
            ${product.is_trending || product.views > 100 ? `<span class="product-badge product-badge-trending">⚡ TENDENCIA</span>` : ''}
            ${product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5 ? `<span class="product-badge product-badge-low-stock">⚠️ ÚLTIMAS ${product.stock_quantity}</span>` : ''}
          </div>
          ${product.stock_quantity !== undefined ? `
            <div class="product-stock-badge ${product.stock_quantity === 0 ? 'sold-out' : product.stock_quantity <= 5 ? 'low' : 'available'}">
              ${product.stock_quantity === 0 ? 'AGOTADO' : product.stock_quantity <= 5 ? `Solo ${product.stock_quantity} pares` : 'En stock'}
            </div>
          ` : ''}

          <div class="product-quick-actions">
            <button class="product-quick-action" onclick="event.stopPropagation(); window.wishlistManager?.toggle('${product.id}')" title="Agregar a favoritos" aria-label="Agregar a favoritos">
              <i class="far fa-heart" aria-hidden="true"></i>
            </button>
            <button class="product-quick-action" onclick="event.stopPropagation(); window.openQuickView?.('${product.id}') || window.quickView?.show('${product.id}')" title="Vista Rápida" aria-label="Vista rápida">
              <i class="fas fa-eye" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${product.brand || 'Sneakers'}</span>
          <h3 class="product-title" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
          
          <div class="product-price-container">
            <div class="product-price">
              ${product.discount_price ? `
                <span class="product-price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                <span class="product-price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
              ` : `
                <span class="product-price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
              `}
            </div>
            <button class="btn-quick-add" onclick="event.preventDefault(); event.stopPropagation(); const cart = window.cartEngine || window.cartManager; if(cart) { cart.add('${product.id}', 1).then(() => { if(window.notifications) window.notifications.success('AÑADIDO', '${product.name.replace(/'/g, "\\'")} al carrito'); }); } else { if(window.notifications) window.notifications.error('Error', 'Carrito no disponible. Por favor, recarga la página.'); }" aria-label="Agregar ${product.name.replace(/"/g, '&quot;')} al carrito">
                <i class="fas fa-plus" aria-hidden="true"></i>
            </button>
          </div>

          <div class="product-size-preview">${sizeText}</div>

          <button class="product-btn" onclick="event.preventDefault(); event.stopPropagation(); const cart = window.cartEngine || window.cartManager; if(cart) { cart.add('${product.id}', 1).then(() => { if(window.notifications) window.notifications.success('AÑADIDO', '${product.name.replace(/'/g, "\\'")} al carrito'); }); } else { if(window.notifications) window.notifications.error('Error', 'Carrito no disponible. Por favor, recarga la página.'); }" aria-label="Agregar ${product.name.replace(/"/g, '&quot;')} al carrito">
            AGREGAR AL CARRITO
          </button>
        </div>
      </div>
      `;
  }

  static async initLoyaltyBadge() {
    const badge = document.getElementById('headerLoyaltyBadge');
    const pointsSpan = document.getElementById('headerLoyaltyPoints');

    if (!badge || !window.authManager || !window.authManager.isAuthenticated()) return;

    try {
      const res = await window.api.getLoyaltyPoints();
      const points = res.data?.points || 0;

      if (points > 0) {
        badge.style.display = 'flex';
        if (pointsSpan) pointsSpan.textContent = `${points} PTS`;
      }
    } catch (e) {
      if (window.Logger) window.Logger.warn('Loyalty Badge Error:', e);
    }
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

// Mobile Menu Logic (V3)
window.MobileMenu = {
  toggle: function () {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');

    if (menu && overlay) {
      menu.classList.toggle('active');
      overlay.classList.toggle('active');

      // Prevent body scroll
      if (menu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      if (window.Logger) window.Logger.error('Mobile Menu element not found');
    }
  }
};

// Global Auth Redirect Helper
window.handleAuthRedirect = function (event, targetUrl) {
  if (event) event.preventDefault();

  // Check if AuthManager is available and authenticated
  if (window.authManager && window.authManager.isAuthenticated()) {
    window.location.href = targetUrl || 'profile.html';
  } else {
    // Save target for redirect after login
    localStorage.setItem('redirect_after_login', targetUrl || 'profile.html');
    window.location.href = 'login.html';
  }
};

// --- DYNAMIC WIDGET LOADER (Chat & SEO) ---
document.addEventListener('DOMContentLoaded', () => {
  // Inject Chat Widget
  if (!window.ChatWidget && !window.location.pathname.includes('checkout.html')) {
    const script = document.createElement('script');
    script.src = 'js/chat-widget.js';
    script.onload = () => new window.ChatWidget();
    document.body.appendChild(script);
  }

  // Inject SEO Manager
  if (!window.SeoManager) {
    const script = document.createElement('script');
    script.src = 'js/seo-manager.js';
    document.head.appendChild(script);
  }
});
