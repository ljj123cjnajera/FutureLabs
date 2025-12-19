// 🧩 Componentes Reutilizables
// Versión: 2.0 - Sin botón Inicio (eliminado 2024-11-04)
class Components {
  static getFooter() {
    return `
      <!-- Footer (Brutalist) -->
      <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <!-- Brand / Bio -->
                <div class="footer-col footer-brand">
                    <div class="footer-logo">SNEAKERS SHOP</div>
                    <p class="footer-bio">
                        The ultimate destination for hype. Curating the best sneakers from Nike, Jordan, Yeezy and more. 
                        <br><br>
                        EST. 2024 — WORLDWIDE
                    </p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-tiktok"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>

                <!-- Links 1 -->
                <div class="footer-col">
                    <h3>SHOP</h3>
                    <ul>
                        <li><a href="products.html?filter=new">New Arrivals</a></li>
                        <li><a href="products.html?filter=best">Best Sellers</a></li>
                        <li><a href="products.html?filter=upcoming">Upcoming Drops</a></li>
                        <li><a href="products.html?cat=sale">Archived Sale</a></li>
                    </ul>
                </div>

                <!-- Links 2 -->
                <div class="footer-col">
                    <h3>SUPPORT</h3>
                    <ul>
                        <li><a href="orders.html">Track Order</a></li>
                        <li><a href="faq.html">FAQs</a></li>
                        <li><a href="returns.html">Returns & Exchange</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                    </ul>
                </div>

                <!-- Newsletter -->
                <div class="footer-col footer-newsletter">
                    <h3>STAY IN THE KNOW</h3>
                    <p style="color: #999; margin-bottom: 1rem; font-size: 0.9rem;">Subscribe for exclusive access to drops and events.</p>
                    <div class="input-group">
                        <input type="email" placeholder="ENTER YOUR EMAIL">
                        <button>→</button>
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
                <p>&copy; ${new Date().getFullYear()} SNEAKERS SHOP. ALL RIGHTS RESERVED.</p>
                <div class="footer-meta">
                    <a href="privacy.html">PRIVACY</a>
                    <a href="terms.html">TERMS</a>
                    <a href="sitemap.html">SITEMAP</a>
                </div>
            </div>
        </div>
      </footer>
    `;
  }

  static getHeader(showSearch = true, showNav = true) {
    // 1. ANNOUNCEMENT BAR TICKER
    const announcementBar = `
        <div class="announcement-bar">
            <div class="announcement-content" id="announcementText">
                FREE SHIPPING ON ORDERS OVER $150 ✈️
            </div>
        </div>
    `;

    // 2. MEGA MENU DATA (Ideally this comes from a config, simplistic here for MVP)
    const megaMenuHTML = `
        <div class="mega-menu-dropdown">
            <div class="mega-menu-container">
                <div class="mega-column">
                    <h4>Collections</h4>
                    <ul>
                        <li><a href="products.html?filter=new-arrivals">New Arrivals 🔥</a></li>
                        <li><a href="products.html?filter=best-sellers">Best Sellers</a></li>
                        <li><a href="products.html?collection=limited">Limited Editions</a></li>
                        <li><a href="products.html?collection=essentials">Essentials</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <h4>Brands</h4>
                    <ul>
                        <li><a href="products.html?category=jordan">Air Jordan</a></li>
                        <li><a href="products.html?category=yeezy">Yeezy</a></li>
                        <li><a href="products.html?category=nike">Nike</a></li>
                        <li><a href="products.html?category=adidas">Adidas</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="products.html?type=high-top">High Tops</a></li>
                        <li><a href="products.html?type=low-top">Low Tops</a></li>
                        <li><a href="products.html?type=running">Running</a></li>
                        <li><a href="products.html?type=slides">Slides</a></li>
                    </ul>
                </div>
                <div class="mega-column">
                    <div class="mega-promo">
                        <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600" alt="Promo">
                        <div class="promo-content">
                            <h5>JUST DROPPED</h5>
                            <a href="products.html?filter=new" class="promo-btn">SHOP NOW</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return `
      <header class="header-v3-wrapper">
        ${announcementBar}
        
        <div class="header-v3">
            <!-- MAIN ROW -->
            <div class="header-main-row">
                <div class="header-mobile-toggle" onclick="window.MobileMenu.toggle()">
                    <i class="fas fa-bars"></i>
                </div>

                <div class="header-logo">
                    <a href="index.html">
                        <img src="assets/images/logo-clean.png" alt="Sneakers Shop">
                    </a>
                </div>

                ${showSearch ? `
                <div class="header-search">
                    <div class="search-input-wrapper">
                        <input type="text" placeholder="SEARCH FOR DROPS..." id="searchInput">
                        <button class="search-icon-btn" onclick="performSearch()">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div id="searchSuggestions" class="search-suggestions" style="display: none;"></div>
                </div>
                ` : ''}

                <div class="header-actions">
                    <a href="#" class="action-btn" id="accountLink">
                        <i class="far fa-user"></i>
                        <span>Account</span>
                    </a>
                    <a href="wishlist.html" class="action-btn">
                        <i class="far fa-heart"></i>
                        <span>Saved</span>
                    </a>
                    <a href="cart.html" class="action-btn">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Cart</span>
                        <span class="action-badge cart-count">0</span>
                    </a>
                </div>
            </div>

            <!-- NAV ROW (DESKTOP) -->
            ${showNav ? `
            <nav class="header-nav" id="desktopNav">
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="products.html" class="nav-link">NEW ARRIVALS</a>
                        <!-- Mega Menu Injection -->
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item">
                        <a href="products.html?category=jordan" class="nav-link">JORDAN</a>
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item">
                        <a href="products.html?category=yeezy" class="nav-link">YEEZY</a>
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item">
                        <a href="products.html?category=nike" class="nav-link">NIKE</a>
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item">
                        <a href="products.html?category=adidas" class="nav-link">ADIDAS</a>
                        ${megaMenuHTML}
                    </li>
                    <li class="nav-item">
                        <a href="products.html?filter=sale" class="nav-link" style="color: var(--accent);">SALE</a>
                    </li>
                </ul>
            </nav>
            ` : ''}
        </div>
      </header>
    `;
  }

  static initHeader() {
    console.log('🔵 [COMPONENTS] initHeader() executed');

    // Ticker Animation Logic
    const messages = [
      "FREE SHIPPING ON ORDERS OVER $150 ✈️",
      "NEW JORDAN DROP THIS FRIDAY 🔥",
      "JOIN THE CLUB & GET 10% OFF 👟"
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
  }
    this.ensureWishlistAssets();
this.ensureVerificationAssets();

// FORZAR VISIBILIDAD DE TODOS LOS BOTONES DEL HEADER
// Style enforcement delegated to CSS (home-streetwear.css)
console.log('🔵 [COMPONENTS] Header initialized (V3 Clean Mode)');

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

  accountLink.addEventListener('click', function (e) {
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

  static ensureWishlistAssets() {
  if (typeof document === 'undefined') return;

  const syncIfReady = () => {
    if (window.wishlistManager && typeof window.wishlistManager.syncToggleButtons === 'function') {
      window.wishlistManager.syncToggleButtons(document);
    }
  };

  if (window.wishlistManager) {
    syncIfReady();
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

  if (window.verificationManager) {
    return;
  }

  if (document.querySelector('script[data-verification-script]')) {
    document
      .querySelector('script[data-verification-script]')
      .addEventListener('load', () => {
        console.log('🔵 [COMPONENTS] verification assets loaded (existing)');
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


  return `
      < div class="product-card" onclick = "window.location.href='product-detail.html?id=${product.id}'" >
        <div class="product-image-container">
          <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" 
               class="product-image"
               alt="${product.name}" 
               loading="lazy"
               onerror="this.src='assets/images/products/placeholder.jpg'">
          
          <div class="product-badges">
            ${discount > 0 ? `<span class="product-badge product-badge-sale">-${discount}%</span>` : ''}
            ${product.is_new ? `<span class="product-badge product-badge-new">NUEVO</span>` : ''}
          </div>

          <div class="product-quick-actions">
            <button class="product-quick-action" onclick="event.stopPropagation(); window.wishlistManager?.toggle('${product.id}')" title="Agregar a favoritos">
              <i class="far fa-heart"></i>
            </button>
            <button class="product-quick-action" onclick="event.stopPropagation(); window.openQuickView?.('${product.id}') || window.quickView?.show('${product.id}')" title="Vista Rápida">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${product.brand || 'Sneakers'}</span>
          <h3 class="product-title">${product.name}</h3>
          
          <div class="product-price-container">
            <div class="product-price">
              ${product.discount_price ? `
                <span class="product-price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                <span class="product-price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
              ` : `
                <span class="product-price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
              `}
            </div>
            <button class="btn-quick-add" onclick="event.preventDefault(); event.stopPropagation(); window.cartManager?.add(${product.id ? `'${product.id}'` : 'null'}, 1); window.notifications?.success('AÑADIDO', '${product.name.replace(/'/g, "\\'")} al carrito');">
                <i class="fas fa-plus"></i>
            </button>
          </div>

          <div class="product-size-preview">${sizeText}</div>

          <button class="product-btn" onclick="event.stopPropagation(); window.cartManager?.add('${product.id}', 1)">
            AGREGAR AL CARRITO
          </button>
        </div >
      </div >
      `;
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
      window.location.href = `products.html ? search = ${encodeURIComponent(query)} `;
    }
  } else {
    window.location.href = `products.html ? search = ${encodeURIComponent(query)} `;
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
      window.location.href = `products.html ? search = ${encodeURIComponent(query)} `;
    }
  } else {
    window.location.href = `products.html ? search = ${encodeURIComponent(query)} `;
  }
}

// Hacer disponible globalmente
window.Components = Components;


