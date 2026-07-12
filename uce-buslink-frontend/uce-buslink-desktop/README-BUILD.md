# Construcción del Instalador de UCE BusLink Admin

## Procedimiento Rápido

### Opción 1: Usar el Script (Recomendado)
```powershell
# Abre PowerShell como Administrador en esta carpeta y ejecuta:
powershell -ExecutionPolicy Bypass -File compilar-instalador.ps1
```

### Opción 2: Comando Manual
```bash
npm install
npm run dist
```

## Archivos Generados

Después de compilar, encontrarás en la carpeta `release/`:

- **UCE BusLink Admin.exe** - Instalador NSIS (recomendado para usuarios finales)
- **UCE BusLink Admin.exe** - Versión portátil (ejecutable directo, sin instalación)
- **Otros archivos de soporte**

## Instalación en Máquinas de Usuarios

### Método 1: Instalador Estándar
1. Copia el archivo `.exe` a la máquina del usuario
2. Usa `desbloquear-instalador.bat` para evitar bloqueos de Windows
3. Sigue el asistente de instalación

### Método 2: Versión Portátil
1. Copia el ejecutable portátil
2. Colócalo en cualquier carpeta (ej: `C:\Aplicaciones\`)
3. Crea un atajo de escritorio si deseas

## Solución de Problemas

### El instalador está bloqueado por Windows SmartScreen
Windows puede bloquear ejecutables sin firmar. Hay varias formas de resolverlo:

**Automática:**
- Usa el script `desbloquear-instalador.ps1` (requiere admin)
- O haz doble clic en `desbloquear-instalador.bat`

**Manual:**
1. Haz clic derecho en el `.exe`
2. Selecciona "Propiedades"
3. En la parte inferior, marca "Desbloquear"
4. Haz clic en "Aplicar" > "Aceptar"
5. Ejecuta nuevamente

### Error: "El puerto está en uso"
Si ves error sobre el puerto 8080:
- Asegúrate de cerrar otras instancias de la app
- Reinicia la computadora

### El instalador es muy lento
- Es normal en máquinas con antivirus activo
- Los antivirus analizan el ejecutable automáticamente
- Espera a que termine el análisis

## Estructura de Carpetas

```
uce-buslink-desktop/
├── electron/              # Código de Electron
│   ├── main.cjs          # Proceso principal
│   └── preload.cjs       # Preload seguro
├── src/                   # Código React
├── public/               # Recursos estáticos
├── release/              # Instaladores generados
├── dist/                 # Aplicación compilada
├── package.json          # Configuración (incluye build)
└── compilar-instalador.ps1  # Script de compilación
```

## Configuración de Build

El archivo `package.json` contiene la configuración de `electron-builder`:

- **NSIS Installer**: Instalador de Windows estándar
- **Portable**: Versión sin instalación
- **Arquitectura**: x64 (Windows 64-bit)
- **Iconos**: Desde carpeta `public/`

## Desarrollo

Para desarrollar y probar:
```bash
npm run dev
```

Para compilar sin empaquetar:
```bash
npm run build
```

## Firmar la Aplicación (Opcional)

Para evitar warnings de Windows, puedes firmar el ejecutable:

1. Obtén un certificado de código (desde Sectigo, DigiCert, etc.)
2. Agrega a `package.json`:
```json
"win": {
  "certificateFile": "ruta/al/certificado.pfx",
  "certificatePassword": "contraseña"
}
```
3. Recompila con `npm run dist`

## Distribución

Para distribuir la app:

1. **Opción A**: Compartir el instalador directamente
   - Más fácil para usuarios finales
   - Requiere admin para instalar
   - Se integra con "Programas y características"

2. **Opción B**: Versión portátil
   - No requiere instalación
   - Mejor para pruebas rápidas
   - Usuarios menos técnicos pueden ejecutarla fácilmente

3. **Opción C**: Repositorio/URL
   - Crear carpeta compartida en red
   - O hospedarlo en servidor HTTP/HTTPS

## Verificación Post-Compilación

Después de compilar, verifica:

- [ ] Los archivos existen en `release/`
- [ ] El tamaño del ejecutable es > 100 MB (incluye Chromium)
- [ ] Puedes ejecutar la versión portátil
- [ ] El instalador puede ser desbloqueado y ejecutado

## Información de Soporte

- **Documentación completa**: Ver `INSTALACION.md`
- **Requisitos del sistema**: Windows 10 o superior, 4GB RAM
- **Backend requerido**: La aplicación necesita acceso al servidor de UCE-BusLink
