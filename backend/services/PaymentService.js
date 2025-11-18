const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Order = require('../models/Order');

class PaymentService {
  // Procesar pago con Stripe (ya confirmado en frontend)
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
        // Si ya está pagado, solo retornar éxito
        return {
          success: true,
          message: 'El pedido ya fue pagado',
          order: order
        };
      }

      // Buscar el payment intent asociado al pedido
      // El frontend ya confirmó el pago, aquí solo actualizamos el estado
      // Buscar por metadata
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 10,
        metadata: { order_id: order.id.toString() }
      });

      let paymentIntent = paymentIntents.data.find(pi => 
        pi.metadata.order_id === order.id.toString() && 
        pi.status === 'succeeded'
      );

      // Si no encontramos el payment intent, el pago ya fue procesado en frontend
      // Solo actualizamos el estado del pedido
      if (!paymentIntent) {
        // Buscar por payment method
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        if (paymentMethod) {
          // Actualizar estado del pedido como pagado
          await Order.updatePaymentStatus(order.id, 'paid', paymentMethodId);
          return {
            success: true,
            message: 'Pago procesado exitosamente',
            order: await Order.getById(order.id)
          };
        }
      } else {
        // Actualizar estado del pedido
        await Order.updatePaymentStatus(order.id, 'paid', paymentIntent.id);
      }

      return {
        success: true,
        payment_intent: paymentIntent,
        order: await Order.getById(order.id)
      };
    } catch (error) {
      console.error('Error procesando pago con Stripe:', error);
      
      // No actualizar a fallido si el error es que ya está pagado
      if (error.message && !error.message.includes('ya ha sido pagado')) {
        if (orderId) {
          try {
            await Order.updatePaymentStatus(orderId, 'failed');
          } catch (updateError) {
            console.error('Error actualizando estado a fallido:', updateError);
          }
        }
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

  // Crear payment intent directamente (checkout sin pedido)
  static async createDirectPaymentIntent(amount, currency = 'pen') {
    try {
      if (!stripe) {
        throw new Error('Stripe no está configurado');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convertir a centavos
        currency: currency,
      });

      return {
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creando payment intent directo:', error);
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

  // Procesar pago con Yape/Plin
  static async processMobilePayment(orderId, phoneNumber, amount, paymentType = 'yape') {
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Verificar que el monto coincida (con tolerancia de 0.01 para redondeos)
      const amountDiff = Math.abs(parseFloat(amount) - parseFloat(order.total_amount));
      if (amountDiff > 0.01) {
        throw new Error('El monto no coincide con el total del pedido');
      }

      // Validar número de teléfono peruano (9 dígitos)
      const phoneRegex = /^9\d{8}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
        throw new Error('Número de teléfono inválido. Debe ser un número peruano de 9 dígitos (ej: 987654321)');
      }

      // Obtener información de cuenta de Yape/Plin desde variables de entorno
      const yapePhone = process.env.YAPE_PHONE || '999999999';
      const plinPhone = process.env.PLIN_PHONE || '999999999';
      
      const merchantPhone = paymentType === 'yape' ? yapePhone : plinPhone;
      const paymentId = `${paymentType.toUpperCase()}-${Date.now()}`;
      
      // Marcar como pendiente - el pago se confirmará manualmente o mediante webhook
      // En producción, aquí iría la integración real con la API de Yape/Plin
      await Order.updatePaymentStatus(order.id, 'pending', paymentId);

      return {
        success: true,
        payment_id: paymentId,
        payment_type: paymentType,
        merchant_phone: merchantPhone,
        customer_phone: phoneNumber,
        amount: order.total_amount,
        order: await Order.getById(order.id),
        message: `Pago con ${paymentType === 'yape' ? 'Yape' : 'Plin'} registrado. Realiza el pago a ${merchantPhone} y espera la confirmación.`
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

  // Procesar transferencia bancaria
  static async processBankTransfer(orderId) {
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Transferencia bancaria: el estado queda en pending hasta que se confirme
      const paymentId = `BANK-TRANSFER-${Date.now()}`;
      await Order.updatePaymentStatus(order.id, 'pending', paymentId);

      return {
        success: true,
        payment_id: paymentId,
        payment_type: 'bank_transfer',
        order: await Order.getById(order.id),
        message: 'Transferencia bancaria registrada. Realiza la transferencia y envía el comprobante. Espera la confirmación.'
      };
    } catch (error) {
      console.error('Error procesando transferencia bancaria:', error);
      
      if (orderId) {
        await Order.updatePaymentStatus(orderId, 'failed');
      }

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




