const { ipcMain, BrowserWindow, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fishBookWinEvent = require('./fishBookWin.js');
const sqliteUtils = require('./sqlite3Util');
const readline = require('readline');

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

const openBookDirectory = () => {
    ipcMain.handle('open-books-folder', (event) => {
        const directoryPath = path.join(__dirname, '../../fishBook/book');
        try {
            shell.openPath(directoryPath);
        } catch (error) {
            console.error(error);
            return null;
        }
    });
}

const refreshBooks = () => {
    ipcMain.handle('refresh-books', (event) => {
        return new Promise(async (resolve, reject) => {
            const directoryPath = path.join(__dirname, '../../fishBook/book');
            const files = fs.readdirSync(directoryPath);
            let db;
            try {
                db = sqliteUtils.open();

                for (const fileName of files) {

                    const bookCounts = await sqliteUtils.select(db, "SELECT count(1) as count from book_list WHERE name=?", [fileName]);
                    if (bookCounts != null && bookCounts.length > 0 && bookCounts[0].count > 0) {
                        // 图书已存在
                        console.log("图书" + fileName + "已存在");
                        continue;
                    }

                    const bookLineData = await fileReadLine(fileName);

                    const sql = "INSERT INTO book (name, start, end, content) VALUES ";
                    let valueSql = "";
                    let params = [];
                    const max = 1000;
                    let length = 0;
                    for (let i = 0; i < bookLineData.length; i++) {
                        var value = bookLineData[i];

                        if (valueSql != "") {
                            valueSql += ",";
                        }
                        valueSql += "(?,?,?,?)";
                        params.push(fileName);
                        params.push(length + 1);
                        params.push(length + value.length);
                        params.push(value);

                        length += value.length;

                        if (i != 0 && (i % max == 0 || i == bookLineData.length - 1)) {
                            await sqliteUtils.insert(db, sql + valueSql, params);
                            valueSql = "";
                            params = [];
                        }
                    }
                    await sqliteUtils.insert(db, "INSERT INTO book_list(name, words, end) VALUES (?,?,?)", [fileName, length, 1]);

                    console.log("图书" + fileName + "添加成功");
                }

            } catch (error) {
                sqliteUtils.close(db);
                console.log(error);
                reject(error);
            }
            sqliteUtils.close(db);
            resolve("success");
        });
    });
}

const getBookInfoList = () => {
    ipcMain.handle('get-book-info-list', (event) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = sqliteUtils.open();
                const sql = "select * from book_list";
                const bookInfoList = await sqliteUtils.select(db, sql, []);
                resolve(bookInfoList);
            } catch (error) {
                console.log(error);
                sqliteUtils.close(db);
                reject(error);
            }
        })
    });
}

const openFishBookWindow = (mainWin) => {
    const winInfo = {
        width: 800,
        height: 600,
    }
    ipcMain.handle('window-open-fishBook', (event) => {
        mainWin.hide();
        // 获取屏幕尺寸
        // const { width } = screen.getPrimaryDisplay().workAreaSize;

        // 创建一个新的无边框窗口
        const win = new BrowserWindow({
            width: winInfo.width,
            height: winInfo.height,
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
                preload: path.resolve(__dirname, '../../preload/fishBook.js'),
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

        win.loadURL('http://localhost:9999/fishBook');

        // win.hookWindowMessage(278, function (e) {
        //     win.setEnabled(false); //窗口禁用
        //     setTimeout(() => {
        //         win.setEnabled(true); //窗口启用
        //     }, 100);
        //     return true;
        // });
        // global.readWindow = win;

        win.webContents.openDevTools();

        fishBookWinEvent.readFile();
        fishBookWinEvent.closeWindow();
    });
}

const initTable = async () => {
    ipcMain.handle('init-table', (event) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = sqliteUtils.open();
                await sqliteUtils.create(db, "CREATE TABLE IF NOT EXISTS book (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, start INTEGER, end INTEGER, content TEXT)");
                await sqliteUtils.create(db, "CREATE TABLE IF NOT EXISTS book_list (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, words INTEGER, end INTEGER)");
                resolve();
            } catch (error) {
                console.log(error);
                sqliteUtils.close(db);
                reject(error);
            }
        })
    });
}

const fileReadLine = (fileName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filePath = path.join(__dirname, '../../fishBook/book', fileName);
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

module.exports = {
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openBookDirectory,
    openFishBookWindow,
    refreshBooks,
    getBookInfoList,
    initTable,
}