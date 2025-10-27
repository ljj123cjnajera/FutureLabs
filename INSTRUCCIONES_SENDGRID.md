# 📧 Configurar SendGrid - PASO A PASO

## ✅ Lo que acabo de hacer:
1. ✅ Instalé `@sendgrid/mail`
2. ✅ Actualicé `emailService.js` para usar SendGrid
3. ✅ El sistema ahora intentará usar SendGrid primero

---

## 🚀 PASOS PARA TI (5 minutos):

### **PASO 1: Crear cuenta en SendGrid** (GRATIS - No requiere tarjeta)

1. Ve a: **https://sendgrid.com/free/**
2. Click en **"Start for free"**
3. Completa el registro con tu email
4. Verifica tu email (revisa tu bandeja de entrada)
5. Espera aprobación (usualmente instantáneo)

### **PASO 2: Obtener API Key**

1. Una vez en SendGrid, ve a **Settings → API Keys**
2. Click en **"Create API Key"** (botón verde arriba a la derecha)
3. Configura:
   - **Name:** `FutureLabs`
   - **API Key Permissions:** Selecciona **"Full Access"**
4. Click en **"Create and View"**
5. **¡MUY IMPORTANTE!** Copia el API Key (empieza con `SG.`) - **solo se muestra UNA VEZ**
6. Guárdalo en un lugar seguro

### **PASO 3: Verificar Email Remitente**

1. En SendGrid, ve a **Settings → Sender Authentication**
2. Click en **"Verify a Single Sender"**
3. Completa el formulario:
   - **From email:** tu email (ej: `jz26062001@gmail.com`)
   - **From name:** `FutureLabs`
   - Otros campos opcionales
4. Click en **"Create"**
5. **Revisa tu email** (debe llegar un email de SendGrid)
6. Click en el link del email para verificar

### **PASO 4: Configurar en Railway**

1. Ve a tu proyecto en **Railway**
2. Click en el servicio de backend
3. Ve a la pestaña **"Variables"**
4. Click en **"+ New"**
5. Agrega esta variable:
   ```
   Name: SENDGRID_API_KEY
   Value: SG.tu_api_key_copiada (la que obtuviste en Paso 2)
   ```
6. Click en **"Add"**

---

## 🔄 DESPLEGAR CAMBIOS

Después de agregar la variable en Railway:

```bash
git add backend/
git commit -m "Implementar SendGrid para envío automático de emails"
git push origin fix/db-connection-railway
```

Railway hará deploy automáticamente.

---

## 🧪 PROBAR

1. Ve a tu sitio web
2. Crea una nueva cuenta de usuario
3. **Deberías recibir el código por email automáticamente** (en lugar de mostrarse en pantalla)

---

## ⚠️ IMPORTANTE

- **Email "from":** Actualmente está configurado como `noreply@futurelabs.com`
  - Necesitas verificar tu dominio en SendGrid para usar este email
  - O puedes cambiarlo a tu email verificado en SendGrid
  
- **Alternativa rápida:** Si no quieres verificar dominio, cambia el "from" en el código a tu email verificado

---

## 📊 PLAN GRATUITO

SendGrid ofrece:
- ✅ 100 emails GRATIS por día
- ✅ Perfecto para desarrollo y producción pequeña
- ✅ Sin tarjeta de crédito
- ✅ Sin límite de tiempo

---

## ❓ ¿Problemas?

Si ves errores en los logs de Railway:
- Verifica que `SENDGRID_API_KEY` tenga el valor correcto (debe empezar con `SG.`)
- Verifica que el email "from" esté verificado en SendGrid
- Revisa que hayas guardado la variable en Railway

---

**¿Cuando tengas el API Key, me avisas y te ayudo a configurarlo en Railway?**

