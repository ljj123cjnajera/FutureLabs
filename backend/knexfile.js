// Only load dotenv in development to avoid overriding Railway env vars
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/*
  Knex configuration
  - In production prefer DATABASE_URL (Railway/Heroku style).
  - If DATABASE_URL is present, Knex/pg will use it.
  - When using object connection in production enable ssl.rejectUnauthorized:false
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
    // Always parse DATABASE_URL to add SSL options
    connection: (function() {
      // If DATABASE_URL is present, parse it and add SSL
      if (process.env.DATABASE_URL) {
        const { URL } = require('url');
        try {
          const url = new URL(process.env.DATABASE_URL);
          return {
            host: url.hostname,
            port: parseInt(url.port || '5432', 10),
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            ssl: { rejectUnauthorized: false }
          };
        } catch (error) {
          // If parsing fails, fall back to original
          return process.env.DATABASE_URL;
        }
      }
      // Use individual variables as fallback
      return {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
      };
    })(),
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
