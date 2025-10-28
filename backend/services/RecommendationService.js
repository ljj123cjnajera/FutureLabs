const knex = require('../database/config');

class RecommendationService {
  // Obtener productos relacionados (categoría y marca)
  static async getRelatedProducts(productId, limit = 4) {
    try {
      // Obtener producto actual
      const [currentProduct] = await knex('products')
        .where('id', productId);
      
      if (!currentProduct) {
        return [];
      }
      
      // Buscar productos de la misma categoría
      const sameCategoryProducts = await knex('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.id', '!=', productId)
        .where('products.category_id', currentProduct.category_id)
        .where('products.is_active', true)
        .orderBy('products.created_at', 'desc')
        .limit(limit);
      
      // Si no hay suficientes, agregar productos de la misma marca
      if (sameCategoryProducts.length < limit && currentProduct.brand) {
        const sameBrandProducts = await knex('products')
          .select('products.*', 'categories.name as category_name')
          .leftJoin('categories', 'products.category_id', 'categories.id')
          .where('products.id', '!=', productId)
          .where('products.brand', currentProduct.brand)
          .where('products.is_active', true)
          .whereNotIn('products.id', sameCategoryProducts.map(p => p.id))
          .orderBy('products.created_at', 'desc')
          .limit(limit - sameCategoryProducts.length);
        
        sameCategoryProducts.push(...sameBrandProducts);
      }
      
      // Si aún no hay suficientes, buscar productos con precio similar
      if (sameCategoryProducts.length < limit) {
        const currentPrice = parseFloat(currentProduct.price);
        const priceRange = currentPrice * 0.4; // ±40% del precio
        
        const similarPriceProducts = await knex('products')
          .select('products.*', 'categories.name as category_name')
          .leftJoin('categories', 'products.category_id', 'categories.id')
          .where('products.id', '!=', productId)
          .where('products.is_active', true)
          .whereBetween('products.price', [
            currentPrice - priceRange,
            currentPrice + priceRange
          ])
          .whereNotIn('products.id', sameCategoryProducts.map(p => p.id))
          .orderBy('products.created_at', 'desc')
          .limit(limit - sameCategoryProducts.length);
        
        sameCategoryProducts.push(...similarPriceProducts);
      }
      
      return sameCategoryProducts;
    } catch (error) {
      console.error('Error getting related products:', error);
      return [];
    }
  }
  
  // Obtener productos recomendados para un usuario basado en su historial
  static async getRecommendedForUser(userId, limit = 8) {
    try {
      // Obtener categorías de productos que el usuario ha comprado
      const userPurchases = await knex('orders')
        .select('order_items.product_id')
        .join('order_items', 'orders.id', 'order_items.order_id')
        .where('orders.user_id', userId)
        .where('orders.payment_status', 'paid');
      
      if (userPurchases.length === 0) {
        // Si el usuario no tiene compras, devolver productos populares
        return await this.getPopularProducts(limit);
      }
      
      const purchasedProductIds = [...new Set(userPurchases.map(p => p.product_id))];
      
      // Obtener categorías de esos productos
      const purchasedCategories = await knex('products')
        .select('category_id')
        .whereIn('id', purchasedProductIds);
      
      const categoryIds = [...new Set(purchasedCategories.map(c => c.category_id))];
      
      // Obtener marcas preferidas
      const purchasedBrands = await knex('products')
        .select('brand')
        .whereIn('id', purchasedProductIds)
        .whereNotNull('brand');
      
      const brandNames = [...new Set(purchasedBrands.map(b => b.brand))];
      
      // Buscar productos recomendados
      let recommendedProducts = await knex('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.is_active', true)
        .whereNotIn('products.id', purchasedProductIds)
        .where(function() {
          if (categoryIds.length > 0) {
            this.whereIn('products.category_id', categoryIds);
          }
          if (brandNames.length > 0) {
            this.orWhereIn('products.brand', brandNames);
          }
        })
        .orderBy('products.view_count', 'desc')
        .orderBy('products.rating', 'desc')
        .limit(limit);
      
      // Si no hay suficientes, agregar productos populares
      if (recommendedProducts.length < limit) {
        const popularProducts = await this.getPopularProducts(limit - recommendedProducts.length, recommendedProducts.map(p => p.id));
        recommendedProducts.push(...popularProducts);
      }
      
      return recommendedProducts;
    } catch (error) {
      console.error('Error getting recommended products:', error);
      return [];
    }
  }
  
  // Obtener productos populares
  static async getPopularProducts(limit = 8, excludeIds = []) {
    try {
      let query = knex('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where('products.is_active', true)
        .orderBy('products.view_count', 'desc')
        .orderBy('products.rating', 'desc')
        .orderBy('products.created_at', 'desc')
        .limit(limit);
      
      if (excludeIds.length > 0) {
        query = query.whereNotIn('products.id', excludeIds);
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }
  
  // Obtener productos más vendidos
  static async getTopSellingProducts(limit = 8, categoryId = null) {
    try {
      const topProducts = await knex('order_items')
        .select(
          'order_items.product_id',
          knex.raw('SUM(order_items.quantity) as total_sold')
        )
        .join('orders', 'order_items.order_id', 'orders.id')
        .join('products', 'order_items.product_id', 'products.id')
        .where('orders.payment_status', 'paid')
        .groupBy('order_items.product_id')
        .orderBy('total_sold', 'desc')
        .limit(limit * 2); // Obtener más para filtrar
      
      if (topProducts.length === 0) {
        return await this.getPopularProducts(limit);
      }
      
      const productIds = topProducts.map(p => p.product_id);
      
      let query = knex('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .whereIn('products.id', productIds)
        .where('products.is_active', true);
      
      if (categoryId) {
        query = query.where('products.category_id', categoryId);
      }
      
      const products = await query.limit(limit);
      
      // Ordenar por total vendido
      const productsWithSales = products.map(product => {
        const sales = topProducts.find(tp => tp.product_id === product.id);
        return { ...product, total_sold: parseInt(sales?.total_sold || 0) };
      });
      
      productsWithSales.sort((a, b) => b.total_sold - a.total_sold);
      
      return productsWithSales;
    } catch (error) {
      console.error('Error getting top selling products:', error);
      return [];
    }
  }
  
  // Incrementar contador de visualizaciones
  static async incrementViewCount(productId) {
    try {
      await knex('products')
        .where('id', productId)
        .increment('view_count', 1);
      
      return true;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }
  }
}

module.exports = RecommendationService;

