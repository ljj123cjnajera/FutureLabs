exports.up = function(knex) {
  return knex.schema.createTable('cart', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamps(true, true);
    
    // Índices
    table.index('user_id');
    table.index('product_id');
    
    // Unique constraint: un usuario solo puede tener un item de cada producto
    table.unique(['user_id', 'product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('cart');
};
