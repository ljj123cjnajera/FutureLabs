exports.up = function(knex) {
  return knex.schema.createTable('wishlist', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.timestamps(true, true);
    
    // Índices
    table.index('user_id');
    table.index('product_id');
    
    // Un usuario solo puede tener un producto una vez en su wishlist
    table.unique(['user_id', 'product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('wishlist');
};






