class OrderTracking {
  constructor() {
    this.steps = [
      {
        id: 'pending',
        icon: 'fas fa-clipboard-check',
        label: 'Pedido recibido',
        description: 'Estamos validando tu compra y confirmando el pago.'
      },
      {
        id: 'processing',
        icon: 'fas fa-box-open',
        label: 'Preparando pedido',
        description: 'Nuestro equipo está alistando tus productos para el envío.'
      },
      {
        id: 'shipped',
        icon: 'fas fa-truck',
        label: 'Pedido enviado',
        description: 'Tu pedido está en camino con la empresa de transporte.'
      },
      {
        id: 'delivered',
        icon: 'fas fa-home',
        label: 'Pedido entregado',
        description: '¡Disfruta tu compra! Esperamos que todo sea perfecto.'
      }
    ];

    this.cancelledStep = {
      id: 'cancelled',
      icon: 'fas fa-times-circle',
      label: 'Pedido cancelado',
      description: 'Este pedido fue cancelado. Si necesitas ayuda contáctanos.'
    };

    this.statusLabels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
  }

  render(order) {
    if (!order) return '';

    const isCancelled = order.status === 'cancelled';
    const steps = isCancelled ? [...this.steps, this.cancelledStep] : this.steps;
    const currentIndex = this.getCurrentStepIndex(order.status, steps);
    const progress = this.calculateProgress(currentIndex, steps.length, isCancelled);
    const statusLabel = this.statusLabels[order.status] || order.status;

    const stepsHtml = steps
      .map((step, index) => {
        const state = this.getStepState(index, currentIndex, step.id, order.status, isCancelled);
        const timestampHtml = this.renderTimestamp(order, step.id, state);

        return `
          <div class="tracking-step ${state}" data-step="${step.id}">
            <div class="tracking-step-icon">
              <i class="${step.icon}"></i>
            </div>
            <div class="tracking-step-content">
              <h4>${step.label}</h4>
              <p>${step.description}</p>
              ${timestampHtml}
            </div>
          </div>
        `;
      })
      .join('');

    const trackingNotes = this.renderNotes(order, isCancelled);
    const trackingMeta = this.renderMeta(order);

    return `
      <div class="order-tracking ${isCancelled ? 'is-cancelled' : ''}">
        <div class="tracking-header">
          <span class="tracking-status-pill">
            <i class="fas fa-circle"></i> ${statusLabel}
          </span>
          ${trackingMeta}
        </div>
        <div class="tracking-progress">
          <div class="tracking-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="tracking-steps">
          ${stepsHtml}
        </div>
        ${trackingNotes}
      </div>
    `;
  }

  getCurrentStepIndex(status, steps) {
    const index = steps.findIndex(step => step.id === status);
    return index >= 0 ? index : 0;
  }

  calculateProgress(currentIndex, totalSteps, isCancelled) {
    if (totalSteps <= 1) return 0;
    if (isCancelled) return 100;
    const percentage = (currentIndex / (totalSteps - 1)) * 100;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  }

  getStepState(index, currentIndex, stepId, status, isCancelled) {
    if (isCancelled && stepId === 'cancelled') {
      return 'is-cancelled';
    }

    if (index < currentIndex) {
      return 'is-completed';
    }

    if (index === currentIndex) {
      return isCancelled ? 'is-completed' : 'is-active';
    }

    return 'is-upcoming';
  }

  renderTimestamp(order, stepId, state) {
    const timestamp = this.getTimestamp(order, stepId);
    if (!timestamp) {
      if (state === 'is-active') {
        return `<span class="tracking-step-time"><i class="fas fa-spinner fa-spin"></i> En progreso</span>`;
      }
      return '';
    }

    const formatted = this.formatDate(timestamp);
    return `<span class="tracking-step-time"><i class="fas fa-clock"></i> ${formatted}</span>`;
  }

  getTimestamp(order, stepId) {
    switch (stepId) {
      case 'pending':
        return order.created_at;
      case 'processing':
        if (['processing', 'shipped', 'delivered'].includes(order.status)) {
          return order.processing_at || order.updated_at;
        }
        return null;
      case 'shipped':
        return order.shipped_at;
      case 'delivered':
        return order.delivered_at;
      case 'cancelled':
        return order.updated_at;
      default:
        return null;
    }
  }

  formatDate(dateValue) {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderMeta(order) {
    const pieces = [];

    if (order.tracking_number) {
      pieces.push(`
        <span>
          <i class="fas fa-hashtag"></i>
          Tracking: ${order.tracking_number}
        </span>
      `);
    }

    if (order.shipping_company) {
      pieces.push(`
        <span>
          <i class="fas fa-shipping-fast"></i>
          ${order.shipping_company}
        </span>
      `);
    }

    if (order.updated_at) {
      const formatted = this.formatDate(order.updated_at);
      if (formatted) {
        pieces.push(`
          <span>
            <i class="fas fa-history"></i>
            Actualizado: ${formatted}
          </span>
        `);
      }
    }

    if (pieces.length === 0) {
      return '';
    }

    return `<div class="tracking-meta">${pieces.join('')}</div>`;
  }

  renderNotes(order, isCancelled) {
    if (isCancelled) {
      return `
        <p class="tracking-step-note">
          Nuestro equipo canceló este pedido. Si necesitas reactivarlo o tienes dudas, 
          escríbenos a <a href="mailto:soporte@futurelabs.pe">soporte@futurelabs.pe</a>.
        </p>
      `;
    }

    if (order.status === 'delivered') {
      return `
        <p class="tracking-step-note">
          Gracias por tu compra. No olvides calificar los productos y contarnos tu experiencia.
        </p>
      `;
    }

    return `
      <p class="tracking-step-note">
        Te notificaremos por email en cada avance. También puedes contactarnos por chat para más detalles.
      </p>
    `;
  }
}

window.orderTracking = new OrderTracking();

