const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const knex = require('../database/config');

// Obtener productos relacionados
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 4;
    
    // Obtener producto actual
    const [currentProduct] = await knex('products')
      .where('id', productId);
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Buscar productos relacionados
    const relatedProducts = await knex('products')
      .select('products.*', 'categories.name as category_name')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where(function() {
        this.where('products.id', '!=', productId)
            .where('products.category_id', currentProduct.category_id)
            .where('products.is_active', true);
      })
      .orWhere(function() {
        this.where('products.id', '!=', productId)
            .where('products.brand', currentProduct.brand)
            .where('products.is_active', true);
      })
      .orderByRaw('CASE WHEN category_id = ? THEN 1 ELSE 2 END', [currentProduct.category_id])
      .orderBy('created_at', 'desc')
      .limit(limit);
    
    // Si no hay suficientes productos relacionados, buscar por precio similar
    if (relatedProducts.length < limit) {
      const currentPrice = parseFloat(currentProduct.price);
      const priceRange = currentPrice * 0.3; // ±30% del precio
      
      const similarPriceProducts = await knex('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.id', '!=', productId)
        .where('products.is_active', true)
        .whereBetween('products.price', [
          currentPrice - priceRange,
          currentPrice + priceRange
        ])
        .whereNotIn('products.id', relatedProducts.map(p => p.id))
        .orderBy('created_at', 'desc')
        .limit(limit - relatedProducts.length);
      
      relatedProducts.push(...similarPriceProducts);
    }
    
    // Si aún no hay suficientes, buscar productos más vendidos
    if (relatedProducts.length < limit) {
      const topProducts = await knex('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.id', '!=', productId)
        .where('products.is_active', true)
        .whereNotIn('products.id', relatedProducts.map(p => p.id))
        .orderBy('created_at', 'desc')
        .limit(limit - relatedProducts.length);
      
      relatedProducts.push(...topProducts);
    }
    
    res.json({
      success: true,
      data: {
        related_products: relatedProducts,
        current_product: {
          id: currentProduct.id,
          name: currentProduct.name,
          category_id: currentProduct.category_id,
          brand: currentProduct.brand,
          price: currentProduct.price
        }
      }
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos relacionados'
    });
  }
});

module.exports = router;




