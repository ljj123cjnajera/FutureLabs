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
            S/ ${parseFloat(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `).join('');

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
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
            .order-number { font-size: 24px; color: #667eea; font-weight: bold; }
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
                  <tr>
                    <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold; font-size: 18px;">
                      Total: S/ ${parseFloat(orderData.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p><strong>Dirección de envío:</strong><br>
              ${orderData.shipping_address}<br>
              ${orderData.shipping_city}, ${orderData.shipping_country}</p>
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
