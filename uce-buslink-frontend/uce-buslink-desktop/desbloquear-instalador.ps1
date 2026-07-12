# Script para desbloquear y ejecutar el instalador de UCE BusLink Admin
# Ejecuta este script como Administrador si el instalador está bloqueado

param(
    [string]$InstallerPath = ".\release\UCE BusLink Admin.exe"
)

Write-Host "=== Desbloqueador de Instalador UCE BusLink ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $InstallerPath)) {
    Write-Host "Error: No se encontró el instalador en: $InstallerPath" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde la carpeta del proyecto." -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivo encontrado: $InstallerPath" -ForegroundColor Green
Write-Host ""

# Desbloquear archivo
Write-Host "Desbloqueando archivo..." -ForegroundColor Yellow
Unblock-File -Path $InstallerPath
Write-Host "Archivo desbloqueado correctamente." -ForegroundColor Green
Write-Host ""

# Mostrar propiedades del archivo
$fileInfo = Get-Item $InstallerPath
Write-Host "Información del archivo:" -ForegroundColor Cyan
Write-Host "  Tamaño: $([math]::Round($fileInfo.Length / 1MB, 2)) MB"
Write-Host "  Fecha: $($fileInfo.LastWriteTime)"
Write-Host ""

# Ejecutar instalador
Write-Host "Iniciando instalador..." -ForegroundColor Cyan
& $InstallerPath

Write-Host ""
Write-Host "=== Proceso completado ===" -ForegroundColor Green
