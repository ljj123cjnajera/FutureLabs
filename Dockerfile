FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./
COPY backend/knexfile.js ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
