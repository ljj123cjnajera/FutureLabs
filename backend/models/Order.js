const db = require('../database/config');
const { v4: uuidv4 } = require('uuid');
const Coupon = require('./Coupon');
const LoyaltyPoints = require('./LoyaltyPoints');

class Order {
  // Generar número de pedido único
  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FL-${timestamp}-${random}`;
  }

  // Obtener pedido por ID
  static async getById(id) {
    const order = await db('orders')
      .where({ id })
      .first();

    if (!order) return null;

    // Obtener items del pedido con información del producto
    const items = await db('order_items')
      .select(
        'order_items.*',
        'products.name as product_name',
        'products.slug as product_slug',
        'products.image_url as image_url',
        'products.brand as product_brand',
        'products.sku as product_sku'
      )
      .leftJoin('products', 'order_items.product_id', 'products.id')
      .where({ order_id: id });

    return {
      ...order,
      items
    };
  }

  // Obtener pedido por número de pedido
  static async getByOrderNumber(orderNumber) {
    const order = await db('orders')
      .where({ order_number: orderNumber })
      .first();

    if (!order) return null;

    // Obtener items del pedido
    const items = await db('order_items')
      .where({ order_id: order.id });

    return {
      ...order,
      items
    };
  }

  // Obtener pedidos de un usuario
  static async getByUserId(userId, filters = {}) {
    let query = db('orders')
      .where({ user_id: userId });

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    query = query.orderBy('created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const orders = await query;

    // Obtener items para cada pedido con información del producto
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db('order_items')
          .select(
            'order_items.*',
            'products.name as product_name',
            'products.slug as product_slug',
            'products.image_url as image_url',
            'products.brand as product_brand'
          )
          .leftJoin('products', 'order_items.product_id', 'products.id')
          .where({ order_id: order.id });
        return {
          ...order,
          items
        };
      })
    );

    return ordersWithItems;
  }

  // Obtener todos los pedidos (admin)
  static async getAll(filters = {}) {
    let query = db('orders')
      .select('orders.*', 'users.first_name', 'users.last_name', 'users.email')
      .leftJoin('users', 'orders.user_id', 'users.id');

    if (filters.status) {
      query = query.where('orders.status', filters.status);
    }

    if (filters.payment_status) {
      query = query.where('orders.payment_status', filters.payment_status);
    }

    if (filters.user_id) {
      query = query.where('orders.user_id', filters.user_id);
    }

    query = query.orderBy('orders.created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }

  // Crear pedido desde carrito
  static async createFromCart(userId, orderData) {
    return await db.transaction(async (trx) => {
      // Obtener items del carrito con información completa
      const cartItems = await trx('cart')
        .select(
          'cart.quantity',
          'products.id as product_id',
          'products.name as product_name',
          'products.sku as product_sku',
          'products.price',
          'products.discount_price',
          'products.stock',
          'products.category_id',
          'products.brand'
        )
        .leftJoin('products', 'cart.product_id', 'products.id')
        .where('cart.user_id', userId);

      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Validar stock antes de crear pedido
      for (const item of cartItems) {
        if (!item.product_id) {
          throw new Error(`Producto no encontrado en el carrito`);
        }
        if (item.stock !== null && item.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.product_name}. Disponible: ${item.stock}, Solicitado: ${item.quantity}`);
        }
      }

      // Calcular subtotal
      let subtotal = 0;
      const items = cartItems.map(item => {
        const price = item.discount_price || item.price;
        const total = price * item.quantity;
        subtotal += total;

        return {
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          price: item.price,
          discount_price: item.discount_price,
          quantity: item.quantity,
          total,
          category_id: item.category_id,
          brand: item.brand
        };
      });

      const shippingCost = orderData.shipping_cost || 0;
      const tax = orderData.tax || 0;
      let totalBeforeDiscounts = subtotal + shippingCost + tax;

      // Aplicar cupón si existe
      let couponDiscount = 0;
      let couponCode = null;
      let couponId = null;
      
      if (orderData.coupon_code) {
        const couponResult = await Coupon.apply(
          orderData.coupon_code,
          totalBeforeDiscounts,
          items
        );

        if (!couponResult.valid) {
          throw new Error(couponResult.message || 'Cupón inválido');
        }

        couponDiscount = couponResult.discount;
        couponCode = couponResult.coupon.code;
        couponId = couponResult.coupon.id;

        // Marcar cupón como usado
        await Coupon.use(orderData.coupon_code);
      }

      // Aplicar puntos de fidelidad si se usan
      let loyaltyPointsDiscount = 0;
      let loyaltyPointsUsed = 0;
      
      if (orderData.loyalty_points_used && orderData.loyalty_points_used > 0) {
        const userPoints = await LoyaltyPoints.getPointsForUser(userId);
        
        if (userPoints.points < orderData.loyalty_points_used) {
          throw new Error('No tienes suficientes puntos de fidelidad');
        }

        // Validar que no se use más del 20% del total
        const maxPointsValue = totalBeforeDiscounts * 0.2;
        const pointsValue = orderData.loyalty_points_used / 100; // 100 puntos = S/ 1
        
        if (pointsValue > maxPointsValue) {
          throw new Error(`Solo puedes usar puntos para hasta el 20% del total (máximo S/ ${maxPointsValue.toFixed(2)})`);
        }

        loyaltyPointsDiscount = Math.min(pointsValue, maxPointsValue);
        loyaltyPointsUsed = orderData.loyalty_points_used;

        // Canjear puntos
        await LoyaltyPoints.redeemPoints(
          userId,
          loyaltyPointsUsed,
          `Compra: Pedido pendiente`
        );
      }

      // Calcular total final después de descuentos
      const totalDiscount = couponDiscount + loyaltyPointsDiscount;
      const totalAmount = Math.max(totalBeforeDiscounts - totalDiscount, 0);

      // Validar total si viene del frontend
      if (orderData.expected_total !== undefined) {
        const expectedTotal = parseFloat(orderData.expected_total);
        const calculatedTotal = parseFloat(totalAmount.toFixed(2));
        
        // Permitir diferencia de hasta 0.01 por redondeos
        if (Math.abs(expectedTotal - calculatedTotal) > 0.01) {
          throw new Error(`El total calculado (S/ ${calculatedTotal}) no coincide con el total esperado (S/ ${expectedTotal}). Por favor, recarga la página e intenta nuevamente.`);
        }
      }

      // Crear pedido
      const orderNumber = Order.generateOrderNumber();
      const [order] = await trx('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          subtotal,
          shipping_cost: shippingCost,
          tax,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.payment_method,
          payment_id: orderData.payment_intent_id || null, // Guardar payment_intent_id si existe
          shipping_address: orderData.shipping_address,
          shipping_city: orderData.shipping_city,
          shipping_state: orderData.shipping_state,
          shipping_country: orderData.shipping_country,
          shipping_postal_code: orderData.shipping_postal_code,
          shipping_phone: orderData.shipping_phone,
          shipping_email: orderData.shipping_email,
          shipping_full_name: orderData.shipping_full_name,
          notes: orderData.notes || null,
          coupon_code: couponCode,
          coupon_id: couponId,
          coupon_discount: couponDiscount,
          loyalty_points_used: loyaltyPointsUsed,
          loyalty_points_discount: loyaltyPointsDiscount
        })
        .returning('*');

      // Crear items del pedido
      const orderItemsToInsert = items.map(item => ({
        order_id: order.id,
        ...item
      }));

      await trx('order_items').insert(orderItemsToInsert);

      // Limpiar carrito
      await trx('cart').where('user_id', userId).del();

      // Obtener pedido completo dentro de la transacción
      const fullOrder = await trx('orders')
        .where({ id: order.id })
        .first();

      if (!fullOrder) {
        throw new Error('Error al recuperar el pedido creado');
      }

      // Obtener items del pedido
      const orderItems = await trx('order_items')
        .select(
          'order_items.*',
          'products.name as product_name',
          'products.slug as product_slug',
          'products.image_url as image_url',
          'products.brand as product_brand',
          'products.sku as product_sku'
        )
        .leftJoin('products', 'order_items.product_id', 'products.id')
        .where({ order_id: order.id });

      return {
        ...fullOrder,
        items: orderItems
      };
    });
  }

  // Actualizar estado del pedido
  static async updateStatus(id, status) {
    const updateData = { status };

    if (status === 'shipped') {
      updateData.shipped_at = new Date();
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    const [order] = await db('orders')
      .where({ id })
      .update(updateData)
      .returning('*');

    return order;
  }

  // Actualizar estado de pago
  static async updatePaymentStatus(id, paymentStatus, paymentId = null) {
    const updateData = { payment_status: paymentStatus };

    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    if (paymentStatus === 'paid') {
      updateData.status = 'processing';
    }

    const [order] = await db('orders')
      .where({ id })
      .update(updateData)
      .returning('*');

    return order;
  }

  // Contar pedidos
  static async count(filters = {}) {
    let query = db('orders');

    if (filters.user_id) {
      query = query.where('user_id', filters.user_id);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    const result = await query.count('id as count').first();
    return parseInt(result.count);
  }

  // Obtener todos los pedidos (admin)
  static async findAllForAdmin() {
    return await db('orders')
      .select(
        'orders.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'orders.user_id', 'users.id')
      .orderBy('orders.created_at', 'desc');
  }
}

module.exports = Order;

