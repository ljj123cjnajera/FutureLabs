const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// ===== PÚBLICO =====

// Obtener todos los posts publicados
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await BlogPost.findPublished(limit, offset);
    const total = await BlogPost.count({ status: 'published' });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts'
    });
  }
});

// Obtener posts recientes
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await BlogPost.findRecent(limit);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts recientes'
    });
  }
});

// Obtener post por slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findBySlug(req.params.slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Incrementar vistas
    await BlogPost.incrementViews(post.id);

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener post'
    });
  }
});

// ===== ADMIN =====

// Obtener todos los posts (admin)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const posts = await BlogPost.findAll(req.query);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts'
    });
  }
});

// Obtener post por ID (admin)
router.get('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener post'
    });
  }
});

// Crear post
router.post('/', requireAdmin, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author_id: req.user.id
    };

    const post = await BlogPost.create(postData);

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: { post }
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear post'
    });
  }
});

// Actualizar post
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.update(req.params.id, req.body);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      data: { post }
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar post'
    });
  }
});

// Eliminar post
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await BlogPost.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar post'
    });
  }
});

module.exports = router;





