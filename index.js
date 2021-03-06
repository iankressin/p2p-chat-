const { app, BrowserWindow, ipcMain } = require("electron");
const UdpServer = require("./updServer/peer");
const events = require("./updServer/events");

function createWindow() {
  const udpServer = new UdpServer();
  udpServer.connectToServer();

  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  ipcMain.on("interface::message", (item, message) =>
    events.emit("local::message", message)
  );

  events.on("remote::message", message => {
    console.log("REMOTE MESSAGE NEW: ", message);
    win.webContents.send("remote::message", message);
  });

  win.loadFile("./client/index.html");
}

app.whenReady().then(createWindow);
