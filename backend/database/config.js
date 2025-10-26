const knex = require('knex');
const baseConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

// Build effective knex config
let knexConfig = baseConfig[environment] || {};

// If a DATABASE_URL is present, prefer it and add SSL options for providers like Railway
if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL to ensure SSL is configured properly for Railway
  const dbUrl = process.env.DATABASE_URL;
  
  // Check if URL needs SSL (for Railway/Heroku)
  // If PGSSLMODE is set, append it to the connection string
  let connectionString = dbUrl;
  if (process.env.PGSSLMODE && !dbUrl.includes('sslmode=')) {
    const separator = dbUrl.includes('?') ? '&' : '?';
    connectionString = `${dbUrl}${separator}sslmode=${process.env.PGSSLMODE}`;
  }
  
  // Keep pool/migrations/etc if present in baseConfig, but replace connection
  knexConfig = {
    ...knexConfig,
    connection: connectionString,
  };
} else {
  // No DATABASE_URL — use the knexfile config as-is (fallback to DB_HOST/DB_* vars)
  console.log('⚠️  WARNING: DATABASE_URL not found, using fallback config');
}

// Log environment info (for debugging - Railway safe)
console.log('--- DB Config ---');
console.log('NODE_ENV =', environment);
console.log('DATABASE_URL present =', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  // Don't log the full URL for security, just show it exists
  const url = process.env.DATABASE_URL;
  const match = url.match(/^postgres:\/\/([^:]+):[^@]+@([^:]+):(\d+)\/(.+)$/);
  if (match) {
    console.log('DB Connection: postgres://' + match[1] + '@' + match[2] + ':' + match[3] + '/' + match[4]);
  }
} else {
  console.log('DB_HOST =', process.env.DB_HOST || 'N/A');
  console.log('DB_NAME =', process.env.DB_NAME || 'N/A');
}
console.log('--- DB Config End ---');

const db = knex(knexConfig);

module.exports = db;
