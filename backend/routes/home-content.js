const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const Banner = require('../models/Banner');
const Benefit = require('../models/Benefit');
const HomeSection = require('../models/HomeSection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ========== RUTAS PÚBLICAS (para el frontend) ==========

// GET /api/home-content/hero-slides - Obtener slides del hero
router.get('/hero-slides', async (req, res) => {
  try {
    const slides = await HeroSlide.getAll(true);
    res.json({ success: true, data: { slides } });
  } catch (error) {
    console.error('Error getting hero slides:', error);
    res.status(500).json({ success: false, message: 'Error al obtener slides' });
  }
});

// GET /api/home-content/banners - Obtener banners
router.get('/banners', async (req, res) => {
  try {
    const { type, position } = req.query;
    const banners = await Banner.getAll({
      banner_type: type,
      position: position,
      activeOnly: true
    });
    res.json({ success: true, data: { banners } });
  } catch (error) {
    console.error('Error getting banners:', error);
    res.status(500).json({ success: false, message: 'Error al obtener banners' });
  }
});

// GET /api/home-content/benefits - Obtener beneficios
router.get('/benefits', async (req, res) => {
  try {
    const benefits = await Benefit.getAll(true);
    res.json({ success: true, data: { benefits } });
  } catch (error) {
    console.error('Error getting benefits:', error);
    res.status(500).json({ success: false, message: 'Error al obtener beneficios' });
  }
});

// GET /api/home-content/sections - Obtener secciones del home
router.get('/sections', async (req, res) => {
  try {
    const sections = await HomeSection.getAll(true);
    res.json({ success: true, data: { sections } });
  } catch (error) {
    console.error('Error getting home sections:', error);
    res.status(500).json({ success: false, message: 'Error al obtener secciones' });
  }
});

// GET /api/home-content/all - Obtener todo el contenido del home
router.get('/all', async (req, res) => {
  try {
    const [slides, banners, benefits, sections] = await Promise.all([
      HeroSlide.getAll(true),
      Banner.getAll({ activeOnly: true }),
      Benefit.getAll(true),
      HomeSection.getAll(true)
    ]);
    
    res.json({
      success: true,
      data: {
        hero_slides: slides,
        banners: banners,
        benefits: benefits,
        sections: sections
      }
    });
  } catch (error) {
    console.error('Error getting all home content:', error);
    res.status(500).json({ success: false, message: 'Error al obtener contenido' });
  }
});

// ========== RUTAS ADMIN (requieren autenticación) ==========
router.use(authenticateToken, requireAdmin);

// ===== HERO SLIDES =====
router.get('/admin/hero-slides', async (req, res) => {
  try {
    const slides = await HeroSlide.getAll();
    res.json({ success: true, data: { slides } });
  } catch (error) {
    console.error('Error getting hero slides:', error);
    res.status(500).json({ success: false, message: 'Error al obtener slides' });
  }
});

router.post('/admin/hero-slides', async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json({ success: true, message: 'Slide creado exitosamente', data: { slide } });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({ success: false, message: 'Error al crear slide' });
  }
});

router.put('/admin/hero-slides/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.update(req.params.id, req.body);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Slide no encontrado' });
    }
    res.json({ success: true, message: 'Slide actualizado exitosamente', data: { slide } });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar slide' });
  }
});

router.delete('/admin/hero-slides/:id', async (req, res) => {
  try {
    await HeroSlide.delete(req.params.id);
    res.json({ success: true, message: 'Slide eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar slide' });
  }
});

// ===== BANNERS =====
router.get('/admin/banners', async (req, res) => {
  try {
    const banners = await Banner.getAll();
    res.json({ success: true, data: { banners } });
  } catch (error) {
    console.error('Error getting banners:', error);
    res.status(500).json({ success: false, message: 'Error al obtener banners' });
  }
});

router.post('/admin/banners', async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, message: 'Banner creado exitosamente', data: { banner } });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: 'Error al crear banner' });
  }
});

router.put('/admin/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.update(req.params.id, req.body);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner no encontrado' });
    }
    res.json({ success: true, message: 'Banner actualizado exitosamente', data: { banner } });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar banner' });
  }
});

router.delete('/admin/banners/:id', async (req, res) => {
  try {
    await Banner.delete(req.params.id);
    res.json({ success: true, message: 'Banner eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar banner' });
  }
});

// ===== BENEFITS =====
router.get('/admin/benefits', async (req, res) => {
  try {
    const benefits = await Benefit.getAll();
    res.json({ success: true, data: { benefits } });
  } catch (error) {
    console.error('Error getting benefits:', error);
    res.status(500).json({ success: false, message: 'Error al obtener beneficios' });
  }
});

router.post('/admin/benefits', async (req, res) => {
  try {
    const benefit = await Benefit.create(req.body);
    res.status(201).json({ success: true, message: 'Beneficio creado exitosamente', data: { benefit } });
  } catch (error) {
    console.error('Error creating benefit:', error);
    res.status(500).json({ success: false, message: 'Error al crear beneficio' });
  }
});

router.put('/admin/benefits/:id', async (req, res) => {
  try {
    const benefit = await Benefit.update(req.params.id, req.body);
    if (!benefit) {
      return res.status(404).json({ success: false, message: 'Beneficio no encontrado' });
    }
    res.json({ success: true, message: 'Beneficio actualizado exitosamente', data: { benefit } });
  } catch (error) {
    console.error('Error updating benefit:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar beneficio' });
  }
});

router.delete('/admin/benefits/:id', async (req, res) => {
  try {
    await Benefit.delete(req.params.id);
    res.json({ success: true, message: 'Beneficio eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting benefit:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar beneficio' });
  }
});

// ===== HOME SECTIONS =====
router.get('/admin/sections', async (req, res) => {
  try {
    const sections = await HomeSection.getAll();
    res.json({ success: true, data: { sections } });
  } catch (error) {
    console.error('Error getting home sections:', error);
    res.status(500).json({ success: false, message: 'Error al obtener secciones' });
  }
});

router.post('/admin/sections', async (req, res) => {
  try {
    const section = await HomeSection.create(req.body);
    res.status(201).json({ success: true, message: 'Sección creada exitosamente', data: { section } });
  } catch (error) {
    console.error('Error creating home section:', error);
    res.status(500).json({ success: false, message: 'Error al crear sección' });
  }
});

router.put('/admin/sections/:id', async (req, res) => {
  try {
    const section = await HomeSection.update(req.params.id, req.body);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Sección no encontrada' });
    }
    res.json({ success: true, message: 'Sección actualizada exitosamente', data: { section } });
  } catch (error) {
    console.error('Error updating home section:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar sección' });
  }
});

router.delete('/admin/sections/:id', async (req, res) => {
  try {
    await HomeSection.delete(req.params.id);
    res.json({ success: true, message: 'Sección eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting home section:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar sección' });
  }
});

module.exports = router;

