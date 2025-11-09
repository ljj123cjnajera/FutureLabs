// ⭐ Sistema de Reviews - FutureLabs

class ReviewsManager {
  constructor() {
    this.reviews = [];
    this.stats = this.getEmptyStats();
    this.productId = null;
    this.currentFilter = 'all';
    this.currentSort = 'recent';
    this.selectedRating = 0;
    this.eventsBound = false;
    this.isSubmitting = false;
    this.options = {
      statsContainerId: 'reviewsStats',
      listContainerId: 'reviewsList',
      formContainerId: 'reviewFormContainer',
      filterContainerId: 'reviewsFilterButtons',
      sortSelectId: 'reviewsSortSelect',
      writeButtonId: 'writeReviewBtn'
    };

    document.addEventListener('authStateChanged', () => {
      if (!this.productId) return;
      this.renderReviewForm();
      this.updateWriteButtonState();
    });
  }

  getEmptyStats() {
    return {
      total: 0,
      average: 0,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
  }

  async init(productId, options = {}) {
    if (!productId) {
      console.warn('ReviewsManager: productId requerido');
      return;
    }

    this.productId = productId;
    this.options = { ...this.options, ...options };

    await this.refresh();
    this.bindEvents();
  }

  async refresh() {
    await this.loadFromApi();
    this.renderStats();
    this.renderFilters();
    this.renderReviews();
    this.renderReviewForm();
    this.updateWriteButtonState();
  }

  async loadFromApi() {
    try {
      const response = await window.api.getProductReviews(this.productId);
      if (response.success) {
        const data = response.data || {};
        this.reviews = Array.isArray(data.reviews) ? data.reviews : [];
        this.stats = this.normalizeStats(data.stats);
      } else {
        this.reviews = [];
        this.stats = this.calculateStatsFromReviews();
      }
    } catch (error) {
      console.error('❌ Error cargando reviews:', error);
      this.reviews = [];
      this.stats = this.calculateStatsFromReviews();
    }
  }

  normalizeStats(apiStats) {
    if (!apiStats) {
      return this.calculateStatsFromReviews();
    }

    const distribution = apiStats.rating_distribution || {};

    return {
      total: Number(apiStats.total_reviews) || 0,
      average: Number(apiStats.average_rating) || 0,
      distribution: {
        5: Number(distribution[5]) || 0,
        4: Number(distribution[4]) || 0,
        3: Number(distribution[3]) || 0,
        2: Number(distribution[2]) || 0,
        1: Number(distribution[1]) || 0
      }
    };
  }

  calculateStatsFromReviews() {
    if (!Array.isArray(this.reviews) || this.reviews.length === 0) {
      return this.getEmptyStats();
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const total = this.reviews.length;
    const sum = this.reviews.reduce((acc, review) => {
      const rating = Number(review.rating) || 0;
      if (distribution[rating] !== undefined) {
        distribution[rating] += 1;
      }
      return acc + rating;
    }, 0);

    return {
      total,
      average: total > 0 ? sum / total : 0,
      distribution
    };
  }

  bindEvents() {
    if (this.eventsBound) return;

    const filterContainer = document.getElementById(this.options.filterContainerId);
    if (filterContainer) {
      filterContainer.addEventListener('click', (event) => {
        const button = event.target.closest('[data-review-filter]');
        if (!button) return;
        event.preventDefault();
        this.setFilter(button.dataset.reviewFilter);
      });
    }

    const sortSelect = document.getElementById(this.options.sortSelectId);
    if (sortSelect) {
      sortSelect.addEventListener('change', (event) => {
        this.setSort(event.target.value);
      });
    }

    const writeButton = document.getElementById(this.options.writeButtonId);
    if (writeButton) {
      writeButton.addEventListener('click', () => this.handleWriteReviewClick());
    }

    this.eventsBound = true;
  }

  handleWriteReviewClick() {
    if (!window.authManager?.isAuthenticated()) {
      window.notifications?.warning?.('Inicia sesión para escribir una review');
      window.modalManager?.showLogin?.();
      return;
    }

    const container = document.getElementById(this.options.formContainerId);
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const commentField = container.querySelector('textarea[name="comment"]');
      if (commentField) {
        commentField.focus();
      }
    }
  }

  setFilter(filter) {
    if (!filter || this.currentFilter === filter) return;
    this.currentFilter = filter;
    this.renderFilters();
    this.renderReviews();
  }

  setSort(sort) {
    if (!sort || this.currentSort === sort) return;
    this.currentSort = sort;
    this.renderReviews();
  }

  renderFilters() {
    const filterButtons = document.querySelectorAll(
      `#${this.options.filterContainerId} [data-review-filter]`
    );
    filterButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.reviewFilter === this.currentFilter);
    });

    const sortSelect = document.getElementById(this.options.sortSelectId);
    if (sortSelect) {
      sortSelect.value = this.currentSort;
    }
  }

  getFilteredReviews() {
    let filtered = Array.isArray(this.reviews) ? [...this.reviews] : [];

    switch (this.currentFilter) {
      case '5':
      case '4':
      case '3':
      case '2':
      case '1':
        filtered = filtered.filter(
          (review) => Number(review.rating) === Number(this.currentFilter)
        );
        break;
      case 'with-photos':
        filtered = filtered.filter(
          (review) => Array.isArray(review.images) && review.images.length > 0
        );
        break;
      default:
        break;
    }

    return this.getSortedReviews(filtered);
  }

  getSortedReviews(reviews = []) {
    const list = [...reviews];

    switch (this.currentSort) {
      case 'recent':
        return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'highest':
        return list.sort(
          (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
        );
      case 'lowest':
        return list.sort(
          (a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0)
        );
      default:
        return list;
    }
  }

  renderReviews() {
    const container = document.getElementById(this.options.listContainerId);
    if (!container) return;

    const reviews = this.getFilteredReviews();

    if (!reviews.length) {
      container.innerHTML = `
        <div class="empty-reviews">
          <i class="far fa-star"></i>
          <p>Aún no hay opiniones para este producto.</p>
          ${
            window.authManager?.isAuthenticated()
              ? '<button class="btn btn-primary btn-sm" type="button" data-action="write-review-empty">Sé el primero en opinar</button>'
              : '<button class="btn btn-primary btn-sm" type="button" data-action="login-to-review">Inicia sesión y deja tu review</button>'
          }
        </div>
      `;

      const emptyButton = container.querySelector('[data-action="write-review-empty"]');
      if (emptyButton) {
        emptyButton.addEventListener('click', () => this.handleWriteReviewClick());
      }

      const loginButton = container.querySelector('[data-action="login-to-review"]');
      if (loginButton) {
        loginButton.addEventListener('click', () => {
          window.modalManager?.showLogin?.();
        });
      }

      return;
    }

    container.innerHTML = reviews.map((review) => this.renderReviewItem(review)).join('');
  }

  renderReviewItem(review) {
    const reviewerName = this.getReviewerName(review);
    const createdAt = this.formatDate(review.created_at);
    const title = this.escapeHTML(review.title || '');
    const comment = this.escapeHTML(review.comment || '').replace(/\n/g, '<br>');
    const ratingValue = Number(review.rating) || 0;
    const ratingLabel = `${ratingValue} de 5`;
    const verifiedBadge = review.verified_purchase
      ? '<span class="review-verified-badge"><i class="fas fa-check-circle"></i> Compra verificada</span>'
      : '';

    return `
      <article class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">${reviewerName.charAt(0)}</div>
            <div class="reviewer-details">
              <div class="reviewer-name">${reviewerName} ${verifiedBadge}</div>
              <div class="review-date">${createdAt}</div>
            </div>
          </div>
          <div class="review-rating" aria-label="${ratingLabel}">
            <div class="stars">${this.generateStars(ratingValue)}</div>
            <span class="rating-count">${ratingLabel}</span>
          </div>
        </div>
        <div class="review-content">
          ${title ? `<h4>${title}</h4>` : ''}
          <p>${comment}</p>
        </div>
        ${
          Array.isArray(review.images) && review.images.length
            ? `<div class="review-images">
                 ${review.images
                   .map((src) => `<img src="${src}" alt="Foto de la reseña">`)
                   .join('')}
               </div>`
            : ''
        }
      </article>
    `;
  }

  renderStats() {
    const container = document.getElementById(this.options.statsContainerId);
    if (!container) return;

    const stats = this.stats || this.getEmptyStats();
    const averageFormatted = (Math.round((stats.average || 0) * 10) / 10).toFixed(1);
    const totalText = stats.total === 1 ? '1 reseña' : `${stats.total} reseñas`;

    container.innerHTML = `
      <div class="reviews-stats">
        <div class="stats-overview">
          <div class="average-number">${averageFormatted}</div>
          <div class="average-stars">${this.generateStars(stats.average || 0)}</div>
          <div class="average-total">${totalText}</div>
        </div>
        <div class="stats-distribution">
          ${[5, 4, 3, 2, 1]
            .map((rating) => {
              const count = stats.distribution?.[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return `
                <div class="distribution-item">
                  <span class="distribution-rating">${rating} estrellas</span>
                  <div class="distribution-bar">
                    <div class="distribution-fill" style="width: ${percentage}%;"></div>
                  </div>
                  <span class="distribution-count">${count}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  renderReviewForm() {
    const container = document.getElementById(this.options.formContainerId);
    if (!container) return;

    if (!window.authManager?.isAuthenticated()) {
      container.innerHTML = `
        <div class="review-form-login">
          <p>Inicia sesión para contarnos tu experiencia con este producto.</p>
          <button class="btn btn-primary btn-sm" type="button" data-action="login-to-review">
            <i class="fas fa-user"></i> Iniciar sesión
          </button>
        </div>
      `;
      const loginButton = container.querySelector('[data-action="login-to-review"]');
      if (loginButton) {
        loginButton.addEventListener('click', () => window.modalManager?.showLogin?.());
      }
      return;
    }

    container.innerHTML = `
      <div class="review-form">
        <h3>Escribe una review</h3>
        <form id="reviewForm" novalidate>
          <div class="form-group">
            <label class="form-label required">Calificación</label>
            <div class="rating-input" id="reviewRatingInputs">
              ${[1, 2, 3, 4, 5]
                .map(
                  (rating) => `
                    <button type="button" class="star-btn" data-rating-value="${rating}" aria-label="${rating} estrellas">
                      <i class="${rating <= this.selectedRating ? 'fas' : 'far'} fa-star"></i>
                    </button>
                  `
                )
                .join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Título (opcional)</label>
            <input type="text" class="form-input" name="title" maxlength="120" placeholder="Ej. Excelente batería y rendimiento">
          </div>
          <div class="form-group">
            <label class="form-label required">Comentario</label>
            <textarea class="form-textarea" name="comment" rows="5" minlength="10" maxlength="1500" placeholder="Cuenta cómo fue tu experiencia con este producto..." required></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">
              <i class="fas fa-paper-plane"></i> Enviar review
            </button>
          </div>
        </form>
      </div>
    `;

    const ratingButtons = container.querySelectorAll('[data-rating-value]');
    ratingButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.selectRating(Number(button.dataset.ratingValue));
      });
    });

    const form = container.querySelector('#reviewForm');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.submitReview(form);
      });
    }
  }

  selectRating(rating) {
    this.selectedRating = rating;
    const container = document.getElementById('reviewRatingInputs');
    if (!container) return;

    const buttons = container.querySelectorAll('[data-rating-value]');
    buttons.forEach((button) => {
      const icon = button.querySelector('i');
      const value = Number(button.dataset.ratingValue);
      if (icon) {
        icon.classList.toggle('fas', value <= rating);
        icon.classList.toggle('far', value > rating);
      }
    });
  }

  async submitReview(form) {
    if (this.isSubmitting) return;

    if (!window.authManager?.isAuthenticated()) {
      window.modalManager?.showLogin?.();
      return;
    }

    if (!this.selectedRating) {
      window.notifications?.warning?.('Selecciona una calificación');
      return;
    }

    const formData = new FormData(form);
    const title = (formData.get('title') || '').toString().trim();
    const comment = (formData.get('comment') || '').toString().trim();

    if (comment.length < 10) {
      window.notifications?.warning?.('Tu comentario debe tener al menos 10 caracteres');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-loading');
    }
    this.isSubmitting = true;

    try {
      const response = await window.api.createReview(
        this.productId,
        this.selectedRating,
        title || null,
        comment,
        false
      );

      if (!response.success) {
        throw new Error(response.message || 'No se pudo registrar tu review');
      }

      window.notifications?.success?.('¡Gracias por compartir tu experiencia!');

      form.reset();
      this.selectedRating = 0;
      this.selectRating(0);

      await this.refresh();
    } catch (error) {
      console.error('❌ Error enviando review:', error);
      window.notifications?.error?.(
        error.message || 'Ocurrió un problema al guardar tu review'
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
      }
      this.isSubmitting = false;
    }
  }

  updateWriteButtonState() {
    const button = document.getElementById(this.options.writeButtonId);
    if (!button) return;

    if (window.authManager?.isAuthenticated()) {
      button.dataset.state = 'authenticated';
    } else {
      button.dataset.state = 'guest';
    }
  }

  generateStars(value) {
    const rating = Math.max(0, Math.min(5, Number(value) || 0));
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return `
      ${'<i class="fas fa-star"></i>'.repeat(full)}
      ${hasHalf ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(empty)}
    `;
  }

  getReviewerName(review) {
    const first = (review.first_name || '').toString().trim();
    const last = (review.last_name || '').toString().trim();

    if (first || last) {
      return `${first} ${last}`.trim();
    }

    if (review.user_name) return review.user_name;
    if (review.email) return review.email.split('@')[0];
    return 'Cliente FutureLabs';
  }

  formatDate(date) {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  }

  escapeHTML(value) {
    if (!value) return '';
    return value.replace(/[&<>"']/g, (char) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return map[char] || char;
    });
  }
}

window.reviewsManager = new ReviewsManager();
