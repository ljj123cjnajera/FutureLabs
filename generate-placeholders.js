// Script para generar imágenes placeholder
const fs = require('fs');
const path = require('path');

// Colores para diferentes categorías de productos
const productColors = {
    'laptop': '#667eea',
    'laptop-gaming': '#764ba2',
    'smartphone': '#10b981',
    'smartwatch': '#f59e0b',
    'teclado': '#ef4444',
    'audifonos': '#3b82f6',
    'speaker': '#8b5cf6',
    'ps5': '#6366f1',
    'bombillas': '#f97316',
    'cargador': '#14b8a6'
};

// Crear directorio si no existe
const imagesDir = path.join(__dirname, 'assets/images/products');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Generar SVG placeholder para cada producto
Object.keys(productColors).forEach(productName => {
    const color = productColors[productName];
    const svg = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="${color}" opacity="0.1"/>
    <rect x="50" y="50" width="300" height="300" fill="${color}" opacity="0.2" rx="20"/>
    <text x="200" y="190" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${color}" text-anchor="middle">
        ${productName.toUpperCase().replace('-', ' ')}
    </text>
    <text x="200" y="220" font-family="Arial, sans-serif" font-size="14" fill="${color}" opacity="0.7" text-anchor="middle">
        FutureLabs
    </text>
</svg>
    `.trim();
    
    const filePath = path.join(imagesDir, `${productName}.jpg`);
    // Guardar como SVG (los navegadores modernos lo soportan)
    fs.writeFileSync(filePath.replace('.jpg', '.svg'), svg);
    console.log(`✓ Generado: ${productName}.svg`);
});

console.log('\n✅ Todas las imágenes placeholder han sido generadas!');


