exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).nullable();
    table.enum('role', ['client', 'admin', 'moderator']).defaultTo('client');
    table.boolean('email_verified').defaultTo(false);
    table.string('email_verification_token', 255).nullable();
    table.timestamp('email_verified_at').nullable();
    table.string('password_reset_token', 255).nullable();
    table.timestamp('password_reset_expires').nullable();
    table.timestamps(true, true);
    
    // Índices
    table.index('email');
    table.index('role');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};



