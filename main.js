
'use strict';
const { app, BrowserWindow, ipcMain, session} = require('electron');
const path = require('path');
const url = require('url');
const axios = require('axios');
// const { ipcMain } = require('electron');
const baseUrl = require('./config/config')
const httpInstance = axios.create({
  baseURL: baseUrl.baseUrl
});

const { autoUpdater } = require("electron-updater");
const log = require('electron-log');

let win;
let waitDialog;
let socket;
let modal;
let listener;
let errorListener;
let locale;

const displayLoginWindow = (event, message)=>{
     // 자동 업데이트 등록
    autoUpdater.checkForUpdates();

    win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
          affinity:true,
          nodeIntegration:true,
          contextIsolation : false 
        }
      })

    win.loadURL(url.format({
        pathname: path.join(__dirname, '/views/login.html'),
      protocol:'file',
      slashes:true
    }));
    win.webContents.openDevTools();
    win.once('ready-to-show',()=>{
      console.log('ready-to-show');
      win.show();
    });
    win.on('closed',()=>{
      console.log('window closed');
      win = null;
      app.quit();
    });
  };

  const displayWaitDialog = (event, message)=>{
    const cookie = { 
        url: 'http://www.github.com', 
        name: message[0].user_id, 
        value: message[0].user_name 
    }
    session.defaultSession.cookies.set(cookie)
    .then(() => {
    
    }, (error) => {
        console.error(error)
    })
    const options = {
        width: 400,
        height: 600,
        webPreferences: {
          affinity:true,
          nodeIntegration:true,
          contextIsolation : false 
        }
    };
    waitDialog = new BrowserWindow(options);
    waitDialog.loadURL(url.format({
      pathname:path.join(__dirname,'/views/main.html'),
      protocol:'file',
      slashes:true
    }));
    // waitDialog.webContents.openDevTools();
    waitDialog.once('ready-to-show',()=>{
      win.hide();
      waitDialog.show();
     
    });

    waitDialog.on('closed',()=>{
      waitDialog = null;
    });
  };  


/* Updater ======================================================*/

autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인 중...');
});
autoUpdater.on('update-available', (info) => {
  log.info('업데이트가 가능합니다.');
});
autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.');
});
autoUpdater.on('error', (err) => {
  log.info('에러가 발생하였습니다. 에러내용 : ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 현재 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('업데이트가 완료되었습니다.');
});  

app.on('ready',displayLoginWindow);


ipcMain.on('logInRequest',(event, arg)=>{
//   console.log(arg);
  httpInstance.post('/users/login',arg)
    .then((response)=>{
    //   console.log(response.data);
      // tokenManager.setId(message.id);
    //   event.sender.send('login-Success',response);
    //   ipcRenderer.reply('displayWaitDialog',response.data);
    //   event.reply('login-Success', response)
        event.returnValue = response.data;
    })
    .catch((error)=>{
        console.log(error);
    //   const result = {
    //     status:error.response.status,
    //     statusText:error.response.statusText

    //   };
    //   event.sender.send('login-Failed',result);
    })
});

ipcMain.on('displayWaitDialog',displayWaitDialog);
ipcMain.on('getCookie', (event, arg) => {
    session.defaultSession.cookies.get({})
  .then((cookies) => {
    console.log(cookies)
    event.returnValue = cookies;
  }).catch((error) => {
    console.log(error)
    event.returnValue = 'none';
  })    
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    win=null; 
    app.quit()
  }
})

