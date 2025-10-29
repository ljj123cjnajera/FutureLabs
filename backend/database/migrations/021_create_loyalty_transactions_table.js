exports.up = function(knex) {
  return knex.schema.createTable('loyalty_transactions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.enum('type', ['earned', 'redeemed', 'expired']).notNullable();
    table.integer('points').notNullable();
    table.string('reason', 255).nullable();
    table.uuid('order_id').references('id').inTable('orders').onDelete('SET NULL').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('loyalty_transactions');
};

