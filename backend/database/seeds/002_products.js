exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('products').del();

  // Inserts seed entries
  await knex('products').insert([
    // Jordan
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Air Jordan 1 Retro High OG',
      slug: 'air-jordan-1-retro-high-og',
      description: 'El clásico que lo empezó todo. Diseño icónico con cuero de primera calidad.',
      price: 179.99,
      discount_price: 159.99,
      brand: 'Jordan',
      sku: 'JD-AJ1-001',
      stock_quantity: 20,
      image_url: 'assets/images/products/jordan1.jpg',
      images: JSON.stringify([
        'assets/images/products/jordan1.jpg',
        'assets/images/products/jordan1-side.jpg'
      ]),
      specifications: JSON.stringify({
        'Material': 'Cuero Premium',
        'Suela': 'Goma',
        'Amortiguación': 'Air-Sole',
        'Color': 'University Blue',
        'Tallas Disponibles': 'US 7-13'
      }),
      rating: 4.9,
      review_count: 125,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440003'
    },
    // Nike
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      name: 'Nike Air Force 1 \'07',
      slug: 'nike-air-force-1-07',
      description: 'La leyenda sigue viva. Estilo legendario, durabilidad y comodidad.',
      price: 110.00,
      brand: 'Nike',
      sku: 'NK-AF1-002',
      stock_quantity: 50,
      image_url: 'assets/images/products/af1.jpg',
      rating: 4.8,
      review_count: 340,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      name: 'Nike Dunk Low Retro',
      slug: 'nike-dunk-low-retro',
      description: 'Creados para la cancha, adaptados para la calle. Vuelve el icono de los 80.',
      price: 115.00,
      brand: 'Nike',
      sku: 'NK-DNK-003',
      stock_quantity: 15,
      image_url: 'assets/images/products/dunk-low.jpg',
      rating: 4.7,
      review_count: 89,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440001'
    },
    // Adidas
    {
      id: '660e8400-e29b-41d4-a716-446655440004',
      name: 'Adidas Yeezy Boost 350 V2',
      slug: 'adidas-yeezy-boost-350-v2',
      description: 'Diseño vanguardista con tecnología Boost para una comodidad inigualable.',
      price: 230.00,
      brand: 'Adidas',
      sku: 'AD-YZY-004',
      stock_quantity: 10,
      image_url: 'assets/images/products/yeezy350.jpg',
      rating: 4.6,
      review_count: 210,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440002'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440005',
      name: 'Adidas Forum Low',
      slug: 'adidas-forum-low',
      description: 'Más que una zapatilla, un símbolo de expresión personal.',
      price: 100.00,
      discount_price: 85.00,
      brand: 'Adidas',
      sku: 'AD-FRM-005',
      stock_quantity: 30,
      image_url: 'assets/images/products/forum.jpg',
      rating: 4.5,
      review_count: 56,
      category_id: '550e8400-e29b-41d4-a716-446655440002'
    },
    // New Balance
    {
      id: '660e8400-e29b-41d4-a716-446655440006',
      name: 'New Balance 550',
      slug: 'new-balance-550',
      description: 'El regreso de una leyenda del baloncesto. Estilo retro simple y limpio.',
      price: 119.99,
      brand: 'New Balance',
      sku: 'NB-550-006',
      stock_quantity: 25,
      image_url: 'assets/images/products/nb550.jpg',
      rating: 4.8,
      review_count: 75,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440005'
    },
    // Vans
    {
      id: '660e8400-e29b-41d4-a716-446655440007',
      name: 'Vans Old Skool',
      slug: 'vans-old-skool',
      description: 'El clásico de skate con la icónica banda lateral Sidestripe.',
      price: 75.00,
      brand: 'Vans',
      sku: 'VN-OLD-007',
      stock_quantity: 100,
      image_url: 'assets/images/products/vans-old-skool.jpg',
      rating: 4.9,
      review_count: 500,
      category_id: '550e8400-e29b-41d4-a716-446655440006'
    },
    // Puma
    {
      id: '660e8400-e29b-41d4-a716-446655440008',
      name: 'Puma Suede Classic',
      slug: 'puma-suede-classic',
      description: 'Un icono desde 1968. Ante suave y estilo atemporal.',
      price: 70.00,
      brand: 'Puma',
      sku: 'PM-SDE-008',
      stock_quantity: 40,
      image_url: 'assets/images/products/puma-suede.jpg',
      rating: 4.4,
      review_count: 45,
      category_id: '550e8400-e29b-41d4-a716-446655440004'
    },
    // Converse
    {
      id: '660e8400-e29b-41d4-a716-446655440009',
      name: 'Converse Chuck 70 High Top',
      slug: 'converse-chuck-70',
      description: 'La mejor Chuck 70 de la historia. Lona premium y plantilla acolchada.',
      price: 90.00,
      brand: 'Converse',
      sku: 'CV-CH70-009',
      stock_quantity: 60,
      image_url: 'assets/images/products/chuck70.jpg',
      rating: 4.8,
      review_count: 310,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440007'
    },
    // Accesorios
    {
      id: '660e8400-e29b-41d4-a716-446655440010',
      name: 'Kit de Limpieza Premium Crep Protect',
      slug: 'kit-limpieza-crep-protect',
      description: 'El mejor cuidado para tus zapatillas. Incluye cepillo y solución.',
      price: 18.00,
      brand: 'Crep Protect',
      sku: 'AC-CREP-010',
      stock_quantity: 150,
      image_url: 'assets/images/products/crep-kit.jpg',
      rating: 4.7,
      review_count: 98,
      category_id: '550e8400-e29b-41d4-a716-446655440008'
    }
  ]);
};
