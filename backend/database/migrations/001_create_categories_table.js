exports.up = function(knex) {
  return knex.schema.createTable('categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.text('description').nullable();
    table.string('icon', 50).nullable();
    table.string('image_url', 500).nullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
    
    // Índices
    table.index('slug');
    table.index('sort_order');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('categories');
};


