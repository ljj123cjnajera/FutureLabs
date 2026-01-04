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

// Auto-run seeds if products table is empty (DESHABILITADO - causan bloqueo del pool)
async function ensureDataSeeded() {
  // DESHABILITADO: Los seeds están bloqueando el pool de conexiones
  // Ejecutar seeds manualmente cuando sea necesario
  console.log('⚠️  Seeds disabled at startup to prevent pool blocking');
  console.log('⚠️  Run seeds manually: npx knex seed:run');
  return;
  
  /* CÓDIGO COMENTADO - Deshabilitado para evitar bloqueo del pool
  try {
    console.log('🔍 Checking if products exist...');
    
    const checkPromise = db('products').select('id').limit(1).timeout(5000);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    );
    
    const products = await Promise.race([checkPromise, timeoutPromise]);
    console.log(`📊 Products found: ${products.length}`);

    if (products.length === 0) {
      console.log('📦 Products table is empty, running seeds...');
      const { execSync } = require('child_process');
      execSync('npx knex seed:run --knexfile=./knexfile.js', {
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: 20000
      });
      console.log('✅ Seeds completed');
    } else {
      console.log('✅ Products already exist, skipping seeds');
    }
  } catch (error) {
    console.log('⚠️  Could not check/seed products:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Error stack:', error.stack);
    }
  }
  */
}

// Agrega esta línea para el proxy:
app.set('trust proxy', 1);

// CORS - DEBE IR ANTES DE HELMET para que funcione correctamente
// CORS - Permite múltiples orígenes (GitHub Pages + localhost)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ljj123cjnajera.github.io',
  'https://ljj123cjnajera.github.io/FutureLabs',
  'https://ljj123cjnajera.github.io/FutureLabs/',
  'http://localhost:8080',
  'http://localhost:3000'
].filter(Boolean); // Elimina valores undefined/null

// Función para verificar si el origen está permitido
function isOriginAllowed(origin) {
  if (!origin) return true; // Permite requests sin origen
  
  // Verificar lista exacta
  if (allowedOrigins.indexOf(origin) !== -1) {
    return true;
  }
  
  // Permitir cualquier subdominio de github.io
  if (origin && origin.includes('.github.io')) {
    return true;
  }
  
  // Permitir localhost en cualquier puerto
  if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
    return true;
  }
  
  return false;
}

// Middleware CORS personalizado - MANEJA EXPLÍCITAMENTE PREFLIGHT
// CRÍTICO: Debe estar ANTES de cualquier otro middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // SIEMPRE establecer headers CORS (incluso si no hay origin)
  // Esto es crítico para que funcione con GitHub Pages
  if (!origin || isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-CSRF-Token');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    res.header('Access-Control-Max-Age', '86400');
  }
  
  // Manejar peticiones OPTIONS (preflight) explícitamente - RESPONDER INMEDIATAMENTE
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Cambiar a 200 para mejor compatibilidad
  }
  
  next();
});

// También usar el middleware cors de la librería como respaldo
app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS: Origin not allowed:', origin);
      // En producción, permitir GitHub Pages incluso si no está en la lista exacta
      if (process.env.NODE_ENV === 'production' && origin && origin.includes('github.io')) {
        callback(null, true);
      } else if (process.env.NODE_ENV === 'development') {
        callback(null, true); // Permitir en desarrollo
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight por 24 horas
}));

// Middleware de seguridad (después de CORS)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
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
const adminPaymentsRoutes = require('./routes/admin-payments');
const couponsRoutes = require('./routes/coupons');
const wishlistRoutes = require('./routes/wishlist');
const usersRoutes = require('./routes/users');
const passwordRecoveryRoutes = require('./routes/password-recovery');
const relatedProductsRoutes = require('./routes/related-products');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const reportsRoutes = require('./routes/reports');
const loyaltyRoutes = require('./routes/loyalty');
const chatRoutes = require('./routes/chat');
const addressesRoutes = require('./routes/addresses');
const homeContentRoutes = require('./routes/home-content');

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

// 🚀 SERVIR FRONTEND EN PRODUCCIÓN (Docker/Railway)
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Configurando servicio de archivos estáticos para Frontend');
  app.use('/css', express.static(path.join(__dirname, 'css')));
  app.use('/js', express.static(path.join(__dirname, 'js')));
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
  app.use('/', express.static(path.join(__dirname), { index: 'index.html' }));
}

app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/password-recovery', passwordRecoveryRoutes);
app.use('/api/related-products', relatedProductsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/home-content', homeContentRoutes);

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

// Ejecutar migraciones de forma asíncrona (DESHABILITADO - causan bloqueo del pool)
async function runMigrations() {
  // DESHABILITADO: Las migraciones están bloqueando el pool de conexiones
  // Ejecutar migraciones manualmente cuando sea necesario
  console.log('⚠️  Migrations disabled at startup to prevent pool blocking');
  console.log('⚠️  Run migrations manually: npx knex migrate:latest');
  return;
  
  /* CÓDIGO COMENTADO - Deshabilitado para evitar bloqueo del pool
  try {
    console.log('🔄 Running database migrations...');
    const { execSync } = require('child_process');
    execSync('npx knex migrate:latest', {
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 20000
    });
    console.log('✅ Migrations completed');
  } catch (error) {
    console.log('⚠️  Migrations failed:', error.message);
    console.log('⚠️  Server will continue without migrations');
  }
  */
}

// Iniciar servidor inmediatamente (sin esperar migraciones)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FutureLabs API corriendo en puerto ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Escuchando en 0.0.0.0:${PORT}`);
  
  // Ejecutar migraciones en background después de iniciar
  runMigrations().catch(err => {
    console.log('⚠️  Migration error:', err.message);
  });
  
  // Ejecutar seed check después de iniciar
  ensureDataSeeded().catch(err => {
    console.log('⚠️  Seed check error:', err.message);
  });
});
