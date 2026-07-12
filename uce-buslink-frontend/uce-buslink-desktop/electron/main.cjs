const path = require('node:path')
const fs = require('node:fs')
const http = require('node:http')
const { app, BrowserWindow, shell } = require('electron')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'

let localServerUrl = null

function resolveDistFile(requestUrl) {
  const { pathname } = new URL(requestUrl, 'http://localhost')
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '')
  const candidate = path.normalize(path.join(DIST_DIR, relativePath))
  if (
    candidate.startsWith(DIST_DIR) &&
    fs.existsSync(candidate) &&
    fs.statSync(candidate).isFile()
  ) {
    return candidate
  }
  return path.join(DIST_DIR, 'index.html')
}

function startLocalServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = resolveDistFile(req.url)
      const ext = path.extname(filePath).toLowerCase()
      
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
      }

      const contentType = mimeTypes[ext] || 'application/octet-stream'

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code == 'ENOENT') {
            fs.readFile(path.join(DIST_DIR, 'index.html'), (err, content) => {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(content, 'utf-8')
            })
          } else {
            res.writeHead(500)
            res.end('Sorry, check with the site admin for error: '+error.code+' ..\n')
            res.end()
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType })
          res.end(content, 'utf-8')
        }
      })
    })

    const FIXED_PORT = 5173

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.listen(0, '127.0.0.1')
      }
    })

    server.on('listening', () => {
      const port = server.address().port
      localServerUrl = `http://localhost:${port}`
      resolve()
    })

    server.listen(FIXED_PORT, '127.0.0.1')
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0a1628',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'public', 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (app.isPackaged) {
    win.loadURL(localServerUrl)
  } else {
    win.loadURL(DEV_SERVER_URL)
  }
}

const { globalShortcut, session } = require('electron')

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.whenReady().then(async () => {
  // Engañamos al backend para que piense que la petición (y el websocket) vienen de Vite
  // Esto evita que el filtro CORS estricto de Spring Security bloquee el handshake (403)
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes('programacionwebuce.net')) {
      details.requestHeaders['Origin'] = 'http://localhost:5173'
    }
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })

  if (app.isPackaged) {
    await startLocalServer()
  }

  createWindow()

  // Atajo para abrir las herramientas de desarrollador (F12 o Ctrl+Shift+I)
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.webContents.toggleDevTools()
  })

  // Atajo para recargar la página (Ctrl+R o F5)
  globalShortcut.register('CommandOrControl+R', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.webContents.reload()
  })
  
  globalShortcut.register('F12', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.webContents.toggleDevTools()
  })

  globalShortcut.register('F5', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.webContents.reload()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
