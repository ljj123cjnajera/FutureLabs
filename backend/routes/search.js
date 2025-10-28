const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const knex = require('../database/config');

// Búsqueda con autocompletado
router.get('/suggestions', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }
    
    // Buscar productos por nombre
    const products = await knex('products')
      .select('id', 'name', 'slug', 'image_url', 'price', 'discount_price')
      .where('is_active', true)
      .where(function() {
        this.where('name', 'ilike', `%${query}%`)
            .orWhere('description', 'ilike', `%${query}%`);
      })
      .orderBy('name', 'asc')
      .limit(5);
    
    // Buscar categorías
    const categories = await knex('categories')
      .select('id', 'name', 'slug')
      .where('name', 'ilike', `%${query}%`)
      .limit(3);
    
    res.json({
      success: true,
      data: {
        suggestions: [
          ...products.map(p => ({
            type: 'product',
            id: p.id,
            name: p.name,
            slug: p.slug,
            image_url: p.image_url,
            price: p.price,
            discount_price: p.discount_price
          })),
          ...categories.map(c => ({
            type: 'category',
            id: c.id,
            name: c.name,
            slug: c.slug
          }))
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias'
    });
  }
});

// Búsqueda avanzada
router.get('/advanced', async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      min_price,
      max_price,
      sort,
      page = 1,
      limit = 12
    } = req.query;
    
    let query = knex('products')
      .select(
        'products.*',
        'categories.name as category_name'
      )
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.is_active', true);
    
    // Búsqueda por texto
    if (q) {
      query = query.where(function() {
        this.where('products.name', 'ilike', `%${q}%`)
            .orWhere('products.description', 'ilike', `%${q}%`)
            .orWhere('products.brand', 'ilike', `%${q}%`)
            .orWhere('products.sku', 'ilike', `%${q}%`);
      });
    }
    
    // Filtro por categoría
    if (category) {
      query = query.where('products.category_id', category);
    }
    
    // Filtro por marca
    if (brand) {
      query = query.where('products.brand', brand);
    }
    
    // Filtro por precio
    if (min_price) {
      query = query.where('products.price', '>=', min_price);
    }
    
    if (max_price) {
      query = query.where('products.price', '<=', max_price);
    }
    
    // Filtrar por productos en oferta
    const onSale = req.query.on_sale === 'true';
    if (onSale) {
      query = query.whereNotNull('products.discount_price');
    }
    
    // Filtrar por rating
    if (req.query.min_rating) {
      query = query.where('products.rating', '>=', req.query.min_rating);
    }
    
    // Filtrar por stock disponible
    if (req.query.in_stock === 'true') {
      query = query.where('products.stock_quantity', '>', 0);
    }
    
    // Ordenamiento
    switch(sort) {
      case 'price_asc':
        query = query.orderBy('products.price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('products.price', 'desc');
        break;
      case 'name_asc':
        query = query.orderBy('products.name', 'asc');
        break;
      case 'name_desc':
        query = query.orderBy('products.name', 'desc');
        break;
      case 'newest':
        query = query.orderBy('products.created_at', 'desc');
        break;
      case 'popular':
        query = query.orderBy('products.view_count', 'desc');
        break;
      case 'rating':
        query = query.orderBy('products.rating', 'desc');
        break;
      default:
        query = query.orderBy('products.created_at', 'desc');
    }
    
    // Paginación
    const offset = (page - 1) * limit;
    const [countResult] = await query.clone().count('* as count');
    const total = parseInt(countResult.count);
    
    const products = await query.limit(limit).offset(offset);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda'
    });
  }
});

module.exports = router;





