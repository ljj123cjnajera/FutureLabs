const knex = require('knex');
const baseConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

// Log environment info first (for debugging - Railway safe)
console.log('--- DB Config Start ---');
console.log('NODE_ENV =', environment);
console.log('DATABASE_URL present =', !!process.env.DATABASE_URL);

// Build effective knex config
let knexConfig;

// If a DATABASE_URL is present, prefer it and add SSL options for providers like Railway
if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL to ensure SSL is configured properly for Railway
  const dbUrl = process.env.DATABASE_URL;
  
  // For Railway, we need to ensure SSL is enabled
  // Parse the URL and rebuild it with SSL parameters if needed
  let connectionString = dbUrl;
  
  // If the URL doesn't have sslmode parameter, add it for Railway
  if (!dbUrl.includes('sslmode=')) {
    const separator = dbUrl.includes('?') ? '&' : '?';
    connectionString = `${dbUrl}${separator}sslmode=require`;
  }
  
  // Get migrations/seeds from baseConfig but create fresh config
  const baseEnvConfig = baseConfig[environment] || {};
  
  // Create a completely new config object to avoid any conflicts
  knexConfig = {
    client: 'postgresql',
    connection: connectionString,
    migrations: baseEnvConfig.migrations || {},
    seeds: baseEnvConfig.seeds || {},
    pool: baseEnvConfig.pool || { min: 2, max: 10 }
  };
  
  // Log connection info
  const match = dbUrl.match(/^postgres:\/\/([^:]+):[^@]+@([^:]+):(\d+)\/(.+)$/);
  if (match) {
    console.log('DB Connection: postgres://' + match[1] + '@' + match[2] + ':' + match[3] + '/' + match[4]);
  }
  console.log('✅ Using DATABASE_URL for connection');
  console.log('Connection type: URL string');
} else {
  // No DATABASE_URL — use the knexfile config as-is (fallback to DB_HOST/DB_* vars)
  knexConfig = baseConfig[environment] || {};
  console.log('⚠️  WARNING: DATABASE_URL not found, using fallback config');
  console.log('DB_HOST =', process.env.DB_HOST || 'N/A');
  console.log('DB_NAME =', process.env.DB_NAME || 'N/A');
}

console.log('--- DB Config End ---');

const db = knex(knexConfig);

module.exports = db;
