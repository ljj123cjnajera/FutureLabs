/**
 * Script de diagnóstico de base de datos
 * Verifica conexión, estructura de tablas y migraciones
 */

require('dotenv').config();
const db = require('../database/config');

async function diagnoseDatabase() {
  console.log('🔍 Iniciando diagnóstico de base de datos...\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión...');
    try {
      await db.raw('SELECT 1');
      console.log('✅ Conexión a la base de datos exitosa\n');
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
      console.error('   Stack:', error.stack);
      process.exit(1);
    }

    // 2. Verificar migraciones ejecutadas
    console.log('2️⃣ Verificando migraciones ejecutadas...');
    try {
      const migrations = await db('knex_migrations')
        .select('name', 'batch', 'migration_time')
        .orderBy('migration_time', 'desc');
      
      console.log(`   Total de migraciones ejecutadas: ${migrations.length}`);
      if (migrations.length > 0) {
        console.log('   Últimas 5 migraciones:');
        migrations.slice(0, 5).forEach(m => {
          console.log(`   - ${m.name} (batch ${m.batch})`);
        });
      }
      console.log('');
    } catch (error) {
      console.error('❌ Error verificando migraciones:', error.message);
      console.log('   (Puede ser que la tabla knex_migrations no exista)\n');
    }

    // 3. Verificar estructura de tabla products
    console.log('3️⃣ Verificando estructura de tabla products...');
    try {
      const columns = await db('products').columnInfo();
      console.log('   Columnas encontradas:');
      Object.keys(columns).forEach(col => {
        const colInfo = columns[col];
        console.log(`   - ${col}: ${colInfo.type} (nullable: ${colInfo.nullable})`);
      });
      console.log('');

      // Verificar columnas esperadas
      const expectedColumns = [
        'id', 'name', 'slug', 'description', 'price', 'discount_price',
        'brand', 'sku', 'stock_quantity', 'image_url', 'images',
        'specifications', 'rating', 'review_count', 'featured', 'is_active',
        'category_id', 'created_at', 'updated_at'
      ];
      
      const optionalColumns = ['is_new', 'is_trending', 'is_bestseller', 'view_count'];
      
      const missingRequired = expectedColumns.filter(col => !columns[col]);
      const missingOptional = optionalColumns.filter(col => !columns[col]);
      
      if (missingRequired.length > 0) {
        console.log('   ⚠️  Columnas requeridas faltantes:');
        missingRequired.forEach(col => console.log(`   - ${col}`));
        console.log('');
      }
      
      if (missingOptional.length > 0) {
        console.log('   ℹ️  Columnas opcionales faltantes (pueden agregarse con migraciones):');
        missingOptional.forEach(col => console.log(`   - ${col}`));
        console.log('');
      }
    } catch (error) {
      console.error('❌ Error verificando estructura de products:', error.message);
      console.log('   (Puede ser que la tabla products no exista)\n');
    }

    // 4. Verificar datos en products
    console.log('4️⃣ Verificando datos en products...');
    try {
      const productCount = await db('products').count('id as count').first();
      console.log(`   Total de productos: ${productCount.count}`);
      
      const activeCount = await db('products').where('is_active', true).count('id as count').first();
      console.log(`   Productos activos: ${activeCount.count}`);
      
      const withImages = await db('products')
        .whereNotNull('image_url')
        .count('id as count')
        .first();
      console.log(`   Productos con imagen: ${withImages.count}`);
      
      const brands = await db('products')
        .select('brand')
        .groupBy('brand')
        .count('id as count');
      console.log(`   Marcas encontradas: ${brands.length}`);
      brands.forEach(b => console.log(`   - ${b.brand}: ${b.count} productos`));
      console.log('');
    } catch (error) {
      console.error('❌ Error verificando datos:', error.message);
      console.log('');
    }

    // 5. Verificar tabla categories
    console.log('5️⃣ Verificando tabla categories...');
    try {
      const categoryCount = await db('categories').count('id as count').first();
      console.log(`   Total de categorías: ${categoryCount.count}`);
      
      const categories = await db('categories')
        .select('name', 'slug')
        .limit(10);
      if (categories.length > 0) {
        console.log('   Categorías:');
        categories.forEach(c => console.log(`   - ${c.name} (${c.slug})`));
      }
      console.log('');
    } catch (error) {
      console.error('❌ Error verificando categories:', error.message);
      console.log('');
    }

    // 6. Verificar índices
    console.log('6️⃣ Verificando índices en products...');
    try {
      const indexes = await db.raw(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'products'
        ORDER BY indexname;
      `);
      
      if (indexes.rows && indexes.rows.length > 0) {
        console.log(`   Índices encontrados: ${indexes.rows.length}`);
        indexes.rows.forEach(idx => {
          console.log(`   - ${idx.indexname}`);
        });
      } else {
        console.log('   ⚠️  No se encontraron índices');
      }
      console.log('');
    } catch (error) {
      console.error('❌ Error verificando índices:', error.message);
      console.log('');
    }

    // 7. Test de query simple
    console.log('7️⃣ Probando query simple...');
    try {
      const start = Date.now();
      const products = await db('products')
        .select('id', 'name', 'brand')
        .where('is_active', true)
        .limit(5)
        .timeout(10000);
      const duration = Date.now() - start;
      console.log(`   ✅ Query exitosa en ${duration}ms`);
      console.log(`   Productos encontrados: ${products.length}`);
      if (products.length > 0) {
        console.log('   Ejemplos:');
        products.forEach(p => console.log(`   - ${p.name} (${p.brand})`));
      }
      console.log('');
    } catch (error) {
      console.error('❌ Error en query de prueba:', error.message);
      console.log('');
    }

    // 8. Verificar pool de conexiones
    console.log('8️⃣ Verificando pool de conexiones...');
    try {
      const poolInfo = await db.client.pool;
      if (poolInfo) {
        console.log(`   Pool configurado: min=${poolInfo.min}, max=${poolInfo.max}`);
        console.log(`   Conexiones activas: ${poolInfo.numUsed() || 0}`);
        console.log(`   Conexiones libres: ${poolInfo.numFree() || 0}`);
        console.log(`   Total: ${poolInfo.numUsed() + poolInfo.numFree() || 0}`);
      }
      console.log('');
    } catch (error) {
      console.log('   ⚠️  No se pudo obtener información del pool');
      console.log('');
    }

    console.log('✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error fatal en diagnóstico:', error);
    process.exit(1);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

diagnoseDatabase();
