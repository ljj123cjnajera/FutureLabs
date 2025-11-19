const { Resend } = require('resend');

class EmailService {
  constructor() {
    // Configurar Resend
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend configurado correctamente');
    } else {
      console.log('⚠️  RESEND_API_KEY no configurado. Los emails no se enviarán automáticamente.');
    }
  }

  // Enviar código de verificación por email
  async sendVerificationCode(email, code, userName) {
    try {
      // Si no hay API key de Resend, lanzar error para que muestre código en pantalla
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️  Resend no configurado, el código se mostrará en pantalla');
        throw new Error('RESEND_NO_CONFIGURED');
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; margin-top: -5px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; 
                   text-align: center; padding: 20px; 
                   background: white; border: 2px dashed #667eea; 
                   margin: 20px 0; letter-spacing: 5px; border-radius: 5px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 FutureLabs</h1>
              <p>Verifica tu cuenta</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Gracias por registrarte en FutureLabs. Para completar tu registro, necesitamos verificar tu email.</p>
              <p>Ingresa el siguiente código en la página de verificación:</p>
              <div class="code">${code}</div>
              <p>Este código expirará en <strong>10 minutos</strong>.</p>
              <p>Si no solicitaste este código, puedes ignorar este email.</p>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
              <p>Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: 'Verifica tu cuenta - FutureLabs',
        html: html
      });

      console.log(`✅ Email de verificación enviado a ${email} (Resend)`);
      return true;
    } catch (error) {
      if (error.message === 'RESEND_NO_CONFIGURED') {
        throw error; // Relanzar para que el código se muestre en pantalla
      }
      console.error('❌ Error enviando email con Resend:', error.message);
      throw error;
    }
  }

  // Enviar código de recuperación de contraseña
  async sendPasswordResetCode(email, code, userName) {
    try {
      // Si no hay API key de Resend, lanzar error
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️  Resend no configurado, no se puede enviar email de recuperación');
        throw new Error('RESEND_NO_CONFIGURED');
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; margin-top: -5px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; 
                   text-align: center; padding: 20px; 
                   background: white; border: 2px dashed #667eea; 
                   margin: 20px 0; letter-spacing: 5px; border-radius: 5px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 FutureLabs</h1>
              <p>Recupera tu contraseña</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
              <p>Ingresa el siguiente código para continuar:</p>
              <div class="code">${code}</div>
              <p>Este código expirará en <strong>15 minutos</strong>.</p>
              <p>Si no solicitaste recuperar tu contraseña, puedes ignorar este email.</p>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
              <p>Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: 'Recupera tu contraseña - FutureLabs',
        html: html
      });

      console.log(`✅ Email de recuperación enviado a ${email} (Resend)`);
      return true;
    } catch (error) {
      if (error.message === 'RESEND_NO_CONFIGURED') {
        throw error;
      }
      console.error('❌ Error enviando email de recuperación con Resend:', error.message);
      throw error;
    }
  }

  // Enviar email de confirmación de pedido
  async sendOrderConfirmation(email, orderData, userName) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️  Resend no configurado');
        return false;
      }

      const itemsHtml = orderData.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.product_name}</strong>
          </td>
          <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">
            ${item.quantity}
          </td>
          <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">
            S/ ${parseFloat((item.discount_price || item.price) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `).join('');

      // Información de pago
      let paymentInfoHtml = '';
      if (orderData.payment_status === 'paid') {
        paymentInfoHtml = `
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong style="color: #155724;">✅ Pago Confirmado</strong>
            <p style="margin: 5px 0; color: #155724;">Método: ${this.getPaymentMethodName(orderData.payment_method)}</p>
            <p style="margin: 5px 0; color: #155724;">Tu pedido será procesado y enviado pronto.</p>
          </div>
        `;
      } else if (orderData.payment_status === 'pending') {
        paymentInfoHtml = this.getPendingPaymentInstructions(orderData.payment_method, orderData);
      }

      // Información de descuentos
      let discountsHtml = '';
      if (orderData.coupon_discount > 0) {
        discountsHtml += `
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px;">Descuento por cupón:</td>
            <td style="text-align: right; padding: 10px; color: #28a745;">- S/ ${parseFloat(orderData.coupon_discount).toFixed(2)}</td>
          </tr>
        `;
      }
      if (orderData.loyalty_points_discount > 0) {
        discountsHtml += `
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px;">Descuento por puntos:</td>
            <td style="text-align: right; padding: 10px; color: #28a745;">- S/ ${parseFloat(orderData.loyalty_points_discount).toFixed(2)}</td>
          </tr>
        `;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; margin-top: -5px; border-radius: 0 0 10px 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
            .order-number { font-size: 24px; color: #667eea; font-weight: bold; margin: 15px 0; }
            .info-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 FutureLabs</h1>
              <p>¡Pedido Confirmado!</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Tu pedido ha sido confirmado exitosamente.</p>
              <div class="order-number">Pedido #${orderData.order_number}</div>
              
              <table>
                <thead>
                  <tr style="background: #667eea; color: white;">
                    <th style="padding: 10px; text-align: left;">Producto</th>
                    <th style="padding: 10px; text-align: center;">Cantidad</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  ${discountsHtml}
                  <tr>
                    <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold; font-size: 18px; border-top: 2px solid #667eea;">
                      Total: S/ ${parseFloat(orderData.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              ${paymentInfoHtml}

              <div class="info-box">
                <p><strong>Dirección de envío:</strong><br>
                ${orderData.shipping_address}<br>
                ${orderData.shipping_city}, ${orderData.shipping_country}</p>
                ${orderData.shipping_phone ? `<p><strong>Teléfono:</strong> ${orderData.shipping_phone}</p>` : ''}
              </div>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
              <p>Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: `Confirmación de Pedido #${orderData.order_number} - FutureLabs`,
        html: html
      });

      console.log(`✅ Email de confirmación de pedido enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de confirmación de pedido:', error.message);
      return false;
    }
  }

  // Enviar email de pago exitoso
  async sendPaymentSuccess(email, orderData, userName, paymentMethod) {
    try {
      if (!process.env.RESEND_API_KEY) {
        return false;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; margin-top: -5px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ FutureLabs</h1>
              <p>¡Pago Exitoso!</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <div class="success-box">
                <p style="margin: 0; color: #155724;"><strong>✅ Tu pago ha sido procesado exitosamente</strong></p>
                <p style="margin: 5px 0; color: #155724;">Pedido #${orderData.order_number}</p>
                <p style="margin: 5px 0; color: #155724;">Monto: S/ ${parseFloat(orderData.total_amount).toFixed(2)}</p>
                <p style="margin: 5px 0; color: #155724;">Método: ${this.getPaymentMethodName(paymentMethod)}</p>
              </div>
              <p>Tu pedido está siendo procesado y te notificaremos cuando sea enviado.</p>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: `Pago Exitoso - Pedido #${orderData.order_number} - FutureLabs`,
        html: html
      });

      console.log(`✅ Email de pago exitoso enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de pago exitoso:', error.message);
      return false;
    }
  }

  // Enviar email de pago pendiente
  async sendPaymentPending(email, orderData, userName, paymentMethod, paymentInstructions) {
    try {
      if (!process.env.RESEND_API_KEY) {
        return false;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; margin-top: -5px; border-radius: 0 0 10px 10px; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .instructions-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏳ FutureLabs</h1>
              <p>Pago Pendiente</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <div class="warning-box">
                <p style="margin: 0; color: #856404;"><strong>⏳ Tu pago está pendiente de confirmación</strong></p>
                <p style="margin: 5px 0; color: #856404;">Pedido #${orderData.order_number}</p>
                <p style="margin: 5px 0; color: #856404;">Monto: S/ ${parseFloat(orderData.total_amount).toFixed(2)}</p>
                <p style="margin: 5px 0; color: #856404;">Método: ${this.getPaymentMethodName(paymentMethod)}</p>
              </div>
              <div class="instructions-box">
                <h3 style="margin-top: 0; color: #0c5460;">Instrucciones de Pago:</h3>
                ${paymentInstructions}
              </div>
              <p>Una vez confirmemos tu pago, procesaremos tu pedido y te notificaremos.</p>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: `Pago Pendiente - Pedido #${orderData.order_number} - FutureLabs`,
        html: html
      });

      console.log(`✅ Email de pago pendiente enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de pago pendiente:', error.message);
      return false;
    }
  }

  // Enviar email de pago fallido
  async sendPaymentFailed(email, orderData, userName, errorMessage) {
    try {
      if (!process.env.RESEND_API_KEY) {
        return false;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; margin-top: -5px; border-radius: 0 0 10px 10px; }
            .error-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; 
                     text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ FutureLabs</h1>
              <p>Pago Fallido</p>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <div class="error-box">
                <p style="margin: 0; color: #721c24;"><strong>❌ Tu pago no pudo ser procesado</strong></p>
                <p style="margin: 5px 0; color: #721c24;">Pedido #${orderData.order_number}</p>
                ${errorMessage ? `<p style="margin: 5px 0; color: #721c24;">Razón: ${errorMessage}</p>` : ''}
              </div>
              <p>No te preocupes, tu pedido sigue activo. Por favor, intenta realizar el pago nuevamente.</p>
              <p style="text-align: center;">
                <a href="https://ljj123cjnajera.github.io/FutureLabs/orders.html" class="button">
                  Ver Mis Pedidos
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: `Pago Fallido - Pedido #${orderData.order_number} - FutureLabs`,
        html: html
      });

      console.log(`✅ Email de pago fallido enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de pago fallido:', error.message);
      return false;
    }
  }

  // Helper: Obtener nombre del método de pago
  getPaymentMethodName(method) {
    const methods = {
      'stripe': 'Tarjeta de Crédito/Débito',
      'yape': 'Yape',
      'plin': 'Plin',
      'bank_transfer': 'Transferencia Bancaria',
      'cash': 'Efectivo (Contra Entrega)',
      'paypal': 'PayPal'
    };
    return methods[method] || method;
  }

  // Helper: Obtener instrucciones de pago pendiente
  getPendingPaymentInstructions(method, orderData) {
    if (method === 'yape' || method === 'plin') {
      const phone = method === 'yape' ? (process.env.YAPE_PHONE || '999999999') : (process.env.PLIN_PHONE || '999999999');
      return `
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong style="color: #856404;">⏳ Pago Pendiente</strong>
          <p style="margin: 5px 0; color: #856404;">Método: ${this.getPaymentMethodName(method)}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Instrucciones:</strong></p>
          <ol style="margin: 5px 0; color: #856404; padding-left: 20px;">
            <li>Abre tu app ${method === 'yape' ? 'Yape' : 'Plin'}</li>
            <li>Realiza el pago de S/ ${parseFloat(orderData.total_amount).toFixed(2)} al número: <strong>${phone}</strong></li>
            <li>Espera nuestra confirmación. Te notificaremos por email cuando confirmemos tu pago.</li>
          </ol>
        </div>
      `;
    } else if (method === 'bank_transfer') {
      const bankAccount = process.env.BANK_ACCOUNT || 'N/A';
      const bankName = process.env.BANK_NAME || 'Banco de la Nación';
      const bankCCI = process.env.BANK_CCI || '';
      return `
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong style="color: #856404;">⏳ Pago Pendiente</strong>
          <p style="margin: 5px 0; color: #856404;">Método: Transferencia Bancaria</p>
          <p style="margin: 5px 0; color: #856404;"><strong>Instrucciones:</strong></p>
          <ol style="margin: 5px 0; color: #856404; padding-left: 20px;">
            <li>Realiza una transferencia de S/ ${parseFloat(orderData.total_amount).toFixed(2)}</li>
            <li>Banco: <strong>${bankName}</strong></li>
            <li>Cuenta: <strong>${bankAccount}</strong></li>
            ${bankCCI ? `<li>CCI: <strong>${bankCCI}</strong></li>` : ''}
            <li>Envía el comprobante a nuestro email o WhatsApp</li>
            <li>Espera nuestra confirmación. Te notificaremos por email cuando confirmemos tu pago.</li>
          </ol>
        </div>
      `;
    } else if (method === 'cash') {
      return `
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong style="color: #856404;">⏳ Pago Pendiente</strong>
          <p style="margin: 5px 0; color: #856404;">Método: Efectivo (Contra Entrega)</p>
          <p style="margin: 5px 0; color: #856404;">Pagará S/ ${parseFloat(orderData.total_amount).toFixed(2)} al momento de recibir tu pedido.</p>
        </div>
      `;
    }
    return '';
  }

  // Enviar email de bienvenida
  async sendWelcomeEmail(email, userName) {
    try {
      if (!process.env.RESEND_API_KEY) {
        return false;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; 
                     text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 ¡Bienvenido a FutureLabs!</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Gracias por registrarte en FutureLabs, tu portal al futuro.</p>
              <p>Ahora puedes:</p>
              <ul>
                <li>✅ Explorar miles de productos tecnológicos</li>
                <li>✅ Crear tu lista de favoritos</li>
                <li>✅ Realizar compras seguras</li>
                <li>✅ Acceder a ofertas exclusivas</li>
              </ul>
              <p style="text-align: center;">
                <a href="https://ljj123cjnajera.github.io/FutureLabs/products.html" class="button">
                  Ver Productos
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 FutureLabs - Tu Portal al Futuro</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'FutureLabs <no-reply@futurelabs.website>',
        to: email,
        subject: '¡Bienvenido a FutureLabs!',
        html: html
      });

      console.log(`✅ Email de bienvenida enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
