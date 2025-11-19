const PaymentTransaction = require('../models/PaymentTransaction');
const Order = require('../models/Order');
const User = require('../models/User');
const emailService = require('./emailService');

class NotificationService {
  // Notificar cuando un pago es confirmado
  static async notifyPaymentConfirmed(orderId) {
    try {
      const order = await Order.getById(orderId);
      if (!order) return;

      const user = await User.getById(order.user_id);
      if (!user || !user.email) return;

      // Email ya se envía desde PaymentService
      // Aquí podríamos agregar notificaciones push, SMS, etc.
      console.log(`📧 Notificación de pago confirmado enviada a ${user.email} para pedido ${order.order_number}`);
    } catch (error) {
      console.error('Error en notificación de pago confirmado:', error);
    }
  }

  // Notificar cuando hay un pago pendiente (para admin)
  static async notifyAdminPendingPayment(transactionId) {
    try {
      const transaction = await PaymentTransaction.getById(transactionId);
      if (!transaction) return;

      const order = await Order.getById(transaction.order_id);
      if (!order) return;

      // Aquí podríamos enviar email al admin, notificación push, etc.
      console.log(`🔔 Pago pendiente: Pedido ${order.order_number}, Monto: S/ ${transaction.amount}, Método: ${transaction.payment_method}`);
      
      // En producción, aquí se podría:
      // - Enviar email al admin
      // - Enviar notificación push
      // - Enviar SMS
      // - Crear tarea en sistema de gestión
    } catch (error) {
      console.error('Error en notificación de pago pendiente para admin:', error);
    }
  }

  // Notificar cuando un pago falla
  static async notifyPaymentFailed(orderId, errorMessage) {
    try {
      const order = await Order.getById(orderId);
      if (!order) return;

      const user = await User.getById(order.user_id);
      if (!user || !user.email) return;

      // Email ya se envía desde PaymentService
      console.log(`📧 Notificación de pago fallido enviada a ${user.email} para pedido ${order.order_number}`);
    } catch (error) {
      console.error('Error en notificación de pago fallido:', error);
    }
  }

  // Obtener resumen de notificaciones pendientes (para admin)
  static async getPendingNotificationsSummary() {
    try {
      const pendingTransactions = await PaymentTransaction.getPending();
      
      return {
        total_pending: pendingTransactions.length,
        by_method: pendingTransactions.reduce((acc, t) => {
          acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
          return acc;
        }, {}),
        total_amount: pendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
        transactions: pendingTransactions.slice(0, 10) // Primeros 10
      };
    } catch (error) {
      console.error('Error obteniendo resumen de notificaciones:', error);
      return {
        total_pending: 0,
        by_method: {},
        total_amount: 0,
        transactions: []
      };
    }
  }
}

module.exports = NotificationService;

