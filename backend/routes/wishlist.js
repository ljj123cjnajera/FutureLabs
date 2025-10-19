const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { requireAuth } = require('../middleware/auth');

// Obtener wishlist del usuario
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await Wishlist.findByUserId(req.user.id);
    const count = await Wishlist.countByUserId(req.user.id);
    
    res.json({
      success: true,
      data: {
        items,
        count
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener wishlist'
    });
  }
});

// Agregar producto a wishlist
router.post('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    await Wishlist.add(req.user.id, productId);
    
    res.json({
      success: true,
      message: 'Producto agregado a wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al agregar a wishlist'
    });
  }
});

// Eliminar producto de wishlist
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    await Wishlist.remove(req.user.id, productId);
    
    res.json({
      success: true,
      message: 'Producto eliminado de wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar de wishlist'
    });
  }
});

// Verificar si producto está en wishlist
router.get('/check/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const hasProduct = await Wishlist.hasProduct(req.user.id, productId);
    
    res.json({
      success: true,
      data: { inWishlist: hasProduct }
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar wishlist'
    });
  }
});

// Limpiar wishlist
router.delete('/', requireAuth, async (req, res) => {
  try {
    await Wishlist.clear(req.user.id);
    
    res.json({
      success: true,
      message: 'Wishlist limpiada'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar wishlist'
    });
  }
});

module.exports = router;






