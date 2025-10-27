const db = require('../database/config');

class VerificationCode {
  // Crear nuevo código de verificación
  static async create(userId, type = 'email') {
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expira en 10 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    const [verificationCode] = await db('verification_codes')
      .insert({
        id: require('uuid').v4(),
        user_id: userId,
        code,
        type,
        is_used: false,
        expires_at: expiresAt
      })
      .returning('*');
    
    return verificationCode;
  }

  // Buscar código por código y tipo
  static async findByCode(code, type = 'email') {
    return await db('verification_codes')
      .where({ code, type })
      .where('expires_at', '>', new Date())
      .where('is_used', false)
      .first();
  }

  // Buscar código activo por usuario
  static async findActiveCodeByUser(userId, type = 'email') {
    return await db('verification_codes')
      .where({ user_id: userId, type })
      .where('expires_at', '>', new Date())
      .where('is_used', false)
      .orderBy('created_at', 'desc')
      .first();
  }

  // Marcar código como usado
  static async markAsUsed(codeId) {
    return await db('verification_codes')
      .where({ id: codeId })
      .update({ is_used: true });
  }

  // Invalidar todos los códigos de un usuario por tipo
  static async invalidateUserCodes(userId, type) {
    return await db('verification_codes')
      .where({ user_id: userId, type })
      .update({ is_used: true }); // Marcar como usados
  }

  // Eliminar códigos expirados (cleanup)
  static async deleteExpired() {
    return await db('verification_codes')
      .where('expires_at', '<', new Date())
      .del();
  }
}

module.exports = VerificationCode;

