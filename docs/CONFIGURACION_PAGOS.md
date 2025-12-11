# 💳 Configuración de Pagos - FutureLabs

El sistema de pagos ya está integrado en el código. Para activarlo en Producción (Railway), necesitas configurar las siguientes **Variables de Entorno**.

## 1. Variables de Entorno (Railway)

Ve a tu proyecto en **Railway** > **Settings** > **Variables** y agrega las siguientes claves según los métodos de pago que quieras activar.

### 📱 Yape y Plin (Pagos Móviles)
| Variable | Valor Ejemplo | Descripción |
|----------|---------------|-------------|
| `YAPE_PHONE` | `999999999` | El número asociado a tu cuenta Yape. |
| `PLIN_PHONE` | `999999999` | El número asociado a tu cuenta Plin. |

### 🏦 Transferencia Bancaria
| Variable | Valor Ejemplo | Descripción |
|----------|---------------|-------------|
| `BANK_NAME` | `BCP` | Nombre del banco. |
| `BANK_ACCOUNT` | `191-12345678-0-01` | Número de cuenta. |
| `BANK_CCI` | `002-191-12345678001-55` | Código Interbancario (Opcional). |

### 💳 Stripe (Pagos con Tarjeta)
Si tienes una cuenta de [Stripe](https://stripe.com), agrega tus claves:

| Variable | Descripción |
|----------|-------------|
| `STRIPE_PUBLISHABLE_KEY` | Clave pública (empieza con `pk_test_...` o `pk_live_...`). |
| `STRIPE_SECRET_KEY` | Clave secreta (empieza con `sk_test_...` o `sk_live_...`). |

---

## 2. Pruebas sin Stripe

Si **NO** configuras Stripe, la opción de "Tarjeta" mostrará un error o no funcionará, pero **Yape, Plin y Efectivo funcionarán perfectamente** siempre que configures sus números de teléfono.

### Efectivo contra Entrega
Este método está activo por defecto y no requiere variables de entorno.
