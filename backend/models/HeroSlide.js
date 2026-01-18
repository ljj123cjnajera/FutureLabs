const knex = require('../database/config');

class HeroSlide {
  static async getAll(activeOnly = false) {
    try {
      let query = knex('hero_slides');
      
      if (activeOnly) {
        query = query.where('is_active', true);
      }
      
      return await query.orderBy('order_index', 'asc').timeout(10000);
    } catch (error) {
      console.error('Error en HeroSlide.getAll:', error.message);
      throw error;
    }
  }

  static async getById(id) {
    const [slide] = await knex('hero_slides').where('id', id);
    return slide;
  }

  static async create(data) {
    const [slide] = await knex('hero_slides')
      .insert(data)
      .returning('*');
    return slide;
  }

  static async update(id, data) {
    const [slide] = await knex('hero_slides')
      .where('id', id)
      .update(data)
      .returning('*');
    return slide;
  }

  static async delete(id) {
    return await knex('hero_slides')
      .where('id', id)
      .del();
  }
}

module.exports = HeroSlide;

