const knex = require('knex');
const baseConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

// Build effective knex config
let knexConfig = baseConfig[environment] || {};

// If a DATABASE_URL is present, prefer it and add SSL options for providers like Railway
if (process.env.DATABASE_URL) {
  // Keep pool/migrations/etc if present in baseConfig, but replace connection
  knexConfig = {
    ...knexConfig,
    connection: process.env.DATABASE_URL,
    // Knex/pg accepts a connection string; some environments require PGSSLMODE=require,
    // but we also ensure SSL options when an object is used.
    // If you ever convert to object, include: ssl: { rejectUnauthorized: false }
  };
} else {
  // No DATABASE_URL — use the knexfile config as-is (fallback to DB_HOST/DB_* vars)
}

// DEBUG: print environment info (temporary — remove after debug)
console.log('--- DB DEBUG START ---');
console.log('NODE_ENV =', environment);
console.log('DATABASE_URL present =', !!process.env.DATABASE_URL);
console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_PORT =', process.env.DB_PORT);
console.log('DB_NAME =', process.env.DB_NAME);
console.log('PGSSLMODE =', process.env.PGSSLMODE);
console.log('--- DB DEBUG END ---');

const db = knex(knexConfig);

module.exports = db;
