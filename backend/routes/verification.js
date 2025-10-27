const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const emailService = require('../services/emailService');

// POST /api/verification/verify-email - Verificar código de email
router.post('/verify-email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('El código debe tener 6 dígitos')
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

    const { email, code } = req.body;

    // Buscar usuario
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar código
    const verificationCode = await VerificationCode.findByCode(code, 'email');
    
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    if (verificationCode.user_id !== user.id) {
      return res.status(400).json({
        success: false,
        message: 'Código no válido para este usuario'
      });
    }

    // Marcar código como usado
    await VerificationCode.markAsVerified(verificationCode.id);

    // Marcar email como verificado
    await User.verifyEmail(user.id);

    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });
  } catch (error) {
    console.error('Error verificando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email'
    });
  }
});

// POST /api/verification/resend-code - Reenviar código de verificación
router.post('/resend-code', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
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

    const { email } = req.body;

    // Buscar usuario
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Invalidar códigos anteriores
    await VerificationCode.invalidateUserCodes(user.id, 'email');

    // Crear nuevo código
    const verificationCode = await VerificationCode.create(user.id, 'email');

    // Enviar email
    await emailService.sendVerificationCode(
      user.email,
      verificationCode.code,
      `${user.first_name} ${user.last_name}`
    );

    res.json({
      success: true,
      message: 'Código de verificación reenviado'
    });
  } catch (error) {
    console.error('Error reenviando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reenviar código'
    });
  }
});

module.exports = router;

