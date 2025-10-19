const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Solicitar recuperación de contraseña
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }
    
    // Buscar usuario
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }
    
    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    // Guardar token
    await User.update(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: resetTokenExpiry
    });
    
    // TODO: Enviar email con el token
    // Por ahora, devolvemos el token en la respuesta (solo para desarrollo)
    console.log('Token de recuperación:', resetToken);
    
    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      // Solo en desarrollo
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Error requesting password recovery:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud'
    });
  }
});

// Resetear contraseña con token
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token y contraseña son requeridos'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Buscar usuario por token
    const user = await User.findByPasswordResetToken(token);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    // Verificar que el token no haya expirado
    if (new Date() > new Date(user.password_reset_expires)) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    // Hashear nueva contraseña
    const password_hash = await bcrypt.hash(password, 10);
    
    // Actualizar contraseña y limpiar token
    await User.update(user.id, {
      password_hash,
      password_reset_token: null,
      password_reset_expires: null
    });
    
    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña'
    });
  }
});

module.exports = router;






