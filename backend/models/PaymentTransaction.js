const db = require('../database/config');

class PaymentTransaction {
  // Crear transacción de pago
  static async create(transactionData) {
    const [transaction] = await db('payment_transactions')
      .insert({
        order_id: transactionData.order_id,
        payment_method: transactionData.payment_method,
        amount: transactionData.amount,
        status: transactionData.status || 'pending',
        payment_id: transactionData.payment_id || null,
        error_message: transactionData.error_message || null,
        metadata: transactionData.metadata ? JSON.stringify(transactionData.metadata) : null,
        processed_at: transactionData.processed_at || null
      })
      .returning('*');

    // Parsear metadata si existe
    if (transaction.metadata) {
      try {
        transaction.metadata = typeof transaction.metadata === 'string' 
          ? JSON.parse(transaction.metadata) 
          : transaction.metadata;
      } catch (e) {
        transaction.metadata = null;
      }
    }

    return transaction;
  }

  // Obtener transacciones de un pedido
  static async getByOrderId(orderId) {
    const transactions = await db('payment_transactions')
      .where('order_id', orderId)
      .orderBy('created_at', 'desc');

    return transactions.map(t => ({
      ...t,
      metadata: t.metadata ? (typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata) : null
    }));
  }

  // Obtener transacción por ID
  static async getById(id) {
    const [transaction] = await db('payment_transactions')
      .where('id', id)
      .first();

    if (!transaction) return null;

    if (transaction.metadata) {
      try {
        transaction.metadata = typeof transaction.metadata === 'string' 
          ? JSON.parse(transaction.metadata) 
          : transaction.metadata;
      } catch (e) {
        transaction.metadata = null;
      }
    }

    return transaction;
  }

  // Actualizar estado de transacción
  static async updateStatus(id, status, paymentId = null, errorMessage = null) {
    const updateData = {
      status,
      processed_at: status === 'succeeded' || status === 'failed' ? new Date() : null
    };

    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const [transaction] = await db('payment_transactions')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (transaction && transaction.metadata) {
      try {
        transaction.metadata = typeof transaction.metadata === 'string' 
          ? JSON.parse(transaction.metadata) 
          : transaction.metadata;
      } catch (e) {
        transaction.metadata = null;
      }
    }

    return transaction;
  }

  // Obtener todas las transacciones (admin)
  static async getAll(filters = {}) {
    let query = db('payment_transactions')
      .select(
        'payment_transactions.*',
        'orders.order_number',
        'orders.user_id',
        'users.email as user_email',
        'users.first_name',
        'users.last_name'
      )
      .leftJoin('orders', 'payment_transactions.order_id', 'orders.id')
      .leftJoin('users', 'orders.user_id', 'users.id');

    if (filters.status) {
      query = query.where('payment_transactions.status', filters.status);
    }

    if (filters.payment_method) {
      query = query.where('payment_transactions.payment_method', filters.payment_method);
    }

    if (filters.order_id) {
      query = query.where('payment_transactions.order_id', filters.order_id);
    }

    if (filters.date_from) {
      query = query.where('payment_transactions.created_at', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('payment_transactions.created_at', '<=', filters.date_to);
    }

    query = query.orderBy('payment_transactions.created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const transactions = await query;

    return transactions.map(t => ({
      ...t,
      metadata: t.metadata ? (typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata) : null
    }));
  }

  // Obtener transacciones pendientes
  static async getPending() {
    const transactions = await db('payment_transactions')
      .select(
        'payment_transactions.*',
        'orders.order_number',
        'orders.user_id',
        'users.email as user_email',
        'users.first_name',
        'users.last_name'
      )
      .leftJoin('orders', 'payment_transactions.order_id', 'orders.id')
      .leftJoin('users', 'orders.user_id', 'users.id')
      .where('payment_transactions.status', 'pending')
      .orderBy('payment_transactions.created_at', 'asc');

    return transactions.map(t => ({
      ...t,
      metadata: t.metadata ? (typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata) : null
    }));
  }

  // Obtener estadísticas
  static async getStatistics(filters = {}) {
    let query = db('payment_transactions');

    if (filters.date_from) {
      query = query.where('created_at', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('created_at', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN status = \'succeeded\' THEN 1 END) as succeeded'),
        db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending'),
        db.raw('COUNT(CASE WHEN status = \'failed\' THEN 1 END) as failed'),
        db.raw('SUM(CASE WHEN status = \'succeeded\' THEN amount ELSE 0 END) as total_amount'),
        db.raw('AVG(CASE WHEN status = \'succeeded\' THEN amount ELSE NULL END) as average_amount')
      )
      .first();

    return {
      total: parseInt(stats.total) || 0,
      succeeded: parseInt(stats.succeeded) || 0,
      pending: parseInt(stats.pending) || 0,
      failed: parseInt(stats.failed) || 0,
      total_amount: parseFloat(stats.total_amount) || 0,
      average_amount: parseFloat(stats.average_amount) || 0
    };
  }
}

module.exports = PaymentTransaction;

