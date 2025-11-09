// 🗺️ Sistema de Breadcrumbs - Navegación clara
class Breadcrumbs {
  constructor() {
    this.items = [];
  }

  // Generar breadcrumbs automáticamente según la página
  generate() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const urlParams = new URLSearchParams(window.location.search);
    
    this.items = [
      { name: 'Inicio', url: 'index.html' }
    ];

    // Detectar página y agregar breadcrumbs específicos
    if (page === 'products.html') {
      this.items.push({ name: 'Productos', url: 'products.html' });
      
      const category = urlParams.get('category');
      const search = urlParams.get('search');
      
      if (category) {
        // Obtener nombre de categoría (puede mejorarse con API)
        this.items.push({ name: this.formatCategory(category), url: `products.html?category=${category}` });
      }
      
      if (search) {
        this.items.push({ name: `Búsqueda: "${search}"`, url: null });
      }
    } else if (page === 'product-detail.html') {
      this.items.push({ name: 'Productos', url: 'products.html' });
      
      const productId = urlParams.get('id');
      if (productId && window.currentProduct) {
        this.items.push({ name: window.currentProduct.name, url: null });
      } else {
        this.items.push({ name: 'Detalle del Producto', url: null });
      }
    } else if (page === 'cart.html') {
      this.items.push({ name: 'Carrito', url: null });
    } else if (page === 'checkout.html') {
      this.items.push(
        { name: 'Carrito', url: 'cart.html' },
        { name: 'Checkout', url: null }
      );
    } else if (page === 'orders.html') {
      this.items.push({ name: 'Mis Pedidos', url: null });
    } else if (page === 'profile.html') {
      this.items.push({ name: 'Mi Cuenta', url: null });
    } else if (page === 'wishlist.html') {
      this.items.push({ name: 'Lista de Deseos', url: null });
    } else if (page === 'blog.html') {
      this.items.push({ name: 'Blog', url: null });
    } else if (page === 'contact.html') {
      this.items.push({ name: 'Contacto', url: null });
    } else if (page === 'about.html') {
      this.items.push({ name: 'Sobre Nosotros', url: null });
    } else if (page === 'faq.html') {
      this.items.push({ name: 'Preguntas Frecuentes', url: null });
    } else if (page === 'compare.html') {
      this.items.push({ name: 'Comparador', url: null });
    }

    return this.items;
  }

  formatCategory(categorySlug) {
    // Convertir slug a nombre legible
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Renderizar breadcrumbs en el DOM
  render(containerId = 'breadcrumbs') {
    const container = document.getElementById(containerId);
    if (!container) {
      // Crear contenedor si no existe
      const newContainer = document.createElement('nav');
      newContainer.id = containerId;
      newContainer.className = 'breadcrumbs-container';
      newContainer.setAttribute('aria-label', 'Breadcrumb');
      
      // Insertar después del header
      const header = document.querySelector('header');
      if (header) {
        header.insertAdjacentElement('afterend', newContainer);
      } else {
        document.body.insertAdjacentElement('afterbegin', newContainer);
      }
    }

    const items = this.generate();
    const html = `
      <div class="container">
        <ol class="breadcrumbs">
          ${items.map((item, index) => `
            <li class="breadcrumb-item ${index === items.length - 1 ? 'active' : ''}">
              ${item.url && index < items.length - 1
                ? `<a href="${item.url}">${item.name}</a>`
                : `<span>${item.name}</span>`
              }
            </li>
          `).join('')}
        </ol>
      </div>
    `;

    const targetContainer = document.getElementById(containerId);
    if (targetContainer) {
      targetContainer.innerHTML = html;
    }
  }

  // Actualizar breadcrumb dinámicamente (ej: cuando se carga producto)
  updateProductName(productName) {
    const items = this.items;
    const lastItem = items[items.length - 1];
    if (lastItem && window.location.pathname.includes('product-detail')) {
      lastItem.name = productName;
      this.render();
    }
  }
}

// Inicializar breadcrumbs globalmente
let breadcrumbs;
document.addEventListener('DOMContentLoaded', () => {
  breadcrumbs = new Breadcrumbs();
  breadcrumbs.render();
  window.breadcrumbs = breadcrumbs;
});

