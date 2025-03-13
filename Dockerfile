# Stage 1: Build aplikasi
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode sumber
COPY . .

# Build aplikasi React
RUN npm run build

# Buat direktori uploads jika belum ada
RUN mkdir -p uploads/photos
RUN mkdir -p terrain-cache

# Expose port yang digunakan server
EXPOSE 8080

# Command untuk menjalankan server
CMD ["node", "server.js"] 