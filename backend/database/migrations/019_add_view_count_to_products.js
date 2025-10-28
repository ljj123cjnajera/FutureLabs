exports.up = function(knex) {
  return knex.schema.alterTable('products', function(table) {
    table.integer('view_count').defaultTo(0).after('review_count');
    table.index('view_count');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('products', function(table) {
    table.dropIndex('view_count');
    table.dropColumn('view_count');
  });
};

