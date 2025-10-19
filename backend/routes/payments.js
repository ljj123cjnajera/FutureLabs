const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PaymentService = require('../services/PaymentService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Validaciones
const stripePaymentValidation = [
  body('order_id')
    .notEmpty()
    .withMessage('El ID del pedido es requerido'),
  body('payment_method_id')
    .notEmpty()
    .withMessage('El ID del método de pago es requerido')
];

const paypalPaymentValidation = [
  body('order_id')
    .notEmpty()
    .withMessage('El ID del pedido es requerido'),
  body('paypal_order_id')
    .notEmpty()
    .withMessage('El ID del pedido de PayPal es requerido')
];

const mobilePaymentValidation = [
  body('order_id')
    .notEmpty()
    .withMessage('El ID del pedido es requerido'),
  body('phone_number')
    .notEmpty()
    .withMessage('El número de teléfono es requerido'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('El monto debe ser un número positivo')
];

// POST /api/payments/stripe/create-intent - Crear intención de pago con Stripe
router.post('/stripe/create-intent', authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del pedido es requerido'
      });
    }

    const result = await PaymentService.createStripePaymentIntent(order_id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creando intención de pago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creando intención de pago'
    });
  }
});

// POST /api/payments/stripe/process - Procesar pago con Stripe
router.post('/stripe/process', authenticateToken, stripePaymentValidation, async (req, res) => {
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

    const { order_id, payment_method_id } = req.body;

    const result = await PaymentService.processStripePayment(order_id, payment_method_id);

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error procesando pago con Stripe:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando pago'
    });
  }
});

// POST /api/payments/paypal/process - Procesar pago con PayPal
router.post('/paypal/process', authenticateToken, paypalPaymentValidation, async (req, res) => {
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

    const { order_id, paypal_order_id } = req.body;

    const result = await PaymentService.processPayPalPayment(order_id, paypal_order_id);

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error procesando pago con PayPal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando pago'
    });
  }
});

// POST /api/payments/mobile/process - Procesar pago con Yape/Plin
router.post('/mobile/process', authenticateToken, mobilePaymentValidation, async (req, res) => {
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

    const { order_id, phone_number, amount } = req.body;

    const result = await PaymentService.processMobilePayment(order_id, phone_number, amount);

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error procesando pago móvil:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando pago'
    });
  }
});

// POST /api/payments/cash/process - Procesar pago en efectivo
router.post('/cash/process', authenticateToken, async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del pedido es requerido'
      });
    }

    const result = await PaymentService.processCashPayment(order_id);

    res.json({
      success: true,
      message: 'Pago en efectivo registrado',
      data: result
    });
  } catch (error) {
    console.error('Error procesando pago en efectivo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando pago'
    });
  }
});

// POST /api/payments/refund - Reembolsar pago (admin)
router.post('/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del pedido es requerido'
      });
    }

    const result = await PaymentService.refundPayment(order_id);

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error procesando reembolso:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando reembolso'
    });
  }
});

// POST /api/payments/webhook/stripe - Webhook de Stripe
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    const result = await PaymentService.handleStripeWebhook(sig, req.body);

    res.json(result);
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;




