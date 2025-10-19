const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Validaciones
const createOrderValidation = [
  body('shipping_address')
    .trim()
    .notEmpty()
    .withMessage('La dirección de envío es requerida'),
  body('shipping_city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  body('shipping_country')
    .trim()
    .notEmpty()
    .withMessage('El país es requerido'),
  body('payment_method')
    .isIn(['stripe', 'paypal', 'yape', 'plin', 'cash'])
    .withMessage('Método de pago inválido')
];

// POST /api/orders - Crear pedido desde carrito
router.post('/', authenticateToken, createOrderValidation, async (req, res) => {
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

    const order = await Order.createFromCart(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: { order }
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear pedido'
    });
  }
});

// GET /api/orders - Obtener pedidos del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const orders = await Order.getByUserId(req.user.id, filters);

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pedidos'
    });
  }
});

// GET /api/orders/:id - Obtener pedido por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido pertenezca al usuario (o sea admin)
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este pedido'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pedido'
    });
  }
});

// GET /api/orders/number/:orderNumber - Obtener pedido por número de pedido
router.get('/number/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const order = await Order.getByOrderNumber(req.params.orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido pertenezca al usuario (o sea admin)
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este pedido'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pedido'
    });
  }
});

// PUT /api/orders/:id/status - Actualizar estado del pedido (admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
    }

    const order = await Order.updateStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado del pedido actualizado',
      data: { order }
    });
  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado del pedido'
    });
  }
});

// PUT /api/orders/:id/payment-status - Actualizar estado de pago (admin)
router.put('/:id/payment-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { payment_status, payment_id } = req.body;

    if (!payment_status) {
      return res.status(400).json({
        success: false,
        message: 'El estado de pago es requerido'
      });
    }

    const order = await Order.updatePaymentStatus(req.params.id, payment_status, payment_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado de pago actualizado',
      data: { order }
    });
  } catch (error) {
    console.error('Error actualizando estado de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado de pago'
    });
  }
});

// GET /api/orders/admin/all - Obtener todos los pedidos (admin)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      payment_status: req.query.payment_status,
      user_id: req.query.user_id,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const orders = await Order.getAll(filters);

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pedidos'
    });
  }
});

module.exports = router;




