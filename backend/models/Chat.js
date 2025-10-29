const knex = require('../database/config');

class Chat {
  static async createMessage(messageData) {
    const [message] = await knex('chat_messages')
      .insert(messageData)
      .returning('*');
    return message;
  }

  static async getMessagesForUser(userId) {
    return await knex('chat_messages')
      .where('user_id', userId)
      .orWhere(function() {
        this.where('visitor_email', knex('users').select('email').where('id', userId))
           .whereNull('user_id');
      })
      .orderBy('created_at', 'asc');
  }

  static async getUnreadMessages(userId) {
    return await knex('chat_messages')
      .where('user_id', userId)
      .where('is_read', false)
      .orderBy('created_at', 'asc');
  }

  static async getMessagesForAdmin() {
    return await knex('chat_messages')
      .select(
        'chat_messages.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'chat_messages.user_id', 'users.id')
      .orderBy('created_at', 'desc')
      .limit(100);
  }

  static async markAsRead(messageId, adminId) {
    return await knex('chat_messages')
      .where('id', messageId)
      .update({
        is_read: true,
        admin_id: adminId
      });
  }

  static async markAllAsRead(userId) {
    return await knex('chat_messages')
      .where('user_id', userId)
      .update({ is_read: true });
  }

  static async getUnreadCount(userId) {
    const [result] = await knex('chat_messages')
      .where('user_id', userId)
      .where('is_read', false)
      .count('* as count');
    
    return parseInt(result.count || 0);
  }

  static async getMessageById(messageId) {
    const [message] = await knex('chat_messages')
      .where('id', messageId);
    return message;
  }
}

module.exports = Chat;

