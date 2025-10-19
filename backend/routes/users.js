const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../middleware/auth');

// Obtener perfil del usuario
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // No enviar password_hash
    delete user.password_hash;
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// Actualizar perfil
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone !== undefined) updateData.phone = phone;
    
    const user = await User.update(req.user.id, updateData);
    
    // No enviar password_hash
    delete user.password_hash;
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
});

// Cambiar contraseña
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Obtener usuario
    const user = await User.getById(req.user.id);
    
    // Verificar contraseña actual
    const isValid = await User.verifyPassword(user, current_password);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Hashear nueva contraseña
    const password_hash = await bcrypt.hash(new_password, 10);
    
    // Actualizar contraseña
    await User.update(req.user.id, { password_hash });
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
});

module.exports = router;






