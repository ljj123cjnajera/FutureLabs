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
  }

  setupModals() {
    // Product Modal
    window.openProductModal = () => {
      this.currentEditId = null;
      document.getElementById('productForm').reset();
      document.getElementById('productModalTitle').textContent = 'Crear Producto';
      document.getElementById('productModal').style.display = 'flex';
    };

    window.editProduct = async (id) => {
      this.currentEditId = id;
      await this.loadProductForEdit(id);
      document.getElementById('productModalTitle').textContent = 'Editar Producto';
      document.getElementById('productModal').style.display = 'flex';
    };

    window.deleteProduct = async (id) => {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
          const response = await window.api.request(`/admin/products/${id}`, { method: 'DELETE' });
          
          if (response.success) {
            window.notifications.success('Producto eliminado exitosamente');
            adminManager.loadProducts();
          } else {
            window.notifications.error('Error al eliminar producto');
          }
        } catch (error) {
          window.notifications.error('Error al eliminar producto');
        }
      }
    };

    // Category Modal
    window.openCategoryModal = () => {
      this.currentEditId = null;
      document.getElementById('categoryForm').reset();
      document.getElementById('categoryModalTitle').textContent = 'Crear Categoría';
      document.getElementById('categoryModal').style.display = 'flex';
    };

    window.editCategory = async (id) => {
      this.currentEditId = id;
      await this.loadCategoryForEdit(id);
      document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
      document.getElementById('categoryModal').style.display = 'flex';
    };

    window.deleteCategory = async (id) => {
      if (confirm('¿Estás seguro de eliminar esta categoría?')) {
        try {
          const response = await window.api.request(`/admin/categories/${id}`, { method: 'DELETE' });
          
          if (response.success) {
            window.notifications.success('Categoría eliminada exitosamente');
            adminManager.loadCategories();
          } else {
            window.notifications.error('Error al eliminar categoría');
          }
        } catch (error) {
          window.notifications.error('Error al eliminar categoría');
        }
      }
    };

    // User Modal
    window.editUser = async (id) => {
      this.currentEditId = id;
      await this.loadUserForEdit(id);
      document.getElementById('userModalTitle').textContent = 'Editar Usuario';
      document.getElementById('userModal').style.display = 'flex';
    };

    // Review Modal
    window.editReview = async (id) => {
      this.currentEditId = id;
      await this.loadReviewForEdit(id);
      document.getElementById('reviewModalTitle').textContent = 'Editar Reseña';
      document.getElementById('reviewModal').style.display = 'flex';
    };

    window.deleteReview = async (id) => {
      if (confirm('¿Estás seguro de eliminar esta reseña?')) {
        try {
          const response = await window.api.request(`/admin/reviews/${id}`, { method: 'DELETE' });
          
          if (response.success) {
            window.notifications.success('Reseña eliminada exitosamente');
            adminManager.loadReviews();
          } else {
            window.notifications.error('Error al eliminar reseña');
          }
        } catch (error) {
          window.notifications.error('Error al eliminar reseña');
        }
      }
    };

    // Order Modal
    window.viewOrder = async (id) => {
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
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscountPrice').value = product.discount_price || '';
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productCategory').value = product.category_id;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productSKU').value = product.sku || '';
        document.getElementById('productImage').value = product.image_url || '';
        document.getElementById('productWeight').value = product.weight || '';
        document.getElementById('productDimensions').value = product.dimensions || '';
        document.getElementById('productIsActive').checked = product.is_active !== false;
      }
    } catch (error) {
      window.notifications.error('Error al cargar producto');
    }
  }

  async saveProduct() {
    const productData = {
      name: document.getElementById('productName').value,
      slug: document.getElementById('productSlug').value,
      description: document.getElementById('productDescription').value,
      price: parseFloat(document.getElementById('productPrice').value),
      discount_price: document.getElementById('productDiscountPrice').value ? parseFloat(document.getElementById('productDiscountPrice').value) : null,
      stock_quantity: parseInt(document.getElementById('productStock').value),
      category_id: document.getElementById('productCategory').value,
      brand: document.getElementById('productBrand').value,
      sku: document.getElementById('productSKU').value,
      image_url: document.getElementById('productImage').value,
      weight: document.getElementById('productWeight').value,
      dimensions: document.getElementById('productDimensions').value,
      is_active: document.getElementById('productIsActive').checked
    };

    try {
      const url = this.currentEditId 
        ? `/admin/products/${this.currentEditId}`
        : '/admin/products';
      
      const method = this.currentEditId ? 'PUT' : 'POST';
      
      const response = await window.api.request(url, {
        method,
        body: JSON.stringify(productData)
      });
      
      if (response.success) {
        window.notifications.success(
          this.currentEditId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'
        );
        document.getElementById('productModal').style.display = 'none';
        adminManager.loadProducts();
      } else {
        window.notifications.error(response.message || 'Error al guardar producto');
      }
    } catch (error) {
      window.notifications.error('Error al guardar producto');
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
    const categoryData = {
      name: document.getElementById('categoryName').value,
      slug: document.getElementById('categorySlug').value,
      description: document.getElementById('categoryDescription').value,
      image_url: document.getElementById('categoryImage').value
    };

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
        adminManager.loadCategories();
      } else {
        window.notifications.error(response.message || 'Error al guardar categoría');
      }
    } catch (error) {
      window.notifications.error('Error al guardar categoría');
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
        adminManager.loadUsers();
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
        adminManager.loadReviews();
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
        const items = response.data.items;
        
        // Actualizar información del pedido
        document.getElementById('orderDetailsNumber').textContent = order.order_number;
        document.getElementById('orderDetailsCustomer').textContent = 
          `${order.first_name} ${order.last_name}`;
        document.getElementById('orderDetailsEmail').textContent = order.email;
        document.getElementById('orderDetailsPhone').textContent = order.phone || '-';
        document.getElementById('orderDetailsDate').textContent = 
          new Date(order.created_at).toLocaleString('es-PE');
        document.getElementById('orderDetailsStatus').textContent = order.status;
        document.getElementById('orderDetailsPaymentStatus').textContent = order.payment_status;
        document.getElementById('orderDetailsPaymentMethod').textContent = order.payment_method || '-';
        document.getElementById('orderDetailsSubtotal').textContent = `S/ ${parseFloat(order.subtotal).toFixed(2)}`;
        document.getElementById('orderDetailsShipping').textContent = `S/ ${parseFloat(order.shipping_cost).toFixed(2)}`;
        document.getElementById('orderDetailsTax').textContent = `S/ ${parseFloat(order.tax).toFixed(2)}`;
        document.getElementById('orderDetailsTotal').textContent = `S/ ${parseFloat(order.total_amount).toFixed(2)}`;
        document.getElementById('orderDetailsAddress').textContent = 
          `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_country}`;
        
        // Actualizar items
        const itemsContainer = document.getElementById('orderDetailsItems');
        itemsContainer.innerHTML = items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.product_sku}</td>
            <td>S/ ${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>S/ ${parseFloat(item.total).toFixed(2)}</td>
          </tr>
        `).join('');
      }
    } catch (error) {
      window.notifications.error('Error al cargar detalles del pedido');
    }
  }
}

// Inicializar CRUD
const adminCRUD = new AdminCRUD();





