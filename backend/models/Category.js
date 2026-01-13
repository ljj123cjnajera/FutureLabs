const db = require('../database/config');

class Category {
  // Obtener todas las categorías (con timeout)
  static async getAll() {
    try {
      const categories = await db('categories')
        .select('*')
        .orderBy('sort_order', 'asc')
        .timeout(20000); // 20 segundos máximo (aumentado)
      
      // Si no hay sort_order, ordenar por nombre
      if (categories.length > 0 && !categories[0].sort_order) {
        return categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
      
      return categories;
    } catch (error) {
      console.error('Error en Category.getAll:', error.message);
      console.error('Error stack:', error.stack);
      // Si es error de timeout o conexión, intentar sin sort_order
      try {
        return await db('categories')
          .select('*')
          .orderBy('name', 'asc')
          .timeout(20000);
      } catch (retryError) {
        console.error('Error en retry Category.getAll:', retryError.message);
        throw error; // Lanzar el error original
      }
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



