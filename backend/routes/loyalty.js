const express = require('express');
const router = express.Router();
const LoyaltyPoints = require('../models/LoyaltyPoints');
const { authenticateToken } = require('../middleware/auth');

// GET /api/loyalty/points - Obtener puntos del usuario
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const points = await LoyaltyPoints.getPointsForUser(req.user.id);
    
    res.json({
      success: true,
      data: { points }
    });
  } catch (error) {
    console.error('Error getting loyalty points:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos'
    });
  }
});

// GET /api/loyalty/transactions - Obtener historial de transacciones
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const transactions = await LoyaltyPoints.getTransactions(req.user.id, limit);
    
    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones'
    });
  }
});

// POST /api/loyalty/calculate-discount - Calcular descuento disponible
router.post('/calculate-discount', authenticateToken, async (req, res) => {
  try {
    const { total_amount } = req.body;
    
    const result = await LoyaltyPoints.canRedeemForDiscount(req.user.id, total_amount);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating discount:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular descuento'
    });
  }
});

module.exports = router;

