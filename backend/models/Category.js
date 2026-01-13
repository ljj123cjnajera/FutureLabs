const db = require('../database/config');

class Category {
  // Obtener todas las categorías (con timeout)
  static async getAll() {
    try {
      // Primero intentar con sort_order si existe
      try {
        const categories = await db('categories')
          .select('*')
          .orderBy('sort_order', 'asc')
          .timeout(20000);
        
        // Si hay resultados y tienen sort_order, retornarlos
        if (categories.length > 0 && categories[0].sort_order !== null && categories[0].sort_order !== undefined) {
          return categories;
        }
        
        // Si no tienen sort_order, ordenar por nombre
        return categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } catch (sortError) {
        // Si falla por sort_order, intentar sin él
        if (sortError.message && sortError.message.includes('sort_order')) {
          console.log('⚠️ sort_order column not found, using name instead');
          const categories = await db('categories')
            .select('*')
            .orderBy('name', 'asc')
            .timeout(20000);
          return categories;
        }
        throw sortError;
      }
    } catch (error) {
      console.error('Error en Category.getAll:', error.message);
      console.error('Error stack:', error.stack);
      // Último intento: obtener sin ordenamiento
      try {
        const categories = await db('categories')
          .select('*')
          .timeout(20000);
        return categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } catch (finalError) {
        console.error('Error en último intento Category.getAll:', finalError.message);
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



