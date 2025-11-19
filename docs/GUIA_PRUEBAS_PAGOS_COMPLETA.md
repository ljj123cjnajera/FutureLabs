# 🧪 Guía Completa de Pruebas del Sistema de Pagos - FutureLabs

## 📋 **Preparación**

### 1. Variables de Entorno Requeridas
```env
# Stripe (obligatorio para pagos con tarjeta)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Yape/Plin (opcional, para pagos móviles)
YAPE_PHONE=999999999
PLIN_PHONE=999999999

# Transferencia Bancaria (opcional)
BANK_ACCOUNT=1234567890
BANK_NAME=Banco de la Nación
BANK_CCI=12345678901234567890

# Email (opcional, para envío de emails)
RESEND_API_KEY=re_...
```

### 2. Ejecutar Migraciones
```bash
cd backend
npx knex migrate:latest
```

### 3. Verificar Base de Datos
- Tabla `orders` con campos de cupón y puntos
- Tabla `payment_transactions` creada
- Tabla `coupons` con cupones de prueba
- Tabla `loyalty_points` con puntos de prueba

---

## 🧪 **PRUEBAS POR MÉTODO DE PAGO**

### **1. Stripe (Tarjeta de Crédito/Débito)**

#### **Configuración**
- Verificar que Stripe.js se carga correctamente
- Verificar que se obtiene la clave pública

#### **Pruebas**

**Test 1.1: Pago Exitoso**
1. Agregar productos al carrito
2. Ir a checkout
3. Completar datos de envío
4. Seleccionar "Tarjeta" como método de pago
5. Usar tarjeta de prueba: `4242 4242 4242 4242`
   - CVV: cualquier 3 dígitos (ej: 123)
   - Fecha: cualquier fecha futura (ej: 12/25)
   - Código postal: cualquier (ej: 12345)
6. Confirmar pago
7. **Verificar**:
   - ✅ Formulario de Stripe se carga correctamente
   - ✅ No aparece error "Can only create one Element"
   - ✅ Pago se procesa exitosamente
   - ✅ Pedido se marca como "paid"
   - ✅ Transacción se crea en `payment_transactions`
   - ✅ Email de pago exitoso se envía
   - ✅ `payment_intent_id` se guarda en el pedido

**Test 1.2: Pago Fallido**
1. Usar tarjeta de prueba que falla: `4000 0000 0000 0002`
2. Intentar pagar
3. **Verificar**:
   - ✅ Error se muestra correctamente
   - ✅ Transacción se marca como "failed"
   - ✅ Email de pago fallido se envía
   - ✅ Pedido se marca como "failed"

**Test 1.3: Tarjeta Requiere Autenticación**
1. Usar tarjeta: `4000 0025 0000 3155`
2. Completar autenticación 3D Secure
3. **Verificar**:
   - ✅ Flujo de autenticación funciona
   - ✅ Pago se completa después de autenticación

---

### **2. Yape**

#### **Pruebas**

**Test 2.1: Registro de Pago Yape**
1. Agregar productos al carrito
2. Ir a checkout
3. Completar datos de envío
4. Seleccionar "Yape" como método de pago
5. Ingresar número de teléfono: `987654321` (9 dígitos, empieza con 9)
6. Confirmar pedido
7. **Verificar**:
   - ✅ Número de teléfono se valida correctamente
   - ✅ Pedido se crea con `payment_status: 'pending'`
   - ✅ Transacción se crea con `status: 'pending'`
   - ✅ Email con instrucciones se envía
   - ✅ Email incluye número de Yape del comercio
   - ✅ Notificación a admin se crea

**Test 2.2: Número Inválido**
1. Intentar con número inválido: `123456789` (no empieza con 9)
2. **Verificar**:
   - ✅ Error de validación se muestra
   - ✅ Pedido no se crea

**Test 2.3: Confirmación Manual (Admin)**
1. Como admin, ir a `/api/admin/payments/pending`
2. Encontrar transacción de Yape pendiente
3. Confirmar pago con `POST /api/admin/payments/confirm`
4. **Verificar**:
   - ✅ Transacción se marca como "succeeded"
   - ✅ Pedido se marca como "paid"
   - ✅ Email de pago exitoso se envía al usuario

---

### **3. Plin**

#### **Pruebas**

**Test 3.1: Registro de Pago Plin**
1. Similar a Test 2.1 pero seleccionando "Plin"
2. **Verificar**:
   - ✅ Todo funciona igual que Yape
   - ✅ Email incluye número de Plin del comercio

**Test 3.2: Confirmación Manual**
1. Similar a Test 2.3 pero para Plin

---

### **4. Transferencia Bancaria**

#### **Pruebas**

**Test 4.1: Registro de Transferencia**
1. Seleccionar "Transferencia Bancaria"
2. Confirmar pedido
3. **Verificar**:
   - ✅ Pedido se crea con `payment_status: 'pending'`
   - ✅ Transacción se crea
   - ✅ Email con instrucciones bancarias se envía
   - ✅ Email incluye: banco, cuenta, CCI
   - ✅ Notificación a admin se crea

**Test 4.2: Confirmación Manual**
1. Como admin, confirmar transferencia
2. **Verificar**:
   - ✅ Pago se confirma correctamente
   - ✅ Email de éxito se envía

---

### **5. Efectivo (Contra Entrega)**

#### **Pruebas**

**Test 5.1: Registro de Pago en Efectivo**
1. Seleccionar "Efectivo"
2. Confirmar pedido
3. **Verificar**:
   - ✅ Pedido se crea con `payment_status: 'pending'`
   - ✅ Transacción se crea
   - ✅ Email informativo se envía
   - ✅ Email indica que pagará al recibir

**Test 5.2: Confirmación al Entregar**
1. Como admin, confirmar cuando se entrega
2. **Verificar**:
   - ✅ Pago se confirma
   - ✅ Email de confirmación se envía

---

## 🧪 **PRUEBAS DE CUPONES Y PUNTOS**

### **6. Cupones**

#### **Pruebas**

**Test 6.1: Aplicar Cupón Válido**
1. Agregar productos al carrito (monto mínimo del cupón)
2. Aplicar cupón válido (ej: `DESCUENTO10`)
3. Ir a checkout
4. **Verificar**:
   - ✅ Descuento se aplica en frontend
   - ✅ Descuento se aplica en backend
   - ✅ Total calculado coincide
   - ✅ Información del cupón se guarda en pedido
   - ✅ Cupón se marca como usado
   - ✅ Email muestra descuento aplicado

**Test 6.2: Cupón Inválido**
1. Intentar aplicar cupón expirado
2. **Verificar**:
   - ✅ Error se muestra
   - ✅ Pedido no se crea si cupón es inválido

**Test 6.3: Cupón con Restricciones**
1. Aplicar cupón que solo aplica a ciertas categorías/marcas
2. **Verificar**:
   - ✅ Validación funciona correctamente
   - ✅ Error si productos no califican

---

### **7. Puntos de Fidelidad**

#### **Pruebas**

**Test 7.1: Usar Puntos Válidos**
1. Tener puntos suficientes
2. Usar puntos en checkout (máximo 20% del total)
3. **Verificar**:
   - ✅ Descuento se aplica en frontend
   - ✅ Descuento se aplica en backend
   - ✅ Puntos se canjean correctamente
   - ✅ Información se guarda en pedido
   - ✅ Email muestra descuento de puntos

**Test 7.2: Exceder Límite del 20%**
1. Intentar usar puntos que excedan el 20%
2. **Verificar**:
   - ✅ Error se muestra
   - ✅ Solo se permite hasta el 20%

**Test 7.3: Puntos Insuficientes**
1. Intentar usar más puntos de los disponibles
2. **Verificar**:
   - ✅ Error se muestra
   - ✅ Pedido no se crea

---

## 🧪 **PRUEBAS DE VALIDACIONES**

### **8. Validación de Stock**

#### **Pruebas**

**Test 8.1: Stock Insuficiente**
1. Agregar más productos de los disponibles
2. Intentar crear pedido
3. **Verificar**:
   - ✅ Error se muestra claramente
   - ✅ Pedido no se crea
   - ✅ Mensaje indica cantidad disponible vs solicitada

**Test 8.2: Producto Sin Stock**
1. Agregar producto con stock 0
2. **Verificar**:
   - ✅ Error se muestra
   - ✅ Pedido no se crea

---

### **9. Validación de Totales**

#### **Pruebas**

**Test 9.1: Totales Coinciden**
1. Crear pedido normal
2. **Verificar**:
   - ✅ Total frontend = Total backend
   - ✅ Pedido se crea correctamente

**Test 9.2: Totales No Coinciden (Simulado)**
1. Modificar temporalmente cálculo en frontend
2. **Verificar**:
   - ✅ Error se muestra
   - ✅ Pedido no se crea
   - ✅ Mensaje indica diferencia

---

## 🧪 **PRUEBAS DEL PANEL DE ADMIN**

### **10. Gestión de Transacciones**

#### **Pruebas**

**Test 10.1: Ver Todas las Transacciones**
1. Como admin, ir a `GET /api/admin/payments/transactions`
2. **Verificar**:
   - ✅ Lista todas las transacciones
   - ✅ Filtros funcionan (status, método, fecha)
   - ✅ Paginación funciona

**Test 10.2: Ver Pagos Pendientes**
1. Ir a `GET /api/admin/payments/pending`
2. **Verificar**:
   - ✅ Solo muestra transacciones pendientes
   - ✅ Ordenadas por fecha (más antiguas primero)
   - ✅ Incluye información del usuario

**Test 10.3: Confirmar Pago Pendiente**
1. Seleccionar transacción pendiente
2. Confirmar con `POST /api/admin/payments/confirm`
3. **Verificar**:
   - ✅ Transacción se marca como "succeeded"
   - ✅ Pedido se marca como "paid"
   - ✅ Email se envía al usuario
   - ✅ Notificación se registra

**Test 10.4: Actualizar Estado de Transacción**
1. Actualizar estado con `PUT /api/admin/payments/transactions/:id/status`
2. **Verificar**:
   - ✅ Estado se actualiza
   - ✅ Si es "succeeded", pedido se actualiza también

**Test 10.5: Ver Estadísticas**
1. Ir a `GET /api/admin/payments/statistics`
2. **Verificar**:
   - ✅ Muestra totales, exitosos, pendientes, fallidos
   - ✅ Muestra monto total y promedio
   - ✅ Filtros por fecha funcionan

**Test 10.6: Ver Resumen de Notificaciones**
1. Ir a `GET /api/admin/payments/notifications`
2. **Verificar**:
   - ✅ Muestra cantidad de pendientes
   - ✅ Agrupa por método de pago
   - ✅ Muestra monto total pendiente

---

## 🧪 **PRUEBAS DE EMAILS**

### **11. Emails Automáticos**

#### **Pruebas**

**Test 11.1: Email de Confirmación de Pedido**
1. Crear pedido
2. **Verificar**:
   - ✅ Email se envía
   - ✅ Incluye información completa
   - ✅ Muestra cupones/puntos aplicados
   - ✅ Muestra información de pago

**Test 11.2: Email de Pago Exitoso**
1. Completar pago exitoso (Stripe o confirmación manual)
2. **Verificar**:
   - ✅ Email se envía
   - ✅ Muestra método de pago
   - ✅ Muestra monto pagado

**Test 11.3: Email de Pago Pendiente**
1. Crear pedido con Yape/Plin/Transferencia/Efectivo
2. **Verificar**:
   - ✅ Email se envía
   - ✅ Incluye instrucciones específicas
   - ✅ Muestra información de contacto

**Test 11.4: Email de Pago Fallido**
1. Fallar un pago (Stripe rechazado)
2. **Verificar**:
   - ✅ Email se envía
   - ✅ Muestra razón del error
   - ✅ Incluye botón para ver pedidos

---

## 🧪 **PRUEBAS DE INTEGRACIÓN**

### **12. Flujo Completo**

#### **Pruebas**

**Test 12.1: Flujo Completo con Stripe**
1. Agregar productos
2. Aplicar cupón
3. Usar puntos
4. Completar checkout
5. Pagar con Stripe
6. **Verificar**:
   - ✅ Todo funciona end-to-end
   - ✅ Totales correctos
   - ✅ Emails enviados
   - ✅ Transacciones creadas

**Test 12.2: Flujo Completo con Yape**
1. Similar a 12.1 pero con Yape
2. Confirmar manualmente como admin
3. **Verificar**:
   - ✅ Flujo completo funciona
   - ✅ Confirmación manual funciona

---

## 🐛 **PRUEBAS DE ERRORES**

### **13. Manejo de Errores**

#### **Pruebas**

**Test 13.1: Error de Red**
1. Desconectar internet durante pago
2. **Verificar**:
   - ✅ Error se maneja correctamente
   - ✅ Mensaje claro al usuario
   - ✅ Transacción se marca como fallida

**Test 13.2: Error de Stripe**
1. Usar tarjeta que falla
2. **Verificar**:
   - ✅ Error específico se muestra
   - ✅ Email de fallo se envía
   - ✅ Transacción se registra

**Test 13.3: Error de Validación**
1. Intentar crear pedido sin datos requeridos
2. **Verificar**:
   - ✅ Validaciones funcionan
   - ✅ Mensajes claros

---

## 📊 **CHECKLIST DE PRUEBAS**

### **Métodos de Pago**
- [ ] Stripe - Pago exitoso
- [ ] Stripe - Pago fallido
- [ ] Stripe - Autenticación 3D Secure
- [ ] Yape - Registro y confirmación
- [ ] Plin - Registro y confirmación
- [ ] Transferencia Bancaria - Registro y confirmación
- [ ] Efectivo - Registro y confirmación

### **Cupones y Puntos**
- [ ] Aplicar cupón válido
- [ ] Cupón inválido/expirado
- [ ] Cupón con restricciones
- [ ] Usar puntos válidos
- [ ] Exceder límite de puntos
- [ ] Puntos insuficientes

### **Validaciones**
- [ ] Stock insuficiente
- [ ] Totales no coinciden
- [ ] Datos faltantes

### **Panel Admin**
- [ ] Ver transacciones
- [ ] Ver pendientes
- [ ] Confirmar pagos
- [ ] Ver estadísticas
- [ ] Ver notificaciones

### **Emails**
- [ ] Confirmación de pedido
- [ ] Pago exitoso
- [ ] Pago pendiente
- [ ] Pago fallido

---

## 🔧 **COMANDOS ÚTILES**

### **Ver Transacciones en Base de Datos**
```sql
SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 10;
```

### **Ver Pedidos Pendientes**
```sql
SELECT * FROM orders WHERE payment_status = 'pending' ORDER BY created_at DESC;
```

### **Ver Estadísticas**
```sql
SELECT 
  payment_method,
  status,
  COUNT(*) as count,
  SUM(amount) as total
FROM payment_transactions
GROUP BY payment_method, status;
```

---

## 📝 **NOTAS**

- Todas las pruebas deben ejecutarse en ambiente de desarrollo primero
- Usar tarjetas de prueba de Stripe (nunca tarjetas reales)
- Verificar logs del servidor para debugging
- Verificar emails en Resend dashboard
- Verificar transacciones en Stripe dashboard

---

## ✅ **CRITERIOS DE ÉXITO**

Un método de pago se considera **funcional** cuando:
1. ✅ El pedido se crea correctamente
2. ✅ La transacción se registra
3. ✅ El email apropiado se envía
4. ✅ El estado se actualiza correctamente
5. ✅ Las notificaciones funcionan
6. ✅ Los errores se manejan apropiadamente

---

**¡Buena suerte con las pruebas!** 🚀

