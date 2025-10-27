const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    // Configurar SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('✅ SendGrid configurado correctamente');
    } else {
      console.log('⚠️  SENDGRID_API_KEY no configurado. Los emails no se enviarán automáticamente.');
    }
  }

  // Enviar código de verificación por email
  async sendVerificationCode(email, code, userName) {
    try {
      // Si no hay API key de SendGrid, lanzar error para que muestre código en pantalla
      if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️  SendGrid no configurado, el código se mostrará en pantalla');
        throw new Error('SENDGRID_NO_CONFIGURED');
      }

      const msg = {
        to: email,
        from: 'noreply@futurelabs.com', // Debes cambiar esto a tu email verificado en SendGrid
        subject: 'Verifica tu cuenta - FutureLabs',
        html: `
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
      `
      };

      await sgMail.send(msg);
      console.log(`✅ Email de verificación enviado a ${email} (SendGrid)`);
      return true;
    } catch (error) {
      if (error.message === 'SENDGRID_NO_CONFIGURED') {
        throw error; // Relanzar para que el código se muestre en pantalla
      }
      console.error('❌ Error enviando email con SendGrid:', error.message);
      throw error;
    }
  }

  // Enviar código de recuperación de contraseña
  async sendPasswordResetCode(email, code, userName) {
    try {
      // Si no hay API key de SendGrid, lanzar error
      if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️  SendGrid no configurado, no se puede enviar email de recuperación');
        throw new Error('SENDGRID_NO_CONFIGURED');
      }

      const msg = {
        to: email,
        from: 'noreply@futurelabs.com',
        subject: 'Recupera tu contraseña - FutureLabs',
        html: `
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
        `
      };

      await sgMail.send(msg);
      console.log(`✅ Email de recuperación enviado a ${email} (SendGrid)`);
      return true;
    } catch (error) {
      if (error.message === 'SENDGRID_NO_CONFIGURED') {
        throw error;
      }
      console.error('❌ Error enviando email de recuperación con SendGrid:', error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();
