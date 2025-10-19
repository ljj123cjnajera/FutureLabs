exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('order_number', 50).notNullable().unique();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('shipping_cost', 10, 2).defaultTo(0);
    table.decimal('tax', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
    table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
    table.enum('payment_method', ['stripe', 'paypal', 'yape', 'plin', 'cash']).nullable();
    table.string('payment_id', 255).nullable();
    table.string('shipping_address', 500).notNullable();
    table.string('shipping_city', 100).notNullable();
    table.string('shipping_state', 100).nullable();
    table.string('shipping_country', 100).notNullable();
    table.string('shipping_postal_code', 20).nullable();
    table.string('shipping_phone', 20).nullable();
    table.text('notes').nullable();
    table.timestamp('shipped_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamps(true, true);
    
    // Índices
    table.index('user_id');
    table.index('order_number');
    table.index('status');
    table.index('payment_status');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
