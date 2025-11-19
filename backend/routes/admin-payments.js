const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentService = require('../services/PaymentService');
const NotificationService = require('../services/NotificationService');
const { body, validationResult } = require('express-validator');

// GET /api/admin/payments/transactions - Obtener todas las transacciones
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      payment_method: req.query.payment_method,
      order_id: req.query.order_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      limit: req.query.limit ? parseInt(req.query.limit) : 50
    };

    const transactions = await PaymentTransaction.getAll(filters);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo transacciones'
    });
  }
});

// GET /api/admin/payments/pending - Obtener pagos pendientes
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transactions = await PaymentTransaction.getPending();

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error obteniendo pagos pendientes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo pagos pendientes'
    });
  }
});

// GET /api/admin/payments/statistics - Obtener estadísticas de pagos
router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filters = {
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    const statistics = await PaymentTransaction.getStatistics(filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo estadísticas'
    });
  }
});

// GET /api/admin/payments/notifications - Obtener resumen de notificaciones pendientes
router.get('/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const summary = await NotificationService.getPendingNotificationsSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error obteniendo resumen de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo resumen de notificaciones'
    });
  }
});

// GET /api/admin/payments/transactions/:id - Obtener transacción por ID
router.get('/transactions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transaction = await PaymentTransaction.getById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error obteniendo transacción:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo transacción'
    });
  }
});

// POST /api/admin/payments/confirm - Confirmar pago pendiente
router.post('/confirm', authenticateToken, requireAdmin, [
  body('transaction_id')
    .notEmpty()
    .withMessage('El ID de la transacción es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { transaction_id, admin_notes } = req.body;

    const result = await PaymentService.confirmPendingPayment(transaction_id, admin_notes);

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error confirmando pago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirmando pago'
    });
  }
});

// PUT /api/admin/payments/transactions/:id/status - Actualizar estado de transacción
router.put('/transactions/:id/status', authenticateToken, requireAdmin, [
  body('status')
    .isIn(['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'])
    .withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { status, payment_id, error_message } = req.body;

    const transaction = await PaymentTransaction.updateStatus(
      req.params.id,
      status,
      payment_id,
      error_message
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    // Si se marca como succeeded, actualizar también el pedido
    if (status === 'succeeded') {
      const order = await require('../models/Order').getById(transaction.order_id);
      if (order && order.payment_status !== 'paid') {
        await require('../models/Order').updatePaymentStatus(
          order.id,
          'paid',
          payment_id || transaction.payment_id
        );
      }
    }

    res.json({
      success: true,
      message: 'Estado de transacción actualizado',
      data: transaction
    });
  } catch (error) {
    console.error('Error actualizando estado de transacción:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error actualizando estado de transacción'
    });
  }
});

module.exports = router;

