require('dotenv').config();

/*
  Knex configuration
  - In production prefer DATABASE_URL (Railway/Heroku style).
  - If DATABASE_URL is present, Knex/pg will use it. For providers that require TLS
    we set PGSSLMODE=require in env or provide ssl options when using an object connection.
*/

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'futurelabs',
      user: process.env.DB_USER || 'luis',
      password: process.env.DB_PASSWORD || ''
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  },

  production: {
    client: 'postgresql',
    // Prefer a single DATABASE_URL in production (Railway/Heroku)
    // Fallback to explicit DB_HOST/DB_PORT/... when DATABASE_URL is not set.
    connection: process.env.DATABASE_URL ? process.env.DATABASE_URL : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // When connecting directly with object config, enable SSL and accept
      // the provider's self-signed certs (rejectUnauthorized:false).
      // If using DATABASE_URL string, set PGSSLMODE=require in Railway env.
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
