const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { requireAdmin } = require('../middleware/auth');

// Validar cupón (público)
router.post('/validate', async (req, res) => {
  try {
    const { code, total_amount, items = [] } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de cupón requerido'
      });
    }

    const result = await Coupon.apply(code, total_amount || 0, items);
    
    res.json({
      success: result.valid,
      message: result.message,
      data: result.valid ? {
        coupon: result.coupon,
        discount: result.discount
      } : null
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar cupón'
    });
  }
});

// Obtener todos los cupones (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    
    res.json({
      success: true,
      data: { coupons }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupones'
    });
  }
});

// Crear cupón (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { 
      code, 
      type, 
      value, 
      min_purchase, 
      min_order_amount,
      max_uses, 
      valid_from, 
      valid_until, 
      description,
      restricted_to_categories,
      restricted_to_brands 
    } = req.body;
    
    // Validaciones
    if (!code || !type || !value || !valid_from || !valid_until) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: code, type, value, valid_from, valid_until'
      });
    }

    if (type !== 'percentage' && type !== 'fixed') {
      return res.status(400).json({
        success: false,
        message: 'Tipo debe ser "percentage" o "fixed"'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      min_purchase: min_purchase || 0,
      min_order_amount: min_order_amount || null,
      max_uses,
      valid_from,
      valid_until,
      description,
      is_active: true,
      restricted_to_categories: restricted_to_categories ? JSON.stringify(restricted_to_categories) : null,
      restricted_to_brands: restricted_to_brands ? JSON.stringify(restricted_to_brands) : null
    });
    
    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: { coupon }
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'El código de cupón ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear cupón'
    });
  }
});

// Actualizar cupón (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // Procesar campos especiales
    const updateData = { ...req.body };
    
    if (updateData.restricted_to_categories) {
      updateData.restricted_to_categories = JSON.stringify(updateData.restricted_to_categories);
    }
    
    if (updateData.restricted_to_brands) {
      updateData.restricted_to_brands = JSON.stringify(updateData.restricted_to_brands);
    }
    
    const coupon = await Coupon.update(req.params.id, updateData);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: { coupon }
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cupón'
    });
  }
});

// Eliminar cupón (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Coupon.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cupón'
    });
  }
});

module.exports = router;






