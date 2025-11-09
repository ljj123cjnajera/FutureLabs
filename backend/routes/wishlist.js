const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { requireAuth } = require('../middleware/auth');

// Obtener listas e items de la wishlist del usuario
router.get('/', requireAuth, async (req, res) => {
  try {
    const lists = await Wishlist.getListsWithItems(req.user.id);
    const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0);

    res.json({
      success: true,
      data: {
        lists,
        stats: {
          total_items: totalItems,
          total_lists: lists.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener wishlist'
    });
  }
});

// Crear nueva lista
router.post('/lists', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la lista es obligatorio'
      });
    }

    const list = await Wishlist.createList(req.user.id, {
      name: name.trim(),
      description
    });

    res.json({
      success: true,
      message: 'Lista creada correctamente',
      data: { list }
    });
  } catch (error) {
    console.error('Error creating wishlist list:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la lista'
    });
  }
});

// Actualizar lista
router.put('/lists/:listId', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, description, position } = req.body;

    const updated = await Wishlist.updateList(req.user.id, listId, {
      name,
      description,
      position
    });

    res.json({
      success: true,
      message: 'Lista actualizada correctamente',
      data: { list: updated }
    });
  } catch (error) {
    console.error('Error updating wishlist list:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la lista'
    });
  }
});

// Establecer lista por defecto
router.post('/lists/:listId/set-default', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await Wishlist.setDefaultList(req.user.id, listId);

    res.json({
      success: true,
      message: 'Lista predeterminada actualizada',
      data: { list }
    });
  } catch (error) {
    console.error('Error setting default wishlist list:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la lista predeterminada'
    });
  }
});

// Eliminar lista
router.delete('/lists/:listId', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const { delete_items: deleteItems = false } = req.body || {};

    await Wishlist.deleteList(req.user.id, listId, { deleteItems });

    res.json({
      success: true,
      message: deleteItems
        ? 'Lista e items eliminados correctamente'
        : 'Lista eliminada, los productos se movieron a tu lista principal'
    });
  } catch (error) {
    console.error('Error deleting wishlist list:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar la lista'
    });
  }
});

// Mover producto entre listas
router.post('/items/move', requireAuth, async (req, res) => {
  try {
    const { product_id: productId, from_list_id: fromListId, to_list_id: toListId } = req.body || {};

    if (!productId || !toListId) {
      return res.status(400).json({
        success: false,
        message: 'Producto y lista destino son obligatorios'
      });
    }

    const result = await Wishlist.moveItem(req.user.id, productId, fromListId, toListId);

    res.json({
      success: true,
      message: result.moved ? 'Producto movido a la nueva lista' : 'El producto ya se encontraba en esa lista',
      data: result
    });
  } catch (error) {
    console.error('Error moving wishlist item:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al mover el producto de lista'
    });
  }
});

// Agregar producto a wishlist
router.post('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { list_id: listId } = req.body || {};

    await Wishlist.add(req.user.id, productId, listId);

    res.json({
      success: true,
      message: 'Producto agregado a tu wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al agregar a wishlist'
    });
  }
});

// Eliminar producto de wishlist
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { list_id: listId } = req.body || {};

    await Wishlist.remove(req.user.id, productId, listId);

    res.json({
      success: true,
      message: 'Producto eliminado de tu wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar de wishlist'
    });
  }
});

// Verificar si producto está en wishlist
router.get('/check/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { list_id: listId } = req.query;

    const hasProduct = await Wishlist.hasProduct(req.user.id, productId, listId);

    res.json({
      success: true,
      data: { inWishlist: hasProduct }
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar wishlist'
    });
  }
});

// Limpiar wishlist
router.delete('/', requireAuth, async (req, res) => {
  try {
    const { list_id: listId } = req.body || {};
    await Wishlist.clear(req.user.id, listId);

    res.json({
      success: true,
      message: listId ? 'Lista limpiada' : 'Wishlist limpiada'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar wishlist'
    });
  }
});

module.exports = router;






