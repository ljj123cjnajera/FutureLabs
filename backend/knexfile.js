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
      min: 1, // Mantener al menos 1 conexión para evitar creación constante
      max: 3, // Reducir máximo para evitar saturación
      acquireTimeoutMillis: 10000, // Reducir timeout a 10s (fallar rápido)
      createTimeoutMillis: 5000, // Timeout de creación más corto
      idleTimeoutMillis: 20000, // Liberar conexiones idle más rápido
      reapIntervalMillis: 1000,
      propagateCreateError: false,
      // Agregar configuración adicional para mejor manejo de errores
      afterCreate: function(conn, done) {
        // Manejar errores de conexión para evitar conexiones zombie
        conn.on('error', function(err) {
          console.log('⚠️ Database connection error:', err.message);
          // Cerrar la conexión si hay error
          if (conn && !conn._ending) {
            conn.end();
          }
        });
        
        // Timeout de conexión para evitar conexiones colgadas
        const timeout = setTimeout(() => {
          if (conn && !conn._ending) {
            console.log('⚠️ Connection timeout, closing...');
            conn.end();
          }
        }, 30000);
        
        conn.on('end', () => {
          clearTimeout(timeout);
        });
        
        done(null, conn);
      },
      // Destruir conexiones correctamente
      destroy: function(client) {
        if (client && !client._ending) {
          return client.end();
        }
      }
    }
  }
};
