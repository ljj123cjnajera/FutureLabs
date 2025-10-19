const knex = require('../database/config');

class Review {
  static async create(reviewData) {
    const [review] = await knex('reviews')
      .insert(reviewData)
      .returning('*');
    return review;
  }

  static async findByProductId(productId, options = {}) {
    const query = knex('reviews')
      .where('product_id', productId)
      .where('is_approved', true)
      .orderBy('created_at', 'desc');

    if (options.limit) {
      query.limit(options.limit);
    }

    return await query;
  }

  static async findByProductIdWithUser(productId, options = {}) {
    const query = knex('reviews')
      .select(
        'reviews.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .join('users', 'reviews.user_id', 'users.id')
      .where('reviews.product_id', productId)
      .where('reviews.is_approved', true)
      .orderBy('reviews.created_at', 'desc');

    if (options.limit) {
      query.limit(options.limit);
    }

    return await query;
  }

  static async findByUserId(userId) {
    return await knex('reviews')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

  static async findById(reviewId) {
    const [review] = await knex('reviews')
      .where('id', reviewId);
    return review;
  }

  static async update(reviewId, updateData) {
    const [review] = await knex('reviews')
      .where('id', reviewId)
      .update(updateData)
      .returning('*');
    return review;
  }

  static async delete(reviewId) {
    return await knex('reviews')
      .where('id', reviewId)
      .del();
  }

  static async getProductStats(productId) {
    const stats = await knex('reviews')
      .where('product_id', productId)
      .where('is_approved', true)
      .select(
        knex.raw('COUNT(*) as total_reviews'),
        knex.raw('AVG(rating) as average_rating'),
        knex.raw('COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star'),
        knex.raw('COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star'),
        knex.raw('COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star'),
        knex.raw('COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star'),
        knex.raw('COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star')
      )
      .first();

    return {
      total_reviews: parseInt(stats.total_reviews) || 0,
      average_rating: parseFloat(stats.average_rating) || 0,
      rating_distribution: {
        5: parseInt(stats.five_star) || 0,
        4: parseInt(stats.four_star) || 0,
        3: parseInt(stats.three_star) || 0,
        2: parseInt(stats.two_star) || 0,
        1: parseInt(stats.one_star) || 0
      }
    };
  }

  static async hasUserReviewed(productId, userId) {
    const [review] = await knex('reviews')
      .where('product_id', productId)
      .where('user_id', userId);
    return !!review;
  }
}

module.exports = Review;





