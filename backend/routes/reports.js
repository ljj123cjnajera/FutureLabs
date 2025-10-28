const express = require('express');
const router = express.Router();
const knex = require('../database/config');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware global
router.use(authenticateToken, requireAdmin);

// GET /api/reports/sales - Reporte de ventas
router.get('/sales', async (req, res) => {
  try {
    const { start_date, end_date, format = 'json' } = req.query;
    
    let query = knex('orders')
      .select(
        'orders.*',
        knex.raw('users.first_name || \' \' || users.last_name as customer_name'),
        knex.raw('users.email as customer_email')
      )
      .leftJoin('users', 'orders.user_id', 'users.id')
      .where('payment_status', 'paid');
    
    // Filtrar por rango de fechas
    if (start_date && end_date) {
      query = query.whereBetween('orders.created_at', [start_date, end_date]);
    }
    
    query = query.orderBy('orders.created_at', 'desc');
    
    const orders = await query;
    
    // Agregar items a cada pedido
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await knex('order_items')
          .select(
            'order_items.*',
            'products.name as product_name',
            'products.sku as product_sku'
          )
          .leftJoin('products', 'order_items.product_id', 'products.id')
          .where({ order_id: order.id });
        return { ...order, items };
      })
    );
    
    // Si es CSV, generar archivo CSV
    if (format === 'csv') {
      const csv = generateCSV(ordersWithItems);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ventas_${Date.now()}.csv"`);
      return res.send(csv);
    }
    
    // Calcular totales
    const totals = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
      total_items: ordersWithItems.reduce((sum, order) => sum + order.items.length, 0)
    };
    
    res.json({
      success: true,
      data: {
        orders: ordersWithItems,
        totals,
        period: {
          start_date: start_date || 'all',
          end_date: end_date || 'all'
        }
      }
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de ventas'
    });
  }
});

// GET /api/reports/products - Reporte de productos
router.get('/products', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const products = await knex('products')
      .select(
        'products.*',
        'categories.name as category_name'
      )
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .orderBy('products.created_at', 'desc');
    
    // Agregar estadísticas de ventas
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const soldItems = await knex('order_items')
          .where({ product_id: product.id })
          .sum('quantity as total_sold')
          .first();
        
        const revenue = await knex('order_items')
          .where({ product_id: product.id })
          .join('orders', 'order_items.order_id', 'orders.id')
          .where('orders.payment_status', 'paid')
          .sum(knex.raw('order_items.quantity * order_items.price as total'))
          .first();
        
        return {
          ...product,
          total_sold: parseInt(soldItems?.total_sold || 0),
          revenue: parseFloat(revenue?.total || 0)
        };
      })
    );
    
    // Si es CSV
    if (format === 'csv') {
      const csv = generateProductsCSV(productsWithStats);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="productos_${Date.now()}.csv"`);
      return res.send(csv);
    }
    
    res.json({
      success: true,
      data: {
        products: productsWithStats,
        total_products: productsWithStats.length
      }
    });
  } catch (error) {
    console.error('Error generating products report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de productos'
    });
  }
});

// GET /api/reports/customers - Reporte de clientes
router.get('/customers', async (req, res) => {
  try {
    const customers = await knex('users')
      .select('users.*')
      .where('role', 'client')
      .orderBy('created_at', 'desc');
    
    // Agregar estadísticas de compras
    const customersWithStats = await Promise.all(
      customers.map(async (user) => {
        const orders = await knex('orders')
          .where({ user_id: user.id })
          .count('* as total_orders')
          .first();
        
        const spent = await knex('orders')
          .where({ user_id: user.id })
          .where('payment_status', 'paid')
          .sum('total_amount as total_spent')
          .first();
        
        return {
          ...user,
          total_orders: parseInt(orders?.total_orders || 0),
          total_spent: parseFloat(spent?.total_spent || 0)
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        total_customers: customersWithStats.length
      }
    });
  } catch (error) {
    console.error('Error generating customers report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de clientes'
    });
  }
});

// Funciones auxiliares para generar CSV
function generateCSV(orders) {
  const headers = [
    'Número de Pedido',
    'Fecha',
    'Cliente',
    'Email',
    'Total',
    'Estado',
    'Método de Pago',
    'Productos'
  ].join(',');
  
  const rows = orders.map(order => {
    const products = order.items.map(item => `${item.product_name} (x${item.quantity})`).join('; ');
    return [
      order.order_number,
      new Date(order.created_at).toLocaleDateString('es-PE'),
      order.customer_name,
      order.customer_email,
      order.total_amount,
      order.status,
      order.payment_method,
      `"${products}"`
    ].join(',');
  });
  
  return [headers, ...rows].join('\n');
}

function generateProductsCSV(products) {
  const headers = [
    'ID',
    'Nombre',
    'Categoría',
    'Precio',
    'Stock',
    'Vendidos',
    'Ingresos',
    'Estado'
  ].join(',');
  
  const rows = products.map(product => [
    product.id,
    product.name,
    product.category_name,
    product.price,
    product.stock_quantity,
    product.total_sold,
    product.revenue,
    product.is_active ? 'Activo' : 'Inactivo'
  ].join(','));
  
  return [headers, ...rows].join('\n');
}

module.exports = router;

