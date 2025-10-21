require('dotenv').config();

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
    // Prefer DATABASE_URL string if available (Railway/Heroku)
    connection: process.env.DATABASE_URL
      ? process.env.DATABASE_URL
      : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
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
