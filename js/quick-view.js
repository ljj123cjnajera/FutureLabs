/**
 * Quick View Modal - Vista rápida de producto
 * Muestra un modal con imagen, precio y acciones (añadir al carrito / ver detalle).
 * Depende: api.js, components (opcional), cart.js (opcional), notifications (opcional).
 */
(function () {
  'use strict';

  const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='45%25' text-anchor='middle'%3ESNEAKERS%3C/text%3E%3Ctext fill='%236b7280' font-family='system-ui, -apple-system, sans-serif' font-size='28' font-weight='900' x='50%25' y='60%25' text-anchor='middle'%3ESHOP%3C/text%3E%3C/svg%3E";

  function resolveImageUrl(product) {
    if (product.image_url &&
        String(product.image_url).trim() !== '' &&
        !String(product.image_url).includes('undefined') &&
        !String(product.image_url).includes('null') &&
        (product.image_url.startsWith('http') || product.image_url.startsWith('/') || product.image_url.startsWith('assets/'))) {
      return product.image_url;
    }
    if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      const first = product.images[0];
      if (first && String(first).trim() !== '' && !String(first).includes('undefined')) return first;
    }
    if (typeof product.images === 'string' && String(product.images).trim() !== '') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch (_) {}
    }
    return placeholderImg;
  }

  function getProductPayload(res) {
    var p = res;
    if (p && (p.id || p.product_id) && (p.price !== undefined || p.name)) return p;
    if (res && res.data && res.data.id) return res.data;
    if (res && res.data && res.data.product) return res.data.product;
    if (res && res.product) return res.product;
    return null;
  }

  var modalEl = null;
  var isOpen = false;

  function close() {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    isOpen = false;
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onKeyDown);
    if (modalEl._backdrop) modalEl._backdrop.removeEventListener('click', close);
    if (modalEl._closeBtn) modalEl._closeBtn.removeEventListener('click', close);
  }

  function onKeyDown(ev) {
    if (ev.key === 'Escape') close();
  }

  async function show(productId) {
    if (!productId || !window.api) {
      window.location.href = 'product-detail.html?id=' + (productId || '');
      return;
    }
    if (isOpen) close();

    // Reuse or create modal container
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'quick-view-modal';
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.setAttribute('aria-label', 'Vista rápida del producto');
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = '';
    modalEl.classList.add('active');
    isOpen = true;
    document.body.style.overflow = 'hidden';
    window.removeEventListener('keydown', onKeyDown);
    window.addEventListener('keydown', onKeyDown);

    // Loading state
    var loadingHtml = '<div class="quick-view-overlay"></div><div class="quick-view-content"><div class="quick-view-body" style="padding: 3rem; text-align: center;"><div class="loading-spinner" style="margin: 0 auto 1rem;"></div><p>Cargando producto...</p></div></div>';
    modalEl.innerHTML = loadingHtml;

    var overlay = modalEl.querySelector('.quick-view-overlay');
    if (overlay) {
      modalEl._backdrop = overlay;
      overlay.addEventListener('click', close);
    }

    try {
      var res = await window.api.getProduct(productId);
      var product = getProductPayload(res);
      if (!product) {
        if (window.notifications) window.notifications.error('Error', 'Producto no encontrado.');
        close();
        window.removeEventListener('keydown', onKeyDown);
        return;
      }

      var id = product.id || product.product_id || productId;
      var name = product.name || 'Producto';
      var price = parseFloat(product.discount_price || product.price || 0);
      var priceOld = product.discount_price != null && product.price != null && product.price > product.discount_price
        ? parseFloat(product.price) : null;
      var brand = product.brand || 'Sneakers';
      var imageUrl = resolveImageUrl(product);
      if (!imageUrl || imageUrl.includes('undefined') || imageUrl.includes('null')) imageUrl = placeholderImg;

      var badge = '';
      if (priceOld != null && priceOld > price) {
        var off = Math.round(((priceOld - price) / priceOld) * 100);
        badge = '<span class="quick-view-badge">-' + off + '%</span>';
      }

      var priceHtml = priceOld != null
        ? '<span class="quick-view-price-old">S/ ' + priceOld.toFixed(2) + '</span><span class="quick-view-price">S/ ' + price.toFixed(2) + '</span>'
        : '<span class="quick-view-price">S/ ' + price.toFixed(2) + '</span>';

      var isOutOfStock = (product.stock_quantity != null && product.stock_quantity === 0);

      var html =
        '<div class="quick-view-overlay" aria-hidden="true"></div>' +
        '<div class="quick-view-content">' +
        '<button type="button" class="quick-view-close" aria-label="Cerrar">×</button>' +
        '<div class="quick-view-body">' +
        '<div class="quick-view-product">' +
        '<div class="quick-view-image">' + badge + '<img src="' + imageUrl + '" alt="' + (name.replace(/"/g, '&quot;')) + '" onerror="this.onerror=null;this.src=\'' + placeholderImg + '\';">' + '</div>' +
        '<div class="quick-view-info">' +
        '<span class="quick-view-brand">' + (brand.replace(/</g, '&lt;')) + '</span>' +
        '<h2 class="quick-view-title">' + (name.replace(/</g, '&lt;')) + '</h2>' +
        '<div class="quick-view-price-wrap">' + priceHtml + '</div>' +
        '<div class="quick-view-actions">' +
        (isOutOfStock
          ? '<button type="button" class="btn btn-outline" disabled>AGOTADO</button>'
          : '<button type="button" class="btn btn-primary quick-view-add-cart" data-id="' + id + '"><i class="fas fa-shopping-cart"></i> AGREGAR AL CARRITO</button>') +
        '<a href="product-detail.html?id=' + id + '" class="btn btn-outline">VER DETALLE</a>' +
        '</div></div></div></div>';

      modalEl.innerHTML = html;

      var ov = modalEl.querySelector('.quick-view-overlay');
      if (ov) { modalEl._backdrop = ov; ov.addEventListener('click', close); }
      var cb = modalEl.querySelector('.quick-view-close');
      if (cb) { modalEl._closeBtn = cb; cb.addEventListener('click', close); }

      var addBtn = modalEl.querySelector('.quick-view-add-cart');
      if (addBtn) {
        addBtn.addEventListener('click', async function (e) {
          e.preventDefault();
          addBtn.disabled = true;
          addBtn.textContent = '...';
          window.currentProduct = product;
          var cart = window.cartEngine || window.cartManager;
          if (cart && typeof cart.add === 'function') {
            try {
              var ok = await cart.add(id, 1, {});
              if (ok && window.notifications) window.notifications.success('Agregado al Carrito', name);
              close();
            } catch (err) {
              if (window.Logger) window.Logger.error('QuickView add to cart:', err);
              if (window.notifications) window.notifications.error('Error', 'No se pudo agregar al carrito.');
            }
          } else {
            try {
              await window.api.addToCart(id, 1, {});
              if (window.Components && window.Components.updateCartCount) window.Components.updateCartCount();
              if (window.notifications) window.notifications.success('Agregado al Carrito', name);
              close();
            } catch (err) {
              if (window.Logger) window.Logger.error('QuickView add to cart:', err);
              if (window.notifications) window.notifications.error('Error', 'No se pudo agregar al carrito.');
            }
          }
          addBtn.disabled = false;
          addBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> AGREGAR AL CARRITO';
        });
      }

    } catch (err) {
      if (window.Logger) window.Logger.error('QuickView load:', err);
      if (window.notifications) window.notifications.error('Error', 'No se pudo cargar el producto.');
      close();
    }
  }

  window.quickView = { show: show, close: close };
})();
