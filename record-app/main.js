const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar: true, // Automatically hide the menu bar
    });

    mainWindow.loadFile('index.html');
});
