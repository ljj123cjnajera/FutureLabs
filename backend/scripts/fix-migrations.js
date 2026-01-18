/**
 * Script para limpiar migraciones huérfanas y corregir problemas de migraciones
 */

// Cargar dotenv solo si está disponible
try {
  require('dotenv').config();
} catch (e) {
  // dotenv no disponible, usar variables de entorno del sistema
}

const db = require('../database/config');

async function fixMigrations() {
  console.log('🔧 Corrigiendo migraciones...\n');

  try {
    // 1. Limpiar migración huérfana del blog
    console.log('1️⃣ Limpiando migración huérfana del blog...');
    try {
      const orphanMigration = await db('knex_migrations')
        .where('name', '010_create_blog_posts_table.js')
        .first();
      
      if (orphanMigration) {
        console.log('   Encontrada migración huérfana, eliminando...');
        await db('knex_migrations')
          .where('name', '010_create_blog_posts_table.js')
          .del();
        console.log('   ✅ Migración huérfana eliminada\n');
      } else {
        console.log('   ℹ️  No se encontró migración huérfana\n');
      }
    } catch (error) {
      console.log('   ⚠️  Error al limpiar migración huérfana:', error.message);
      console.log('   (Continuando...)\n');
    }

    // 2. Verificar estado de migraciones
    console.log('2️⃣ Verificando estado de migraciones...');
    const migrations = await db('knex_migrations')
      .select('name', 'batch')
      .orderBy('migration_time', 'desc');
    
    console.log(`   Total de migraciones ejecutadas: ${migrations.length}`);
    
    // Verificar si falta la migración 027_add_product_flags
    const hasProductFlags = migrations.some(m => m.name === '027_add_product_flags.js');
    if (!hasProductFlags) {
      console.log('   ⚠️  Falta la migración 027_add_product_flags.js');
      console.log('   Ejecuta: npm run migrate\n');
    } else {
      console.log('   ✅ Migración 027_add_product_flags.js encontrada\n');
    }

    console.log('✅ Corrección de migraciones completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

fixMigrations();
