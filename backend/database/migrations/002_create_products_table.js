exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 200).notNullable();
    table.string('slug', 200).notNullable().unique();
    table.text('description').nullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('discount_price', 10, 2).nullable();
    table.string('brand', 100).notNullable();
    table.string('sku', 100).unique().nullable();
    table.integer('stock_quantity').defaultTo(0);
    table.string('image_url', 500).nullable();
    table.json('images').nullable(); // Array de URLs de imágenes
    table.json('specifications').nullable(); // Especificaciones técnicas
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('review_count').defaultTo(0);
    table.boolean('featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.timestamps(true, true);
    
    // Índices
    table.index('slug');
    table.index('category_id');
    table.index('brand');
    table.index('featured');
    table.index('is_active');
    table.index('price');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};


