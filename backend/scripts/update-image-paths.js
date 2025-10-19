// Script para actualizar las rutas de las imágenes en la base de datos
const knex = require('../database/config');

async function updateImagePaths() {
    try {
        console.log('🔄 Actualizando rutas de imágenes...');
        
        // Obtener todos los productos
        const products = await knex('products').select('id', 'image_url', 'images');
        
        console.log(`📦 Encontrados ${products.length} productos`);
        
        for (const product of products) {
            // Actualizar image_url
            if (product.image_url) {
                const newImageUrl = product.image_url.replace('.jpg', '.svg');
                await knex('products')
                    .where('id', product.id)
                    .update({ image_url: newImageUrl });
                console.log(`✓ Actualizado image_url para producto ${product.id}`);
            }
            
            // Actualizar images array
            if (product.images && Array.isArray(product.images)) {
                const newImages = product.images.map(img => img.replace('.jpg', '.svg'));
                await knex('products')
                    .where('id', product.id)
                    .update({ images: JSON.stringify(newImages) });
                console.log(`✓ Actualizado images array para producto ${product.id}`);
            }
        }
        
        console.log('✅ Rutas de imágenes actualizadas correctamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al actualizar rutas de imágenes:', error);
        process.exit(1);
    }
}

updateImagePaths();


