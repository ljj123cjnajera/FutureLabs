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
      const container = document.getElementById('featuredProducts');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('featuredProducts', 'product-grid');
      }
      
      const response = await window.api.getFeaturedProducts();
      if (response.success) {
        this.featuredProducts = response.data.products;
        this.renderFeaturedProducts();
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  }

  async loadOnSaleProducts() {
    try {
      // Mostrar skeleton loader
      const container = document.getElementById('onSaleProducts');
      if (container && window.skeletonLoader) {
        window.skeletonLoader.show('onSaleProducts', 'product-grid');
      }
      
      const response = await window.api.getProducts({ on_sale: true });
      if (response.success) {
        this.onSaleProducts = response.data.products.slice(0, 8);
        this.renderOnSaleProducts();
      }
    } catch (error) {
      console.error('Error loading on-sale products:', error);
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
      if (response.success) {
        this.categories = response.data.categories;
        this.renderCategories();
        this.renderHomeSections();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  renderFeaturedProducts() {
    const container = document.getElementById('featuredProductsGrid');
    if (!container) return;

    container.innerHTML = this.featuredProducts.map(product => this.createProductCard(product)).join('');
    window.wishlistManager?.syncToggleButtons?.(container);
    
    // Ocultar skeleton loader
    if (window.skeletonLoader) {
      window.skeletonLoader.hide('featuredProducts');
    }
  }

  renderOnSaleProducts() {
    // Crear contenedor si no existe
    let container = document.getElementById('onSaleProductsGrid');
    if (!container) {
      const section = document.createElement('section');
      section.className = 'section';
      section.innerHTML = `
        <div class="container">
          <h2 class="section-title">🔥 Ofertas Especiales</h2>
          <div id="onSaleProductsGrid" class="products-grid"></div>
        </div>
      `;
      
      // Insertar después de featured products
      const featuredSection = document.getElementById('featured-products');
      if (featuredSection) {
        featuredSection.insertAdjacentElement('afterend', section);
        container = document.getElementById('onSaleProductsGrid');
      } else {
        console.log('⚠️ Featured section not found, skipping on-sale products');
        return;
      }
    }

    if (container) {
      container.innerHTML = this.onSaleProducts.map(product => this.createProductCard(product)).join('');
      window.wishlistManager?.syncToggleButtons?.(container);
      
      // Ocultar skeleton loader
      if (window.skeletonLoader) {
        window.skeletonLoader.hide('onSaleProducts');
      }
    }
  }

  renderCategories() {
    const container = document.querySelector('.categories-carousel');
    if (!container) return;

    container.innerHTML = this.categories.map(category => `
      <div class="category-card" onclick="window.location.href='products.html?category=${category.slug}'">
        <div class="category-icon">
          <i class="${this.getCategoryIcon(category.slug)}"></i>
        </div>
        <h3>${category.name}</h3>
        <p>${category.description}</p>
      </div>
    `).join('');
    
    // Ocultar skeleton loader
    if (window.skeletonLoader) {
      window.skeletonLoader.hide('categories');
    }
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

    // CTA buttons
    document.querySelectorAll('.cta-button').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'products.html';
      });
    });
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

