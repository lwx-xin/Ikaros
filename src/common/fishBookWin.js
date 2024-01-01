const { ipcMain, BrowserWindow, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const sqliteUtils = require('./sqlite3Util');

// 读取book数据
const readFile = () => {
    ipcMain.handle('read-file', (event, fileName, start, length) => {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                var content = "";
                var len = length;
                db = sqliteUtils.open();
                while (content.length < len) {
                    const sql = "select substr(content, (?-start)+1 ,?) as content,start, end from book where name=? and start <= ? ORDER BY id desc limit 1";
                    const params = [start, length, fileName, start];
                    const data = await sqliteUtils.select(db, sql, params);
                    content += data.content;
                    if (data.content.length < length) {
                        length = length - data.content.length;
                        start = data.end + 1;
                    }
                    console.log(start, length);
                }

                sqliteUtils.close(db);
                resolve(content)
            } catch (error) {
                sqliteUtils.close(db);
                console.log(error);
                reject(error);
            }
        });
    });
}

// 关闭窗口
const closeWindow = () => {
    ipcMain.handle('fishBook-window-close', event => {
        const webContent = event.sender;
        const win = BrowserWindow.fromWebContents(webContent);
        win.hide();
    });
}

module.exports = {
    readFile,
    closeWindow,
}