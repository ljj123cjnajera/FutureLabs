exports.up = function(knex) {
  return knex.schema.createTable('blog_posts', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.string('slug').unique().notNullable();
    table.text('excerpt');
    table.text('content').notNullable();
    table.string('featured_image');
    table.uuid('author_id').notNullable();
    table.foreign('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.integer('views').defaultTo(0);
    table.string('meta_title');
    table.text('meta_description');
    table.string('meta_keywords');
    table.timestamp('published_at');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('blog_posts');
};

