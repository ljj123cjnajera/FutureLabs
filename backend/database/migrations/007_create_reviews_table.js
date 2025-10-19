exports.up = function(knex) {
  return knex.schema.createTable('reviews', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable().checkBetween([1, 5]);
    table.string('title', 255);
    table.text('comment');
    table.boolean('verified_purchase').defaultTo(false);
    table.boolean('is_approved').defaultTo(false);
    table.timestamps(true, true);
    
    // Índices
    table.index('product_id');
    table.index('user_id');
    table.index('rating');
    table.index('is_approved');
    
    // Un usuario solo puede hacer una reseña por producto
    table.unique(['product_id', 'user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reviews');
};
