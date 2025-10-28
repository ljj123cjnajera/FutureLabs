const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const RecommendationService = require('../services/RecommendationService');
const knex = require('../database/config');

// Obtener productos relacionados
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 4;
    
    const relatedProducts = await RecommendationService.getRelatedProducts(productId, limit);
    
    // Incrementar contador de visualizaciones
    await RecommendationService.incrementViewCount(productId);
    
    res.json({
      success: true,
      data: {
        related_products: relatedProducts
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

// Obtener recomendaciones para usuario
router.get('/recommended/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 8;
    
    const recommendedProducts = await RecommendationService.getRecommendedForUser(userId, limit);
    
    res.json({
      success: true,
      data: {
        recommended_products: recommendedProducts
      }
    });
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos recomendados'
    });
  }
});

// Obtener productos populares
router.get('/popular/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const popularProducts = await RecommendationService.getPopularProducts(limit);
    
    res.json({
      success: true,
      data: {
        products: popularProducts
      }
    });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos populares'
    });
  }
});

// Obtener productos más vendidos
router.get('/popular/top-selling', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const categoryId = req.query.category_id;
    
    const topSellingProducts = await RecommendationService.getTopSellingProducts(limit, categoryId);
    
    res.json({
      success: true,
      data: {
        products: topSellingProducts
      }
    });
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos más vendidos'
    });
  }
});

module.exports = router;




