exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();
  
  // Inserts seed entries
  await knex('categories').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Laptops & Cómputo',
      slug: 'laptops',
      description: 'Laptops, computadoras de escritorio y accesorios',
      icon: 'fas fa-laptop',
      image_url: 'assets/images/categories/laptops.jpg',
      sort_order: 1
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Celulares & Wearables',
      slug: 'celulares',
      description: 'Smartphones, smartwatches y dispositivos portátiles',
      icon: 'fas fa-mobile-alt',
      image_url: 'assets/images/categories/celulares.jpg',
      sort_order: 2
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Gaming',
      slug: 'gaming',
      description: 'Consolas, periféricos gaming y accesorios',
      icon: 'fas fa-gamepad',
      image_url: 'assets/images/categories/gaming.jpg',
      sort_order: 3
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Smart Home',
      slug: 'smart-home',
      description: 'Dispositivos inteligentes para el hogar',
      icon: 'fas fa-home',
      image_url: 'assets/images/categories/smart-home.jpg',
      sort_order: 4
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Audio & Video',
      slug: 'audio-video',
      description: 'Audífonos, altavoces y equipos de video',
      icon: 'fas fa-headphones',
      image_url: 'assets/images/categories/audio.jpg',
      sort_order: 5
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Drones & Cámaras',
      slug: 'drones',
      description: 'Drones, cámaras y equipo fotográfico',
      icon: 'fas fa-camera',
      image_url: 'assets/images/categories/drones.jpg',
      sort_order: 6
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Movilidad Eléctrica',
      slug: 'movilidad',
      description: 'Bicicletas eléctricas, scooters y patinetas',
      icon: 'fas fa-bicycle',
      image_url: 'assets/images/categories/movilidad.jpg',
      sort_order: 7
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Accesorios Tech',
      slug: 'accesorios',
      description: 'Fundas, cargadores, cables y más',
      icon: 'fas fa-plug',
      image_url: 'assets/images/categories/accesorios.jpg',
      sort_order: 8
    }
  ]);
};
