# Stage 1: Build aplikasi
FROM node:16 as build

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

# Stage 2: Production image
FROM nginx:alpine

# Buat konfigurasi Nginx untuk mendengarkan port 5004
RUN echo 'server { \
    listen 5004; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy build dari stage sebelumnya
COPY --from=build /app/build /usr/share/nginx/html

# Expose port yang digunakan server
EXPOSE 5004

# Command untuk menjalankan server
CMD ["nginx", "-g", "daemon off;"] 