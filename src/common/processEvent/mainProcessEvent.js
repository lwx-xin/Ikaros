const { ipcMain, BrowserWindow, screen, shell, dialog, app, globalShortcut } = require('electron');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const os = require('os');

const readBookProcessEvent = require('./readBookProcessEvent.js');

const bookSql = require('../sql/book.js')
const bookShelfSql = require('../sql/bookShelf.js')
const settingsSql = require('../sql/settings.js')

const ikarosUtil = require('../ikarosUtil.js')

const { readJsonSync, textFileReadLine } = require('../fsUtil.js')

const { openServer_http, sendMessage_http } = require('../httpServer.js');
const { openServer_ws, sendMessage_ws } = require('../websocket.js');

const initIkarosTable = () => {
    ipcMain.handle('init-table', async event => {
        await ikarosUtil.initIkarosTable();
    });
}

// 开启http服务
const openHttpServer = () => {
    ipcMain.handle('open-server-http', event => {
        return openServer_http();
    });
}

// 向http服务发起请求
const sendHttpMessage = () => {
    ipcMain.handle('send-message-http', (event, ip, host, url, sendData) => {
        return sendMessage_http(ip, host, url, sendData);
    });
}

// 开启websocket服务端
const openWsServer = () => {
    ipcMain.handle('open-server-ws', (event, port) => {
        return openServer_ws(port);
    });
}

// 向websocket服务端发出消息，直接给接收者发送消息
const sendWsMessage = () => {
    ipcMain.handle('send-message-ws', (event, userId, targetUserIds, message, msgType) => {
        return sendMessage_ws(userId, targetUserIds, message, msgType);
    });
}

// 获取本机的局域网IP
const getLocalIp = () => {
    ipcMain.handle('get-local-ip', (event) => {
        let interfaces = os.networkInterfaces();
        for (let devName in interfaces) {
            let iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return null;
    });
}

// 最小化
const resizeMinWindow = () => {
    ipcMain.handle('window-min', event => {
        const webContent = event.sender;
        const win = BrowserWindow.fromWebContents(webContent);
        win.hide();
    });
}

// 最大化
const resizeMaxWindow = () => {
    ipcMain.handle('window-max', event => {
        const webContent = event.sender;
        const win = BrowserWindow.fromWebContents(webContent);
        win.maximize();
    });
}


// 关闭窗口
const closeWindow = () => {
    ipcMain.handle('window-close', event => {
        const webContent = event.sender;
        const win = BrowserWindow.fromWebContents(webContent);
        win.hide();
    });
}

// 上传book
const uploadBook = () => {
    ipcMain.handle('upload-book', (event) => {
        return new Promise(async (resolve, reject) => {
            let fileName = "";
            try {
                // 打开dialog选择上传的文件
                const webContent = event.sender;
                const win = BrowserWindow.fromWebContents(webContent);
                const filePathArr = dialog.showOpenDialogSync(win, {
                    properties: ['openFile'],
                });

                if (filePathArr != null && filePathArr.length > 0) {
                    const filePath = filePathArr[0];
                    fileName = path.basename(filePath);

                    // 将文件读取到DB
                    await saveBookData(filePath);
                }
                resolve(fileName);
            } catch (error) {
                console.error(error);
                reject(error, fileName);
            }
        });
    });
}

const getBookShelfList = () => {
    ipcMain.handle('get-book-shelf-list', (event) => {
        return bookShelfSql.getList();
    });
}

const initSettings = () => {
    ipcMain.handle('init-settings', (event, module) => {
        return ikarosUtil.initIkarosSettings(module);
    });
}

const getAllSettings = () => {
    ipcMain.handle('get-all-settings', (event, module) => {
        return settingsSql.getAll(module)
    });
}

const getSettings = () => {
    ipcMain.handle('get-settings', (event, module, key) => {
        return ikarosUtil.getSettings(module, key);
    });
}

const setSettings = () => {
    ipcMain.handle('set-settings', (event, module, key, value) => {
        settingsSql.update(module, key, value);
    });
}

const openReadBookWindow = () => {
    ipcMain.handle('window-open-readBook', async (event, bookId) => {
        const webContent = event.sender;
        const mainWin = BrowserWindow.fromWebContents(webContent);

        mainWin.hide();
        // 获取屏幕尺寸
        // const { width } = screen.getPrimaryDisplay().workAreaSize;

        // 获取窗口默认参数
        let readBookWinParams = { width: 800, height: 600 };
        const readBookWin_width = await ikarosUtil.getSettings("system", "readBookWin_width");
        const readBookWin_height = await ikarosUtil.getSettings("system", "readBookWin_height");
        if (readBookWin_width && readBookWin_height) {
            readBookWinParams = {
                width: Number(readBookWin_width),
                height: Number(readBookWin_height)
            }
        }
        console.log("readBookWinParams", readBookWinParams);

        // 创建一个新的无边框窗口
        let win = new BrowserWindow({
            ...readBookWinParams,

            // x: Math.floor((width - 800) / 2), // 窗口在 X 轴上的位置居中
            // y: 0, // 窗口在 Y 轴上的位置放置在屏幕底部
            frame: false,
            show: true,
            fullscreenable: false,
            transparent: true,
            resizable: true,
            movable: true,
            modal: false,
            webPreferences: {
                // 定义预加载的js
                preload: path.resolve(__dirname, '../../../electron/readBookPreload.js'),
            },
        });
        win.setMaximumSize(1920, 1080);
        win.setMinimumSize(32, 32);
        win.setSkipTaskbar(true);
        win.setOpacity(0.7);
        // 将窗口设置为全局置顶
        win.setAlwaysOnTop(true);
        // 将子窗口设置为主窗口的子窗口
        win.setParentWindow(mainWin);

        win.loadURL(
            app.isPackaged
                ? `file://${path.join(__dirname, '../../../dist/index.html')}#/readBook/${bookId}`
                : `http://localhost:9999/#/readBook/${bookId}`
        );

        // win.hookWindowMessage(278, function (e) {
        //     win.setEnabled(false); //窗口禁用
        //     setTimeout(() => {
        //         win.setEnabled(true); //窗口启用
        //     }, 100);
        //     return true;
        // });

        win.webContents.openDevTools();

        win.on('closed', () => {
            // 将子窗口对象置为 null
            win = null;
        });

        if (global.readWindow == null) {
            // 注册子窗口的事件
            for (const [key, processEvent] of Object.entries(readBookProcessEvent)) {
                if (typeof processEvent == "function") {
                    processEvent();
                }
            }
        }
        global.readWindow = win;

        // 注册快捷键
        globalShortcut.register('CommandOrControl+Shift+D', () => {
            console.log('CommandOrControl+Shift+D is pressed');
        })
        globalShortcut.register('CommandOrControl+Shift+V', () => {
            console.log('CommandOrControl+Shift+V is pressed');
        })
    });
}

const saveBookData = (bookPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 生成book ID(唯一)
            const bookId = uuidv4();
            // 文件数据-按行读取
            const bookLineArrData = await textFileReadLine(bookPath);

            const fileName = path.basename(bookPath);

            let dataArr = [];
            let start = 0;
            let end = 0;
            for (let i = 0; i < bookLineArrData.length; i++) {
                var bookLine = bookLineArrData[i];

                start = end + 1;
                end = start + bookLine.length - 1;

                dataArr.push({
                    name: fileName,
                    book_id: bookId,
                    start: start,
                    end: end,
                    content: bookLine
                });
            }

            await bookSql.insertBatch(dataArr);

            await bookShelfSql.update({
                id: bookId,
                name: fileName,
                words: end,
                end: 1
            });

            resolve(bookId);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    initIkarosTable,
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openReadBookWindow,

    uploadBook,
    getBookShelfList,

    setSettings,
    getSettings,
    getAllSettings,
    initSettings,

    openHttpServer,
    sendHttpMessage,

    openWsServer,
    sendWsMessage,

    getLocalIp,
}