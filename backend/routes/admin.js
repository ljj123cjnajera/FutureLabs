const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { requireAdmin } = require('../middleware/auth');
const knex = require('../database/config');

// ===== DASHBOARD =====
router.get('/dashboard/stats', requireAdmin, async (req, res) => {
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
        sales_by_day: salesByDay
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
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto'
    });
  }
});

router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto'
    });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
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
router.get('/categories/:id', requireAdmin, async (req, res) => {
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

router.post('/categories', requireAdmin, async (req, res) => {
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

router.put('/categories/:id', requireAdmin, async (req, res) => {
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

router.delete('/categories/:id', requireAdmin, async (req, res) => {
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
router.get('/users', requireAdmin, async (req, res) => {
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

router.get('/users/:id', requireAdmin, async (req, res) => {
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

router.put('/users/:id', requireAdmin, async (req, res) => {
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

router.delete('/users/:id', requireAdmin, async (req, res) => {
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
router.get('/orders', requireAdmin, async (req, res) => {
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

router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const orderData = await Order.findById(req.params.id);
    
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
router.get('/reviews', requireAdmin, async (req, res) => {
  try {
    const reviews = await knex('reviews')
      .select(
        'reviews.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'products.name as product_name'
      )
      .join('users', 'reviews.user_id', 'users.id')
      .join('products', 'reviews.product_id', 'products.id')
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

router.get('/reviews/:id', requireAdmin, async (req, res) => {
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

router.put('/reviews/:id', requireAdmin, async (req, res) => {
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

router.delete('/reviews/:id', requireAdmin, async (req, res) => {
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


