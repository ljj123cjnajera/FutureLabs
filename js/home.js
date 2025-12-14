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
    window.logger?.info('HOME', 'HomeManager init() - Iniciando...');

    // Preloader Logic - Fail-safe (checks readyState and load)
    const hideLoader = () => {
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, 500);
    };

    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      // Fallback safety timeout (max 3s curtain)
      setTimeout(hideLoader, 3000);
    }

    // Granular Safe Loading
    const safeLoad = async (name, fn) => {
      try {
        await fn();
      } catch (e) {
        window.logger?.error('HOME', `Error crítico en ${name}`, e);
      }
    };

    try {
      await Promise.all([
        safeLoad('HomeContent', () => this.loadHomeContent()),
        safeLoad('FeaturedProducts', () => this.loadFeaturedProducts()),
        safeLoad('OnSaleProducts', () => this.loadOnSaleProducts()),
        safeLoad('Categories', () => this.loadCategories())
      ]);

      // Cargar megamenú dinámicamente después de cargar categorías
      safeLoad('MegaMenu', () => this.loadMegaMenu());

      // Cargar flash offers después de cargar productos en oferta
      await safeLoad('FlashOffers', () => this.initFlashOffers());

      this.setupEventListeners();
      this.initNewsletter();

      window.logger?.success('HOME', 'HomeManager inicializado correctamente');
    } catch (error) {
      document.body.classList.add('loaded'); // Ensure loader goes away even on critical init error
      window.logger?.error('HOME', 'Error inicializando HomeManager', error);
    }
  }

  initNewsletter() {
    this.initSmartPopup();

    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => this.handleNewsletterSubmit(e, form));

    // Also init footer form
    const footerForm = document.getElementById('footerNewsletterForm');
    if (footerForm) {
      footerForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e, footerForm));
    }
  }

  handleNewsletterSubmit(e, form) {
    e.preventDefault();
    const btn = form.querySelector('button');
    const originalText = btn.innerText;

    btn.innerText = 'PROCESANDO...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerText = '¡SUSCRITO!';
      btn.style.background = '#00ff00';
      btn.style.color = '#000';

      if (window.notifications) window.notifications.success('Te has unido al futuro. Revisa tu email.');

      form.reset();
      localStorage.setItem('newsletterSubscribed', 'true'); // Prevent popup from showing

      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style = '';
      }, 3000);
    }, 1500);
  }

  initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    // Target elements: Sections, Cards, Titles
    const elementsToAnimate = document.querySelectorAll('.section-title, .section-description, .category-card, .product-card, .journal-card, .trust-item, .limitless-text');

    elementsToAnimate.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      // Add staggered delay based on index within its container mostly, 
      // but for simplicity we can just rely on natural scroll or add delays via JS if needed.
      // For grids, we can add delay classes.
      if (el.classList.contains('journal-card') || el.classList.contains('product-card')) {
        // clean way to get index in parent
        const indexInParent = Array.from(el.parentNode.children).indexOf(el);
        if (indexInParent === 1) el.classList.add('reveal-delay-100');
        if (indexInParent === 2) el.classList.add('reveal-delay-200');
        if (indexInParent === 3) el.classList.add('reveal-delay-300');
      }

      observer.observe(el);
    });
  }

  initSmartPopup() {
    // Don't show if already subscribed or dismissed
    if (localStorage.getItem('newsletterSubscribed') || localStorage.getItem('newsletterDismissed')) return;

    const popup = document.getElementById('newsletterPopup');
    if (!popup) return;

    // 1. Scroll Trigger (35% of page)
    const scrollTrigger = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 35) {
        this.showPopup(popup);
        window.removeEventListener('scroll', scrollTrigger);
      }
    };
    window.addEventListener('scroll', scrollTrigger);

    // 2. Exit Intent (Desktop only)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0) {
        this.showPopup(popup);
      }
    });

    // Init popup form logic
    const popupForm = document.getElementById('popupNewsletterForm');
    if (popupForm) {
      popupForm.addEventListener('submit', (e) => {
        this.handleNewsletterSubmit(e, popupForm);
        setTimeout(() => {
          popup.style.display = 'none';
          localStorage.setItem('newsletterSubscribed', 'true');
        }, 2000);
      });
    }
  }

  showPopup(popup) {
    if (localStorage.getItem('newsletterDismissed')) return;
    popup.style.display = 'block';
  }

  async loadHomeContent() {
    // 0. EMERGENCY HEADER/FOOTER RESTORE
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components && window.Components.getHeader) {
      if (!headerContainer.innerHTML.trim()) {
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        window.Components.initHeaderLogic?.();
      }
    }

    // Protect Footer from overwrite if it exists (Brutalist footer is static in index.html)
    const footerContainer = document.getElementById('mainFooter');
    if (footerContainer && window.Components && window.Components.getFooter) {
      if (!footerContainer.innerHTML.trim()) {
        footerContainer.innerHTML = window.Components.getFooter();
      }
    }

    try {
      window.logger?.info('HOME', 'Cargando contenido del home...');
      const response = await window.api.getHomeContent();

      if (!response || !response.success) {
        window.logger?.warn('HOME', 'Respuesta inválida del servidor al cargar contenido del home', response);
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
      window.logger?.debug?.('HOME', `Hero slides cargados: ${this.heroSlides.length}`);

      // Procesar beneficios
      this.homeBenefits = Array.isArray(benefits)
        ? benefits
          .filter(benefit => benefit && benefit.is_active !== false)
          .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      window.logger?.debug?.('HOME', `Beneficios cargados: ${this.homeBenefits.length}`);

      // Procesar banners
      this.homeBanners = Array.isArray(banners)
        ? banners
          .filter(banner => this.isBannerCurrentlyActive(banner))
          .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      window.logger?.debug?.('HOME', `Banners cargados: ${this.homeBanners.length}`);

      // Procesar secciones
      this.homeSections = Array.isArray(sections)
        ? sections
          .filter(section => section && section.is_active !== false)
          .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
        : [];
      window.logger?.debug?.('HOME', `Secciones cargadas: ${this.homeSections.length}`);

      // Renderizar todo
      this.renderHeroSlides();
      this.renderBenefits();
      this.renderBanners();
      this.renderHomeSections();

      // START ANIMATIONS
      setTimeout(() => {
        this.initScrollAnimations();
      }, 100); // Small delay to ensure DOM is ready

      window.logger?.success('HOME', 'Contenido del home renderizado correctamente');
    } catch (error) {
      window.logger?.error('HOME', 'Error cargando contenido del home', error);
      window.notifications?.error('Error al cargar contenido del inicio. Por favor, recarga la página.');
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
        window.logger?.debug?.('HOME', `Productos destacados cargados: ${this.featuredProducts.length}`);

        // Add horizontal scroll mouse drag
        this.enableHorizontalDrag(container);
      } else {
        window.logger?.warn('HOME', 'Respuesta inválida al cargar productos destacados', response);
        this.renderFeaturedProducts(); // Renderizar estado vacío
      }
    } catch (error) {
      window.logger?.error('HOME', 'Error cargando productos destacados', error);
      // ... error handling ...
      const container = document.getElementById('featuredProductsGrid');
      if (container) {
        container.innerHTML = `
          <div class="empty-state" style="min-width: 300px; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.7;"></i>
            <p style="font-size: 16px; margin: 0; font-weight: 600;">Error al cargar productos destacados</p>
          </div>
        `;
      }
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
        window.logger?.debug?.('HOME', `Productos en oferta cargados: ${this.onSaleProducts.length}`);

        // Add horizontal scroll mouse drag
        this.enableHorizontalDrag(container);
      } else {
        window.logger?.warn('HOME', 'Respuesta inválida al cargar productos en oferta', response);
        this.renderOnSaleProducts(); // Renderizar estado vacío
      }
    } catch (error) {
      window.logger?.error('HOME', 'Error cargando productos en oferta', error);
      // Error handling...
      const container = document.getElementById('onSaleProductsGrid');
      if (container) {
        // ... error html ...
        container.innerHTML = `
          <div class="empty-state" style="min-width: 300px; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.7;"></i>
            <p style="font-size: 16px; margin: 0; font-weight: 600;">Error al cargar ofertas especiales</p>
          </div>
        `;
      }
    }
  }

  enableHorizontalDrag(container) {
    if (!container) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('active'); // Optional: transform cursor
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });
    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.classList.remove('active');
    });
    container.addEventListener('mouseup', () => {
      isDown = false;
      container.classList.remove('active');
    });
    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // Scroll-fast
      container.scrollLeft = scrollLeft - walk;
    });
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
        window.logger?.debug?.('HOME', `Categorías cargadas: ${this.categories.length}`);
      } else {
        window.logger?.warn('HOME', 'Respuesta inválida al cargar categorías', response);
        this.renderCategories(); // Renderizar estado vacío o mantener placeholder
      }
    } catch (error) {
      window.logger?.error('HOME', 'Error cargando categorías', error);
      // Mantener las categorías placeholder si hay error
      // No mostrar error al usuario ya que tenemos placeholders
    } finally {
      // Ocultar skeleton loader
      if (window.skeletonLoader) {
        window.skeletonLoader.hide('categories');
      }
    }
  }

  renderFeaturedProducts() {
    const container = document.getElementById('featuredProductsGrid');
    if (!container) return;

    // Premium Placeholders for "Demo Mode" or Empty State
    const demoProducts = [
      { id: 'demo-1', name: 'Air Jordan 1 Retro High OG', price: 789.00, original_price: 900.00, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800', slug: 'jordan-1-high', category: 'jordan', is_new: true },
      { id: 'demo-2', name: 'Nike Dunk Low Retro', price: 459.00, original_price: 0, image_url: 'https://images.unsplash.com/photo-1637844527273-062e08b1a436?q=80&w=800', slug: 'dunk-low', category: 'nike', is_new: false },
      { id: 'demo-3', name: 'Yeezy Boost 350 V2', price: 1250.00, original_price: 1500.00, image_url: 'https://images.unsplash.com/photo-1582260611295-d2a9391d17cf?q=80&w=800', slug: 'yeezy-350', category: 'yeezy', is_new: true },
      { id: 'demo-4', name: 'Adidas Forum Low', price: 389.00, original_price: 450.00, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800', slug: 'forum-low', category: 'adidas', is_new: false }
    ];

    let productsToRender = [];
    if (this.featuredProducts && this.featuredProducts.length > 0) {
      productsToRender = this.featuredProducts;
    } else {
      // Fallback to demo products if API is empty
      productsToRender = demoProducts;
    }

    container.innerHTML = productsToRender.map(product => this.createProductCard(product)).join('');

    // Ocultar skeleton loader
    if (window.skeletonLoader) {
      window.skeletonLoader.hide('featuredProductsGrid');
    }
  }

  renderOnSaleProducts() {
    const container = document.getElementById('onSaleProductsGrid');
    if (!container) return;

    const demoOffers = [
      { id: 'demo-offer-1', name: 'Nike Air Max 90', price: 320.00, discount_price: 280.00, original_price: 320.00, image_url: 'https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=800', slug: 'air-max-90', category: 'nike', on_sale: true },
      { id: 'demo-offer-2', name: 'Adidas Ultraboost', price: 600.00, discount_price: 450.00, original_price: 600.00, image_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?q=80&w=800', slug: 'ultraboost', category: 'adidas', on_sale: true },
      { id: 'demo-offer-3', name: 'Puma RS-X', price: 350.00, discount_price: 299.00, original_price: 350.00, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800', slug: 'rs-x', category: 'puma', on_sale: true }
    ];

    let productsToRender = [];
    if (this.onSaleProducts && this.onSaleProducts.length > 0) {
      productsToRender = this.onSaleProducts;
    } else {
      productsToRender = demoOffers;
    }

    container.innerHTML = productsToRender.map(product => this.createProductCard(product)).join('');

    // Ocultar skeleton loader
    if (window.skeletonLoader) {
      window.skeletonLoader.hide('onSaleProductsGrid');
    }
  }

  renderCategories() {
    const container = document.getElementById('categories');
    if (!container) {
      window.logger?.warn('HOME', 'categories container not found');
      return;
    }

    // Logic for Bento Grid: We need exactly 5 items to maintain layout integrity.
    // If we have fewer, we fill with placeholders.
    // If we have no data at all, we use a full placeholder set.

    let categoriesToRender = [];

    if (this.categories && this.categories.length > 0) {
      categoriesToRender = [...this.categories];
    }

    const placeholderPool = [
      { name: 'Jordan', image: 'https://images.unsplash.com/photo-1579338559194-a162d844a5fa?q=80&w=1000&auto=format&fit=crop', description: 'El legado continúa', slug: 'jordan' },
      { name: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', description: 'Just Do It', slug: 'nike' },
      { name: 'Adidas', image: 'https://images.unsplash.com/photo-1518002171953-a080ee322801?q=80&w=1000&auto=format&fit=crop', description: 'Three Stripes Life', slug: 'adidas' },
      { name: 'Yeezy', image: 'https://images.unsplash.com/photo-1582260611295-d2a9391d17cf?q=80&w=1000&auto=format&fit=crop', description: 'Futurismo puro', slug: 'yeezy' },
      { name: 'Streetwear', image: 'https://images.unsplash.com/photo-1523398002811-6ce9e490101d?q=80&w=1000&auto=format&fit=crop', description: 'Estilo Urbano', slug: 'streetwear' }
    ];

    // Check if we need to backfill
    const targetCount = 5;
    while (categoriesToRender.length < targetCount) {
      categoriesToRender.push(placeholderPool[categoriesToRender.length % placeholderPool.length]);
    }

    // Render exactly first 5
    container.innerHTML = categoriesToRender.slice(0, targetCount).map(category => {
      // Use API image or fallback based on slug
      const fallbackImage = this.getCategoryFallbackImage(category.slug);
      const image = category.image_url || category.image || fallbackImage;

      return `
        <div class="category-card" onclick="window.location.href='products.html?category=${category.slug}'" role="button" tabindex="0" aria-label="Ver productos de ${category.name}">
          <img class="category-card-bg" src="${image}" alt="${category.name}" loading="lazy">
            <h3>${this.escapeHtml(category.name)}</h3>
            <p>${this.escapeHtml(category.description || 'Explora esta colección')}</p>
          </div>
      `;
    }).join('');
  }

  getCategoryFallbackImage(slug) {
    const images = {
      'jordan': 'https://images.unsplash.com/photo-1695655455806-0568ee234f2d?q=80&w=800', // Jordan 1
      'nike': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800', // Nike Dunk
      'adidas': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800', // Adidas Forum
      'yeezy': 'https://images.unsplash.com/photo-1623940250060-498c8c67924d?q=80&w=800', // Yeezy 700
      'new-balance': 'https://images.unsplash.com/photo-1656335362192-2bc9051b1824?q=80&w=800',
      'vans': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800',
      'converse': 'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?q=80&w=800'
    };
    return images[slug] || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'; // Generic Sneaker
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
      slide.className = `slide${index === 0 ? ' active' : ''} `;
      slide.style.background = slideData.background_color || 'var(--primary)';
      if (slideData.image_url) {
        slide.style.backgroundImage = `linear - gradient(135deg, rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.3)), url('${slideData.image_url}')`;
        slide.style.backgroundSize = 'cover';
        slide.style.backgroundPosition = 'center';
      }

      const content = document.createElement('div');
      content.className = 'slide-content';

      // Nota: El campo 'eyebrow' no está en la BD actualmente
      // Si se necesita, agregar en una futura migración
      // if (slideData.eyebrow) {
      //   const eyebrow = document.createElement('span');
      //   eyebrow.className = 'slide-eyebrow';
      //   eyebrow.textContent = slideData.eyebrow;
      //   content.appendChild(eyebrow);
      // }

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
      dot.className = `slider - dot${index === 0 ? ' active' : ''} `;
      dot.setAttribute('aria-label', `Slide ${index + 1} `);
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
      < div class="benefit-card benefit-card--empty" >
        <div class="benefit-content">
          <h3>Pronto más beneficios</h3>
          <p>Configura beneficios desde el panel administrativo para mostrarlos aquí.</p>
        </div>
        </div >
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
      < div class="banner banner--placeholder" >
          <h3>Configura tus banners</h3>
          <p>Los banners que crees en el panel aparecerán automáticamente aquí.</p>
        </div >
      `;
      return;
    }

    container.innerHTML = this.homeBanners.slice(0, 3).map(banner => {
      const backgroundStyle = banner.image_url
        ? `style = "background-image:linear-gradient(135deg, rgba(15,23,42,0.7), rgba(15,23,42,0.25)), url('${banner.image_url}');"`
        : '';
      const gradientOnly = !banner.image_url && banner.background_color
        ? `style = "background:${banner.background_color};"`
        : '';
      const linkAttr = banner.button_link ? `data - link="${banner.button_link}"` : '';
      return `
      < article class="banner" ${backgroundStyle || gradientOnly} ${linkAttr}>
        <h3>${banner.title || 'Banner destacado'}</h3>
          ${banner.description ? `<p>${banner.description}</p>` : ''}
          ${banner.button_text ? `<span class="banner-cta">${banner.button_text}</span>` : ''}
        </article >
      `;
    }).join('');

    this.bindBannerClicks(container);
  }

  renderHomeSections() {
    const container = document.getElementById('homeSectionsContainer');
    if (!container) return;

    if (!this.homeSections.length) {
      container.innerHTML = `
      < div class="home-section-card home-section-card--empty" >
        <div class="home-section-content">
          <h3>Secciones personalizadas</h3>
          <p>Crea secciones desde el panel administrativo para destacar colecciones, categorías o campañas especiales.</p>
        </div>
        </div >
      `;
      return;
    }

    container.innerHTML = this.homeSections.map(section => {
      const settings = this.parseSettings(section.settings);
      const category = section.category_id ? this.getCategoryById(section.category_id) : null;
      const title = section.title || settings.title || (category ? category.name : this.getSectionTypeLabel(section.section_type));
      const description = settings.description || (category ? category.description : '');
      const ctaText = settings.cta_text || 'Ver colección';
      const link = settings.cta_link || (category ? `products.html ? category = ${category.slug} ` : 'products.html');
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
        </article >
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
    if (window.Components && window.Components.getProductCard) {
      return window.Components.getProductCard(product);
    }
    // Fallback if Components is not loaded for some reason (shouldn't happen due to head unification)
    console.warn('Components.getProductCard not available, using fallback');
    // ... logic ...
    return window.Components.getProductCard(product); // Assuming it is available now
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
      'jordan': 'fa-basketball-ball',
      'nike': 'fa-check',
      'adidas': 'fa-bars',
      'yeezy': 'fa-wind',
      'running': 'fa-running',
      'sport': 'fa-dumbbell',
      'casual': 'fa-shoe-prints',
      'limited': 'fa-fire',
      'sale': 'fa-tags',
      'accessories': 'fa-socks'
    };
    return icons[slug] || 'fa-box-open';
  }

  async addToCart(productId) {
    try {
      window.logger?.debug?.('HOME', `Intentando agregar producto al carrito: ${productId} `);
      window.logger?.debug?.('HOME', `cartManager existe: ${typeof window.cartManager} `);
      window.logger?.debug?.('HOME', `notifications existe: ${typeof window.notifications} `);

      await window.cartManager.add(productId, 1);
      window.logger?.success('HOME', `Producto agregado al carrito: ${productId} `);
      window.notifications.show('Producto agregado al carrito', 'success');
    } catch (error) {
      window.logger?.error('HOME', 'Error al agregar producto al carrito', error);
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
          window.location.href = `products.html ? search = ${encodeURIComponent(query)} `;
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
        btn.addEventListener('click', function (e) {
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

    // Flash Offers - Mejorar diseño (llamar después de cargar productos)
    // Se llamará después de cargar productos en oferta
  }

  async initFlashOffers() {
    // Llamar después de cargar productos en oferta
    await this.setupFlashOffers();
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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'subscriptionModalTitle');
    modal.setAttribute('aria-modal', 'true');
    modal.style.display = 'flex';
    modal.innerHTML = `
      < div class="modal-content" style = "max-width: 500px;" >
        <span class="modal-close" onclick="this.closest('.modal').remove()" aria-label="Cerrar modal de suscripción" tabindex="0" role="button">&times;</span>
        <h2 id="subscriptionModalTitle" style="margin-bottom: 16px;">¡Suscríbete y obtén 10% de descuento!</h2>
        <p style="margin-bottom: 24px; color: #666;">Recibe ofertas exclusivas, novedades y tu código de descuento por email.</p>
        <form id="subscriptionForm" onsubmit="event.preventDefault(); window.homeManager.handleSubscriptionForm(event);">
          <div class="form-group">
            <label for="subscriptionEmail" class="sr-only">Email para suscripción</label>
            <input type="email" id="subscriptionEmail" placeholder="tu@email.com" required aria-required="true" aria-label="Email para suscripción" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Suscribirme</button>
        </form>
        <p style="margin-top: 16px; font-size: 12px; color: #999; text-align: center;">
          Al suscribirte, aceptas recibir comunicaciones comerciales de FutureLabs.
        </p>
      </div >
      `;
    document.body.appendChild(modal);

    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Cerrar con ESC
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

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
      window.logger?.error('HOME', 'Error en suscripción', error);
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
      window.notifications?.success(`¡Te has suscrito con ${email} !Pronto recibirás tu código de descuento del 10 %.`);

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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'contactModalTitle');
    modal.setAttribute('aria-modal', 'true');
    modal.style.display = 'flex';
    modal.innerHTML = `
      < div class="modal-content" style = "max-width: 600px;" >
        <span class="modal-close" onclick="this.closest('.modal').remove()" aria-label="Cerrar modal de ayuda" tabindex="0" role="button">&times;</span>
        <h2 id="contactModalTitle" style="margin-bottom: 16px;"><i class="fas fa-comments" aria-hidden="true"></i> ¿Necesitas ayuda?</h2>
        <p style="margin-bottom: 24px; color: #666;">Estamos aquí para ayudarte. Elige cómo prefieres contactarnos:</p>
        <nav style="display: grid; gap: 16px;" role="navigation" aria-label="Opciones de contacto">
          <a href="contact.html" class="btn btn-outline" style="text-align: left; padding: 16px;" aria-label="Enviar un email de contacto">
            <i class="fas fa-envelope" aria-hidden="true"></i> Envíanos un email
          </a>
          <a href="faq.html" class="btn btn-outline" style="text-align: left; padding: 16px;" aria-label="Ver preguntas frecuentes">
            <i class="fas fa-question-circle" aria-hidden="true"></i> Ver preguntas frecuentes
          </a>
          <button class="btn btn-outline" type="button" onclick="this.closest('.modal').remove(); window.location.href='contact.html';" style="text-align: left; padding: 16px;" aria-label="Ver información de contacto">
            <i class="fas fa-phone" aria-hidden="true"></i> Información de contacto
          </button>
        </nav>
        <p style="margin-top: 24px; font-size: 12px; color: #999; text-align: center;">
          El servicio de chat en vivo estará disponible próximamente.
        </p>
      </div >
      `;
    document.body.appendChild(modal);

    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    });

    // Cerrar con ESC
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
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
      < div class="flash-offers-grid" style = "display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 24px;" role = "list" aria - label="Ofertas flash disponibles" >
        ${products.map((product, index) => {
          const discount = product.discount_price ?
            Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

          return `
                <article class="flash-offer-card" role="listitem" onclick="window.location.href='product-detail.html?id=${product.id}'" onkeypress="if(event.key==='Enter') window.location.href='product-detail.html?id=${product.id}'" tabindex="0" aria-label="Oferta flash: ${this.escapeHtml(product.name)} con ${discount}% de descuento" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; cursor: pointer; transition: transform 0.2s;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;" aria-label="${discount} por ciento de descuento">-${discount}%</span>
                    <i class="fas fa-fire" aria-hidden="true" style="font-size: 24px; opacity: 0.8;"></i>
                  </div>
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${this.escapeHtml(product.name)}</h3>
                  <p style="margin: 0 0 16px 0; opacity: 0.9; font-size: 14px;">${this.escapeHtml(product.brand)}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      ${product.discount_price ? `
                        <span style="text-decoration: line-through; opacity: 0.7; font-size: 14px;" aria-label="Precio original">S/ ${parseFloat(product.price).toFixed(2)}</span>
                        <span style="display: block; font-size: 24px; font-weight: 700;" aria-label="Precio con descuento">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                      ` : `
                        <span style="font-size: 24px; font-weight: 700;">S/ ${parseFloat(product.price).toFixed(2)}</span>
                      `}
                    </div>
                    <button class="btn" type="button" aria-label="Ver detalles de ${this.escapeHtml(product.name)}" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;" onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${product.id}'">
                      Ver oferta
                    </button>
                  </div>
                </article>
              `;
        }).join('')
          }
          </div >
      <div style="text-align: center; margin-top: 24px;">
        <a href="products.html?on_sale=true" class="btn btn-primary">Ver todas las ofertas</a>
      </div>
    `;
      } else {
        // Si no hay ofertas, mostrar mensaje mejorado
        flashSection.innerHTML = `
      < div style = "text-align: center; padding: 40px 20px;" >
            <i class="fas fa-fire" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5; color: #ff6b6b;"></i>
            <p style="font-size: 16px; margin: 0; color: #666;">No hay ofertas flash disponibles en este momento</p>
            <p style="font-size: 14px; margin-top: 8px; color: #999;">Suscríbete para ser el primero en enterarte de nuestras próximas promociones</p>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="document.querySelector('.sticky-footer .cta-button')?.click();">
              Suscribirme
            </button>
          </div >
      `;
      }
    } catch (error) {
      window.logger?.error('HOME', 'Error cargando flash offers', error);
      flashSection.innerHTML = `
      < div style = "text-align: center; padding: 40px 20px; color: #999;" >
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; margin: 0;">Error al cargar ofertas flash</p>
          <a href="products.html?on_sale=true" class="btn btn-outline" style="margin-top: 16px;">Ver ofertas disponibles</a>
        </div >
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
        window.logger?.warn('HOME', 'Mega menu containers not found');
        return;
      }

      // Renderizar categorías en la columna izquierda
      categoriesColumn.innerHTML = this.categories.slice(0, 8).map((category, index) => `
      < div class="category-item ${index === 0 ? 'active' : ''}" data - category="${category.slug}" >
          <span class="category-text">${this.escapeHtml(category.name)}</span>
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
          <div class="active-indicator"></div>
        </div >
      `).join('');

      // Renderizar contenido de categorías
      contentColumn.innerHTML = this.categories.slice(0, 8).map((category, index) => {
        // Obtener subcategorías si existen (por ahora, usar placeholder)
        const subcategories = this.getSubcategoriesForCategory(category);

        return `
      < div class="category-content ${index === 0 ? 'active' : ''}" data - category="${category.slug}" >
            <div class="content-header">
              <h2>${this.escapeHtml(category.name)}</h2>
              <a href="products.html?category=${category.slug}" class="view-all">Ver todo <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
            </div>
            <div class="subcategories-grid">
              ${this.renderSubcategoriesGrid(category, subcategories)}
            </div>
          </div >
      `;
      }).join('');

      // Reinicializar event listeners del megamenú
      this.setupMegaMenuListeners();

      window.logger?.success('HOME', 'Mega menu cargado dinámicamente');
    } catch (error) {
      window.logger?.error('HOME', 'Error cargando mega menu', error);
      // No mostrar error al usuario, el menú seguirá funcionando con categorías hardcodeadas si existen
    }
  }

  getSubcategoriesForCategory(category) {
    // Por ahora, retornar subcategorías genéricas basadas en el slug
    // TODO: Implementar subcategorías reales desde la BD
    const subcategoriesMap = {
      'jordan': [
        { title: 'Retro High', items: ['Jordan 1', 'Jordan 3', 'Jordan 4'] },
        { title: 'Mid & Low', items: ['Jordan 1 Mid', 'Jordan 1 Low', 'Legacy 312'] },
        { title: 'Colaboraciones', items: ['Travis Scott', 'Union LA', 'Off-White'] }
      ],
      'yeezy': [
        { title: 'Modelos Populares', items: ['Yeezy Boost 350', 'Yeezy 500', 'Yeezy 700'] },
        { title: 'Slides & Foam', items: ['Yeezy Slide', 'Foam Runner'] }
      ],
      'nike': [
        { title: 'Air Max', items: ['Air Max 1', 'Air Max 90', 'Air Max 97'] },
        { title: 'Icons', items: ['Air Force 1', 'Dunk Low', 'Dunk High', 'Blazer'] },
        { title: 'Running', items: ['Pegasus', 'Vaporfly', 'Alphafly'] }
      ],
      'adidas': [
        { title: 'Originals', items: ['Samba', 'Gazelle', 'Superstar', 'Stan Smith'] },
        { title: 'Performance', items: ['Ultraboost', 'Adizero', '4D'] },
        { title: 'Bad Bunny', items: ['Campus', 'Forum', 'Response CL'] }
      ]
    };

    return subcategoriesMap[category.slug] || [
      { title: 'Productos', items: ['Ver todos los productos'] }
    ];
  }

  renderSubcategoriesGrid(category, subcategories) {
    if (!subcategories || subcategories.length === 0) {
      return `
      < div class="subcategory-column" >
          <h3>Productos</h3>
          <ul>
            <li><a href="products.html?category=${category.slug}">Ver todos los productos</a></li>
          </ul>
        </div >
      `;
    }

    return subcategories.map(sub => `
      < div class="subcategory-column" >
        <h3>${this.escapeHtml(sub.title)}</h3>
        <ul>
          ${sub.items.map(item => `
            <li><a href="products.html?category=${category.slug}&search=${encodeURIComponent(item)}">${this.escapeHtml(item)}</a></li>
          `).join('')}
        </ul>
      </div >
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
        const content = document.querySelector(`.category - content[data - category="${category}"]`);
        if (content) {
          content.classList.add('active');
        }
      });
    });

    // Hover para desktop
    if (window.innerWidth > 768) {
      categoryItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
          const category = this.getAttribute('data-category');

          if (!this.classList.contains('active')) {
            categoryItems.forEach(i => i.classList.remove('active'));
            categoryContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const content = document.querySelector(`.category - content[data - category="${category}"]`);
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

// ==========================================
// Quick View Logic
// ==========================================
window.currentQuickViewProduct = null;

window.openQuickView = async function (productId) {
  const modal = document.getElementById('quickViewModal');
  if (!modal) return;

  // Show active state immediately (maybe show spinner later?)
  modal.classList.add('active');

  try {
    // Try to get full product details if API supports it
    let product = null;

    // First check if we have it in memory (from homeManager)
    if (window.homeManager && window.homeManager.products) {
      product = window.homeManager.products.find(p => p.id == productId);
    }

    if (!product) {
      // Fetch from API
      const response = await window.api.getProduct(productId);
      if (response.success) {
        product = response.data;
      }
    }

    if (product) {
      window.currentQuickViewProduct = product;

      // Populate Modal
      const img = document.getElementById('qvImage');
      img.src = product.image_url || 'assets/images/products/placeholder.jpg';
      img.onerror = () => { img.src = 'assets/images/products/placeholder.jpg'; };

      document.getElementById('qvBrand').textContent = product.brand || 'Sneakers Shop';
      document.getElementById('qvTitle').textContent = product.name;

      const priceHtml = product.discount_price
        ? `< span class="text-red-600" > S / ${parseFloat(product.discount_price).toFixed(2)}</span > <span class="original-price" style="text-decoration: line-through; color: #999; font-size: 0.8em;">S/ ${parseFloat(product.price).toFixed(2)}</span>`
        : `S / ${parseFloat(product.price).toFixed(2)} `;
      document.getElementById('qvPrice').innerHTML = priceHtml;

      document.getElementById('qvDescription').textContent = product.description || 'Sin descripción disponible.';
      document.getElementById('qvFullDetails').href = `product - detail.html ? id = ${product.id} `;
    }
  } catch (error) {
    console.error('Error loading quick view:', error);
  }
};

window.closeQuickView = function () {
  const modal = document.getElementById('quickViewModal');
  if (modal) {
    modal.classList.remove('active');
    window.currentQuickViewProduct = null;
  }
};

window.addToCartFromQuickView = function () {
  if (!window.currentQuickViewProduct) return;

  // For quick view, we redirect to PDP to ensure size selection is handled correctly
  // or if we had a size selector here we could add directly.
  // Given the "Winning" goal, redirecting is safer UX than adding without size.
  window.location.href = `product - detail.html ? id = ${window.currentQuickViewProduct.id} `;
};

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('quickViewModal');
  if (e.target === modal) {
    window.closeQuickView();
  }
});

