exports.up = function(knex) {
  return knex.schema.createTable('benefits', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('icon', 100).nullable(); // Font Awesome icon class
    table.string('image_url', 500).nullable();
    table.string('background_color', 50).nullable();
    table.integer('order_index').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('order_index');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('benefits');
};

