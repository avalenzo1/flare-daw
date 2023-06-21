import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.ROOT = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.ROOT, 'dist-electron')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.ROOT, 'public')
  : path.join(process.env.ROOT, '.output/public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow
const preload = path.join(process.env.DIST, 'preload.js')

function bootstrap() {
  win = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'))
  }

  // Opening Project
  ipcMain.handle('open-project', async (event) => {
    console.log(event)

    return await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'JavaScript Object Notation', extensions: ['json'] }], })
  })

  // Saving Project
  ipcMain.handle('save-project', async (event) => {
    
    return await dialog.showSaveDialog({})
  })

  ipcMain.handle('open-directory', async (event) => {
    return await dialog.showOpenDialog({ properties: ['openDirectory'] })
  })
}

app.whenReady().then(bootstrap)