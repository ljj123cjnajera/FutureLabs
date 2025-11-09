const { v4: uuidv4 } = require('uuid');

exports.up = async function up(knex) {
  await knex.schema.createTable('wishlist_lists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('description');
    table.boolean('is_default').notNullable().defaultTo(false);
    table.integer('position').notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.unique(['user_id', 'name']);
    table.index(['user_id', 'is_default']);
  });

  const hasListIdColumn = await knex.schema.hasColumn('wishlist', 'list_id');
  if (!hasListIdColumn) {
    await knex.schema.table('wishlist', (table) => {
      table.uuid('list_id').nullable().references('id').inTable('wishlist_lists').onDelete('CASCADE');
    });
  }

  // Ajustar índice único existente para permitir el mismo producto en diferentes listas
  await knex.schema.table('wishlist', (table) => {
    table.dropUnique(['user_id', 'product_id']);
  });

  // Crear listas predeterminadas para usuarios que ya tienen wishlist
  const usersWithWishlist = await knex('wishlist').distinct('user_id');

  for (const { user_id: userId } of usersWithWishlist) {
    const defaultListId = uuidv4();
    await knex('wishlist_lists').insert({
      id: defaultListId,
      user_id: userId,
      name: 'Lista principal',
      description: 'Tu colección principal de favoritos',
      is_default: true,
      position: 0,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });

    await knex('wishlist')
      .where({ user_id: userId })
      .update({ list_id: defaultListId });
  }

  await knex.schema.table('wishlist', (table) => {
    table.uuid('list_id').notNullable().alter();
    table.unique(['user_id', 'list_id', 'product_id']);
    table.index('list_id');
  });
};

exports.down = async function down(knex) {
  const hasListIdColumn = await knex.schema.hasColumn('wishlist', 'list_id');

  if (hasListIdColumn) {
    await knex.schema.table('wishlist', (table) => {
      table.dropIndex('list_id');
      table.dropUnique(['user_id', 'list_id', 'product_id']);
      table.uuid('list_id').nullable().alter();
    });

    await knex('wishlist').update({ list_id: null });

    await knex.schema.table('wishlist', (table) => {
      table.dropColumn('list_id');
      table.unique(['user_id', 'product_id']);
    });
  }

  await knex.schema.dropTableIfExists('wishlist_lists');
};

