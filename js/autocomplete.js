// 🔍 Autocompletado de Búsqueda Mejorado
class SearchAutocomplete {
  constructor() {
    this.searchInput = null;
    this.suggestionsContainer = null;
    this.currentSuggestions = [];
    this.selectedIndex = -1;
    this.debounceTimer = null;
    this.searchHistory = this.loadSearchHistory();
    this.isLoading = false;
    this.initialized = false;
  }

  init() {
    // Evitar inicialización múltiple
    if (this.initialized) return;
    
    // Buscar input de búsqueda
    this.searchInput = document.getElementById('searchInput');
    
    if (!this.searchInput) {
      console.log('⏳ SearchAutocomplete: searchInput no encontrado, reintentando...');
      return;
    }
    
    this.initialized = true;
    console.log('✅ SearchAutocomplete inicializado correctamente');
    
    // Crear contenedor de sugerencias
    this.createSuggestionsContainer();
    
    // Event listeners
    this.searchInput.addEventListener('input', (e) => this.handleInput(e));
    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.searchInput.addEventListener('focus', () => this.showSuggestions());
    this.searchInput.addEventListener('blur', () => {
      // Delay para permitir clicks en sugerencias
      setTimeout(() => this.hideSuggestions(), 200);
    });
  }

  createSuggestionsContainer() {
    const searchBar = this.searchInput.closest('.search-bar');
    if (!searchBar) return;
    
    this.suggestionsContainer = document.createElement('div');
    this.suggestionsContainer.className = 'search-suggestions';
    this.suggestionsContainer.style.display = 'none';
    
    searchBar.appendChild(this.suggestionsContainer);
  }

  async handleInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Show history or trending if query is empty
    if (query.length === 0) {
      this.renderHistoryAndTrending();
      return;
    }
    
    // Hide suggestions if query is too short
    if (query.length < 2) {
      this.hideSuggestions();
      return;
    }
    
    // Debounce API call
    this.debounceTimer = setTimeout(async () => {
      await this.fetchSuggestions(query);
    }, 300);
  }

  async fetchSuggestions(query) {
    try {
      this.isLoading = true;
      this.showLoadingState();
      
      const response = await window.api.getSearchSuggestions(query);
      
      if (response.success) {
        this.currentSuggestions = response.data.suggestions;
        this.renderSuggestions();
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.hideSuggestions();
    } finally {
      this.isLoading = false;
    }
  }

  showLoadingState() {
    if (!this.suggestionsContainer) return;
    
    this.suggestionsContainer.innerHTML = `
      <div class="suggestions-loading">
        <div class="loading-spinner"></div>
        <p>Buscando...</p>
      </div>
    `;
    this.showSuggestions();
  }

  renderSuggestions() {
    if (!this.suggestionsContainer) return;
    
    if (this.currentSuggestions.length === 0) {
      this.hideSuggestions();
      return;
    }
    
    // Group suggestions by type
    const products = this.currentSuggestions.filter(s => s.type === 'product');
    const categories = this.currentSuggestions.filter(s => s.type === 'category');
    
    let html = '';
    
    // Products
    if (products.length > 0) {
      html += '<div class="suggestions-section">';
      html += '<div class="suggestions-title"><i class="fas fa-box"></i> Productos</div>';
      products.forEach((product, index) => {
        html += `
          <div class="suggestion-item" data-type="product" data-id="${product.id}" data-slug="${product.slug}">
            <img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}">
            <div class="suggestion-info">
              <div class="suggestion-name">${this.highlightMatch(product.name)}</div>
              <div class="suggestion-price">
                ${product.discount_price ? `
                  <span class="price-old">S/ ${parseFloat(product.price).toFixed(2)}</span>
                  <span class="price-current">S/ ${parseFloat(product.discount_price).toFixed(2)}</span>
                ` : `
                  <span class="price-current">S/ ${parseFloat(product.price).toFixed(2)}</span>
                `}
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    // Categories
    if (categories.length > 0) {
      html += '<div class="suggestions-section">';
      html += '<div class="suggestions-title"><i class="fas fa-tags"></i> Categorías</div>';
      categories.forEach((category) => {
        html += `
          <div class="suggestion-item" data-type="category" data-slug="${category.slug}">
            <i class="fas fa-folder"></i>
            <div class="suggestion-info">
              <div class="suggestion-name">${this.highlightMatch(category.name)}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    // View all results
    html += `
      <div class="suggestions-footer">
        <a href="products.html?search=${encodeURIComponent(this.searchInput.value)}">
          <i class="fas fa-search"></i> Ver todos los resultados
        </a>
      </div>
    `;
    
    this.suggestionsContainer.innerHTML = html;
    this.showSuggestions();
    
    // Add click handlers
    this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectSuggestion(item);
      });
    });
  }

  highlightMatch(text) {
    const query = this.searchInput.value.toLowerCase();
    const index = text.toLowerCase().indexOf(query);
    
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return `${before}<strong>${match}</strong>${after}`;
  }


  handleKeydown(e) {
    if (!this.suggestionsContainer || this.suggestionsContainer.style.display === 'none') {
      return;
    }
    
    const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          this.selectSuggestion(items[this.selectedIndex]);
        }
        break;
        
      case 'Escape':
        this.hideSuggestions();
        break;
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  showSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = 'block';
    }
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = 'none';
    }
    this.selectedIndex = -1;
  }

  // Historial de búsquedas
  loadSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  }

  saveSearchHistory(query) {
    // No guardar si ya existe
    if (this.searchHistory.includes(query)) {
      return;
    }
    
    // Agregar al inicio
    this.searchHistory.unshift(query);
    
    // Limitar a 10 búsquedas
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(0, 10);
    }
    
    // Guardar en localStorage
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
    this.renderHistoryAndTrending();
  }

  // Renderizar historial y búsquedas populares
  async renderHistoryAndTrending() {
    if (!this.suggestionsContainer) return;
    
    let html = '';
    
    // Historial de búsquedas
    if (this.searchHistory.length > 0) {
      html += '<div class="suggestions-section">';
      html += '<div class="suggestions-title"><i class="fas fa-clock"></i> Búsquedas Recientes</div>';
      
      this.searchHistory.slice(0, 5).forEach((query) => {
        html += `
          <div class="suggestion-item" data-type="history" data-query="${query}">
            <i class="fas fa-history"></i>
            <div class="suggestion-info">
              <div class="suggestion-name">${query}</div>
            </div>
            <button class="suggestion-delete" data-query="${query}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
      });
      
      html += '<div class="suggestions-clear"><button id="clearHistory">Limpiar historial</button></div>';
      html += '</div>';
    }
    
    // Búsquedas populares
    html += '<div class="suggestions-section">';
    html += '<div class="suggestions-title"><i class="fas fa-fire"></i> Búsquedas Populares</div>';
    
    const popularSearches = ['laptop gaming', 'smartphone', 'auriculares', 'smartwatch', 'tablet'];
    popularSearches.forEach((query) => {
      html += `
        <div class="suggestion-item" data-type="popular" data-query="${query}">
          <i class="fas fa-fire"></i>
          <div class="suggestion-info">
            <div class="suggestion-name">${query}</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    this.suggestionsContainer.innerHTML = html;
    this.showSuggestions();
    
    // Add click handlers
    this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.suggestion-delete')) {
          this.selectSuggestion(item);
        }
      });
    });
    
    // Clear history button
    const clearHistoryBtn = this.suggestionsContainer.querySelector('#clearHistory');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        this.clearSearchHistory();
      });
    }
    
    // Delete individual history item
    this.suggestionsContainer.querySelectorAll('.suggestion-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = btn.dataset.query;
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        this.renderHistoryAndTrending();
      });
    });
  }

  // Seleccionar sugerencia
  selectSuggestion(item) {
    const type = item.dataset.type;
    
    if (type === 'product') {
      const productId = item.dataset.id;
      window.location.href = `product-detail.html?id=${productId}`;
    } else if (type === 'category') {
      const slug = item.dataset.slug;
      window.location.href = `products.html?category=${slug}`;
    } else if (type === 'history' || type === 'popular') {
      const query = item.dataset.query;
      this.searchInput.value = query;
      // Guardar en historial si es una búsqueda popular
      if (type === 'popular') {
        this.saveSearchHistory(query);
      }
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  }
}

// Inicializar autocompletado
let searchAutocomplete = null;

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAutocomplete);
} else {
  initializeAutocomplete();
}

function initializeAutocomplete() {
  // Crear instancia
  searchAutocomplete = new SearchAutocomplete();
  
  // Intentar inicializar inmediatamente
  searchAutocomplete.init();
  
  // Si no se inicializó, reintentar cada 100ms hasta 5 segundos
  if (!searchAutocomplete.initialized) {
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos
    
    const retryInterval = setInterval(() => {
      attempts++;
      searchAutocomplete.init();
      
      if (searchAutocomplete.initialized || attempts >= maxAttempts) {
        clearInterval(retryInterval);
        if (!searchAutocomplete.initialized) {
          console.warn('⚠️ SearchAutocomplete no pudo inicializarse después de 5 segundos');
        }
      }
    }, 100);
  }
}


