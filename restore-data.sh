#!/bin/bash

# Script untuk restore data aplikasi Cesium React

# Periksa apakah file backup diberikan
if [ -z "$1" ]; then
  echo "Error: File backup tidak diberikan!"
  echo "Penggunaan: ./restore-data.sh <path_to_backup_file>"
  exit 1
fi

BACKUP_FILE=$1
TEMP_DIR="./temp_restore"

echo "Memulai proses restore data dari file: $BACKUP_FILE"

# Periksa apakah file backup ada
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File backup tidak ditemukan: $BACKUP_FILE"
  exit 1
fi

# Buat direktori temporary
mkdir -p $TEMP_DIR

# Extract file backup
echo "Mengekstrak file backup..."
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restore uploads
echo "Restore direktori uploads..."
if [ -d "$TEMP_DIR/uploads_backup" ]; then
  cp -r $TEMP_DIR/uploads_backup/* ./uploads/
else
  echo "Warning: Direktori uploads_backup tidak ditemukan dalam file backup"
fi

# Restore MongoDB
echo "Restore database MongoDB..."
if [ -d "$TEMP_DIR/mongodb_backup" ]; then
  # Salin file backup ke container
  docker cp $TEMP_DIR/mongodb_backup cesium-react-mongodb-1:/tmp/backup
  
  # Restore database
  docker exec cesium-react-mongodb-1 mongorestore --drop /tmp/backup
else
  echo "Warning: Direktori mongodb_backup tidak ditemukan dalam file backup"
fi

# Bersihkan file temporary
echo "Membersihkan file temporary..."
rm -rf $TEMP_DIR

echo "Restore selesai!"
echo "Restart aplikasi untuk menerapkan perubahan: docker-compose restart" 