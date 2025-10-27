const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const emailService = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

// Generar token JWT
const generateToken = (userId) => {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Validaciones
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// POST /api/auth/register - Registro de usuario
router.post('/register', registerValidation, async (req, res) => {
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

    const { email, password, first_name, last_name, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone
    });

    // Crear código de verificación
    const verificationCode = await VerificationCode.create(user.id, 'email');

    // Enviar respuesta inmediatamente sin esperar email
    const responseData = {
      user,
      requires_verification: true,
      verification_code: verificationCode.code // Incluir código siempre
    };

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. El código de verificación es: ' + verificationCode.code + '. Revisa también tu email.',
      data: responseData
    });

    // Enviar email en background (no bloquea la respuesta)
    emailService.sendVerificationCode(
      user.email,
      verificationCode.code,
      `${user.first_name} ${user.last_name}`
    ).then(() => {
      console.log('✅ Email de verificación enviado exitosamente a', user.email);
    }).catch((emailError) => {
      console.error('❌ Error enviando email:', emailError.message);
      console.log('⚠️  Usuario debe usar el código mostrado en pantalla');
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
});

// POST /api/auth/login - Login de usuario
router.post('/login', loginValidation, async (req, res) => {
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

    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar password
    const isPasswordValid = await User.verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Eliminar password_hash del objeto retornado
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuario'
    });
  }
});

// POST /api/auth/logout - Logout (solo invalidar token en cliente)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

module.exports = router;
