# Quick Start - Instalador UCE BusLink Admin

## ¿Solo quiero instalar la app?

### Paso 1: Desbloquear el instalador
Ejecuta **uno** de estos métodos (se abrirá el instalador automáticamente):

**Opción A (Fácil):**
- Haz doble clic en `desbloquear-instalador.bat`

**Opción B (PowerShell):**
```powershell
.\desbloquear-instalador.ps1
```

### Paso 2: Seguir el instalador
- Elige la carpeta donde instalar (o acepta la predeterminada)
- Espera a que termine la instalación
- ¡Listo!

### Paso 3: Usar la app
- La app aparecerá en el Menú Inicio
- O haz clic en el acceso directo del escritorio

---

## ¿Instalador bloqueado por Windows?

Si ves una advertencia roja de "Windows protegió tu PC":

### Solución 1 (Automática):
```powershell
powershell -Command "Unblock-File -Path 'C:\ruta\al\instalador.exe'"
```

### Solución 2 (Manual):
1. Haz clic derecho en `UCE BusLink Admin.exe`
2. Selecciona "Propiedades"
3. Marca la casilla "Desbloquear" en la parte inferior
4. Haz clic en "Aplicar" → "Aceptar"
5. Ejecuta el instalador nuevamente

### Solución 3 (Versión Portátil):
- Usa `UCE BusLink Admin Portable.exe` (no requiere instalación)

---

## ¿Eres desarrollador y quieres compilar?

```bash
cd uce-buslink-desktop
npm install
npm run dist
```

Los instaladores estarán en `release/`

---

## Requisitos Mínimos
- ✓ Windows 10 o superior
- ✓ 4GB de RAM
- ✓ Internet activo
- ✓ Permiso de administrador para instalar

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Windows protegió tu PC" | Usa `desbloquear-instalador.bat` o Solución 2 arriba |
| No se abre después de instalar | Reinicia la computadora e intenta nuevamente |
| Puerto 8080 en uso | Cierra otras apps o reinicia tu PC |
| Antivirus bloquea | Whitelist la app en tu antivirus |

---

## ¿Necesitas desinstalar?

1. Ve a Configuración → Aplicaciones → Aplicaciones instaladas
2. Busca "UCE BusLink Admin"
3. Haz clic en "Desinstalar"

---

**¿Necesitas ayuda?** Ver `INSTALACION.md` para documentación completa.
