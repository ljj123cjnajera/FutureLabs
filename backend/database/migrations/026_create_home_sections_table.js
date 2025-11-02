exports.up = function(knex) {
  return knex.schema.createTable('home_sections', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('section_type', 50).notNullable(); // 'category_carousel', 'categories_grid', etc.
    table.string('title', 200).nullable();
    table.string('category_id', 36).nullable(); // Para carruseles de categorías
    table.integer('limit').defaultTo(8); // Cantidad de productos a mostrar
    table.integer('order_index').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.json('settings').nullable(); // Configuraciones adicionales
    table.timestamps(true, true);
    
    table.index('section_type');
    table.index('order_index');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('home_sections');
};

