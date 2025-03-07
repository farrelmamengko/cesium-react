# Panduan Deployment Cesium React ke NAS

Dokumen ini berisi panduan untuk men-deploy aplikasi Cesium React ke NAS menggunakan GitHub Actions.

## Prasyarat

1. Akses ke NAS dengan SSH/SFTP
2. Docker dan Docker Compose terinstal di NAS
3. Repository GitHub dengan kode sumber aplikasi
4. Hak akses untuk mengatur GitHub Actions dan Secrets

## Konfigurasi GitHub Actions

### 1. Mengatur Secrets di GitHub

Anda perlu mengatur beberapa secrets di repository GitHub Anda:

1. Buka repository GitHub Anda
2. Klik pada tab "Settings"
3. Klik pada "Secrets and variables" di sidebar
4. Klik pada "Actions"
5. Klik tombol "New repository secret"
6. Tambahkan secrets berikut:
   - `NAS_HOST`: Alamat IP atau hostname NAS Anda
   - `NAS_PORT`: Port SSH NAS (biasanya 22)
   - `NAS_USERNAME`: Username untuk login ke NAS
   - `NAS_PASSWORD`: Password untuk login ke NAS

### 2. Workflow GitHub Actions

File workflow GitHub Actions sudah dikonfigurasi di `.github/workflows/deploy-to-nas.yml`. Workflow ini akan:

1. Build Docker image dari kode sumber
2. Push image ke GitHub Container Registry
3. Deploy image ke NAS menggunakan SSH
4. Restart container di NAS

## Deployment Manual

Jika Anda ingin melakukan deployment manual tanpa GitHub Actions, Anda dapat menggunakan script `deploy-to-nas.sh`:

1. Salin script ke NAS Anda
2. Edit variabel `GITHUB_REPO` dengan nama repository GitHub Anda
3. Jalankan script dengan perintah:
   ```bash
   chmod +x deploy-to-nas.sh
   ./deploy-to-nas.sh
   ```

## Struktur Direktori di NAS

Aplikasi akan di-deploy ke direktori berikut di NAS:

```
/volume1/docker/cesium-react/
├── docker-compose.yml
├── uploads/
└── mongo-seed/
```

## Mengakses Aplikasi

Setelah deployment berhasil, aplikasi dapat diakses melalui:

```
http://[NAS_IP]:5004
```

## Troubleshooting

### Masalah Koneksi MongoDB

Jika aplikasi tidak dapat terhubung ke MongoDB, pastikan:
1. Container MongoDB berjalan dengan benar
2. Environment variable `MONGODB_URI` dikonfigurasi dengan benar di `docker-compose.yml`

### Masalah Permissions

Jika terjadi masalah permissions pada direktori `uploads`:
1. Pastikan direktori `uploads` memiliki permissions yang benar
2. Jalankan perintah berikut di NAS:
   ```bash
   chmod -R 777 /volume1/docker/cesium-react/uploads
   ```

### Melihat Logs

Untuk melihat logs aplikasi:
```bash
cd /volume1/docker/cesium-react
docker-compose logs -f app
```

## Backup Data

Untuk backup data MongoDB:
```bash
cd /volume1/docker/cesium-react
docker-compose exec mongodb mongodump --out=/data/db/backup
```

Kemudian Anda dapat menyalin direktori backup dari container ke NAS:
```bash
docker cp $(docker-compose ps -q mongodb):/data/db/backup /volume1/backup/mongodb
``` 