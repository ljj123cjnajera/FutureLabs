exports.seed = async function (knex) {
  // Obtener el ID del admin
  const [admin] = await knex('users').where('email', 'admin@futurelabs.com');

  if (!admin) {
    console.log('Admin no encontrado, saltando seed de blog posts');
    return;
  }

  await knex('blog_posts').del();

  await knex('blog_posts').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Las 10 Zapatillas Más Esperadas de 2025',
      slug: 'zapatillas-mas-esperadas-2025',
      excerpt: 'Descubre los lanzamientos más hypeados que todo sneakerhead debe tener en su radar.',
      content: `
        <h2>Introducción</h2>
        <p>El 2025 promete ser un año increíble para la cultura sneaker. Con colaboraciones exclusivas y el regreso de siluetas clásicas.</p>
        
        <h2>Nike x Travis Scott</h2>
        <p>Los rumores indican una nueva silueta Jordan 1 Low con el swoosh invertido característico.</p>
        
        <h2>Adidas y el Regreso de Yeezy</h2>
        <p>A pesar de las controversias, nuevos modelos de Yeezy están programados para lanzarse este año.</p>
        
        <h2>Conclusión</h2>
        <p>Prepara tu cartera, porque este año viene cargado de heat.</p>
      `,
      featured_image: 'assets/images/blog/hype-sneakers.jpg',
      author_id: admin.id,
      status: 'published',
      views: 1250,
      meta_title: 'Las 10 Zapatillas Más Esperadas de 2025 | Sneakers Shop',
      meta_description: 'Descubre los lanzamientos más hypeados que todo sneakerhead debe tener en su radar.',
      meta_keywords: 'sneakers, lanzamientos, 2025, jordan, yeezy, nike',
      published_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Cómo Cuidar tus Sneakers: Guía Definitiva',
      slug: 'como-cuidar-tus-sneakers',
      excerpt: 'Mantén tus zapatillas frescas como el primer día con estos consejos de experto.',
      content: `
        <h2>Limpieza Básica</h2>
        <p>Usa un cepillo de cerdas suaves para eliminar el polvo superficial antes de aplicar cualquier líquido.</p>
        
        <h2>Materiales Delicados</h2>
        <p>Para gamuza y nubuck, evita el agua en exceso y usa borradores especiales.</p>
        
        <h2>Almacenamiento</h2>
        <p>Guarda tus pares en cajas de plástico transparente para evitar la oxidación y el polvo.</p>
      `,
      featured_image: 'assets/images/blog/cleaning-sneakers.jpg',
      author_id: admin.id,
      status: 'published',
      views: 890,
      meta_title: 'Cómo Cuidar tus Sneakers | Sneakers Shop',
      meta_description: 'Mantén tus zapatillas frescas como el primer día con estos consejos de experto.',
      meta_keywords: 'limpieza sneakers, cuidado zapatillas, crep protect, tutorial',
      published_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Historia del Air Jordan 1',
      slug: 'historia-air-jordan-1',
      excerpt: 'La zapatilla que cambió el juego para siempre. Repasamos la historia del icono.',
      content: `
        <h2>El Ban de la NBA</h2>
        <p>En 1985, la NBA prohibió las AJ1 "Bred" por violar las normas de uniformidad. Nike pagó las multas y creó una leyenda.</p>
        
        <h2>De la Cancha a la Calle</h2>
        <p>Lo que empezó como una zapatilla de performance se convirtió en el pilar de la moda urbana.</p>
      `,
      featured_image: 'assets/images/blog/jordan-history.jpg',
      author_id: admin.id,
      status: 'published',
      views: 654,
      meta_title: 'Historia del Air Jordan 1 | Sneakers Shop',
      meta_description: 'La zapatilla que cambió el juego para siempre. Repasamos la historia del icono.',
      meta_keywords: 'jordan 1, historia sneakers, michael jordan, nba, nike',
      published_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};





