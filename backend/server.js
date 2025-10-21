// Cargar dotenv solo en desarrollo/local para no sobrescribir variables de entorno en producción
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// (Si ya tienes require('dotenv').config({ path: __dirname + '/.env' });)
// reemplázalo por el bloque condicional anterior para evitar forzar valores locales en Railway.

// ... continuación normal de server.js
