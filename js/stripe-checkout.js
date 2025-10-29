// 💳 Integración de Stripe para Checkout

// Nota: Necesitas configurar STRIPE_PUBLIC_KEY en Railway
// Por ahora usaremos una clave de prueba

class StripeCheckoutManager {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.cardElement = null;
    
    // En producción, usar: STRIPE_PUBLIC_KEY de las variables de entorno
    // Por ahora: pk_test_... (configurar en Railway)
    this.init();
  }

  async init() {
    try {
      // Obtener clave pública de Stripe del backend o configurarla
      const publicKey = 'pk_test_51QSaAAAAA...'; // Reemplazar con tu clave real
      
      if (typeof Stripe !== 'undefined') {
        this.stripe = Stripe(publicKey);
        console.log('✅ Stripe inicializado correctamente');
      } else {
        console.log('⚠️  Stripe.js no cargado');
      }
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
    }
  }

  // Mostrar formulario de tarjeta Stripe
  showCardForm() {
    const cardFormContainer = document.getElementById('stripe-card-element');
    if (!cardFormContainer || !this.stripe) {
      console.log('⚠️  Stripe no está configurado');
      return false;
    }

    // Limpiar contenedor
    cardFormContainer.innerHTML = '';

    // Crear Elements
    this.elements = this.stripe.elements();

    // Crear elemento de tarjeta
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });

    // Montar elemento
    this.cardElement.mount('#stripe-card-element');

    return true;
  }

  // Procesar pago
  async processPayment(clientSecret) {
    try {
      if (!this.stripe || !this.cardElement) {
        throw new Error('Stripe no está configurado');
      }

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        success: true,
        paymentIntent: result.paymentIntent
      };
    } catch (error) {
      console.error('Error procesando pago:', error);
      throw error;
    }
  }

  // Verificar tarjeta
  async verifyCard() {
    try {
      if (!this.cardElement) {
        return { valid: false, error: 'Elemento de tarjeta no inicializado' };
      }

      const { error, complete } = await this.cardElement.createPaymentMethod('card');

      if (error) {
        return { valid: false, error: error.message };
      }

      return { valid: complete };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Crear instancia global
window.stripeCheckout = new StripeCheckoutManager();

