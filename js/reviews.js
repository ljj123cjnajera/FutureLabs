// ⭐ Sistema de Reviews - FutureLabs

class ReviewsManager {
    constructor() {
        this.reviews = [];
        this.currentFilter = 'all';
        this.currentSort = 'recent';
    }

    // Cargar reviews de un producto
    async loadReviews(productId) {
        try {
            const response = await window.api.getProductReviews(productId);
            
            if (response.success) {
                this.reviews = response.data.reviews || [];
                return this.reviews;
            }
            
            return [];
        } catch (error) {
            console.error('Error al cargar reviews:', error);
            return [];
        }
    }

    // Agregar review
    async addReview(productId, data) {
        try {
            const response = await window.api.addReview(productId, data);
            
            if (response.success) {
                this.reviews.unshift(response.data.review);
                window.notifications.success('Review agregada exitosamente');
                return true;
            } else {
                throw new Error(response.message || 'Error al agregar review');
            }
        } catch (error) {
            console.error('Error al agregar review:', error);
            window.notifications.error(error.message || 'Error al agregar review');
            return false;
        }
    }

    // Calificar review como útil
    async markHelpful(reviewId) {
        try {
            const response = await window.api.markReviewHelpful(reviewId);
            
            if (response.success) {
                const review = this.reviews.find(r => r.id === reviewId);
                if (review) {
                    review.helpful_count = (review.helpful_count || 0) + 1;
                }
                window.notifications.success('Gracias por tu feedback');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al marcar review como útil:', error);
            return false;
        }
    }

    // Responder a review
    async replyToReview(reviewId, reply) {
        try {
            const response = await window.api.replyToReview(reviewId, reply);
            
            if (response.success) {
                const review = this.reviews.find(r => r.id === reviewId);
                if (review) {
                    review.reply = response.data.reply;
                }
                window.notifications.success('Respuesta agregada exitosamente');
                return true;
            } else {
                throw new Error(response.message || 'Error al responder review');
            }
        } catch (error) {
            console.error('Error al responder review:', error);
            window.notifications.error(error.message || 'Error al responder review');
            return false;
        }
    }

    // Filtrar reviews
    filterReviews(filter) {
        this.currentFilter = filter;
        return this.getFilteredReviews();
    }

    // Ordenar reviews
    sortReviews(sort) {
        this.currentSort = sort;
        return this.getSortedReviews();
    }

    // Obtener reviews filtradas
    getFilteredReviews() {
        let filtered = [...this.reviews];
        
        switch(this.currentFilter) {
            case '5':
                filtered = filtered.filter(r => r.rating === 5);
                break;
            case '4':
                filtered = filtered.filter(r => r.rating === 4);
                break;
            case '3':
                filtered = filtered.filter(r => r.rating === 3);
                break;
            case '2':
                filtered = filtered.filter(r => r.rating === 2);
                break;
            case '1':
                filtered = filtered.filter(r => r.rating === 1);
                break;
            case 'with-photos':
                filtered = filtered.filter(r => r.images && r.images.length > 0);
                break;
            default:
                break;
        }
        
        return this.getSortedReviews(filtered);
    }

    // Obtener reviews ordenadas
    getSortedReviews(reviews = null) {
        const revs = reviews || [...this.reviews];
        
        switch(this.currentSort) {
            case 'recent':
                return revs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'oldest':
                return revs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'highest':
                return revs.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return revs.sort((a, b) => a.rating - b.rating);
            case 'helpful':
                return revs.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
            default:
                return revs;
        }
    }

    // Calcular estadísticas de reviews
    getStats() {
        const total = this.reviews.length;
        const average = total > 0 
            ? this.reviews.reduce((sum, r) => sum + r.rating, 0) / total 
            : 0;
        
        const distribution = {
            5: this.reviews.filter(r => r.rating === 5).length,
            4: this.reviews.filter(r => r.rating === 4).length,
            3: this.reviews.filter(r => r.rating === 3).length,
            2: this.reviews.filter(r => r.rating === 2).length,
            1: this.reviews.filter(r => r.rating === 1).length
        };
        
        return {
            total,
            average: average.toFixed(1),
            distribution
        };
    }

    // Generar estrellas
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    // Renderizar reviews
    renderReviews(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const filteredReviews = this.getFilteredReviews();
        
        if (filteredReviews.length === 0) {
            container.innerHTML = `
                <div class="empty-reviews">
                    <i class="far fa-star"></i>
                    <p>No hay reviews disponibles</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            ${review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div class="reviewer-details">
                            <div class="reviewer-name">${review.user_name || 'Usuario'}</div>
                            <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        <div class="stars">${this.generateStars(review.rating)}</div>
                    </div>
                </div>
                <div class="review-content">
                    <h4>${review.title || ''}</h4>
                    <p>${review.comment}</p>
                </div>
                ${review.images && review.images.length > 0 ? `
                <div class="review-images">
                    ${review.images.map(img => `
                        <img src="${img}" alt="Review image">
                    `).join('')}
                </div>
                ` : ''}
                <div class="review-footer">
                    <button class="btn btn-ghost btn-sm" onclick="markHelpful(${review.id})">
                        <i class="fas fa-thumbs-up"></i> Útil (${review.helpful_count || 0})
                    </button>
                </div>
                ${review.reply ? `
                <div class="review-reply">
                    <div class="reply-header">
                        <i class="fas fa-store"></i>
                        <strong>Respuesta de FutureLabs</strong>
                    </div>
                    <p>${review.reply}</p>
                </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Renderizar estadísticas
    renderStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const stats = this.getStats();
        
        container.innerHTML = `
            <div class="reviews-stats">
                <div class="stats-overview">
                    <div class="stats-average">
                        <div class="average-number">${stats.average}</div>
                        <div class="average-stars">${this.generateStars(stats.average)}</div>
                        <div class="average-total">${stats.total} reviews</div>
                    </div>
                </div>
                <div class="stats-distribution">
                    ${[5, 4, 3, 2, 1].map(rating => {
                        const count = stats.distribution[rating];
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return `
                            <div class="distribution-item">
                                <span class="distribution-rating">${rating} estrellas</span>
                                <div class="distribution-bar">
                                    <div class="distribution-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="distribution-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Renderizar formulario de review
    renderReviewForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!window.authManager.isAuthenticated()) {
            container.innerHTML = `
                <div class="review-form-login">
                    <p>Inicia sesión para agregar una review</p>
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">Iniciar Sesión</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="review-form">
                <h3>Agregar Review</h3>
                <div class="form-group">
                    <label class="form-label required">Calificación</label>
                    <div class="rating-input">
                        ${[1, 2, 3, 4, 5].map(rating => `
                            <button type="button" class="star-btn" data-rating="${rating}" onclick="selectRating(${rating})">
                                <i class="far fa-star"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-input" id="reviewTitle" placeholder="Resumen de tu experiencia">
                </div>
                <div class="form-group">
                    <label class="form-label required">Comentario</label>
                    <textarea class="form-textarea" id="reviewComment" placeholder="Comparte tu experiencia con este producto..." rows="5"></textarea>
                </div>
                <button class="btn btn-primary" onclick="submitReview()">
                    <i class="fas fa-paper-plane"></i> Enviar Review
                </button>
            </div>
        `;
    }
}

// Crear instancia global
window.reviewsManager = new ReviewsManager();

// Funciones globales para el HTML
let selectedRating = 0;

function selectRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((btn, index) => {
        const starIcon = btn.querySelector('i');
        if (index < rating) {
            starIcon.classList.remove('far');
            starIcon.classList.add('fas');
        } else {
            starIcon.classList.remove('fas');
            starIcon.classList.add('far');
        }
    });
}

async function submitReview() {
    const title = document.getElementById('reviewTitle').value;
    const comment = document.getElementById('reviewComment').value;
    
    if (!selectedRating) {
        window.notifications.warning('Selecciona una calificación');
        return;
    }
    
    if (!comment || comment.length < 10) {
        window.notifications.warning('El comentario debe tener al menos 10 caracteres');
        return;
    }
    
    const productId = window.currentProductId;
    if (!productId) {
        window.notifications.error('Error: Producto no identificado');
        return;
    }
    
    const success = await window.reviewsManager.addReview(productId, {
        rating: selectedRating,
        title,
        comment
    });
    
    if (success) {
        // Recargar reviews
        await window.reviewsManager.loadReviews(productId);
        window.reviewsManager.renderReviews('reviewsContainer');
        window.reviewsManager.renderStats('reviewsStats');
        
        // Limpiar formulario
        document.getElementById('reviewTitle').value = '';
        document.getElementById('reviewComment').value = '';
        selectedRating = 0;
        selectRating(0);
    }
}

async function markHelpful(reviewId) {
    await window.reviewsManager.markHelpful(reviewId);
    window.reviewsManager.renderReviews('reviewsContainer');
}

function filterReviews(filter) {
    window.reviewsManager.filterReviews(filter);
    window.reviewsManager.renderReviews('reviewsContainer');
}

function sortReviews(sort) {
    window.reviewsManager.sortReviews(sort);
    window.reviewsManager.renderReviews('reviewsContainer');
}
