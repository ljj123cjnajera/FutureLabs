exports.up = function(knex) {
  return knex.schema.createTable('chat_messages', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').nullable();
    table.string('visitor_name', 255).nullable();
    table.string('visitor_email', 255).nullable();
    table.text('message').notNullable();
    table.enum('sender_type', ['user', 'admin']).notNullable();
    table.boolean('is_read').defaultTo(false);
    table.uuid('admin_id').references('id').inTable('users').onDelete('SET NULL').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('created_at');
    table.index('is_read');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('chat_messages');
};

