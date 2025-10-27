exports.up = function(knex) {
  return knex.schema.hasTable('verification_codes').then(exists => {
    if (!exists) {
      return knex.schema.createTable('verification_codes', function(table) {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
        table.string('code', 6).notNullable();
        table.enum('type', ['email', 'phone']).notNullable();
        table.boolean('is_used').defaultTo(false);
        table.timestamp('expires_at').notNullable();
        table.timestamps(true, true);

        table.index(['user_id', 'type']);
        table.index('code');
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('verification_codes');
};

