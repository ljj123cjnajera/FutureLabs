const db = require('../database/config');

class Category {
  // Obtener todas las categorías (con timeout)
  static async getAll() {
    try {
      const categories = await db('categories')
        .select('*')
        .orderBy('name', 'asc')
        .timeout(10000);
      
      return categories;
    } catch (error) {
      console.error('Error en Category.getAll:', error.message);
      throw error;
    }
  }

  // Obtener categoría por ID
  static async getById(id) {
    return await db('categories')
      .where({ id })
      .first();
  }

  // Obtener categoría por slug
  static async getBySlug(slug) {
    return await db('categories')
      .where({ slug })
      .first();
  }

  // Crear categoría
  static async create(data) {
    const [category] = await db('categories')
      .insert(data)
      .returning('*');
    return category;
  }

  // Actualizar categoría
  static async update(id, data) {
    const [category] = await db('categories')
      .where({ id })
      .update(data)
      .returning('*');
    return category;
  }

  // Eliminar categoría
  static async delete(id) {
    return await db('categories')
      .where({ id })
      .del();
  }
}

module.exports = Category;



