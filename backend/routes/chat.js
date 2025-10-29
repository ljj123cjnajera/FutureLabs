const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/chat/send - Enviar mensaje
router.post('/send', async (req, res) => {
  try {
    const { user_id, visitor_name, visitor_email, message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje es requerido'
      });
    }

    const messageData = {
      message,
      sender_type: user_id ? 'user' : 'visitor',
      is_read: false
    };

    if (user_id) {
      messageData.user_id = user_id;
    } else {
      if (!visitor_name || !visitor_email) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y email son requeridos para visitantes'
        });
      }
      messageData.visitor_name = visitor_name;
      messageData.visitor_email = visitor_email;
    }

    const newMessage = await Chat.createMessage(messageData);
    
    res.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
});

// GET /api/chat/messages - Obtener mensajes del usuario
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Chat.getMessagesForUser(req.user.id);
    await Chat.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
});

// GET /api/chat/unread-count - Obtener contador de mensajes no leídos
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Chat.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contador'
    });
  }
});

// ===== RUTAS ADMIN =====

// GET /api/chat/admin/messages - Obtener todos los mensajes (admin)
router.get('/admin/messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const messages = await Chat.getMessagesForAdmin();
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error getting admin messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
});

// POST /api/chat/admin/reply - Responder como admin
router.post('/admin/reply', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { message_id, reply_message } = req.body;
    
    if (!reply_message) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje de respuesta es requerido'
      });
    }

    // Obtener el mensaje original
    const originalMessage = await Chat.getMessageById(message_id);
    
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Crear mensaje de respuesta del admin
    const reply = await Chat.createMessage({
      user_id: originalMessage.user_id,
      visitor_name: originalMessage.visitor_name,
      visitor_email: originalMessage.visitor_email,
      message: reply_message,
      sender_type: 'admin',
      is_read: false
    });

    // Marcar mensaje original como leído
    await Chat.markAsRead(message_id, req.user.id);
    
    res.json({
      success: true,
      message: 'Respuesta enviada exitosamente',
      data: { message: reply }
    });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar respuesta'
    });
  }
});

module.exports = router;

