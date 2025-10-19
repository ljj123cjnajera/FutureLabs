const knex = require('../database/config');

class Coupon {
  static async create(couponData) {
    const [coupon] = await knex('coupons')
      .insert(couponData)
      .returning('*');
    return coupon;
  }

  static async findByCode(code) {
    const [coupon] = await knex('coupons')
      .where('code', code.toUpperCase())
      .where('is_active', true);
    return coupon;
  }

  static async validate(code) {
    const coupon = await this.findByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'Cupón no encontrado' };
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return { valid: false, message: 'Cupón aún no válido' };
    }

    if (now > validUntil) {
      return { valid: false, message: 'Cupón expirado' };
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { valid: false, message: 'Cupón agotado' };
    }

    return { valid: true, coupon };
  }

  static async apply(code, totalAmount) {
    const validation = await this.validate(code);
    
    if (!validation.valid) {
      return validation;
    }

    const coupon = validation.coupon;

    // Verificar monto mínimo
    if (totalAmount < coupon.min_purchase) {
      return {
        valid: false,
        message: `El monto mínimo de compra es S/ ${coupon.min_purchase}`
      };
    }

    // Calcular descuento
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (totalAmount * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    return {
      valid: true,
      coupon,
      discount: parseFloat(discount.toFixed(2))
    };
  }

  static async use(code) {
    const coupon = await this.findByCode(code);
    
    if (!coupon) {
      return false;
    }

    await knex('coupons')
      .where('id', coupon.id)
      .increment('used_count', 1);

    return true;
  }

  static async findAll() {
    return await knex('coupons')
      .orderBy('created_at', 'desc');
  }

  static async findById(id) {
    const [coupon] = await knex('coupons')
      .where('id', id);
    return coupon;
  }

  static async update(id, updateData) {
    const [coupon] = await knex('coupons')
      .where('id', id)
      .update(updateData)
      .returning('*');
    return coupon;
  }

  static async delete(id) {
    return await knex('coupons')
      .where('id', id)
      .del();
  }
}

module.exports = Coupon;






