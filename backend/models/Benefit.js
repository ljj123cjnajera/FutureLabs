const knex = require('../database/config');

class Benefit {
  static async getAll(activeOnly = false) {
    let query = knex('benefits');
    
    if (activeOnly) {
      query = query.where('is_active', true);
    }
    
    return await query.orderBy('order_index', 'asc');
  }

  static async getById(id) {
    const [benefit] = await knex('benefits').where('id', id);
    return benefit;
  }

  static async create(data) {
    const [benefit] = await knex('benefits')
      .insert(data)
      .returning('*');
    return benefit;
  }

  static async update(id, data) {
    const [benefit] = await knex('benefits')
      .where('id', id)
      .update(data)
      .returning('*');
    return benefit;
  }

  static async delete(id) {
    return await knex('benefits')
      .where('id', id)
      .del();
  }
}

module.exports = Benefit;

