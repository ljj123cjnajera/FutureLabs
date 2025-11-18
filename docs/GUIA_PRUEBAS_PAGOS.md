# 💳 Guía de Pruebas de Pagos - FutureLabs

Esta guía te ayudará a probar todos los métodos de pago implementados en FutureLabs.

---

## 🎯 **Métodos de Pago Disponibles**

1. **Stripe** (Tarjetas de crédito/débito)
2. **Yape** (Pago móvil)
3. **Plin** (Pago móvil)
4. **Transferencia Bancaria**
5. **Efectivo** (Contra entrega)

---

## ⚙️ **Configuración Previa**

### **1. Variables de Entorno en Railway**

Asegúrate de tener configuradas estas variables:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Yape/Plin
YAPE_PHONE=987654321
PLIN_PHONE=987654321

# Transferencia Bancaria
BANK_ACCOUNT=0000000000000000
BANK_NAME=Banco de la Nación
BANK_CCI=00000000000000000000
```

---

## 🧪 **Pruebas por Método de Pago**

### **1. Stripe (Tarjetas)**

#### **Configuración:**
1. Obtén tus claves de Stripe desde [dashboard.stripe.com](https://dashboard.stripe.com)
2. Usa claves de **test** para desarrollo
3. Agrega las claves en Railway

#### **Tarjetas de Prueba:**
- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **CVV**: Cualquier 3 dígitos (ej: 123)
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **Código postal**: Cualquier código válido (ej: 12345)

#### **Flujo de Prueba:**
1. Agrega productos al carrito
2. Ve al checkout
3. Completa datos de envío
4. Selecciona "Tarjeta" como método de pago
5. Ingresa los datos de la tarjeta de prueba
6. Revisa el pedido
7. Haz clic en "Confirmar y Pagar"
8. **Resultado esperado**: 
   - El pago se procesa inmediatamente
   - El pedido se marca como "Pago procesado - Tarjeta"
   - Recibes confirmación de pago exitoso

#### **Verificación:**
- ✅ El payment intent se crea correctamente
- ✅ El pago se confirma en Stripe
- ✅ El pedido se actualiza a "paid" en la base de datos
- ✅ Se muestra mensaje de éxito

---

### **2. Yape**

#### **Configuración:**
1. Agrega tu número de Yape en Railway: `YAPE_PHONE=987654321`
2. El número debe tener 9 dígitos y comenzar con 9

#### **Flujo de Prueba:**
1. Agrega productos al carrito
2. Ve al checkout
3. Completa datos de envío
4. Selecciona "Yape" como método de pago
5. **Verifica que aparezca tu número de cuenta** (debe cargarse automáticamente)
6. Ingresa tu número de teléfono (9 dígitos, ej: 987654321)
7. Revisa el pedido
8. Haz clic en "Confirmar y Pagar"
9. **Resultado esperado**:
   - El pedido se crea como "Pago pendiente - Yape"
   - Se muestra el número de cuenta donde realizar el pago
   - Recibes mensaje: "Realiza el pago desde tu app Yape"

#### **Verificación:**
- ✅ Se muestra el número de cuenta del comercio
- ✅ El pedido se crea con `payment_status: 'pending'`
- ✅ Se muestra instrucción clara de qué hacer

---

### **3. Plin**

#### **Configuración:**
1. Agrega tu número de Plin en Railway: `PLIN_PHONE=987654321`
2. El número debe tener 9 dígitos y comenzar con 9

#### **Flujo de Prueba:**
1. Agrega productos al carrito
2. Ve al checkout
3. Completa datos de envío
4. Selecciona "Plin" como método de pago
5. **Verifica que aparezca tu número de cuenta** (debe cargarse automáticamente)
6. Ingresa tu número de teléfono (9 dígitos)
7. Revisa el pedido
8. Haz clic en "Confirmar y Pagar"
9. **Resultado esperado**:
   - El pedido se crea como "Pago pendiente - Plin"
   - Se muestra el número de cuenta donde realizar el pago
   - Recibes mensaje: "Realiza el pago desde tu app Plin"

#### **Verificación:**
- ✅ Se muestra el número de cuenta del comercio
- ✅ El pedido se crea con `payment_status: 'pending'`
- ✅ Se muestra instrucción clara de qué hacer

---

### **4. Transferencia Bancaria**

#### **Configuración:**
1. Agrega tus datos bancarios en Railway:
   ```
   BANK_ACCOUNT=0000000000000000
   BANK_NAME=Banco de la Nación
   BANK_CCI=00000000000000000000
   ```

#### **Flujo de Prueba:**
1. Agrega productos al carrito
2. Ve al checkout
3. Completa datos de envío
4. Selecciona "Transferencia" como método de pago
5. **Verifica que aparezcan tus datos bancarios** (deben cargarse automáticamente):
   - Banco
   - Cuenta
   - CCI (si está configurado)
6. Revisa el pedido
7. Haz clic en "Confirmar y Pagar"
8. **Resultado esperado**:
   - El pedido se crea como "Pago pendiente - Transferencia Bancaria"
   - Se muestran los datos bancarios completos
   - Recibes mensaje: "Realiza la transferencia y envía el comprobante"

#### **Verificación:**
- ✅ Se muestran todos los datos bancarios
- ✅ El pedido se crea con `payment_status: 'pending'`
- ✅ Se muestra instrucción clara de qué hacer

---

### **5. Efectivo (Contra Entrega)**

#### **Flujo de Prueba:**
1. Agrega productos al carrito
2. Ve al checkout
3. Completa datos de envío
4. Selecciona "Efectivo" como método de pago
5. Revisa el pedido
6. Haz clic en "Confirmar y Pagar"
7. **Resultado esperado**:
   - El pedido se crea como "Pago pendiente - Efectivo"
   - Recibes mensaje: "Pagarás en efectivo al momento de recibir tu pedido"

#### **Verificación:**
- ✅ El pedido se crea con `payment_status: 'pending'`
- ✅ Se muestra instrucción clara

---

## 🔍 **Verificación en Base de Datos**

Después de cada prueba, verifica en la base de datos:

```sql
-- Ver pedidos recientes
SELECT id, order_number, payment_method, payment_status, total_amount, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver detalles de un pedido específico
SELECT * FROM orders WHERE order_number = 'FL-...';
SELECT * FROM order_items WHERE order_id = '...';
```

**Estados esperados:**
- `payment_status: 'paid'` → Stripe (pago exitoso)
- `payment_status: 'pending'` → Yape, Plin, Transferencia, Efectivo
- `payment_status: 'failed'` → Solo si hubo un error

---

## 🐛 **Solución de Problemas**

### **Stripe no funciona:**
- ✅ Verifica que `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY` estén configuradas
- ✅ Verifica que Stripe.js esté cargado en `checkout.html`
- ✅ Revisa la consola del navegador para errores
- ✅ Verifica que la clave pública sea de test (empieza con `pk_test_`)

### **Yape/Plin no muestra número de cuenta:**
- ✅ Verifica que `YAPE_PHONE` o `PLIN_PHONE` estén configuradas en Railway
- ✅ Verifica que el endpoint `/api/payments/mobile/info` funcione
- ✅ Revisa la consola del navegador para errores

### **Transferencia no muestra datos bancarios:**
- ✅ Verifica que `BANK_ACCOUNT`, `BANK_NAME` estén configuradas
- ✅ Verifica que el endpoint `/api/payments/mobile/info` funcione
- ✅ Revisa la consola del navegador para errores

### **El pedido se crea pero el pago no se procesa:**
- ✅ Para Stripe: Verifica que el payment intent se confirme correctamente
- ✅ Para Yape/Plin: Es normal que quede como "pending" hasta confirmación manual
- ✅ Revisa los logs de Railway para ver errores del backend

---

## ✅ **Checklist de Pruebas**

- [ ] Stripe: Pago con tarjeta de prueba exitoso
- [ ] Stripe: Manejo de errores (tarjeta rechazada)
- [ ] Yape: Muestra número de cuenta
- [ ] Yape: Crea pedido como pendiente
- [ ] Plin: Muestra número de cuenta
- [ ] Plin: Crea pedido como pendiente
- [ ] Transferencia: Muestra datos bancarios
- [ ] Transferencia: Crea pedido como pendiente
- [ ] Efectivo: Crea pedido como pendiente
- [ ] Todos los métodos muestran información correcta en confirmación
- [ ] Los emails de confirmación se envían correctamente
- [ ] El carrito se limpia después del pedido

---

## 📝 **Notas Importantes**

1. **Stripe en modo test**: Usa siempre claves de test para desarrollo
2. **Pagos pendientes**: Yape, Plin, Transferencia y Efectivo quedan como "pending" hasta confirmación manual
3. **Webhooks**: Configura webhooks de Stripe en producción para confirmación automática
4. **Validación**: Todos los métodos validan los datos antes de procesar
5. **Errores**: Los errores se muestran claramente al usuario

---

## 🚀 **Próximos Pasos**

- [ ] Configurar webhooks de Stripe para confirmación automática
- [ ] Integrar APIs reales de Yape/Plin cuando estén disponibles
- [ ] Agregar más métodos de pago (PayPal, etc.)
- [ ] Implementar sistema de confirmación manual de pagos pendientes en admin panel

