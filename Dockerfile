# Stage 1: Build aplikasi
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy seluruh kode sumber
COPY . .

# Build aplikasi React
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy build dari stage sebelumnya
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./
COPY --from=builder /app/models ./models
COPY --from=builder /app/routes ./routes

# Buat direktori uploads jika belum ada
RUN mkdir -p uploads

# Expose port yang digunakan server
EXPOSE 5004

# Command untuk menjalankan server
CMD ["node", "server.js"] 