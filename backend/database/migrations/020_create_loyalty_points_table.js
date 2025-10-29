exports.up = function(knex) {
  return knex.schema.createTable('loyalty_points', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.integer('points').defaultTo(0).notNullable();
    table.integer('total_earned').defaultTo(0);
    table.integer('total_redeemed').defaultTo(0);
    table.timestamps(true, true);
    
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('loyalty_points');
};

