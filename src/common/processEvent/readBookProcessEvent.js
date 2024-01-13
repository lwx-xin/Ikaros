const { ipcMain, BrowserWindow, screen, shell } = require('electron');

const bookSql = require('../sql/book.js')
const bookShelfSql = require('../sql/bookShelf.js')

// 读取book数据
const readFile = () => {
    ipcMain.handle('read-file', (event, bookId, wordsPerPage, beforeOrNext) => {
        return new Promise(async (resolve, reject) => {
            try {

                // 查询当前图书读取进度
                const bookShelf = await bookShelfSql.getOne(bookId);

                if (bookShelf == null || Object.keys(bookShelf).length == 0) {
                    reject("【" + bookId + "】不存在");
                    return;
                }
                let start = 1;
                let end = 1;

                if ("before" == beforeOrNext) {
                    start = bookShelf.end - wordsPerPage;
                } else if ("next" == beforeOrNext) {
                    start = bookShelf.end + wordsPerPage;
                } else {
                    start = bookShelf.end
                }
                end = start;

                let content = "";
                if (start >= 1 && wordsPerPage > 0) {
                    content = await bookSql.getContent(bookId, start, wordsPerPage);
                    // while (content.length < wordsPerPage) {
                    //     const sql = "select substr(content, (?-start)+1 ,?) as content,start, end from book where book_id=? and start <= ? ORDER BY id desc limit 1";
                    //     const params = [start, length, bookId, start];

                    //     const data = await bookSql.exec(sql, params)
                    //     console.log(data);
                    //     content += data.content;
                    //     if (data.content.length < length) {
                    //         length = length - data.content.length;
                    //         start = data.end + 1;
                    //     }
                    // }

                    await bookShelfSql.update({
                        ...bookShelf,
                        id: bookId,
                        end: end
                    });
                } else {
                    content = "没有更多内容了!!!!";
                }

                resolve(content)
            } catch (error) {
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
        win.close();
    });
}

module.exports = {
    readFile,
    closeWindow,
}