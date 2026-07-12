# Script para preparar la distribución final de UCE BusLink Admin
# Copia ambas versiones (instalador y portátil) a la carpeta release

Write-Host "=== Preparador de Distribución ===" -ForegroundColor Cyan
Write-Host ""

$releaseDir = ".\release"
$winUnpackedDir = "$releaseDir\win-unpacked"
$portableSourceDir = "$winUnpackedDir"
$installerFile = Get-ChildItem -Path $releaseDir -Filter "*Setup*.exe" -ErrorAction SilentlyContinue

if (-not (Test-Path $releaseDir)) {
    Write-Host "Error: No se encontró carpeta 'release'" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar 'npm run dist' primero" -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivos en release/:" -ForegroundColor Cyan
Write-Host ""

$allFiles = @()

# Instalador NSIS
if ($installerFile) {
    $size = [math]::Round($installerFile.Length / 1MB, 2)
    Write-Host "✓ Instalador NSIS: $($installerFile.Name)" -ForegroundColor Green
    Write-Host "  Tamaño: $size MB" -ForegroundColor White
    $allFiles += @{
        name = $installerFile.Name
        path = $installerFile.FullName
        type = "NSIS Installer"
        size = $size
    }
    Write-Host ""
}

# Versión Portátil
$portableExe = Get-ChildItem -Path $portableSourceDir -Filter "UCE BusLink Admin.exe" -ErrorAction SilentlyContinue
if ($portableExe) {
    $size = [math]::Round($portableExe.Length / 1MB, 2)
    $portableDest = "$releaseDir\UCE BusLink Admin Portable.exe"

    # Copiar versión portátil
    Copy-Item -Path $portableExe.FullName -Destination $portableDest -Force
    Write-Host "✓ Versión Portátil: UCE BusLink Admin Portable.exe" -ForegroundColor Green
    Write-Host "  Tamaño: $size MB" -ForegroundColor White
    Write-Host "  (No requiere instalación)" -ForegroundColor Gray
    $allFiles += @{
        name = "UCE BusLink Admin Portable.exe"
        path = $portableDest
        type = "Portable"
        size = $size
    }
    Write-Host ""
}

# Crear archivo de manifiesto
$manifestFile = "$releaseDir\DISTRIBUCION.txt"
$manifest = @"
=================================================================
    DISTRIBUCIÓN DE UCE BUSLINK ADMIN v0.1.0
=================================================================

Fecha de generación: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Plataforma: Windows

ARCHIVOS DISPONIBLES:
"@

foreach ($file in $allFiles) {
    $manifest += "`n`n• $($file.name)"
    $manifest += "`n  Tipo: $($file.type)"
    $manifest += "`n  Tamaño: $($file.size) MB"
    $manifest += "`n  Ruta: $($file.path)"
}

$manifest += @"

INSTRUCCIONES DE INSTALACIÓN:

1. INSTALADOR (Recomendado):
   - Ejecuta el archivo Setup
   - Si Windows lo bloquea, usa:
     powershell -Command "Unblock-File -Path 'UCE BusLink Admin Setup *.exe'"
   - Sigue el asistente
   - La app se integrará con Windows

2. VERSIÓN PORTÁTIL:
   - Sin instalación requerida
   - Ejecuta directamente el archivo Portable
   - Ideal para pruebas o máquinas sin permisos de admin

3. PRIMER USO:
   - Asegúrate de tener internet disponible
   - Inicia sesión con tu cuenta de UCE
   - Accede a las funcionalidades administrativas

REQUISITOS MÍNIMOS:
- Windows 10 o superior
- 4GB de RAM
- Conexión a internet
- Permiso de administrador (solo para instalador)

SOLUCIÓN DE PROBLEMAS:

Si ves "Windows protegió tu PC":
1. Haz clic en "Más información"
2. Haz clic en "Ejecutar de todas formas"

Si el archivo está bloqueado:
1. Haz clic derecho en el archivo
2. Selecciona "Propiedades"
3. En la parte inferior, marca "Desbloquear"
4. Haz clic en "Aplicar" y "Aceptar"

=================================================================
"@

Set-Content -Path $manifestFile -Value $manifest -Encoding UTF8
Write-Host "✓ Archivo de manifiesto creado: DISTRIBUCION.txt" -ForegroundColor Green

Write-Host ""
Write-Host "=== Resumen de Distribución ===" -ForegroundColor Cyan
Write-Host ""
foreach ($file in $allFiles) {
    Write-Host "  ✓ $($file.name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Total de archivos: $($allFiles.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Los archivos están listos para distribuir en: $releaseDir" -ForegroundColor Green
Write-Host ""
Write-Host "Instrucciones para usuarios finales:" -ForegroundColor Cyan
Write-Host "  1. Ver archivo INSTALACION.md para detalles"
Write-Host "  2. Ver archivo QUICK-START.md para inicio rápido"
Write-Host "  3. Ver DISTRIBUCION.txt para lista de archivos"
