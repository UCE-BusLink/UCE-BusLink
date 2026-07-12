@echo off
REM Script para desbloquear y ejecutar el instalador de UCE BusLink Admin
REM Haz clic derecho en este archivo y selecciona "Ejecutar como administrador"

setlocal enabledelayedexpansion

echo.
echo =====================================
echo  Desbloqueador de Instalador UCE BusLink
echo =====================================
echo.

set "INSTALLER=%~dp0release\UCE BusLink Admin.exe"

if not exist "%INSTALLER%" (
    echo Error: No se encontro el instalador en:
    echo %INSTALLER%
    echo.
    echo Asegurate de ejecutar este script desde la carpeta del proyecto.
    pause
    exit /b 1
)

echo Archivo encontrado: %INSTALLER%
echo.

echo Desbloqueando archivo...
REM Usar PowerShell para desbloquear (requiere admin)
powershell -Command "Unblock-File -Path '%INSTALLER%'"

if %errorlevel% equ 0 (
    echo Archivo desbloqueado correctamente.
    echo.
    echo Iniciando instalador...
    echo.
    start "" "%INSTALLER%"
) else (
    echo Error al desbloquear el archivo.
    echo Intenta hacerlo manualmente:
    echo   1. Haz clic derecho en %INSTALLER%
    echo   2. Selecciona "Propiedades"
    echo   3. Marca la casilla "Desbloquear"
    echo   4. Haz clic en "Aplicar"
    pause
)
