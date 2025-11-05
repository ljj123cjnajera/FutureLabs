// 🖼️ Galería de Imágenes de Producto con Lightbox
class ProductGallery {
  constructor(containerId = 'productGallery') {
    this.container = null;
    this.images = [];
    this.currentIndex = 0;
    this.lightbox = null;
    this.containerId = containerId;
    this.init();
  }

  init() {
    // Crear lightbox si no existe
    this.createLightbox();
    
    // Event listeners globales
    document.addEventListener('keydown', (e) => {
      if (this.lightbox?.classList.contains('active')) {
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.previousImage();
        if (e.key === 'ArrowRight') this.nextImage();
      }
    });
  }

  createLightbox() {
    if (document.getElementById('productGalleryLightbox')) return;
    
    const lightboxHTML = `
      <div class="product-gallery-lightbox" id="productGalleryLightbox">
        <button class="product-gallery-lightbox-close" id="galleryLightboxClose">
          <i class="fas fa-times"></i>
        </button>
        <button class="product-gallery-lightbox-nav product-gallery-lightbox-prev" id="galleryLightboxPrev">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="product-gallery-lightbox-nav product-gallery-lightbox-next" id="galleryLightboxNext">
          <i class="fas fa-chevron-right"></i>
        </button>
        <div class="product-gallery-lightbox-content">
          <img class="product-gallery-lightbox-image" id="galleryLightboxImage" src="" alt="">
          <div class="product-gallery-lightbox-counter" id="galleryLightboxCounter">1 / 1</div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    this.lightbox = document.getElementById('productGalleryLightbox');
    
    // Event listeners
    document.getElementById('galleryLightboxClose').addEventListener('click', () => this.closeLightbox());
    document.getElementById('galleryLightboxPrev').addEventListener('click', () => this.previousImage());
    document.getElementById('galleryLightboxNext').addEventListener('click', () => this.nextImage());
    
    // Cerrar al hacer click en el fondo
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });
  }

  // Renderizar galería con imágenes
  render(images, product = {}) {
    this.images = Array.isArray(images) ? images : [images];
    this.currentIndex = 0;
    
    // Si solo hay una imagen, duplicarla para mejor UX
    if (this.images.length === 1) {
      this.images = [this.images[0], this.images[0], this.images[0]];
    }
    
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Product gallery container not found:', this.containerId);
      return;
    }
    
    this.container = container;
    
    const discount = product.discount_price && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;
    
    const html = `
      <div class="product-gallery">
        <div class="product-gallery-main" onclick="productGallery.openLightbox(0)">
          <img src="${this.images[0]}" 
               alt="${product.name || 'Producto'}" 
               id="galleryMainImage"
               onerror="this.onerror=null; this.src='assets/images/products/placeholder.jpg';">
          <div class="product-gallery-zoom-icon">
            <i class="fas fa-search-plus"></i>
          </div>
          ${discount > 0 ? `<div class="product-gallery-badge">-${discount}%</div>` : ''}
        </div>
        
        ${this.images.length > 1 ? `
          <div class="product-gallery-thumbnails">
            ${this.images.map((img, index) => `
              <div class="product-gallery-thumbnail ${index === 0 ? 'active' : ''}" 
                   onclick="productGallery.selectImage(${index})"
                   data-index="${index}">
                <img src="${img}" 
                     alt="${product.name || 'Producto'} - Vista ${index + 1}"
                     onerror="this.onerror=null; this.src='assets/images/products/placeholder.jpg';">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    container.innerHTML = html;
    
    // Guardar referencia global para onclick
    window.productGallery = this;
  }

  // Seleccionar imagen desde thumbnail
  selectImage(index) {
    if (index < 0 || index >= this.images.length) return;
    
    this.currentIndex = index;
    
    // Actualizar imagen principal
    const mainImage = document.getElementById('galleryMainImage');
    if (mainImage) {
      mainImage.src = this.images[index];
    }
    
    // Actualizar thumbnails activos
    document.querySelectorAll('.product-gallery-thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  // Abrir lightbox
  openLightbox(index = null) {
    if (index !== null) {
      this.currentIndex = index;
    }
    
    const lightboxImage = document.getElementById('galleryLightboxImage');
    const lightboxCounter = document.getElementById('galleryLightboxCounter');
    
    if (lightboxImage && this.lightbox) {
      lightboxImage.src = this.images[this.currentIndex];
      lightboxImage.alt = `Imagen ${this.currentIndex + 1} de ${this.images.length}`;
      
      if (lightboxCounter) {
        lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
      }
      
      this.lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Cerrar lightbox
  closeLightbox() {
    if (this.lightbox) {
      this.lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Imagen anterior
  previousImage() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateLightboxImage();
  }

  // Imagen siguiente
  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateLightboxImage();
  }

  // Actualizar imagen en lightbox
  updateLightboxImage() {
    const lightboxImage = document.getElementById('galleryLightboxImage');
    const lightboxCounter = document.getElementById('galleryLightboxCounter');
    
    if (lightboxImage) {
      lightboxImage.src = this.images[this.currentIndex];
      lightboxImage.alt = `Imagen ${this.currentIndex + 1} de ${this.images.length}`;
    }
    
    if (lightboxCounter) {
      lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }
  }

  // Generar múltiples URLs de imagen (para productos que solo tienen 1)
  generateImageVariations(baseUrl) {
    // Si es una URL de placeholder, generar variaciones
    if (baseUrl.includes('placeholder') || baseUrl.includes('via.placeholder')) {
      return [
        baseUrl,
        baseUrl.replace('300', '301'),
        baseUrl.replace('300', '302'),
        baseUrl.replace('300', '303')
      ];
    }
    
    // Si es una imagen real, intentar generar variaciones
    // Esto es solo para demo - en producción deberías tener múltiples imágenes
    return [baseUrl, baseUrl, baseUrl, baseUrl];
  }
}

// Inicializar globalmente
let productGallery;
document.addEventListener('DOMContentLoaded', () => {
  productGallery = new ProductGallery();
  window.productGallery = productGallery;
});

