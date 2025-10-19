const db = require('../database/config');
const bcrypt = require('bcryptjs');

class User {
  // Obtener usuario por ID
  static async getById(id) {
    return await db('users')
      .where({ id })
      .first();
  }

  // Obtener usuario por email
  static async getByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }

  // Obtener usuario por email verification token
  static async getByEmailToken(token) {
    return await db('users')
      .where({ email_verification_token: token })
      .first();
  }

  // Obtener usuario por password reset token
  static async getByResetToken(token) {
    return await db('users')
      .where({ password_reset_token: token })
      .where('password_reset_expires', '>', new Date())
      .first();
  }

  // Crear usuario
  static async create(data) {
    // Hashear password
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const userData = {
      email: data.email,
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: data.role || 'client',
      email_verification_token: data.email_verification_token
    };

    const [user] = await db('users')
      .insert(userData)
      .returning('*');
    
    // Eliminar password_hash del objeto retornado
    delete user.password_hash;
    return user;
  }

  // Actualizar usuario
  static async update(id, data) {
    // Si hay password, hashearlo
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    const [user] = await db('users')
      .where({ id })
      .update(data)
      .returning('*');
    
    // Eliminar password_hash del objeto retornado
    if (user) {
      delete user.password_hash;
    }
    
    return user;
  }

  // Verificar password
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  // Verificar email
  static async verifyEmail(id) {
    return await db('users')
      .where({ id })
      .update({
        email_verified: true,
        email_verified_at: new Date(),
        email_verification_token: null
      });
  }

  // Eliminar usuario
  static async delete(id) {
    return await db('users')
      .where({ id })
      .del();
  }

  // Obtener todos los usuarios (admin)
  static async getAll(filters = {}) {
    let query = db('users')
      .select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'email_verified', 'created_at', 'updated_at');

    if (filters.role) {
      query = query.where('role', filters.role);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('first_name', 'ilike', `%${filters.search}%`)
            .orWhere('last_name', 'ilike', `%${filters.search}%`)
            .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }

    query = query.orderBy('created_at', 'desc');

    return await query;
  }

  // Buscar por token de recuperación de contraseña
  static async findByPasswordResetToken(token) {
    const [user] = await db('users')
      .where('password_reset_token', token);
    return user;
  }
}

module.exports = User;
