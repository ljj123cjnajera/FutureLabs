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

// Log environment info (production-safe)
if (process.env.NODE_ENV === 'development') {
  console.log('--- DB Config ---');
  console.log('NODE_ENV =', environment);
  console.log('DATABASE_URL present =', !!process.env.DATABASE_URL);
  console.log('DB_HOST =', process.env.DB_HOST || 'N/A');
  console.log('--- DB Config End ---');
}

const db = knex(knexConfig);

module.exports = db;
