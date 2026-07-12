# 🚀 Setup Desktop - UCE BusLink Admin

## ¿QUÉ SE HA HECHO?

Se compiló y preparó la versión desktop de UCE-BusLink con:

### ✅ Instaladores Generados
- **Instalador NSIS** (97 MB) - Recomendado para usuarios finales
- **Versión Portátil** (201 MB) - Sin instalación, ejecución directa

### ✅ Scripts de Ayuda
- `desbloquear-instalador.ps1` - Desbloquear automático (PowerShell)
- `desbloquear-instalador.bat` - Desbloquear automático (Batch)
- `compilar-instalador.ps1` - Recompilar si es necesario
- `preparar-distribucion.ps1` - Preparar distribución

### ✅ Documentación Completa
- `INSTALACION.md` - Guía de instalación completa
- `QUICK-START.md` - Inicio rápido
- `README-BUILD.md` - Para desarrolladores
- `VERIFICACION-INSTALADOR.md` - Status técnico
- `SETUP-DESKTOP-RELEASE.md` - Este archivo

---

## 🎯 PLAN DE USO

### PARA USUARIO FINAL (Sin conocimientos técnicos)

**Opción 1 - Fácil (Recomendada):**
```
1. Abre: desbloquear-instalador.bat
2. Se abrirá el instalador automáticamente
3. Sigue los pasos
4. ¡Listo! La app estará en Menú Inicio
```

**Opción 2 - Portátil (Sin instalación):**
```
1. Descarga: UCE BusLink Admin Portable.exe
2. Doble clic y listo
3. No requiere instalación ni admin
```

---

### PARA DESARROLLADOR

**Recompilar:**
```powershell
cd uce-buslink-desktop
npm install
npm run dist
```

**Usar script helper:**
```powershell
.\compilar-instalador.ps1
```

---

## 🔐 Problema de Bloqueo de Windows

### ¿Por qué se bloquea?
Windows bloquea ejecutables sin firmar (es un security feature).

### ¿Cómo se resuelve?
Ya hemos incluido herramientas automáticas. El usuario solo necesita:

**Opción A** (Automática):
```
Haz doble clic en: desbloquear-instalador.bat
```

**Opción B** (Manual si falla A):
```
1. Clic derecho en el .exe
2. Propiedades
3. Marca "Desbloquear" (abajo)
4. Aplicar → Aceptar
5. Ejecuta nuevamente
```

---

## 📁 Archivos en Carpeta `release/`

```
release/
├── UCE BusLink Admin Setup 0.1.0.exe      (Instalador - 97 MB)
├── UCE BusLink Admin Portable.exe         (Portátil - 201 MB)
├── UCE BusLink Admin Setup 0.1.0.exe.blockmap
└── win-unpacked/                          (Archivos sin empaquetar)
```

---

## ✨ Características Incluidas

✅ Interfaz React moderna  
✅ Autenticación (Google/Clerk/Azure)  
✅ Mapas interactivos  
✅ Escaneo QR  
✅ Gráficos  
✅ Integración con backend UCE-BusLink  
✅ CORS bypass para desarrollo  
✅ Accesos directos en Windows  

---

## 🔄 Flujo de Distribución Recomendado

```
1. DESARROLLADOR compila
   └─ npm run dist
   
2. ARCHIVOS en carpeta release/
   ├── UCE BusLink Admin Setup 0.1.0.exe
   └── UCE BusLink Admin Portable.exe

3. DISTRIBUYE a usuarios (email, carpeta compartida, etc)
   └── Con archivos INSTALACION.md y QUICK-START.md

4. USUARIO FINAL instala
   ├── Opción A: desbloquear-instalador.bat
   └── Opción B: Descarga portátil
```

---

## 📋 Checklist Pre-Distribución

- [ ] Ambos instaladores existen en `release/`
- [ ] Probaste el instalador NSIS
- [ ] Probaste la versión portátil
- [ ] Backend (api.programacionwebuce.net) está online
- [ ] Documentación está en carpeta release/
- [ ] Scripts desbloqueo están en carpeta raíz

---

## 🚨 Si Algo Sale Mal

| Problema | Solución |
|----------|----------|
| "No se abre" | Reinicia tu PC e intenta de nuevo |
| "Puerto en uso" | Cierra otras instancias o reinicia |
| "Backend no responde" | Verifica internet y que backend esté online |
| "Antivirus bloquea" | Agrega la app a exceptions del antivirus |

---

## 📞 Soporte

**Documentación completa**: `INSTALACION.md`  
**Inicio rápido**: `QUICK-START.md`  
**Info técnica**: `VERIFICACION-INSTALADOR.md`  
**Desarrollo**: `README-BUILD.md`  

---

## 📊 Estadísticas de Build

```
Fecha de compilación: 12 de Julio 2026
Versión: 0.1.0
Electron: 38.2.0
Node: 20+ (recomendado)
Tamaño instalador: 97 MB
Tamaño portátil: 201 MB
Arquitectura: x64 (Windows 64-bit)
```

---

## 🔄 Próximas Mejoras (Opcional)

- [ ] Firmar ejecutable con certificado de código
- [ ] Auto-updater
- [ ] Versiones para Mac/Linux
- [ ] Microsoft Store
- [ ] Versión portable comprimida

---

## ✅ Status Actual

```
╔════════════════════════════════════════╗
║   LISTO PARA DISTRIBUCIÓN ✅          ║
║   Instaladores compilados exitosamente  ║
║   Documentación completa               ║
║   Scripts de instalación incluidos     ║
╚════════════════════════════════════════╝
```

**Pasos siguientes**: 
1. Distribu instaladores a usuarios finales
2. Usar `desbloquear-instalador.bat` para instalar
3. Acceder a la app desde Menú Inicio
4. Contactar ldalomoto@uce.edu.ec para soporte
