const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Order = require('../models/Order');

class PaymentService {
  // Procesar pago con Stripe
  static async processStripePayment(orderId, paymentMethodId) {
    try {
      if (!stripe) {
        throw new Error('Stripe no está configurado. Configura STRIPE_SECRET_KEY en las variables de entorno.');
      }

      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Crear intento de pago en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // Convertir a centavos
        currency: 'pen', // Soles peruanos
        payment_method: paymentMethodId,
        confirm: true,
        description: `Pago de pedido ${order.order_number}`,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          user_id: order.user_id
        }
      });

      // Actualizar estado del pedido
      await Order.updatePaymentStatus(order.id, 'paid', paymentIntent.id);

      return {
        success: true,
        payment_intent: paymentIntent,
        order: await Order.getById(order.id)
      };
    } catch (error) {
      console.error('Error procesando pago con Stripe:', error);
      
      // Actualizar estado del pedido a fallido
      if (orderId) {
        await Order.updatePaymentStatus(orderId, 'failed');
      }

      throw error;
    }
  }

  // Crear intención de pago con Stripe (para frontend)
  static async createStripePaymentIntent(orderId) {
    try {
      if (!stripe) {
        throw new Error('Stripe no está configurado. Configura STRIPE_SECRET_KEY en las variables de entorno.');
      }

      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100),
        currency: 'pen',
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          user_id: order.user_id
        }
      });

      return {
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creando intención de pago:', error);
      throw error;
    }
  }

  // Procesar pago con PayPal (simulado)
  static async processPayPalPayment(orderId, paypalOrderId) {
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Aquí iría la integración real con PayPal
      // Por ahora, simulamos el pago
      await Order.updatePaymentStatus(order.id, 'paid', paypalOrderId);

      return {
        success: true,
        order: await Order.getById(order.id)
      };
    } catch (error) {
      console.error('Error procesando pago con PayPal:', error);
      
      if (orderId) {
        await Order.updatePaymentStatus(orderId, 'failed');
      }

      throw error;
    }
  }

  // Procesar pago con Yape/Plin (simulado)
  static async processMobilePayment(orderId, phoneNumber, amount) {
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Verificar que el monto coincida
      if (parseFloat(amount) !== parseFloat(order.total_amount)) {
        throw new Error('El monto no coincide con el total del pedido');
      }

      // Aquí iría la integración real con Yape/Plin
      // Por ahora, simulamos el pago
      const paymentId = `YAPE-${Date.now()}`;
      await Order.updatePaymentStatus(order.id, 'paid', paymentId);

      return {
        success: true,
        payment_id: paymentId,
        order: await Order.getById(order.id)
      };
    } catch (error) {
      console.error('Error procesando pago móvil:', error);
      
      if (orderId) {
        await Order.updatePaymentStatus(orderId, 'failed');
      }

      throw error;
    }
  }

  // Procesar pago en efectivo (contra entrega)
  static async processCashPayment(orderId) {
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Pago en efectivo: el estado queda en pending hasta que se confirme
      await Order.updatePaymentStatus(order.id, 'pending');

      return {
        success: true,
        order: await Order.getById(order.id),
        message: 'Pago en efectivo registrado. Se confirmará al momento de la entrega.'
      };
    } catch (error) {
      console.error('Error procesando pago en efectivo:', error);
      throw error;
    }
  }

  // Reembolsar pago
  static async refundPayment(orderId) {
    try {
      if (!stripe) {
        throw new Error('Stripe no está configurado. Configura STRIPE_SECRET_KEY en las variables de entorno.');
      }

      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status !== 'paid') {
        throw new Error('Solo se pueden reembolsar pagos completados');
      }

      // Si es Stripe, procesar reembolso
      if (order.payment_method === 'stripe' && order.payment_id) {
        await stripe.refunds.create({
          payment_intent: order.payment_id
        });
      }

      // Actualizar estado del pedido
      await Order.updatePaymentStatus(order.id, 'refunded');

      return {
        success: true,
        order: await Order.getById(order.id)
      };
    } catch (error) {
      console.error('Error procesando reembolso:', error);
      throw error;
    }
  }

  // Webhook de Stripe
  static async handleStripeWebhook(sig, body) {
    try {
      if (!stripe) {
        throw new Error('Stripe no está configurado');
      }

      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const orderId = paymentIntent.metadata.order_id;
          
          if (orderId) {
            await Order.updatePaymentStatus(orderId, 'paid', paymentIntent.id);
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          const failedOrderId = failedPayment.metadata.order_id;
          
          if (failedOrderId) {
            await Order.updatePaymentStatus(failedOrderId, 'failed');
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error procesando webhook de Stripe:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;




