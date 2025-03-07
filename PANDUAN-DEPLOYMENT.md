# Panduan Langkah Demi Langkah: Deployment Cesium React ke NAS dengan GitHub Actions

Dokumen ini berisi panduan langkah demi langkah untuk men-deploy aplikasi Cesium React ke NAS menggunakan GitHub Actions.

## Langkah 1: Persiapan Repository GitHub

1. Buat repository GitHub baru atau gunakan yang sudah ada
2. Push kode aplikasi Cesium React ke repository tersebut
3. Pastikan file-file berikut sudah ada di repository:
   - `Dockerfile`
   - `.github/workflows/deploy-to-nas.yml`
   - `docker-compose.yml`

## Langkah 2: Persiapan NAS

### Instal Docker dan Docker Compose di NAS

1. Akses NAS melalui SSH atau web interface
2. Instal Docker dan Docker Compose (jika belum terinstal)
   - Untuk Synology NAS:
     - Buka Package Center
     - Cari dan instal "Docker"
   - Untuk QNAP NAS:
     - Buka App Center
     - Cari dan instal "Container Station"

### Persiapkan Direktori di NAS

Anda dapat menggunakan script PowerShell `prepare-nas.ps1` yang telah dibuat:

1. Instal modul Posh-SSH di PowerShell:
   ```powershell
   Install-Module -Name Posh-SSH -Scope CurrentUser -Force
   ```

2. Jalankan script `prepare-nas.ps1`:
   ```powershell
   .\prepare-nas.ps1 -NasHost "ip-nas-anda" -NasUsername "username" -NasPassword "password" -NasPort 22
   ```

Atau lakukan secara manual:

1. Akses NAS melalui SSH
2. Buat direktori untuk aplikasi:
   ```bash
   mkdir -p /volume1/docker/cesium-react
   mkdir -p /volume1/docker/cesium-react/uploads
   mkdir -p /volume1/docker/cesium-react/mongo-seed
   ```

## Langkah 3: Konfigurasi GitHub Secrets

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

## Langkah 4: Trigger Workflow GitHub Actions

Ada dua cara untuk memicu workflow GitHub Actions:

### Cara 1: Push ke Branch Main

1. Lakukan perubahan pada kode
2. Commit perubahan
3. Push ke branch `main`:
   ```bash
   git add .
   git commit -m "Update aplikasi"
   git push origin main
   ```

### Cara 2: Trigger Manual

1. Buka repository GitHub Anda
2. Klik pada tab "Actions"
3. Pilih workflow "Deploy to NAS"
4. Klik tombol "Run workflow"
5. Pilih branch `main`
6. Klik tombol "Run workflow"

## Langkah 5: Verifikasi Deployment

1. Tunggu hingga workflow GitHub Actions selesai
2. Akses aplikasi melalui browser:
   ```
   http://[NAS_IP]:5004
   ```

3. Jika terjadi masalah, periksa logs:
   - Di GitHub Actions: Klik pada workflow yang berjalan untuk melihat logs
   - Di NAS: Jalankan perintah berikut melalui SSH:
     ```bash
     cd /volume1/docker/cesium-react
     docker-compose logs -f app
     ```

## Troubleshooting

### Masalah: Workflow GitHub Actions Gagal

1. Periksa logs di GitHub Actions
2. Pastikan secrets sudah dikonfigurasi dengan benar
3. Pastikan NAS dapat diakses dari internet (jika repository GitHub publik)

### Masalah: Container Tidak Berjalan di NAS

1. Akses NAS melalui SSH
2. Periksa status container:
   ```bash
   cd /volume1/docker/cesium-react
   docker-compose ps
   ```
3. Periksa logs container:
   ```bash
   docker-compose logs -f
   ```

### Masalah: Aplikasi Tidak Dapat Diakses

1. Pastikan port 5004 terbuka di firewall NAS
2. Periksa apakah container berjalan dengan benar
3. Periksa logs aplikasi untuk error

## Backup dan Restore

### Backup Data MongoDB

```bash
cd /volume1/docker/cesium-react
docker-compose exec mongodb mongodump --out=/data/db/backup
docker cp $(docker-compose ps -q mongodb):/data/db/backup /volume1/backup/mongodb
```

### Restore Data MongoDB

```bash
cd /volume1/docker/cesium-react
docker cp /volume1/backup/mongodb mongodb:/data/db/backup
docker-compose exec mongodb mongorestore /data/db/backup
```

## Pemeliharaan

### Update Aplikasi

1. Lakukan perubahan pada kode
2. Push ke branch `main`
3. GitHub Actions akan otomatis men-deploy perubahan ke NAS

### Restart Container

```bash
cd /volume1/docker/cesium-react
docker-compose restart
```

### Bersihkan Image Docker yang Tidak Digunakan

```bash
cd /volume1/docker/cesium-react
docker image prune -f
``` 