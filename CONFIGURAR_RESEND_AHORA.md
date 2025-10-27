# ⚡ CONFIGURAR RESEND AHORA (1 minuto)

## 🔴 PROBLEMA ACTUAL
Aunque Resend está funcionando (envía el email), Railway **no detecta** que está configurado porque falta la variable de entorno.

---

## ✅ SOLUCIÓN RÁPIDA

### **PASO 1: Obtener API Key de Resend**

1. Ve a: https://resend.com/api-keys
2. Si ya tienes cuenta, verás tu API Key
3. Si no tienes cuenta:
   - Ve a: https://resend.com/signup
   - Regístrate (solo email y contraseña)
   - Ve a: https://resend.com/api-keys
   - Click en "Create API Key"
   - Copia el valor (empieza con `re_`)

### **PASO 2: Agregar en Railway**

1. Ve a tu proyecto en Railway
2. Click en el servicio de backend
3. Click en **"Variables"**
4. Click en **"+ New"**
5. Agrega:
   ```
   Name: RESEND_API_KEY
   Value: re_tu_api_key (copia el valor completo que obtuviste)
   ```
6. Click en **"Add"**

### **PASO 3: Esperar**

Railway hará **redeploy automático**. Espera 1 minuto.

---

## 🎉 DESPUÉS DE ESTO

Cuando agregues la variable, el sistema:
- ✅ NO mostrará el código en pantalla
- ✅ Solo mostrará: "Por favor, revisa tu email para el código de verificación"
- ✅ El usuario recibirá el código por email
- ✅ Experiencia limpia y profesional

---

## 📍 Enlaces rápidos

- **Crear cuenta:** https://resend.com/signup
- **API Keys:** https://resend.com/api-keys
- **Railway Variables:** Tu proyecto → Backend → Variables

---

**Una vez que agregues la variable en Railway, todo funcionará correctamente.** 🚀

