# Instalación de UCE BusLink Admin

## Opciones de instalación

### Opción 1: Instalador NSIS (Recomendado)
1. Descarga `UCE BusLink Admin.exe` desde la carpeta `release/`
2. Ejecuta el instalador
3. Sigue los pasos del instalador

**Si Windows bloquea el archivo:**
1. Haz clic derecho en `UCE BusLink Admin.exe`
2. Selecciona "Propiedades"
3. En la parte inferior, marca la casilla "Desbloquear" (si aparece)
4. Haz clic en "Aplicar" y luego "Aceptar"
5. Ejecuta nuevamente el instalador

### Opción 2: Versión Portátil
Si el método anterior no funciona, usa la versión portable:
1. Descarga `UCE BusLink Admin.exe` (versión portable) de la carpeta `release/`
2. No requiere instalación, solo ejecución
3. Ideal para pruebas rápidas

## Requisitos del Sistema
- Windows 10 o superior
- 4GB de RAM mínimo
- Conexión a internet

## Solución si Windows SmartScreen bloquea la app

Si ves una advertencia de "Windows protegió tu PC":
1. Haz clic en "Más información"
2. Haz clic en "Ejecutar de todas formas"
3. La aplicación se abrirá normalmente

## Desinstalación
- Ve a "Programas y características" en Windows
- Busca "UCE BusLink Admin"
- Haz clic en "Desinstalar"

## Solución de problemas

### La aplicación no se abre
- Asegúrate de tener internet disponible
- Intenta con la versión portable
- Verifica que Windows Defender no esté bloqueando el archivo

### Error de certificado SSL
- Este es un aviso de seguridad normal para aplicaciones sin firmar
- Haz clic en "Continuar" para proceder

### Puerto 8080 en uso
- Cierra otras aplicaciones que usen ese puerto
- O reinicia tu computadora

## Para desarrolladores

Para compilar el instalador:
```bash
npm run dist
```

Los instaladores se generarán en la carpeta `release/`
