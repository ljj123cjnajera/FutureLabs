exports.up = function(knex) {
  return knex.schema.alterTable('coupons', function(table) {
    table.decimal('min_order_amount', 10, 2).nullable();
    table.text('restricted_to_categories').nullable(); // JSON array of category IDs
    table.text('restricted_to_brands').nullable(); // JSON array of brand names
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('coupons', function(table) {
    table.dropColumn('min_order_amount');
    table.dropColumn('restricted_to_categories');
    table.dropColumn('restricted_to_brands');
  });
};

