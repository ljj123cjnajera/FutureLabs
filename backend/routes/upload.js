const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Manejar OPTIONS para CORS preflight
router.options('/image', (req, res) => {
  res.status(200).end();
});

// POST /api/upload/image - Subir imagen única
router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró ningún archivo'
      });
    }
    
    // Generar URL para la imagen - usar URL del backend directamente
    // El backend sirve las imágenes estáticas desde /uploads
    // En Railway, usar la URL del servicio o la variable de entorno
    let backendUrl = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.BACKEND_URL;
    
    if (!backendUrl) {
      // Construir desde los headers si está detrás de un proxy (Railway)
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.get('host') || req.headers.host;
      
      // Asegurar que el protocolo esté presente
      if (host && !host.startsWith('http')) {
        backendUrl = `${protocol}://${host}`;
      } else {
        backendUrl = host || 'https://futurelabs-production.up.railway.app';
      }
    } else {
      // Si backendUrl viene sin protocolo, agregarlo
      if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
        backendUrl = `https://${backendUrl}`;
      }
    }
    
    // Asegurar que no tenga trailing slash
    backendUrl = backendUrl.replace(/\/$/, '');
    const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
    
    console.log('Image uploaded successfully:', {
      filename: req.file.filename,
      url: imageUrl,
      path: req.file.path
    });
    
    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen'
    });
  }
});

// POST /api/upload/images - Subir múltiples imágenes
router.post('/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se encontraron archivos'
      });
    }
    
    // Generar URLs para todas las imágenes
    const uploadedImages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    }));
    
    res.json({
      success: true,
      message: `${uploadedImages.length} imagen(es) subida(s) exitosamente`,
      data: {
        images: uploadedImages
      }
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes'
    });
  }
});

// DELETE /api/upload/:filename - Eliminar imagen
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen'
    });
  }
});

module.exports = router;

