const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Obtener todos los productos con filtros
router.get('/', async (req, res) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      brand: req.query.brand,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      search: req.query.search,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
      page: req.query.page ? parseInt(req.query.page) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const products = await Product.getAll(filters);
    const total = await Product.count(filters);

    res.json({
      success: true,
      data: {
        products,
        total,
        page: filters.page || 1,
        limit: filters.limit || products.length,
        pages: filters.limit ? Math.ceil(total / filters.limit) : 1
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos'
    });
  }
});

// GET /api/products/featured - Obtener productos destacados
router.get('/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const products = await Product.getFeatured(limit);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos destacados'
    });
  }
});

// GET /api/products/on-sale - Obtener productos en oferta
router.get('/on-sale', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const products = await Product.getOnSale(limit);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos en oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos en oferta'
    });
  }
});

// GET /api/products/category/:slug - Obtener productos por categoría
router.get('/category/:slug', async (req, res) => {
  try {
    const filters = {
      brand: req.query.brand,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };

    const products = await Product.getByCategory(req.params.slug, filters);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos por categoría'
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto'
    });
  }
});

// GET /api/products/slug/:slug - Obtener producto por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.getBySlug(req.params.slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto'
    });
  }
});

module.exports = router;
