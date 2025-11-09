const knex = require('../database/config');

class Wishlist {
  static async ensureDefaultList(userId) {
    let list = await knex('wishlist_lists')
      .where({ user_id: userId, is_default: true })
      .first();

    if (!list) {
      const [created] = await knex('wishlist_lists')
        .insert({
          user_id: userId,
          name: 'Lista principal',
          description: 'Tu colección principal de favoritos',
          is_default: true,
          position: 0
        })
        .returning('*');
      list = created;
    }

    return list;
  }

  static async ensureList(userId, listId) {
    if (!listId) {
      return this.ensureDefaultList(userId);
    }

    const list = await knex('wishlist_lists')
      .where({ id: listId, user_id: userId })
      .first();

    if (!list) {
      throw new Error('La lista seleccionada no existe o no te pertenece');
    }

    return list;
  }

  static async add(userId, productId, listId = null) {
    const list = await this.ensureList(userId, listId);

    try {
      const [item] = await knex('wishlist')
        .insert({
          user_id: userId,
          product_id: productId,
          list_id: list.id
        })
        .returning('*');

      return item;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Este producto ya está en esta lista');
      }
      throw error;
    }
  }

  static async remove(userId, productId, listId = null) {
    const query = knex('wishlist')
      .where('user_id', userId)
      .andWhere('product_id', productId);

    if (listId) {
      query.andWhere('list_id', listId);
    }

    return query.del();
  }

  static async moveItem(userId, productId, originListId, targetListId) {
    const originList = await this.ensureList(userId, originListId);
    const targetList = await this.ensureList(userId, targetListId);

    if (originList.id === targetList.id) {
      return { success: true, moved: false };
    }

    const exists = await knex('wishlist')
      .where({
        user_id: userId,
        product_id: productId,
        list_id: originList.id
      })
      .first();

    if (!exists) {
      throw new Error('El producto no existe en la lista origen');
    }

    try {
      await knex('wishlist')
        .where({ id: exists.id })
        .update({
          list_id: targetList.id,
          updated_at: knex.fn.now()
        });

      return { success: true, moved: true };
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Este producto ya está en la lista destino');
      }
      throw error;
    }
  }

  static async getListsWithItems(userId) {
    await this.ensureDefaultList(userId);

    const lists = await knex('wishlist_lists')
      .where({ user_id: userId })
      .orderBy('position', 'asc')
      .orderBy('created_at', 'asc');

    const items = await knex('wishlist')
      .select(
        'wishlist.*',
        'products.name as product_name',
        'products.price',
        'products.discount_price',
        'products.image_url',
        'products.brand',
        'products.rating',
        'products.review_count',
        'products.stock_quantity',
        'products.slug as product_slug'
      )
      .join('products', 'wishlist.product_id', 'products.id')
      .where('wishlist.user_id', userId)
      .orderBy('wishlist.created_at', 'desc');

    const itemsByList = items.reduce((acc, item) => {
      if (!acc[item.list_id]) {
        acc[item.list_id] = [];
      }
      acc[item.list_id].push(item);
      return acc;
    }, {});

    return lists.map((list) => ({
      ...list,
      items: itemsByList[list.id] || []
    }));
  }

  static async getListById(userId, listId) {
    return knex('wishlist_lists')
      .where({ id: listId, user_id: userId })
      .first();
  }

  static async createList(userId, { name, description }) {
    const [{ max_position: maxPosition }] = await knex('wishlist_lists')
      .where({ user_id: userId })
      .max('position as max_position');

    const [list] = await knex('wishlist_lists')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        is_default: false,
        position: (maxPosition || 0) + 1
      })
      .returning('*');

    return list;
  }

  static async updateList(userId, listId, payload) {
    const list = await this.getListById(userId, listId);

    if (!list) {
      throw new Error('Lista no encontrada');
    }

    const updateData = {};

    if (payload.name) {
      updateData.name = payload.name;
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description || null;
    }

    if (payload.position !== undefined) {
      updateData.position = payload.position;
    }

    if (Object.keys(updateData).length === 0) {
      return list;
    }

    const [updated] = await knex('wishlist_lists')
      .where({ id: listId, user_id: userId })
      .update({ ...updateData, updated_at: knex.fn.now() })
      .returning('*');

    return updated;
  }

  static async setDefaultList(userId, listId) {
    const list = await this.getListById(userId, listId);

    if (!list) {
      throw new Error('Lista no encontrada');
    }

    await knex('wishlist_lists')
      .where({ user_id: userId, is_default: true })
      .update({ is_default: false, updated_at: knex.fn.now() });

    const [updated] = await knex('wishlist_lists')
      .where({ id: listId, user_id: userId })
      .update({ is_default: true, updated_at: knex.fn.now() })
      .returning('*');

    return updated;
  }

  static async deleteList(userId, listId, options = {}) {
    const list = await this.getListById(userId, listId);

    if (!list) {
      throw new Error('Lista no encontrada');
    }

    if (list.is_default) {
      throw new Error('No puedes eliminar tu lista principal');
    }

    const defaultList = await this.ensureDefaultList(userId);

    if (options.deleteItems) {
      await knex('wishlist')
        .where({ user_id: userId, list_id: listId })
        .del();
    } else {
      await knex('wishlist')
        .where({ user_id: userId, list_id: listId })
        .update({
          list_id: defaultList.id,
          updated_at: knex.fn.now()
        });
    }

    await knex('wishlist_lists')
      .where({ id: listId, user_id: userId })
      .del();

    return { success: true };
  }

  static async countByUserId(userId) {
    const [result] = await knex('wishlist')
      .where('user_id', userId)
      .count('* as count');
    return parseInt(result.count, 10);
  }

  static async hasProduct(userId, productId, listId = null) {
    const query = knex('wishlist')
      .where({ user_id: userId, product_id: productId });

    if (listId) {
      query.andWhere({ list_id: listId });
    }

    const item = await query.first();
    return !!item;
  }

  static async clear(userId, listId = null) {
    if (listId) {
      await this.ensureList(userId, listId);
      return knex('wishlist')
        .where({ user_id: userId, list_id: listId })
        .del();
    }

    await knex('wishlist')
      .where({ user_id: userId })
      .del();

    await this.ensureDefaultList(userId);
    return { success: true };
  }
}

module.exports = Wishlist;