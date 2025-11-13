// 🎛️ CRUD de Administración
class AdminCRUD {
  constructor() {
    this.currentEditId = null;
    this.init();
  }

  init() {
    // Setup modales
    this.setupModals();
    
    // Setup formularios
    this.setupForms();
    
    // Generación automática de slug
    this.setupSlugGeneration();
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
      this.currentEditId = id;
      await this.loadProductForEdit(id);
      document.getElementById('productModalTitle').textContent = 'Editar Producto';
      document.getElementById('productModal').style.display = 'flex';
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
      this.currentEditId = null;
      document.getElementById('categoryForm').reset();
      document.getElementById('categoryModalTitle').textContent = 'Crear Categoría';
      document.getElementById('categoryModal').style.display = 'flex';
    };

    this.editCategory = async (id) => {
      this.currentEditId = id;
      await this.loadCategoryForEdit(id);
      document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
      document.getElementById('categoryModal').style.display = 'flex';
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
      this.currentEditId = id;
      await this.loadUserForEdit(id);
      document.getElementById('userModalTitle').textContent = 'Editar Usuario';
      document.getElementById('userModal').style.display = 'flex';
    };

    // Review Modal
    this.editReview = async (id) => {
      this.currentEditId = id;
      await this.loadReviewForEdit(id);
      document.getElementById('reviewModalTitle').textContent = 'Editar Reseña';
      document.getElementById('reviewModal').style.display = 'flex';
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

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });
  }

  setupForms() {
    // Product Form
    document.getElementById('productForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveProduct();
    });

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
    document.getElementById('categoryForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveCategory();
    });

    // User Form
    document.getElementById('userForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveUser();
    });

    // Review Form
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveReview();
    });
  }

  // ===== PRODUCTS =====
  async loadProductForEdit(id) {
    try {
      const response = await window.api.request(`/products/${id}`);
      
      if (response.success) {
        const product = response.data.product;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSlug').value = product.slug;
        // Marcar slug como editado manualmente al cargar para edición
        const slugInput = document.getElementById('productSlug');
        if (slugInput) {
          slugInput.dataset.manualEdit = 'true';
        }
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscountPrice').value = product.discount_price || '';
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productCategory').value = product.category_id;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productSKU').value = product.sku || '';
        
        // Mostrar imagen existente si hay
        if (product.image_url) {
          document.getElementById('productImage').value = product.image_url;
          document.getElementById('previewImage').src = product.image_url;
          document.getElementById('imagePreviewContainer').style.display = 'block';
          document.getElementById('imageFileName').textContent = 'Imagen actual';
        }
        
        // Cargar weight y dimensions desde specifications si existen
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
        document.getElementById('productWeight').value = weight;
        document.getElementById('productDimensions').value = dimensions;
        document.getElementById('productIsActive').checked = product.is_active !== false;
      }
    } catch (error) {
      window.notifications.error('Error al cargar producto');
    }
  }

  async saveProduct() {
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
    }
  }

  // ===== CATEGORIES =====
  async loadCategoryForEdit(id) {
    try {
      const response = await window.api.request(`/categories/${id}`);
      
      if (response.success) {
        const category = response.data.category;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categorySlug').value = category.slug;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryImage').value = category.image_url || '';
      }
    } catch (error) {
      window.notifications.error('Error al cargar categoría');
    }
  }

  async saveCategory() {
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
    }
  }

  // ===== USERS =====
  async loadUserForEdit(id) {
    try {
      const response = await window.api.request(`/admin/users/${id}`);
      
      if (response.success) {
        const user = response.data.user;
        document.getElementById('userFirstName').value = user.first_name;
        document.getElementById('userLastName').value = user.last_name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPhone').value = user.phone || '';
        document.getElementById('userRole').value = user.role;
        document.getElementById('userEmailVerified').checked = user.email_verified;
      }
    } catch (error) {
      window.notifications.error('Error al cargar usuario');
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
      
      if (response.success) {
        const review = response.data.review;
        document.getElementById('reviewRating').value = review.rating;
        document.getElementById('reviewTitle').value = review.title || '';
        document.getElementById('reviewComment').value = review.comment || '';
        document.getElementById('reviewIsApproved').checked = review.is_approved;
      }
    } catch (error) {
      window.notifications.error('Error al cargar reseña');
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





