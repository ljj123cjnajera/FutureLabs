// 🏠 Gestión de la Página Principal
class HomeManager {
  constructor() {
    this.featuredProducts = [];
    this.onSaleProducts = [];
    this.categories = [];
    this.heroSlides = [];
    this.homeBenefits = [];
    this.homeBanners = [];
    this.homeSections = [];
    this.init();
  }

  async init() {
    console.log('🏠 HomeManager init() - Iniciando...');
    try {
      await Promise.all([
        this.loadHomeContent(),
        this.loadFeaturedProducts(),
        this.loadOnSaleProducts(),
        this.loadCategories()
      ]);
      
      // Cargar megamenú dinámicamente después de cargar categorías
      this.loadMegaMenu();
      
      this.setupEventListeners();
      console.log('✅ HomeManager inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando HomeManager:', error);
    }
  }

  async loadHomeContent() {
    try {
      console.log('🏠 Cargando contenido del home...');
      const response = await window.api.getHomeContent();
      
      if (!response || !response.success) {
        console.warn('⚠️ Respuesta inválida del servidor:', response);
        this.renderEmptyStates();
        return;
      }

      const { hero_slides, benefits, banners, sections } = response.data ?? {};
      
      // Procesar hero slides
      this.heroSlides = Array.isArray(hero_slides)
        ? hero_slides
            .filter(slide => slide && slide.is_active !== false)
            .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      console.log(`✅ Hero slides cargados: ${this.heroSlides.length}`);

      // Procesar beneficios
      this.homeBenefits = Array.isArray(benefits)
        ? benefits
            .filter(benefit => benefit && benefit.is_active !== false)
            .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      console.log(`✅ Beneficios cargados: ${this.homeBenefits.length}`);

      // Procesar banners
      this.homeBanners = Array.isArray(banners)
        ? banners
            .filter(banner => this.isBannerCurrentlyActive(banner))
            .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      console.log(`✅ Banners cargados: ${this.homeBanners.length}`);

      // Procesar secciones
      this.homeSections = Array.isArray(sections)
        ? sections
            .filter(section => section && section.is_active !== false)
            .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      console.log(`✅ Secciones cargadas: ${this.homeSections.length}`);

      // Renderizar todo
      this.renderHeroSlides();
      this.renderBenefits();
      this.renderBanners();
      this.renderHomeSections();
      
      console.log('✅ Contenido del home renderizado correctamente');
    } catch (error) {
      console.error('❌ Error cargando contenido del home:', error);
      this.renderEmptyStates();
    }
  }

  renderEmptyStates() {
    // Renderizar estados vacíos si hay error o no hay datos
    this.renderHeroSlides();
    this.renderBenefits();
    this.renderBanners();
    this.renderHomeSections();
  }

  async loadFeaturedProducts() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('featuredProductsGrid');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('featuredProductsGrid', 'product-grid');
      }
      
      const response = await window.api.getFeaturedProducts();
      if (response && response.success) {
        this.featuredProducts = response.data?.products || [];
        this.renderFeaturedProducts();
        console.log(`✅ Productos destacados cargados: ${this.featuredProducts.length}`);
      } else {
        console.warn('⚠️ Respuesta inválida al cargar productos destacados:', response);
        this.renderFeaturedProducts(); // Renderizar estado vacío
      }
    } catch (error) {
      console.error('❌ Error cargando productos destacados:', error);
      this.renderFeaturedProducts(); // Renderizar estado vacío
    }
  }

  async loadOnSaleProducts() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('onSaleProductsGrid');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('onSaleProductsGrid', 'product-grid');
      }
      
      const response = await window.api.getOnSaleProducts(8);
      
      if (response && response.success) {
        this.onSaleProducts = response.data?.products || [];
        this.renderOnSaleProducts();
        console.log(`✅ Productos en oferta cargados: ${this.onSaleProducts.length}`);
      } else {
        console.warn('⚠️ Respuesta inválida al cargar productos en oferta:', response);
        this.renderOnSaleProducts(); // Renderizar estado vacío
      }
    } catch (error) {
      console.error('❌ Error cargando productos en oferta:', error);
      this.renderOnSaleProducts(); // Renderizar estado vacío
    }
  }

  async loadCategories() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('categories');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('categories', 'categories');
      }
      
      const response = await window.api.getCategories();
      if (response && response.success) {
        this.categories = response.data?.categories || [];
        this.renderCategories();
        this.renderHomeSections();
        console.log(`✅ Categorías cargadas: ${this.categories.length}`);
      } else {
        console.warn('⚠️ Respuesta inválida al cargar categorías:', response);
        this.renderCategories(); // Renderizar estado vacío o mantener placeholder
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      // Mantener las categorías placeholder si hay error
    } finally {
      // Ocultar skeleton loader
      if (window.skeletonLoader) {
        window.skeletonLoader.hide('categories');
      }
    }
  }

  renderFeaturedProducts() {
    const container = document.getElementById('featuredProductsGrid');
    if (!container) {
      console.warn('⚠️ featuredProductsGrid container not found');
      return;
    }

    if (!this.featuredProducts || this.featuredProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #999;">
          <i class="fas fa-star" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; margin: 0;">No hay productos destacados en este momento</p>
          <p style="font-size: 14px; margin-top: 8px; opacity: 0.7;">Explora nuestros productos en la sección de catálogo</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.featuredProducts.map(product => this.createProductCard(product)).join('');
    window.wishlistManager?.syncToggleButtons?.(container);
    
      // Ocultar skeleton loader
      if (window.skeletonLoader) {
        window.skeletonLoader.hide('featuredProductsGrid');
      }
  }

  renderOnSaleProducts() {
    const container = document.getElementById('onSaleProductsGrid');
    if (!container) {
      console.warn('⚠️ onSaleProductsGrid container not found');
      return;
    }

    if (!this.onSaleProducts || this.onSaleProducts.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #999;">
          <i class="fas fa-fire" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; margin: 0;">No hay ofertas disponibles en este momento</p>
          <p style="font-size: 14px; margin-top: 8px; opacity: 0.7;">Vuelve pronto para ver nuestras mejores promociones</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.onSaleProducts.map(product => this.createProductCard(product)).join('');
    window.wishlistManager?.syncToggleButtons?.(container);
    
      // Ocultar skeleton loader
      if (window.skeletonLoader) {
        window.skeletonLoader.hide('onSaleProductsGrid');
      }
  }

  renderCategories() {
    const container = document.getElementById('categories');
    if (!container) {
      console.warn('⚠️ categories container not found');
      return;
    }

    if (!this.categories || this.categories.length === 0) {
      // Mantener categorías placeholder si no hay categorías
      container.innerHTML = `
        <div class="category-card">
          <div class="category-icon"><i class="fas fa-gamepad"></i></div>
          <h3>Mundo Gamer</h3>
          <p>Equipos y accesorios gaming</p>
        </div>
        <div class="category-card">
          <div class="category-icon"><i class="fas fa-laptop"></i></div>
          <h3>Mundo Productividad</h3>
          <p>Herramientas para trabajar</p>
        </div>
        <div class="category-card">
          <div class="category-icon"><i class="fas fa-home"></i></div>
          <h3>Mundo Hogar Inteligente</h3>
          <p>Automatización y control</p>
        </div>
        <div class="category-card">
          <div class="category-icon"><i class="fas fa-heartbeat"></i></div>
          <h3>Mundo Bienestar Tech</h3>
          <p>Tecnología para tu salud</p>
        </div>
        <div class="category-card">
          <div class="category-icon"><i class="fas fa-headphones"></i></div>
          <h3>Mundo Audio</h3>
          <p>Sonido de alta calidad</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.categories.slice(0, 8).map(category => `
      <div class="category-card" onclick="window.location.href='products.html?category=${category.slug}'" role="button" tabindex="0" aria-label="Ver productos de ${category.name}">
        <div class="category-icon">
          <i class="${this.getCategoryIcon(category.slug)}" aria-hidden="true"></i>
        </div>
        <h3>${this.escapeHtml(category.name)}</h3>
        <p>${this.escapeHtml(category.description || 'Explora esta categoría')}</p>
      </div>
    `).join('');
    
    // Agregar event listeners para teclado (accesibilidad)
    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  renderHeroSlides() {
    const slider = document.getElementById('heroSlider');
    const slidesContainer = document.getElementById('heroSlidesContainer');
    const dotsContainer = document.getElementById('heroSliderDots');
    const emptyState = document.getElementById('heroSliderEmpty');
    if (!slider || !slidesContainer || !dotsContainer) return;

    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    if (!this.heroSlides.length) {
      slider.classList.remove('has-data');
      if (emptyState) emptyState.style.display = 'flex';
      const prevBtn = slider.querySelector('.slider-arrow.prev');
      const nextBtn = slider.querySelector('.slider-arrow.next');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      dotsContainer.style.display = 'none';
      window.initHeroCarousel?.();
      return;
    }

    slider.classList.add('has-data');
    if (emptyState) emptyState.style.display = 'none';

    this.heroSlides.forEach((slideData, index) => {
      const slide = document.createElement('div');
      slide.className = `slide${index === 0 ? ' active' : ''}`;
      slide.style.background = slideData.background_color || 'var(--primary)';
      if (slideData.image_url) {
        slide.style.backgroundImage = `linear-gradient(135deg, rgba(15,23,42,0.65), rgba(15,23,42,0.3)), url('${slideData.image_url}')`;
        slide.style.backgroundSize = 'cover';
        slide.style.backgroundPosition = 'center';
      }

      const content = document.createElement('div');
      content.className = 'slide-content';

      if (slideData.eyebrow) {
        const eyebrow = document.createElement('span');
        eyebrow.className = 'slide-eyebrow';
        eyebrow.textContent = slideData.eyebrow;
        content.appendChild(eyebrow);
      }

      const title = document.createElement('h1');
      title.textContent = slideData.title || 'FutureLabs';
      content.appendChild(title);

      if (slideData.description) {
        const paragraph = document.createElement('p');
        paragraph.textContent = slideData.description;
        content.appendChild(paragraph);
      }

      if (slideData.button_text) {
        const button = document.createElement('button');
        button.className = 'btn btn-primary btn-lg';
        button.textContent = slideData.button_text;
        const link = slideData.button_link;
        if (link) {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = link;
          });
        }
        content.appendChild(button);
      }

      slide.appendChild(content);
      slidesContainer.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `slider-dot${index === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${index + 1}`);
      dotsContainer.appendChild(dot);
    });

    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');
    const showArrows = this.heroSlides.length > 1;
    if (prevBtn) prevBtn.style.display = showArrows ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = showArrows ? 'flex' : 'none';
    dotsContainer.style.display = showArrows ? 'flex' : 'none';

    window.requestAnimationFrame(() => window.initHeroCarousel?.());
  }

  renderBenefits() {
    const container = document.getElementById('benefitsContainer');
    if (!container) return;

    if (!this.homeBenefits.length) {
      container.innerHTML = `
        <div class="benefit-card benefit-card--empty">
          <div class="benefit-content">
            <h3>Pronto más beneficios</h3>
            <p>Configura beneficios desde el panel administrativo para mostrarlos aquí.</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.homeBenefits.map(benefit => {
      const background = benefit.background_color ? `style="background:${benefit.background_color};"` : '';
      const hasImage = Boolean(benefit.image_url);
      const iconMarkup = benefit.icon
        ? `<span class="benefit-icon"><i class="${benefit.icon}"></i></span>`
        : '';
      const imageMarkup = hasImage
        ? `<img src="${benefit.image_url}" alt="${benefit.title || 'Benefit'}" onerror="this.style.display='none'">`
        : '';

      return `
        <article class="benefit-card" ${background}>
          <div class="benefit-image">
            ${imageMarkup || iconMarkup || `<span class="benefit-icon"><i class="fas fa-star"></i></span>`}
          </div>
          <div class="benefit-content">
            <h3>${benefit.title || 'Beneficio especial'}</h3>
            ${benefit.description ? `<p>${benefit.description}</p>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  renderBanners() {
    const container = document.getElementById('bannerGrid');
    if (!container) return;

    if (!this.homeBanners.length) {
      container.innerHTML = `
        <div class="banner banner--placeholder">
          <h3>Configura tus banners</h3>
          <p>Los banners que crees en el panel aparecerán automáticamente aquí.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.homeBanners.slice(0, 3).map(banner => {
      const backgroundStyle = banner.image_url
        ? `style="background-image:linear-gradient(135deg, rgba(15,23,42,0.7), rgba(15,23,42,0.25)), url('${banner.image_url}');"`
        : '';
      const gradientOnly = !banner.image_url && banner.background_color
        ? `style="background:${banner.background_color};"`
        : '';
      const linkAttr = banner.button_link ? `data-link="${banner.button_link}"` : '';
      return `
        <article class="banner" ${backgroundStyle || gradientOnly} ${linkAttr}>
          <h3>${banner.title || 'Banner destacado'}</h3>
          ${banner.description ? `<p>${banner.description}</p>` : ''}
          ${banner.button_text ? `<span class="banner-cta">${banner.button_text}</span>` : ''}
        </article>
      `;
    }).join('');

    this.bindBannerClicks(container);
  }

  renderHomeSections() {
    const container = document.getElementById('homeSectionsContainer');
    if (!container) return;

    if (!this.homeSections.length) {
      container.innerHTML = `
        <div class="home-section-card home-section-card--empty">
          <div class="home-section-content">
            <h3>Secciones personalizadas</h3>
            <p>Crea secciones desde el panel administrativo para destacar colecciones, categorías o campañas especiales.</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.homeSections.map(section => {
      const settings = this.parseSettings(section.settings);
      const category = section.category_id ? this.getCategoryById(section.category_id) : null;
      const title = section.title || settings.title || (category ? category.name : this.getSectionTypeLabel(section.section_type));
      const description = settings.description || (category ? category.description : '');
      const ctaText = settings.cta_text || 'Ver colección';
      const link = settings.cta_link || (category ? `products.html?category=${category.slug}` : 'products.html');
      const imageUrl = settings.image_url || (category?.image_url ?? null);

      return `
        <article class="home-section-card" data-link="${link}">
          <div class="home-section-media">
            ${imageUrl ? `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">` : `<div class="home-section-placeholder"><i class="fas fa-layer-group"></i></div>`}
          </div>
          <div class="home-section-content">
            <span class="home-section-tag">${this.getSectionTypeLabel(section.section_type)}</span>
            <h3>${title}</h3>
            ${description ? `<p>${description}</p>` : ''}
            <div class="home-section-meta">
              <span><i class="fas fa-sort-amount-up"></i> Orden: ${section.order_index}</span>
              <span><i class="fas fa-cubes"></i> Límite: ${section.limit}</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" data-link="${link}">${ctaText}</button>
          </div>
        </article>
      `;
    }).join('');

    container.querySelectorAll('[data-link]').forEach(element => {
      element.addEventListener('click', (event) => {
        const target = event.currentTarget;
        const url = target.getAttribute('data-link');
        if (url) {
          window.location.href = url;
        }
      });
    });
  }

  parseSettings(rawSettings) {
    if (!rawSettings) return {};
    if (typeof rawSettings === 'object') return rawSettings;
    try {
      return JSON.parse(rawSettings);
    } catch (error) {
      return {};
    }
  }

  getSectionTypeLabel(type) {
    const map = {
      category_carousel: 'Carrusel de categoría',
      categories_grid: 'Cuadrícula de categorías',
      featured_products: 'Productos destacados',
      custom: 'Sección personalizada'
    };
    return map[type] || 'Sección destacada';
  }

  getCategoryById(id) {
    return this.categories.find(cat => cat.id === id);
  }

  bindBannerClicks(container) {
    container.querySelectorAll('.banner[data-link]').forEach(banner => {
      banner.addEventListener('click', () => {
        const url = banner.getAttribute('data-link');
        if (url) {
          window.location.href = url;
        }
      });
    });
  }

  createProductCard(product) {
    const discount = product.discount_price ? 
      Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
    
    return `
      <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <div class="product-image">
          <img src="${product.image_url || 'assets/images/products/placeholder.jpg'}" 
               alt="${product.name}" 
               onerror="this.src='assets/images/products/placeholder.jpg'">
          ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
          <button
            class="favorite-btn"
            type="button"
            data-wishlist-toggle
            data-product-id="${product.id}"
            data-label-inactive="Agregar a favoritos"
            data-label-active="En tu wishlist"
            data-icon-inactive="far fa-heart"
            data-icon-active="fas fa-heart"
          >
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-rating">
            ${this.generateStars(product.rating)}
            <span class="rating-text">(${product.review_count || 0})</span>
          </div>
          <div class="product-price">
            ${product.discount_price ? `
              <span class="price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
              <span class="price-new">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
            ` : `
              <span class="price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
            `}
          </div>
          <div class="product-actions">
            <button class="btn-cart" onclick="event.stopPropagation(); homeManager.addToCart('${product.id}')">
              <i class="fas fa-shopping-cart"></i> Agregar
            </button>
            <button class="btn-buy" onclick="event.stopPropagation(); homeManager.buyNow('${product.id}')">
              Comprar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
  }

  getCategoryIcon(slug) {
    const icons = {
      'gaming': 'fa-gamepad',
      'smartphones': 'fa-mobile-alt',
      'laptops': 'fa-laptop',
      'audio': 'fa-headphones',
      'smart-home': 'fa-home',
      'wearables': 'fa-heartbeat',
      'cameras': 'fa-camera',
      'accessories': 'fa-plug'
    };
    return icons[slug] || 'fa-box';
  }

  async addToCart(productId) {
    try {
      console.log('🛒 Intentando agregar producto al carrito:', productId);
      console.log('🔍 cartManager existe:', typeof window.cartManager);
      console.log('🔍 notifications existe:', typeof window.notifications);
      
      await window.cartManager.add(productId, 1);
      console.log('✅ Producto agregado al carrito');
      window.notifications.show('Producto agregado al carrito', 'success');
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      window.notifications.show('Error al agregar producto', 'error');
    }
  }

  async buyNow(productId) {
    try {
      await window.cartManager.add(productId, 1);
      window.location.href = 'checkout.html';
    } catch (error) {
      window.notifications.show('Error al procesar compra', 'error');
    }
  }

  setupEventListeners() {
    // Búsqueda
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
      const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
      };
      
      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
      });
    }

    // CTA buttons genéricos
    document.querySelectorAll('.cta-button:not([data-action])').forEach(btn => {
      if (!btn.closest('.sticky-footer') && !btn.closest('.affiliate-banner')) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = 'products.html';
        });
      }
    });

    // Sticky Footer - Suscripción
    this.setupSubscriptionBanner();

    // Chat Button
    this.setupChatButton();

    // Affiliate Banner
    this.setupAffiliateBanner();

    // Flash Offers - Mejorar diseño
    this.setupFlashOffers();
  }

  setupSubscriptionBanner() {
    const subscribeBtn = document.querySelector('.sticky-footer .cta-button');
    if (!subscribeBtn) return;

    subscribeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Verificar si el usuario está logueado
      const user = await window.authManager?.getCurrentUser().catch(() => null);
      const email = user?.email;

      if (email) {
        // Usuario logueado, usar su email
        this.handleSubscription(email);
      } else {
        // Usuario no logueado, mostrar modal o prompt
        this.showSubscriptionModal();
      }
    });
  }

  showSubscriptionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        <h2 style="margin-bottom: 16px;">¡Suscríbete y obtén 10% de descuento!</h2>
        <p style="margin-bottom: 24px; color: #666;">Recibe ofertas exclusivas, novedades y tu código de descuento por email.</p>
        <form id="subscriptionForm" onsubmit="event.preventDefault(); window.homeManager.handleSubscriptionForm(event);">
          <div class="form-group">
            <input type="email" id="subscriptionEmail" placeholder="tu@email.com" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Suscribirme</button>
        </form>
        <p style="margin-top: 16px; font-size: 12px; color: #999; text-align: center;">
          Al suscribirte, aceptas recibir comunicaciones comerciales de FutureLabs.
        </p>
      </div>
    `;
    document.body.appendChild(modal);

    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Focus en el input
    setTimeout(() => {
      document.getElementById('subscriptionEmail')?.focus();
    }, 100);
  }

  async handleSubscriptionForm(event) {
    const form = event.target;
    const emailInput = document.getElementById('subscriptionEmail');
    const email = emailInput?.value.trim();

    if (!email || !this.isValidEmail(email)) {
      window.notifications?.error('Por favor, ingresa un email válido');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Suscribiendo...';
    }

    try {
      await this.handleSubscription(email);
      form.closest('.modal')?.remove();
    } catch (error) {
      console.error('Error en suscripción:', error);
      window.notifications?.error('Error al procesar suscripción. Inténtalo de nuevo.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  async handleSubscription(email) {
    try {
      // TODO: Implementar endpoint de suscripción en backend
      // Por ahora, solo mostrar notificación
      window.notifications?.success(`¡Te has suscrito con ${email}! Pronto recibirás tu código de descuento del 10%.`);
      
      // Guardar en localStorage para evitar spam
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      if (!subscriptions.includes(email)) {
        subscriptions.push(email);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      }

      // Ocultar sticky footer después de suscripción
      const stickyFooter = document.querySelector('.sticky-footer');
      if (stickyFooter) {
        stickyFooter.style.display = 'none';
      }
    } catch (error) {
      throw error;
    }
  }

  setupChatButton() {
    const chatBtn = document.querySelector('.chat-button');
    if (!chatBtn) return;

    chatBtn.addEventListener('click', () => {
      // Verificar si hay un sistema de chat implementado
      if (window.chatManager) {
        window.chatManager.open();
      } else {
        // Mostrar modal de contacto
        this.showContactModal();
      }
    });
  }

  showContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        <h2 style="margin-bottom: 16px;"><i class="fas fa-comments"></i> ¿Necesitas ayuda?</h2>
        <p style="margin-bottom: 24px; color: #666;">Estamos aquí para ayudarte. Elige cómo prefieres contactarnos:</p>
        <div style="display: grid; gap: 16px;">
          <a href="contact.html" class="btn btn-outline" style="text-align: left; padding: 16px;">
            <i class="fas fa-envelope"></i> Envíanos un email
          </a>
          <a href="faq.html" class="btn btn-outline" style="text-align: left; padding: 16px;">
            <i class="fas fa-question-circle"></i> Ver preguntas frecuentes
          </a>
          <button class="btn btn-outline" onclick="this.closest('.modal').remove(); window.location.href='contact.html';" style="text-align: left; padding: 16px;">
            <i class="fas fa-phone"></i> Información de contacto
          </button>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
          El servicio de chat en vivo estará disponible próximamente.
        </p>
      </div>
    `;
    document.body.appendChild(modal);

    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  setupAffiliateBanner() {
    const affiliateBtn = document.querySelector('.affiliate-banner .cta-button');
    if (!affiliateBtn) return;

    affiliateBtn.addEventListener('click', () => {
      // Redirigir a página de afiliados o mostrar información
      window.location.href = 'contact.html?subject=affiliate';
    });
  }

  async setupFlashOffers() {
    // Mejorar la sección de flash offers con productos reales
    const flashSection = document.getElementById('flashOffersMessage');
    if (!flashSection) return;

    try {
      // Cargar productos en oferta para mostrar en flash offers
      const response = await window.api.getOnSaleProducts(4);
      
      if (response && response.success && response.data?.products?.length > 0) {
        const products = response.data.products.slice(0, 4);
        
        flashSection.innerHTML = `
          <div class="flash-offers-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 24px;">
            ${products.map(product => {
              const discount = product.discount_price ? 
                Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
              
              return `
                <div class="flash-offer-card" onclick="window.location.href='product-detail.html?id=${product.id}'" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; cursor: pointer; transition: transform 0.2s;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">-${discount}%</span>
                    <i class="fas fa-fire" style="font-size: 24px; opacity: 0.8;"></i>
                  </div>
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${this.escapeHtml(product.name)}</h3>
                  <p style="margin: 0 0 16px 0; opacity: 0.9; font-size: 14px;">${this.escapeHtml(product.brand)}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      ${product.discount_price ? `
                        <span style="text-decoration: line-through; opacity: 0.7; font-size: 14px;">S/ ${parseFloat(product.price).toFixed(2)}</span>
                        <span style="display: block; font-size: 24px; font-weight: 700;">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                      ` : `
                        <span style="font-size: 24px; font-weight: 700;">S/ ${parseFloat(product.price).toFixed(2)}</span>
                      `}
                    </div>
                    <button class="btn" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;" onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${product.id}'">
                      Ver oferta
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="products.html?on_sale=true" class="btn btn-primary">Ver todas las ofertas</a>
          </div>
        `;
      } else {
        // Si no hay ofertas, mostrar mensaje mejorado
        flashSection.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <i class="fas fa-fire" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5; color: #ff6b6b;"></i>
            <p style="font-size: 16px; margin: 0; color: #666;">No hay ofertas flash disponibles en este momento</p>
            <p style="font-size: 14px; margin-top: 8px; color: #999;">Suscríbete para ser el primero en enterarte de nuestras próximas promociones</p>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="document.querySelector('.sticky-footer .cta-button')?.click();">
              Suscribirme
            </button>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Error cargando flash offers:', error);
      flashSection.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #999;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; margin: 0;">Error al cargar ofertas flash</p>
          <a href="products.html?on_sale=true" class="btn btn-outline" style="margin-top: 16px;">Ver ofertas disponibles</a>
        </div>
      `;
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async loadMegaMenu() {
    try {
      // Solo cargar si ya tenemos categorías
      if (!this.categories || this.categories.length === 0) {
        return;
      }

      const categoriesColumn = document.querySelector('.categories-column');
      const contentColumn = document.querySelector('.content-column');
      
      if (!categoriesColumn || !contentColumn) {
        console.warn('⚠️ Mega menu containers not found');
        return;
      }

      // Renderizar categorías en la columna izquierda
      categoriesColumn.innerHTML = this.categories.slice(0, 8).map((category, index) => `
        <div class="category-item ${index === 0 ? 'active' : ''}" data-category="${category.slug}">
          <span class="category-text">${this.escapeHtml(category.name)}</span>
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
          <div class="active-indicator"></div>
        </div>
      `).join('');

      // Renderizar contenido de categorías
      contentColumn.innerHTML = this.categories.slice(0, 8).map((category, index) => {
        // Obtener subcategorías si existen (por ahora, usar placeholder)
        const subcategories = this.getSubcategoriesForCategory(category);
        
        return `
          <div class="category-content ${index === 0 ? 'active' : ''}" data-category="${category.slug}">
            <div class="content-header">
              <h2>${this.escapeHtml(category.name)}</h2>
              <a href="products.html?category=${category.slug}" class="view-all">Ver todo <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
            </div>
            <div class="subcategories-grid">
              ${this.renderSubcategoriesGrid(category, subcategories)}
            </div>
          </div>
        `;
      }).join('');

      // Reinicializar event listeners del megamenú
      this.setupMegaMenuListeners();
      
      console.log('✅ Mega menu cargado dinámicamente');
    } catch (error) {
      console.error('❌ Error cargando mega menu:', error);
    }
  }

  getSubcategoriesForCategory(category) {
    // Por ahora, retornar subcategorías genéricas basadas en el slug
    // TODO: Implementar subcategorías reales desde la BD
    const subcategoriesMap = {
      'laptops': [
        { title: 'Componentes', items: ['Procesadores (CPU)', 'Tarjetas de Video (GPU)', 'Placas Madre', 'Memoria RAM', 'Almacenamiento SSD/HDD'] },
        { title: 'Periféricos', items: ['Teclados', 'Mouses', 'Monitores', 'Webcams y Micrófonos', 'Audífonos'] },
        { title: 'Laptops por Tipo', items: ['Laptops para Gaming', 'Laptops Ultraligeras', 'Laptops para Trabajo', 'Laptops Convertibles 2-en-1'] }
      ],
      'gaming': [
        { title: 'Consolas', items: ['PlayStation', 'Xbox', 'Nintendo Switch', 'PC Gaming'] },
        { title: 'Periféricos Gaming', items: ['Teclados Mecánicos', 'Mouses Gaming', 'Headsets', 'Mousepads'] },
        { title: 'Componentes', items: ['Tarjetas Gráficas', 'Procesadores Gaming', 'Refrigeración Líquida', 'Gabinetes Gaming'] }
      ]
    };

    return subcategoriesMap[category.slug] || [
      { title: 'Productos', items: ['Ver todos los productos'] }
    ];
  }

  renderSubcategoriesGrid(category, subcategories) {
    if (!subcategories || subcategories.length === 0) {
      return `
        <div class="subcategory-column">
          <h3>Productos</h3>
          <ul>
            <li><a href="products.html?category=${category.slug}">Ver todos los productos</a></li>
          </ul>
        </div>
      `;
    }

    return subcategories.map(sub => `
      <div class="subcategory-column">
        <h3>${this.escapeHtml(sub.title)}</h3>
        <ul>
          ${sub.items.map(item => `
            <li><a href="products.html?category=${category.slug}&search=${encodeURIComponent(item)}">${this.escapeHtml(item)}</a></li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }

  setupMegaMenuListeners() {
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryContents = document.querySelectorAll('.category-content');

    categoryItems.forEach(item => {
      // Remover listeners previos
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
      newItem.addEventListener('click', () => {
        const category = newItem.getAttribute('data-category');
        
        // Remover active de todos
        categoryItems.forEach(i => i.classList.remove('active'));
        categoryContents.forEach(c => c.classList.remove('active'));
        
        // Agregar active al seleccionado
        newItem.classList.add('active');
        const content = document.querySelector(`.category-content[data-category="${category}"]`);
        if (content) {
          content.classList.add('active');
        }
      });
    });

    // Hover para desktop
    if (window.innerWidth > 768) {
      categoryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
          const category = this.getAttribute('data-category');
          
          if (!this.classList.contains('active')) {
            categoryItems.forEach(i => i.classList.remove('active'));
            categoryContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const content = document.querySelector(`.category-content[data-category="${category}"]`);
            if (content) {
              content.classList.add('active');
            }
          }
        });
      });
    }
  }

  isBannerCurrentlyActive(banner) {
    if (!banner || banner.is_active === false) return false;
    const now = new Date();
    const starts = banner.start_date ? new Date(banner.start_date) : null;
    const ends = banner.end_date ? new Date(banner.end_date) : null;
    if (starts && now < starts) return false;
    if (ends && now > ends) return false;
    return true;
  }
}

// Crear instancia global
window.homeManager = new HomeManager();

