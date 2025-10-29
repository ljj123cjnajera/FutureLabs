const knex = require('../database/config');

class LoyaltyPoints {
  static async getPointsForUser(userId) {
    const [points] = await knex('loyalty_points')
      .where('user_id', userId);
    
    if (!points) {
      // Crear registro si no existe
      const [newPoints] = await knex('loyalty_points')
        .insert({
          user_id: userId,
          points: 0,
          total_earned: 0,
          total_redeemed: 0
        })
        .returning('*');
      return newPoints;
    }
    
    return points;
  }

  static async addPoints(userId, points, reason = 'Puntos ganados') {
    const userPoints = await this.getPointsForUser(userId);
    
    const updated = await knex('loyalty_points')
      .where('id', userPoints.id)
      .update({
        points: knex.raw('points + ?', [points]),
        total_earned: knex.raw('total_earned + ?', [points]),
        updated_at: knex.fn.now()
      });
    
    // Registrar transacción
    await knex('loyalty_transactions').insert({
      user_id: userId,
      type: 'earned',
      points: points,
      reason: reason
    });
    
    return updated;
  }

  static async redeemPoints(userId, points, reason = 'Puntos canjeados') {
    const userPoints = await this.getPointsForUser(userId);
    
    if (userPoints.points < points) {
      throw new Error('No tienes suficientes puntos');
    }
    
    const updated = await knex('loyalty_points')
      .where('id', userPoints.id)
      .update({
        points: knex.raw('points - ?', [points]),
        total_redeemed: knex.raw('total_redeemed + ?', [points]),
        updated_at: knex.fn.now()
      });
    
    // Registrar transacción
    await knex('loyalty_transactions').insert({
      user_id: userId,
      type: 'redeemed',
      points: -points,
      reason: reason
    });
    
    return updated;
  }

  static async getTransactions(userId, limit = 20) {
    return await knex('loyalty_transactions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  static async calculatePointsFromOrder(orderTotal) {
    // 100 puntos por cada S/ 100 de compra
    return Math.floor(orderTotal / 100) * 100;
  }

  static async canRedeemForDiscount(userId, totalAmount) {
    const points = await this.getPointsForUser(userId);
    const pointsValue = points.points / 100; // 100 puntos = S/ 1
    
    // Permitir usar hasta el 20% del total con puntos
    const maxPointsValue = totalAmount * 0.2;
    
    const pointsToUse = Math.min(pointsValue, maxPointsValue);
    const pointsNeeded = Math.ceil(pointsToUse * 100);
    
    return {
      canUse: points.points >= pointsNeeded,
      pointsToUse: pointsNeeded,
      discount: pointsToUse
    };
  }
}

module.exports = LoyaltyPoints;

