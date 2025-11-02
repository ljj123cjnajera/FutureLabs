const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Address = require('../models/Address');
const { authenticateToken } = require('../middleware/auth');

// Validaciones
const addressValidation = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es requerido'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('El país es requerido'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
];

// GET /api/addresses - Obtener todas las direcciones del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.getByUserId(req.user.id);
    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    console.error('Error getting addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener direcciones'
    });
  }
});

// GET /api/addresses/default - Obtener dirección por defecto
router.get('/default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.getDefault(req.user.id);
    if (!address) {
      return res.json({
        success: true,
        data: { address: null }
      });
    }
    res.json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('Error getting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dirección por defecto'
    });
  }
});

// GET /api/addresses/:id - Obtener una dirección por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const address = await Address.getById(req.params.id, req.user.id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }
    res.json({
      success: true,
      data: { address }
    });
  } catch (error) {
    console.error('Error getting address:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dirección'
    });
  }
});

// POST /api/addresses - Crear nueva dirección
router.post('/', authenticateToken, addressValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const address = await Address.create(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Dirección creada exitosamente',
      data: { address }
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear dirección'
    });
  }
});

// PUT /api/addresses/:id - Actualizar dirección
router.put('/:id', authenticateToken, addressValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const address = await Address.update(req.params.id, req.user.id, req.body);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: { address }
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar dirección'
    });
  }
});

// DELETE /api/addresses/:id - Eliminar dirección
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Address.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Dirección eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar dirección'
    });
  }
});

// PUT /api/addresses/:id/set-default - Establecer como dirección por defecto
router.put('/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.setDefault(req.params.id, req.user.id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Dirección no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Dirección establecida como por defecto',
      data: { address }
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Error al establecer dirección por defecto'
    });
  }
});

module.exports = router;

