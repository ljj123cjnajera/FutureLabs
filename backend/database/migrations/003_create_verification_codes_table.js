exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('verification_codes');
  
  if (!exists) {
    return knex.schema.createTable('verification_codes', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      table.string('code', 6).notNullable();
      table.string('type').notNullable(); // 'email', 'phone'
      table.boolean('is_verified').defaultTo(false); // Usar is_verified para compatibilidad con tabla existente
      table.timestamp('expires_at').notNullable();
      table.timestamp('verified_at').nullable();
      table.timestamps(true, true);

      table.index(['user_id', 'type']);
      table.index('code');
    });
  }
};

exports.down = function(knex) {
  return knex.schema.dropTable('verification_codes');
};

