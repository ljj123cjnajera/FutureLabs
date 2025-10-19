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

    // Ordenamiento
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    // Paginación
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.limit(filters.limit).offset(offset);
    }

    return await query;
  }

  // Obtener producto por ID
  static async getById(id) {
    return await db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.id', id)
      .first();
  }

  // Obtener producto por slug
  static async getBySlug(slug) {
    return await db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.slug', slug)
      .first();
  }

  // Obtener productos destacados
  static async getFeatured(limit = 8) {
    return await db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.featured', true)
      .where('products.is_active', true)
      .orderBy('products.created_at', 'desc')
      .limit(limit);
  }

  // Obtener productos en oferta
  static async getOnSale(limit = 8) {
    return await db('products')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .whereNotNull('products.discount_price')
      .where('products.is_active', true)
      .orderBy('products.created_at', 'desc')
      .limit(limit);
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

    return await query;
  }

  // Contar productos
  static async count(filters = {}) {
    let query = db('products').where('is_active', true);

    if (filters.category_id) {
      query = query.where('category_id', filters.category_id);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    const result = await query.count('id as count').first();
    return parseInt(result.count);
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
