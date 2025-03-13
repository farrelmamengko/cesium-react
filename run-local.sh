#!/bin/bash

# Script untuk menjalankan aplikasi Cesium React secara lokal

echo "Memulai aplikasi Cesium React secara lokal..."

# Pastikan MongoDB berjalan
if ! command -v mongod &> /dev/null; then
  echo "MongoDB tidak ditemukan. Pastikan MongoDB terinstal."
  echo "Anda dapat menginstal MongoDB dengan mengikuti petunjuk di: https://docs.mongodb.com/manual/installation/"
  exit 1
fi

# Periksa apakah MongoDB berjalan
if ! pgrep -x mongod > /dev/null; then
  echo "MongoDB tidak berjalan. Memulai MongoDB..."
  mongod --dbpath ./data/db --fork --logpath ./data/mongod.log
  if [ $? -ne 0 ]; then
    echo "Gagal memulai MongoDB. Pastikan direktori data ada dan dapat diakses."
    mkdir -p ./data/db
    mongod --dbpath ./data/db --fork --logpath ./data/mongod.log
    if [ $? -ne 0 ]; then
      echo "Masih gagal memulai MongoDB. Silakan periksa log untuk detail lebih lanjut."
      exit 1
    fi
  fi
fi

# Install dependencies jika node_modules tidak ada
if [ ! -d "node_modules" ]; then
  echo "Menginstal dependencies..."
  npm install
fi

# Jalankan aplikasi dalam mode development
echo "Menjalankan aplikasi dalam mode development..."
npm run dev

echo "Aplikasi berjalan di http://localhost:5005" 