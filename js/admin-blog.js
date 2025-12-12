// 📰 Gestión de Blog
class AdminBlog {
    constructor() {
        this.currentPostId = null;
        this.posts = [];
    }

    async loadPosts() {
        const tbody = document.getElementById('blogTable');
        if (!tbody) return;

        window.loadingState.renderLoading(tbody, 'Cargando entradas del blog...', { className: 'text-center p-5' });

        try {
            const response = await window.api.getAllBlogPosts();
            if (response.success) {
                this.posts = response.data.posts;
                this.renderTable();
            } else {
                window.loadingState.renderError(tbody, 'Error al cargar blog');
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
            window.loadingState.renderError(tbody, 'Error de conexión');
        }
    }

    renderTable() {
        const tbody = document.getElementById('blogTable');
        if (!tbody) return;

        if (this.posts.length === 0) {
            window.loadingState.renderEmpty(tbody, 'No hay entradas de blog');
            return;
        }

        tbody.innerHTML = this.posts.map(post => `
            <tr>
                <td>
                    <img src="${post.image_url || 'https://via.placeholder.com/50'}" alt="${post.title}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td>
                    <div style="font-weight: 600;">${post.title}</div>
                    <div style="font-size: 12px; color: #666;">/${post.slug}</div>
                </td>
                <td>${post.author}</td>
                <td>
                    <span class="badge badge-${post.published ? 'success' : 'warning'}">
                        ${post.published ? 'Publicado' : 'Borrador'}
                    </span>
                </td>
                <td>${new Date(post.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="window.adminBlog.openModal('${post.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="window.adminBlog.deletePost('${post.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <a href="blog.html?post=${post.slug}" target="_blank" class="btn-action btn-view">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </td>
            </tr>
        `).join('');
    }

    openModal(postId = null) {
        const modal = document.getElementById('blogModal');
        const form = document.getElementById('blogForm');

        form.reset();
        this.currentPostId = postId;
        document.getElementById('blogImagePreviewContainer').style.display = 'none';
        document.getElementById('blogImageFileName').textContent = '';

        if (postId) {
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                document.getElementById('blogModalTitle').textContent = 'Editar Entrada';
                document.getElementById('blogId').value = post.id;
                document.getElementById('blogTitle').value = post.title;
                document.getElementById('blogSlug').value = post.slug;
                document.getElementById('blogExcerpt').value = post.excerpt || '';
                document.getElementById('blogContent').value = post.content || '';
                document.getElementById('blogAuthor').value = post.author || 'Admin';
                document.getElementById('blogStatus').value = post.published ? 'published' : 'draft';

                if (post.image_url) {
                    const preview = document.getElementById('blogPreviewImage');
                    preview.src = post.image_url;
                    document.getElementById('blogImagePreviewContainer').style.display = 'block';
                }
            }
        } else {
            document.getElementById('blogModalTitle').textContent = 'Crear Entrada';
            document.getElementById('blogStatus').value = 'published';
        }

        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('blogModal').style.display = 'none';
        this.currentPostId = null;
    }

    previewImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById('blogPreviewImage');
                preview.src = e.target.result;
                document.getElementById('blogImagePreviewContainer').style.display = 'block';
                document.getElementById('blogImageFileName').textContent = input.files[0].name;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    async savePost(e) {
        e.preventDefault();

        // Auto-generate slug if dry
        const title = document.getElementById('blogTitle').value;
        const slugInput = document.getElementById('blogSlug');
        if (!slugInput.value && title) {
            slugInput.value = title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        const formData = {
            title: title,
            slug: slugInput.value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: document.getElementById('blogContent').value,
            author: document.getElementById('blogAuthor').value,
            published: document.getElementById('blogStatus').value === 'published'
        };

        // Handle Image Upload logic locally if needed, but for now assuming typical JSON payload
        // Actually, if there is a file, we might need to upload it first or use FormData if API supports multipart
        // js/api.js has createBlogPost accepting JSON. So we need to upload image first if changed.

        const fileInput = document.getElementById('blogImageFile');
        let imageUrl = null;

        if (fileInput.files.length > 0) {
            const uploadRes = await window.api.uploadImage(fileInput.files[0]);
            if (uploadRes.success) {
                imageUrl = uploadRes.data.url; // Adjust based on actual API response structure
            } else {
                window.notifications.error('Error al subir imagen: ' + uploadRes.message);
                return;
            }
        } else if (this.currentPostId) {
            const post = this.posts.find(p => p.id === this.currentPostId);
            imageUrl = post.image_url;
        }

        if (imageUrl) {
            formData.image_url = imageUrl;
        }

        try {
            let response;
            if (this.currentPostId) {
                response = await window.api.updateBlogPost(this.currentPostId, formData);
            } else {
                response = await window.api.createBlogPost(formData);
            }

            if (response.success) {
                window.notifications.success(this.currentPostId ? 'Entrada actualizada' : 'Entrada creada');
                this.closeModal();
                this.loadPosts();
            } else {
                window.notifications.error(response.message || 'Error al guardar entrada');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            window.notifications.error('Error al guardar entrada');
        }
    }

    async deletePost(id) {
        if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;

        try {
            const response = await window.api.deleteBlogPost(id);
            if (response.success) {
                window.notifications.success('Entrada eliminada');
                this.loadPosts();
            } else {
                window.notifications.error(response.message || 'Error al eliminar entrada');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            window.notifications.error('Error al eliminar entrada');
        }
    }
}

// Inicializar y exponer globalmente
window.adminBlog = new AdminBlog();

// Event Listener para el formulario
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('blogForm');
    if (form) {
        form.addEventListener('submit', (e) => window.adminBlog.savePost(e));

        // Auto slug generator on title change
        document.getElementById('blogTitle').addEventListener('input', function () {
            if (!window.adminBlog.currentPostId) { // Only for new posts
                const slug = this.value.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                document.getElementById('blogSlug').value = slug;
            }
        });
    }
});
