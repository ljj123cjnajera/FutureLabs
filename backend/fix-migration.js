const db = require('./database/config');

async function fixMigration() {
  try {
    console.log('🔧 Fixing migration registry...');
    
    // Check if migration 003 exists in database
    const migration = await db('knex_migrations')
      .where('name', '003_create_verification_codes_table.js')
      .first();
    
    if (migration) {
      console.log('📝 Found old migration record:', migration);
      
      // Update the name to the new one
      await db('knex_migrations')
        .where('name', '003_create_verification_codes_table.js')
        .update({ name: '011_create_verification_codes_table.js' });
      
      console.log('✅ Migration record updated successfully');
    } else {
      console.log('ℹ️  No old migration record found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing migration:', error);
    process.exit(1);
  }
}

fixMigration();

