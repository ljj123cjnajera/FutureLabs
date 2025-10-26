FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./
COPY backend/knexfile.js ./
COPY backend/server.js ./
COPY backend/routes ./routes
COPY backend/models ./models
COPY backend/middleware ./middleware
COPY backend/services ./services
COPY backend/scripts ./scripts
COPY backend/database ./database
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
