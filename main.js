require('dotenv').config()
const { app, BrowserWindow, dialog, ipcMain} = require('electron')
const url = require('url')
const path = require('path')
const child_process = require('child_process');

const IS_PROD = process.env.NODE_ENV === 'production';
const root = process.cwd();

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadURL(url.format ({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


// listener to menu bar
ipcMain.on("close_app",(e)=>{
  console.log('close');
  app.quit();
  e.returnValue = true;
})

ipcMain.on("minimize_app",(e)=>{
  console.log('minimize');
  BrowserWindow.getFocusedWindow().minimize();
  e.returnValue = true;
})
