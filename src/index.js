const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const path = require('path');
const electron = require('electron');
const { time } = require('console');
const fs = require('fs');

// Enable live reload for all the files inside your project directory
require('electron-reload')(__dirname);


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences:{
      nodeIntegration:true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    width: 800,
    height: 1000,
    icon: __dirname + '/img/Logo.ico',

    //frame: false,
    resizable: false,
  });
  mainWindow.setMenuBarVisibility(false)
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'main.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
  
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


let classList = []
if(fs.existsSync('classList.json')){
  classList = JSON.parse(fs.readFileSync('classList.json'))
}

ipcMain.on('classInfo',function(e,classInfo){
  classList.push({className:classInfo.className, classTime:classInfo.classTime, classLink:classInfo.classLink, classDays:{sunday:false,monday:false, tuesday:false,wensday:false,thursday:false,friday:false,saterday:false}})
  fs.writeFile('classList.json', JSON.stringify(classList), function(err) {if(err) throw err});
  
})
ipcMain.on("getClassList", function(e){
  e.reply('getClassList-reply', classList)
})

ipcMain.on('updateList',function(e, classess){
  classList = classess
  fs.writeFileSync('classList.json', JSON.stringify(classList))
})

const DiscordRPC = require('./rpc');
const clientId = '831079026969542696';

// Only needed if you want to use spectate, join, or ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();
async function setActivity() {
  if (!rpc) {
    return;
  }
  // You'll need to have snek_large and snek_small assets uploaded to
  // https://discord.com/developers/applications/<application_id>/rich-presence/assets
  rpc.setActivity({
    details: `Totally not`,
    state: 'playing video games',
    startTimestamp,
    largeImageKey: (Math.floor(Math.random() * 2) + 1).toString(),
    largeImageText: 'Tea is delicious',
    smallImageKey: 'zoom',
    smallImageText: 'By smashguns#6175',
    instance: false,
  });
}

rpc.on('ready', () => {
  console.log("Working?")
  setActivity();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login({ clientId }).catch(console.error);
