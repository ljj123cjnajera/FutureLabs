const express = require('express');
const router = express.Router();
const LoyaltyPoints = require('../models/LoyaltyPoints');
const { authenticateToken } = require('../middleware/auth');

// GET /api/loyalty/points - Obtener puntos del usuario
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const userPoints = await LoyaltyPoints.getPointsForUser(req.user.id);
    
    res.json({
      success: true,
      data: { points: userPoints.points || 0 }
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
    
    // Mapear campos para compatibilidad con frontend
    const mappedTransactions = transactions.map(t => ({
      id: t.id,
      user_id: t.user_id,
      points_change: t.points || 0,
      type: t.type,
      description: t.reason || (t.type === 'earned' ? 'Puntos ganados' : 'Canje de puntos'),
      created_at: t.created_at,
      updated_at: t.updated_at
    }));
    
    res.json({
      success: true,
      data: { transactions: mappedTransactions }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener transacciones'
    });
  }
});

// POST /api/loyalty/redeem - Canjear puntos
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { points_to_redeem } = req.body;
    
    if (!points_to_redeem || points_to_redeem <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de puntos a canjear debe ser mayor a 0'
      });
    }

    await LoyaltyPoints.redeemPoints(req.user.id, points_to_redeem, 'Canje por descuento');
    // 10 puntos = S/ 1 de descuento
    const discountAmount = parseFloat((points_to_redeem / 10).toFixed(2));

    res.json({
      success: true,
      message: `Se han canjeado ${points_to_redeem} puntos por un descuento de S/ ${discountAmount}`,
      data: { discount_amount: discountAmount }
    });
  } catch (error) {
    console.error('Error redeeming loyalty points:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al canjear puntos'
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

