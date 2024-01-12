const { ipcMain, BrowserWindow, screen, shell, dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');
const readBookProcessEvent = require('./readBookProcessEvent.js');
const sqlUtils = require('../sqlite/sql.js');
const readline = require('readline');
const { winConfig, moduleSettings } = require('../config/sysConfig');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const { openServer_http, sendMessage_http } = require('../httpServer.js');
const { openServer_ws, sendMessage_ws } = require('../websocket.js');


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

// 打开书架目录
const openBookDirectory = () => {
    ipcMain.handle('open-books-folder', async (event) => {
        try {
            const fishBook_book_path = await getSettingConfig("fishBook", "bookPath");
            shell.openPath(fishBook_book_path);
        } catch (error) {
            console.error(error);
        }
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

                    // 后缀名
                    const extname = path.extname(fileName);
                    // 不带后缀的文件名
                    const basename = path.basename(fileName, extname);
                    // 时间戳
                    const timestamp = new Date().getTime();
                    // 格式化后的文件名
                    let fileTargetName = basename + "_" + timestamp + extname;

                    // 将上传的文件付备份到targetPath目录下
                    const fishBook_book_path = await getSettingConfig("fishBook", "bookPath");
                    await fs.copyFileSync(filePath, path.join(fishBook_book_path, fileTargetName));

                }
                resolve(fileName);
            } catch (error) {
                console.error(error);
                reject(error, fileName);
            }
        });
    });
}

// 同步书架
const refreshBooks = () => {
    ipcMain.handle('refresh-books', (event) => {
        return new Promise(async (resolve, reject) => {
            const fishBook_book_path = await getSettingConfig("fishBook", "bookPath");
            const files = fs.readdirSync(fishBook_book_path);
            try {
                for (const fileName of files) {
                    const bookPath = path.join(fishBook_book_path, fileName);
                    const bookId = await saveBookData(bookPath);
                    console.log("图书" + fileName + "【" + bookId + "】" + "同步成功");
                }
                resolve();
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    });
}

const getBookInfoList = () => {
    ipcMain.handle('get-book-info-list', (event) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = await sqlUtils.open();
                const bookInfoList = await sqlUtils.select(db, "book_list", null, null);

                sqlUtils.close(db);
                resolve(bookInfoList);
            } catch (error) {
                console.log(error);
                sqlUtils.close(db);
                reject(error);
            }
        })
    });
}

const initSettings = () => {
    ipcMain.handle('init-settings', (event, isInit) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                let allConfig = [];

                for (const [module, settings] of Object.entries(moduleSettings)) {
                    for (const [setKey, setVal] of Object.entries(settings)) {
                        allConfig.push({
                            module: module,
                            key: setKey,
                            value: setVal,
                        });
                    }
                }

                db = await sqlUtils.open();

                if (isInit) {
                    await sqlUtils.del(db, "settings", {});
                }

                let configData = [];
                for (let i = 0; i < allConfig.length; i++) {
                    const config = allConfig[i];
                    const data = await sqlUtils.selectOne(db, "SELECT count(1) as count FROM settings WHERE module=? and key=?", [config.module, config.key]);

                    if (data == null || data.count == 0) {
                        configData.push(config);
                    }
                }

                if (configData.length > 0) {
                    await sqlUtils.insertBatch(db, "settings", configData, 100);
                }

                sqlUtils.close(db);
                resolve();
            } catch (error) {
                console.log(error);
                sqlUtils.close(db);
                reject(error);
            }
        })
    });
}

const getSettings = () => {
    ipcMain.handle('get-settings', (event, module, key) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = await sqlUtils.open();

                let whereSql = "";
                let params = [];
                if (module != null && module != "") {
                    if (whereSql == "") {
                        whereSql += " WHERE ";
                    }
                    whereSql += "module=?";
                    params.push(module);
                }
                if (key != null && key != "") {
                    if (whereSql == "") {
                        whereSql += " WHERE ";
                    }
                    whereSql += "key=?";
                    params.push(key);
                }

                let sql = "SELECT * FROM settings" + whereSql;
                const datas = await sqlUtils.selectAll(db, sql, params);

                sqlUtils.close(db);
                resolve(datas);
            } catch (error) {
                console.log(error);
                sqlUtils.close(db);
                reject(error);
            }
        })
    });
}

const setSettings = () => {
    ipcMain.handle('set-settings', (event, module, key, value) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = await sqlUtils.open();

                await sqlUtils.update(db, "settings", {
                    value: value
                }, {
                    module: module,
                    key: key
                });

                sqlUtils.close(db);
                resolve();
            } catch (error) {
                console.log(error);
                sqlUtils.close(db);
                reject(error);
            }
        })
    });
}

const openReadBookWindow = () => {
    ipcMain.handle('window-open-readBook', (event, bookId) => {
        const webContent = event.sender;
        const mainWin = BrowserWindow.fromWebContents(webContent);

        mainWin.hide();
        // 获取屏幕尺寸
        // const { width } = screen.getPrimaryDisplay().workAreaSize;

        // 创建一个新的无边框窗口
        let win = new BrowserWindow({
            ...winConfig.readBook,

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
    });
}

// 按行读取文件
const textFileReadLine = (filePath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
                output: process.stdout,
                terminal: false
            });

            let data = [];
            rl.on('line', (line) => {
                data.push(line);
            });
            rl.on('close', async () => {
                rl.close();
                resolve(data);
            });
        } catch (error) {
            reject(error);
        }
    });
}

const saveBookData = (bookPath) => {
    return new Promise(async (resolve, reject) => {
        let db;
        try {
            db = await sqlUtils.open();
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
            await sqlUtils.insertBatch(db, "book", dataArr, 1000)

            await sqlUtils.insert(db, "book_list", {
                id: bookId,
                name: fileName,
                words: end,
                end: 1
            });
            sqlUtils.close(db);
            resolve(bookId);
        } catch (error) {
            sqlUtils.close(db);
            reject(error);
        }
    });
}

const getSettingConfig = async (module, key) => {
    let db;
    try {
        db = await sqlUtils.open();

        const data = await sqlUtils.selectOne(db, "SELECT * FROM settings WHERE module=? and key=?", [module, key]);
        sqlUtils.close(db);
        return data == null ? null : data.value;
    } catch (error) {
        console.log(error);
        sqlUtils.close(db);
    }
}

module.exports = {
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openBookDirectory,
    openReadBookWindow,
    uploadBook,
    refreshBooks,
    getBookInfoList,
    setSettings,
    getSettings,
    initSettings,

    openHttpServer,
    sendHttpMessage,

    openWsServer,
    sendWsMessage,

    getLocalIp,
}