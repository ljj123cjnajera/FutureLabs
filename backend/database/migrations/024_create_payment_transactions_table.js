exports.up = function(knex) {
  return knex.schema.createTable('payment_transactions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE').notNullable();
    table.enum('payment_method', ['stripe', 'paypal', 'yape', 'plin', 'bank_transfer', 'cash']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded']).defaultTo('pending');
    table.string('payment_id', 255).nullable(); // ID del pago (payment_intent_id, transaction_id, etc.)
    table.text('error_message').nullable();
    table.json('metadata').nullable(); // Información adicional (phone_number, bank_account, etc.)
    table.timestamp('processed_at').nullable();
    table.timestamps(true, true);
    
    // Índices
    table.index('order_id');
    table.index('payment_method');
    table.index('status');
    table.index('created_at');
    table.index(['order_id', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payment_transactions');
};

