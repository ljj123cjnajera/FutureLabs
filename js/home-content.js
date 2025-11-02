// 🏠 Gestión de Contenido Dinámico del Home
class HomeContentManager {
  constructor() {
    this.heroSlides = [];
    this.banners = [];
    this.benefits = [];
    this.sections = [];
    this.init();
  }

  async init() {
    await this.loadAllContent();
    this.renderHeroSlider();
    this.renderBenefits();
    this.renderBanners();
    this.renderHomeSections();
  }

  async loadAllContent() {
    try {
      const response = await window.api.getHomeContent();
      if (response.success) {
        this.heroSlides = response.data.hero_slides || [];
        this.banners = response.data.banners || [];
        this.benefits = response.data.benefits || [];
        this.sections = response.data.sections || [];
      }
    } catch (error) {
      console.error('Error loading home content:', error);
    }
  }

  renderHeroSlider() {
    const sliderContainer = document.querySelector('.hero-slider');
    if (!sliderContainer || this.heroSlides.length === 0) return;

    // Limpiar contenido existente
    const existingSlides = sliderContainer.querySelectorAll('.slide:not(.slider-arrow):not(.slider-controls)');
    existingSlides.forEach(slide => slide.remove());

    const existingControls = sliderContainer.querySelector('.slider-controls');
    if (existingControls) existingControls.remove();

    // Crear slides
    const slidesHTML = this.heroSlides.map((slide, index) => `
      <div class="slide ${index === 0 ? 'active' : ''}" style="${slide.background_color ? `background: ${slide.background_color};` : ''} ${slide.image_url ? `background-image: url('${this.normalizeImageUrl(slide.image_url)}'); background-size: cover; background-position: center;` : ''}">
        <div class="slide-content">
          <h1>${slide.title}</h1>
          ${slide.description ? `<p>${slide.description}</p>` : ''}
          ${slide.button_text ? `<button class="btn btn-primary btn-lg" ${slide.button_link ? `onclick="window.location.href='${slide.button_link}'"` : ''}>${slide.button_text}</button>` : ''}
        </div>
      </div>
    `).join('');

    // Insertar slides antes de las flechas
    const arrows = sliderContainer.querySelectorAll('.slider-arrow');
    if (arrows.length > 0) {
      arrows[0].insertAdjacentHTML('beforebegin', slidesHTML);
    } else {
      sliderContainer.insertAdjacentHTML('afterbegin', slidesHTML);
    }

    // Crear controles
    const controlsHTML = `
      <div class="slider-controls">
        ${this.heroSlides.map((_, index) => `
          <div class="slider-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>
        `).join('')}
      </div>
    `;
    sliderContainer.insertAdjacentHTML('beforeend', controlsHTML);

    // Reinicializar el carrusel después de un pequeño delay para asegurar que el DOM esté actualizado
    setTimeout(() => {
      this.initHeroSlider();
    }, 100);
  }

  initHeroSlider() {
    const sliderContainer = document.querySelector('.hero-slider');
    if (!sliderContainer) return;

    const slides = sliderContainer.querySelectorAll('.slide:not(.slider-arrow):not(.slider-controls)');
    if (slides.length === 0) return;

    let currentSlide = 0;

    // Función para cambiar slide
    const changeSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
          slide.classList.add('active');
        }
      });

      // Actualizar dots
      const dots = sliderContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === index) {
          dot.classList.add('active');
        }
      });
    };

    // Event listeners para las flechas
    const prevArrow = sliderContainer.querySelector('.slider-arrow.prev');
    const nextArrow = sliderContainer.querySelector('.slider-arrow.next');

    if (prevArrow) {
      prevArrow.onclick = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        changeSlide(currentSlide);
      };
    }

    if (nextArrow) {
      nextArrow.onclick = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        changeSlide(currentSlide);
      };
    }

    // Event listeners para los dots
    const dots = sliderContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.onclick = () => {
        currentSlide = index;
        changeSlide(currentSlide);
      };
    });

    // Auto-play del carrusel
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      changeSlide(currentSlide);
    }, 5000);
  }

  renderBenefits() {
    const benefitsContainer = document.querySelector('.benefits-slider');
    if (!benefitsContainer) return;
    
    // Si no hay beneficios, mantener el contenido por defecto
    if (this.benefits.length === 0) {
      // Ocultar el contenedor de beneficios por defecto si hay beneficios dinámicos en el futuro
      return;
    }

    // Reemplazar contenido solo si hay beneficios dinámicos
    benefitsContainer.innerHTML = this.benefits.map(benefit => `
      <div class="benefit-card">
        <div class="benefit-image" style="${benefit.background_color ? `background: ${benefit.background_color};` : ''}">
          ${benefit.icon ? `<i class="${benefit.icon}" style="font-size: 2em; margin-bottom: 10px;"></i>` : ''}
          ${benefit.image_url ? `<img src="${this.normalizeImageUrl(benefit.image_url)}" alt="${benefit.title}" style="max-width: 100%; max-height: 80px;">` : ''}
          <h3>${benefit.title}</h3>
        </div>
        <div class="benefit-content">
          ${benefit.description ? `<p>${benefit.description}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  renderBanners() {
    // Banner de afiliados
    const affiliateBanner = document.querySelector('.affiliate-banner');
    const affiliateBanners = this.banners.filter(b => b.banner_type === 'affiliate' && b.position === 'middle');
    if (affiliateBanner && affiliateBanners.length > 0) {
      const banner = affiliateBanners[0];
      affiliateBanner.innerHTML = `
        ${banner.image_url ? `<img src="${this.normalizeImageUrl(banner.image_url)}" alt="${banner.title}" style="max-width: 100%; margin-bottom: 15px;">` : ''}
        <h2>${banner.title}</h2>
        ${banner.description ? `<p>${banner.description}</p>` : ''}
        ${banner.button_text ? `<button class="cta-button" ${banner.button_link ? `onclick="window.location.href='${banner.button_link}'"` : ''}>${banner.button_text}</button>` : ''}
      `;
    }

    // Banner grid
    const bannerGrid = document.querySelector('.banner-grid');
    const gridBanners = this.banners.filter(b => b.banner_type === 'grid');
    if (bannerGrid && gridBanners.length > 0) {
      bannerGrid.innerHTML = gridBanners.slice(0, 3).map(banner => `
        <div class="banner" ${banner.image_url ? `style="background-image: url('${this.normalizeImageUrl(banner.image_url)}'); background-size: cover; background-position: center;"` : ''}>
          <h3>${banner.title}</h3>
          ${banner.description ? `<p>${banner.description}</p>` : ''}
          ${banner.button_text ? `<button class="btn btn-primary" ${banner.button_link ? `onclick="window.location.href='${banner.button_link}'"` : ''}>${banner.button_text}</button>` : ''}
        </div>
      `).join('');
    }

    // Flash offers
    const flashOffers = this.banners.filter(b => b.banner_type === 'flash');
    if (flashOffers.length > 0) {
      const flashOffersSection = document.querySelector('.flash-offers-message');
      if (flashOffersSection) {
        flashOffersSection.innerHTML = flashOffers.map(banner => `
          <div class="flash-offer-card" style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${banner.image_url ? `<img src="${this.normalizeImageUrl(banner.image_url)}" alt="${banner.title}" style="max-width: 100%; margin-bottom: 15px; border-radius: 4px;">` : ''}
            <h3>${banner.title}</h3>
            ${banner.description ? `<p>${banner.description}</p>` : ''}
            ${banner.button_text ? `<button class="btn btn-primary" ${banner.button_link ? `onclick="window.location.href='${banner.button_link}'"` : ''}>${banner.button_text}</button>` : ''}
          </div>
        `).join('');
      }
    }
  }

  async renderHomeSections() {
    if (!this.sections || this.sections.length === 0) return;

    for (const section of this.sections) {
      await this.renderSection(section);
    }
  }

  async renderSection(section) {
    switch(section.section_type) {
      case 'category_carousel':
        await this.renderCategoryCarousel(section);
        break;
      case 'categories_grid':
        this.renderCategoriesGrid(section);
        break;
      case 'featured_products':
        await this.renderFeaturedProducts(section);
        break;
      case 'flash_offers':
        // Ya se maneja en renderBanners
        break;
    }
  }

  async renderCategoryCarousel(section) {
    // Buscar o crear contenedor de carrusel de categoría
    let carouselContainer = document.querySelector(`.category-carousel[data-section-id="${section.id}"]`);
    
    if (!carouselContainer) {
      // Crear nueva sección
      const sectionsContainer = document.querySelector('.section:has(.category-carousel)')?.parentElement || document.querySelector('main') || document.body;
      carouselContainer = document.createElement('section');
      carouselContainer.className = 'section';
      carouselContainer.innerHTML = `
        <div class="container">
          <h3 class="section-title">${section.title || 'Novedades'}</h3>
          <div class="category-carousel" data-section-id="${section.id}">
            <div class="carousel-message">
              <p>Cargando productos...</p>
            </div>
          </div>
        </div>
      `;
      sectionsContainer.appendChild(carouselContainer);
    }

    if (section.category_id) {
      try {
        // Obtener productos de la categoría
        const categoryResponse = await window.api.request(`/categories/${section.category_id}`);
        if (categoryResponse.success) {
          const category = categoryResponse.data.category;
          const productsResponse = await window.api.getProducts({ category_id: section.category_id, limit: section.limit || 8 });
          
          if (productsResponse.success && productsResponse.data.products.length > 0) {
            const products = productsResponse.data.products;
            const carousel = carouselContainer.querySelector('.category-carousel');
            carousel.innerHTML = `
              <div class="products-carousel">
                ${products.map(product => `
                  <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                    <div class="product-image">
                      <img src="${this.normalizeImageUrl(product.image_url || 'assets/images/products/placeholder.jpg')}" 
                           alt="${product.name}" 
                           onerror="this.src='assets/images/products/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                      <span class="product-brand">${product.brand}</span>
                      <h3>${product.name}</h3>
                      <div class="product-price">
                        <span>S/ ${parseFloat(product.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="carousel-arrow prev"><i class="fas fa-chevron-left"></i></div>
              <div class="carousel-arrow next"><i class="fas fa-chevron-right"></i></div>
            `;
          }
        }
      } catch (error) {
        console.error('Error rendering category carousel:', error);
      }
    }
  }

  renderCategoriesGrid(section) {
    // Esto ya está manejado por la sección de categorías existente
    // Podríamos mejorarlo si es necesario
  }

  async renderFeaturedProducts(section) {
    try {
      const response = await window.api.getFeaturedProducts(section.limit || 8);
      if (response.success && response.data.products.length > 0) {
        // Buscar o crear contenedor
        let container = document.querySelector(`[data-section-type="featured_products"]`);
        if (!container) {
          const sectionsContainer = document.querySelector('main') || document.body;
          container = document.createElement('section');
          container.className = 'section';
          container.setAttribute('data-section-type', 'featured_products');
          container.innerHTML = `
            <div class="container">
              <h2 class="section-title">${section.title || 'Productos Destacados'}</h2>
              <div class="products-grid-featured"></div>
            </div>
          `;
          sectionsContainer.appendChild(container);
        }

        const productsGrid = container.querySelector('.products-grid-featured');
        if (productsGrid) {
          productsGrid.innerHTML = response.data.products.map(product => `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
              <div class="product-image">
                <img src="${this.normalizeImageUrl(product.image_url || 'assets/images/products/placeholder.jpg')}" 
                     alt="${product.name}" 
                     onerror="this.src='assets/images/products/placeholder.jpg'">
              </div>
              <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3>${product.name}</h3>
                <div class="product-price">
                  <span>S/ ${parseFloat(product.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error rendering featured products:', error);
    }
  }

  normalizeImageUrl(url) {
    if (!url) return 'assets/images/products/placeholder.jpg';
    
    // Si ya es una URL completa, devolverla
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si es una URL del backend sin protocolo, agregar https://
    if (url.includes('railway.app') || url.includes('futurelabs')) {
      return `https://${url}`;
    }
    
    // Si empieza con /uploads/, convertir a URL completa del backend
    if (url.startsWith('/uploads/')) {
      return `https://futurelabs-production.up.railway.app${url}`;
    }
    
    // URL relativa local
    return url;
  }
}

// Instanciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.homeContentManager = new HomeContentManager();
  });
} else {
  window.homeContentManager = new HomeContentManager();
}

