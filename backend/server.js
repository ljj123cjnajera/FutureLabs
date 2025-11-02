// Cargar dotenv solo en desarrollo/local para no sobrescribir variables de entorno en producción
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Force redeploy marker

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const slowDown = require('express-slow-down');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const db = require('./database/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio uploads creado');
}

// Auto-run seeds if products table is empty
async function ensureDataSeeded() {
  try {
    console.log('🔍 Checking if products exist...');
    // Check if products table has any data
    const products = await db('products').select('id').limit(1);
    console.log(`📊 Products found: ${products.length}`);
    
    if (products.length === 0) {
      console.log('📦 Products table is empty, running seeds...');
      const { execSync } = require('child_process');
      // Use absolute path to knexfile.js
      execSync('npx knex seed:run --knexfile=./knexfile.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Seeds completed');
    } else {
      console.log('✅ Products already exist, skipping seeds');
    }
  } catch (error) {
    console.log('⚠️  Could not check/seed products:', error.message);
    console.log('⚠️  Error stack:', error.stack);
  }
}

// Agrega esta línea para el proxy:
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS - Permite múltiples orígenes (GitHub Pages + localhost)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ljj123cjnajera.github.io',
  'https://ljj123cjnajera.github.io/FutureLabs',
  'https://ljj123cjnajera.github.io/FutureLabs/',
  'http://localhost:8080',
  'http://localhost:3000'
].filter(Boolean); // Elimina valores undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origen (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log para debugging pero permitir en desarrollo
      console.log('⚠️ CORS: Origin not allowed:', origin);
      if (process.env.NODE_ENV === 'development') {
        callback(null, true); // Permitir en desarrollo
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Compresión
app.use(compression());

// Rate limiting
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 100,
  delayMs: () => 500,
  validate: { delayMs: false }
});
app.use(speedLimiter);

// Logging
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'FutureLabs API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verification');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const couponsRoutes = require('./routes/coupons');
const wishlistRoutes = require('./routes/wishlist');
const usersRoutes = require('./routes/users');
const passwordRecoveryRoutes = require('./routes/password-recovery');
const blogRoutes = require('./routes/blog');
const relatedProductsRoutes = require('./routes/related-products');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const reportsRoutes = require('./routes/reports');
const loyaltyRoutes = require('./routes/loyalty');
const chatRoutes = require('./routes/chat');
const addressesRoutes = require('./routes/addresses');

// Servir archivos estáticos (imágenes subidas) - usar ruta absoluta
// Agregar headers CORS y CORP para permitir acceso a imágenes
app.use('/uploads', (req, res, next) => {
  // Permitir acceso a imágenes desde cualquier origen
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/password-recovery', passwordRecoveryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/related-products', relatedProductsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/addresses', addressesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor después de que las seeds se ejecuten
ensureDataSeeded()
  .then(() => {
    console.log('✅ Seed check completed, starting server...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FutureLabs API corriendo en puerto ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Escuchando en 0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.log('⚠️  Seed check failed:', error.message);
    console.log('⚠️  Starting server anyway...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 FutureLabs API corriendo en puerto ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Escuchando en 0.0.0.0:${PORT}`);
    });
  });
