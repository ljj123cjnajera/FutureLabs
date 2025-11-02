const knex = require('../database/config');

class Address {
  // Obtener todas las direcciones de un usuario
  static async getByUserId(userId) {
    return await knex('user_addresses')
      .where('user_id', userId)
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'desc');
  }

  // Obtener una dirección por ID
  static async getById(id, userId) {
    const [address] = await knex('user_addresses')
      .where({ id, user_id: userId });
    return address;
  }

  // Crear nueva dirección
  static async create(userId, addressData) {
    // Si es la primera dirección o se marca como default, quitar default de otras
    if (addressData.is_default || addressData.is_default === undefined) {
      const existingAddresses = await this.getByUserId(userId);
      if (existingAddresses.length === 0 || addressData.is_default) {
        await knex('user_addresses')
          .where('user_id', userId)
          .update({ is_default: false });
      }
      addressData.is_default = true;
    } else {
      addressData.is_default = false;
    }

    const [newAddress] = await knex('user_addresses')
      .insert({
        user_id: userId,
        ...addressData
      })
      .returning('*');

    return newAddress;
  }

  // Actualizar dirección
  static async update(id, userId, addressData) {
    // Si se marca como default, quitar default de otras
    if (addressData.is_default) {
      await knex('user_addresses')
        .where('user_id', userId)
        .where('id', '!=', id)
        .update({ is_default: false });
    }

    const [updated] = await knex('user_addresses')
      .where({ id, user_id: userId })
      .update({
        ...addressData,
        updated_at: knex.fn.now()
      })
      .returning('*');

    return updated;
  }

  // Eliminar dirección
  static async delete(id, userId) {
    return await knex('user_addresses')
      .where({ id, user_id: userId })
      .del();
  }

  // Establecer dirección por defecto
  static async setDefault(id, userId) {
    // Quitar default de todas las direcciones del usuario
    await knex('user_addresses')
      .where('user_id', userId)
      .update({ is_default: false });

    // Establecer como default
    const [updated] = await knex('user_addresses')
      .where({ id, user_id: userId })
      .update({ is_default: true })
      .returning('*');

    return updated;
  }

  // Obtener dirección por defecto
  static async getDefault(userId) {
    const [address] = await knex('user_addresses')
      .where({ user_id: userId, is_default: true });
    
    return address;
  }
}

module.exports = Address;

