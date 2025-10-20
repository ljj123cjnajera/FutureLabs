require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const slowDown = require('express-slow-down');

const app = express();
const PORT = process.env.PORT || 3000;

// Agrega esta línea para el proxy:
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS - Permite múltiples orígenes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ljj123cjnajera.github.io',
  'https://ljj123cjnajera.github.io/FutureLabs/',
  'http://localhost:8080'
].filter(Boolean); // Elimina valores undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origen (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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

app.use('/api/auth', authRoutes);
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 FutureLabs API corriendo en puerto ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
