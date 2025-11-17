# 💳 Guía de Configuración de Pagos - FutureLabs

Esta guía te ayudará a configurar los diferentes métodos de pago disponibles en FutureLabs.

---

## 📋 **Métodos de Pago Disponibles**

1. **Stripe** (Tarjetas de crédito/débito)
2. **Yape** (Pago móvil)
3. **Plin** (Pago móvil)
4. **Transferencia Bancaria**
5. **Efectivo** (Contra entrega)

---

## 🔧 **Configuración en Railway**

### 1. **Stripe (Tarjetas)**

Para habilitar pagos con tarjeta, necesitas:

1. Crear una cuenta en [Stripe](https://stripe.com)
2. Obtener tus claves de API:
   - **Secret Key**: `sk_test_...` (para desarrollo) o `sk_live_...` (para producción)
   - **Publishable Key**: `pk_test_...` (para desarrollo) o `pk_live_...` (para producción)

3. Agregar en Railway (Variables de Entorno):
   ```
   STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
   STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
   ```

4. **Nota**: Para producción, usa las claves `live` en lugar de `test`.

---

### 2. **Yape**

Para configurar Yape:

1. Agregar en Railway:
   ```
   YAPE_PHONE=987654321
   ```
   (Reemplaza con tu número de teléfono asociado a Yape)

2. El número debe tener 9 dígitos y comenzar con 9.

---

### 3. **Plin**

Para configurar Plin:

1. Agregar en Railway:
   ```
   PLIN_PHONE=987654321
   ```
   (Reemplaza con tu número de teléfono asociado a Plin)

2. El número debe tener 9 dígitos y comenzar con 9.

---

### 4. **Transferencia Bancaria**

Para configurar transferencia bancaria:

1. Agregar en Railway:
   ```
   BANK_ACCOUNT=0000000000000000
   BANK_NAME=Banco de la Nación
   BANK_CCI=00000000000000000000
   ```

2. Reemplaza con tus datos bancarios reales:
   - `BANK_ACCOUNT`: Número de cuenta bancaria
   - `BANK_NAME`: Nombre del banco (ej: "BCP", "Interbank", "Banco de la Nación")
   - `BANK_CCI`: Código de Cuenta Interbancario (CCI) - opcional pero recomendado

---

## 🧪 **Pruebas**

### **Stripe (Modo Test)**

Stripe proporciona tarjetas de prueba:

- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **CVV**: Cualquier 3 dígitos (ej: 123)
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **Código postal**: Cualquier código válido

### **Yape/Plin**

- Los pagos se registran como "pendientes"
- Necesitarás confirmar manualmente los pagos desde el panel de admin
- En producción, puedes integrar con APIs reales de Yape/Plin cuando estén disponibles

### **Transferencia Bancaria**

- Los pedidos se crean como "pendientes"
- El cliente debe enviar el comprobante
- Confirma manualmente desde el panel de admin

---

## ✅ **Verificación**

Después de configurar las variables de entorno:

1. Reinicia el servidor en Railway
2. Verifica que los endpoints funcionen:
   - `GET /api/payments/stripe/public-key` - Debe devolver tu clave pública
   - `GET /api/payments/mobile/info` - Debe mostrar información de Yape/Plin/Banco

3. Prueba el checkout:
   - Selecciona cada método de pago
   - Verifica que se muestre la información correcta
   - Completa una compra de prueba

---

## 🔒 **Seguridad**

- **NUNCA** compartas tus claves secretas
- Usa claves de **test** para desarrollo
- Cambia a claves **live** solo en producción
- Mantén las variables de entorno seguras en Railway

---

## 📞 **Soporte**

Si tienes problemas:
1. Verifica que todas las variables estén configuradas
2. Revisa los logs en Railway
3. Asegúrate de que el servidor se haya reiniciado después de agregar variables

---

## 🚀 **Próximos Pasos**

- Integrar APIs reales de Yape/Plin cuando estén disponibles
- Configurar webhooks de Stripe para confirmación automática
- Agregar más métodos de pago según necesidad

