const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Order = require('../models/Order');
const PaymentTransaction = require('../models/PaymentTransaction');
const emailService = require('./emailService');
const User = require('../models/User');

class PaymentService {
  // Procesar pago con Stripe (ya confirmado en frontend)
  static async processStripePayment(orderId, paymentMethodId) {
    let transaction = null;
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

      // Crear registro de transacción
      transaction = await PaymentTransaction.create({
        order_id: orderId,
        payment_method: 'stripe',
        amount: order.total_amount,
        status: 'processing',
        payment_id: paymentMethodId,
        metadata: { payment_method_id: paymentMethodId }
      });

      // Buscar el payment intent asociado al pedido
      // El frontend ya confirmó el pago, aquí solo actualizamos el estado
      // Buscar por metadata o payment_id del pedido
      let paymentIntent = null;
      
      if (order.payment_id) {
        try {
          paymentIntent = await stripe.paymentIntents.retrieve(order.payment_id);
        } catch (e) {
          console.warn('No se pudo recuperar payment intent por payment_id:', e.message);
        }
      }

      if (!paymentIntent) {
        // Buscar por metadata
        const paymentIntents = await stripe.paymentIntents.list({
          limit: 10,
          metadata: { order_id: order.id.toString() }
        });

        paymentIntent = paymentIntents.data.find(pi => 
          pi.metadata.order_id === order.id.toString() && 
          pi.status === 'succeeded'
        );
      }

      // Si no encontramos el payment intent, el pago ya fue procesado en frontend
      // Solo actualizamos el estado del pedido
      if (!paymentIntent) {
        // Buscar por payment method
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        if (paymentMethod) {
          // Actualizar estado del pedido como pagado
          await Order.updatePaymentStatus(order.id, 'paid', paymentMethodId);
          
          // Actualizar transacción
          await PaymentTransaction.updateStatus(transaction.id, 'succeeded', paymentMethodId);
          
          return {
            success: true,
            message: 'Pago procesado exitosamente',
            order: await Order.getById(order.id)
          };
        }
      } else {
        // Actualizar estado del pedido
        await Order.updatePaymentStatus(order.id, 'paid', paymentIntent.id);
        
        // Actualizar transacción
        await PaymentTransaction.updateStatus(transaction.id, 'succeeded', paymentIntent.id);
      }

      const updatedOrder = await Order.getById(order.id);

      // Enviar email de pago exitoso y notificaciones
      try {
        const user = await User.getById(order.user_id);
        if (user && user.email) {
          emailService.sendPaymentSuccess(
            user.email,
            updatedOrder,
            `${user.first_name} ${user.last_name}`,
            'stripe'
          ).catch(err => console.error('Error enviando email de pago exitoso:', err));
          
          // Notificar confirmación
          NotificationService.notifyPaymentConfirmed(order.id).catch(err => 
            console.error('Error en notificación:', err)
          );
        }
      } catch (emailError) {
        console.error('Error obteniendo usuario para email:', emailError);
      }

      return {
        success: true,
        payment_intent: paymentIntent,
        order: updatedOrder
      };
    } catch (error) {
      console.error('Error procesando pago con Stripe:', error);
      
      // Actualizar transacción como fallida
      if (transaction) {
        await PaymentTransaction.updateStatus(
          transaction.id, 
          'failed', 
          null, 
          error.message
        );
      }
      
      // No actualizar a fallido si el error es que ya está pagado
      if (error.message && !error.message.includes('ya ha sido pagado')) {
        if (orderId) {
          try {
            await Order.updatePaymentStatus(orderId, 'failed');
            
            // Enviar email de pago fallido
            try {
              const failedOrder = await Order.getById(orderId);
              if (failedOrder) {
                const user = await User.getById(failedOrder.user_id);
                if (user && user.email) {
                  emailService.sendPaymentFailed(
                    user.email,
                    failedOrder,
                    `${user.first_name} ${user.last_name}`,
                    error.message
                  ).catch(err => console.error('Error enviando email de pago fallido:', err));
                  
                  NotificationService.notifyPaymentFailed(orderId, error.message).catch(err => 
                    console.error('Error en notificación de pago fallido:', err)
                  );
                }
              }
            } catch (emailError) {
              console.error('Error obteniendo usuario para email de pago fallido:', emailError);
            }
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
    let transaction = null;
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
      
      // Crear registro de transacción
      transaction = await PaymentTransaction.create({
        order_id: orderId,
        payment_method: paymentType,
        amount: order.total_amount,
        status: 'pending',
        payment_id: paymentId,
        metadata: {
          customer_phone: phoneNumber,
          merchant_phone: merchantPhone
        }
      });
      
      // Marcar como pendiente - el pago se confirmará manualmente o mediante webhook
      // En producción, aquí iría la integración real con la API de Yape/Plin
      await Order.updatePaymentStatus(order.id, 'pending', paymentId);

      const updatedOrder = await Order.getById(order.id);

      // Enviar email de pago pendiente y notificaciones
      try {
        const user = await User.getById(order.user_id);
        if (user && user.email) {
          const paymentInstructions = emailService.getPendingPaymentInstructions(paymentType, updatedOrder);
          emailService.sendPaymentPending(
            user.email,
            updatedOrder,
            `${user.first_name} ${user.last_name}`,
            paymentType,
            paymentInstructions
          ).catch(err => console.error('Error enviando email de pago pendiente:', err));
          
          // Notificar a admin sobre pago pendiente
          NotificationService.notifyAdminPendingPayment(transaction.id).catch(err => 
            console.error('Error en notificación a admin:', err)
          );
        }
      } catch (emailError) {
        console.error('Error obteniendo usuario para email:', emailError);
      }

      return {
        success: true,
        payment_id: paymentId,
        payment_type: paymentType,
        merchant_phone: merchantPhone,
        customer_phone: phoneNumber,
        amount: order.total_amount,
        transaction_id: transaction.id,
        order: updatedOrder,
        message: `Pago con ${paymentType === 'yape' ? 'Yape' : 'Plin'} registrado. Realiza el pago a ${merchantPhone} y espera la confirmación.`
      };
    } catch (error) {
      console.error('Error procesando pago móvil:', error);
      
      // Actualizar transacción como fallida
      if (transaction) {
        await PaymentTransaction.updateStatus(
          transaction.id, 
          'failed', 
          null, 
          error.message
        );
      }
      
      if (orderId) {
        await Order.updatePaymentStatus(orderId, 'failed');
      }

      throw error;
    }
  }

  // Procesar pago en efectivo (contra entrega)
  static async processCashPayment(orderId) {
    let transaction = null;
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      const paymentId = `CASH-${Date.now()}`;

      // Crear registro de transacción
      transaction = await PaymentTransaction.create({
        order_id: orderId,
        payment_method: 'cash',
        amount: order.total_amount,
        status: 'pending',
        payment_id: paymentId,
        metadata: { type: 'contra_entrega' }
      });

      // Pago en efectivo: el estado queda en pending hasta que se confirme
      await Order.updatePaymentStatus(order.id, 'pending', paymentId);

      const updatedOrder = await Order.getById(order.id);

      // Enviar email de pago pendiente y notificaciones
      try {
        const user = await User.getById(order.user_id);
        if (user && user.email) {
          const paymentInstructions = emailService.getPendingPaymentInstructions('cash', updatedOrder);
          emailService.sendPaymentPending(
            user.email,
            updatedOrder,
            `${user.first_name} ${user.last_name}`,
            'cash',
            paymentInstructions
          ).catch(err => console.error('Error enviando email de pago pendiente:', err));
          
          // Notificar a admin sobre pago pendiente
          NotificationService.notifyAdminPendingPayment(transaction.id).catch(err => 
            console.error('Error en notificación a admin:', err)
          );
        }
      } catch (emailError) {
        console.error('Error obteniendo usuario para email:', emailError);
      }

      return {
        success: true,
        transaction_id: transaction.id,
        order: updatedOrder,
        message: 'Pago en efectivo registrado. Se confirmará al momento de la entrega.'
      };
    } catch (error) {
      console.error('Error procesando pago en efectivo:', error);
      
      // Actualizar transacción como fallida
      if (transaction) {
        await PaymentTransaction.updateStatus(
          transaction.id, 
          'failed', 
          null, 
          error.message
        );
      }
      
      throw error;
    }
  }

  // Procesar transferencia bancaria
  static async processBankTransfer(orderId) {
    let transaction = null;
    try {
      const order = await Order.getById(orderId);

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.payment_status === 'paid') {
        throw new Error('El pedido ya ha sido pagado');
      }

      // Obtener información bancaria
      const bankAccount = process.env.BANK_ACCOUNT || null;
      const bankName = process.env.BANK_NAME || 'Banco de la Nación';
      const bankCCI = process.env.BANK_CCI || null;

      // Transferencia bancaria: el estado queda en pending hasta que se confirme
      const paymentId = `BANK-TRANSFER-${Date.now()}`;
      
      // Crear registro de transacción
      transaction = await PaymentTransaction.create({
        order_id: orderId,
        payment_method: 'bank_transfer',
        amount: order.total_amount,
        status: 'pending',
        payment_id: paymentId,
        metadata: {
          bank_account: bankAccount,
          bank_name: bankName,
          bank_cci: bankCCI
        }
      });
      
      await Order.updatePaymentStatus(order.id, 'pending', paymentId);

      const updatedOrder = await Order.getById(order.id);

      // Enviar email de pago pendiente y notificaciones
      try {
        const user = await User.getById(order.user_id);
        if (user && user.email) {
          const paymentInstructions = emailService.getPendingPaymentInstructions('bank_transfer', updatedOrder);
          emailService.sendPaymentPending(
            user.email,
            updatedOrder,
            `${user.first_name} ${user.last_name}`,
            'bank_transfer',
            paymentInstructions
          ).catch(err => console.error('Error enviando email de pago pendiente:', err));
          
          // Notificar a admin sobre pago pendiente
          NotificationService.notifyAdminPendingPayment(transaction.id).catch(err => 
            console.error('Error en notificación a admin:', err)
          );
        }
      } catch (emailError) {
        console.error('Error obteniendo usuario para email:', emailError);
      }

      return {
        success: true,
        payment_id: paymentId,
        payment_type: 'bank_transfer',
        transaction_id: transaction.id,
        bank_account: bankAccount,
        bank_name: bankName,
        bank_cci: bankCCI,
        order: updatedOrder,
        message: 'Transferencia bancaria registrada. Realiza la transferencia y envía el comprobante. Espera la confirmación.'
      };
    } catch (error) {
      console.error('Error procesando transferencia bancaria:', error);
      
      // Actualizar transacción como fallida
      if (transaction) {
        await PaymentTransaction.updateStatus(
          transaction.id, 
          'failed', 
          null, 
          error.message
        );
      }
      
      if (orderId) {
        await Order.updatePaymentStatus(orderId, 'failed');
      }

      throw error;
    }
  }

  // Confirmar pago pendiente (admin)
  static async confirmPendingPayment(transactionId, adminNotes = null) {
    try {
      const transaction = await PaymentTransaction.getById(transactionId);
      
      if (!transaction) {
        throw new Error('Transacción no encontrada');
      }

      if (transaction.status !== 'pending') {
        throw new Error(`La transacción ya está ${transaction.status}. Solo se pueden confirmar pagos pendientes.`);
      }

      const order = await Order.getById(transaction.order_id);
      
      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      // Actualizar transacción
      await PaymentTransaction.updateStatus(transaction.id, 'succeeded', transaction.payment_id);
      
      // Actualizar pedido
      await Order.updatePaymentStatus(order.id, 'paid', transaction.payment_id);

      const updatedOrder = await Order.getById(order.id);

      // Enviar email de pago exitoso y notificaciones
      try {
        const user = await User.getById(order.user_id);
        if (user && user.email) {
          emailService.sendPaymentSuccess(
            user.email,
            updatedOrder,
            `${user.first_name} ${user.last_name}`,
            transaction.payment_method
          ).catch(err => console.error('Error enviando email de pago exitoso:', err));
          
          // Notificar confirmación
          NotificationService.notifyPaymentConfirmed(order.id).catch(err => 
            console.error('Error en notificación:', err)
          );
        }
      } catch (emailError) {
        console.error('Error obteniendo usuario para email:', emailError);
      }

      return {
        success: true,
        message: 'Pago confirmado exitosamente',
        transaction: await PaymentTransaction.getById(transaction.id),
        order: updatedOrder
      };
    } catch (error) {
      console.error('Error confirmando pago pendiente:', error);
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




