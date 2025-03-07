# Script PowerShell untuk mempersiapkan NAS
# Pastikan Anda telah menginstal modul Posh-SSH dengan menjalankan:
# Install-Module -Name Posh-SSH

param(
    [Parameter(Mandatory=$true)]
    [string]$NasHost,
    
    [Parameter(Mandatory=$true)]
    [string]$NasUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$NasPassword,
    
    [Parameter(Mandatory=$false)]
    [int]$NasPort = 22
)

# Fungsi untuk menampilkan pesan dengan warna
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Periksa apakah modul Posh-SSH terinstal
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-ColorOutput "red" "Modul Posh-SSH tidak ditemukan. Silakan instal dengan perintah:"
    Write-ColorOutput "yellow" "Install-Module -Name Posh-SSH -Scope CurrentUser -Force"
    exit 1
}

# Import modul Posh-SSH
Import-Module Posh-SSH

# Buat kredensial untuk SSH
$securePassword = ConvertTo-SecureString $NasPassword -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($NasUsername, $securePassword)

Write-ColorOutput "green" "Mencoba terhubung ke NAS di $NasHost..."

try {
    # Buat sesi SSH
    $session = New-SSHSession -ComputerName $NasHost -Credential $credential -Port $NasPort -AcceptKey

    if ($session) {
        Write-ColorOutput "green" "Berhasil terhubung ke NAS!"
        
        # Periksa apakah Docker terinstal
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "which docker"
        
        if ($result.ExitStatus -eq 0) {
            Write-ColorOutput "green" "Docker terinstal di NAS."
        } else {
            Write-ColorOutput "red" "Docker tidak terinstal di NAS. Silakan instal Docker terlebih dahulu."
            Remove-SSHSession -SessionId $session.SessionId | Out-Null
            exit 1
        }
        
        # Periksa apakah Docker Compose terinstal
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "which docker-compose"
        
        if ($result.ExitStatus -eq 0) {
            Write-ColorOutput "green" "Docker Compose terinstal di NAS."
        } else {
            Write-ColorOutput "red" "Docker Compose tidak terinstal di NAS. Silakan instal Docker Compose terlebih dahulu."
            Remove-SSHSession -SessionId $session.SessionId | Out-Null
            exit 1
        }
        
        # Buat direktori untuk aplikasi
        Write-ColorOutput "cyan" "Membuat direktori untuk aplikasi..."
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p /volume1/docker/cesium-react"
        
        if ($result.ExitStatus -eq 0) {
            Write-ColorOutput "green" "Direktori berhasil dibuat."
        } else {
            Write-ColorOutput "red" "Gagal membuat direktori: $($result.Error)"
            Remove-SSHSession -SessionId $session.SessionId | Out-Null
            exit 1
        }
        
        # Buat direktori uploads
        Write-ColorOutput "cyan" "Membuat direktori uploads..."
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p /volume1/docker/cesium-react/uploads"
        
        if ($result.ExitStatus -eq 0) {
            Write-ColorOutput "green" "Direktori uploads berhasil dibuat."
        } else {
            Write-ColorOutput "red" "Gagal membuat direktori uploads: $($result.Error)"
            Remove-SSHSession -SessionId $session.SessionId | Out-Null
            exit 1
        }
        
        # Buat direktori mongo-seed
        Write-ColorOutput "cyan" "Membuat direktori mongo-seed..."
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p /volume1/docker/cesium-react/mongo-seed"
        
        if ($result.ExitStatus -eq 0) {
            Write-ColorOutput "green" "Direktori mongo-seed berhasil dibuat."
        } else {
            Write-ColorOutput "red" "Gagal membuat direktori mongo-seed: $($result.Error)"
            Remove-SSHSession -SessionId $session.SessionId | Out-Null
            exit 1
        }
        
        # Selesai
        Write-ColorOutput "green" "NAS berhasil dipersiapkan untuk deployment!"
        Write-ColorOutput "cyan" "Selanjutnya, Anda perlu mengatur GitHub Secrets untuk CI/CD."
        Write-ColorOutput "cyan" "Tambahkan secrets berikut di repository GitHub Anda:"
        Write-ColorOutput "yellow" "NAS_HOST: $NasHost"
        Write-ColorOutput "yellow" "NAS_PORT: $NasPort"
        Write-ColorOutput "yellow" "NAS_USERNAME: $NasUsername"
        Write-ColorOutput "yellow" "NAS_PASSWORD: ********"
        
        # Tutup sesi SSH
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
    } else {
        Write-ColorOutput "red" "Gagal terhubung ke NAS."
        exit 1
    }
} catch {
    Write-ColorOutput "red" "Terjadi kesalahan: $_"
    exit 1
} 