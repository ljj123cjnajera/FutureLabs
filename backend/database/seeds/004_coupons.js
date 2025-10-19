exports.seed = async function(knex) {
  await knex('coupons').del();
  
  await knex('coupons').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      min_purchase: 50,
      max_uses: 100,
      valid_from: new Date('2025-01-01'),
      valid_until: new Date('2025-12-31'),
      description: '10% de descuento en tu primera compra',
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      code: 'SUMMER20',
      type: 'percentage',
      value: 20,
      min_purchase: 100,
      max_uses: 50,
      valid_from: new Date('2025-01-01'),
      valid_until: new Date('2025-12-31'),
      description: '20% de descuento en compras mayores a S/ 100',
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      code: 'FIXED50',
      type: 'fixed',
      value: 50,
      min_purchase: 200,
      max_uses: 30,
      valid_from: new Date('2025-01-01'),
      valid_until: new Date('2025-12-31'),
      description: 'S/ 50 de descuento en compras mayores a S/ 200',
      is_active: true
    }
  ]);
};






