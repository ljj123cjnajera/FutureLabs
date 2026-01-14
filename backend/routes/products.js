const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Obtener todos los productos con filtros
router.get('/', async (req, res) => {
  let filters = null;
  
  try {
    filters = {
      category_id: req.query.category_id,
      brand: req.query.brand || req.query.category, // Support category as brand filter
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
      search: req.query.search,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order,
      page: req.query.page ? parseInt(req.query.page) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      onSale: req.query.onSale === 'true' || req.query.on_sale === 'true',
      inStock: req.query.inStock !== undefined ? req.query.inStock === 'true' : undefined
    };
    
    // Clean undefined/null/empty values
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value === undefined || value === null || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        delete filters[key];
      }
    });
    
    // Capitalize brand if it exists (Jordan, Nike, Adidas, Yeezy)
    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase();
      const brandMap = {
        'jordan': 'Jordan',
        'nike': 'Nike',
        'adidas': 'Adidas',
        'yeezy': 'Yeezy'
      };
      filters.brand = brandMap[brandLower] || filters.brand.charAt(0).toUpperCase() + filters.brand.slice(1).toLowerCase();
    }

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
    console.error('Error obteniendo productos:', error.message);
    console.error('Error stack:', error.stack);
    if (filters) {
      console.error('Filters used:', JSON.stringify(filters, null, 2));
    } else {
      console.error('Filters: Not initialized (error occurred before filter creation)');
      console.error('Query params:', JSON.stringify(req.query, null, 2));
    }
    
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error obteniendo productos en oferta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/trending - Obtener productos en tendencia
router.get('/trending', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const products = await Product.getTrending(limit);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos en tendencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos en tendencia',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/bestseller - Obtener productos más vendidos
router.get('/bestseller', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const products = await Product.getBestseller(limit);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos más vendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos más vendidos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/new - Obtener productos nuevos
router.get('/new', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const products = await Product.getNew(limit);

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos nuevos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos nuevos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error obteniendo productos por categoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error obteniendo producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      message: 'Error obteniendo producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
