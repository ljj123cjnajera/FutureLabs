const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const { authenticateToken } = require('../middleware/auth');

// Validaciones
const addToCartValidation = [
  body('product_id')
    .notEmpty()
    .withMessage('El ID del producto es requerido'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

const updateQuantityValidation = [
  body('product_id')
    .notEmpty()
    .withMessage('El ID del producto es requerido'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

// GET /api/cart - Obtener carrito del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const summary = await Cart.getSummary(req.user.id);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo carrito'
    });
  }
});

// POST /api/cart/add - Agregar producto al carrito
router.post('/add', authenticateToken, addToCartValidation, async (req, res) => {
  try {
    console.log('🛒 POST /api/cart/add - Request recibido');
    console.log('📝 Body:', req.body);
    console.log('👤 Usuario:', req.user.id);
    
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { product_id, quantity } = req.body;
    console.log('📦 Agregando producto:', product_id, 'cantidad:', quantity || 1);

    const item = await Cart.add(req.user.id, product_id, quantity || 1);
    console.log('✅ Item agregado al carrito:', item.id);

    res.status(201).json({
      success: true,
      message: 'Producto agregado al carrito',
      data: { item }
    });
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error agregando producto al carrito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/cart/update - Actualizar cantidad de un producto
router.put('/update', authenticateToken, updateQuantityValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { product_id, quantity } = req.body;

    const item = await Cart.updateQuantity(req.user.id, product_id, quantity);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: { item }
    });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando carrito'
    });
  }
});

// DELETE /api/cart/remove - Eliminar producto del carrito
router.delete('/remove', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto es requerido'
      });
    }

    const deleted = await Cart.remove(req.user.id, product_id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando producto del carrito'
    });
  }
});

// DELETE /api/cart/clear - Limpiar carrito
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Cart.clear(req.user.id);

    res.json({
      success: true,
      message: 'Carrito limpiado'
    });
  } catch (error) {
    console.error('Error limpiando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error limpiando carrito'
    });
  }
});

// GET /api/cart/count - Obtener cantidad de items en el carrito
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = await Cart.getCount(req.user.id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error obteniendo cantidad del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cantidad del carrito'
    });
  }
});

module.exports = router;




