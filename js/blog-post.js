// 📝 Blog Post Logic - SneakersShop
document.addEventListener('DOMContentLoaded', () => {
    // Initialize standard components
    const headerContainer = document.getElementById('mainHeader');
    if (headerContainer && window.Components) {
        headerContainer.innerHTML = window.Components.getHeader(true, true);
        window.Components.initHeader();
        window.Components.initSearch();
        window.Components.initCartCounter();
    }

    const footerContainer = document.getElementById('mainFooter');
    if (footerContainer && window.Components) {
        footerContainer.innerHTML = window.Components.getFooter();
    }

    // Load Post
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (slug) {
        loadBlogPost(slug);
    } else {
        renderError('Artículo no encontrado');
    }
});

async function loadBlogPost(slug) {
    const container = document.getElementById('blogPostContainer');

    try {
        // Find post by slug via searching all posts (since we don't have a direct slug endpoint enabled yet in public API based on previous reads, but let's try standard filtering or find in client side if list is small, or assume endpoint exists)
        // Checking js/api.js previously showing getBlogPosts. Let's assume we fetch all and find, or if there's a getBySlug.
        // Actually, looking at previous logs, api.js usually has RESTful standards.
        // Let's try to get all and find, or implement a specific request.
        // SAFE BET: Fetch recent posts and find, or generic get.
        // NOTE: In a real app we'd have getPostBySlug. 
        // I will use window.api.getBlogPosts() and filter client side for now as a fallback if specific endpoint isn't obvious, 
        // OR better, assuming proper backend, I'd query `/blog/posts?slug=${slug}`.
        // Let's look at api.js capability... I recall seeing `getBlogPosts`.

        // Simulating single post fetch for now using list filtering
        const response = await window.api.getBlogPosts(1, 100);

        if (response.success) {
            const post = response.data.posts.find(p => p.slug === slug);
            if (post) {
                renderPost(post);
            } else {
                renderError('Artículo no encontrado');
            }
        } else {
            renderError('Error al cargar el artículo');
        }
    } catch (error) {
        console.error('Error loading post:', error);
        renderError('Error de conexión');
    }
}

function renderPost(post) {
    const container = document.getElementById('blogPostContainer');
    document.title = `${post.title} - SneakersShop Blog`;
    document.getElementById('postTitle').textContent = post.title;

    container.innerHTML = `
        <article class="blog-post-content">
            <header class="blog-post-header">
                ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}">` : ''}
            </header>
            
            <div class="blog-meta-single" style="margin-top: 20px;">
                <span><i class="far fa-user"></i> ${post.author || 'Admin'}</span>
                <span><i class="far fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString()}</span>
                ${post.category ? `<span><i class="far fa-folder"></i> ${post.category}</span>` : ''}
            </div>

            <div class="blog-body">
                ${post.content}
            </div>

            <footer class="blog-footer">
                <a href="blog.html" class="btn btn-outline">
                    <i class="fas fa-arrow-left"></i> Volver al Blog
                </a>
            </footer>
        </article>
    `;
}

function renderError(message) {
    const container = document.getElementById('blogPostContainer');
    container.innerHTML = `
        <div class="alert alert-error" style="text-align: center; margin-top: 50px;">
            <i class="fas fa-exclamation-circle"></i> ${message}
            <br><br>
            <a href="blog.html" class="btn btn-primary">Volver al Blog</a>
        </div>
    `;
}
