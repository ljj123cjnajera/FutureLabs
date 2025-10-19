# 🚀 FutureLabs - Tu Portal al Futuro

> **Tienda online completa de tecnología y electrónica con todas las funcionalidades modernas de un e-commerce profesional.**

[![Status](https://img.shields.io/badge/status-production%20ready-success)](https://github.com)
[![Version](https://img.shields.io/badge/version-13.1.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com)

---

## ✨ **CARACTERÍSTICAS PRINCIPALES**

### 🛍️ **E-Commerce Completo**
- ✅ Catálogo de productos con búsqueda avanzada
- ✅ Carrito de compras funcional
- ✅ Sistema de wishlist
- ✅ Checkout y procesamiento de pagos
- ✅ Gestión de órdenes

### 👤 **Gestión de Usuarios**
- ✅ Registro y autenticación
- ✅ Perfiles de usuario
- ✅ Recuperación de contraseña
- ✅ Roles y permisos (Admin, Cliente, Moderador)

### ⭐ **Reviews y Ratings**
- ✅ Sistema de reseñas de productos
- ✅ Calificaciones con estrellas
- ✅ Moderación de reviews

### 🎁 **Sistema de Cupones**
- ✅ Crear y gestionar cupones
- ✅ Aplicar descuentos
- ✅ Validación automática

### 📝 **Blog Integrado**
- ✅ Publicación de artículos
- ✅ Categorías y tags
- ✅ Comentarios

### 🔍 **Búsqueda Avanzada**
- ✅ Búsqueda en tiempo real
- ✅ Autocompletado
- ✅ Filtros múltiples
- ✅ Sugerencias inteligentes

### 🔄 **Comparador de Productos**
- ✅ Comparar hasta 4 productos
- ✅ Vista de comparación detallada
- ✅ Componente flotante

### 📱 **Progressive Web App (PWA)**
- ✅ Instalable en dispositivos
- ✅ Funciona offline
- ✅ Service Worker
- ✅ Cache de recursos

### 📊 **Panel de Administración**
- ✅ Dashboard con estadísticas
- ✅ CRUD completo de todas las entidades
- ✅ Gestión de inventario
- ✅ Reportes y analytics

---

## 🚀 **INICIO RÁPIDO**

### **Prerrequisitos**
- Node.js 14+
- PostgreSQL 12+
- Python 3 (para desarrollo)

### **Instalación**

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/futurelabs.git
cd futurelabs
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Crear base de datos**
```bash
psql -U tu_usuario -d postgres -c "CREATE DATABASE futurelabs;"
```

5. **Ejecutar migraciones**
```bash
npx knex migrate:latest
```

6. **Ejecutar seeds (datos de prueba)**
```bash
npx knex seed:run
```

7. **Iniciar servidor backend**
```bash
node server.js
```

8. **Iniciar servidor frontend (en otra terminal)**
```bash
cd ..
python3 -m http.server 8080
```

9. **Abrir en el navegador**
```
http://localhost:8080
```

---

## 🔐 **CREDENCIALES DE PRUEBA**

### **Administrador**
```
Email: admin@futurelabs.com
Password: admin123
```

### **Cliente**
```
Email: customer@futurelabs.com
Password: customer123
```

### **Moderador**
```
Email: moderator@futurelabs.com
Password: moderator123
```

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
FutureLabs/
├── backend/              # Backend Node.js + Express
│   ├── database/         # Migraciones y seeds
│   ├── middleware/       # Middleware de Express
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de API
│   ├── server.js        # Servidor principal
│   └── .env            # Variables de entorno
├── assets/              # Imágenes y recursos
├── css/                 # Estilos CSS
├── js/                  # JavaScript del frontend
├── *.html               # Páginas HTML
├── manifest.webmanifest # PWA manifest
└── sw.js               # Service Worker
```

---

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

### **Backend**
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Knex.js** - Query builder
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas

### **Frontend**
- **HTML5** - Estructura
- **CSS3** - Estilos
- **JavaScript (ES6+)** - Lógica
- **Font Awesome** - Iconos
- **Fetch API** - Peticiones HTTP

### **Herramientas**
- **npm** - Gestor de paquetes
- **Git** - Control de versiones
- **Postman** - Testing de API

---

## 📚 **DOCUMENTACIÓN**

### **Archivos de Documentación**
- `README.md` - Este archivo
- `INSTRUCCIONES_FINALES.md` - Guía completa de uso
- `ESTADO_FINAL.md` - Estado del proyecto
- `ERRORES_CORREGIDOS_FINAL.md` - Errores corregidos
- `CORRECCIONES_COMPLETAS.md` - Correcciones realizadas

### **Documentación de API**
- Base URL: `http://localhost:3000/api`
- Autenticación: JWT Bearer Token
- Formato: JSON

---

## 🧪 **PRUEBAS**

### **Ejecutar Pruebas**
```bash
# Backend
cd backend
npm test

# Frontend
# Abrir en navegador y verificar funcionalidades
```

### **Endpoints de Prueba**
```bash
# Productos destacados
curl http://localhost:3000/api/products/featured?limit=8

# Categorías
curl http://localhost:3000/api/categories

# Productos
curl http://localhost:3000/api/products
```

---

## 🎨 **DISEÑO**

### **Colores**
- **Primary:** `#667eea`
- **Secondary:** `#764ba2`
- **Success:** `#10b981`
- **Danger:** `#ef4444`
- **Warning:** `#f59e0b`

### **Responsive**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## 🔒 **SEGURIDAD**

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS configurado
- ✅ Helmet para seguridad
- ✅ Rate limiting
- ✅ Validación de datos
- ✅ Sanitización de inputs

---

## 📈 **ESTADÍSTICAS**

- **Líneas de Código:** ~15,000+
- **Archivos JavaScript:** 16
- **Archivos HTML:** 21
- **Archivos CSS:** 7
- **Endpoints API:** 50+
- **Tablas de BD:** 12
- **Tiempo de Desarrollo:** 2 semanas

---

## 🤝 **CONTRIBUIR**

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 **LICENCIA**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👥 **AUTORES**

- **FutureLabs Team** - *Desarrollo completo* - [GitHub](https://github.com)

---

## 🙏 **AGRADECIMIENTOS**

- Font Awesome por los iconos
- PostgreSQL por la base de datos
- Express.js por el framework
- Todos los contribuidores de los paquetes npm utilizados

---

## 📞 **CONTACTO**

Para preguntas o soporte:
- Email: support@futurelabs.com
- GitHub: [https://github.com/futurelabs](https://github.com/futurelabs)

---

## 🎯 **ROADMAP**

### **Versión 14.0.0 (Próximamente)**
- [ ] Sistema de pagos real (Stripe, PayPal)
- [ ] Integración con pasarelas peruanas (Yape, Plin)
- [ ] Sistema de notificaciones push
- [ ] Chat en vivo
- [ ] Sistema de recomendaciones con IA
- [ ] Múltiples idiomas
- [ ] Sistema de puntos/recompensas
- [ ] Programa de afiliados
- [ ] Integración con redes sociales
- [ ] App móvil nativa

---

## ⭐ **ESTRELLAS**

Si te gusta este proyecto, ¡dale una estrella! ⭐

---

## 🎉 **¡Gracias por usar FutureLabs!**

**Tu portal al futuro de la tecnología** 🚀

---

**Versión:** 13.1.0  
**Última actualización:** 16 de Octubre, 2025  
**Estado:** ✅ Production Ready




