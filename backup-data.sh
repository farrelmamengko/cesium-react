#!/bin/bash

# Script untuk backup data aplikasi Cesium React

# Variabel konfigurasi
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/cesium_backup_$DATE.tar.gz"

echo "Memulai proses backup data..."

# Buat direktori backup jika belum ada
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "Backup database MongoDB..."
docker exec cesium-react-mongodb-1 mongodump --out=/tmp/backup

# Salin file backup dari container ke host
echo "Menyalin file backup dari container..."
docker cp cesium-react-mongodb-1:/tmp/backup ./mongodb_backup

# Backup uploads
echo "Backup direktori uploads..."
mkdir -p ./uploads_backup
cp -r ./uploads/* ./uploads_backup/

# Buat archive dari semua backup
echo "Membuat archive backup..."
tar -czf $BACKUP_FILE ./mongodb_backup ./uploads_backup

# Bersihkan file temporary
echo "Membersihkan file temporary..."
rm -rf ./mongodb_backup
rm -rf ./uploads_backup

echo "Backup selesai! File backup tersimpan di: $BACKUP_FILE"
echo "Ukuran file backup: $(du -h $BACKUP_FILE | cut -f1)" 