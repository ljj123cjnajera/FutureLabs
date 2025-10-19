# 💳 Sistema de Pagos - FutureLabs

## 🎯 **MÉTODOS DE PAGO DISPONIBLES**

### **1. Stripe** (Tarjetas de crédito/débito)
- ✅ Tarjetas Visa, Mastercard, Amex
- ✅ Pagos seguros con 3D Secure
- ✅ Procesamiento en tiempo real
- ✅ Webhooks para confirmación

### **2. PayPal**
- ✅ Pagos con cuenta PayPal
- ✅ Procesamiento seguro
- ✅ Confirmación automática

### **3. Yape/Plin** (Perú)
- ✅ Pagos móviles
- ✅ Transferencias instantáneas
- ✅ Confirmación por número de teléfono

### **4. Efectivo** (Contra entrega)
- ✅ Pago al momento de la entrega
- ✅ Confirmación manual
- ✅ Sin comisiones

---

## 📡 **ENDPOINTS DE PAGOS**

### **1. Crear Intención de Pago con Stripe**
```bash
POST /api/payments/stripe/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid-del-pedido"
}

Respuesta:
{
  "success": true,
  "data": {
    "client_secret": "pi_xxx_secret_xxx",
    "payment_intent_id": "pi_xxx"
  }
}
```

### **2. Procesar Pago con Stripe**
```bash
POST /api/payments/stripe/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid-del-pedido",
  "payment_method_id": "pm_xxx"
}

Respuesta:
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "payment_intent": {...},
    "order": {...}
  }
}
```

### **3. Procesar Pago con PayPal**
```bash
POST /api/payments/paypal/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid-del-pedido",
  "paypal_order_id": "PAYPAL-ORDER-ID"
}

Respuesta:
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "order": {...}
  }
}
```

### **4. Procesar Pago con Yape/Plin**
```bash
POST /api/payments/mobile/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid-del-pedido",
  "phone_number": "987654321",
  "amount": 899.99
}

Respuesta:
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "payment_id": "YAPE-1234567890",
    "order": {...}
  }
}
```

### **5. Procesar Pago en Efectivo**
```bash
POST /api/payments/cash/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid-del-pedido"
}

Respuesta:
{
  "success": true,
  "message": "Pago en efectivo registrado",
  "data": {
    "order": {...},
    "message": "Pago en efectivo registrado. Se confirmará al momento de la entrega."
  }
}
```

### **6. Reembolsar Pago** (Admin)
```bash
POST /api/payments/refund
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "order_id": "uuid-del-pedido"
}

Respuesta:
{
  "success": true,
  "message": "Reembolso procesado exitosamente",
  "data": {
    "order": {...}
  }
}
```

### **7. Webhook de Stripe**
```bash
POST /api/payments/webhook/stripe
Stripe-Signature: <signature>

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "metadata": {
        "order_id": "uuid-del-pedido"
      }
    }
  }
}
```

---

## 🔐 **CONFIGURACIÓN**

### **Variables de Entorno Requeridas:**
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PayPal
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# Yape/Plin (Perú)
YAPE_PHONE=999999999
PLIN_PHONE=999999999
```

---

## 📊 **ESTADOS DE PAGO**

- **pending**: Pago pendiente
- **paid**: Pago completado
- **failed**: Pago fallido
- **refunded**: Pago reembolsado

---

## 🔄 **FLUJO DE PAGO**

### **Con Stripe:**
1. Usuario crea pedido
2. Frontend llama a `/api/payments/stripe/create-intent`
3. Frontend obtiene `client_secret`
4. Usuario ingresa datos de tarjeta en Stripe Elements
5. Frontend llama a `/api/payments/stripe/process`
6. Stripe procesa el pago
7. Webhook confirma el pago
8. Pedido se actualiza a "paid"

### **Con PayPal:**
1. Usuario crea pedido
2. Frontend redirige a PayPal
3. Usuario autoriza el pago
4. PayPal redirige de vuelta
5. Frontend llama a `/api/payments/paypal/process`
6. Pedido se actualiza a "paid"

### **Con Yape/Plin:**
1. Usuario crea pedido
2. Usuario ingresa número de teléfono
3. Frontend llama a `/api/payments/mobile/process`
4. Sistema genera código de pago
5. Usuario confirma el pago en su app
6. Pedido se actualiza a "paid"

### **Con Efectivo:**
1. Usuario crea pedido
2. Frontend llama a `/api/payments/cash/process`
3. Pedido queda en "pending"
4. Al entregar, admin confirma el pago

---

## 🧪 **PRUEBAS**

### **Tarjetas de Prueba de Stripe:**
```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005

CVV: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Stripe:** Requiere cuenta en Stripe y claves API
2. **PayPal:** Requiere cuenta en PayPal y credenciales
3. **Yape/Plin:** Integración simulada (requiere API real)
4. **Efectivo:** Confirmación manual por admin
5. **Webhooks:** Necesitan URL pública para recibir notificaciones

---

**Fecha:** 16 de Octubre, 2025  
**Versión:** 1.0.0




