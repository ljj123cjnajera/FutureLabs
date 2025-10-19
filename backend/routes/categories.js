const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías'
    });
  }
});

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', async (req, res) => {
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
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categoría'
    });
  }
});

// GET /api/categories/slug/:slug - Obtener categoría por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.getBySlug(req.params.slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categoría'
    });
  }
});

module.exports = router;
