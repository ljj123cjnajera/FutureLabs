exports.up = function(knex) {
  return knex.schema.createTable('user_addresses', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('label', 100).nullable(); // Casa, Trabajo, etc.
    table.string('full_name', 200).notNullable();
    table.string('address', 500).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 100).nullable();
    table.string('country', 100).notNullable().defaultTo('Perú');
    table.string('postal_code', 20).nullable();
    table.string('phone', 20).notNullable();
    table.string('email', 255).nullable();
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);

    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_addresses');
};

