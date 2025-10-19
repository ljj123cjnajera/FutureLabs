exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  
  // Inserts seed entries
  await knex('products').insert([
    // Laptops
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'FutureBook Pro 15"',
      slug: 'futurebook-pro-15',
      description: 'Laptop profesional con pantalla 4K, procesador Intel i7, 16GB RAM, 512GB SSD',
      price: 1299.99,
      discount_price: 1199.99,
      brand: 'FutureLabs',
      sku: 'FL-LAP-001',
      stock_quantity: 15,
      image_url: 'assets/images/products/laptop-1.jpg',
      images: JSON.stringify([
        'assets/images/products/laptop-1.jpg',
        'assets/images/products/laptop-2.jpg'
      ]),
      specifications: JSON.stringify({
        'Pantalla': '15" 4K IPS',
        'Procesador': 'Intel Core i7-12700H',
        'RAM': '16GB DDR4',
        'Almacenamiento': '512GB SSD',
        'GPU': 'NVIDIA RTX 3050',
        'Sistema Operativo': 'Windows 11 Pro'
      }),
      rating: 4.8,
      review_count: 45,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      name: 'Gaming Laptop Ultra',
      slug: 'gaming-laptop-ultra',
      description: 'Laptop gaming con RTX 4070, pantalla 144Hz, teclado RGB',
      price: 1899.99,
      brand: 'GameTech',
      sku: 'GT-LAP-002',
      stock_quantity: 8,
      image_url: 'assets/images/products/laptop-gaming.jpg',
      rating: 4.9,
      review_count: 32,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440003'
    },
    
    // Celulares
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      name: 'FuturePhone Pro Max',
      slug: 'futurephone-pro-max',
      description: 'Smartphone con pantalla AMOLED 6.7", cámara 108MP, 256GB',
      price: 899.99,
      discount_price: 799.99,
      brand: 'FutureLabs',
      sku: 'FL-PHO-003',
      stock_quantity: 25,
      image_url: 'assets/images/products/smartphone.jpg',
      rating: 4.7,
      review_count: 78,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440002'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440004',
      name: 'SmartWatch Elite',
      slug: 'smartwatch-elite',
      description: 'Smartwatch con GPS, monitoreo de salud, resistencia al agua',
      price: 299.99,
      brand: 'WearTech',
      sku: 'WT-WAT-004',
      stock_quantity: 40,
      image_url: 'assets/images/products/smartwatch.jpg',
      rating: 4.6,
      review_count: 56,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440002'
    },
    
    // Gaming
    {
      id: '660e8400-e29b-41d4-a716-446655440005',
      name: 'PlayStation 5',
      slug: 'playstation-5',
      description: 'Consola de videojuegos de nueva generación con 825GB SSD',
      price: 599.99,
      brand: 'Sony',
      sku: 'SON-PS5-005',
      stock_quantity: 12,
      image_url: 'assets/images/products/ps5.jpg',
      rating: 4.9,
      review_count: 120,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440003'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440006',
      name: 'Teclado Mecánico RGB',
      slug: 'teclado-mecanico-rgb',
      description: 'Teclado mecánico con switches Cherry MX, iluminación RGB',
      price: 149.99,
      brand: 'KeyTech',
      sku: 'KT-KEY-006',
      stock_quantity: 30,
      image_url: 'assets/images/products/teclado.jpg',
      rating: 4.5,
      review_count: 89,
      category_id: '550e8400-e29b-41d4-a716-446655440003'
    },
    
    // Smart Home
    {
      id: '660e8400-e29b-41d4-a716-446655440007',
      name: 'Smart Speaker Pro',
      slug: 'smart-speaker-pro',
      description: 'Altavoz inteligente con asistente de voz, sonido 360°',
      price: 199.99,
      discount_price: 149.99,
      brand: 'HomeTech',
      sku: 'HT-SPK-007',
      stock_quantity: 50,
      image_url: 'assets/images/products/speaker.jpg',
      rating: 4.4,
      review_count: 67,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440004'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440008',
      name: 'Smart Light Bulbs Pack',
      slug: 'smart-light-bulbs-pack',
      description: 'Pack de 4 bombillas inteligentes con control por app',
      price: 89.99,
      brand: 'LightTech',
      sku: 'LT-LIG-008',
      stock_quantity: 60,
      image_url: 'assets/images/products/bombillas.jpg',
      rating: 4.3,
      review_count: 34,
      category_id: '550e8400-e29b-41d4-a716-446655440004'
    },
    
    // Audio
    {
      id: '660e8400-e29b-41d4-a716-446655440009',
      name: 'Audífonos Inalámbricos Elite',
      slug: 'audifonos-inalambricos-elite',
      description: 'Audífonos con cancelación de ruido activa, batería 30h',
      price: 249.99,
      brand: 'SoundTech',
      sku: 'ST-AUD-009',
      stock_quantity: 35,
      image_url: 'assets/images/products/audifonos.jpg',
      rating: 4.7,
      review_count: 92,
      featured: true,
      category_id: '550e8400-e29b-41d4-a716-446655440005'
    },
    
    // Accesorios
    {
      id: '660e8400-e29b-41d4-a716-446655440010',
      name: 'Cargador Rápido USB-C',
      slug: 'cargador-rapido-usb-c',
      description: 'Cargador rápido 65W con puerto USB-C, compatible con laptops',
      price: 49.99,
      brand: 'PowerTech',
      sku: 'PT-CHG-010',
      stock_quantity: 80,
      image_url: 'assets/images/products/cargador.jpg',
      rating: 4.6,
      review_count: 145,
      category_id: '550e8400-e29b-41d4-a716-446655440008'
    }
  ]);
};
