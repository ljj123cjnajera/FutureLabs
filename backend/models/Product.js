const db = require('../database/config');

class Product {
  // Obtener todos los productos con filtros
  static async getAll(filters = {}) {
    let query = db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.is_active', true);

    // Filtros
    if (filters.category_id) {
      query = query.where('products.category_id', filters.category_id);
    }

    if (filters.brand) {
      query = query.where('products.brand', filters.brand);
    }

    if (filters.min_price) {
      query = query.where('products.price', '>=', filters.min_price);
    }

    if (filters.max_price) {
      query = query.where('products.price', '<=', filters.max_price);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('products.name', 'ilike', `%${filters.search}%`)
            .orWhere('products.description', 'ilike', `%${filters.search}%`)
            .orWhere('products.brand', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.onSale) {
      query = query.whereNotNull('products.discount_price');
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        query = query.where('products.stock_quantity', '>', 0);
      } else {
        query = query.where('products.stock_quantity', '<=', 0);
      }
    }

    // Ordenamiento
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    // Paginación
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.limit(filters.limit).offset(offset);
    }

    try {
      return await query.timeout(20000); // 20 segundos máximo (aumentado para queries complejas)
    } catch (error) {
      console.error('Error en Product.getAll:', error.message);
      // Si es un error de timeout de conexión, intentar liberar recursos
      if (error.message && error.message.includes('Timeout acquiring a connection')) {
        console.error('⚠️ Pool de conexiones saturado. Considera aumentar el tamaño del pool o reducir peticiones concurrentes.');
      }
      throw error;
    }
  }

  // Obtener producto por ID
  static async getById(id) {
    try {
      return await db('products')
        .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.id', id)
        .first()
        .timeout(20000);
    } catch (error) {
      console.error('Error en Product.getById:', error.message);
      throw error;
    }
  }

  // Obtener producto por slug
  static async getBySlug(slug) {
    try {
      return await db('products')
        .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.slug', slug)
        .first()
        .timeout(20000);
    } catch (error) {
      console.error('Error en Product.getBySlug:', error.message);
      throw error;
    }
  }

  // Obtener productos destacados
  static async getFeatured(limit = 8) {
    return await db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.featured', true)
      .where('products.is_active', true)
      .orderBy('products.created_at', 'desc')
      .limit(limit)
      .timeout(20000); // 20 segundos máximo (aumentado)
  }

  // Obtener productos en oferta
  static async getOnSale(limit = 8) {
    return await db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .whereNotNull('products.discount_price')
      .where('products.is_active', true)
      .orderBy('products.created_at', 'desc')
      .limit(limit)
      .timeout(20000); // 20 segundos máximo (aumentado)
  }

  // Obtener productos en tendencia
  static async getTrending(limit = 8) {
    try {
      try {
        return await db('products')
          .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
          .leftJoin('categories', 'products.category_id', 'categories.id')
          .where('products.is_trending', true)
          .where('products.is_active', true)
          .orderBy('products.created_at', 'desc')
          .limit(limit)
          .timeout(20000);
      } catch (trendingError) {
        if (trendingError.message && trendingError.message.includes('is_trending')) {
          console.log('⚠️ is_trending column not found, using featured products instead');
          return await db('products')
            .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
            .leftJoin('categories', 'products.category_id', 'categories.id')
            .where('products.featured', true)
            .where('products.is_active', true)
            .orderBy('products.created_at', 'desc')
            .limit(limit)
            .timeout(20000);
        }
        throw trendingError;
      }
    } catch (error) {
      console.error('Error en Product.getTrending:', error.message);
      throw error;
    }
  }

  // Obtener productos más vendidos
  static async getBestseller(limit = 8) {
    try {
      try {
        return await db('products')
          .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
          .leftJoin('categories', 'products.category_id', 'categories.id')
          .where('products.is_bestseller', true)
          .where('products.is_active', true)
          .orderBy('products.created_at', 'desc')
          .limit(limit)
          .timeout(20000);
      } catch (bestsellerError) {
        if (bestsellerError.message && bestsellerError.message.includes('is_bestseller')) {
          console.log('⚠️ is_bestseller column not found, using featured products instead');
          return await db('products')
            .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
            .leftJoin('categories', 'products.category_id', 'categories.id')
            .where('products.featured', true)
            .where('products.is_active', true)
            .orderBy('products.created_at', 'desc')
            .limit(limit)
            .timeout(20000);
        }
        throw bestsellerError;
      }
    } catch (error) {
      console.error('Error en Product.getBestseller:', error.message);
      throw error;
    }
  }

  // Obtener productos nuevos
  static async getNew(limit = 8) {
    try {
      // Intentar con is_new primero
      try {
        return await db('products')
          .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
          .leftJoin('categories', 'products.category_id', 'categories.id')
          .where('products.is_new', true)
          .where('products.is_active', true)
          .orderBy('products.created_at', 'desc')
          .limit(limit)
          .timeout(20000);
      } catch (newError) {
        // Si is_new no existe, usar created_at reciente
        if (newError.message && newError.message.includes('is_new')) {
          console.log('⚠️ is_new column not found, using recent products instead');
          return await db('products')
            .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
            .leftJoin('categories', 'products.category_id', 'categories.id')
            .where('products.is_active', true)
            .orderBy('products.created_at', 'desc')
            .limit(limit)
            .timeout(20000);
        }
        throw newError;
      }
    } catch (error) {
      console.error('Error en Product.getNew:', error.message);
      throw error;
    }
  }

  // Obtener productos por categoría
  static async getByCategory(categorySlug, filters = {}) {
    let query = db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('categories.slug', categorySlug)
      .where('products.is_active', true);

    if (filters.brand) {
      query = query.where('products.brand', filters.brand);
    }

    if (filters.min_price) {
      query = query.where('products.price', '>=', filters.min_price);
    }

    if (filters.max_price) {
      query = query.where('products.price', '<=', filters.max_price);
    }

    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    try {
      return await query.timeout(20000);
    } catch (error) {
      console.error('Error en Product.getByCategory:', error.message);
      throw error;
    }
  }

  // Contar productos
  static async count(filters = {}) {
    let query = db('products').where('is_active', true);

    if (filters.category_id) {
      query = query.where('category_id', filters.category_id);
    }

    if (filters.brand) {
      // Support case-insensitive brand matching
      query = query.whereRaw('LOWER(brand) = LOWER(?)', [filters.brand]);
    }

    if (filters.min_price) {
      query = query.where('price', '>=', filters.min_price);
    }

    if (filters.max_price) {
      query = query.where('price', '<=', filters.max_price);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`)
            .orWhere('brand', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.onSale) {
      query = query.whereNotNull('discount_price');
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        query = query.where('stock_quantity', '>', 0);
      } else {
        query = query.where('stock_quantity', '<=', 0);
      }
    }

    try {
      const result = await query.count('id as count').first().timeout(20000);
      return parseInt(result.count);
    } catch (error) {
      console.error('Error en Product.count:', error.message);
      throw error;
    }
  }

  // Crear producto
  static async create(data) {
    const [product] = await db('products')
      .insert(data)
      .returning('*');
    return product;
  }

  // Actualizar producto
  static async update(id, data) {
    const [product] = await db('products')
      .where({ id })
      .update(data)
      .returning('*');
    return product;
  }

  // Eliminar producto
  static async delete(id) {
    return await db('products')
      .where({ id })
      .del();
  }
}

module.exports = Product;
