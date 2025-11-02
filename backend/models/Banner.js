const knex = require('../database/config');

class Banner {
  static async getAll(filters = {}) {
    let query = knex('banners');
    
    if (filters.banner_type) {
      query = query.where('banner_type', filters.banner_type);
    }
    
    if (filters.position) {
      query = query.where('position', filters.position);
    }
    
    if (filters.activeOnly) {
      query = query.where('is_active', true);
      
      // Filtrar por fechas si están activas
      const now = new Date();
      query = query.where(function() {
        this.whereNull('start_date').orWhere('start_date', '<=', now);
      }).where(function() {
        this.whereNull('end_date').orWhere('end_date', '>=', now);
      });
    }
    
    return await query.orderBy('order_index', 'asc');
  }

  static async getById(id) {
    const [banner] = await knex('banners').where('id', id);
    return banner;
  }

  static async create(data) {
    const [banner] = await knex('banners')
      .insert(data)
      .returning('*');
    return banner;
  }

  static async update(id, data) {
    const [banner] = await knex('banners')
      .where('id', id)
      .update(data)
      .returning('*');
    return banner;
  }

  static async delete(id) {
    return await knex('banners')
      .where('id', id)
      .del();
  }
}

module.exports = Banner;

