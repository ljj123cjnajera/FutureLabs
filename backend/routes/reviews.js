const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Obtener reseñas de un producto
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit } = req.query;
    
    const reviews = await Review.findByProductIdWithUser(productId, { limit: limit ? parseInt(limit) : null });
    const stats = await Review.getProductStats(productId);
    
    res.json({
      success: true,
      data: {
        reviews,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas'
    });
  }
});

// Crear reseña
router.post('/', requireAuth, async (req, res) => {
  try {
    const { product_id, rating, title, comment, verified_purchase } = req.body;
    const user_id = req.user.id;
    
    // Validaciones
    if (!product_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Producto y calificación son requeridos'
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }
    
    // Verificar si el usuario ya hizo una reseña
    const hasReviewed = await Review.hasUserReviewed(product_id, user_id);
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Ya has hecho una reseña para este producto'
      });
    }
    
    // Crear reseña
    const review = await Review.create({
      product_id,
      user_id,
      rating,
      title,
      comment,
      verified_purchase: verified_purchase || false,
      is_approved: true // Auto-aprobar para simplificar
    });
    
    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: { review }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reseña'
    });
  }
});

// Obtener reseñas del usuario
router.get('/user', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.findByUserId(req.user.id);
    
    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas'
    });
  }
});

// Actualizar reseña
router.put('/:reviewId', requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    
    // Verificar que la reseña pertenece al usuario
    const review = await Review.findById(reviewId);
    if (!review || review.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }
    
    // Actualizar reseña
    const updatedReview = await Review.update(reviewId, {
      rating,
      title,
      comment,
      updated_at: new Date()
    });
    
    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reseña'
    });
  }
});

// Eliminar reseña
router.delete('/:reviewId', requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Verificar que la reseña pertenece al usuario
    const review = await Review.findById(reviewId);
    if (!review || review.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }
    
    // Eliminar reseña
    await Review.delete(reviewId);
    
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





