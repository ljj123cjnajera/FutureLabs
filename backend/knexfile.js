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
    connection: (function () {
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
      min: 0, // Empezar sin conexiones para evitar bloqueo al inicio
      max: 5, // Aumentar máximo pero con mejor manejo
      acquireTimeoutMillis: 5000, // Reducir timeout a 5s (fallar muy rápido)
      createTimeoutMillis: 3000, // Timeout de creación muy corto
      idleTimeoutMillis: 10000, // Liberar conexiones idle muy rápido
      reapIntervalMillis: 1000,
      propagateCreateError: false,
      // Agregar configuración adicional para mejor manejo de errores
      afterCreate: function(conn, done) {
        // Manejar errores de conexión para evitar conexiones zombie
        conn.on('error', function(err) {
          console.log('⚠️ Database connection error:', err.message);
          if (conn && !conn._ending) {
            try {
              conn.end();
            } catch (e) {
              // Ignorar errores al cerrar conexión con error
            }
          }
        });
        
        done(null, conn);
      },
      // Destruir conexiones correctamente
      destroy: function(client) {
        if (client && !client._ending) {
          try {
            return client.end();
          } catch (e) {
            // Ignorar errores al destruir
            return Promise.resolve();
          }
        }
        return Promise.resolve();
      }
    }
  }
};
