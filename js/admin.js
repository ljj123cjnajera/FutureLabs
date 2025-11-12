// 🎛️ Panel de Administración
class AdminManager {
  constructor() {
    this.currentSection = 'dashboard';
    this.init();
  }

  async init() {
    console.log('🔧 AdminManager init() - Iniciando...');
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('❌ No hay token en localStorage, redirigiendo a login...');
      window.location.href = 'admin-login.html';
      return;
    }

    console.log('✅ Token encontrado en localStorage');

    // Obtener usuario guardado en localStorage (desde admin-login.html)
    const adminUserStr = localStorage.getItem('admin_user');
    if (!adminUserStr) {
      console.log('❌ No hay información de usuario guardada, redirigiendo a login...');
      window.location.href = 'admin-login.html';
      return;
    }

    let user;
    try {
      user = JSON.parse(adminUserStr);
      console.log('✅ Usuario cargado de localStorage:', user.email);
    } catch (error) {
      console.error('Error parseando usuario:', error);
      window.location.href = 'admin-login.html';
      return;
    }
    
    // Verificar rol
    if (user.role !== 'admin' && user.role !== 'moderator') {
      console.log('❌ Usuario sin permisos de admin:', user.role);
      if (window.notifications) {
        window.notifications.error('No tienes permisos de administrador');
      }
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
      return;
    }

    console.log('✅ Usuario admin autenticado correctamente');

    // Actualizar UI del usuario
    this.updateUserInfo(user);

    // Setup navegación
    this.setupNavigation();

    // Cargar datos iniciales
    await this.loadDashboard();
  }

  updateUserInfo(user) {
    document.getElementById('userName').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('userAvatar').textContent = user.first_name.charAt(0);
    document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrador' : 'Moderador';
  }

  setupNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.showSection(section);
      });
    });
  }

  showSection(section) {
    // Actualizar menú
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');

    // Actualizar título
    const titles = {
      dashboard: 'Dashboard',
      products: 'Productos',
      categories: 'Categorías',
      orders: 'Pedidos',
      users: 'Usuarios',
      reviews: 'Reseñas',
      reports: 'Reportes',
      'hero-slides': 'Hero Slides',
      'banners': 'Banners',
      'benefits': 'Beneficios',
      'home-sections': 'Secciones del Home'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;

    // Cargar datos de la sección
    this.loadSectionData(section);
  }

  async loadSectionData(section) {
    switch(section) {
      case 'dashboard':
        await this.loadDashboard();
        break;
      case 'products':
        await this.loadProducts();
        break;
      case 'categories':
        await this.loadCategories();
        break;
      case 'orders':
        await this.loadOrders();
        break;
      case 'users':
        await this.loadUsers();
        break;
      case 'reviews':
        await this.loadReviews();
        break;
      case 'reports':
        // Reportes no necesitan cargar datos por ahora
        break;
      case 'hero-slides':
        if (window.adminHomeContent) {
          await window.adminHomeContent.loadHeroSlides();
        }
        break;
      case 'banners':
        if (window.adminHomeContent) {
          await window.adminHomeContent.loadBanners();
        }
        break;
      case 'benefits':
        if (window.adminHomeContent) {
          await window.adminHomeContent.loadBenefits();
        }
        break;
      case 'home-sections':
        if (window.adminHomeContent) {
          await window.adminHomeContent.loadHomeSections();
        }
        break;
    }
  }

  // Dashboard
  async loadDashboard() {
    try {
      const response = await window.api.request('/admin/dashboard/stats');
      
      if (response.success) {
        const { overview, orders_by_status, top_products, sales_by_day, payment_methods } = response.data;
        
        // Actualizar estadísticas
        document.getElementById('totalProducts').textContent = overview.total_products;
        document.getElementById('totalUsers').textContent = overview.total_users;
        document.getElementById('totalOrders').textContent = overview.total_orders;
        document.getElementById('totalSales').textContent = `S/ ${parseFloat(overview.total_sales).toFixed(2)}`;
        
        // Renderizar gráficos
        this.renderCharts(orders_by_status, top_products, sales_by_day, payment_methods);
        
        // Cargar pedidos recientes
        await this.loadRecentOrders();
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      window.notifications.error('Error al cargar dashboard');
    }
  }
  
  // Renderizar gráficos con Chart.js
  renderCharts(ordersByStatus, topProducts, salesByDay, paymentMethods) {
    // 1. Ventas de últimos 7 días (Línea)
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx && window.Chart) {
      new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: salesByDay.map(s => new Date(s.date).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Ventas (S/)',
            data: salesByDay.map(s => parseFloat(s.total)),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    
    // 2. Pedidos por estado (Dona)
    const ordersStatusCtx = document.getElementById('ordersStatusChart');
    if (ordersStatusCtx && window.Chart) {
      new Chart(ordersStatusCtx, {
        type: 'doughnut',
        data: {
          labels: ordersByStatus.map(s => s.status),
          datasets: [{
            data: ordersByStatus.map(s => parseInt(s.count)),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    
    // 3. Top productos (Barras)
    const topProductsCtx = document.getElementById('topProductsChart');
    if (topProductsCtx && window.Chart) {
      new Chart(topProductsCtx, {
        type: 'bar',
        data: {
          labels: topProducts.map(p => p.product_name?.substring(0, 20) || 'Sin nombre'),
          datasets: [{
            label: 'Vendidos',
            data: topProducts.map(p => parseInt(p.total_sold)),
            backgroundColor: '#667eea'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y'
        }
      });
    }
    
    // 4. Métodos de pago (Pie)
    const paymentMethodsCtx = document.getElementById('paymentMethodsChart');
    if (paymentMethodsCtx && window.Chart) {
      new Chart(paymentMethodsCtx, {
        type: 'pie',
        data: {
          labels: paymentMethods.map(p => p.payment_method),
          datasets: [{
            data: paymentMethods.map(p => parseInt(p.count)),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  async loadRecentOrders() {
    try {
      const response = await window.api.request('/admin/orders');
      
      if (response.success) {
        const orders = response.data.orders.slice(0, 10);
        const tbody = document.getElementById('recentOrdersTable');
        
        if (orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No hay pedidos</td></tr>';
          return;
        }
        
        tbody.innerHTML = orders.map(order => `
          <tr>
            <td>#${order.order_number}</td>
            <td>${order.first_name} ${order.last_name}</td>
            <td>S/ ${parseFloat(order.total_amount).toFixed(2)}</td>
            <td><span class="badge badge-${this.getStatusBadgeClass(order.status)}">${this.getStatusText(order.status)}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString('es-PE')}</td>
            <td>
              <button class="btn-action btn-view" onclick="viewOrder('${order.id}')">
                <i class="fas fa-eye"></i> Ver
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  }

  // Products
  async loadProducts() {
    try {
      const response = await window.api.getProducts();
      
      if (response.success) {
        const products = response.data.products;
        const tbody = document.getElementById('productsTable');
        
        if (products.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No hay productos</td></tr>';
          return;
        }
        
        tbody.innerHTML = products.map(product => `
              <tr>
                <td>${product.id.substring(0, 8)}...</td>
                <td>${product.name}</td>
                <td>${product.category_name || 'Sin categoría'}</td>
                <td>S/ ${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock_quantity}</td>
                <td><span class="badge badge-${product.is_active ? 'success' : 'danger'}">${product.is_active ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <button class="btn-action btn-edit" onclick="window.editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" onclick="window.deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
        `).join('');
        
        // Cargar categorías en el select del modal
        await this.loadCategoriesForProductModal();
      }
    } catch (error) {
      console.error('Error loading products:', error);
      window.notifications.error('Error al cargar productos');
    }
  }

  async loadCategoriesForProductModal() {
    try {
      const response = await window.api.getCategories();
      
      if (response.success) {
        const categories = response.data.categories;
        const select = document.getElementById('productCategory');
        
        select.innerHTML = '<option value="">Seleccionar...</option>' +
          categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
      }
    } catch (error) {
      console.error('Error loading categories for modal:', error);
    }
  }

  // Categories
  async loadCategories() {
    try {
      const response = await window.api.getCategories();
      
      if (response.success) {
        const categories = response.data.categories;
        const tbody = document.getElementById('categoriesTable');
        
        if (categories.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No hay categorías</td></tr>';
          return;
        }
        
            tbody.innerHTML = categories.map(category => `
              <tr>
                <td>${category.id.substring(0, 8)}...</td>
                <td>${category.name}</td>
                <td>${category.slug}</td>
                <td>${category.description || '-'}</td>
                <td>
                  <button class="btn-action btn-edit" onclick="window.editCategory('${category.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" onclick="window.deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      window.notifications.error('Error al cargar categorías');
    }
  }

  // Orders
  async loadOrders() {
    try {
      const response = await window.api.request('/admin/orders');
      
      if (response.success) {
        const orders = response.data.orders;
        const tbody = document.getElementById('ordersTable');
        
        if (orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No hay pedidos</td></tr>';
          return;
        }
        
        tbody.innerHTML = orders.map(order => `
          <tr>
            <td>#${order.order_number}</td>
            <td>${order.first_name} ${order.last_name}</td>
            <td>S/ ${parseFloat(order.total_amount).toFixed(2)}</td>
            <td><span class="badge badge-${this.getStatusBadgeClass(order.status)}">${this.getStatusText(order.status)}</span></td>
            <td><span class="badge badge-${this.getPaymentBadgeClass(order.payment_status)}">${this.getPaymentText(order.payment_status)}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString('es-PE')}</td>
            <td>
              <button class="btn-action btn-view" onclick="window.viewOrder('${order.id}')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      window.notifications.error('Error al cargar pedidos');
    }
  }

  // Users
  async loadUsers() {
    try {
      const response = await window.api.request('/admin/users');
      
      if (response.success) {
        const users = response.data.users;
        const tbody = document.getElementById('usersTable');
        
        if (users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No hay usuarios</td></tr>';
          return;
        }
        
            tbody.innerHTML = users.map(user => `
              <tr>
                <td>${user.id.substring(0, 8)}...</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${this.getRoleBadgeClass(user.role)}">${this.getRoleText(user.role)}</span></td>
                <td><span class="badge badge-${user.email_verified ? 'success' : 'warning'}">${user.email_verified ? 'Sí' : 'No'}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString('es-PE')}</td>
                <td>
                  <button class="btn-action btn-edit" onclick="window.editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            `).join('');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      window.notifications.error('Error al cargar usuarios');
    }
  }

  // Reviews
  async loadReviews() {
    try {
      const response = await window.api.request('/admin/reviews');
      
      if (response.success) {
        const reviews = response.data.reviews;
        const tbody = document.getElementById('reviewsTable');
        
        if (reviews.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No hay reseñas</td></tr>';
          return;
        }
        
            tbody.innerHTML = reviews.map(review => `
              <tr>
                <td>${review.id.substring(0, 8)}...</td>
                <td>${review.first_name} ${review.last_name}</td>
                <td>${review.product_name}</td>
                <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                <td>${review.title || '-'}</td>
                <td><span class="badge badge-${review.is_approved ? 'success' : 'warning'}">${review.is_approved ? 'Sí' : 'No'}</span></td>
                <td>
                  <button class="btn-action btn-edit" onclick="window.editReview('${review.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" onclick="window.deleteReview('${review.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      window.notifications.error('Error al cargar reseñas');
    }
  }

  // Helpers
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

  getRoleText(role) {
    const texts = {
      'admin': 'Administrador',
      'moderator': 'Moderador',
      'client': 'Cliente'
    };
    return texts[role] || role;
  }

  getRoleBadgeClass(role) {
    const classes = {
      'admin': 'danger',
      'moderator': 'warning',
      'client': 'info'
    };
    return classes[role] || 'info';
  }
}

// Funciones globales
function logout() {
  // Limpiar información de localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('admin_user');
  
  // Redirigir a home
  window.location.href = 'index.html';
}

async function viewOrder(orderId) {
  if (window.adminCRUD) {
    await window.adminCRUD.loadOrderDetails(orderId);
    document.getElementById('orderModal').style.display = 'flex';
  }
}

function editProduct(productId) {
  if (window.adminCRUD && window.adminCRUD.editProduct) {
    window.adminCRUD.editProduct(productId);
  }
}

function deleteProduct(productId) {
  if (window.adminCRUD && window.adminCRUD.deleteProduct) {
    window.adminCRUD.deleteProduct(productId);
  }
}

function editCategory(categoryId) {
  if (window.adminCRUD && window.adminCRUD.editCategory) {
    window.adminCRUD.editCategory(categoryId);
  }
}

function deleteCategory(categoryId) {
  if (window.adminCRUD && window.adminCRUD.deleteCategory) {
    window.adminCRUD.deleteCategory(categoryId);
  }
}

function editUser(userId) {
  if (window.adminCRUD && window.adminCRUD.editUser) {
    window.adminCRUD.editUser(userId);
  }
}

function editReview(reviewId) {
  if (window.adminCRUD && window.adminCRUD.editReview) {
    window.adminCRUD.editReview(reviewId);
  }
}

function deleteReview(reviewId) {
  if (window.adminCRUD && window.adminCRUD.deleteReview) {
    window.adminCRUD.deleteReview(reviewId);
  }
}

function openProductModal() {
  if (window.adminCRUD && window.adminCRUD.openProductModal) {
    window.adminCRUD.openProductModal();
  }
}

function openCategoryModal() {
  if (window.adminCRUD && window.adminCRUD.openCategoryModal) {
    window.adminCRUD.openCategoryModal();
  }
}

// Inicializar
const adminManager = new AdminManager();
window.adminManager = adminManager; // Exponer globalmente para adminCRUD

// ===== FUNCIONES DE REPORTES =====
async function exportSalesReport() {
  try {
    const startDate = document.getElementById('salesStartDate').value;
    const endDate = document.getElementById('salesEndDate').value;
    
    let url = '/reports/sales?format=csv';
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const token = window.api.token;
    const response = await fetch(window.api.baseURL + url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ventas_${Date.now()}.csv`;
      a.click();
      window.notifications.success('Reporte descargado exitosamente');
    } else {
      throw new Error('Error al generar reporte');
    }
  } catch (error) {
    console.error('Error exporting sales report:', error);
    window.notifications.error('Error al exportar reporte de ventas');
  }
}

async function exportProductsReport() {
  try {
    const token = window.api.token;
    const response = await fetch(window.api.baseURL + '/reports/products?format=csv', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `productos_${Date.now()}.csv`;
      a.click();
      window.notifications.success('Reporte descargado exitosamente');
    } else {
      throw new Error('Error al generar reporte');
    }
  } catch (error) {
    console.error('Error exporting products report:', error);
    window.notifications.error('Error al exportar reporte de productos');
  }
}

async function exportCustomersReport() {
  try {
    const token = window.api.token;
    const response = await window.api.request('/reports/customers');
    
    if (response.success) {
      const data = JSON.stringify(response.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `clientes_${Date.now()}.json`;
      a.click();
      window.notifications.success('Reporte descargado exitosamente');
    } else {
      throw new Error('Error al generar reporte');
    }
  } catch (error) {
    console.error('Error exporting customers report:', error);
    window.notifications.error('Error al exportar reporte de clientes');
  }
}

