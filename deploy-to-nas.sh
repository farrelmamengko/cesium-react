#!/bin/bash
# Script untuk deploy aplikasi ke NAS

echo "Memulai proses deployment ke NAS..."

# Pastikan script dapat dieksekusi
chmod +x deploy-to-nas.sh

# Variabel konfigurasi
NAS_IP="203.153.109.226"
NAS_PORT="8080"
NAS_USER="admin"  # Ganti dengan username NAS Anda
NAS_DIR="/volume1/docker/cesium-react"

# Build aplikasi
echo "Building aplikasi..."
npm run build

# Stop container yang sedang berjalan
echo "Menghentikan container yang sedang berjalan..."
docker-compose down

# Build dan jalankan container baru
echo "Membangun dan menjalankan container baru..."
docker-compose up --build -d

# Tunggu beberapa detik untuk memastikan container sudah berjalan
echo "Menunggu container berjalan..."
sleep 10

# Periksa status container
echo "Memeriksa status container..."
docker ps | grep cesium-react

echo "Deployment selesai! Aplikasi sekarang dapat diakses di http://$NAS_IP:$NAS_PORT"

# Tambahkan perintah untuk memeriksa log jika diperlukan
echo "Untuk memeriksa log, jalankan: docker-compose logs -f" 