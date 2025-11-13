// 🎛️ CRUD de Administración
class AdminCRUD {
  constructor() {
    this.currentEditId = null;
    this.isInitialized = false;
    this.isLoading = false; // Prevenir múltiples operaciones simultáneas
    this.init();
  }

  init() {
    // Prevenir múltiples inicializaciones
    if (this.isInitialized) {
      console.warn('AdminCRUD ya está inicializado');
      return;
    }
    
    // Setup modales
    this.setupModals();
    
    // Setup formularios
    this.setupForms();
    
    // Generación automática de slug
    this.setupSlugGeneration();
    
    // Setup cierre de modales al hacer click fuera
    this.setupModalBackdrop();
    
    this.isInitialized = true;
  }
  
  setupModalBackdrop() {
    // Prevenir múltiples listeners
    if (this.modalBackdropSetup) return;
    
    // Usar delegación de eventos en el body para evitar múltiples listeners
    document.body.addEventListener('click', (e) => {
      // No hacer nada si hay una operación en curso
      if (this.isLoading) {
        e.stopPropagation();
        return;
      }
      
      // Manejar cierre con botón modal-close
      const closeBtn = e.target.closest('.modal-close');
      if (closeBtn) {
        const modal = closeBtn.closest('.modal');
        if (modal) {
          e.preventDefault();
          e.stopPropagation();
          this.closeModal(modal);
          return;
        }
      }
      
      // Solo cerrar si se hace click directamente en el backdrop del modal (no en su contenido)
      const modal = e.target.closest('.modal');
      if (modal) {
        // Verificar que el click fue directamente en el backdrop (no en ningún hijo)
        // e.target debe ser el modal mismo, no un elemento dentro
        if (e.target === modal) {
          const modalContent = modal.querySelector('.modal-content');
          // Solo cerrar si NO hay contenido o si el click fue fuera del contenido
          if (!modalContent || !modalContent.contains(e.target)) {
            // Verificar que no se esté haciendo click en el overlay de loading
            const loadingOverlay = modal.querySelector('[id$="ModalLoading"]');
            if (!loadingOverlay) {
              this.closeModal(modal);
            }
          }
        }
      }
    });
    
    // Prevenir que ESC cierre el modal durante carga
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isLoading) {
        const openModal = document.querySelector('.modal[style*="flex"]');
        if (openModal) {
          e.preventDefault();
          e.stopPropagation();
          this.closeModal(openModal);
        }
      }
    });
    
    this.modalBackdropSetup = true;
  }
  
  closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    // Limpiar errores de validación al cerrar
    modal.querySelectorAll('.error-message').forEach(err => err.remove());
    modal.querySelectorAll('input, select, textarea').forEach(input => {
      input.style.borderColor = '';
    });
    // Remover cualquier overlay de loading que quede
    modal.querySelectorAll('[id$="ModalLoading"]').forEach(overlay => overlay.remove());
  }

  setupSlugGeneration() {
    const nameInput = document.getElementById('productName');
    const slugInput = document.getElementById('productSlug');
    
    if (nameInput && slugInput) {
      nameInput.addEventListener('input', () => {
        // Solo generar slug si está vacío o si el usuario no lo ha modificado manualmente
        if (!slugInput.dataset.manualEdit) {
          const slug = this.generateSlug(nameInput.value);
          slugInput.value = slug;
        }
      });

      // Marcar cuando el usuario edita el slug manualmente
      slugInput.addEventListener('input', () => {
        slugInput.dataset.manualEdit = 'true';
      });

    }
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  }

  setupModals() {
    // Product Modal - Exponer métodos en la instancia
    this.openProductModal = () => {
      this.currentEditId = null;
      document.getElementById('productForm').reset();
      document.getElementById('productModalTitle').textContent = 'Crear Producto';
      document.getElementById('productModal').style.display = 'flex';
      // Resetear preview de imagen
      document.getElementById('imagePreviewContainer').style.display = 'none';
      document.getElementById('previewImage').src = '';
      document.getElementById('imageFileName').textContent = '';
      document.getElementById('productImageFile').value = '';
      // Resetear flag de edición manual de slug
      const slugInput = document.getElementById('productSlug');
      if (slugInput) {
        slugInput.dataset.manualEdit = '';
      }
    };

    this.editProduct = async (id) => {
      if (this.isLoading) {
        window.notifications?.warning('Por favor espera, hay una operación en curso...');
        return;
      }
      
      // Validar que el ID existe
      if (!id) {
        console.error('ID de producto no proporcionado');
        window.notifications?.error('Error: ID de producto no válido');
        return;
      }
      
      this.isLoading = true;
      const modal = document.getElementById('productModal');
      if (!modal) {
        console.error('Modal de producto no encontrado');
        this.isLoading = false;
        return;
      }
      
      try {
        this.currentEditId = id;
        const modalTitle = document.getElementById('productModalTitle');
        if (modalTitle) {
          modalTitle.textContent = 'Editar Producto';
        }
        
        // Cerrar cualquier modal abierto previamente
        document.querySelectorAll('.modal').forEach(m => {
          if (m !== modal && m.style.display === 'flex') {
            m.style.display = 'none';
          }
        });
        
        // Mostrar loading overlay sin reemplazar el contenido completo
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
          throw new Error('Contenido del modal no encontrado');
        }
        
        // Remover cualquier overlay previo
        const existingOverlay = document.getElementById('productModalLoading');
        if (existingOverlay) {
          existingOverlay.remove();
        }
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'productModalLoading';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; pointer-events: auto;';
        loadingOverlay.innerHTML = '<div style="text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 16px;">Cargando producto...</p></div>';
        
        // Prevenir que clicks en el overlay cierren el modal
        loadingOverlay.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
        });
        
        // Asegurar que modal-content tenga position relative
        const currentPosition = window.getComputedStyle(modalContent).position;
        if (currentPosition === 'static') {
          modalContent.style.position = 'relative';
        }
        
        // Abrir modal ANTES de agregar el overlay
        modal.style.display = 'flex';
        
        // Pequeño delay para asegurar que el modal esté completamente renderizado
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verificar que el modal sigue abierto
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró antes de agregar overlay');
          this.isLoading = false;
          return;
        }
        
        // Agregar overlay después de que el modal esté visible
        modalContent.appendChild(loadingOverlay);
        
        // Forzar que el modal permanezca visible durante la carga
        const keepModalOpen = () => {
          if (modal.style.display !== 'flex') {
            console.warn('⚠️ Modal se cerró, reabriendo...');
            modal.style.display = 'flex';
          }
        };
        
        const modalCheckInterval = setInterval(keepModalOpen, 50);
        
        try {
          await this.loadProductForEdit(id);
          
          // Verificar nuevamente que el modal sigue abierto
          if (modal.style.display !== 'flex') {
            console.warn('⚠️ Modal se cerró durante la carga, reabriendo...');
            modal.style.display = 'flex';
          }
          
          // Remover loading overlay
          const overlay = document.getElementById('productModalLoading');
          if (overlay) overlay.remove();
          
          clearInterval(modalCheckInterval);
        } catch (loadError) {
          clearInterval(modalCheckInterval);
          throw loadError;
        }
      } catch (error) {
        console.error('Error loading product for edit:', error);
        const overlay = document.getElementById('productModalLoading');
        if (overlay) overlay.remove();
        modal.style.display = 'none';
        window.notifications?.error('Error al cargar producto: ' + (error.message || 'Error desconocido'));
      } finally {
        this.isLoading = false;
      }
    };

    this.deleteProduct = async (id) => {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
          const response = await window.api.request(`/admin/products/${id}`, { method: 'DELETE' });
          
          if (response.success) {
            window.notifications.success('Producto eliminado exitosamente');
            if (window.adminManager) {
              window.adminManager.loadProducts();
            }
          } else {
            window.notifications.error('Error al eliminar producto');
          }
        } catch (error) {
          window.notifications.error('Error al eliminar producto');
        }
      }
    };

    // Category Modal
    this.openCategoryModal = () => {
      if (this.isLoading) {
        window.notifications?.warning('Por favor espera, hay una operación en curso...');
        return;
      }
      
      const modal = document.getElementById('categoryModal');
      if (!modal) {
        console.error('Modal de categoría no encontrado');
        return;
      }
      
      this.currentEditId = null;
      const form = document.getElementById('categoryForm');
      if (form) form.reset();
      
      const title = document.getElementById('categoryModalTitle');
      if (title) title.textContent = 'Crear Categoría';
      
      // Limpiar errores previos
      modal.querySelectorAll('.error-message').forEach(err => err.remove());
      modal.querySelectorAll('input, select, textarea').forEach(input => {
        input.style.borderColor = '';
      });
      
      modal.style.display = 'flex';
    };

    this.editCategory = async (id) => {
      if (this.isLoading) {
        window.notifications?.warning('Por favor espera, hay una operación en curso...');
        return;
      }
      
      this.isLoading = true;
      const modal = document.getElementById('categoryModal');
      if (!modal) {
        console.error('Modal de categoría no encontrado');
        this.isLoading = false;
        return;
      }
      
      try {
        this.currentEditId = id;
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
        
        // Mostrar loading overlay sin reemplazar el contenido completo
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
          throw new Error('Contenido del modal no encontrado');
        }
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'categoryModalLoading';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; pointer-events: auto;';
        loadingOverlay.innerHTML = '<div style="text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 16px;">Cargando categoría...</p></div>';
        
        loadingOverlay.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        
        const currentPosition = window.getComputedStyle(modalContent).position;
        if (currentPosition === 'static') {
          modalContent.style.position = 'relative';
        }
        
        modal.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 150));
        modalContent.appendChild(loadingOverlay);
        
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró antes de cargar datos');
          return;
        }
        
        await this.loadCategoryForEdit(id);
        
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró durante la carga de datos');
          return;
        }
        
        // Remover loading overlay
        const overlay = document.getElementById('categoryModalLoading');
        if (overlay) overlay.remove();
      } catch (error) {
        console.error('Error loading category for edit:', error);
        const overlay = document.getElementById('categoryModalLoading');
        if (overlay) overlay.remove();
        modal.style.display = 'none';
        window.notifications?.error('Error al cargar categoría: ' + (error.message || 'Error desconocido'));
      } finally {
        this.isLoading = false;
      }
    };

    this.deleteCategory = async (id) => {
      if (confirm('¿Estás seguro de eliminar esta categoría?')) {
        try {
          const response = await window.api.request(`/admin/categories/${id}`, { method: 'DELETE' });
          
          if (response.success) {
            window.notifications.success('Categoría eliminada exitosamente');
            if (window.adminManager) {
              window.adminManager.loadCategories();
            }
          } else {
            window.notifications.error('Error al eliminar categoría');
          }
        } catch (error) {
          window.notifications.error('Error al eliminar categoría');
        }
      }
    };

    // User Modal
    this.editUser = async (id) => {
      if (this.isLoading) {
        window.notifications?.warning('Por favor espera, hay una operación en curso...');
        return;
      }
      
      this.isLoading = true;
      const modal = document.getElementById('userModal');
      if (!modal) {
        console.error('Modal de usuario no encontrado');
        this.isLoading = false;
        return;
      }
      
      try {
        this.currentEditId = id;
        document.getElementById('userModalTitle').textContent = 'Editar Usuario';
        
        // Mostrar loading overlay sin reemplazar el contenido completo
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
          throw new Error('Contenido del modal no encontrado');
        }
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'userModalLoading';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; pointer-events: auto;';
        loadingOverlay.innerHTML = '<div style="text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 16px;">Cargando usuario...</p></div>';
        
        loadingOverlay.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        
        const currentPosition = window.getComputedStyle(modalContent).position;
        if (currentPosition === 'static') {
          modalContent.style.position = 'relative';
        }
        
        modal.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 150));
        modalContent.appendChild(loadingOverlay);
        
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró antes de cargar datos');
          return;
        }
        
        await this.loadUserForEdit(id);
        
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró durante la carga de datos');
          return;
        }
        
        // Remover loading overlay
        const overlay = document.getElementById('userModalLoading');
        if (overlay) overlay.remove();
      } catch (error) {
        console.error('Error loading user for edit:', error);
        const overlay = document.getElementById('userModalLoading');
        if (overlay) overlay.remove();
        modal.style.display = 'none';
        window.notifications?.error('Error al cargar usuario: ' + (error.message || 'Error desconocido'));
      } finally {
        this.isLoading = false;
      }
    };

    // Review Modal
    this.editReview = async (id) => {
      if (this.isLoading) {
        window.notifications?.warning('Por favor espera, hay una operación en curso...');
        return;
      }
      
      this.isLoading = true;
      const modal = document.getElementById('reviewModal');
      if (!modal) {
        console.error('Modal de reseña no encontrado');
        this.isLoading = false;
        return;
      }
      
      try {
        this.currentEditId = id;
        document.getElementById('reviewModalTitle').textContent = 'Editar Reseña';
        
        // Mostrar loading overlay sin reemplazar el contenido completo
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) {
          throw new Error('Contenido del modal no encontrado');
        }
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'reviewModalLoading';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; pointer-events: auto;';
        loadingOverlay.innerHTML = '<div style="text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 16px;">Cargando reseña...</p></div>';
        
        loadingOverlay.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        
        const currentPosition = window.getComputedStyle(modalContent).position;
        if (currentPosition === 'static') {
          modalContent.style.position = 'relative';
        }
        
        modal.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 150));
        modalContent.appendChild(loadingOverlay);
        
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró antes de cargar datos');
          return;
        }
        
        await this.loadReviewForEdit(id);
        
        if (modal.style.display !== 'flex') {
          console.warn('Modal se cerró durante la carga de datos');
          return;
        }
        
        // Remover loading overlay
        const overlay = document.getElementById('reviewModalLoading');
        if (overlay) overlay.remove();
      } catch (error) {
        console.error('Error loading review for edit:', error);
        const overlay = document.getElementById('reviewModalLoading');
        if (overlay) overlay.remove();
        modal.style.display = 'none';
        window.notifications?.error('Error al cargar reseña: ' + (error.message || 'Error desconocido'));
      } finally {
        this.isLoading = false;
      }
    };

    this.deleteReview = async (id) => {
      if (confirm('¿Estás seguro de eliminar esta reseña?')) {
        try {
          const response = await window.api.request(`/admin/reviews/${id}`, { method: 'DELETE' });
          
          if (response.success) {
            window.notifications.success('Reseña eliminada exitosamente');
            if (window.adminManager) {
              window.adminManager.loadReviews();
            }
          } else {
            window.notifications.error('Error al eliminar reseña');
          }
        } catch (error) {
          window.notifications.error('Error al eliminar reseña');
        }
      }
    };

    // Order Modal
    this.viewOrder = async (id) => {
      await this.loadOrderDetails(id);
      document.getElementById('orderModal').style.display = 'flex';
    };

    // Close modals - Usar delegación de eventos para evitar múltiples listeners
    // Este listener se configura una sola vez usando la bandera modalBackdropSetup
    // El cierre de modales se maneja en setupModalBackdrop() para evitar duplicados
  }

  setupForms() {
    // Usar una bandera para evitar múltiples listeners
    if (this.formsSetup) return;
    
    // Product Form
    const productForm = document.getElementById('productForm');
    if (productForm && !productForm.dataset.listenerAdded) {
      productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLoading) return;
        await this.saveProduct();
      }, { once: false });
      productForm.dataset.listenerAdded = 'true';
    }

    // Preview de imagen en modal de productos
    const imageFileInput = document.getElementById('productImageFile');
    if (imageFileInput) {
      imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById('previewImage').src = event.target.result;
            document.getElementById('imagePreview').style.display = 'block';
          };
          reader.readAsDataURL(file);
        } else {
          document.getElementById('imagePreview').style.display = 'none';
        }
      });
    }

    // Category Form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm && !categoryForm.dataset.listenerAdded) {
      categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLoading) return;
        await this.saveCategory();
      }, { once: false });
      categoryForm.dataset.listenerAdded = 'true';
    }

    // User Form
    const userForm = document.getElementById('userForm');
    if (userForm && !userForm.dataset.listenerAdded) {
      userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLoading) return;
        await this.saveUser();
      }, { once: false });
      userForm.dataset.listenerAdded = 'true';
    }

    // Review Form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm && !reviewForm.dataset.listenerAdded) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLoading) return;
        await this.saveReview();
      }, { once: false });
      reviewForm.dataset.listenerAdded = 'true';
    }
    
    this.formsSetup = true;
  }

  // ===== PRODUCTS =====
  async loadProductForEdit(id) {
    try {
      console.log('🔍 Loading product for edit:', id);
      
      // Usar el endpoint correcto para admin
      const response = await window.api.request(`/admin/products/${id}`);
      
      console.log('📦 Product response:', response);
      
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      if (!response.success) {
        throw new Error(response?.message || response?.error || 'Error al obtener producto');
      }
      
      // Manejar diferentes formatos de respuesta
      const product = response.data?.product || response.data || response.product;
      if (!product) {
        console.error('❌ Product data structure:', response);
        throw new Error('Producto no encontrado en la respuesta');
      }
      
      console.log('✅ Product loaded:', product);
      
      // Verificar que los elementos existan antes de asignar valores
      const nameInput = document.getElementById('productName');
      const slugInput = document.getElementById('productSlug');
      const descInput = document.getElementById('productDescription');
      const priceInput = document.getElementById('productPrice');
      const discountPriceInput = document.getElementById('productDiscountPrice');
      const stockInput = document.getElementById('productStock');
      const categoryInput = document.getElementById('productCategory');
      const brandInput = document.getElementById('productBrand');
      const skuInput = document.getElementById('productSKU');
      const imageInput = document.getElementById('productImage');
      const previewImage = document.getElementById('previewImage');
      const imageContainer = document.getElementById('imagePreviewContainer');
      const imageFileName = document.getElementById('imageFileName');
      const weightInput = document.getElementById('productWeight');
      const dimensionsInput = document.getElementById('productDimensions');
      const isActiveInput = document.getElementById('productIsActive');
      
      if (!nameInput || !slugInput || !priceInput || !stockInput || !categoryInput) {
        throw new Error('Algunos campos del formulario no se encontraron');
      }
      
      nameInput.value = product.name || '';
      slugInput.value = product.slug || '';
      slugInput.dataset.manualEdit = 'true';
      
      if (descInput) descInput.value = product.description || '';
      priceInput.value = product.price || '';
      if (discountPriceInput) discountPriceInput.value = product.discount_price || '';
      stockInput.value = product.stock_quantity || 0;
      categoryInput.value = product.category_id || '';
      if (brandInput) brandInput.value = product.brand || '';
      if (skuInput) skuInput.value = product.sku || '';
      
      // Mostrar imagen existente si hay
      if (product.image_url && imageInput && previewImage && imageContainer && imageFileName) {
        imageInput.value = product.image_url;
        previewImage.src = product.image_url;
        imageContainer.style.display = 'block';
        imageFileName.textContent = 'Imagen actual';
      }
      
      // Cargar weight y dimensions desde specifications si existen
      if (weightInput || dimensionsInput) {
        let weight = '';
        let dimensions = '';
        if (product.specifications) {
          try {
            const specs = typeof product.specifications === 'string' 
              ? JSON.parse(product.specifications) 
              : product.specifications;
            weight = specs.weight || '';
            dimensions = specs.dimensions || '';
          } catch (e) {
            console.log('Error parsing specifications:', e);
          }
        }
        if (weightInput) weightInput.value = weight;
        if (dimensionsInput) dimensionsInput.value = dimensions;
      }
      
      if (isActiveInput) {
        isActiveInput.checked = product.is_active !== false;
      }
    } catch (error) {
      console.error('Error loading product for edit:', error);
      throw error; // Re-lanzar para que el caller maneje el error
    }
  }

  async saveProduct() {
    if (this.isLoading) {
      window.notifications?.warning('Por favor espera, hay una operación en curso...');
      return;
    }
    
    this.isLoading = true;
    
    // Obtener elementos del formulario
    const nameInput = document.getElementById('productName');
    const slugInput = document.getElementById('productSlug');
    const priceInput = document.getElementById('productPrice');
    const categoryInput = document.getElementById('productCategory');
    const stockInput = document.getElementById('productStock');
    
    // Limpiar errores previos
    [nameInput, slugInput, priceInput, categoryInput, stockInput].forEach(input => {
      if (input) {
        input.style.borderColor = '';
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });
    
    // Validaciones
    const name = nameInput.value.trim();
    const slug = slugInput.value.trim();
    const price = priceInput.value;
    const category = categoryInput.value;
    const stock = stockInput.value;
    
    let hasErrors = false;
    
    const showError = (input, message) => {
      if (!input) return;
      hasErrors = true;
      input.style.borderColor = '#ef4444';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.color = '#ef4444';
      errorDiv.style.fontSize = '12px';
      errorDiv.style.marginTop = '4px';
      errorDiv.textContent = message;
      input.parentElement.appendChild(errorDiv);
    };

    if (!name || name.length < 3) {
      showError(nameInput, 'El nombre debe tener al menos 3 caracteres');
    }

    if (!slug || slug.length < 3) {
      showError(slugInput, 'El slug debe tener al menos 3 caracteres');
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      showError(slugInput, 'El slug solo puede contener letras minúsculas, números y guiones');
    }

    if (!price || parseFloat(price) <= 0) {
      showError(priceInput, 'El precio debe ser mayor a 0');
    } else if (isNaN(parseFloat(price))) {
      showError(priceInput, 'El precio debe ser un número válido');
    }

    if (!category) {
      showError(categoryInput, 'Debes seleccionar una categoría');
    }

    if (stock === '' || parseInt(stock) < 0) {
      showError(stockInput, 'El stock debe ser mayor o igual a 0');
    } else if (isNaN(parseInt(stock))) {
      showError(stockInput, 'El stock debe ser un número válido');
    }
    
    if (hasErrors) {
      window.notifications?.error('Por favor, corrige los errores en el formulario');
      return;
    }

    // Verificar que haya una imagen (URL o archivo) solo si es un producto nuevo
    const imageFileInput = document.getElementById('productImageFile');
    const imageUrl = document.getElementById('productImage').value.trim();
    
    // Solo validar imagen si es un producto nuevo, si es edición y no hay cambios, mantener la existente
    if (!this.currentEditId && !imageFileInput.files.length && !imageUrl) {
      window.notifications.error('Debes subir una imagen o ingresar una URL de imagen');
      return;
    }

    // Preparar datos del producto
    const brandValue = document.getElementById('productBrand').value.trim();
    if (!brandValue) {
      window.notifications.error('La marca es requerida');
      return;
    }

    const productData = {
      name: name,
      slug: slug,
      description: document.getElementById('productDescription').value.trim() || null,
      price: parseFloat(price),
      discount_price: document.getElementById('productDiscountPrice').value ? parseFloat(document.getElementById('productDiscountPrice').value) : null,
      stock_quantity: parseInt(stock),
      category_id: category,
      brand: brandValue, // Brand es requerido en la BD
      sku: document.getElementById('productSKU').value.trim() || null,
      // weight y dimensions no existen en la tabla products, se guardan en specifications si es necesario
      is_active: document.getElementById('productIsActive').checked
      // rating y review_count tienen valores por defecto en la BD, no necesitamos enviarlos
    };

    // Si hay peso o dimensiones, guardarlos en specifications como JSON
    const weight = document.getElementById('productWeight').value.trim();
    const dimensions = document.getElementById('productDimensions').value.trim();
    if (weight || dimensions) {
      productData.specifications = JSON.stringify({
        ...(weight ? { weight: weight } : {}),
        ...(dimensions ? { dimensions: dimensions } : {})
      });
    }

    // Mostrar loading en el botón de guardar
    const submitBtn = document.querySelector('#productForm button[type="submit"]');
    const originalBtnText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading-spinner small"></div> Guardando...';
    }

    try {
      // Si hay una imagen para subir, subirla primero
      if (imageFileInput.files.length > 0) {
        window.notifications?.show('Subiendo imagen...', 'info');
        try {
          const uploadResponse = await window.api.uploadImage(imageFileInput.files[0]);
          console.log('Upload response:', uploadResponse);
          
          if (uploadResponse && uploadResponse.success) {
            // Usar la URL de la imagen subida
            const imageUrl = uploadResponse.data?.url;
            if (imageUrl) {
              // Usar la URL completa tal como viene del backend
              productData.image_url = imageUrl;
              console.log('Image URL set to:', productData.image_url);
              window.notifications.show('Imagen subida exitosamente', 'success');
            } else {
              console.error('Upload response structure:', uploadResponse);
              throw new Error('No se recibió URL de imagen en la respuesta');
            }
          } else {
            throw new Error(uploadResponse?.message || 'Error al subir la imagen');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          window.notifications.error('Error al subir imagen: ' + (uploadError.message || 'Error desconocido'));
          return;
        }
      } else if (imageUrl) {
        // Validar URL de imagen
        try {
          new URL(imageUrl);
          productData.image_url = imageUrl;
        } catch (e) {
          window.notifications.error('URL de imagen inválida');
          return;
        }
      }
      // Si es edición y no hay nueva imagen ni URL, no incluir image_url para mantener la existente
      
      console.log('Product data to save:', productData);
      
      const url = this.currentEditId 
        ? `/admin/products/${this.currentEditId}`
        : '/admin/products';
      
      const method = this.currentEditId ? 'PUT' : 'POST';
      
      const response = await window.api.request(url, {
        method,
        body: JSON.stringify(productData)
      });
      
      console.log('Save product response:', response);
      
      if (response && response.success) {
        window.notifications.success(
          this.currentEditId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'
        );
        document.getElementById('productModal').style.display = 'none';
        
        // Resetear formulario y preview
        document.getElementById('productForm').reset();
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('previewImage').src = '';
        document.getElementById('imageFileName').textContent = '';
        document.getElementById('productImageFile').value = '';
        const slugInput = document.getElementById('productSlug');
        if (slugInput) {
          slugInput.dataset.manualEdit = '';
        }
        
        if (window.adminManager) {
          window.adminManager.loadProducts();
        }
      } else {
        console.error('Error response:', response);
        window.notifications.error(response?.message || response?.error || 'Error al guardar producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      window.notifications.error('Error al guardar producto: ' + (error.message || 'Error desconocido'));
    } finally {
      // Restaurar botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || 'Guardar';
      }
      this.isLoading = false;
    }
  }

  // ===== CATEGORIES =====
  async loadCategoryForEdit(id) {
    try {
      const response = await window.api.request(`/categories/${id}`);
      
      if (!response || !response.success) {
        throw new Error(response?.message || response?.error || 'Error al obtener categoría');
      }
      
      const category = response.data?.category;
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
      
      const nameInput = document.getElementById('categoryName');
      const slugInput = document.getElementById('categorySlug');
      const descInput = document.getElementById('categoryDescription');
      const imageInput = document.getElementById('categoryImage');
      
      if (!nameInput || !slugInput) {
        throw new Error('Algunos campos del formulario no se encontraron');
      }
      
      nameInput.value = category.name || '';
      slugInput.value = category.slug || '';
      if (descInput) descInput.value = category.description || '';
      if (imageInput) imageInput.value = category.image_url || '';
    } catch (error) {
      console.error('Error loading category for edit:', error);
      throw error; // Re-lanzar para que el caller maneje el error
    }
  }

  async saveCategory() {
    if (this.isLoading) {
      window.notifications?.warning('Por favor espera, hay una operación en curso...');
      return;
    }
    
    this.isLoading = true;
    
    // Obtener elementos del formulario
    const nameInput = document.getElementById('categoryName');
    const slugInput = document.getElementById('categorySlug');
    
    // Limpiar errores previos
    [nameInput, slugInput].forEach(input => {
      if (input) {
        input.style.borderColor = '';
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });
    
    // Validaciones
    const name = nameInput.value.trim();
    const slug = slugInput.value.trim();
    
    let hasErrors = false;
    
    const showError = (input, message) => {
      if (!input) return;
      hasErrors = true;
      input.style.borderColor = '#ef4444';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.color = '#ef4444';
      errorDiv.style.fontSize = '12px';
      errorDiv.style.marginTop = '4px';
      errorDiv.textContent = message;
      input.parentElement.appendChild(errorDiv);
    };

    if (!name || name.length < 2) {
      showError(nameInput, 'El nombre debe tener al menos 2 caracteres');
    }

    if (!slug || slug.length < 2) {
      showError(slugInput, 'El slug debe tener al menos 2 caracteres');
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      showError(slugInput, 'El slug solo puede contener letras minúsculas, números y guiones');
    }
    
    if (hasErrors) {
      window.notifications?.error('Por favor, corrige los errores en el formulario');
      this.isLoading = false;
      return;
    }

    const categoryData = {
      name: name,
      slug: slug,
      description: document.getElementById('categoryDescription').value.trim() || null,
      image_url: document.getElementById('categoryImage').value.trim() || null
    };

    // Mostrar loading en el botón de guardar
    const submitBtn = document.querySelector('#categoryForm button[type="submit"]');
    const originalBtnText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading-spinner small"></div> Guardando...';
    }

    try {
      const url = this.currentEditId 
        ? `/admin/categories/${this.currentEditId}`
        : '/admin/categories';
      
      const method = this.currentEditId ? 'PUT' : 'POST';
      
      const response = await window.api.request(url, {
        method,
        body: JSON.stringify(categoryData)
      });
      
      if (response.success) {
        window.notifications.success(
          this.currentEditId ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente'
        );
        document.getElementById('categoryModal').style.display = 'none';
        if (window.adminManager) {
          window.adminManager.loadCategories();
        }
      } else {
        window.notifications.error(response.message || response.error || 'Error al guardar categoría');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      window.notifications.error('Error al guardar categoría: ' + (error.message || 'Error desconocido'));
    } finally {
      // Restaurar botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || 'Guardar';
      }
      this.isLoading = false;
    }
  }

  // ===== USERS =====
  async loadUserForEdit(id) {
    try {
      const response = await window.api.request(`/admin/users/${id}`);
      
      if (!response || !response.success) {
        throw new Error(response?.message || response?.error || 'Error al obtener usuario');
      }
      
      const user = response.data?.user;
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      const firstNameInput = document.getElementById('userFirstName');
      const lastNameInput = document.getElementById('userLastName');
      const emailInput = document.getElementById('userEmail');
      const phoneInput = document.getElementById('userPhone');
      const roleInput = document.getElementById('userRole');
      const emailVerifiedInput = document.getElementById('userEmailVerified');
      
      if (!firstNameInput || !lastNameInput || !emailInput || !roleInput) {
        throw new Error('Algunos campos del formulario no se encontraron');
      }
      
      firstNameInput.value = user.first_name || '';
      lastNameInput.value = user.last_name || '';
      emailInput.value = user.email || '';
      if (phoneInput) phoneInput.value = user.phone || '';
      roleInput.value = user.role || 'client';
      if (emailVerifiedInput) emailVerifiedInput.checked = user.email_verified || false;
    } catch (error) {
      console.error('Error loading user for edit:', error);
      throw error; // Re-lanzar para que el caller maneje el error
    }
  }

  async saveUser() {
    const userData = {
      first_name: document.getElementById('userFirstName').value,
      last_name: document.getElementById('userLastName').value,
      email: document.getElementById('userEmail').value,
      phone: document.getElementById('userPhone').value,
      role: document.getElementById('userRole').value,
      email_verified: document.getElementById('userEmailVerified').checked
    };

    try {
      const url = `/admin/users/${this.currentEditId}`;
      
      const response = await window.api.request(url, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      
      if (response.success) {
        window.notifications.success('Usuario actualizado exitosamente');
        document.getElementById('userModal').style.display = 'none';
        if (window.adminManager) {
          window.adminManager.loadUsers();
        }
      } else {
        window.notifications.error(response.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      window.notifications.error('Error al actualizar usuario');
    }
  }

  // ===== REVIEWS =====
  async loadReviewForEdit(id) {
    try {
      const response = await window.api.request(`/admin/reviews/${id}`);
      
      if (!response || !response.success) {
        throw new Error(response?.message || response?.error || 'Error al obtener reseña');
      }
      
      const review = response.data?.review;
      if (!review) {
        throw new Error('Reseña no encontrada');
      }
      
      const ratingInput = document.getElementById('reviewRating');
      const titleInput = document.getElementById('reviewTitle');
      const commentInput = document.getElementById('reviewComment');
      const isApprovedInput = document.getElementById('reviewIsApproved');
      
      if (!ratingInput || !isApprovedInput) {
        throw new Error('Algunos campos del formulario no se encontraron');
      }
      
      ratingInput.value = review.rating || 5;
      if (titleInput) titleInput.value = review.title || '';
      if (commentInput) commentInput.value = review.comment || '';
      isApprovedInput.checked = review.is_approved || false;
    } catch (error) {
      console.error('Error loading review for edit:', error);
      throw error; // Re-lanzar para que el caller maneje el error
    }
  }

  async saveReview() {
    const reviewData = {
      rating: parseInt(document.getElementById('reviewRating').value),
      title: document.getElementById('reviewTitle').value,
      comment: document.getElementById('reviewComment').value,
      is_approved: document.getElementById('reviewIsApproved').checked
    };

    try {
      const url = `/admin/reviews/${this.currentEditId}`;
      
      const response = await window.api.request(url, {
        method: 'PUT',
        body: JSON.stringify(reviewData)
      });
      
      if (response.success) {
        window.notifications.success('Reseña actualizada exitosamente');
        document.getElementById('reviewModal').style.display = 'none';
        if (window.adminManager) {
          window.adminManager.loadReviews();
        }
      } else {
        window.notifications.error(response.message || 'Error al actualizar reseña');
      }
    } catch (error) {
      window.notifications.error('Error al actualizar reseña');
    }
  }

  // ===== ORDERS =====
  async loadOrderDetails(id) {
    try {
      const response = await window.api.request(`/admin/orders/${id}`);
      
      if (response.success) {
        const order = response.data.order;
        const items = response.data.items || [];
        
        // Actualizar información del pedido
        document.getElementById('orderDetailsNumber').textContent = order.order_number;
        document.getElementById('orderDetailsCustomer').textContent = 
          order.shipping_full_name || 'N/A';
        document.getElementById('orderDetailsEmail').textContent = order.shipping_email || '-';
        document.getElementById('orderDetailsPhone').textContent = order.shipping_phone || '-';
        document.getElementById('orderDetailsDate').textContent = 
          new Date(order.created_at).toLocaleString('es-PE');
        
        // Estado del pedido
        const statusText = this.getStatusText(order.status);
        const statusBadge = this.getStatusBadgeClass(order.status);
        document.getElementById('orderDetailsStatus').innerHTML = 
          `<span class="badge badge-${statusBadge}">${statusText}</span>`;
        
        // Estado de pago
        const paymentText = this.getPaymentText(order.payment_status);
        const paymentBadge = this.getPaymentBadgeClass(order.payment_status);
        document.getElementById('orderDetailsPaymentStatus').innerHTML = 
          `<span class="badge badge-${paymentBadge}">${paymentText}</span>`;
        
        document.getElementById('orderDetailsPaymentMethod').textContent = order.payment_method || '-';
        document.getElementById('orderDetailsSubtotal').textContent = `S/ ${parseFloat(order.subtotal || 0).toFixed(2)}`;
        document.getElementById('orderDetailsShipping').textContent = `S/ ${parseFloat(order.shipping_cost || 0).toFixed(2)}`;
        document.getElementById('orderDetailsTax').textContent = `S/ ${parseFloat(order.tax || 0).toFixed(2)}`;
        document.getElementById('orderDetailsTotal').textContent = `S/ ${parseFloat(order.total_amount || 0).toFixed(2)}`;
        document.getElementById('orderDetailsAddress').textContent = 
          `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_country}`;
        
        // Actualizar items
        const itemsContainer = document.getElementById('orderDetailsItems');
        if (items.length === 0) {
          itemsContainer.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay items</td></tr>';
        } else {
          itemsContainer.innerHTML = items.map(item => `
            <tr>
              <td>${item.product_name || '-'}</td>
              <td>${item.product_sku || '-'}</td>
              <td>S/ ${parseFloat(item.price || 0).toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>S/ ${parseFloat(item.total || 0).toFixed(2)}</td>
            </tr>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      window.notifications.error('Error al cargar detalles del pedido');
    }
  }
  
  // Helpers para status
  getStatusText(status) {
    const statusTexts = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || status;
  }
  
  getStatusBadgeClass(status) {
    const classes = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'info',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return classes[status] || 'info';
  }
  
  getPaymentText(status) {
    const texts = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'failed': 'Fallido',
      'refunded': 'Reembolsado'
    };
    return texts[status] || status;
  }
  
  getPaymentBadgeClass(status) {
    const classes = {
      'pending': 'warning',
      'paid': 'success',
      'failed': 'danger',
      'refunded': 'info'
    };
    return classes[status] || 'info';
  }
}

// Inicializar CRUD
const adminCRUD = new AdminCRUD();
window.adminCRUD = adminCRUD;

// Exponer métodos globalmente para compatibilidad con onclick handlers
window.openProductModal = () => adminCRUD.openProductModal();
window.editProduct = (id) => adminCRUD.editProduct(id);
window.deleteProduct = (id) => adminCRUD.deleteProduct(id);
window.openCategoryModal = () => adminCRUD.openCategoryModal();
window.editCategory = (id) => adminCRUD.editCategory(id);
window.deleteCategory = (id) => adminCRUD.deleteCategory(id);
window.editUser = (id) => adminCRUD.editUser(id);
window.editReview = (id) => adminCRUD.editReview(id);
window.deleteReview = (id) => adminCRUD.deleteReview(id);
window.viewOrder = (id) => adminCRUD.viewOrder(id);





