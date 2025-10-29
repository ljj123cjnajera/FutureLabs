# 💳 Configurar Pagos con Stripe

## ✅ Sistema Implementado

El sistema de pagos con Stripe está **COMPLETAMENTE IMPLEMENTADO** en el código. Solo necesitas configurar tus claves de Stripe.

---

## 🔑 Configuración Requerida

### 1. Obtener Claves de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Crea una cuenta o inicia sesión
3. Ve a **Developers** → **API keys**
4. Copia:
   - **Publishable key** (pk_test_...) para el frontend
   - **Secret key** (sk_test_...) para el backend

---

### 2. Configurar Backend (Railway)

Agrega esta variable de entorno en Railway:

```bash
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
```

⚠️ **IMPORTANTE:** Reemplaza `tu_secret_key_aqui` con tu clave real de Stripe.

---

### 3. Configurar Frontend

Edita el archivo `js/stripe-checkout.js` línea 10:

```javascript
const publicKey = 'pk_test_TU_CLAVE_AQUI'; // Reemplazar con tu clave real
```

O crea una variable de entorno en Railway para que el backend la exponga.

---

## 🧪 Pagos de Prueba

### Tarjetas de Prueba de Stripe:

```
✅ Pagos exitosos:
- 4242 4242 4242 4242
- 5555 5555 5555 4444

❌ Pagos rechazados:
- 4000 0000 0000 0002

Cualquier CVV y fecha futura funciona
```

---

## 🎯 Cómo Funciona

### Flujo de Pago Completo:

1. **Usuario selecciona "Tarjeta"** en el checkout
2. **Se inicializa Stripe Elements** - Formulario seguro de tarjeta
3. **Usuario ingresa datos** - Todo manejado por Stripe (seguro)
4. **Backend crea Payment Intent** - Con el monto total
5. **Stripe procesa el pago** - Verifica la tarjeta
6. **Si es exitoso:**
   - Se crea el pedido con `payment_status = 'paid'`
   - Se otorgan puntos de fidelidad
   - Se envía email de confirmación
   - Se limpia el carrito

---

## 🔐 Seguridad

✅ **Datos de tarjeta NUNCA van por tu servidor**
✅ **Stripe maneja toda la información sensible**
✅ **Tu backend solo procesa el resultado del pago**
✅ **Cumple con PCI DSS** (no necesitas certificación)

---

## 📊 Estados de Pago

- ✅ `paid` - Pago exitoso con Stripe
- ⏳ `pending` - Efectivo (pendiente de confirmación)
- ❌ `failed` - Pago fallido
- 💰 `refunded` - Pago reembolsado

---

## 🚀 Producir

Cuando estés listo para recibir pagos reales:

1. Cambia tus claves de **test** a **live**:
   - `pk_test_...` → `pk_live_...`
   - `sk_test_...` → `sk_live_...`

2. Configura webhooks en [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
   ```
   URL: https://tu-railway-url.com/api/payments/webhook/stripe
   Eventos a escuchar:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   ```

3. ¡Listo! Ya puedes recibir pagos reales 💰

---

## ⚠️ Nota Importante

**Sin configuración de Stripe:**
- El sistema funcionará con modo simulado
- Los pedidos se crearán con `payment_status = 'pending'`
- Los pagos se procesarán como efectivo

**Con Stripe configurado:**
- Pagos reales con tarjetas
- Verificación automática de fondos
- Puntos de fidelidad automáticos
- Emails de confirmación

---

## 🎉 ¡Listo!

Tu sistema de pagos está **100% funcional** y listo para usar. Solo configura tus claves de Stripe y ¡empieza a vender!

