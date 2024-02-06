//deshabilita notificaciones de seguridad
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const { app, BrowserWindow, dialog} = require('electron')
//requisito de dialog
require('@electron/remote/main').initialize()

function createWindow() {
    // Crea la ventana del navegador.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    // quita el menu por defecto de chromium
    win.setMenu(null);
    // y carga el index.html de la aplicación.
    win.loadFile('index.html')
    //para mostrar en la ventana la herramientas de desarrollo de chrome:
    win.webContents.openDevTools()
    //requisito de dialog
    require("@electron/remote/main").enable(win.webContents) 
}


//cuando la aplicación electron está lista (todos los procesos generados)
//mediante app.on llamamos a la función que se va ha encargar de lanzar las
//ventanas:
app.on('ready', createWindow)
