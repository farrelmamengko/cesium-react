#!/bin/bash

# Script untuk memeriksa status aplikasi Cesium React

echo "Memeriksa status aplikasi Cesium React..."

# Periksa status container
echo "Status container:"
docker ps | grep cesium-react

# Periksa log container
echo -e "\nLog container (10 baris terakhir):"
docker-compose logs --tail=10 app

# Periksa penggunaan resource
echo -e "\nPenggunaan resource:"
docker stats --no-stream cesium-react-app-1 cesium-react-mongodb-1

# Periksa koneksi ke MongoDB
echo -e "\nKoneksi ke MongoDB:"
docker exec cesium-react-app-1 curl -s mongodb:27017 || echo "Tidak dapat terhubung ke MongoDB"

# Periksa apakah aplikasi dapat diakses
echo -e "\nMemeriksa apakah aplikasi dapat diakses:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Aplikasi tidak dapat diakses"

echo -e "\nPemeriksaan selesai!" 