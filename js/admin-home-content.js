// 🏠 Gestión de Contenido del Home
class AdminHomeContent {
  constructor() {
    this.currentEditId = null;
    this.init();
  }

  init() {
    // Agregar event listeners a los formularios
    document.getElementById('heroSlideForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHeroSlide();
    });

    document.getElementById('bannerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBanner();
    });

    document.getElementById('benefitForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBenefit();
    });

    document.getElementById('homeSectionForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHomeSection();
    });
  }

  // ===== HERO SLIDES =====
  async loadHeroSlides() {
    try {
      const response = await window.api.getAdminHeroSlides();
      if (response.success) {
        this.renderHeroSlidesTable(response.data.slides);
      }
    } catch (error) {
      console.error('Error loading hero slides:', error);
      window.notifications?.error('Error al cargar hero slides');
    }
  }

  renderHeroSlidesTable(slides) {
    const container = document.getElementById('heroSlidesTable');
    if (!container) return;

    if (!slides || slides.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No hay slides. Crea uno nuevo.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Título</th>
            <th>Imagen</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${slides.map(slide => `
            <tr>
              <td>${slide.order_index || 0}</td>
              <td>${slide.title}</td>
              <td>
                ${slide.image_url ? `<img src="${slide.image_url}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">` : '-'}
              </td>
              <td>${slide.is_active ? '<span style="color: green;">Activo</span>' : '<span style="color: red;">Inactivo</span>'}</td>
              <td>
                <button class="btn-small" onclick="adminHomeContent.editHeroSlide('${slide.id}')">Editar</button>
                <button class="btn-small btn-danger" onclick="adminHomeContent.deleteHeroSlide('${slide.id}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  openHeroSlideModal(id = null) {
    this.currentEditId = id;
    const modal = document.getElementById('heroSlideModal');
    const title = document.getElementById('heroSlideModalTitle');
    
    title.textContent = id ? 'Editar Hero Slide' : 'Crear Hero Slide';
    document.getElementById('heroSlideForm').reset();
    
    if (id) {
      this.loadHeroSlideForEdit(id);
    }
    
    modal.style.display = 'flex';
  }

  async loadHeroSlideForEdit(id) {
    try {
      const slides = await window.api.getAdminHeroSlides();
      const slide = slides.data.slides.find(s => s.id === id);
      
      if (slide) {
        document.getElementById('heroSlideTitle').value = slide.title || '';
        document.getElementById('heroSlideDescription').value = slide.description || '';
        document.getElementById('heroSlideButtonText').value = slide.button_text || '';
        document.getElementById('heroSlideButtonLink').value = slide.button_link || '';
        document.getElementById('heroSlideImageUrl').value = slide.image_url || '';
        document.getElementById('heroSlideBackgroundColor').value = slide.background_color || '#667eea';
        document.getElementById('heroSlideOrder').value = slide.order_index || 0;
        document.getElementById('heroSlideIsActive').checked = slide.is_active !== false;
        
        if (slide.image_url) {
          document.getElementById('heroSlidePreview').src = slide.image_url;
          document.getElementById('heroSlidePreviewContainer').style.display = 'block';
        }
      }
    } catch (error) {
      window.notifications?.error('Error al cargar slide');
    }
  }

  async saveHeroSlide() {
    const formData = {
      title: document.getElementById('heroSlideTitle').value.trim(),
      description: document.getElementById('heroSlideDescription').value.trim() || null,
      button_text: document.getElementById('heroSlideButtonText').value.trim() || null,
      button_link: document.getElementById('heroSlideButtonLink').value.trim() || null,
      image_url: document.getElementById('heroSlideImageUrl').value.trim() || null,
      background_color: document.getElementById('heroSlideBackgroundColor').value,
      order_index: parseInt(document.getElementById('heroSlideOrder').value) || 0,
      is_active: document.getElementById('heroSlideIsActive').checked
    };

    // Subir imagen si hay archivo
    const imageFile = document.getElementById('heroSlideImageFile').files[0];
    if (imageFile) {
      try {
        const uploadResponse = await window.api.uploadImage(imageFile);
        if (uploadResponse.success) {
          formData.image_url = uploadResponse.data.url;
        }
      } catch (error) {
        window.notifications?.error('Error al subir imagen');
        return;
      }
    }

    try {
      let response;
      if (this.currentEditId) {
        response = await window.api.updateHeroSlide(this.currentEditId, formData);
      } else {
        response = await window.api.createHeroSlide(formData);
      }

      if (response.success) {
        window.notifications?.success(response.message || 'Slide guardado exitosamente');
        document.getElementById('heroSlideModal').style.display = 'none';
        this.loadHeroSlides();
      }
    } catch (error) {
      window.notifications?.error('Error al guardar slide');
    }
  }

  async deleteHeroSlide(id) {
    if (!confirm('¿Estás seguro de eliminar este slide?')) return;

    try {
      const response = await window.api.deleteHeroSlide(id);
      if (response.success) {
        window.notifications?.success('Slide eliminado exitosamente');
        this.loadHeroSlides();
      }
    } catch (error) {
      window.notifications?.error('Error al eliminar slide');
    }
  }

  editHeroSlide(id) {
    this.openHeroSlideModal(id);
  }

  // ===== BANNERS =====
  async loadBanners() {
    try {
      const response = await window.api.getAdminBanners();
      if (response.success) {
        this.renderBannersTable(response.data.banners);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      window.notifications?.error('Error al cargar banners');
    }
  }

  renderBannersTable(banners) {
    const container = document.getElementById('bannersTable');
    if (!container) return;

    if (!banners || banners.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No hay banners. Crea uno nuevo.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Posición</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${banners.map(banner => `
            <tr>
              <td>${banner.order_index || 0}</td>
              <td>${banner.title}</td>
              <td>${banner.banner_type}</td>
              <td>${banner.position || '-'}</td>
              <td>${banner.is_active ? '<span style="color: green;">Activo</span>' : '<span style="color: red;">Inactivo</span>'}</td>
              <td>
                <button class="btn-small" onclick="adminHomeContent.editBanner('${banner.id}')">Editar</button>
                <button class="btn-small btn-danger" onclick="adminHomeContent.deleteBanner('${banner.id}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  openBannerModal(id = null) {
    this.currentEditId = id;
    const modal = document.getElementById('bannerModal');
    const title = document.getElementById('bannerModalTitle');
    
    title.textContent = id ? 'Editar Banner' : 'Crear Banner';
    document.getElementById('bannerForm').reset();
    
    if (id) {
      this.loadBannerForEdit(id);
    }
    
    modal.style.display = 'flex';
  }

  async loadBannerForEdit(id) {
    try {
      const banners = await window.api.getAdminBanners();
      const banner = banners.data.banners.find(b => b.id === id);
      
      if (banner) {
        document.getElementById('bannerTitle').value = banner.title || '';
        document.getElementById('bannerDescription').value = banner.description || '';
        document.getElementById('bannerButtonText').value = banner.button_text || '';
        document.getElementById('bannerButtonLink').value = banner.button_link || '';
        document.getElementById('bannerImageUrl').value = banner.image_url || '';
        document.getElementById('bannerType').value = banner.banner_type || 'promo';
        document.getElementById('bannerPosition').value = banner.position || '';
        document.getElementById('bannerStartDate').value = banner.start_date || '';
        document.getElementById('bannerEndDate').value = banner.end_date || '';
        document.getElementById('bannerOrder').value = banner.order_index || 0;
        document.getElementById('bannerIsActive').checked = banner.is_active !== false;
        
        if (banner.image_url) {
          document.getElementById('bannerPreview').src = banner.image_url;
          document.getElementById('bannerPreviewContainer').style.display = 'block';
        }
      }
    } catch (error) {
      window.notifications?.error('Error al cargar banner');
    }
  }

  async saveBanner() {
    const formData = {
      title: document.getElementById('bannerTitle').value.trim(),
      description: document.getElementById('bannerDescription').value.trim() || null,
      button_text: document.getElementById('bannerButtonText').value.trim() || null,
      button_link: document.getElementById('bannerButtonLink').value.trim() || null,
      image_url: document.getElementById('bannerImageUrl').value.trim() || null,
      banner_type: document.getElementById('bannerType').value,
      position: document.getElementById('bannerPosition').value || null,
      start_date: document.getElementById('bannerStartDate').value || null,
      end_date: document.getElementById('bannerEndDate').value || null,
      order_index: parseInt(document.getElementById('bannerOrder').value) || 0,
      is_active: document.getElementById('bannerIsActive').checked
    };

    // Subir imagen si hay archivo
    const imageFile = document.getElementById('bannerImageFile').files[0];
    if (imageFile) {
      try {
        const uploadResponse = await window.api.uploadImage(imageFile);
        if (uploadResponse.success) {
          formData.image_url = uploadResponse.data.url;
        }
      } catch (error) {
        window.notifications?.error('Error al subir imagen');
        return;
      }
    }

    try {
      let response;
      if (this.currentEditId) {
        response = await window.api.updateBanner(this.currentEditId, formData);
      } else {
        response = await window.api.createBanner(formData);
      }

      if (response.success) {
        window.notifications?.success(response.message || 'Banner guardado exitosamente');
        document.getElementById('bannerModal').style.display = 'none';
        this.loadBanners();
      }
    } catch (error) {
      window.notifications?.error('Error al guardar banner');
    }
  }

  async deleteBanner(id) {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;

    try {
      const response = await window.api.deleteBanner(id);
      if (response.success) {
        window.notifications?.success('Banner eliminado exitosamente');
        this.loadBanners();
      }
    } catch (error) {
      window.notifications?.error('Error al eliminar banner');
    }
  }

  editBanner(id) {
    this.openBannerModal(id);
  }

  // ===== BENEFITS =====
  async loadBenefits() {
    try {
      const response = await window.api.getAdminBenefits();
      if (response.success) {
        this.renderBenefitsTable(response.data.benefits);
      }
    } catch (error) {
      console.error('Error loading benefits:', error);
      window.notifications?.error('Error al cargar beneficios');
    }
  }

  renderBenefitsTable(benefits) {
    const container = document.getElementById('benefitsTable');
    if (!container) return;

    if (!benefits || benefits.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No hay beneficios. Crea uno nuevo.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Título</th>
            <th>Icono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${benefits.map(benefit => `
            <tr>
              <td>${benefit.order_index || 0}</td>
              <td>${benefit.title}</td>
              <td>
                ${benefit.icon ? `<i class="${benefit.icon}"></i>` : '-'}
              </td>
              <td>${benefit.is_active ? '<span style="color: green;">Activo</span>' : '<span style="color: red;">Inactivo</span>'}</td>
              <td>
                <button class="btn-small" onclick="adminHomeContent.editBenefit('${benefit.id}')">Editar</button>
                <button class="btn-small btn-danger" onclick="adminHomeContent.deleteBenefit('${benefit.id}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  openBenefitModal(id = null) {
    this.currentEditId = id;
    const modal = document.getElementById('benefitModal');
    const title = document.getElementById('benefitModalTitle');
    
    title.textContent = id ? 'Editar Beneficio' : 'Crear Beneficio';
    document.getElementById('benefitForm').reset();
    
    if (id) {
      this.loadBenefitForEdit(id);
    }
    
    modal.style.display = 'flex';
  }

  async loadBenefitForEdit(id) {
    try {
      const benefits = await window.api.getAdminBenefits();
      const benefit = benefits.data.benefits.find(b => b.id === id);
      
      if (benefit) {
        document.getElementById('benefitTitle').value = benefit.title || '';
        document.getElementById('benefitDescription').value = benefit.description || '';
        document.getElementById('benefitIcon').value = benefit.icon || '';
        document.getElementById('benefitImageUrl').value = benefit.image_url || '';
        document.getElementById('benefitBackgroundColor').value = benefit.background_color || '#667eea';
        document.getElementById('benefitOrder').value = benefit.order_index || 0;
        document.getElementById('benefitIsActive').checked = benefit.is_active !== false;
        
        if (benefit.image_url) {
          document.getElementById('benefitPreview').src = benefit.image_url;
          document.getElementById('benefitPreviewContainer').style.display = 'block';
        }
      }
    } catch (error) {
      window.notifications?.error('Error al cargar beneficio');
    }
  }

  async saveBenefit() {
    const formData = {
      title: document.getElementById('benefitTitle').value.trim(),
      description: document.getElementById('benefitDescription').value.trim() || null,
      icon: document.getElementById('benefitIcon').value.trim() || null,
      image_url: document.getElementById('benefitImageUrl').value.trim() || null,
      background_color: document.getElementById('benefitBackgroundColor').value,
      order_index: parseInt(document.getElementById('benefitOrder').value) || 0,
      is_active: document.getElementById('benefitIsActive').checked
    };

    // Subir imagen si hay archivo
    const imageFile = document.getElementById('benefitImageFile').files[0];
    if (imageFile) {
      try {
        const uploadResponse = await window.api.uploadImage(imageFile);
        if (uploadResponse.success) {
          formData.image_url = uploadResponse.data.url;
        }
      } catch (error) {
        window.notifications?.error('Error al subir imagen');
        return;
      }
    }

    try {
      let response;
      if (this.currentEditId) {
        response = await window.api.updateBenefit(this.currentEditId, formData);
      } else {
        response = await window.api.createBenefit(formData);
      }

      if (response.success) {
        window.notifications?.success(response.message || 'Beneficio guardado exitosamente');
        document.getElementById('benefitModal').style.display = 'none';
        this.loadBenefits();
      }
    } catch (error) {
      window.notifications?.error('Error al guardar beneficio');
    }
  }

  async deleteBenefit(id) {
    if (!confirm('¿Estás seguro de eliminar este beneficio?')) return;

    try {
      const response = await window.api.deleteBenefit(id);
      if (response.success) {
        window.notifications?.success('Beneficio eliminado exitosamente');
        this.loadBenefits();
      }
    } catch (error) {
      window.notifications?.error('Error al eliminar beneficio');
    }
  }

  editBenefit(id) {
    this.openBenefitModal(id);
  }

  // ===== HOME SECTIONS =====
  async loadHomeSections() {
    try {
      const response = await window.api.getAdminSections();
      if (response.success) {
        this.renderHomeSectionsTable(response.data.sections);
      }
    } catch (error) {
      console.error('Error loading home sections:', error);
      window.notifications?.error('Error al cargar secciones');
    }
  }

  renderHomeSectionsTable(sections) {
    const container = document.getElementById('homeSectionsTable');
    if (!container) return;

    if (!sections || sections.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No hay secciones. Crea una nueva.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Tipo</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${sections.map(section => `
            <tr>
              <td>${section.order_index || 0}</td>
              <td>${section.section_type}</td>
              <td>${section.title || '-'}</td>
              <td>${section.is_active ? '<span style="color: green;">Activo</span>' : '<span style="color: red;">Inactivo</span>'}</td>
              <td>
                <button class="btn-small" onclick="adminHomeContent.editHomeSection('${section.id}')">Editar</button>
                <button class="btn-small btn-danger" onclick="adminHomeContent.deleteHomeSection('${section.id}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  async loadCategoriesForSection() {
    try {
      const response = await window.api.getCategories();
      const select = document.getElementById('homeSectionCategory');
      if (select && response.success) {
        select.innerHTML = '<option value="">Seleccionar...</option>' +
          response.data.categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
          ).join('');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  openHomeSectionModal(id = null) {
    this.currentEditId = id;
    const modal = document.getElementById('homeSectionModal');
    const title = document.getElementById('homeSectionModalTitle');
    
    title.textContent = id ? 'Editar Sección del Home' : 'Crear Sección del Home';
    document.getElementById('homeSectionForm').reset();
    this.loadCategoriesForSection();
    
    if (id) {
      this.loadHomeSectionForEdit(id);
    }
    
    modal.style.display = 'flex';
  }

  async loadHomeSectionForEdit(id) {
    try {
      const sections = await window.api.getAdminSections();
      const section = sections.data.sections.find(s => s.id === id);
      
      if (section) {
        document.getElementById('homeSectionType').value = section.section_type || '';
        document.getElementById('homeSectionTitle').value = section.title || '';
        document.getElementById('homeSectionCategory').value = section.category_id || '';
        document.getElementById('homeSectionLimit').value = section.limit || 8;
        document.getElementById('homeSectionOrder').value = section.order_index || 0;
        document.getElementById('homeSectionIsActive').checked = section.is_active !== false;
      }
    } catch (error) {
      window.notifications?.error('Error al cargar sección');
    }
  }

  async saveHomeSection() {
    const formData = {
      section_type: document.getElementById('homeSectionType').value,
      title: document.getElementById('homeSectionTitle').value.trim() || null,
      category_id: document.getElementById('homeSectionCategory').value || null,
      limit: parseInt(document.getElementById('homeSectionLimit').value) || 8,
      order_index: parseInt(document.getElementById('homeSectionOrder').value) || 0,
      is_active: document.getElementById('homeSectionIsActive').checked
    };

    try {
      let response;
      if (this.currentEditId) {
        response = await window.api.updateHomeSection(this.currentEditId, formData);
      } else {
        response = await window.api.createHomeSection(formData);
      }

      if (response.success) {
        window.notifications?.success(response.message || 'Sección guardada exitosamente');
        document.getElementById('homeSectionModal').style.display = 'none';
        this.loadHomeSections();
      }
    } catch (error) {
      window.notifications?.error('Error al guardar sección');
    }
  }

  async deleteHomeSection(id) {
    if (!confirm('¿Estás seguro de eliminar esta sección?')) return;

    try {
      const response = await window.api.deleteHomeSection(id);
      if (response.success) {
        window.notifications?.success('Sección eliminada exitosamente');
        this.loadHomeSections();
      }
    } catch (error) {
      window.notifications?.error('Error al eliminar sección');
    }
  }

  editHomeSection(id) {
    this.openHomeSectionModal(id);
  }
}

// Funciones globales para los modales
window.openHeroSlideModal = (id) => adminHomeContent.openHeroSlideModal(id);
window.openBannerModal = (id) => adminHomeContent.openBannerModal(id);
window.openBenefitModal = (id) => adminHomeContent.openBenefitModal(id);
window.openHomeSectionModal = (id) => adminHomeContent.openHomeSectionModal(id);

// Funciones de preview de imágenes
function previewHeroSlideImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('heroSlidePreview').src = e.target.result;
      document.getElementById('heroSlidePreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previewBannerImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('bannerPreview').src = e.target.result;
      document.getElementById('bannerPreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previewBenefitImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('benefitPreview').src = e.target.result;
      document.getElementById('benefitPreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Instanciar y hacer global
window.adminHomeContent = new AdminHomeContent();

