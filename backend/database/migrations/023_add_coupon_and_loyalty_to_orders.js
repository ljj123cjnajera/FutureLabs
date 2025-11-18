exports.up = function(knex) {
  return knex.schema.table('orders', function(table) {
    // Campos de cupón
    table.string('coupon_code', 50).nullable();
    table.uuid('coupon_id').nullable();
    table.decimal('coupon_discount', 10, 2).defaultTo(0);
    
    // Campos de puntos de fidelidad
    table.integer('loyalty_points_used').defaultTo(0);
    table.decimal('loyalty_points_discount', 10, 2).defaultTo(0);
    
    // Índices
    table.index('coupon_code');
    table.index('coupon_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('orders', function(table) {
    table.dropIndex('coupon_id');
    table.dropIndex('coupon_code');
    table.dropColumn('loyalty_points_discount');
    table.dropColumn('loyalty_points_used');
    table.dropColumn('coupon_discount');
    table.dropColumn('coupon_id');
    table.dropColumn('coupon_code');
  });
};

