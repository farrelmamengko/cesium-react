#!/bin/bash
# Script untuk men-deploy aplikasi Cesium React ke NAS

# Variabel konfigurasi
NAS_DIR="/volume1/docker/cesium-react"
GITHUB_REPO="ghcr.io/username/cesium-react:latest"  # Ganti dengan repository GitHub Anda

# Buat direktori jika belum ada
mkdir -p $NAS_DIR
cd $NAS_DIR

echo "Pulling image terbaru dari GitHub Container Registry..."
docker pull $GITHUB_REPO

echo "Menghentikan container yang sedang berjalan..."
docker-compose down

echo "Memulai container dengan image terbaru..."
docker-compose up -d

echo "Membersihkan image yang tidak digunakan..."
docker image prune -f

echo "Deployment selesai! Aplikasi sekarang berjalan di NAS."
echo "Anda dapat mengakses aplikasi di: http://nas-ip:5004" 