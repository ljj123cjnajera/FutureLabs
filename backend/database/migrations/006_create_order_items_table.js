exports.up = function(knex) {
  return knex.schema.createTable('order_items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('SET NULL');
    table.string('product_name', 200).notNullable();
    table.string('product_sku', 100).nullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('discount_price', 10, 2).nullable();
    table.integer('quantity').notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.timestamps(true, true);
    
    // Índices
    table.index('order_id');
    table.index('product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('order_items');
};
