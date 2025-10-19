const knex = require('../database/config');

class Wishlist {
  static async add(userId, productId) {
    try {
      const [item] = await knex('wishlist')
        .insert({ user_id: userId, product_id: productId })
        .returning('*');
      return item;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('El producto ya está en tu wishlist');
      }
      throw error;
    }
  }

  static async remove(userId, productId) {
    return await knex('wishlist')
      .where('user_id', userId)
      .where('product_id', productId)
      .del();
  }

  static async findByUserId(userId) {
    return await knex('wishlist')
      .select(
        'wishlist.*',
        'products.name as product_name',
        'products.price',
        'products.discount_price',
        'products.image_url',
        'products.brand',
        'products.rating',
        'products.review_count',
        'products.stock_quantity'
      )
      .join('products', 'wishlist.product_id', 'products.id')
      .where('wishlist.user_id', userId)
      .orderBy('wishlist.created_at', 'desc');
  }

  static async countByUserId(userId) {
    const [result] = await knex('wishlist')
      .where('user_id', userId)
      .count('* as count');
    return parseInt(result.count);
  }

  static async hasProduct(userId, productId) {
    const [item] = await knex('wishlist')
      .where('user_id', userId)
      .where('product_id', productId);
    return !!item;
  }

  static async clear(userId) {
    return await knex('wishlist')
      .where('user_id', userId)
      .del();
  }
}

module.exports = Wishlist;






