# 🔐 Credenciales de Prueba - FutureLabs

## 👥 **USUARIOS DE PRUEBA**

### **1. Administrador**
```
Email: admin@futurelabs.com
Password: password123
Rol: admin
```

### **2. Cliente**
```
Email: customer@example.com
Password: password123
Rol: client
```

### **3. Moderador**
```
Email: moderator@futurelabs.com
Password: password123
Rol: moderator
```

---

## 🔑 **ENDPOINTS DE AUTENTICACIÓN**

### **Registro**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "password": "password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+51 987 654 321"
}
```

### **Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}

Respuesta:
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "...",
      "email": "customer@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role": "client"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Obtener Usuario Actual**
```bash
GET /api/auth/me
Authorization: Bearer <token>

Respuesta:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "customer@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role": "client"
    }
  }
}
```

### **Logout**
```bash
POST /api/auth/logout
Authorization: Bearer <token>

Respuesta:
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Token JWT:** Los tokens expiran en 7 días
2. **Password:** Todos los usuarios de prueba tienen la contraseña `password123`
3. **Roles:**
   - `client`: Usuario normal
   - `admin`: Administrador con todos los permisos
   - `moderator`: Moderador con permisos limitados

---

## 🧪 **PROBAR CON CURL**

### **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

### **Obtener Usuario Actual**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <tu_token>"
```

---

## 🔒 **SEGURIDAD**

- ✅ Passwords hasheados con bcrypt
- ✅ JWT tokens firmados
- ✅ Tokens expiran en 7 días
- ✅ Validación de emails
- ✅ Validación de passwords (mínimo 6 caracteres)

---

**Fecha:** 16 de Octubre, 2025  
**Versión:** 1.0.0



