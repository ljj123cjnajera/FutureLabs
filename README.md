# 🚀 FutureLabs - E-commerce de Tecnología

![Estado](https://img.shields.io/badge/Estado-Producción-green)
![Completitud](https://img.shields.io/badge/Completitud-75%25-yellow)
![Backend](https://img.shields.io/badge/Backend-Railway-purple)

## 📖 Descripción

FutureLabs es una plataforma moderna de e-commerce especializada en productos tecnológicos. Incluye sistema completo de autenticación, carrito de compras, checkout, panel de administración y más.

## ✨ Características Principales

### ✅ Implementadas y Funcionando
- 🔐 **Autenticación completa** - Registro, login, verificación email, recuperación contraseña
- 🛒 **Carrito de compras** - Con persistencia en base de datos
- 💳 **Checkout completo** - Múltiples métodos de pago
- 📦 **Sistema de pedidos** - Historial y seguimiento
- ⭐ **Sistema de reseñas** - Con aprobación manual
- 🎁 **Wishlist** - Lista de favoritos
- 🎫 **Cupones de descuento** - Con validación
- 🔍 **Búsqueda y filtros** - Por categoría, precio, marca
- 📝 **Blog** - Sistema de artículos
- 👨‍💼 **Panel Admin** - CRUD completo de todos los recursos
- 📊 **Dashboard** - Estadísticas en tiempo real

### ⚠️ En Progreso
- 💳 **Pagos reales** - Stripe configurado pero requiere API keys
- 📧 **Emails** - Requiere configurar Resend API key
- 💬 **Chat en vivo** - Estructura básica implementada
- 🎁 **Sistema de puntos** - Backend listo, falta conexión con checkout

## 🛠️ Tecnologías

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla)
- **Font Awesome** - Iconos
- **Diseño responsive** - Mobile-first

### Backend
- **Node.js + Express**
- **PostgreSQL** - Base de datos
- **Knex.js** - Query builder y migraciones
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Resend** - Envío de emails
- **Stripe** - Procesamiento de pagos

### Deploy
- **Railway** - Backend + PostgreSQL
- Archivos estáticos servidos por Railway

## 🚀 Instalación y Configuración

### Pre-requisitos
```bash
- Node.js 18+
- PostgreSQL 14+
- Cuenta en Railway (para deploy)
- Cuenta en Resend (para emails)
- Cuenta en Stripe (para pagos)
```

### 1. Clonar repositorio
```bash
git clone https://github.com/ljj123cjnajera/FutureLabs.git
cd FutureLabs
```

### 2. Instalar dependencias
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en `/backend/`:

```env
# Base de datos (Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Emails (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@tudominio.com

# Pagos (Stripe)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Frontend URL (para CORS)
FRONTEND_URL=https://tudominio.com

# Puerto
PORT=3000

# Entorno
NODE_ENV=production
```

### 4. Ejecutar migraciones
```bash
cd backend
npx knex migrate:latest
```

### 5. Ejecutar seeds (opcional)
```bash
npx knex seed:run
```

### 6. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📋 Variables de Entorno Requeridas

### ✅ CRÍTICAS (Sin estas, el sistema no funciona)
- `DATABASE_URL` - Conexión a PostgreSQL
- `JWT_SECRET` - Para tokens de autenticación
- `PORT` - Puerto del servidor (Railway lo asigna automáticamente)

### ⚠️ IMPORTANTES (El sistema funciona pero con limitaciones)
- `RESEND_API_KEY` - Para envío de emails (verificación, recuperación contraseña)
- `FROM_EMAIL` - Email remitente
- `STRIPE_SECRET_KEY` - Para procesar pagos reales
- `STRIPE_WEBHOOK_SECRET` - Para webhooks de Stripe
- `FRONTEND_URL` - Para configurar CORS correctamente

### 📝 OPCIONALES
- `NODE_ENV` - Entorno (development/production)
- `JWT_EXPIRES_IN` - Duración de tokens (default: 7d)

## 🗄️ Estructura de Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `products` - Catálogo de productos
- `categories` - Categorías
- `cart` - Carritos de compra
- `orders` - Pedidos
- `order_items` - Items de cada pedido
- `reviews` - Reseñas de productos
- `wishlist` - Lista de deseos
- `coupons` - Cupones de descuento
- `verification_codes` - Códigos de verificación
- `blog_posts` - Artículos del blog
- `loyalty_points` - Sistema de puntos

## 🔐 Usuarios de Prueba

### Admin
- Email: `admin@futurelabs.com`
- Password: `admin123`
- Rol: `admin`

### Usuario Regular
- Registrarse normalmente en el sitio
- Rol por defecto: `client`

## 📱 Páginas Principales

### Públicas
- `/` - Página de inicio
- `/products.html` - Catálogo de productos
- `/product-detail.html` - Detalle de producto
- `/blog.html` - Blog
- `/about.html` - Acerca de
- `/contact.html` - Contacto
- `/faq.html` - Preguntas frecuentes

### Usuario Autenticado
- `/profile.html` - Perfil de usuario
- `/cart.html` - Carrito de compras
- `/checkout.html` - Proceso de pago
- `/orders.html` - Historial de pedidos
- `/wishlist.html` - Lista de deseos

### Administración
- `/admin-login.html` - Login de administrador
- `/admin.html` - Panel de administración

## 🧪 Testing

### Flujo de Registro y Login
1. Ir a la página principal
2. Clic en "Cuenta" → "Registrarse"
3. Llenar formulario de registro
4. Verificar email con código de 6 dígitos
5. Iniciar sesión

### Flujo de Compra
1. Navegar a "Productos"
2. Seleccionar un producto
3. Clic en "Agregar al Carrito"
4. Ir al carrito
5. Clic en "Proceder al Checkout"
6. Llenar información de envío
7. Seleccionar método de pago
8. Confirmar pedido
9. Verificar pedido en "Mis Pedidos"

### Panel Admin
1. Ir a `/admin-login.html`
2. Login con credenciales admin
3. Acceder al dashboard
4. Probar CRUD de productos, categorías, usuarios

## 🐛 Problemas Conocidos y Soluciones

### 1. Emails no llegan
**Causa**: `RESEND_API_KEY` no configurado o inválido  
**Solución**: Configurar variable en Railway con key válido de Resend

### 2. Pagos no procesan
**Causa**: `STRIPE_SECRET_KEY` no configurado  
**Solución**: 
- Obtener API key de Stripe Dashboard
- Configurar en Railway
- Usar tarjetas de prueba: `4242 4242 4242 4242`

### 3. CORS errors
**Causa**: `FRONTEND_URL` no configurado correctamente  
**Solución**: Asegurarse de que la variable apunte al dominio correcto

### 4. Railway no despliega cambios
**Causa**: Puede estar configurado en rama incorrecta  
**Solución**: 
- Verificar que Railway esté en rama `fix/db-connection-railway`
- Hacer push a esa rama
- O cambiar Railway a rama `main`

## 📊 Estado Actual del Proyecto

| Módulo | Completitud | Notas |
|--------|-------------|-------|
| Autenticación | 100% ✅ | Completamente funcional |
| Carrito | 100% ✅ | Con persistencia |
| Checkout | 90% 🟡 | Falta integración real de pagos |
| Pagos | 50% 🔴 | Requiere API keys |
| Admin Panel | 95% ✅ | CRUD completo |
| Emails | 70% 🟡 | Requiere Resend configurado |
| Blog | 100% ✅ | Funcional |
| Chat | 30% 🟡 | Estructura básica |
| Loyalty | 40% 🟡 | Backend listo |

**Completitud General**: **~75%** 🎯

Ver análisis completo en: [`ANALISIS_Y_PLAN_FINALIZACION.md`](./ANALISIS_Y_PLAN_FINALIZACION.md)

## 🚀 Deploy a Railway

### 1. Crear proyecto en Railway
1. Ir a [railway.app](https://railway.app)
2. Crear nuevo proyecto
3. Conectar con GitHub

### 2. Configurar PostgreSQL
1. Agregar servicio PostgreSQL
2. Copiar `DATABASE_URL`

### 3. Configurar variables de entorno
En Railway → Settings → Variables:
```env
DATABASE_URL=<copiar de PostgreSQL service>
JWT_SECRET=<generar secreto fuerte>
RESEND_API_KEY=<obtener de resend.com>
FROM_EMAIL=noreply@tudominio.com
STRIPE_SECRET_KEY=<obtener de stripe.com>
NODE_ENV=production
```

### 4. Configurar rama de deploy
- Settings → Deploy → Branch: `fix/db-connection-railway`
- O cambiar a `main` si prefieres

### 5. Deploy
- Railway detectará cambios automáticamente
- O hacer deploy manual desde dashboard

## 📝 Próximos Pasos

Ver [`ANALISIS_Y_PLAN_FINALIZACION.md`](./ANALISIS_Y_PLAN_FINALIZACION.md) para:
- Plan detallado de finalización
- Prioridades de desarrollo
- Roadmap de features

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es propiedad privada de FutureLabs.

## 👥 Autores

- **Luis** - Developer
- **AI Assistant** - Co-developer

## 📞 Contacto

- **Email**: soporte@futurelabs.com
- **Website**: [futurelabs.com](#)
- **GitHub**: [@ljj123cjnajera](https://github.com/ljj123cjnajera)

---

**Última actualización**: Noviembre 2024  
**Versión**: 1.0.0
