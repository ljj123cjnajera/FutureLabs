# 🚀 FutureLabs Backend API

Backend API para la tienda online FutureLabs.

## 📋 Requisitos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `env.example` y renómbralo a `.env`:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=futurelabs
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secret_super_seguro
```

### 3. Crear base de datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE futurelabs;
\q
```

### 4. Ejecutar migraciones

```bash
npm run migrate
```

### 5. Ejecutar seeds (datos de prueba)

```bash
npm run seed
```

### 6. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints

### Health Check
- `GET /health` - Estado del servidor

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Categorías
- `GET /api/categories` - Listar categorías

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual

### Carrito
- `GET /api/cart` - Obtener carrito
- `POST /api/cart/add` - Agregar al carrito
- `PUT /api/cart/update` - Actualizar cantidad
- `DELETE /api/cart/remove` - Eliminar del carrito
- `DELETE /api/cart/clear` - Limpiar carrito

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `GET /api/orders/:id` - Obtener pedido

### Pagos
- `POST /api/payments/process` - Procesar pago

## 🛠️ Scripts

```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo con nodemon
npm run migrate    # Ejecutar migraciones
npm run migrate:rollback  # Revertir última migración
npm run seed       # Ejecutar seeds
```

## 📁 Estructura

```
backend/
├── database/
│   ├── config.js          # Configuración de Knex
│   ├── migrations/        # Migraciones de BD
│   └── seeds/            # Datos de prueba
├── models/               # Modelos de datos
├── routes/               # Rutas de la API
├── middleware/           # Middleware personalizado
├── services/             # Servicios (pagos, email, etc.)
├── utils/                # Utilidades
├── server.js             # Punto de entrada
├── knexfile.js           # Configuración de Knex
└── package.json          # Dependencias
```

## 🔐 Seguridad

- Helmet para headers de seguridad
- CORS configurado
- Rate limiting
- JWT para autenticación
- Bcrypt para passwords
- Validación de inputs

## 📝 Licencia

MIT


