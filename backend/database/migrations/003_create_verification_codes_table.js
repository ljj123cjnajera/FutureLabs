exports.up = function(knex) {
  return knex.schema.createTable('verification_codes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('code', 6).notNullable();
    table.string('type').notNullable(); // 'email', 'phone', 'password_reset'
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamp('verified_at').nullable();
    table.timestamps(true, true);

    // Índices
    table.index('user_id');
    table.index('code');
    table.index('expires_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('verification_codes');
};
