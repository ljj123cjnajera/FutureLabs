const knex = require('../database/config');

class HomeSection {
  static async getAll(activeOnly = false) {
    let query = knex('home_sections');
    
    if (activeOnly) {
      query = query.where('is_active', true);
    }
    
    return await query.orderBy('order_index', 'asc');
  }

  static async getById(id) {
    const [section] = await knex('home_sections').where('id', id);
    return section;
  }

  static async create(data) {
    const [section] = await knex('home_sections')
      .insert(data)
      .returning('*');
    return section;
  }

  static async update(id, data) {
    const [section] = await knex('home_sections')
      .where('id', id)
      .update(data)
      .returning('*');
    return section;
  }

  static async delete(id) {
    return await knex('home_sections')
      .where('id', id)
      .del();
  }
}

module.exports = HomeSection;

