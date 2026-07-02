const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')
const { app, BrowserWindow, protocol, net, shell } = require('electron')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
])

function resolveDistFile(requestUrl) {
  const { pathname } = new URL(requestUrl)
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

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0a1628',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (app.isPackaged) {
    win.loadURL('app://buslink/index.html')
  } else {
    win.loadURL(DEV_SERVER_URL)
  }
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    protocol.handle('app', (request) =>
      net.fetch(pathToFileURL(resolveDistFile(request.url)).toString())
    )
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
