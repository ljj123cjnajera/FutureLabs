const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const knex = require('../database/config');

// Middleware global para todas las rutas de admin
// Verifica autenticación y rol de administrador
router.use(authenticateToken, requireAdmin);

// ===== DASHBOARD =====
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Estadísticas generales
    const [totalProducts] = await knex('products').count('* as count');
    const [totalUsers] = await knex('users').count('* as count');
    const [totalOrders] = await knex('orders').count('* as count');
    const [totalReviews] = await knex('reviews').count('* as count');
    
    // Ventas totales
    const [salesStats] = await knex('orders')
      .where('payment_status', 'paid')
      .sum('total_amount as total')
      .count('* as count');
    
    // Ventas del mes
    const [monthlySales] = await knex('orders')
      .where('payment_status', 'paid')
      .whereRaw('created_at >= DATE_TRUNC(\'month\', CURRENT_DATE)')
      .sum('total_amount as total')
      .count('* as count');
    
    // Pedidos por estado
    const ordersByStatus = await knex('orders')
      .select('status')
      .count('* as count')
      .groupBy('status');
    
    // Productos más vendidos
    const topProducts = await knex('order_items')
      .select('product_name', 'product_id')
      .sum('quantity as total_sold')
      .groupBy('product_id', 'product_name')
      .orderBy('total_sold', 'desc')
      .limit(5);
    
    // Ventas por día (últimos 7 días)
    const salesByDay = await knex('orders')
      .select(knex.raw('DATE(created_at) as date'))
      .sum('total_amount as total')
      .count('* as count')
      .where('payment_status', 'paid')
      .whereRaw('created_at >= CURRENT_DATE - INTERVAL \'7 days\'')
      .groupBy(knex.raw('DATE(created_at)'))
      .orderBy('date', 'asc');
    
    // Métodos de pago más utilizados
    const paymentMethods = await knex('orders')
      .select('payment_method')
      .count('* as count')
      .groupBy('payment_method');
    
    res.json({
      success: true,
      data: {
        overview: {
          total_products: parseInt(totalProducts.count),
          total_users: parseInt(totalUsers.count),
          total_orders: parseInt(totalOrders.count),
          total_reviews: parseInt(totalReviews.count),
          total_sales: parseFloat(salesStats.total) || 0,
          total_sales_count: parseInt(salesStats.count) || 0,
          monthly_sales: parseFloat(monthlySales.total) || 0,
          monthly_sales_count: parseInt(monthlySales.count) || 0
        },
        orders_by_status: ordersByStatus,
        top_products: topProducts,
        sales_by_day: salesByDay,
        payment_methods: paymentMethods
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// ===== PRODUCTOS =====
router.post('/products', async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    
    // Validaciones básicas
    if (!req.body.name || !req.body.slug || !req.body.price || !req.body.category_id || !req.body.brand) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: name, slug, price, category_id, brand'
      });
    }

    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    console.log('Updating product:', req.params.id, 'with data:', req.body);
    
    const product = await Product.update(req.params.id, req.body);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto'
    });
  }
});

// ===== CATEGORÍAS =====
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría'
    });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría'
    });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría'
    });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría'
    });
  }
});

// ===== USUARIOS =====
router.get('/users', async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
});

// ===== PEDIDOS =====
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAllForAdmin();
    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos'
    });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const orderData = await Order.getById(req.params.id);
    
    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    // Separar order de items
    const { items, ...order } = orderData;
    
    res.json({
      success: true,
      data: { order, items: items || [] }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del pedido'
    });
  }
});

// ===== RESEÑAS =====
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await knex('reviews')
      .select(
        'reviews.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'products.name as product_name'
      )
      .leftJoin('users', 'reviews.user_id', 'users.id')
      .leftJoin('products', 'reviews.product_id', 'products.id')
      .orderBy('reviews.created_at', 'desc');
    
    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas'
    });
  }
});

router.get('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseña'
    });
  }
});

router.put('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: { review }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reseña'
    });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.delete(req.params.id);
    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reseña'
    });
  }
});

module.exports = router;


