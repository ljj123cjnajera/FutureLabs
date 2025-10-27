# 🔐 Sistema de Autenticación - Documentación Completa

## 📋 RESUMEN
Tu aplicación FutureLabs YA tiene un sistema de autenticación completo, seguro y funcional implementado.

---

## ✅ IMPLEMENTACIÓN ACTUAL

### **BACKEND (Node.js + Express)**

#### 1. Modelo de Usuario (`backend/models/User.js`)
```javascript
// Características:
✅ Hash seguro de contraseñas con bcrypt (12 rounds)
✅ Verificación de contraseñas
✅ Gestión de tokens de recuperación
✅ Verificación de email
✅ CRUD completo de usuarios
```

#### 2. Rutas de Autenticación (`backend/routes/auth.js`)
- ✅ **POST** `/api/auth/register` - Registro de usuario
- ✅ **POST** `/api/auth/login` - Inicio de sesión
- ✅ **GET** `/api/auth/me` - Obtener usuario actual
- ✅ **POST** `/api/auth/logout` - Cerrar sesión

#### 3. Middleware de Autenticación (`backend/middleware/auth.js`)
- ✅ `authenticateToken` - Protege rutas que requieren autenticación
- ✅ `requireAdmin` - Requiere rol de administrador
- ✅ `requireAdminOrModerator` - Requiere rol de admin o moderador
- ✅ `optionalAuth` - Autenticación opcional

---

### **FRONTEND (HTML/CSS/JavaScript)**

#### 1. API Client (`js/api.js`)
```javascript
// Métodos implementados:
✅ api.login(email, password)
✅ api.register(userData)
✅ api.logout()
✅ api.getCurrentUser()
✅ Manejo automático de tokens JWT
```

#### 2. Auth Manager (`js/auth.js`)
```javascript
// Características:
✅ Gestión de sesión
✅ Verificación de autenticación
✅ Eventos para notificar cambios de estado
✅ Notificaciones integradas
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

### 1. **Hash de Contraseñas**
- ✅ Usa **bcrypt** con 10 rounds
- ✅ Las contraseñas nunca se almacenan en texto plano
- ✅ Comparación segura de contraseñas

### 2. **Tokens JWT**
- ✅ Tokens firmados con secret seguro
- ✅ Expiración en 7 días
- ✅ Almacenamiento en localStorage
- ✅ Envío automático en headers

### 3. **Validaciones**
- ✅ Email válido (express-validator)
- ✅ Contraseña mínimo 6 caracteres
- ✅ Campos requeridos validados
- ✅ Sanitización de inputs

### 4. **Middleware de Seguridad**
- ✅ Verificación de tokens en cada request autenticado
- ✅ Protección contra tokens expirados
- ✅ Manejo de errores de autenticación
- ✅ Control de acceso por roles

---

## 📊 FLUJO DE AUTENTICACIÓN

### **REGISTRO DE USUARIO**
```
1. Usuario llena formulario (email, password, nombre, apellido)
2. Validación en frontend
3. Request POST a /api/auth/register
4. Validación en backend (email único, password fuerte)
5. Hash de contraseña con bcrypt
6. Guardar usuario en base de datos
7. Generar token JWT
8. Retornar token y datos de usuario
9. Guardar token en localStorage
10. Actualizar estado de autenticación
```

### **INICIO DE SESIÓN**
```
1. Usuario ingresa email y password
2. Request POST a /api/auth/login
3. Validación en backend
4. Buscar usuario por email
5. Verificar password con bcrypt.compare()
6. Generar token JWT
7. Retornar token y datos de usuario
8. Guardar token en localStorage
9. Actualizar estado de autenticación
```

### **PROTECCIÓN DE RUTAS**
```
1. Usuario intenta acceder a ruta protegida
2. Verificar si hay token en localStorage
3. Token se envía en header Authorization: Bearer TOKEN
4. Middleware authenticateToken verifica token
5. Si válido, permite acceso
6. Si inválido, retorna 401 Unauthorized
```

---

## 🗄️ BASE DE DATOS

### Tabla: `users`
```sql
- id (UUID, Primary Key)
- email (String, Unique, Not Null)
- password_hash (String, Not Null)
- first_name (String, Not Null)
- last_name (String, Not Null)
- phone (String)
- role (String: 'client', 'admin', 'moderator')
- email_verified (Boolean, Default: false)
- email_verified_at (Timestamp)
- email_verification_token (String)
- password_reset_token (String)
- password_reset_expires (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
```

---

## 🎯 CÓMO USAR EL SISTEMA

### **Registrar Usuario (Frontend)**
```javascript
// Abrir modal de registro
document.querySelector('.btn-register').addEventListener('click', () => {
  const modal = document.getElementById('registerModal');
  modal.style.display = 'block';
});

// Enviar registro
const form = document.getElementById('registerForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userData = {
    email: document.getElementById('registerEmail').value,
    password: document.getElementById('registerPassword').value,
    first_name: document.getElementById('registerFirstName').value,
    last_name: document.getElementById('registerLastName').value
  };
  
  const success = await window.authManager.register(userData);
  if (success) {
    // Usuario registrado, hacer algo
    modal.style.display = 'none';
  }
});
```

### **Login de Usuario (Frontend)**
```javascript
const form = document.getElementById('loginForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const success = await window.authManager.login(email, password);
  if (success) {
    // Usuario logueado, hacer algo
    window.location.href = '/profile.html';
  }
});
```

### **Verificar Autenticación**
```javascript
// Verificar si el usuario está autenticado
if (window.authManager.isAuthenticated()) {
  console.log('Usuario autenticado');
  const user = window.authManager.currentUser;
} else {
  console.log('Usuario no autenticado');
}
```

### **Cerrar Sesión**
```javascript
document.querySelector('.btn-logout').addEventListener('click', async () => {
  await window.authManager.logout();
  window.location.href = '/index.html';
});
```

### **Proteger Rutas (Backend)**
```javascript
// En tus rutas
const { authenticateToken } = require('../middleware/auth');

router.get('/protected-route', authenticateToken, async (req, res) => {
  // req.user contiene el usuario autenticado
  res.json({ 
    success: true, 
    data: req.user 
  });
});
```

---

## ✅ TODO FUNCIONANDO

### **Lo que YA funciona:**
- ✅ Registro de usuarios
- ✅ Login de usuarios
- ✅ Logout de usuarios
- ✅ Protección de rutas
- ✅ Tokens JWT
- ✅ Hash de contraseñas
- ✅ Validaciones
- ✅ Middleware de autenticación
- ✅ Verificación de roles

---

## 🔧 VARIABLES DE ENTORNO NECESARIAS

En el archivo `.env` del backend:
```env
JWT_SECRET=tu_secret_seguro_aqui
NODE_ENV=production
DATABASE_URL=postgres://...
```

---

## 📝 PRÓXIMOS PASOS (Opcional)

Si quieres agregar más funcionalidades:

1. **Recuperación de Contraseña**
   - Ya existe estructura en la base de datos
   - Implementar envío de emails con nodemailer

2. **Verificación de Email**
   - Ya existe estructura en la base de datos
   - Implementar envío de emails

3. **Sesiones Persistentes**
   - Considerar usar cookies HTTP-only
   - Implementar refresh tokens

---

**Estado:** ✅ Sistema de autenticación completo y funcional
**Última actualización:** $(date)

