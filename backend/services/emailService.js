const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurar transporter con credenciales de las variables de entorno
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Obtener transporter (lazy initialization)
  getTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Enviar código de verificación por email
  async sendVerificationCode(email, code, userName) {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: `FutureLabs <${process.env.SMTP_USER}>`,
        to: email,
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
                      padding: 30px; text-align: center; color: white; }
            .content { background: #f9f9f9; padding: 30px; margin-top: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; 
                   text-align: center; padding: 20px; 
                   background: white; border: 2px dashed #667eea; 
                   margin: 20px 0; letter-spacing: 5px; }
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

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email de verificación enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error.message);
      console.error('Error completo:', error);
      throw error;
    }
  }

  // Enviar código de recuperación de contraseña
  async sendPasswordResetCode(email, code, userName) {
    const mailOptions = {
      from: `FutureLabs <${process.env.SMTP_USER}>`,
      to: email,
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
                      padding: 30px; text-align: center; color: white; }
            .content { background: #f9f9f9; padding: 30px; margin-top: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; 
                   text-align: center; padding: 20px; 
                   background: white; border: 2px dashed #667eea; 
                   margin: 20px 0; letter-spacing: 5px; }
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

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de recuperación enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

