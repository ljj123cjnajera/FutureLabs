exports.up = function(knex) {
  return knex.schema.table('products', function(table) {
    table.boolean('is_trending').defaultTo(false);
    table.boolean('is_bestseller').defaultTo(false);
    table.boolean('is_new').defaultTo(false);
    
    // Índices para mejor performance en queries
    table.index('is_trending');
    table.index('is_bestseller');
    table.index('is_new');
  });
};

exports.down = function(knex) {
  return knex.schema.table('products', function(table) {
    table.dropIndex('is_new');
    table.dropIndex('is_bestseller');
    table.dropIndex('is_trending');
    table.dropColumn('is_new');
    table.dropColumn('is_bestseller');
    table.dropColumn('is_trending');
  });
};



