exports.up = function(knex) {
  return knex.schema.createTable('banners', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('button_text', 100).nullable();
    table.string('button_link', 500).nullable();
    table.string('image_url', 500).nullable();
    table.string('banner_type', 50).notNullable(); // 'affiliate', 'promo', 'grid', 'flash'
    table.string('position', 50).nullable(); // 'hero', 'benefits', 'middle', 'bottom'
    table.integer('order_index').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.date('start_date').nullable();
    table.date('end_date').nullable();
    table.timestamps(true, true);
    
    table.index('banner_type');
    table.index('position');
    table.index('is_active');
    table.index('order_index');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('banners');
};

