FROM node:18-alpine

WORKDIR /app

# Copiar dependencias del backend
COPY backend/package.json ./
RUN npm install

# Copiar backend
COPY backend/knexfile.js ./
COPY backend/server.js ./
COPY backend/routes ./routes
COPY backend/models ./models
COPY backend/middleware ./middleware
COPY backend/services ./services
COPY backend/scripts ./scripts
COPY backend/database ./database

# Copiar TODOS los archivos del frontend (HTML, CSS, JS)
COPY *.html ./
COPY css ./css
COPY js ./js
COPY assets ./assets
COPY manifest.webmanifest ./
COPY sw.js ./
COPY robots.txt ./
COPY sitemap.xml ./

EXPOSE 3000

CMD ["npm", "start"]
