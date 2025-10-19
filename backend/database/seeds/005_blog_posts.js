exports.seed = async function(knex) {
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
      title: 'Las Mejores Tecnologías de 2025',
      slug: 'mejores-tecnologias-2025',
      excerpt: 'Descubre las tecnologías más innovadoras que están revolucionando el mundo en 2025.',
      content: `
        <h2>Introducción</h2>
        <p>El año 2025 está siendo testigo de avances tecnológicos sin precedentes. Desde inteligencia artificial hasta realidad aumentada, las tecnologías emergentes están transformando la forma en que vivimos, trabajamos y nos relacionamos.</p>
        
        <h2>Inteligencia Artificial</h2>
        <p>La IA ha alcanzado nuevos niveles de sofisticación, con modelos de lenguaje que pueden realizar tareas complejas y asistir en la toma de decisiones empresariales.</p>
        
        <h2>Realidad Aumentada</h2>
        <p>AR está revolucionando la experiencia de compra, permitiendo a los clientes visualizar productos en sus hogares antes de comprarlos.</p>
        
        <h2>Conclusión</h2>
        <p>Estas tecnologías no solo están cambiando el presente, sino que están moldeando el futuro de la humanidad.</p>
      `,
      featured_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
      author_id: admin.id,
      status: 'published',
      views: 1250,
      meta_title: 'Las Mejores Tecnologías de 2025 | FutureLabs',
      meta_description: 'Descubre las tecnologías más innovadoras que están revolucionando el mundo en 2025.',
      meta_keywords: 'tecnología, IA, realidad aumentada, innovación, 2025',
      published_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Cómo Elegir el Smartphone Perfecto',
      slug: 'como-elegir-smartphone-perfecto',
      excerpt: 'Guía completa para elegir el smartphone que mejor se adapte a tus necesidades.',
      content: `
        <h2>Factores a Considerar</h2>
        <p>Elegir el smartphone perfecto puede ser abrumador con tantas opciones disponibles. Aquí te ayudamos a tomar la mejor decisión.</p>
        
        <h2>Presupuesto</h2>
        <p>El primer paso es establecer un presupuesto. Los smartphones van desde modelos económicos hasta dispositivos premium.</p>
        
        <h2>Uso Principal</h2>
        <p>¿Lo usarás principalmente para fotografía, gaming, trabajo o comunicación? Cada uso tiene diferentes requisitos.</p>
        
        <h2>Características Importantes</h2>
        <ul>
          <li>Procesador y RAM</li>
          <li>Cámara</li>
          <li>Batería</li>
          <li>Almacenamiento</li>
          <li>Pantalla</li>
        </ul>
        
        <h2>Conclusión</h2>
        <p>No existe un smartphone perfecto para todos, pero con esta guía encontrarás el ideal para ti.</p>
      `,
      featured_image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      author_id: admin.id,
      status: 'published',
      views: 890,
      meta_title: 'Cómo Elegir el Smartphone Perfecto | FutureLabs',
      meta_description: 'Guía completa para elegir el smartphone que mejor se adapte a tus necesidades.',
      meta_keywords: 'smartphone, móvil, guía, compra, tecnología',
      published_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'El Futuro de los Hogares Inteligentes',
      slug: 'futuro-hogares-inteligentes',
      excerpt: 'Explora cómo la tecnología está transformando nuestros hogares en espacios más inteligentes y eficientes.',
      content: `
        <h2>Introducción</h2>
        <p>Los hogares inteligentes ya no son ciencia ficción. Con dispositivos IoT y asistentes virtuales, podemos controlar cada aspecto de nuestro hogar.</p>
        
        <h2>Dispositivos Principales</h2>
        <p>Desde termostatos inteligentes hasta sistemas de seguridad avanzados, los dispositivos smart home están cambiando la forma en que vivimos.</p>
        
        <h2>Beneficios</h2>
        <ul>
          <li>Ahorro de energía</li>
          <li>Mayor seguridad</li>
          <li>Comodidad</li>
          <li>Control remoto</li>
        </ul>
        
        <h2>El Futuro</h2>
        <p>Con el avance de la IA y el 5G, los hogares inteligentes serán aún más intuitivos y eficientes.</p>
      `,
      featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      author_id: admin.id,
      status: 'published',
      views: 654,
      meta_title: 'El Futuro de los Hogares Inteligentes | FutureLabs',
      meta_description: 'Explora cómo la tecnología está transformando nuestros hogares en espacios más inteligentes y eficientes.',
      meta_keywords: 'hogar inteligente, IoT, domótica, tecnología, futuro',
      published_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};





