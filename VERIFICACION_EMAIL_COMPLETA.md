# ✉️ Sistema de Verificación de Email - Implementación Completa

## ✅ **LO QUE SE HA IMPLEMENTADO**

### **Backend:**
1. ✅ Migración de base de datos (`003_create_verification_codes_table.js`)
2. ✅ Modelo VerificationCode con métodos:
   - `create()` - Crear código de verificación
   - `findByCode()` - Buscar código por código y tipo
   - `markAsVerified()` - Marcar código como usado
   - `invalidateUserCodes()` - Invalidar códigos anteriores
3. ✅ Servicio de Email (`emailService.js`) con:
   - Envío de códigos de verificación por email
   - Envío de códigos de recuperación de contraseña
   - Emails HTML con diseño profesional
4. ✅ Rutas de verificación (`/api/verification`):
   - `POST /api/verification/verify-email` - Verificar código
   - `POST /api/verification/resend-code` - Reenviar código
5. ✅ Registro modificado para enviar código de verificación

### **Frontend:**
1. ✅ API Client con métodos:
   - `verifyEmail(email, code)`
   - `resendVerificationCode(email)`
2. ✅ VerificationManager (`js/verification.js`) con:
   - Modal de verificación elegante
   - Validación de código de 6 dígitos
   - Opción de reenviar código
3. ✅ Flujo de registro actualizado:
   - Usuario se registra
   - Recibe código por email
   - Ingresa código en modal
   - Email queda verificado

---

## 🔧 **CONFIGURACIÓN REQUERIDA**

### **1. Variables de Entorno en Railway**

Ve a Railway → Tu Proyecto → Variables y agrega:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

### **2. Configurar Gmail (Para Testing)**

1. Ve a tu cuenta de Google
2. Ve a "Seguridad" → "Contraseñas de aplicación"
3. Genera una contraseña de aplicación
4. Copia la contraseña
5. Úsala en `SMTP_PASS` en Railway

**Ejemplo:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuemail@gmail.com
SMTP_PASS=abcdefghijklmnop
```

### **3. Ejecutar Migración en Railway**

La migración se ejecutará automáticamente la próxima vez que Railway despliegue. O puedes ejecutarla manualmente:

```bash
# En tu terminal local
railway run knex migrate:latest
```

---

## 🎯 **CÓMO FUNCIONA**

### **Flujo de Registro:**

```
1. Usuario llena formulario de registro
   ↓
2. Backend crea usuario en base de datos
   ↓
3. Backend genera código de 6 dígitos
   ↓
4. Backend guarda código en tabla verification_codes
   ↓
5. Backend envía email con código (usando nodemailer)
   ↓
6. Frontend muestra modal de verificación
   ↓
7. Usuario ingresa código de 6 dígitos
   ↓
8. Frontend envía código a /api/verification/verify-email
   ↓
9. Backend verifica código
   ↓
10. Backend marca email como verificado
    ↓
11. Frontend cierra modal de verificación
    ↓
12. Usuario puede iniciar sesión
```

### **Flujo de Reenvío de Código:**

```
1. Usuario hace clic en "Reenviar código"
   ↓
2. Frontend llama a /api/verification/resend-code
   ↓
3. Backend invalida códigos anteriores
   ↓
4. Backend genera nuevo código
   ↓
5. Backend envía email con nuevo código
   ↓
6. Usuario ingresa nuevo código
```

---

## 📝 **APIS DISPONIBLES**

### **POST /api/verification/verify-email**
Verifica el código de verificación de email.

**Request:**
```json
{
  "email": "usuario@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Código inválido o expirado"
}
```

### **POST /api/verification/resend-code**
Reenvía código de verificación.

**Request:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código de verificación reenviado"
}
```

---

## 🔒 **SEGURIDAD**

✅ **Códigos expiran en 10 minutos**
✅ **Códigos son de 6 dígitos aleatorios**
✅ **Los códigos se invalidan después de usarse**
✅ **Solo se pueden reenviar 3 códigos por hora**
✅ **Email se verifica antes de permitir login**

---

## 🚀 **DEPLOY A RAILWAY**

### **1. Agregar Variables de Entorno:**

En Railway Dashboard:
1. Ve a tu proyecto
2. Clic en "Variables"
3. Agrega:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=tuemail@gmail.com`
   - `SMTP_PASS=tu_app_password`

### **2. Hacer Commit y Push:**

```bash
git add .
git commit -m "Add email verification system"
git push origin fix/db-connection-railway
```

### **3. Railway ejecutará automáticamente:**
- La migración `003_create_verification_codes_table.js`
- El servidor se reiniciará
- El sistema de verificación estará activo

---

## 📊 **BASE DE DATOS**

### **Nueva Tabla: verification_codes**

```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'password_reset'
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ **PRUEBA EL SISTEMA**

### **1. Registrarse:**
- Ve a la página web
- Haz clic en "Registrarse"
- Completa el formulario
- Revisa tu email para el código

### **2. Verificar Email:**
- Abre el modal de verificación
- Ingresa el código de 6 dígitos
- Haz clic en "Verificar Email"

### **3. Si no llega el código:**
- Haz clic en "Reenviar código"
- Espera el nuevo email
- Ingresa el nuevo código

---

## 🔧 **TROUBLESHOOTING**

### **Error: "Código inválido o expirado"**
- El código expiró (10 minutos)
- Reenvía un nuevo código
- Verifica que el código tenga exactamente 6 dígitos

### **Error: "Error al enviar email"**
- Verifica las variables de entorno SMTP
- Verifica que SMTP_PASS sea correcto
- Revisa logs de Railway

### **El email no llega:**
- Revisa carpeta de spam
- Verifica que SMTP_USER sea correcto
- Verifica que la configuración de Gmail sea correcta

---

**Estado:** ✅ Sistema de verificación completo implementado
**Próximo paso:** Configurar variables de entorno y desplegar

