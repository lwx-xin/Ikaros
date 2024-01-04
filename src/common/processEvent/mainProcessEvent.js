const { ipcMain, BrowserWindow, screen, shell, dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');
const readBookProcessEvent = require('./readBookProcessEvent.js');
const sqlUtils = require('../sqlite/sql.js');
const readline = require('readline');
const { pathConfig, winConfig } = require('../config/sysConfig');
const { v4: uuidv4 } = require('uuid');

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
    ipcMain.handle('open-books-folder', (event) => {
        try {
            shell.openPath(pathConfig.fishBook_book_path);
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
				
				if(filePathArr != null && filePathArr.length > 0){
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
					let fileTargetName = basename+"_"+timestamp+extname;
					
					// 将上传的文件付备份到targetPath目录下
					await fs.copyFileSync(filePath, path.join(pathConfig.fishBook_book_path, fileTargetName));
					
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
            const files = fs.readdirSync(pathConfig.fishBook_book_path);
            try {
                for (const fileName of files) {
					const bookPath = path.join(pathConfig.fishBook_book_path, fileName);
					const bookId = await saveBookData(bookPath);
                    console.log("图书" + fileName +"【"+bookId+"】"+ "同步成功");
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
                resolve(bookInfoList);
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
        const win = new BrowserWindow({
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
                preload: path.resolve(app.getAppPath(), 'preload/readBook.js'),
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

        win.loadURL('http://localhost:9999/readBook/'+bookId);

        // win.hookWindowMessage(278, function (e) {
        //     win.setEnabled(false); //窗口禁用
        //     setTimeout(() => {
        //         win.setEnabled(true); //窗口启用
        //     }, 100);
        //     return true;
        // });
        // global.readWindow = win;

        win.webContents.openDevTools();
	
		// 注册子窗口的事件
		for (const [key, processEvent] of Object.entries(readBookProcessEvent)) {
		  if(typeof processEvent == "function"){
			  processEvent();
		  }
		}
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
				
				start = end+1;
				end = start+bookLine.length-1;
				
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

module.exports = {
    resizeMinWindow,
    resizeMaxWindow,
    closeWindow,
    openBookDirectory,
    openReadBookWindow,
	uploadBook,
    refreshBooks,
    getBookInfoList,
}