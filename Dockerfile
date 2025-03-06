# Base image
FROM node:18-alpine

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

# Expose port yang digunakan server
EXPOSE 5003

# Command untuk menjalankan server
CMD ["node", "server.js"] 