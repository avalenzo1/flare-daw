"use strict";const n=require("electron"),e=require("path");process.env.ROOT=e.join(__dirname,"..");process.env.DIST=e.join(process.env.ROOT,"dist-electron");process.env.VITE_PUBLIC=process.env.VITE_DEV_SERVER_URL?e.join(process.env.ROOT,"public"):e.join(process.env.ROOT,".output/public");process.env.ELECTRON_DISABLE_SECURITY_WARNINGS="true";let o;const s=e.join(process.env.DIST,"preload.js");function r(){o=new n.BrowserWindow({webPreferences:{preload:s,nodeIntegrationInWorker:!0,contextIsolation:!1,nodeIntegration:!0,webSecurity:!1}}),process.env.VITE_DEV_SERVER_URL?(o.loadURL(process.env.VITE_DEV_SERVER_URL),o.webContents.openDevTools()):o.loadFile(e.join(process.env.VITE_PUBLIC,"index.html")),n.ipcMain.on("flare/open-project",(t,i,p)=>{n.dialog.showOpenDialog({properties:["openFile","multiSelections"],filters:[{name:"JavaScript Object Notation",extensions:["json"]}]})})}n.app.whenReady().then(r);
