import { app, BrowserWindow, dialog, Menu, ipcMain, shell } from 'electron'
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

let mainWindow: BrowserWindow
const preload = path.join(process.env.DIST, 'preload.js')

function bootstrap() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  ipcMain.on('show-context-menu', (event) => {
    const template = [
      {
        label: 'Menu Item 1',
        click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
      },
      { type: 'separator' },
      { label: 'Menu Item 2', type: 'checkbox', checked: true }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'))
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