const knex = require('knex');
const baseConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

// Log environment info first (for debugging - Railway safe)
console.log('--- DB Config Start ---');
console.log('NODE_ENV =', environment);
console.log('DATABASE_URL present =', !!process.env.DATABASE_URL);

// Build effective knex config
let knexConfig;

// Check if DATABASE_URL is a placeholder (Railway sometimes shows placeholders)
const dbUrl = process.env.DATABASE_URL;
const isPlaceholder = dbUrl && (
  dbUrl.includes('<USER>') || 
  dbUrl.includes('<PASSWORD>') || 
  dbUrl.includes('<HOST>') || 
  dbUrl.includes('<DBNAME>')
);

// If DATABASE_URL is present and not a placeholder, prefer it
if (dbUrl && !isPlaceholder) {
  try {
    // Use URL module to parse the connection string
    const url = new URL(dbUrl);
    
    // Extract components
    const host = url.hostname;
    const port = parseInt(url.port || '5432', 10);
    const user = url.username;
    const password = url.password;
    // Database name is the pathname without leading slash
    const database = url.pathname.slice(1) || url.pathname.substring(1);
    
    // Get migrations/seeds from baseConfig but create fresh config
    const baseEnvConfig = baseConfig[environment] || {};
    
    // Create connection object with SSL for Railway
    const connectionObj = {
      host: host,
      port: port,
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
  } catch (error) {
    // If URL parsing fails, fall through to individual variables
    console.log('⚠️  Could not parse DATABASE_URL:', error.message);
    console.log('Falling back to individual DB variables');
  }
}

// Use individual DB variables if DATABASE_URL is not available or is a placeholder
// BUT only if all required variables are present
if (!knexConfig && (isPlaceholder || process.env.DB_HOST)) {
  // Check if all required DB variables are present
  const hasAllVars = process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD;
  
  if (hasAllVars) {
    const baseEnvConfig = baseConfig[environment] || {};
    
    knexConfig = {
      client: 'postgresql',
      connection: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
      },
      migrations: baseEnvConfig.migrations || {},
      seeds: baseEnvConfig.seeds || {},
      pool: baseEnvConfig.pool || { min: 2, max: 10 }
    };
    
    console.log('✅ Using individual DB variables for connection');
    console.log('DB_HOST =', process.env.DB_HOST);
    console.log('DB_NAME =', process.env.DB_NAME);
    console.log('DB_USER =', process.env.DB_USER);
  } else {
    console.log('⚠️  DATABASE_URL is placeholder but individual DB variables are missing');
    console.log('DB_HOST =', process.env.DB_HOST || 'N/A');
    console.log('DB_NAME =', process.env.DB_NAME || 'N/A');
    console.log('DB_USER =', process.env.DB_USER || 'N/A');
    console.log('DB_PASSWORD =', process.env.DB_PASSWORD ? '***' : 'N/A');
  }
}

// Final fallback: use knexfile config
if (!knexConfig) {
  knexConfig = baseConfig[environment] || {};
  console.log('⚠️  WARNING: No database configuration found, using knexfile fallback');
  console.log('DB_HOST =', process.env.DB_HOST || 'N/A');
  console.log('DB_NAME =', process.env.DB_NAME || 'N/A');
}

console.log('--- DB Config End ---');

const db = knex(knexConfig);

module.exports = db;
