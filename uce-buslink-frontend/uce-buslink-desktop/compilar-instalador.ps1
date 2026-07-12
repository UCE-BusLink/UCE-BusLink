# Script para compilar el instalador de UCE BusLink Admin
# Ejecuta: powershell -ExecutionPolicy Bypass -File compilar-instalador.ps1

Write-Host "=== Compilador de Instalador UCE BusLink ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "Debes ejecutar este script desde la carpeta 'uce-buslink-desktop'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Ubicación correcta" -ForegroundColor Green
Write-Host ""

# Limpiar carpeta anterior
Write-Host "Limpiando compilaciones anteriores..." -ForegroundColor Yellow
if (Test-Path "release") {
    Remove-Item -Path "release" -Recurse -Force
    Write-Host "✓ Carpeta de release limpiada" -ForegroundColor Green
}

Write-Host ""

# Instalar dependencias
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias con npm..." -ForegroundColor Cyan
    npm install
    if ($lastexitcode -ne 0) {
        Write-Host "Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencias instaladas" -ForegroundColor Green
}

Write-Host ""

# Compilar
Write-Host "Compilando aplicación..." -ForegroundColor Yellow
npm run dist

if ($lastexitcode -eq 0) {
    Write-Host ""
    Write-Host "=== Compilación exitosa ===" -ForegroundColor Green
    Write-Host ""

    # Mostrar archivos generados
    Write-Host "Instaladores generados en 'release/':" -ForegroundColor Cyan
    Get-ChildItem -Path "release" -Filter "*.exe" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  • $($_.Name) ($size MB)" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Instrucciones:" -ForegroundColor Cyan
    Write-Host "  1. Opción A: Ejecuta desbloquear-instalador.ps1 para instalar"
    Write-Host "  2. Opción B: Haz doble clic en desbloquear-instalador.bat"
    Write-Host "  3. Opción C: Descarga release/UCE*Portable.exe para versión portable"

} else {
    Write-Host ""
    Write-Host "=== Error en la compilación ===" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
    exit 1
}
