#!/usr/bin/env node
/**
 * Entry point for FutureLabs Backend
 * Runs migrations before starting the server
 */

const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function start() {
  const environment = process.env.NODE_ENV || 'production';
  
  console.log('🚀 FutureLabs Backend Startup');
  console.log('📡 Environment:', environment);
  console.log('🔄 Running database migrations...');

  try {
    // Run migrations
    const { stdout, stderr } = await execPromise('npx knex migrate:latest', {
      env: { ...process.env, NODE_ENV: environment }
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error('Migration stderr:', stderr);
    
    console.log('✅ Migrations completed successfully');
    console.log('🟢 Starting server...');
    
    // Start the server
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Error during startup:', error.message);
    console.error('Migration output:', error.stdout);
    console.error('Migration error:', error.stderr);
    process.exit(1);
  }
}

start();

