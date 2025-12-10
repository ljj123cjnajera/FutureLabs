exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('categories').del();

  // Inserts seed entries
  await knex('categories').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Nike',
      slug: 'nike',
      description: 'Just Do It. Innovación e inspiración para cada atleta.',
      icon: 'fas fa-shoe-prints',
      image_url: 'assets/images/categories/nike.jpg',
      sort_order: 1
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Adidas',
      slug: 'adidas',
      description: 'Impossible is Nothing. Rendimiento y estilo deportivo.',
      icon: 'fas fa-running',
      image_url: 'assets/images/categories/adidas.jpg',
      sort_order: 2
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Jordan',
      slug: 'jordan',
      description: 'La leyenda continúa. Calzado icónico de baloncesto.',
      icon: 'fas fa-basketball-ball',
      image_url: 'assets/images/categories/jordan.jpg',
      sort_order: 3
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Puma',
      slug: 'puma',
      description: 'Forever Faster. Velocidad y estilo urbano.',
      icon: 'fas fa-cat',
      image_url: 'assets/images/categories/puma.jpg',
      sort_order: 4
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'New Balance',
      slug: 'new-balance',
      description: 'Comodidad y calidad clásica.',
      icon: 'fas fa-balance-scale',
      image_url: 'assets/images/categories/newbalance.jpg',
      sort_order: 5
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Vans',
      slug: 'vans',
      description: 'Off The Wall. Estilo skater y cultura juvenil.',
      icon: 'fas fa-skating',
      image_url: 'assets/images/categories/vans.jpg',
      sort_order: 6
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Converse',
      slug: 'converse',
      description: 'Chuck Taylor All Star y más.',
      icon: 'fas fa-star',
      image_url: 'assets/images/categories/converse.jpg',
      sort_order: 7
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Accesorios & Limpieza',
      slug: 'accesorios',
      description: 'Cordones, plantillas y productos de cuidado.',
      icon: 'fas fa-box-open',
      image_url: 'assets/images/categories/accessories.jpg',
      sort_order: 8
    }
  ]);
};
