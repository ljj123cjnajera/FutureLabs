const knex = require('../database/config');

class BlogPost {
  // Crear nuevo post
  static async create(data) {
    const [post] = await knex('blog_posts')
      .insert(data)
      .returning('*');
    return post;
  }

  // Obtener todos los posts
  static async findAll(filters = {}) {
    let query = knex('blog_posts')
      .select(
        'blog_posts.*',
        'users.first_name',
        'users.last_name'
      )
      .leftJoin('users', 'blog_posts.author_id', 'users.id');

    if (filters.status) {
      query = query.where('blog_posts.status', filters.status);
    }

    if (filters.author_id) {
      query = query.where('blog_posts.author_id', filters.author_id);
    }

    if (filters.search) {
      query = query.where(function() {
        this.where('blog_posts.title', 'ilike', `%${filters.search}%`)
            .orWhere('blog_posts.content', 'ilike', `%${filters.search}%`);
      });
    }

    query = query.orderBy('blog_posts.created_at', 'desc');

    return await query;
  }

  // Obtener por ID
  static async findById(id) {
    const [post] = await knex('blog_posts')
      .select(
        'blog_posts.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'blog_posts.author_id', 'users.id')
      .where('blog_posts.id', id);
    return post;
  }

  // Obtener por slug
  static async findBySlug(slug) {
    const [post] = await knex('blog_posts')
      .select(
        'blog_posts.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'blog_posts.author_id', 'users.id')
      .where('blog_posts.slug', slug)
      .where('blog_posts.status', 'published');
    return post;
  }

  // Obtener posts publicados
  static async findPublished(limit = 10, offset = 0) {
    return await knex('blog_posts')
      .select(
        'blog_posts.*',
        'users.first_name',
        'users.last_name'
      )
      .leftJoin('users', 'blog_posts.author_id', 'users.id')
      .where('blog_posts.status', 'published')
      .orderBy('blog_posts.published_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  // Obtener posts recientes
  static async findRecent(limit = 5) {
    return await knex('blog_posts')
      .select(
        'blog_posts.*',
        'users.first_name',
        'users.last_name'
      )
      .leftJoin('users', 'blog_posts.author_id', 'users.id')
      .where('blog_posts.status', 'published')
      .orderBy('blog_posts.published_at', 'desc')
      .limit(limit);
  }

  // Actualizar post
  static async update(id, data) {
    const [post] = await knex('blog_posts')
      .where({ id })
      .update(data)
      .returning('*');
    return post;
  }

  // Eliminar post
  static async delete(id) {
    return await knex('blog_posts')
      .where({ id })
      .del();
  }

  // Incrementar vistas
  static async incrementViews(id) {
    await knex('blog_posts')
      .where({ id })
      .increment('views', 1);
  }

  // Contar posts
  static async count(filters = {}) {
    let query = knex('blog_posts');

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    const [result] = await query.count('* as count');
    return parseInt(result.count);
  }
}

module.exports = BlogPost;





