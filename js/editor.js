// 📝 Editor WYSIWYG Simple para Blog

class SimpleEditor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.content = '';
    this.setupEditor();
  }

  setupEditor() {
    const toolbar = `
      <div class="editor-toolbar">
        <button type="button" onclick="formatDoc('bold')" title="Negrita"><i class="fas fa-bold"></i></button>
        <button type="button" onclick="formatDoc('italic')" title="Cursiva"><i class="fas fa-italic"></i></button>
        <button type="button" onclick="formatDoc('underline')" title="Subrayado"><i class="fas fa-underline"></i></button>
        <div class="toolbar-separator"></div>
        <button type="button" onclick="formatDoc('justifyLeft')" title="Izquierda"><i class="fas fa-align-left"></i></button>
        <button type="button" onclick="formatDoc('justifyCenter')" title="Centro"><i class="fas fa-align-center"></i></button>
        <button type="button" onclick="formatDoc('justifyRight')" title="Derecha"><i class="fas fa-align-right"></i></button>
        <div class="toolbar-separator"></div>
        <button type="button" onclick="formatDoc('insertUnorderedList')" title="Lista"><i class="fas fa-list"></i></button>
        <button type="button" onclick="formatDoc('insertOrderedList')" title="Lista numerada"><i class="fas fa-list-ol"></i></button>
        <button type="button" onclick="formatDoc('createLink')" title="Enlace"><i class="fas fa-link"></i></button>
        <button type="button" onclick="formatDoc('insertImage')" title="Imagen"><i class="fas fa-image"></i></button>
        <div class="toolbar-separator"></div>
        <button type="button" onclick="formatDoc('formatBlock', '<h1>')" title="Título 1">H1</button>
        <button type="button" onclick="formatDoc('formatBlock', '<h2>')" title="Título 2">H2</button>
        <button type="button" onclick="formatDoc('formatBlock', '<h3>')" title="Título 3">H3</button>
        <div class="toolbar-separator"></div>
        <button type="button" onclick="formatDoc('removeFormat')" title="Limpiar formato"><i class="fas fa-remove-format"></i></button>
      </div>
    `;

    this.container.innerHTML = `
      <div class="editor-wrapper">
        ${toolbar}
        <div class="editor-content" id="editorContent" contenteditable="true">
          ${this.content}
        </div>
      </div>
    `;
  }

  getContent() {
    return document.getElementById('editorContent').innerHTML;
  }

  setContent(html) {
    this.content = html;
    if (document.getElementById('editorContent')) {
      document.getElementById('editorContent').innerHTML = html;
    }
  }

  getText() {
    return document.getElementById('editorContent').innerText;
  }
}

// Funciones globales para los botones del toolbar
function formatDoc(cmd, value = null) {
  const editor = document.getElementById('editorContent');
  
  if (value === null) {
    document.execCommand(cmd, false, null);
  } else {
    document.execCommand(cmd, false, value);
  }

  if (cmd === 'createLink') {
    const url = prompt('Ingresa la URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  }

  if (cmd === 'insertImage') {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      document.execCommand('insertImage', false, url);
    }
  }

  editor.focus();
}

// Hacer disponible globalmente
window.SimpleEditor = SimpleEditor;
window.formatDoc = formatDoc;

