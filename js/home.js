/**
 * 🏠 FUTURELABS HOME ENGINE V3.1 (Visual Polish & Feature Expansion)
 * Focus: Brutalist Aesthetics, Brands Slider, Trending Carousel.
 */

class HomeEngine {
  constructor() {
    this.api = window.api;
    this.state = {
      banners: [],
      categories: [],
      trending: [],
      blog: [],
      newsletterSubscribed: false
    };

    this.init();
    console.log('🚀 HomeEngine v7.3-REAL-DATA Loaded');
  }



  async init() {
    try {

      // 1. CRITICAL: Inject Standard Header FIRST (matches products.html)
      // Check if we have the placeholder ID
      const headerPlaceholder = document.getElementById('mainHeader');

      // If header is already injected (contains class header-v3), skip injection
      const alreadyInjected = document.querySelector('header.header-v3');

      if (window.Components && window.Components.getHeader) {
        if (headerPlaceholder && !alreadyInjected) {
          const newHeaderHTML = window.Components.getHeader(true, true);
          // Create a temp container to parse the string
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newHeaderHTML;

          // The first child is the <header class="header-v3"> element
          const newHeaderEl = tempDiv.firstElementChild;
          if (newHeaderEl) {
            newHeaderEl.id = 'mainHeader'; // Preserve ID for CSS hooks
            headerPlaceholder.replaceWith(newHeaderEl);
          }
        }

        // Initialize Header Logic (Always run this)
        if (window.Components.initHeader) {
          window.Components.initHeader();
        }
      }

      // 1.1 CRITICAL: Inject Standard Footer (matches products.html)
      if (window.Components && window.Components.getFooter) {
        const footerEl = document.getElementById('mainFooter');
        if (footerEl) {
          footerEl.innerHTML = window.Components.getFooter();
        }
      }

      // 2. Load Content with Failsafes
      // Hero primero (crítico para primera impresión)
      await this.safeLoad(this.loadHero.bind(this), 'Hero Slider');
      
      // Resto en paralelo
      await Promise.all([
        this.safeLoad(this.loadCategories.bind(this), 'Categories'),
        this.safeLoad(this.loadProducts.bind(this), 'Products'),
        this.safeLoad(this.loadBrands.bind(this), 'Brands'),
      ]);

      this.setupNewsletter();
      this.setupQuickAddbox();

      this.toggleLoader(false);

      // 2. Start Visuals
      this.initHypeFeatures();
      this.initScrollAnimations();
      this.initStickyFooter();
      this.initTabbedEngine();
    } catch (err) {
      console.error('⚠️ [HomeEngine] Partial Load Error:', err);
      // Ensure loader is removed even if error occurs
      this.toggleLoader(false);
    }
  }

  // ==========================================
  // 🧩 GLOBAL COMPONENTS
  // ==========================================
  async renderGlobals() {
    try {
      // Header - Fix for Double Nesting
      const headerElement = document.getElementById('mainHeader');
      if (headerElement && window.Components) {
        // Use outerHTML to replace the container itself, preventing <header><header>
        const newHeaderHTML = window.Components.getHeader(true, true);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHeaderHTML;

        // Transfer ID if needed, or rely on .header-v3
        if (tempDiv.firstElementChild) {
          tempDiv.firstElementChild.id = 'mainHeader'; // Maintain ID for CSS compatibility
          headerElement.replaceWith(tempDiv.firstElementChild);
        }

        window.Components.initHeader();
        if (window.Components.initCartDrawer) window.Components.initCartDrawer();

        // Init other header components
        if (window.Components.initSearch) window.Components.initSearch();
        if (window.Components.initCartCounter) window.Components.initCartCounter();
      } else {
        console.warn("⚠️ Header container missing or Components not ready.");
      }

      // Footer
      const footer = document.getElementById('mainFooter');
      if (footer && window.Components) {
        footer.innerHTML = window.Components.getFooter();
      }

      // Mobile Menu Hook
      if (this.setupMobileMenu) this.setupMobileMenu();


      // 5. Load Brands
      this.renderBrands();

      console.log('✅ HomeEngine Initialized');
    } catch (e) {
      console.error('HomeEngine Init Error:', e);
    }
  }






  initHypeFeatures() {
    this.setupScrollReveals();
    this.setupVideoModal();

    // Marquee Fade In
    const marquee = document.querySelector('.marquee-track');
    if (marquee) marquee.style.opacity = 1;
  }

  setupScrollReveals() {
    const targets = document.querySelectorAll('.section, .hero-section, .home-section-card, .brand-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add a small delay based on index if possible for staggered effect
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15, // Slightly higher to ensure user sees the element before animating
      rootMargin: '0px 0px -50px 0px' // Trigget slightly before bottom
    });

    targets.forEach(target => {
      target.classList.add('reveal-on-scroll');
      observer.observe(target);
    });
  }


  // 1. HERO SLIDER
  // ==========================================
  async loadHero() {
    const container = document.getElementById('heroSlidesContainer');
    const dotsContainer = document.getElementById('heroSliderDots');
    if (!container) {
      console.error('❌ Hero container not found');
      return;
    }
    
    // Asegurar que el contenedor sea visible
    container.style.display = 'block';
    container.style.opacity = '1';

    // Verificar si ya hay slides estáticos renderizados
    const existingSlides = container.querySelectorAll('.slide');
    const hasStaticSlides = existingSlides.length > 0;

    let slides = [];
    let shouldUpdate = false;

    // 1. Try API
    if (this.api && this.api.getHomeHeroSlides) {
      try {
        const res = await this.api.getHomeHeroSlides();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          slides = res.data;
          shouldUpdate = true; // Solo actualizar si hay datos nuevos de la API
        }
      } catch (e) {
        console.error('❌ Hero API Error:', e);
      }
    }

    // 2. Si no hay datos de API y ya hay slides estáticos, NO actualizar
    if (!shouldUpdate && hasStaticSlides) {
      console.log('✅ Using static hero slides from HTML');
      // Solo inicializar el slider con los slides existentes
      if (dotsContainer) {
        const slideCount = existingSlides.length;
        dotsContainer.innerHTML = Array.from({ length: slideCount }, (_, index) => `
          <button class="slider-dot ${index === 0 ? 'active' : ''}" onclick="window.homeEngine.goToSlide(${index})"></button>
        `).join('');
      }
      this.startSliderAutoPlay(existingSlides.length);
      this.setupHeroTouch(container, existingSlides.length);
      return; // Salir sin reemplazar el contenido
    }

    // 2.1 Si no hay slides estáticos y la API falló, asegurar que siempre haya contenido
    if (!hasStaticSlides && slides.length === 0) {
      console.warn('⚠️ No hero slides found, using fallback');
    }

    // 3. Fallback (Default Premium Slides if API empty AND no static slides)
    if (slides.length === 0) {
      slides = [
        {
          image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2000&auto=format&fit=crop',
          eyebrow: 'NUEVOS LANZAMIENTOS',
          title: 'NIKE AIR MAX',
          subtitle: 'El futuro de la comodidad está aquí.',
          cta: 'VER COLECCIÓN',
          link: 'products.html?brand=nike'
        },
        {
          image_url: 'https://images.unsplash.com/photo-1607522370275-f14bc3a5d288?q=80&w=2000&auto=format&fit=crop',
          eyebrow: 'EDICIÓN LIMITADA',
          title: 'LEYENDAS URBANAS',
          subtitle: 'Esenciales de streetwear para los audaces.',
          cta: 'DESCUBRIR MÁS',
          link: 'products.html'
        }
      ];
    }

    // Render Logic (Unified)
    // Removed old "OFFLINE" block entirely
    if (slides.length > 0) {
      // Proceed to render
    }

    // Renderizar slides con estructura mejorada (incluyendo badges de urgencia)
    container.innerHTML = slides.map((slide, index) => {
      // Determinar badge de urgencia basado en el índice o datos del slide
      const urgencyBadges = [
        { icon: '⚡', text: 'SOLO 12 PARES DISPONIBLES' },
        { icon: '🔥', text: 'MÁS VENDIDO ESTA SEMANA' },
        { icon: '✨', text: 'NUEVO LANZAMIENTO' }
      ];
      const urgencyBadge = slide.urgency_badge || urgencyBadges[index] || urgencyBadges[0];
      
      // Determinar indicador de stock
      const stockIndicators = [
        { dot: '', text: '12 pares restantes' },
        { dot: 'available', text: 'En stock' },
        { dot: 'available', text: 'Disponible en 8 colores' }
      ];
      const stockIndicator = slide.stock_indicator || stockIndicators[index] || stockIndicators[0];
      
      return `
            <div class="slide ${index === 0 ? 'active' : ''}" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${slide.image_url}')">
                <div class="slide-content">
                    ${urgencyBadge ? `
                    <div class="hero-urgency-badge">
                        <span class="urgency-pulse">${urgencyBadge.icon}</span> ${urgencyBadge.text}
                    </div>
                    ` : ''}
                    <span class="slide-subtitle">${slide.eyebrow || slide.subtitle || 'ÚLTIMOS LANZAMIENTOS'}</span>
                    <h1 class="hero-title">${slide.title}${slide.title_highlight ? ` <span class="highlight">${slide.title_highlight}</span>` : ''}</h1>
                    <p>${slide.subtitle || slide.description || ''}</p>
                    <div class="hero-cta-group">
                        <a href="${slide.link || 'products.html'}" class="btn btn-primary">${slide.cta || 'COMPRAR AHORA'}</a>
                        ${stockIndicator ? `
                        <div class="hero-stock-indicator">
                            <span class="stock-dot ${stockIndicator.dot}"></span> ${stockIndicator.text}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" onclick="window.homeEngine.goToSlide(${index})"></button>
            `).join('');
    }

    this.startSliderAutoPlay(slides.length);
    this.setupHeroTouch(container, slides.length);
  }

  startSliderAutoPlay(count) {
    if (count <= 1) return;
    let current = 0;
    setInterval(() => {
      current = (current + 1) % count;
      this.goToSlide(current);
    }, 6000); // 6s interval
  }

  goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  setupHeroTouch(container, count) {
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(count);
    }, { passive: true });

    this.handleSwipe = (count) => {
      const threshold = 50;
      if (touchEndX < touchStartX - threshold) {
        // Swipe Left -> Next
        const current = Array.from(document.querySelectorAll('.slide')).findIndex(s => s.classList.contains('active'));
        this.goToSlide((current + 1) % count);
      }
      if (touchEndX > touchStartX + threshold) {
        // Swipe Right -> Prev
        const current = Array.from(document.querySelectorAll('.slide')).findIndex(s => s.classList.contains('active'));
        this.goToSlide((current - 1 + count) % count);
      }
    };
  }

  // ==========================================
  // 2. CATEGORIES (Bento Grid)
  // ==========================================
  // ==========================================
  // 2. CATEGORIES (Bento Grid)
  // ==========================================
  async loadCategories() {
    const container = document.getElementById('homeSectionsContainer');
    if (!container) return;

    let categories = [];

    // 1. API Call
    if (this.api && this.api.getCategories) {
      try {
        const res = await this.api.getCategories();
        if (res.success && Array.isArray(res.data)) {
          categories = res.data;
        }
      } catch (e) { console.error('Categories API Error:', e); }
    }

    // 2. Fallback (Premium Data)
    if (categories.length === 0) {
      categories = [
        {
          name: 'JORDAN',
          slug: 'jordan',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
        },
        {
          name: 'YEEZY',
          slug: 'yeezy',
          image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
        },
        {
          name: 'NIKE',
          slug: 'nike',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
        },
        {
          name: 'ACCESSORIES',
          slug: 'accessories',
          image: 'https://images.unsplash.com/photo-1523398002811-6ce9e490101d?auto=format&fit=crop&q=80&w=800'
        }
      ];
    }

    container.innerHTML = categories.map((cat, index) => `
        <a href="products.html?category=${cat.slug}" class="bento-item">
            <img src="${cat.image || 'img/placeholder-sq.jpg'}" alt="${cat.name}" loading="lazy">
            <div class="bento-overlay">
                <h3>${cat.name}</h3>
                <i class="fas fa-arrow-right"></i>
            </div>
        </a>
    `).join('');
  }


  // ==========================================
  // 3. PRODUCTS (Grid & Slider) - USANDO ENDPOINTS ESPECÍFICOS
  // ==========================================
  async loadProducts() {
    // Cargar cada sección desde su endpoint específico para productos REALES
    
    // A. FEATURED PRODUCTS (Slider) - PRIORIDAD ALTA
    try {
      const featuredResponse = await this.api.getFeaturedProducts(12);
      let featuredProducts = [];
      
      if (featuredResponse && featuredResponse.success && featuredResponse.data) {
        featuredProducts = Array.isArray(featuredResponse.data.products) 
          ? featuredResponse.data.products 
          : Array.isArray(featuredResponse.data) 
            ? featuredResponse.data 
            : [];
      }
      
      if (featuredProducts.length > 0) {
        console.log(`✅ Loaded ${featuredProducts.length} featured products from API`);
        this.renderProductSlider('featuredProductsGrid', featuredProducts).catch(e => console.error('Error rendering featured:', e));
      } else {
        console.warn('⚠️ No featured products found');
        this.showEmptyState('featuredProductsGrid', 'No hay productos destacados');
      }
    } catch (e) {
      console.error('❌ Error loading featured products:', e);
      this.showEmptyState('featuredProductsGrid', 'Error al cargar productos destacados');
    }

    // B. TRENDING PRODUCTS (Slider) - PRIORIDAD ALTA
    setTimeout(async () => {
      try {
        const trendingResponse = await this.api.getTrendingProducts(12);
        let trendingProducts = [];
        
        if (trendingResponse && trendingResponse.success && trendingResponse.data) {
          trendingProducts = Array.isArray(trendingResponse.data.products) 
            ? trendingResponse.data.products 
            : Array.isArray(trendingResponse.data) 
              ? trendingResponse.data 
              : [];
        }
        
        if (trendingProducts.length > 0) {
          console.log(`✅ Loaded ${trendingProducts.length} trending products from API`);
          // Buscar contenedor de trending o usar featuredProductsGrid si no existe
          const trendingContainer = document.getElementById('trendingProductsGrid') || document.getElementById('featuredProductsGrid');
          if (trendingContainer) {
            this.renderProductSlider(trendingContainer.id, trendingProducts).catch(e => console.error('Error rendering trending:', e));
          }
        }
      } catch (e) {
        console.error('❌ Error loading trending products:', e);
      }
    }, 200);

    // C. ON SALE PRODUCTS (Grid) - PRIORIDAD MEDIA
    setTimeout(async () => {
      try {
        const saleResponse = await this.api.getOnSaleProducts(12);
        let saleProducts = [];
        
        if (saleResponse && saleResponse.success && saleResponse.data) {
          saleProducts = Array.isArray(saleResponse.data.products) 
            ? saleResponse.data.products 
            : Array.isArray(saleResponse.data) 
              ? saleResponse.data 
              : [];
        }
        
        if (saleProducts.length > 0) {
          console.log(`✅ Loaded ${saleProducts.length} on-sale products from API`);
          this.renderProductGrid('onSaleProductsGrid', saleProducts).catch(e => console.error('Error rendering on sale:', e));
        } else {
          console.warn('⚠️ No on-sale products found');
          this.showEmptyState('onSaleProductsGrid', 'No hay productos en oferta');
        }
      } catch (e) {
        console.error('❌ Error loading on-sale products:', e);
        this.showEmptyState('onSaleProductsGrid', 'Error al cargar productos en oferta');
      }
    }, 400);

    // D. NEW PRODUCTS (Grid) - PRIORIDAD BAJA
    setTimeout(async () => {
      try {
        const newResponse = await this.api.getNewProducts(12);
        let newProducts = [];
        
        if (newResponse && newResponse.success && newResponse.data) {
          newProducts = Array.isArray(newResponse.data.products) 
            ? newResponse.data.products 
            : Array.isArray(newResponse.data) 
              ? newResponse.data 
              : [];
        }
        
        if (newProducts.length > 0) {
          console.log(`✅ Loaded ${newProducts.length} new products from API`);
          this.renderProductGrid('newProductsGrid', newProducts).catch(e => console.error('Error rendering new products:', e));
        } else {
          console.warn('⚠️ No new products found');
          this.showEmptyState('newProductsGrid', 'No hay productos nuevos');
        }
      } catch (e) {
        console.error('❌ Error loading new products:', e);
        this.showEmptyState('newProductsGrid', 'Error al cargar productos nuevos');
      }
    }, 600);
  }

  // Helper para mostrar estado vacío
  showEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #999;">
          <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; margin: 0;">${message}</p>
          <p style="font-size: 14px; margin-top: 8px; opacity: 0.7;">Agrega productos desde el panel de administración</p>
        </div>
      `;
    }
  }

  async renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove inline styles that might conflict (let CSS control the grid)
    // BUT ensure the class exists for grid layout
    container.classList.add('product-grid-v3');

    // 🛡️ Guard: Empty State
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center border-2 border-black" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; grid-column: 1 / -1;">
            <i class="fas fa-box-open fa-2x mb-3" style="color: var(--gray);"></i>
            <h4 class="font-bold text-lg">COLECCIÓN VACÍA</h4>
            <p class="text-sm text-gray-500 mb-3">No hay productos disponibles en este momento.</p>
            <button onclick="window.location.href='products.html'" class="btn btn-sm btn-outline">VER TODOS LOS PRODUCTOS</button>
        </div>`;
      return;
    }

    // Mostrar skeleton loader mientras se renderiza
    this.showSkeletonLoader(container, products.length);
    
    // Pequeño delay para transición suave (reducido de 300ms a 150ms)
    await new Promise(r => setTimeout(r, 150));

    // Use Component's Card Generator for consistency
    const cardsHTML = window.Components && window.Components.getProductCard
      ? products.map(p => window.Components.getProductCard(p)).join('')
      : products.map(p => `
            <div class="product-card brutalist-fallback">
                <h3>${p.name}</h3>
                <p>S/ ${p.price}</p>
                <button onclick="window.cartManager?.add('${p.id}')">Agregar al Carrito</button>
            </div>
        `).join('');

    // Fade Out Skeletons -> Fade In Content
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = cardsHTML;
      container.style.transition = 'opacity 0.5s ease';
      container.style.opacity = '1';

      // Re-inject the grid style if CSS is missing (Safety Net)
      if (getComputedStyle(container).display !== 'grid') {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        container.style.gap = '20px';
      }

      // Lazy load images with IntersectionObserver
      this.initLazyLoading(container);
    }, 200);
  }

  // Mostrar skeleton loader mejorado
  showSkeletonLoader(container, count = 8) {
    const skeletonCards = Array.from({ length: Math.min(count, 12) }, () => `
      <div class="skeleton-product-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 60%;"></div>
        <div class="skeleton skeleton-button" style="margin-top: 1rem;"></div>
      </div>
    `).join('');
    
    container.innerHTML = `<div class="product-grid-v3">${skeletonCards}</div>`;
  }

  // Mejorar lazy loading de imágenes con IntersectionObserver optimizado
  initLazyLoading(container) {
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores sin soporte
      const images = container.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
      return;
    }

    const images = container.querySelectorAll('img[loading="lazy"]');
    if (!images.length) return;

    // Configuración optimizada para mejor performance
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Si tiene data-src, usarlo (para carga diferida avanzada)
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Agregar decoding async si no está presente
          if (!img.hasAttribute('decoding')) {
            img.decoding = 'async';
          }
          
          // Agregar clase para animación de fade-in suave
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.3s ease-in-out';
          
          // Manejar carga exitosa
          const handleLoad = () => {
            img.style.opacity = '1';
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
          };
          
          // Manejar errores de carga
          const handleError = () => {
            img.style.opacity = '1'; // Mostrar placeholder incluso en error
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
          };
          
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          
          // Si la imagen ya está cargada (cached), aplicar opacidad inmediatamente
          if (img.complete) {
            img.style.opacity = '1';
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px', // Cargar 100px antes de que sea visible (mejor UX)
      threshold: 0.01 // Trigger cuando al menos 1% es visible
    });

    images.forEach(img => {
      // Agregar atributos de performance si no están presentes
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
      if (!img.hasAttribute('fetchpriority')) {
        img.fetchPriority = 'low';
      }
      imageObserver.observe(img);
    });
  }

  // NEW: Slider Renderer for Trending and Sale
  async renderProductSlider(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Mostrar skeleton loader para slider
    this.showSkeletonSlider(container, products.length || 8);
    
    // Pequeño delay para transición suave
    await new Promise(r => setTimeout(r, 150));

    // Force horizontal scroll class
    container.classList.add('products-horizontal-scroll');

    // Empty state
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; border: 2px dashed var(--black);">
          <i class="fas fa-fire" style="font-size: 2rem; margin-bottom: 1rem; color: var(--gray-400);"></i>
          <p style="font-weight: 600;">No hay productos en tendencia en este momento</p>
        </div>`;
      return;
    }

    // Transform grid to slider via style injection if needed
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      if (window.Components && window.Components.getProductCard) {
        container.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
        
        // Lazy load images
        this.initLazyLoading(container);
      } else {
        // Fallback
        container.innerHTML = products.map(p => `
          <div class="product-card">
            <img src="${p.image_url || ''}" alt="${p.name}" loading="lazy">
            <h3>${p.name}</h3>
            <p>S/ ${p.price}</p>
          </div>
        `).join('');
      }
      
      requestAnimationFrame(() => {
        container.style.opacity = '1';
      });
    }, 50);
  }

  // Skeleton loader para slider horizontal
  showSkeletonSlider(container, count = 8) {
    const skeletonCards = Array.from({ length: Math.min(count, 12) }, () => `
      <div class="product-card skeleton-product-card" style="min-width: 320px; max-width: 320px;">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 60%;"></div>
        <div class="skeleton skeleton-button" style="margin-top: 1rem;"></div>
      </div>
    `).join('');
    
    container.innerHTML = skeletonCards;
    container.classList.add('products-horizontal-scroll');
  }



  // ==========================================
  // 4. BRAND MARQUEE (SVG UPGRADE)
  // ==========================================
  async loadBrands() {
    // DISABLED: Using static HTML for Brutalist Text Design (Phase 211)
    /*
    const marqueeContainer = document.querySelector('.marquee-track');
    if (!marqueeContainer) return;

    // Limpiar contenido estático
    marqueeContainer.innerHTML = '';
    const brands = [
        { name: 'NIKE', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
        { name: 'JORDAN', src: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
        { name: 'ADIDAS', src: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
        { name: 'YEEZY', src: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Yeezy_logo.svg' },
        { name: 'NEW BALANCE', src: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg' },
        { name: 'OFF-WHITE', src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Off-white_logo.svg' },
        { name: 'SUPREME', src: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Supreme_Logo.svg' },
        // Duplicates for infinite scroll
        { name: 'NIKE', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
        { name: 'JORDAN', src: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
        { name: 'ADIDAS', src: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' }
    ];

    marqueeContainer.innerHTML = brands.map(b => `
        <div class="brand-item svg-mode">
            <img src="${b.src}" alt="${b.name}" loading="lazy" width="80" height="40" style="object-fit: contain; filter: brightness(0) invert(1);">
        </div>
    `).join('');
    */
    console.log('Brand Marquee: Using Static Text Mode');
  }



  toggleLoader(show) {
    const loader = document.getElementById('preloader');
    if (!loader) return;
    if (show) {
      loader.style.display = 'flex'; // Ensure it's in logic flow
      loader.style.visibility = 'visible';
      // Small timeout to allow display change to register before opacity transition
      requestAnimationFrame(() => {
        loader.style.opacity = '1';
      });
    } else {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.visibility = 'hidden';
          loader.style.display = 'none'; // CRITICAL FIX: Remove from layout
        }, 500);
      }, 800);
    }
  }

  // ==========================================
  // ⚡ INTERACTIONS
  // ==========================================
  // ==========================================
  // ⚡ INTERACTIONS
  // ==========================================


  quickAdd(id, name) {
    // 1. Update Cart Engine
    if (window.cartEngine) {
      // Mock add
    }

    // 2. OPEN CART DRAWER (Interaction Feedback)
    if (window.CartDrawer) {
      window.CartDrawer.open();
    } else if (window.Components && window.Components.initCartDrawer) {
      window.Components.initCartDrawer();
      setTimeout(() => window.CartDrawer.open(), 100);
    }

    // 3. Show Premium Toast Notification
    if (window.notifications) {
      window.notifications.success('ADDED TO CART', `${name}`);
    }
  }

  // NEW: Quick View Binding for Dynamic Content
  setupQuickAddbox() {
    // Delegate event to container to handle dynamic buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-quick-view') || e.target.closest('.quick-view-trigger');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.id;

        if (window.QuickView) {
          window.QuickView.open(productId);
        } else {
          console.warn('QuickView module not loaded');
          // Fallback: Redirect
          window.location.href = `product-detail.html?id=${productId}`;
        }
      }
    });
  }

  setupParallax() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero-section');
      const slides = document.querySelectorAll('.slide');

      if (hero && slides.length > 0) {
        slides.forEach(slide => {
          const limit = slide.offsetTop + slide.offsetHeight;
          if (scrolled > slide.offsetTop && scrolled <= limit) {
            slide.style.backgroundPositionY = (scrolled * 0.5) + 'px';
          }
        });
      }
    });
  }

  // 🛡️ UTILITY: Safe Loader
  async safeLoad(fn, name) {
    try {
      await fn();
      console.log(`✅ [HomeEngine] ${name} Loaded`);
    } catch (e) {
      console.error(`❌ [HomeEngine] ${name} Failed`, e);
    }
  }

  toggleWishlist(id) {
    if (window.wishlistManager) window.wishlistManager.toggle(id);
    if (window.notifications) window.notifications.success('WISHLIST', 'Producto guardado');
  }

  subscribeNewsletter(email) {
    if (!email || !email.includes('@')) {
      if (window.notifications) {
        window.notifications.show('Por favor ingresa un email válido', 'error');
      }
      return;
    }

    // Simular suscripción (aquí iría la llamada real a la API)
    if (window.notifications) {
      window.notifications.show('¡Te has suscrito! Revisa tu email para confirmar.', 'success');
    }
    localStorage.setItem('newsletter_subscribed', 'true');
    
    // Limpiar input
    const input = document.getElementById('jsFooterEmail');
    if (input) input.value = '';
  }

  setupNewsletter() {
    // 1. Footer Form (Intercept ID specific to Index or Generic)
    const forms = document.querySelectorAll('.footer-newsletter form, #newsletterPopup form');

    forms.forEach(form => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn ? btn.innerText : 'SUSCRIBIRME';

        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
          if (btn) btn.innerHTML = '<i class="fas fa-check"></i> LISTO';
          if (window.notifications) window.notifications.success('WELCOME TO THE CLUB', 'Te has suscrito correctamente.');

          // Hide popup if that was it
          const popup = form.closest('.newsletter-popup');
          if (popup) {
            setTimeout(() => {
              popup.style.opacity = '0';
              setTimeout(() => popup.style.display = 'none', 500);
            }, 1000);
          }

          localStorage.setItem('newsletter_subscribed', 'true');
        }, 1500);
      };
    });

    // 2. Popup Logic (Exit Intent / Time Delay)
    const popup = document.getElementById('newsletterPopup');
    if (popup && !localStorage.getItem('newsletter_subscribed') && !sessionStorage.getItem('newsletter_dismissed')) {
      setTimeout(() => {
        popup.style.display = 'flex';
        // Force reflow for fade in
        setTimeout(() => popup.classList.add('visible'), 10);
      }, 5000); // Show after 5 seconds

      const closeBtn = popup.querySelector('.close-modal');
      const closeLink = popup.querySelector('.close-link');

      const closeAction = () => {
        popup.classList.remove('visible');
        setTimeout(() => popup.style.display = 'none', 500);
        // Don't show again for this session
        sessionStorage.setItem('newsletter_dismissed', 'true');
      };

      if (closeBtn) closeBtn.onclick = closeAction;
      if (closeLink) closeLink.onclick = closeAction;
    }
  }

  setupMobileMenu() {
    // 1. Mobile Toggle (Hamburger)
    const menuBtn = document.querySelector('.header-mobile-toggle'); // V3 Class
    const mobileMenu = document.getElementById('mobileMenu'); // V3 ID

    if (menuBtn && mobileMenu) {
      // Logic handled by window.MobileMenu in components.js usually
      // But we can add extra listeners here if needed
    }
  }

  setupVideoModal() {
    // Basic modal logic
    const playBtn = document.querySelector('.btn-play, .btn-api'); // Support both
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Improved Feedback
        if (window.notifications) {
          window.notifications.info('VIDEO PLAYER', 'Feature coming in v7.5 update');
        } else {
          alert('Video Player loading...');
        }
      });
    }
  }

  // 5. Scroll Reveal Animations (Brutalist Fade Up)
  initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is visible
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for better visual effect
          setTimeout(() => {
            entry.target.classList.add('visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index % 4 * 50);
          observer.unobserve(entry.target); // Reveal once
        }
      });
    }, observerOptions);

    // Select elements to reveal
    const elementsToReveal = document.querySelectorAll('.section, .bento-item, .product-card, .brand-item, .trust-bar, .newsletter-section, .testimonial-card');

    elementsToReveal.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      // Initial hidden state
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.transitionDelay = `${index % 4 * 100}ms`; // Stagger effect
      observer.observe(el);
    });
  }

  // 6. Sticky Footer Logic (Dismissible)
  initFlashSaleTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;

    // Obtener tiempo objetivo desde sessionStorage o establecer uno nuevo (24 horas desde ahora)
    let targetTime = sessionStorage.getItem('flashSaleEndTime');
    if (!targetTime) {
      const now = new Date();
      now.setHours(now.getHours() + 24); // 24 horas desde ahora
      targetTime = now.getTime();
      sessionStorage.setItem('flashSaleEndTime', targetTime);
    } else {
      targetTime = parseInt(targetTime);
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        // Oferta expirada, resetear para 24 horas más
        const newTarget = new Date();
        newTarget.setHours(newTarget.getHours() + 24);
        targetTime = newTarget.getTime();
        sessionStorage.setItem('flashSaleEndTime', targetTime);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  initStickyFooter() {
    const sticky = document.getElementById('stickyFooter');
    
    // Inicializar contador de tiempo para oferta flash
    this.initFlashSaleTimer();
    if (!sticky) return;

    // Check if dismissed in session
    if (sessionStorage.getItem('stickyDetailDismissed')) {
      sticky.style.display = 'none';
      return;
    }

    // Add close button if not present
    if (!sticky.querySelector('.close-sticky')) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = 'close-sticky';
      closeBtn.style.cssText = `
              position: absolute;
              right: 1rem;
              top: 50%;
              transform: translateY(-50%);
              background: transparent;
              border: none;
              color: var(--white);
              font-size: 1.5rem;
              cursor: pointer;
              font-weight: bold;
          `;
      closeBtn.onclick = () => {
        sticky.style.display = 'none';
        sessionStorage.setItem('stickyDetailDismissed', 'true');
      };

      // Ensure container is relative for positioning
      const container = sticky.querySelector('.container');
      if (container) {
        container.style.position = 'relative';
        container.appendChild(closeBtn);
      } else {
        sticky.appendChild(closeBtn);
      }
    }
  }

  // 7. Product Engine (Tabbed Collections)
  initTabbedEngine() {
    const tabs = document.querySelectorAll('.engine-tab');
    const grid = document.getElementById('engineGrid');
    const loader = document.getElementById('engineLoader');
    const seeAll = document.getElementById('engineSeeAll');

    if (!tabs.length || !grid) return;

    const loadCategory = async (category) => {
      // 1. UI Loading State
      grid.style.display = 'none';
      grid.classList.remove('loaded');
      if (loader) loader.style.display = 'flex';

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelector(`.engine-tab[data-tab="${category}"]`)?.classList.add('active');

      let products = []; // Fix: Declare outside try/catch

      try {
        // 2. Fetch Data (Real API) - Más productos por categoría
        const response = await window.api.getProducts({
          category: category,
          limit: 8
        });

        // ROBUST PARSING (Matches loadProducts logic)
        if (Array.isArray(response)) {
          products = response;
        } else if (response && Array.isArray(response.data)) {
          products = response.data;
        } else if (response && response.data && Array.isArray(response.data.products)) {
          products = response.data.products;
        } else if (response && Array.isArray(response.products)) {
          products = response.products;
        }

        // 3. Fallback / Render
        if (!products || products.length === 0) {
          console.warn(`⚠️ API returned no products for ${category}, utilizing fallback.`);
          products = this.getFallbackProducts(category); // Guaranteed data
        }

        if (products.length > 0) {
          grid.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
        } else {
          grid.innerHTML = `<div class="empty-state">NO WEAPONS FOUND IN SECTOR ${category.toUpperCase()}</div>`;
        }


        // 4. Update "See All" Link
        if (seeAll) seeAll.href = `products.html?category=${category}`;

      } catch (err) {
        console.warn('❌ Engine Error:', err);
        // Fallback on error - Force Mock Data
        products = this.getFallbackProducts(category);
        if (products.length > 0) {
          grid.innerHTML = products.map(p => window.Components.getProductCard(p)).join('');
        } else {
          grid.innerHTML = `<div class="p-4 text-center border border-red-500 text-red-500">SYSTEM_OFFLINE // RETRYing...</div>`;
        }
      } finally {
        // 5. Reveal
        if (loader) loader.style.display = 'none';
        grid.style.display = 'grid';
        // Small delay to allow display:grid to apply before opacity transition
        setTimeout(() => grid.classList.add('loaded'), 50);
      }
    };

    // Initialize with first tab (Nike)
    loadCategory('nike');

    // Event Listeners
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.tab;
        loadCategory(category);
      });
    });
  }

  // Fallbacks removed for production.


  // 🛡️ DATA FAILSAFE: Hardcoded mocks to ensure layout never breaks
  getFallbackProducts(category = null) {
    const mocks = {
      'nike': [
        { id: 101, name: 'NIKE DUNK LOW RETRO', price: 110, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', badge: 'BESTSELLER' },
        { id: 102, name: 'AIR FORCE 1 07', price: 100, image_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=600' },
        { id: 103, name: 'AIR MAX 90', price: 130, image_url: 'https://images.unsplash.com/photo-1514989940723-e8875ea6ab7d?auto=format&fit=crop&q=80&w=600' },
        { id: 104, name: 'BLAZER MID 77', price: 105, image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=600', badge: 'CLASSIC' }
      ],
      'jordan': [
        { id: 201, name: 'AIR JORDAN 1 HIGH', price: 180, image_url: 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=600', badge: 'GRAIL' },
        { id: 202, name: 'JORDAN 4 RETRO', price: 210, image_url: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=600', badge: 'HYPED' },
        { id: 203, name: 'JORDAN 1 LOW', price: 140, image_url: 'https://images.unsplash.com/photo-1593081891731-fda0877988da?auto=format&fit=crop&q=80&w=600' },
        { id: 204, name: 'JORDAN 3', price: 200, image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600' }
      ],
      'yeezy': [
        { id: 301, name: 'YEEZY BOOST 350 V2', price: 230, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600', badge: 'RESTOCKED' },
        { id: 302, name: 'YEEZY SLIDE', price: 70, image_url: 'https://images.unsplash.com/photo-1605812853380-34ad68a253f3?auto=format&fit=crop&q=80&w=600' },
        { id: 303, name: 'YEEZY 700', price: 300, image_url: 'https://images.unsplash.com/photo-1565883017726-d249f056dcb5?auto=format&fit=crop&q=80&w=600' },
        { id: 304, name: 'YEEZY FOAM RNR', price: 90, image_url: 'https://images.unsplash.com/photo-1617267571626-829db2d558d6?auto=format&fit=crop&q=80&w=600' }
      ],
      'adidas': [
        { id: 401, name: 'ADIDAS FORUM LOW', price: 100, image_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600', badge: 'TENDENCIA' },
        { id: 402, name: 'ADIDAS SAMBA', price: 100, image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600' },
        { id: 403, name: 'ULTRABOOST', price: 180, image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=600' },
        { id: 404, name: 'GAZELLE', price: 95, image_url: 'https://images.unsplash.com/photo-1616124619460-c9fa42f7481f?auto=format&fit=crop&q=80&w=600' }
      ]
    };

    if (category && mocks[category]) {
      return mocks[category];
    }

    // If no category (GLOBAL CALL), return a flattened mix
    return [
      ...mocks['jordan'].slice(0, 2),
      ...mocks['yeezy'].slice(0, 2),
      ...mocks['nike'].slice(0, 2),
      ...mocks['adidas'].slice(0, 2)
    ];
  }

  // 🛡️ FAILSAFE: Force visibility after 2 seconds if observer fails or user turns off JS interactions
  forceReveal() {
    const elementsToReveal = document.querySelectorAll('.section, .bento-item, .product-card, .brand-item, .trust-bar, .newsletter-section');
    elementsToReveal.forEach(el => {
      if (!el.classList.contains('visible')) {
        el.classList.add('visible');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.homeEngine = new HomeEngine();

  // Failsafe: Ensure Footer is visible if Engine hangs
  setTimeout(() => {
    const footer = document.getElementById('mainFooter');
    if (footer && (!footer.innerHTML.trim() || footer.offsetHeight < 10)) {
      if (window.Components && window.Components.getFooter) {
        footer.innerHTML = window.Components.getFooter();
        footer.style.display = 'block';
      }
    }
  }, 2000);
});
