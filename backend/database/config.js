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
  // Parse DATABASE_URL manually to ensure it works correctly with Knex
  const dbUrl = process.env.DATABASE_URL;
  
  // Parse the PostgreSQL URL manually
  // Format: postgres://user:password@host:port/database
  const urlMatch = dbUrl.match(/^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
  
  if (urlMatch) {
    const [, user, password, host, port, database] = urlMatch;
    
    // Get migrations/seeds from baseConfig but create fresh config
    const baseEnvConfig = baseConfig[environment] || {};
    
    // Create connection object with SSL for Railway
    const connectionObj = {
      host: host,
      port: parseInt(port, 10),
      user: user,
      password: password,
      database: database,
      ssl: { rejectUnauthorized: false }
    };
    
    // Create a completely new config object to avoid any conflicts
    knexConfig = {
      client: 'postgresql',
      connection: connectionObj,
      migrations: baseEnvConfig.migrations || {},
      seeds: baseEnvConfig.seeds || {},
      pool: baseEnvConfig.pool || { min: 2, max: 10 }
    };
    
    // Log connection info (safe - no password)
    console.log('DB Connection: postgres://' + user + '@' + host + ':' + port + '/' + database);
    console.log('✅ Using DATABASE_URL for connection (parsed as object)');
  } else {
    // Fallback: use URL string if parsing fails
    console.log('⚠️  Could not parse DATABASE_URL, using as string');
    const baseEnvConfig = baseConfig[environment] || {};
    knexConfig = {
      client: 'postgresql',
      connection: dbUrl,
      migrations: baseEnvConfig.migrations || {},
      seeds: baseEnvConfig.seeds || {},
      pool: baseEnvConfig.pool || { min: 2, max: 10 }
    };
  }
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
