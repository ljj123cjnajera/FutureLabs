exports.up = function(knex) {
  return knex.schema.createTable('coupons', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code', 50).unique().notNullable();
    table.string('type', 20).notNullable(); // 'percentage' o 'fixed'
    table.decimal('value', 10, 2).notNullable();
    table.decimal('min_purchase', 10, 2).defaultTo(0);
    table.integer('max_uses').nullable();
    table.integer('used_count').defaultTo(0);
    table.date('valid_from').notNullable();
    table.date('valid_until').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.text('description').nullable();
    table.timestamps(true, true);
    
    // Índices
    table.index('code');
    table.index('is_active');
    table.index('valid_until');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('coupons');
};






