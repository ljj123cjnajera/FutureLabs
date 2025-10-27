exports.up = function(knex) {
  return knex.schema.table('orders', function(table) {
    table.string('shipping_email', 255).nullable();
    table.string('shipping_full_name', 200).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('orders', function(table) {
    table.dropColumn('shipping_email');
    table.dropColumn('shipping_full_name');
  });
};

