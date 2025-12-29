/**
 * SEO MANAGER (Dynamic Meta Engine)
 * Handles OpenGraph, Twitter Cards, and Document Titles dynamically.
 */
class SeoManager {
    /**
     * Update page title
     * @param {string} title 
     */
    static updateTitle(title) {
        document.title = `${title} | Sneakers Shop`;
    }

    /**
     * Update a specific meta tag by name or property
     * @param {string} attrName 'name' or 'property'
     * @param {string} attrValue The value of the attribute (e.g. 'description', 'og:title')
     * @param {string} content The new content
     */
    static updateMeta(attrName, attrValue, content) {
        let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (!element) {
            // Create if missing
            element = document.createElement('meta');
            element.setAttribute(attrName, attrValue);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    }

    /**
     * Update all Open Graph / SEO tags for a product
     * @param {Object} data { title, description, image, url, price, currency }
     */
    static updateProductSEO(data) {
        // Basic
        this.updateTitle(data.title.toUpperCase());
        this.updateMeta('name', 'description', data.description);

        // Open Graph
        this.updateMeta('property', 'og:title', data.title);
        this.updateMeta('property', 'og:description', data.description);
        this.updateMeta('property', 'og:image', data.image);
        this.updateMeta('property', 'og:url', data.url);
        this.updateMeta('property', 'og:type', 'product');

        // Twitter
        this.updateMeta('name', 'twitter:title', data.title);
        this.updateMeta('name', 'twitter:description', data.description);
        this.updateMeta('name', 'twitter:image', data.image);
        this.updateMeta('name', 'twitter:card', 'summary_large_image');

        console.log(`✅ [SEO] Updated tags for: ${data.title}`);
    }
}

// Global export
window.SeoManager = SeoManager;
