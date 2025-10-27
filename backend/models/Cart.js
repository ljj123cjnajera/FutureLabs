const db = require('../database/config');

class Cart {
  // Obtener carrito de un usuario con detalles de productos
  static async getByUserId(userId) {
    const items = await db('cart')
      .select(
        'cart.id',
        'cart.quantity',
        'cart.created_at',
        'products.id as product_id',
        'products.name',
        'products.slug',
        'products.price',
        'products.discount_price',
        'products.image_url',
        'products.brand',
        'products.stock_quantity'
      )
      .leftJoin('products', 'cart.product_id', 'products.id')
      .where('cart.user_id', userId)
      .orderBy('cart.created_at', 'desc');

    return items;
  }

  // Obtener item específico del carrito
  static async getItem(userId, productId) {
    return await db('cart')
      .where({
        user_id: userId,
        product_id: productId
      })
      .first();
  }

  // Agregar producto al carrito
  static async add(userId, productId, quantity = 1) {
    // Verificar si el producto ya está en el carrito
    const existingItem = await Cart.getItem(userId, productId);

    if (existingItem) {
      // Actualizar cantidad
      return await Cart.updateQuantity(userId, productId, existingItem.quantity + quantity);
    }

    // Crear nuevo item
    const [item] = await db('cart')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity
      })
      .returning('*');

    return item;
  }

  // Actualizar cantidad
  static async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menos, eliminar el item
      return await Cart.remove(userId, productId);
    }

    const [item] = await db('cart')
      .where({
        user_id: userId,
        product_id: productId
      })
      .update({ quantity })
      .returning('*');

    return item;
  }

  // Eliminar producto del carrito
  static async remove(userId, productId) {
    return await db('cart')
      .where({
        user_id: userId,
        product_id: productId
      })
      .del();
  }

  // Limpiar carrito
  static async clear(userId) {
    return await db('cart')
      .where({ user_id: userId })
      .del();
  }

  // Obtener total de items en el carrito
  static async getCount(userId) {
    const result = await db('cart')
      .where({ user_id: userId })
      .sum('quantity as total')
      .first();

    // Manejar el caso cuando no hay items (result.total puede ser null o un objeto)
    if (!result || result.total === null) {
      return 0;
    }
    
    // Si result.total es un string, parsearlo
    if (typeof result.total === 'string') {
      return parseInt(result.total) || 0;
    }
    
    // Si result.total es un número
    return parseInt(result.total) || 0;
  }

  // Obtener total del carrito
  static async getTotal(userId) {
    const items = await Cart.getByUserId(userId);
    
    let total = 0;
    items.forEach(item => {
      const price = item.discount_price || item.price;
      total += price * item.quantity;
    });

    return total;
  }

  // Obtener resumen del carrito
  static async getSummary(userId) {
    const items = await Cart.getByUserId(userId);
    const count = await Cart.getCount(userId);
    const total = await Cart.getTotal(userId);

    return {
      items,
      count,
      total
    };
  }
}

module.exports = Cart;



